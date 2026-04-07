import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Section from "@/components/section"
import Image from "next/image"

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Place logo images in public/internships/ and set the logo field to the filename.
// e.g. logo: "tesla.avif"
const internships = [
  {
    company: "Internship 1 Placeholder",
    roleTeam: "Vehicle Dynamics",
    location: "Austin, TX",
    logo: null, // Add logo picture
  },
  {
    company: "Internship 2 Placeholder",
    roleTeam: "Structures Engineering",
    location: "Hawthorne, CA",
    logo: null,
  },
  {
    company: "Internship 3 Placeholder",
    roleTeam: "Chassis Systems",
    location: "Normal, IL",
    logo: null,
  },
]

function LogoPlaceholder({ company }: { company: string }) {
  return (
    <div className="w-12 h-12 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground text-xs font-semibold select-none">
      {company.slice(0, 2).toUpperCase()}
    </div>
  )
}

export default function InternshipsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <Section title="LBR Internships" label="MEMBERS IN INDUSTRY">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-4 pr-6 w-16"></th>
                  <th className="pb-4 pr-8 text-primary font-semibold uppercase tracking-wide text-xs">Company</th>
                  <th className="pb-4 pr-8 text-primary font-semibold uppercase tracking-wide text-xs">Role / Team</th>
                  <th className="pb-4 text-primary font-semibold uppercase tracking-wide text-xs">Location</th>
                </tr>
              </thead>
              <tbody>
                {internships.map((entry, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-card/50 transition-colors">
                    <td className="py-4 pr-6">
                      {entry.logo ? (
                        <Image
                          src={`${base}/internships/${entry.logo}`}
                          alt={`${entry.company} logo`}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-contain rounded-lg"
                        />
                      ) : (
                        <LogoPlaceholder company={entry.company} />
                      )}
                    </td>
                    <td className="py-4 pr-8 text-foreground font-medium">{entry.company}</td>
                    <td className="py-4 pr-8 text-muted-foreground">{entry.roleTeam}</td>
                    <td className="py-4 text-muted-foreground">{entry.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
      <Footer />
    </main>
  )
}
