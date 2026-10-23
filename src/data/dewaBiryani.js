import desktopScreenshot from "../../public/projects/dewa-biryani-desktop.jpg.b64?raw";

export const dewaBiryani = {
  id: "case-study-dewa-biryani",
  slug: "dewa-biryani-restaurant-website",
  title: "Dewa Biryani Restaurant Website",
  category: "Restaurant Website",
  short_description:
    "A premium, responsive restaurant website featuring a cinematic homepage, interactive food menu, special offers, photo gallery, and three Kabul branch locations with Google Maps integration.",
  description:
    "An independent demonstration concept for Dewa Biryani, built with HTML5, CSS3, and vanilla JavaScript. The site supports Pashto, Dari, and English; includes an interactive, searchable menu; a gallery lightbox; offer and contact flows; and three branch cards with Google Maps address searches. This is a demonstration, not a claim of an official or paid client relationship. Menu prices and some branch details remain unverified.",
  technologies: ["HTML5", "CSS3", "Vanilla JavaScript", "ES Modules"],
  live_url: "https://dewa-biryani.vercel.app/",
  github_url: "https://github.com/awaljanhematyar/dewa-biryani",
  cover_url: `data:image/jpeg;base64,${desktopScreenshot.trim()}`,
  featured: true,
  published: true,
};

export function includeDewaBiryani(projects = []) {
  const existing = Array.isArray(projects) ? projects : [];
  return existing.some((project) => project.slug === dewaBiryani.slug)
    ? existing
    : [...existing, dewaBiryani];
}
