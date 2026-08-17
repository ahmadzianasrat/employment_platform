// supabase/functions/notify-job-delivered/index.ts
//
// Triggered by a Supabase Database Webhook on service_request_jobs
// (event: UPDATE). Whenever a job's status changes to 'delivered', looks
// up the customer's email + preferred language and sends a short
// notification via Resend in that language (Pashto by default — see
// migration 019 and profiles.preferred_language).
//
// Setup (one-time, see database/migrations/README.md "Email
// notifications" section for the full walkthrough):
//   1. supabase secrets set RESEND_API_KEY=re_xxxxxxxx
//   2. supabase secrets set NOTIFY_FROM_EMAIL="Hamqar <no-reply@hamqar.com>"
//      (use Resend's onboarding@resend.dev address here until hamqar.com
//      is verified in Resend — see the README section for why)
//   3. supabase functions deploy notify-job-delivered
//   4. In the Supabase dashboard: Database → Webhooks → Create a new
//      webhook on service_request_jobs, event = Update, and point it at
//      this function's URL (the CLI prints it after deploy).
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY don't need to be set
// manually — Supabase injects both automatically into every Edge
// Function's environment.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    id: string;
    service_request_id: string;
    slot_number: number;
    status: string;
    target_job_note: string | null;
  };
  old_record: { status: string } | null;
}

type SupportedLanguage = 'en' | 'ps' | 'da';

// Kept local to this function (rather than importing from src/lib/i18n)
// since Edge Functions ship as standalone Deno scripts via `supabase
// functions deploy`, separately from the Vite/React build — this file
// has no access to anything under src/ at deploy time.
const EMAIL_CONTENT: Record<
  SupportedLanguage,
  { subject: string; html: (params: { name: string; slotNumber: number; jobLabel: string }) => string }
> = {
  en: {
    subject: 'Your Hamqar application package is ready',
    html: ({ name, slotNumber, jobLabel }) => `
      <p>Salaam ${name},</p>
      <p>Your CV and cover letter for job ${slotNumber}${jobLabel} are ready.</p>
      <p>Sign in at <a href="https://hamqar.com/profile">hamqar.com/profile</a> to download them.</p>
      <p>— Hamqar</p>
    `,
  },
  ps: {
    subject: 'ستاسو د همکار غوښتنلیک بسته چمتو ده',
    html: ({ name, slotNumber, jobLabel }) => `
      <p>سلام ${name}،</p>
      <p>ستاسو سي‌وي (CV) او کوور لېټر (Cover Letter) د دندې ${slotNumber}${jobLabel} لپاره چمتو دي.</p>
      <p>مهرباني وکړئ په <a href="https://hamqar.com/profile">hamqar.com/profile</a> کې ننوځئ ترڅو یې ډاونلوډ کړئ.</p>
      <p>— همکار</p>
    `,
  },
  da: {
    subject: 'بسته درخواست شما در همکار آماده است',
    html: ({ name, slotNumber, jobLabel }) => `
      <p>سلام ${name}،</p>
      <p>سي‌وي (CV) و کاور لېتر (Cover Letter) شما برای شغل ${slotNumber}${jobLabel} آماده شده است.</p>
      <p>لطفاً در <a href="https://hamqar.com/profile">hamqar.com/profile</a> وارد شوید تا آن‌ها را دانلود کنید.</p>
      <p>— همکار</p>
    `,
  },
};

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();

    // Only act on a genuine pending/in_progress → delivered transition —
    // not on every update to the row (e.g. an admin uploading the CV
    // file before flipping the status also updates this row).
    if (payload.record.status !== 'delivered' || payload.old_record?.status === 'delivered') {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('NOTIFY_FROM_EMAIL') ?? 'Hamqar <onboarding@resend.dev>';

    if (!resendApiKey) {
      // Not configured yet — fail quietly rather than erroring the
      // webhook, so job delivery itself is never blocked by email setup.
      return new Response(JSON.stringify({ skipped: true, reason: 'RESEND_API_KEY not set' }), { status: 200 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: serviceRequest } = await supabase
      .from('service_requests')
      .select('user_id, tier, contact_name')
      .eq('id', payload.record.service_request_id)
      .single();

    if (!serviceRequest) return new Response(JSON.stringify({ error: 'service_request not found' }), { status: 200 });

    const { data: userResult } = await supabase.auth.admin.getUserById(serviceRequest.user_id);
    const email = userResult?.user?.email;
    if (!email) return new Response(JSON.stringify({ error: 'no email for user' }), { status: 200 });

    // Defaults to Pashto if the user has no profiles row yet, or the
    // column is somehow null — matches migration 019's column default.
    const { data: profileRow } = await supabase
      .from('profiles')
      .select('preferred_language')
      .eq('user_id', serviceRequest.user_id)
      .maybeSingle();
    const lang: SupportedLanguage = (profileRow?.preferred_language as SupportedLanguage) ?? 'ps';
    const content = EMAIL_CONTENT[lang] ?? EMAIL_CONTENT.ps;

    const jobLabel = payload.record.target_job_note ? ` (${payload.record.target_job_note})` : '';

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: content.subject,
        html: content.html({ name: serviceRequest.contact_name ?? '', slotNumber: payload.record.slot_number, jobLabel }),
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      return new Response(JSON.stringify({ error: 'Resend request failed', detail: errText }), { status: 200 });
    }

    return new Response(JSON.stringify({ sent: true, to: email, lang }), { status: 200 });
  } catch (err) {
    // Always 200 — a webhook retry storm from a 500 is worse than one
    // missed notification email.
    return new Response(JSON.stringify({ error: String(err) }), { status: 200 });
  }
});
