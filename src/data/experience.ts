export interface Experience {
  date: string;
  title: string;
  company: string;
  description?: string;
  advisor?: string;
  manager?: string;
  companyUrl?: string;
}

export const experienceData: Experience[] = [
  {
    date: "Spring 2025",
    title: "Interaction Design",
    company: "Sourceful.Energy",
    description:
      "As part of our education we collaborated with sourceful.energy and helped them design prototypes for their consumer apps.",
    advisor: "Paul Cooper",
    companyUrl: "https://sourceful.energy/",
  },
];
