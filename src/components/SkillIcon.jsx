/**
 * SKILL ICON REGISTRY
 *
 * Maps saved skill names (from Supabase) to technology logo components.
 * To support another skill, import its icon and add a key to `skillIcons`.
 * The key uses lowercase letters/numbers only: "React.js" becomes "reactjs".
 * Unknown names fall back to the generic Code2 icon.
 */
import {
  SiReact,
  SiJavascript,
  SiHtml5,
  SiCss,
  SiTailwindcss,
  SiGit,
  SiGithub,
  SiNextdotjs,
  SiSupabase,
  SiNodedotjs,
  SiPostgresql,
  SiVite,
  SiFirebase,
} from "react-icons/si";
import { Code2 } from "lucide-react";

const skillIcons = {
  react: [SiReact, "#61DAFB"],
  reactjs: [SiReact, "#61DAFB"],

  javascript: [SiJavascript, "#F7DF1E"],
  js: [SiJavascript, "#F7DF1E"],

  html: [SiHtml5, "#E34F26"],
  html5: [SiHtml5, "#E34F26"],

  css: [SiCss, "#1572B6"],
  css3: [SiCss, "#1572B6"],

  tailwind: [SiTailwindcss, "#06B6D4"],
  tailwindcss: [SiTailwindcss, "#06B6D4"],

  git: [SiGit, "#F05032"],
  github: [SiGithub, "currentColor"],

  nextjs: [SiNextdotjs, "currentColor"],

  supabase: [SiSupabase, "#3ECF8E"],

  nodejs: [SiNodedotjs, "#5FA04E"],

  postgresql: [SiPostgresql, "#4169E1"],

  vite: [SiVite, "#A78BFA"],

  firebase: [SiFirebase, "#FFCA28"],
};

export default function SkillIcon({ skill }) {
  const normalize = (value) => (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  const iconData = skillIcons[normalize(skill.name)] || skillIcons[normalize(skill.icon)];

  if (!iconData) {
    return (
      <span className="skill-brand-icon" aria-hidden="true">
        <Code2 size={22} />
      </span>
    );
  }

  const [Icon, color] = iconData;

  return (
    <span className="skill-brand-icon" style={{ color }} aria-hidden="true">
      <Icon size={24} />
    </span>
  );
}
