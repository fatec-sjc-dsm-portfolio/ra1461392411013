import { z } from "astro/zod";

export const Localized = z.object({
  pt: z.string().trim().min(1),
  en: z.string().trim().min(1),
});

export const LocalizedList = z
  .object({
    pt: z.array(z.string().trim().min(1)).min(1).max(4),
    en: z.array(z.string().trim().min(1)).min(1).max(4),
  })
  .refine((v) => v.pt.length === v.en.length, {
    message: "pt e en precisam ter o mesmo número de itens",
  });

export const LocalizedTags = z
  .object({
    pt: z.array(z.string().trim().min(1)).min(1).max(20),
    en: z.array(z.string().trim().min(1)).min(1).max(20),
  })
  .refine((v) => v.pt.length === v.en.length, {
    message: "pt e en precisam ter o mesmo número de itens",
  });

export const YearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "use AAAA-MM");

export function createProjectSchema<ImageSrc extends z.ZodType>(imageSrc: ImageSrc) {
  return z
    .object({
      kind: z.enum(["api", "personal"]),
      draft: z.boolean().default(false),
      title: z.string().min(1),
      summary: Localized,
      contribution: LocalizedList,
      takeaway: Localized.optional(),
      stack: z.array(z.string().min(1)).min(1).max(8),
      period: z.object({ start: YearMonth, end: YearMonth.nullable() }),
      links: z.object({
        code: z.url(),
        codeVisibility: z.enum(["public", "private"]).default("public"),
      }),
      image: z.object({ src: imageSrc, alt: Localized }).optional(),
      api: z
        .object({
          semester: z.number().int().min(1).max(6),
          client: Localized,
          teamSize: z.number().int().min(1),
          role: Localized,
        })
        .optional(),
    })
    .superRefine((p, ctx) => {
      if (p.kind === "api" && !(p.api && p.takeaway && p.image)) {
        ctx.addIssue({
          code: "custom",
          message: "projeto de API exige api, takeaway e image",
        });
      }
    });
}

export const timelineSchema = z.object({
  kind: z.enum(["academic", "professional"]),
  title: z.string().min(1),
  subtitle: Localized,
  start: YearMonth,
  end: YearMonth.nullable(),
  highlights: LocalizedList,
  stack: z.array(z.string().min(1)).min(1).max(8).optional(),
});

export function createTestimonialSchema<ImageSrc extends z.ZodType>(imageSrc: ImageSrc) {
  return z.object({
    name: z.string().min(1),
    // Cargo na época em que trabalharam juntos.
    role: Localized,
    quote: Localized,
    // Sem foto, o cartão mostra as iniciais.
    photo: imageSrc.optional(),
    // true = conteúdo de exemplo. O check:delivery trava enquanto existir.
    placeholder: z.boolean().default(false),
  });
}

export const profileSchema = z.object({
  name: z.string().min(1),
  headline: Localized,
  summary: Localized,
  location: Localized,
  availability: Localized,
  contacts: z.object({
    email: z.string().min(1),
    linkedin: z.url(),
    github: z.url(),
  }),
  resume: z.object({
    file: z.string().min(1),
    lang: z.literal("en"),
  }),
  languages: z
    .array(
      z.object({
        name: Localized,
        level: Localized,
        certificateUrl: z.url().optional(),
      }),
    )
    .min(1),
  // Pódio das principais tecnologias, na ordem 1º, 2º e 3º.
  featured: z
    .array(z.object({ name: Localized, icon: z.string().min(1) }))
    .length(3),
  stack: z
    .array(
      z.object({
        category: Localized,
        items: z
          .array(
            z.object({
              // Nome de tecnologia não se traduz, mas alguns itens são
              // descrições ("React básico" / "React, basic"), então o par
              // pt/en continua obrigatório.
              name: Localized,
              icon: z.string().min(1).optional(),
            }),
          )
          .min(1)
          .max(10),
      }),
    )
    .min(1),
  skills: z
    .array(
      z.object({
        group: Localized,
        items: LocalizedTags,
      }),
    )
    .min(1),
  interests: z
    .array(
      z.object({
        title: Localized,
        text: Localized,
        icon: z.string().min(1),
      }),
    )
    .min(1),
});
