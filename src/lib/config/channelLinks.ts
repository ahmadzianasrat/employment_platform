// Job-listing broadcast channels (browsing vacancies) — confirmed real,
// not placeholders. Separate from "contact us" below.
export const TELEGRAM_PASHTO_URL = 'https://t.me/pashtoJobs';
export const TELEGRAM_DARI_URL = 'https://t.me/dariJobs';

// Primary contact channel for the paid service (payment coordination,
// questions, sending the target job) — WhatsApp is preferred. Telegram
// (via the same phone number) is offered as a secondary option for
// people who prefer it, using the same number as WhatsApp/easy-load.
export const CONTACT_NUMBER_DISPLAY = '+93 70 733 9100';
export const CONTACT_NUMBER_E164 = '93707339100';
export const WHATSAPP_NUMBER_DISPLAY = CONTACT_NUMBER_DISPLAY;
export const WHATSAPP_URL = `https://wa.me/${CONTACT_NUMBER_E164}`;
export const TELEGRAM_CONTACT_URL = `https://t.me/+${CONTACT_NUMBER_E164}`;

export const SUPPORT_EMAIL = 'support@hamqar.com';

// Payment numbers customers send money to — shown directly in the app
// (Pricing/Guide/Order) rather than only given out on request.
export const EASYLOAD_NUMBER_DISPLAY = '0707339100';
export const HESABPAY_NUMBER_DISPLAY = '+93707339100';
