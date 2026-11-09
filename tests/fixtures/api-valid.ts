export const validApiProject = {
  kind: "api" as const,
  title: "Chronos",
  period: { start: "2025-02", end: "2025-06" },
  api: {
    semester: 3,
    client: { pt: "Necto Systems", en: "Necto Systems" },
    teamSize: 6,
    role: { pt: "Desenvolvedor full-stack", en: "Full-stack developer" },
  },
  summary: { pt: "Resumo em pt.", en: "Summary in en." },
  contribution: {
    pt: ["Item 1", "Item 2"],
    en: ["Item 1", "Item 2"],
  },
  takeaway: { pt: "Aprendizado.", en: "Takeaway." },
  stack: ["Java", "Spring Boot"],
  links: { code: "https://github.com/CtrI-Alt-Del/chronos" },
  image: {
    src: "chronos.png",
    alt: { pt: "Alt pt", en: "Alt en" },
  },
};
