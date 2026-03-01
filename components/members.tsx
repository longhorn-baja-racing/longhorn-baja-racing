import { Section } from "@/components/section"
import MemberCard from "@/components/member-card";

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

const lead_list = [
  {
    id: "Yash Tate",
    title: "Yash Tate",
    description: "Powertrain Lead",
    details:
        "",
    image: `${base}/members/yashtate.jpg`,
  },
  {
    id: "Retvin Pant",
    title: "Retvin Pant",
    description: "Dynamics Lead",
    details:
        "",
    image: `${base}/members/retvinpant.jpg`,
  },
  {
    id: "Jestin Castillo",
    title: "Jestin Castillo",
    description: "Ergonomics Lead",
    details:
        "",
    image: `${base}/members/jestincastillo.jpg`,
  },
  {
    id: "Peter Vlahakis",
    title: "Peter Vlahakis",
    description: "Chassis Lead",
    details:
        "",
    image: `${base}/members/petervlahakis.jpg`,
  },
  {
    id: "Boen Kelly",
    title: "Boen Kelly",
    description: "Manufacturing Lead",
    details: "",
    image: `${base}/members/boenkelly.jpg`,
  },
  {
    id: "Alex Grinman Rivera",
    title: "Alex Grinman Rivera",
    description: "Software Lead",
    details: "",
    image: `${base}/members/alexgrinmanrivera.jpg`,
  },
  {
    id: "Ayan Arfi",
    title: "Ayan Arfi",
    description: "Electronics Co-Lead and Business Lead",
    details: "",
    image: `${base}/members/ayanarfi.jpg`,
  },
  {
    id: "Tanush Thirunagari",
    title: "Tanush Thirunagari",
    description: "Electronics Co-Lead",
    details: "",
    image: `${base}/members/tanushthirungari.jpg`,
  },
  {
    id: "Julian Whiteley",
    title: "Julian Whiteley",
    description: "R&D Lead",
    details: "",
    image: `${base}/members/julianwhiteley.jpg`,
  },
  {
    id: "Aara Chawathe",
    title: "Aara Chawathe",
    description: "Corporate Relations Lead",
    details: "",
    image: `${base}/members/aarachawathe.jpg`,
  },
  {
    id: "Shreya Lokhande",
    title: "Shreya Lokhande",
    description: "Public Relations Lead",
    details: "",
    image: `${base}/members/shreyalokhande.jpg`,
  },
]

const racing_list = [
  {
    id: "Racing 1",
    title: "Racing 1",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 2",
    title: "Racing 2",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 3",
    title: "Racing 3",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 4",
    title: "Racing 4",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 5",
    title: "Racing 5",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 6",
    title: "Racing 6",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 7",
    title: "Racing 7",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 8",
    title: "Racing 8",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 9",
    title: "Racing 9",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 10",
    title: "Racing 10",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 11",
    title: "Racing 11",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 12",
    title: "Racing 12",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 13",
    title: "Racing 13",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 14",
    title: "Racing 14",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 15",
    title: "Racing 15",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 16",
    title: "Racing 16",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 17",
    title: "Racing 17",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 18",
    title: "Racing 18",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 19",
    title: "Racing 19",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 20",
    title: "Racing 20",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 21",
    title: "Racing 21",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 22",
    title: "Racing 22",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 23",
    title: "Racing 23",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 24",
    title: "Racing 24",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 25",
    title: "Racing 25",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 26",
    title: "Racing 26",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 27",
    title: "Racing 27",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 28",
    title: "Racing 28",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 29",
    title: "Racing 29",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 30",
    title: "Racing 30",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 31",
    title: "Racing 31",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 32",
    title: "Racing 32",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 33",
    title: "Racing 33",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 34",
    title: "Racing 34",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 35",
    title: "Racing 35",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 36",
    title: "Racing 36",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 37",
    title: "Racing 37",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 38",
    title: "Racing 38",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 39",
    title: "Racing 39",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 40",
    title: "Racing 40",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 41",
    title: "Racing 41",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 42",
    title: "Racing 42",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 43",
    title: "Racing 43",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 44",
    title: "Racing 44",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 45",
    title: "Racing 45",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 46",
    title: "Racing 46",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 47",
    title: "Racing 47",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 48",
    title: "Racing 48",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 49",
    title: "Racing 49",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Racing 50",
    title: "Racing 50",
    description: "Racing",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
]

const iterative_list = [
  {
    id: "Iterative 1",
    title: "Iterative 1",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 2",
    title: "Iterative 2",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 3",
    title: "Iterative 3",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 4",
    title: "Iterative 4",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 5",
    title: "Iterative 5",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 6",
    title: "Iterative 6",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 7",
    title: "Iterative 7",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 8",
    title: "Iterative 8",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 9",
    title: "Iterative 9",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 10",
    title: "Iterative 10",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 11",
    title: "Iterative 11",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 12",
    title: "Iterative 12",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 13",
    title: "Iterative 13",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 14",
    title: "Iterative 14",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 15",
    title: "Iterative 15",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 16",
    title: "Iterative 16",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 17",
    title: "Iterative 17",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 18",
    title: "Iterative 18",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 19",
    title: "Iterative 19",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 20",
    title: "Iterative 20",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 21",
    title: "Iterative 21",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 22",
    title: "Iterative 22",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 23",
    title: "Iterative 23",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 24",
    title: "Iterative 24",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 25",
    title: "Iterative 25",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 26",
    title: "Iterative 26",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 27",
    title: "Iterative 27",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 28",
    title: "Iterative 28",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 29",
    title: "Iterative 29",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 30",
    title: "Iterative 30",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 31",
    title: "Iterative 31",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 32",
    title: "Iterative 32",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 33",
    title: "Iterative 33",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 34",
    title: "Iterative 34",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 35",
    title: "Iterative 35",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 36",
    title: "Iterative 36",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 37",
    title: "Iterative 37",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 38",
    title: "Iterative 38",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 39",
    title: "Iterative 39",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 40",
    title: "Iterative 40",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 41",
    title: "Iterative 41",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 42",
    title: "Iterative 42",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 43",
    title: "Iterative 43",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 44",
    title: "Iterative 44",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 45",
    title: "Iterative 45",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 46",
    title: "Iterative 46",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 47",
    title: "Iterative 47",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 48",
    title: "Iterative 48",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 49",
    title: "Iterative 49",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "Iterative 50",
    title: "Iterative 50",
    description: "Iterative",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
]

const RND_list = [
  {
    id: "R&D 1",
    title: "R&D 1",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 2",
    title: "R&D 2",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 3",
    title: "R&D 3",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 4",
    title: "R&D 4",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 5",
    title: "R&D 5",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 6",
    title: "R&D 6",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 7",
    title: "R&D 7",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 8",
    title: "R&D 8",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 9",
    title: "R&D 9",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 10",
    title: "R&D 10",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 11",
    title: "R&D 11",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 12",
    title: "R&D 12",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 13",
    title: "R&D 13",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 14",
    title: "R&D 14",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 15",
    title: "R&D 15",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 16",
    title: "R&D 16",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 17",
    title: "R&D 17",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 18",
    title: "R&D 18",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 19",
    title: "R&D 19",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 20",
    title: "R&D 20",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 21",
    title: "R&D 21",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 22",
    title: "R&D 22",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 23",
    title: "R&D 23",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 24",
    title: "R&D 24",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 25",
    title: "R&D 25",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 26",
    title: "R&D 26",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 27",
    title: "R&D 27",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 28",
    title: "R&D 28",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 29",
    title: "R&D 29",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 30",
    title: "R&D 30",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 31",
    title: "R&D 31",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 32",
    title: "R&D 32",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 33",
    title: "R&D 33",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 34",
    title: "R&D 34",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 35",
    title: "R&D 35",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 36",
    title: "R&D 36",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 37",
    title: "R&D 37",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 38",
    title: "R&D 38",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 39",
    title: "R&D 39",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 40",
    title: "R&D 40",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 41",
    title: "R&D 41",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 42",
    title: "R&D 42",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 43",
    title: "R&D 43",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 44",
    title: "R&D 44",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 45",
    title: "R&D 45",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 46",
    title: "R&D 46",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 47",
    title: "R&D 47",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 48",
    title: "R&D 48",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 49",
    title: "R&D 49",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },
  {
    id: "R&D 50",
    title: "R&D 50",
    description: "R&D",
    details:
        "",
    image: `${base}/members/lbr-logo.png`,
  },

]

export default function Members() {
  return (
      <Section title="Members" label="WHO WE ARE" anchor="members">
        <div className="text-center max-w-3xl mx-auto mb-10">
        <p className="text-3xl md:text-2xl font-bold text-orange">
          Team Leads
        </p>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lead_list.map((lead) => (
              <MemberCard key={lead.id} {...lead} />
          ))}
      </div>
        <div className="text-center max-w-3x1 mx-auto mb-10 mt-10">
        <p className="text-3xl md:text-2xl font-bold text-orange">
          Racing Team Members
        </p>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {racing_list.map((racing) => (
                <MemberCard key={racing.id} {...racing} />
            ))}
      </div>
        <div className="text-center max-w-3x1 mx-auto mb-10 mt-10">
        <p className="text-3xl md:text-2xl font-bold text-orange">
          Iterative Team Members
        </p>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {iterative_list.map((it) => (
                <MemberCard key={it.id} {...it} />
            ))}
      </div>
      <div className="text-center max-w-3x1 mx-auto mb-10 mt-10">
        <p className="text-3xl md:text-2xl font-bold text-orange">
          Research and Development Team Members
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {RND_list.map((RND) => (
                <MemberCard key={RND.id} {...RND} />
            ))}
      </div>
      </Section>
  )
}
