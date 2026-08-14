export interface CoverLetterData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  date: string; // free text, e.g. "August 9, 2026" — not force-parsed as a real date
  recipientName: string;
  recipientTitle: string;
  organizationName: string;
  organizationAddress: string;
  jobTitle: string;
  opening: string; // Why you're writing, where you saw the role
  motivation: string; // Why this org/role, relevant skills and experience
  closing: string; // Call to action, thanks
  signOff: string; // "Sincerely," / "Best regards," etc.
}

export const EMPTY_COVER_LETTER: CoverLetterData = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  date: '',
  recipientName: '',
  recipientTitle: '',
  organizationName: '',
  organizationAddress: '',
  jobTitle: '',
  opening: '',
  motivation: '',
  closing: '',
  signOff: 'Sincerely,',
};
