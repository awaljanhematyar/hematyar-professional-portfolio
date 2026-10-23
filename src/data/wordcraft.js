// Source-managed demonstration. A published CMS record with this slug wins.
// Production URL verified in the authenticated publication workflow.
export const wordcraft = {
  id: "case-study-wordcraft",
  slug: "wordcraft",
  title: "WordCraft",
  category: "JavaScript Browser Game",
  short_description: "A buildless word puzzle with stable UTC daily challenges, unlimited practice, strict Hard Mode and persistent statistics.",
  description: "WordCraft is an independent portfolio demonstration built with HTML5, CSS3 and vanilla JavaScript ES modules. It separates pure scoring, duplicate-letter constraints, UTC scheduling and validated persistence from a responsive interface. It includes physical and on-screen keyboards, separate Daily and Unlimited statistics, themes, optional sound, accessible dialogs and private emoji sharing. It was not a paid client project. Answers and local state are inspectable, and there is no backend, synchronized multiplayer or cross-device storage.",
  technologies: ["HTML5", "CSS3", "Vanilla JavaScript", "ES Modules", "Local Storage", "Node.js built-in tests"],
  live_url: "https://wordcraft-mu-one.vercel.app/",
  github_url: "https://github.com/awaljanhematyar/wordcraft",
  cover_url: "/projects/wordcraft-desktop.jpg",
  featured: true,
  published: true,
};
export function includeWordCraft(projects = []) {
  const existing = Array.isArray(projects) ? projects : [];
  return existing.some(project => project.slug === wordcraft.slug) ? existing : [...existing, wordcraft];
}
export const wordcraftFeatures = [
  "Daily: one shared puzzle per UTC day using an immutable versioned schedule.",
  "Unlimited: randomized practice, replay and no loss for abandoning an unfinished game.",
  "Hard Mode: accumulated green/yellow positions and inferred duplicate-letter minimum and maximum counts.",
  "Local Storage: replay-validated progress, saved settings, completion deduplication and separate mode statistics.",
  "Accessible interactions: named feedback, keyboard input, modal focus handling, polite announcements and reduced motion.",
  "Share results: metadata and emoji only, with manual-copy fallback when automatic copying fails.",
];
export const wordcraftChallenges = [
  ["Duplicate-letter scoring", "Greens allocate first, then yellows consume remaining answer counts, preventing excess positive copies."],
  ["UTC boundaries", "UTC day ordinals and a frozen answer snapshot preserve the daily mapping across releases."],
  ["Reliable restoration", "Saved guesses are validated and replayed. Statistics rebuild from an idempotent completion ledger."],
  ["Input during animation", "Both keyboards use one submission path with an animation lock and filtering for dialogs, editable controls and browser shortcuts."],
  ["Rendering overhead", "Comparison-before-write DOM updates and reserved board geometry reduced observed mutation records and layout shifts."],
];
