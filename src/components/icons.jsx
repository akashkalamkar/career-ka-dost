import { useId } from 'react'

export function WhatsAppIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function PhoneIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  )
}

function Stroke({ className, children }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  )
}

export function MailIcon({ className }) {
  return (
    <Stroke className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Stroke>
  )
}

export function GlobeIcon({ className }) {
  return (
    <Stroke className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
    </Stroke>
  )
}

export function InstagramIcon({ className }) {
  return (
    <Stroke className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
    </Stroke>
  )
}

export function YouTubeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
    </svg>
  )
}

export function LinkedInIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.6h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.1c0-1.2-.02-2.8-1.7-2.8-1.7 0-1.97 1.33-1.97 2.7V21h-4V9.75Z" />
    </svg>
  )
}

export function ChevronIcon({ className }) {
  return (
    <Stroke className={className}>
      <path d="m6 9 6 6 6-6" />
    </Stroke>
  )
}

export function SearchIcon({ className }) {
  return (
    <Stroke className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </Stroke>
  )
}

export function ClipboardIcon({ className }) {
  return (
    <Stroke className={className}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4.5h6M9 11h6M9 15h4" />
    </Stroke>
  )
}

export function BookIcon({ className }) {
  return (
    <Stroke className={className}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    </Stroke>
  )
}

export function ChatIcon({ className }) {
  return (
    <Stroke className={className}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-8Z" />
      <path d="M8.5 8.5h7M8.5 11.5h4.5" />
    </Stroke>
  )
}

export function UserIcon({ className }) {
  return (
    <Stroke className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.2-4.2 4.4-6 8-6s6.8 1.8 8 6" />
    </Stroke>
  )
}

export function UsersIcon({ className }) {
  return (
    <Stroke className={className}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.9-3.6 3.5-5.2 6.5-5.2s5.6 1.6 6.5 5.2" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M17.5 14.2c2.3.2 3.7 1.7 4.3 4.3" />
    </Stroke>
  )
}

export function CapIcon({ className }) {
  return (
    <Stroke className={className}>
      <path d="m12 4 10 5-10 5L2 9l10-5Z" />
      <path d="M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5M22 9v6" />
    </Stroke>
  )
}

export function SchoolIcon({ className }) {
  return (
    <Stroke className={className}>
      <path d="M3 10 12 4l9 6" />
      <path d="M5 10v9M19 10v9M9 19v-5h6v5M3 19h18" />
      <circle cx="12" cy="9" r="1" />
    </Stroke>
  )
}

export function LockIcon({ className }) {
  return (
    <Stroke className={className}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Stroke>
  )
}

export function BoardIcon({ className }) {
  return (
    <Stroke className={className}>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M12 16v4M8 20h8M7 12l3-3 2.5 2L17 7" />
    </Stroke>
  )
}

export function StarIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9L12 2.5Z" />
    </svg>
  )
}

export function ChipIcon({ className }) {
  return (
    <Stroke className={className}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </Stroke>
  )
}

export function TargetIcon({ className }) {
  return (
    <Stroke className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </Stroke>
  )
}

export function EyeIcon({ className }) {
  return (
    <Stroke className={className}>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Stroke>
  )
}

export function PinIcon({ className }) {
  return (
    <Stroke className={className}>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </Stroke>
  )
}

export function ArrowIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 12h16m0 0-6-6m6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}


export function DownloadIcon({ className }) {
  return (
    <Stroke className={className}>
      <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" />
      <path d="M5 19h14" />
    </Stroke>
  )
}

/** The Gmail logo in its original colours. */
export function GmailIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <path fill="#4caf50" d="M45 16.2l-5 2.75-5 4.75L35 40h7a3 3 0 0 0 3-3V16.2z" />
      <path fill="#1e88e5" d="M3 16.2l3.614 1.71L13 23.7V40H6a3 3 0 0 1-3-3V16.2z" />
      <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17" />
      <path fill="#c62828" d="M3 12.298V16.2l10 7.5V11.2L9.876 8.859A4.3 4.3 0 0 0 7.298 8C4.924 8 3 9.924 3 12.298z" />
      <path fill="#fbc02d" d="M45 12.298V16.2l-10 7.5V11.2l3.124-2.341A4.3 4.3 0 0 1 40.702 8C43.076 8 45 9.924 45 12.298z" />
    </svg>
  )
}

/** The Instagram logo in its gradient colours. */
export function InstagramColorIcon({ className }) {
  const id = useId()
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden stroke={`url(#${id})`}>
      <defs>
        <linearGradient id={id} x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fdc830" />
          <stop offset="0.35" stopColor="#fd5949" />
          <stop offset="0.65" stopColor="#d6249f" />
          <stop offset="1" stopColor="#285aeb" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" strokeWidth="1.4" />
    </svg>
  )
}

/** A red map pin, like the one on Google Maps. */
export function PinColorIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#ea4335" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Z" />
      <circle cx="12" cy="9" r="2.6" fill="#ffffff" />
    </svg>
  )
}
