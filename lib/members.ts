// Team leads shown in the Members section. Image paths are under public/ and
// do not include the base path. `focus` is the CSS object-position used when a
// photo is cropped to the portrait frame (wide shots need to aim at the face).

export type Lead = {
  name: string
  role: string
  image?: `/${string}`
  focus?: string
  /** Captains and vice captains are featured first and larger. */
  leadership?: boolean
}

export const leads: readonly Lead[] = [
  { name: "Yash Tate", role: "Co-Captain and Powertrain Lead", image: "/members/yashtate.jpg", focus: "50% 30%", leadership: true },
  { name: "Retvin Pant", role: "Co-Captain and Dynamics Lead", image: "/members/retvinpant.webp", focus: "47% 40%", leadership: true },
  { name: "Jestin Castillo", role: "Co-Vice Captain and Ergonomics Lead", image: "/members/jestincastillo.jpg", focus: "50% 30%", leadership: true },
  { name: "Peter Vlahakis", role: "Co-Vice Captain, Chassis and Manufacturing Lead", image: "/members/petervlahakis.jpg", focus: "55% 35%", leadership: true },
  { name: "Abigail Mears", role: "Vice Captain and Logistics Lead", image: "/members/abigailmears.avif", focus: "50% 30%", leadership: true },
  { name: "John Moreno", role: "Ergonomics Co-Lead", image: "/members/johnmoreno.avif", focus: "50% 30%" },
  { name: "Pradyota Phaneesh", role: "Chassis Lead", image: "/members/prad.webp", focus: "55% 55%" },
  { name: "Lily Neideffer", role: "Manufacturing Lead" },
  { name: "Alex Grinman Rivera", role: "Software Lead", image: "/members/alexgrinmanrivera.jpg", focus: "50% 30%" },
  { name: "Arnav Vajirkar", role: "Business and Marketing Lead" },
  { name: "Tanush Thirunagari", role: "Electronics Co-Lead", image: "/members/tanushthirungari.jpg", focus: "50% 35%" },
  { name: "Maanas Rastogi", role: "Electronics Lead" },
  { name: "Youssef Anbar", role: "Electronics Lead", image: "/members/youssef.webp", focus: "50% 30%" },
  { name: "Julian Whiteley", role: "Simulation and Validation Lead", image: "/members/julianwhiteley.jpg", focus: "50% 35%" },
  { name: "Ava Schrader", role: "Simulation and Validation Lead" },
  { name: "Shreesh Joshi", role: "Corporate Relations Lead" },
  { name: "Shreya Lokhande", role: "Public Relations Lead", image: "/members/shreyalokhande.jpg", focus: "50% 30%" },
]

export function initials(name: string) {
  const parts = name.split(" ").filter(Boolean)
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase()
}
