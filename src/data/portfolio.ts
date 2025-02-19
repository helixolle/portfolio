import Image from "next/image";

export interface Portfolio {
  title: string;
  description: string;
  technologies?: string[];
  imageUrl?: string;
  projectUrl?: string;
  codeUrl?: string;
}

export const portfolioData: Portfolio[] = [
  // Example entry
  {
    title: "OriginStory",
    description:
      "A browser extension designed to empower news consumers with a deeper understanding of news narratives.",
    technologies: ["Figma"],
    projectUrl: "https://project-demo.com",
    imageUrl: <img src="/img/originstory_omslag.png" alt="Example" />,
    codeUrl: "https://github.com/username/project",
  },
];
