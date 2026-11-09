interface ApiProjectLike {
  data: {
    draft: boolean;
    api?: { semester: number };
  };
}

interface PersonalProjectLike {
  data: {
    draft: boolean;
    period: { start: string };
  };
}

export function sortApiProjects<T extends ApiProjectLike>(entries: T[]): T[] {
  return entries
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => (b.data.api?.semester ?? 0) - (a.data.api?.semester ?? 0));
}

export function sortPersonalProjects<T extends PersonalProjectLike>(entries: T[]): T[] {
  return entries
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => (a.data.period.start < b.data.period.start ? 1 : -1));
}
