// Source-managed case study. A published CMS record with this slug takes priority.
export const atelierNorth = {
  id: "case-study-atelier-north-interiors",
  slug: "atelier-north-interiors",
  title: "Atelier North Interiors",
  category: "Premium Interior Design Website",
  short_description:
    "A responsive React portfolio demonstration featuring an editorial design system, interactive project galleries, accessible navigation, and demo consultation forms.",
  description:
    "A fictional Vancouver interior design studio presented through twelve clearly labelled concept studies. The site combines responsive editorial layouts, project filters, keyboard-accessible reference galleries, project navigation, FAQs, and local-only enquiry and consultation demos. No real messages, appointments or client commissions are claimed.",
  technologies: ["React", "Vite", "Tailwind CSS", "React Router"],
  live_url: "https://atelier-north-interiors.vercel.app",
  github_url: "https://github.com/awaljanhematyar/atelier-north-interiors",
  cover_url: "/projects/atelier-north-interiors.webp",
  featured: true,
  published: true,
};

export function includeAtelierNorth(projects = []) {
  const publishedProjects = Array.isArray(projects) ? projects : [];
  return publishedProjects.some((project) => project.slug === atelierNorth.slug)
    ? publishedProjects
    : [...publishedProjects, atelierNorth];
}
