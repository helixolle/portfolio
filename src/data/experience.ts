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
    company: "Uptilt/Timpunkt",
    description:
      "As part of our education we collaborated with Uptilt/Timpunkt and helped them design prototypes for their consumer apps.",
    //advisor: "**",
    companyUrl: "https://uptilt.se/",
  },
];
