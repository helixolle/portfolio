export interface Education {
  year: string;
  institution: string;
  degree: string;
  advisor?: string;
  thesis?: string;
  thesisUrl?: string;
}

export const educationData: Education[] = [
  // If you don't want to show education, just make the array empty.
  {
    year: "2022—2025",
    institution: "Linnaeus University",
    degree: "Bachelor of Science - BS, Interaction design",
  },
  {
    year: "2019—2020",
    institution: "Catalyst - Institute for Creative Arts and Technology",
    degree: "Technological Arts & Visual Effects",
  },
  {
    year: "2017—2018",
    institution: "YRGO",
    degree: "Computer Graphics Design",
    // Optional links to thesis
    // thesisUrl: "https://dspace.mit.edu/handle/1721.1/149111"
  },
  
];
