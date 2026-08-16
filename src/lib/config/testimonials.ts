export interface Testimonial {
  /** First name + last initial only, e.g. "Zahra K." — avoid full names for customer privacy unless they explicitly agreed to be fully identified. */
  name: string;
  /** Optional: the job/field they applied in, e.g. "Nurse, Kabul" — adds credibility without needing a photo. */
  context?: string;
  quote: string;
}

/**
 * Real customer testimonials go here once you have a few — get explicit
 * permission from the customer first (a quick "can we quote your
 * WhatsApp message on the site?" is enough). Do NOT fill this with
 * invented quotes; fabricated testimonials are misleading to visitors
 * and can constitute deceptive advertising. `TestimonialsSection` (see
 * components/ui/TestimonialsSection.tsx) renders nothing at all when
 * this array is empty, so leaving it empty is completely safe — the
 * section just won't appear until you add something real here.
 */
export const TESTIMONIALS: Testimonial[] = [
  // { name: 'Zahra K.', context: 'Nurse, Kabul', quote: 'They wrote my CV for a job I never thought I could apply to, and I got an interview the same week.' },
];
