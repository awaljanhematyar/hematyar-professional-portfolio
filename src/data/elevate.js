// Source-managed Elevate case study. Existing CMS records retain priority and ordering.
export const elevate = {
  id: "case-study-elevate-performance-coaching",
  slug: "elevate-performance-coaching",
  title: "Elevate Performance Coaching — Premium Fitness Website",
  category: "Fitness & Coaching Website",
  short_description: "A premium, responsive fitness coaching website featuring dynamic training programs, interactive filters, consultation enquiries, and modern UI/UX.",
  description: "Elevate Performance Coaching is a modern fitness coaching portfolio demonstration built with React 19, Vite, JavaScript, and Tailwind CSS. The website features six fictional coaching programs, dynamic program detail pages, program filtering, educational fitness articles, an accessible FAQ accordion, and a validated consultation enquiry experience. The responsive design combines bold typography, premium fitness imagery, and clear calls to action. All coaching content, success stories, pricing, and enquiries are illustrative; no real coaching services or submissions are provided.",
  technologies: ["React", "Vite", "JavaScript", "Tailwind CSS", "React Router", "Lucide React"],
  live_url: "https://elevate-performance-coaching-one.vercel.app",
  github_url: "https://github.com/awaljanhematyar/elevate-performance-coaching",
  cover_url: "/projects/elevate-performance-coaching.webp",
  featured: true,
  published: true,
};

export function includeElevate(projects = []) {
  const existing = Array.isArray(projects) ? projects : [];
  return existing.some(project => project.slug === elevate.slug) ? existing : [...existing, elevate];
}
