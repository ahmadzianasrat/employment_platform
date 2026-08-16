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
        'Registered nurse with 5 years of experience in emergency and general ward care. Skilled in patient triage, medication administration, and coordinating with multidisciplinary teams under pressure.',
      education: [
        { id: 'e1', institution: 'Kabul Institute of Health Sciences', degree: 'Diploma in Nursing', year: '2019' },
      ],
      experience: [
        {
          id: 'x1',
          employer: 'Sample Regional Hospital',
          role: 'Staff Nurse, Emergency Ward',
          duration: '2019 – Present',
          description: 'Manage patient intake and triage for up to 40 patients per shift; administer medications and monitor vitals; train incoming nursing staff on ward protocols.',
        },
        {
          id: 'x2',
          employer: 'Sample District Clinic',
          role: 'Community Health Nurse',
          duration: '2017 – 2019',
          description: 'Delivered maternal and child health services in a rural outreach program; maintained patient records and vaccination schedules.',
        },
      ],
      skills: 'Patient triage, IV therapy, wound care, electronic health records, team coordination',
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
        'Warehouse supervisor with 6 years of experience managing inventory, coordinating deliveries, and leading small teams in fast-paced logistics operations for NGOs and private distributors.',
      education: [
        { id: 'e1', institution: 'Herat University', degree: 'Bachelor of Business Administration', year: '2016' },
      ],
      experience: [
        {
          id: 'x1',
          employer: 'Sample Logistics Company',
          role: 'Warehouse Supervisor',
          duration: '2020 – Present',
          description: 'Oversee daily warehouse operations including stock control, dispatch scheduling, and a team of 8 loaders; reduced inventory discrepancies by improving intake checks.',
        },
        {
          id: 'x2',
          employer: 'Sample Relief Organization',
          role: 'Logistics Assistant',
          duration: '2017 – 2020',
          description: 'Tracked incoming humanitarian aid shipments, coordinated last-mile delivery to distribution points, and maintained accurate stock records.',
        },
      ],
      skills: 'Inventory management, MS Excel, fleet coordination, team supervision, supply chain reporting',
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
        'Secondary school English teacher with 4 years of classroom experience, focused on communicative teaching methods and student engagement in under-resourced settings.',
      education: [
        { id: 'e1', institution: 'Balkh University', degree: 'Bachelor of Education, English Literature', year: '2020' },
      ],
      experience: [
        {
          id: 'x1',
          employer: 'Sample Secondary School',
          role: 'English Teacher, Grades 9–12',
          duration: '2020 – Present',
          description: 'Plan and deliver lessons for classes of up to 35 students; developed a peer-tutoring program that improved average exam scores by a full grade band.',
        },
      ],
      skills: 'Lesson planning, classroom management, curriculum development, English-Dari translation',
      languages: [
        { id: 'l1', name: 'Dari', proficiency: 'native' },
        { id: 'l2', name: 'English', proficiency: 'fluent' },
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
        'Office administrator with 3 years of experience supporting NGO program teams — scheduling, correspondence, procurement tracking, and office management.',
      education: [
        { id: 'e1', institution: 'Kabul University', degree: 'Bachelor of Public Administration', year: '2021' },
      ],
      experience: [
        {
          id: 'x1',
          employer: 'Sample NGO Country Office',
          role: 'Office Administrator',
          duration: '2021 – Present',
          description: 'Manage office correspondence, meeting scheduling, and procurement requests for a 20-person program team; maintain filing systems for donor compliance.',
        },
      ],
      skills: 'MS Office, correspondence drafting, procurement tracking, filing systems, scheduling',
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
      jobTitle: 'Staff Nurse, Emergency Ward',
      opening: 'I am writing to apply for the Staff Nurse position advertised for the Emergency Ward at Sample Regional Hospital. With five years of hands-on emergency and general ward experience, I am confident I can contribute to your team from day one.',
      motivation: 'In my current role, I manage patient triage for up to 40 patients per shift and have trained incoming nursing staff on ward protocols. I am drawn to this opportunity because of your hospital\u2019s reputation for strong emergency care, and I believe my calm, detail-oriented approach under pressure would fit well with your team.',
      closing: 'I would welcome the opportunity to discuss how my experience could benefit your ward. Thank you for considering my application.',
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
      opening: 'I am excited to apply for the Warehouse Supervisor role at Sample Logistics Company. Over the past six years, I have built a track record of running efficient, accurate warehouse operations for both private and NGO logistics teams.',
      motivation: 'Most recently, I reduced inventory discrepancies at my current warehouse by tightening intake procedures and retraining staff. I am looking for a role with greater scale, and Sample Logistics Company\u2019s growing distribution network is exactly the kind of environment where I believe I could make an immediate impact.',
      closing: 'I would appreciate the chance to speak further about how my background fits your team\u2019s needs.',
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
      opening: 'I am writing to express my interest in the English Teacher position at your school. I have four years of experience teaching English to secondary students, with a focus on communicative, student-centered methods.',
      motivation: 'In my current position, I developed a peer-tutoring program that raised average exam scores by a full grade band. I am motivated by the opportunity to bring that same energy to a new group of students and contribute to your school\u2019s academic goals.',
      closing: 'Thank you for your time and consideration. I look forward to the possibility of discussing this role further.',
      signOff: 'Sincerely,',
    },
  },
];
