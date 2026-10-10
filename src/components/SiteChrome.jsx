/**
 * SHARED PUBLIC COMPONENTS
 * Navigation, theme switcher, footer, section titles, and setup banner.
 * For colors and layout rules, search src/styles/index.css.
 */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { configured } from "../lib/supabase.js";

export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0] || "")
    .join("")
    .toUpperCase();
/** Default is dark; explicit visitor preference is remembered locally. */
export function ThemeButton() {
  const [light, setLight] = useState(() => {
    const saved = localStorage.getItem("portfolio-theme");

    return saved === "light";
  });
  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
    localStorage.setItem("portfolio-theme", light ? "light" : "dark");
  }, [light]);
  return (
    <button
      type="button"
      className="theme-button"
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      onClick={() => setLight((v) => !v)}>
      {light ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
/** Header links target sections on the public homepage. */
export function SiteHeader({ profile }) {
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setMenu(false);
  }, [location.pathname]);
  const links = [
    ["About", "#about"],
    ["Expertise", "#skills"],
    ["Work", "#projects"],
    ["Journey", "#journey"],
    ["Contact", "#contact"],
  ];
  return (
    <header className="site-header">
      <div className="site-header-inner container-max flex items-center justify-between">
        <Link to="/" className="wordmark" aria-label="Home">
          <span className="logo-mark">
            AH<span>.</span>
          </span>
          <span className="wordmark-caption">
            DEVELOPER
            <br />
            <b>PORTFOLIO</b>
          </span>
        </Link>
        <nav
          className={`header-nav ${menu ? "is-open" : ""}`}
          aria-label="Main navigation">
          {links.map(([label, href]) => (
            <a href={`/${href}`} key={href} onClick={() => setMenu(false)}>
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions flex items-center">
          <ThemeButton />
          <a className="header-cta" href={`mailto:${profile?.email || ""}`}>
            Let's talk <ArrowUpRight size={16} />
          </a>
          <button
            className="mobile-toggle"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? "Close menu" : "Open menu"}>
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
export function SiteFooter({ profile, settings }) {
  return (
    <footer className="footer">
      <div className="container-max footer-main">
        <div>
          <span className="logo-mark">
            AH<span>.</span>
          </span>
          <p>Building interfaces that feel as good as they function.</p>
        </div>
        <div className="footer-right flex">
          <a
            href={profile?.linkedin_url || "#contact"}
            target={profile?.linkedin_url ? "_blank" : undefined}
            rel="noreferrer"
            aria-label="LinkedIn">
            <Linkedin size={19} />
          </a>
          {profile?.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub">
              <Github size={19} />
            </a>
          )}
          <a href={`mailto:${profile?.email || ""}`} aria-label="Email">
            <Mail size={19} />
          </a>
        </div>
      </div>
      <div className="container-max footer-bottom">
        <span>
          © {new Date().getFullYear()} {profile?.full_name || "Portfolio"}. All
          rights reserved.
        </span>
        <span>{settings?.footer_note || "Made with intention."}</span>
      </div>
    </footer>
  );
}
export function SectionHeading({ eyebrow, title, desc, aside }) {
  return (
    <div className="section-heading flex">
      <div>
        <span className="eyebrow">
          <span className="eyebrow-line" />
          {eyebrow}
        </span>
        <h2>{title}</h2>
        {desc && <p>{desc}</p>}
      </div>
      {aside && <div className="section-aside">{aside}</div>}
    </div>
  );
}
export function PreviewBanner() {
  return !configured ? (
    <div className="preview-banner">
      <span className="tiny-dot" />
      Preview mode — connect Supabase to publish content and enable admin,
      comments and contact forms. <a href="/admin/login">Setup details</a>
    </div>
  ) : null;
}
