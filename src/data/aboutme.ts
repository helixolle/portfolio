export interface AboutMe {
  name: string;
  title: string;
  institution: string;
  description: string;
  email: string;
  imageUrl?: string;
  blogUrl?: string;
  cvUrl?: string;
  googleScholarUrl?: string;
  twitterUsername?: string;
  githubUsername?: string;
  linkedinUsername?: string;
  funDescription?: string; // Gets placed in the left sidebar
  secretDescription?: string; // Gets placed in the bottom
  altName?: string;
  institutionUrl?: string;
}

export const aboutMe: AboutMe = {
  name: "Olle Lomberg Davegård", 
  title: "Interaktionsdesigner",
  institution: "Linnéuniversitetet",
  // Note that links work in the description
  description:
    "I'm an interaction design student currently studying at Linnaeus University remotely. I have a strong foundation in digital graphics, both 3D and 2D, that I now want to channel into the world of interaction design by creaing engaging and intuitive interfaces.",
  email: "olledavegardh@gmail.com",
  imageUrl:
    "/portfolio/src/img/2.png",
  googleScholarUrl: "",
  githubUsername: "",
  linkedinUsername: "olleld",
  twitterUsername: "",
  blogUrl: "https://",
  cvUrl: "https://",
  institutionUrl: "https://www.lnu.se",
  // altName: "",
  // secretDescription: "I like dogs.",
  funDescription: "HEJEHAKSFNJOADGBODBSFGUJODSBGUSJDNHGOUDHNGDHNGSDSIHNGSDIHNGS",
};
