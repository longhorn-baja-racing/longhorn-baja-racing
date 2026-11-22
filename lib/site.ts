export const siteConfig = {
  name: "Longhorn Baja Racing",
  shortName: "Longhorn Baja",
  title: "Longhorn Baja Racing | UT Austin Baja SAE",
  description:
    "The official website of Longhorn Baja Racing, The University of Texas at Austin student team that designs, builds, tests, and races an off-road vehicle for Baja SAE competition.",
  url: "https://longhornbajaracing.com",
  email: "longhornbaja@gmail.com",
  applyUrl: "https://join.longhornbajaracing.com",
  sponsorUrl: "https://drive.google.com/file/d/1RUknYrIfWhk4B-6uqn1mqxKWQ1dn5JYZ/view?usp=sharing",
  calendarUrl: "https://calendar.google.com/calendar/u/0?cid=bG9uZ2hvcm5iYWphQGdtYWlsLmNvbQ",
  calendarEmbedUrl:
    "https://calendar.google.com/calendar/embed?src=longhornbaja%40gmail.com&ctz=America%2FChicago&mode=AGENDA&showTitle=0&showPrint=0&showCalendars=0&showTz=1",
  location: "Austin, Texas",
  university: "The University of Texas at Austin",
  logo: "/favicon.png",
  socialImage: "/baja-team-photo.jpg",
  socialLinks: [
    "https://github.com/longhorn-baja-racing",
    "https://www.instagram.com/longhornbajaracing/",
    "https://www.linkedin.com/company/longhorn-baja-racing/",
  ],
  keywords: [
    "Longhorn Baja Racing",
    "UT Austin Baja SAE",
    "Texas Baja SAE",
    "Baja SAE team",
    "student engineering team",
    "off-road vehicle design",
    "collegiate motorsports",
    "University of Texas engineering",
  ],
} as const

/** Sections of the one-page home, in scroll order. Ids double as URL hashes. */
export const sections = [
  { id: "about", label: "About" },
  { id: "subteams", label: "Subteams" },
  { id: "members", label: "Team" },
  { id: "sponsors", label: "Sponsors" },
  { id: "merch", label: "Merch" },
  { id: "calendar", label: "Calendar" },
  { id: "contact", label: "Join" },
] as const

export type SectionId = (typeof sections)[number]["id"]

/** Prefix a public/ path with the GitHub Pages base path. */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`
