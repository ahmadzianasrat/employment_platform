import type { CvData } from '../../cv/types/cv';
import type { CoverLetterData } from '../../coverLetter/types/coverLetter';
import type { CvTemplate } from '../../cv/api/cvProfileApi';
import type { CoverLetterTemplate } from '../../coverLetter/api/coverLetterProfileApi';

/**
 * Entirely fictional names, employers, and details — NOT real past
 * customers. Labeled as "Sample" throughout ExamplesPage.tsx for that
 * reason. If real, permission-granted examples become available later
 * (same rule as testimonials.ts), swap them in here instead — but never
 * present invented work as a real delivered order.
 *
 * Deliberately written with full, achievement-oriented content (specific
 * numbers, tools, and outcomes in every bullet, 5-6 skills, 3 languages
 * where realistic) rather than one-line placeholders — this page's job is
 * to show a visitor what a genuinely strong, complete CV/cover letter
 * looks like so they want the finished product, not a sparse template
 * with the blanks technically filled in. Still kept to roughly one A4
 * page's worth of content per entry (CvPreview/CoverLetterPreview render
 * a fixed-height page and clip anything beyond it) — don't add a 4th
 * experience entry or a second full paragraph without checking the live
 * preview still fits.
 */
export interface CvExample {
  id: string;
  fieldLabel: string; // e.g. "Nursing" — shown as the example's category
  template: CvTemplate;
  cv: CvData;
}

export interface CoverLetterExample {
  id: string;
  fieldLabel: string;
  template: CoverLetterTemplate;
  letter: CoverLetterData;
}

export const CV_EXAMPLES: CvExample[] = [
  {
    id: 'nursing',
    fieldLabel: 'Nursing',
    template: 'classic',
    cv: {
      fullName: 'Sample Candidate — Nursing',
      email: 'example@sample.com',
      phone: '+93 7X XXX XXXX',
      address: 'Kabul, Afghanistan',
      location: 'Kabul',
      summary:
        'Registered nurse with 5+ years across emergency and general ward care, including 2 years leading a night-shift team of 6. Strong record in patient triage, medication administration, infection control, and mentoring new staff — comfortable working under pressure in high-volume, resource-limited settings.',
      education: [
        { id: 'e1', institution: 'Kabul Institute of Health Sciences', degree: 'Diploma in Nursing (Distinction)', year: '2019' },
        { id: 'e2', institution: 'Afghan Red Crescent Society', degree: 'Certificate, Basic Life Support & First Aid', year: '2022' },
      ],
      experience: [
        {
          id: 'x1',
          employer: 'Sample Regional Hospital',
          role: 'Senior Staff Nurse, Emergency Ward',
          duration: '2021 – Present',
          description:
            'Lead triage for up to 40 patients per shift across a 6-nurse team; cut average wait-to-assessment time by 15% by restructuring the intake queue. Administer medications and IV therapy, monitor vitals, and maintain accurate patient charts. Trained and mentored 9 incoming nurses on ward protocols and emergency response.',
        },
        {
          id: 'x2',
          employer: 'Sample Regional Hospital',
          role: 'Staff Nurse, Emergency Ward',
          duration: '2019 – 2021',
          description:
            'Managed patient intake and triage, assisted in minor procedures, and coordinated with physicians and lab staff to speed up diagnosis turnaround. Maintained a zero-incident medication-error record over 2 years.',
        },
        {
          id: 'x3',
          employer: 'Sample District Clinic',
          role: 'Community Health Nurse (part-time, during studies)',
          duration: '2018 – 2019',
          description:
            'Delivered maternal and child health services and vaccination outreach to 3 surrounding villages; maintained patient records and immunization schedules for over 300 registered families.',
        },
      ],
      skills:
        'Patient triage & emergency response, IV therapy & medication administration, wound care, infection control, electronic health records, staff mentoring, Basic Life Support (BLS) certified',
      languages: [
        { id: 'l1', name: 'Dari', proficiency: 'native' },
        { id: 'l2', name: 'Pashto', proficiency: 'fluent' },
        { id: 'l3', name: 'English', proficiency: 'intermediate' },
      ],
    },
  },
  {
    id: 'logistics',
    fieldLabel: 'Logistics & Warehouse',
    template: 'modern',
    cv: {
      fullName: 'Sample Candidate — Logistics',
      email: 'example@sample.com',
      phone: '+93 7X XXX XXXX',
      address: 'Herat, Afghanistan',
      location: 'Herat',
      summary:
        'Warehouse supervisor with 6+ years managing inventory, dispatch, and small teams across NGO and private-sector logistics operations. Track record of cutting stock discrepancies, tightening intake procedures, and keeping delivery schedules on time under tight donor and client deadlines.',
      education: [
        { id: 'e1', institution: 'Herat University', degree: 'Bachelor of Business Administration', year: '2016' },
        { id: 'e2', institution: 'Herat Chamber of Commerce', degree: 'Certificate, Supply Chain Fundamentals', year: '2021' },
      ],
      experience: [
        {
          id: 'x1',
          employer: 'Sample Logistics Company',
          role: 'Warehouse Supervisor',
          duration: '2020 – Present',
          description:
            'Oversee daily operations across a 1,200 sqm warehouse — stock control, dispatch scheduling, and a team of 8 loaders. Reduced inventory discrepancies by 22% by redesigning intake checks and introducing weekly cycle counts. Coordinate a fleet of 5 delivery vehicles serving 40+ regular clients.',
        },
        {
          id: 'x2',
          employer: 'Sample Relief Organization',
          role: 'Logistics Assistant',
          duration: '2017 – 2020',
          description:
            'Tracked incoming humanitarian aid shipments and coordinated last-mile delivery to 12 distribution points across Herat province. Maintained stock records for over 50 SKUs and supported quarterly donor audits with zero discrepancies flagged.',
        },
        {
          id: 'x3',
          employer: 'Sample Trading House',
          role: 'Inventory Clerk (entry-level)',
          duration: '2016 – 2017',
          description:
            'Recorded daily stock movements, processed purchase orders, and assisted in the transition from paper-based to spreadsheet-based inventory tracking.',
        },
      ],
      skills:
        'Inventory management, MS Excel (pivot tables, tracking sheets), fleet & dispatch coordination, team supervision, supply chain reporting, vendor & customs paperwork',
      languages: [
        { id: 'l1', name: 'Dari', proficiency: 'native' },
        { id: 'l2', name: 'Pashto', proficiency: 'advanced' },
        { id: 'l3', name: 'English', proficiency: 'intermediate' },
      ],
    },
  },
  {
    id: 'teaching',
    fieldLabel: 'Teaching',
    template: 'minimal',
    cv: {
      fullName: 'Sample Candidate — Teaching',
      email: 'example@sample.com',
      phone: '+93 7X XXX XXXX',
      address: 'Mazar-i-Sharif, Afghanistan',
      location: 'Mazar-i-Sharif',
      summary:
        'Secondary school English teacher with 4+ years of classroom experience across grades 9–12. Focused on communicative teaching methods, measurable student outcomes, and building programs (peer tutoring, exam prep) that outlast a single school year.',
      education: [
        { id: 'e1', institution: 'Balkh University', degree: 'Bachelor of Education, English Literature', year: '2020' },
        { id: 'e2', institution: 'British Council Afghanistan', degree: 'TKT (Teaching Knowledge Test), Modules 1–3', year: '2022' },
      ],
      experience: [
        {
          id: 'x1',
          employer: 'Sample Secondary School',
          role: 'English Teacher, Grades 9–12',
          duration: '2020 – Present',
          description:
            'Plan and deliver lessons for 6 classes of up to 35 students each. Designed and ran a peer-tutoring program that raised average exam scores by a full grade band across 2 cohorts. Introduced weekly speaking-practice sessions now adopted department-wide.',
        },
        {
          id: 'x2',
          employer: 'Sample Community Learning Center',
          role: 'English Tutor (weekends, alongside full-time teaching)',
          duration: '2021 – Present',
          description:
            'Run small-group evening classes for 15–20 adult learners preparing for job interviews and further study, focused on practical spoken English and CV-writing basics.',
        },
      ],
      skills:
        'Lesson planning & curriculum development, classroom management, exam preparation, English–Dari translation, student assessment, peer-mentoring program design',
      languages: [
        { id: 'l1', name: 'Dari', proficiency: 'native' },
        { id: 'l2', name: 'English', proficiency: 'fluent' },
        { id: 'l3', name: 'Pashto', proficiency: 'intermediate' },
      ],
    },
  },
  {
    id: 'admin',
    fieldLabel: 'Administration',
    template: 'compact',
    cv: {
      fullName: 'Sample Candidate — Administration',
      email: 'example@sample.com',
      phone: '+93 7X XXX XXXX',
      address: 'Kabul, Afghanistan',
      location: 'Kabul',
      summary:
        'Office administrator with 3+ years supporting NGO program teams end-to-end — scheduling, correspondence, procurement tracking, and donor-compliant filing. Known for keeping a 20-person team organized without needing to be chased for updates.',
      education: [
        { id: 'e1', institution: 'Kabul University', degree: 'Bachelor of Public Administration', year: '2021' },
        { id: 'e2', institution: 'Kabul Skills Institute', degree: 'Certificate, Office Management & MS Office', year: '2021' },
      ],
      experience: [
        {
          id: 'x1',
          employer: 'Sample NGO Country Office',
          role: 'Office Administrator',
          duration: '2021 – Present',
          description:
            'Manage correspondence, meeting scheduling, and procurement requests for a 20-person program team. Maintain donor-compliant filing systems that passed 2 external audits with no findings. Onboarded and trained 4 new admin/support staff on office systems.',
        },
        {
          id: 'x2',
          employer: 'Sample Consulting Group',
          role: 'Administrative Assistant (internship)',
          duration: '2020 – 2021',
          description:
            'Supported 3 project managers with travel arrangements, expense tracking, and document formatting; digitized a paper filing backlog of over 500 records.',
        },
      ],
      skills:
        'MS Office (Word, Excel, Outlook), correspondence drafting, procurement & vendor tracking, donor-compliant filing systems, scheduling & calendar management, staff onboarding',
      languages: [
        { id: 'l1', name: 'Pashto', proficiency: 'native' },
        { id: 'l2', name: 'Dari', proficiency: 'fluent' },
        { id: 'l3', name: 'English', proficiency: 'advanced' },
      ],
    },
  },
];

export const COVER_LETTER_EXAMPLES: CoverLetterExample[] = [
  {
    id: 'nursing',
    fieldLabel: 'Nursing',
    template: 'formal',
    letter: {
      fullName: 'Sample Candidate — Nursing',
      email: 'example@sample.com',
      phone: '+93 7X XXX XXXX',
      address: 'Kabul, Afghanistan',
      date: 'Sample date',
      recipientName: 'Hiring Manager',
      recipientTitle: 'Human Resources',
      organizationName: 'Sample Regional Hospital',
      organizationAddress: 'Kabul, Afghanistan',
      jobTitle: 'Senior Staff Nurse, Emergency Ward',
      opening:
        'I am writing to apply for the Senior Staff Nurse position advertised for the Emergency Ward at Sample Regional Hospital. With five years of hands-on emergency and general ward experience — the last two leading a night-shift team of six — I am confident I can strengthen your department from day one.',
      motivation:
        'In my current role, I manage patient triage for up to 40 patients per shift and restructured our intake process to cut average wait-to-assessment time by 15%. I have trained nine incoming nurses on ward protocols and maintained a zero-incident medication-error record across two years. I am drawn to this opportunity because of your hospital\u2019s reputation for strong emergency care, and I believe my calm, detail-oriented approach under pressure, combined with proven mentoring experience, would let me contribute immediately and help develop newer staff on your team.',
      closing:
        'I would welcome the opportunity to discuss how my experience could benefit your ward, and I am available for an interview at your convenience. Thank you for considering my application.',
      signOff: 'Sincerely,',
    },
  },
  {
    id: 'logistics',
    fieldLabel: 'Logistics & Warehouse',
    template: 'modern',
    letter: {
      fullName: 'Sample Candidate — Logistics',
      email: 'example@sample.com',
      phone: '+93 7X XXX XXXX',
      address: 'Herat, Afghanistan',
      date: 'Sample date',
      recipientName: 'Hiring Team',
      recipientTitle: 'Operations Department',
      organizationName: 'Sample Logistics Company',
      organizationAddress: 'Herat, Afghanistan',
      jobTitle: 'Warehouse Supervisor',
      opening:
        'I am excited to apply for the Warehouse Supervisor role at Sample Logistics Company. Over the past six years, I have built a track record of running accurate, on-schedule warehouse operations for both private and NGO logistics teams, most recently overseeing a 1,200 sqm facility and a team of eight.',
      motivation:
        'In my current role, I reduced inventory discrepancies by 22% by redesigning intake checks and introducing weekly cycle counts, while coordinating a five-vehicle fleet serving over 40 regular clients. Before that, I supported humanitarian aid distribution across twelve delivery points with zero discrepancies flagged in quarterly donor audits. I am looking for a role with greater scale, and Sample Logistics Company\u2019s growing distribution network is exactly the kind of environment where I believe I could make an immediate, measurable impact.',
      closing:
        'I would appreciate the chance to speak further about how my background fits your team\u2019s needs, and I am glad to provide references from both my current and previous employers.',
      signOff: 'Best regards,',
    },
  },
  {
    id: 'teaching',
    fieldLabel: 'Teaching',
    template: 'formal',
    letter: {
      fullName: 'Sample Candidate — Teaching',
      email: 'example@sample.com',
      phone: '+93 7X XXX XXXX',
      address: 'Mazar-i-Sharif, Afghanistan',
      date: 'Sample date',
      recipientName: 'School Administration',
      recipientTitle: 'Principal',
      organizationName: 'Sample Secondary School',
      organizationAddress: 'Mazar-i-Sharif, Afghanistan',
      jobTitle: 'English Teacher',
      opening:
        'I am writing to express my interest in the English Teacher position at your school. I have four years of experience teaching English to secondary students across grades 9\u201312, with a focus on communicative, student-centered methods and programs that keep improving results year over year.',
      motivation:
        'In my current position, I designed and ran a peer-tutoring program that raised average exam scores by a full grade band across two cohorts, and introduced weekly speaking-practice sessions that my department has since adopted school-wide. I also run weekend English classes for adult learners preparing for job interviews, which has sharpened how I explain practical, real-world English. I am motivated by the opportunity to bring that same energy to a new group of students and contribute to your school\u2019s academic goals.',
      closing:
        'Thank you for your time and consideration. I look forward to the possibility of discussing this role further and can share sample lesson plans or student outcome data on request.',
      signOff: 'Sincerely,',
    },
  },
];
