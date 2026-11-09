import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
  createProjectSchema,
  createTestimonialSchema,
  profileSchema,
  timelineSchema,
} from "./lib/schemas";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/projects" }),
  schema: ({ image }) => createProjectSchema(image()),
});

const timeline = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/timeline" }),
  schema: timelineSchema,
});

const testimonials = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/testimonials" }),
  schema: ({ image }) => createTestimonialSchema(image()),
});

const profile = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/profile" }),
  schema: profileSchema,
});

export const collections = { projects, timeline, testimonials, profile };
