export const EMPTY_LEAD = {
  studentName: '',
  phone: '',
  email: '',
  classExam: '',
  schoolName: '',
  city: '',
  concern: '',
}

export function buildLeadMessage(siteName, values) {
  return [
    `Hi ${siteName}, I'd like to book a counselling session.`,
    `Student name: ${values.studentName}`,
    `Phone: ${values.phone}`,
    `Email: ${values.email}`,
    `Class / Exam: ${values.classExam}`,
    values.schoolName ? `School: ${values.schoolName}` : null,
    `City: ${values.city}`,
    `Concern: ${values.concern}`,
  ]
    .filter(Boolean)
    .join('\n')
}
