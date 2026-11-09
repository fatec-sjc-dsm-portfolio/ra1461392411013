export interface UiDictionary {
  meta: { title: string; description: string };
  nav: {
    label: string;
    home: string;
    experience: string;
    projects: string;
    testimonials: string;
    skills: string;
    interests: string;
    contact: string;
  };
  skip: string;
  lang: { switchPrefix: string; other: string };
  theme: { toggle: string };
  action: { resume: string; email: string };
  projects: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    intro: string;
    tabsLabel: string;
    tabAcademic: string;
    tabPersonal: string;
  };
  card: {
    semester: string;
    client: string;
    clientInternal: string;
    team: string;
    role: string;
    period: string;
    contribution: string;
    takeaway: string;
    code: string;
    codeAria: string;
    inProgress: string;
    private: string;
  };
  link: { newTab: string };
  period: { present: string };
  exp: {
    eyebrow: string;
    title: string;
    titleAccent: string;
  };
  timeline: { academic: string; professional: string };
  skills: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    featured: string;
    languages: string;
    certificate: string;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    label: string;
    photoAlt: string;
  };
  interests: { eyebrow: string; title: string; titleAccent: string };
  contact: { eyebrow: string; title: string; titleAccent: string; intro: string };
  footer: { privacy: string };
  photo: { alt: string };
  notFound: { title: string; text: string; link: string };
}

export { locales, localeMeta, otherLocale, type Locale } from "./locales";
