import { CapIcon, ChatIcon, MailIcon, PhoneIcon, PinIcon, SchoolIcon, UserIcon } from './icons'

const FIELDS = [
  { name: 'studentName', label: 'Student name', placeholder: 'Full name', autoComplete: 'name', icon: UserIcon, wide: true },
  { name: 'phone', label: 'Phone number', placeholder: '10-digit mobile', autoComplete: 'tel', inputMode: 'tel', icon: PhoneIcon },
  { name: 'email', label: 'Email', placeholder: 'you@example.com', autoComplete: 'email', type: 'email', icon: MailIcon },
  { name: 'classExam', label: 'Class / exam', placeholder: 'e.g. Class 10, Class 12, NEET, JEE', icon: CapIcon },
  { name: 'schoolName', label: 'School / college name', placeholder: 'Your school or college name', autoComplete: 'organization', icon: SchoolIcon },
  { name: 'city', label: 'City', placeholder: 'Your city', autoComplete: 'address-level2', icon: PinIcon, wide: true },
  { name: 'concern', label: 'Your concern', placeholder: 'Tell us what you need help with', icon: ChatIcon, wide: true, textarea: true },
]

const inputBase =
  'peer block w-full rounded-lg border border-ink/25 bg-white pl-12 pr-4 text-base text-ink outline-none transition placeholder:text-transparent hover:border-ink/50 focus:border-brand-deep focus:ring-4 focus:ring-brand/30 focus:placeholder:text-mute/50'

/**
 * Outlined fields with floating labels and leading icons (Material / Google Forms style).
 * Every field is required. Used by the one booking form that appears both as the pop-up and on the Contact page.
 */
export function LeadFields({ idPrefix, values, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {FIELDS.map((f) => {
        const id = `${idPrefix}${f.name}`
        const Icon = f.icon
        const common = {
          id,
          name: f.name,
          autoComplete: f.autoComplete,
          required: true,
          value: values[f.name],
          onChange,
          placeholder: f.placeholder,
        }
        return (
          <div key={f.name} className={`relative ${f.wide ? 'sm:col-span-2' : ''}`}>
            {f.textarea ? (
              <textarea {...common} rows={3} className={`${inputBase} min-h-[7rem] resize-y pb-2 pt-7`} />
            ) : (
              <input {...common} type={f.type ?? 'text'} inputMode={f.inputMode} className={`${inputBase} h-14 pb-1 pt-5`} />
            )}
            <label
              htmlFor={id}
              className={`pointer-events-none absolute left-12 origin-left text-base text-mute transition-all duration-150 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-ink peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs ${
                f.textarea ? 'top-[1.65rem] -translate-y-1/2' : 'top-1/2 -translate-y-1/2'
              }`}
            >
              {f.label}
              <span className="text-brass" aria-hidden>
                {' '}
                *
              </span>
            </label>
            <Icon
              className={`pointer-events-none absolute left-4 h-5 w-5 text-mute transition-colors peer-focus:text-brass ${
                f.textarea ? 'top-[1.2rem]' : 'top-1/2 -translate-y-1/2'
              }`}
            />
          </div>
        )
      })}
    </div>
  )
}
