/**
 * Free checklists (pages under Free resources). Each list is copied from an official source - do not add
 * items that are not on it, and update it every year from the new official notice or syllabus.
 *
 * - kind 'documents': one tick per document. `note` marks documents that only some students need.
 * - kind 'syllabus': every chapter gets two ticks (Studied, Revised), grouped by subject and class.
 * - `id` of each item is stored with the student's ticks: never change an existing id (ticks would be lost);
 *   new items need new ids. `listId` is also stored - never change it either.
 */

/** NEET UG state quota documents - from the State CET Cell "Required documents" list (owner's screenshot, 7 Nov 2026). */
export const NEET_DOCUMENTS = {
  kind: 'documents',
  slug: 'neet-counselling-documents-maharashtra',
  listId: 'neet-counselling-documents-maharashtra', // same name as the old saved ticks on students' phones
  seo: {
    title: 'NEET documents checklist',
    fullTitle: 'NEET Counselling Documents List 2026 – Maharashtra',
    description: 'Free checklist of documents for NEET UG 2026 Maharashtra state quota counselling (MBBS, BDS, BAMS, BHMS, BPTh) from the State CET Cell. Tick, print, share.',
  },
  crumb: ['NEET counselling', '/neet-counselling-maharashtra'],
  eyebrow: 'Free document checklist',
  card: { tag: 'NEET UG · Documents', title: 'NEET counselling documents', text: 'Every document on the State CET Cell list for Maharashtra state quota counselling.' },
  title: 'NEET UG 2026 counselling documents checklist (Maharashtra state quota)',
  intro:
    'For MBBS, BDS, BAMS, BHMS, BUMS, BPTh and other health science courses. This is the list of required documents published by the State CET Cell, Maharashtra. Tick each document as you get it ready, then print this page or save it as a PDF.',
  source: 'State CET Cell, Maharashtra - "Required documents" for NEET UG 2026 state quota counselling',
  sourceNote: 'Documents and formats (Annexures) can change during counselling - check before every round.',
  sourceUrl: 'https://cetcell.mahacet.org',
  shareText: 'NEET UG 2026 counselling documents checklist for Maharashtra state quota (free, from Career Ka Dost):',
  help: {
    title: 'Not sure which documents apply to you?',
    text: 'Caste validity, non-creamy layer and domicile papers take time to get. We help you check them early and guide you through every counselling round - see our [NEET counselling](/neet-counselling-maharashtra) and [AYUSH counselling](/ayush-counselling-bams-bhms-bums) help.',
  },
  done: {
    title: 'All your NEET documents are ready!',
    message: 'Well done - every document on the official list is ticked. Keep the originals and a set of copies together for joining day.',
    cta: 'Book NEET counselling help',
    share: 'I have all my NEET counselling documents ready! Free checklist from Career Ka Dost:',
  },
  documents: [
    { id: 'neet-admit-card', name: 'Admit Card / Hall Ticket of NEET UG 2026' },
    { id: 'neet-marksheet', name: 'NEET UG 2026 Marksheet (score card)' },
    {
      id: 'nationality',
      name: 'National Certificate / Valid Indian Passport / School Leaving Certificate of H.S.C (or equivalent)',
      note: 'Proof of Indian nationality - any one of these.',
    },
    { id: 'domicile', name: 'Domicile Certificate of the candidate' },
    { id: 'hsc-marksheet', name: 'H.S.C (or equivalent) examination marksheet' },
    { id: 'ssc-certificate', name: 'S.S.C (or equivalent) passing certificate', note: 'For date of birth.' },
    { id: 'medical-fitness', name: 'Medical fitness certificate (Annexure-H)' },
    { id: 'caste-certificate', name: 'Caste Certificate', note: 'Only if you are claiming a reserved category seat.' },
    { id: 'caste-validity', name: 'Caste Validity Certificate', note: 'Only if you are claiming a reserved category seat.' },
    { id: 'ncl', name: 'Non-Creamy Layer Certificate valid up to 31/03/2027 (Annexure-G)', note: 'Only for categories where non-creamy layer applies.' },
    { id: 'photo', name: 'Student photo' },
  ],
}

export const CHECKLISTS = [NEET_DOCUMENTS]
