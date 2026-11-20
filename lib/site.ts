export const siteConfig = {
  name: "Longhorn Baja Racing",
  shortName: "Longhorn Baja",
  title: "Longhorn Baja Racing | UT Austin Baja SAE",
  description:
    "The official website of Longhorn Baja Racing, The University of Texas at Austin student team that designs, builds, tests, and races an off-road vehicle for Baja SAE competition.",
  url: "https://longhornbajaracing.com",
  email: "longhornbaja@gmail.com",
  applyUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdrG7jBfGopgbjPINuEyZia1LtU8JFHEpY_tmed9kqVui2SqQ/viewform?usp=preview",
  // Recruiting cycle switch: the one place to edit between cycles.
  // - To open applications: paste the new form into `applyUrl` above and set
  //   `open: true`.
  // - To close applications: set `open: false`. Every public apply entry point
  //   (home page hero and the Join / Contact page) then shows `closedMessage`
  //   as plain text instead of linking to the form.
  // To preview the closed state without editing this file, build with
  // NEXT_PUBLIC_APPLICATIONS_OPEN=false (see CONTRIBUTING.md).
  applications: {
    open: true,
    closedMessage: "Applications are closed for this recruiting cycle. Check back next semester.",
  },
  sponsorUrl: "https://drive.google.com/file/d/1RUknYrIfWhk4B-6uqn1mqxKWQ1dn5JYZ/view?usp=sharing",
  calendarUrl: "https://calendar.google.com/calendar/u/0?cid=bG9uZ2hvcm5iYWphQGdtYWlsLmNvbQ",
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
