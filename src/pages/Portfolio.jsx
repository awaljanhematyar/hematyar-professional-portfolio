import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SkillIcon from "../components/SkillIcon.jsx";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronLeft,
  Code2,
  Download,
  ExternalLink,
  Github,
  GraduationCap,
  Layers3,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";
import { usePortfolio } from "../hooks/usePortfolio.js";
import { submitPublic } from "../lib/api.js";
import {
  PreviewBanner,
  SectionHeading,
  SiteFooter,
  SiteHeader,
  initials,
} from "../components/SiteChrome.jsx";
import { configured } from "../lib/supabase.js";
import { includeAtelierNorth } from "../data/atelierNorth.js";

/** Show a readable month/year for dates stored in the database. */
const dateLabel = (s) => {
  if (!s) return "";
  const date = new Date(`${s.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? s
    : date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};
/** Hero image: shows the image uploaded in Admin, or initials when missing. */
function IntroShape({ profile }) {
  return (
    <div className="hero-visual">
      {profile?.profile_image_url ? (
        <img
          src={profile.profile_image_url}
          alt={profile.full_name || "Profile"}
          className="hero-profile-image"
        />
      ) : (
        <div className="hero-profile-placeholder">
          <span>{initials(profile?.full_name || "Awal Jan")}</span>
        </div>
      )}
    </div>
  );
}
/**
 * Shared form for contact messages and moderated visitor comments.
 * Actual submission happens through Supabase's `public-submit` Edge Function.
 */
function ContactForm({ kind = "contact" }) {
  const fields =
    kind === "contact"
      ? ["name", "email", "subject", "message"]
      : ["name", "email", "comment"];
  const [value, setValue] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    comment: "",
    website: "",
  });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [success, setSuccess] = useState(false);
  // Prevent a browser reload and show accurate server submission feedback.
  async function submit(e) {
    e.preventDefault();
    setNotice("");
    setBusy(true);
    try {
      await submitPublic(
        kind,
        Object.fromEntries(fields.map((f) => [f, value[f].trim()])),
        value.website,
      );
      setSuccess(true);
      setNotice(
        kind === "contact"
          ? "Your message has been saved. Thank you for reaching out."
          : "Your comment has been submitted for moderation.",
      );
      setValue({
        name: "",
        email: "",
        subject: "",
        message: "",
        comment: "",
        website: "",
      });
    } catch (err) {
      setSuccess(false);
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-row">
        <label>
          Your name
          <input
            required
            maxLength="100"
            autoComplete="name"
            placeholder="Your full name"
            value={value.name}
            onChange={(e) => setValue((v) => ({ ...v, name: e.target.value }))}
          />
        </label>
        <label>
          Email address
          <input
            required
            type="email"
            maxLength="255"
            autoComplete="email"
            placeholder="you@example.com"
            value={value.email}
            onChange={(e) => setValue((v) => ({ ...v, email: e.target.value }))}
          />
        </label>
      </div>
      {kind === "contact" && (
        <label>
          Subject
          <input
            required
            maxLength="150"
            placeholder="Tell me about your project"
            value={value.subject}
            onChange={(e) =>
              setValue((v) => ({ ...v, subject: e.target.value }))
            }
          />
        </label>
      )}
      <label>
        {kind === "contact" ? "Your message" : "Leave a comment"}
        <textarea
          required
          maxLength="5000"
          rows={kind === "contact" ? 5 : 4}
          placeholder={
            kind === "contact"
              ? "What are you working on?"
              : "Share your thoughts…"
          }
          value={kind === "contact" ? value.message : value.comment}
          onChange={(e) =>
            setValue((v) => ({
              ...v,
              [kind === "contact" ? "message" : "comment"]: e.target.value,
            }))
          }
        />
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input
          tabIndex="-1"
          autoComplete="off"
          value={value.website}
          onChange={(e) => setValue((v) => ({ ...v, website: e.target.value }))}
        />
      </label>
      <div className="form-foot">
        <span>
          {kind === "comments"
            ? "Your email stays private. Comments appear after approval."
            : "Messages are stored securely before email notification."}
        </span>
        <button
          className="button button-green"
          type="submit"
          disabled={busy || !configured}>
          {busy
            ? "Sending…"
            : kind === "contact"
              ? "Send message"
              : "Post comment"}{" "}
          <Send size={16} />
        </button>
      </div>
      {!configured && (
        <p className="form-info">
          Connect Supabase to enable this form. Preview does not submit data.
        </p>
      )}
      {notice && (
        <p className={success ? "form-success" : "form-error"} role="status">
          {notice}
        </p>
      )}
    </form>
  );
}
/** Public homepage. All published sections receive their records from usePortfolio. */
function PortfolioBody({ data }) {
  const {
    profile: p,
    skills = [],
    projects: publishedProjects = [],
    experience = [],
    education = [],
    certificates = [],
    services = [],
    comments = [],
    site_settings: settings,
  } = data;
  const projects = includeAtelierNorth(publishedProjects);
  const topSkills = skills.slice(0, 8);
  const categories = [...new Set(skills.map((x) => x.category || "Other"))];
  return (
    <>
      <PreviewBanner />
      <SiteHeader profile={p} />
      <main>
        {/* ===== 01 HERO / PROFILE ===== */}
        <section className="hero section-pad" id="home">
          <div className="container-max hero-grid grid">
            <div className="hero-content">
              <span className="eyebrow">
                <span className="eyebrow-line" />
                HELLO, I'M{" "}
                {p?.full_name?.split(" ")[0]?.toUpperCase() || "A DEVELOPER"}
              </span>
              <h1>
                Making the web <em>feel</em> a little more human<span>.</span>
              </h1>
              <p className="hero-lead">
                I'm <strong>{p?.full_name || "a Frontend Developer"}</strong>,{" "}
                {p?.headline?.toLowerCase() || "a developer"} focused on
                building clean, responsive and thoughtful digital experiences.
              </p>
              <div className="hero-buttons flex flex-wrap">
                <a className="button button-green" href="#projects">
                  Explore my work <ArrowUpRight size={18} />
                </a>
                <a className="button button-outline" href="#contact">
                  Get in touch <ArrowRight size={18} />
                </a>
              </div>
              <div className="hero-social">
                <div className="pulse-dot" /> Open to meaningful opportunities{" "}
                <span className="social-divider" />
                {p?.location && (
                  <>
                    <MapPin size={15} /> {p.location}
                  </>
                )}
              </div>
            </div>
            <IntroShape profile={p} />
          </div>
          <div className="container-max hero-bottom">
            <span>SCROLL TO EXPLORE</span>
            <ArrowDown size={15} />
            <div className="hero-stack">
              {topSkills.slice(0, 4).map((s) => (
                <span key={s.id}>{s.name}</span>
              ))}
            </div>
          </div>
        </section>
        {/* ===== 02 ABOUT ===== */}
        <section className="section-pad about-section" id="about">
          <div className="container-max">
            <SectionHeading
              eyebrow="01 / THE PERSON"
              title={
                <>
                  A little about <i>me.</i>
                </>
              }
              desc="A curious mind, a builder at heart."
            />
            <div className="about-grid">
              <div className="about-quote">
                <span className="quote-mark">“</span>
                <p>
                  Great experiences come from the details most people don't
                  notice.
                </p>
                <div className="quote-stroke" />
              </div>
              <div className="about-copy">
                <p>
                  {p?.bio ||
                    "My professional story will be available here soon."}
                </p>
                <div className="about-details">
                  <div>
                    <span>FOCUS</span>
                    <strong>{p?.headline || "Frontend engineering"}</strong>
                  </div>
                  <div>
                    <span>BASED IN</span>
                    <strong>{p?.location || "Location not shared"}</strong>
                  </div>
                </div>
                {p?.cv_url && (
                  <a
                    className="text-link"
                    href={p.cv_url}
                    target="_blank"
                    rel="noreferrer">
                    Download my CV <Download size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
        {/* ===== 03 SKILLS / ICONS ===== */}
        <section className="section-pad expertise-section" id="skills">
          <div className="container-max">
            <SectionHeading
              eyebrow="02 / EXPERTISE"
              title={
                <>
                  The tools behind <i>the craft.</i>
                </>
              }
              desc="A growing toolkit for building modern digital products."
            />
            <div className="skill-groups grid">
              {categories.length ? (
                categories.map((category, i) => (
                  <div className="skill-group" key={category}>
                    <div className="skill-group-title">
                      <span>0{i + 1}</span>
                      <h3>{category}</h3>
                    </div>
                    <div className="skill-pills">
                      {skills
                        .filter((s) => (s.category || "Other") === category)
                        .map((s) => (
                          <span className="skill-pill" key={s.id}>
                            <SkillIcon skill={s} />
                            <span>{s.name}</span>
                          </span>
                        ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="muted">Skills will appear here when published.</p>
              )}
            </div>
          </div>
        </section>
        {/* ===== 04 PROJECTS ===== */}
        <section className="section-pad work-section" id="projects">
          <div className="container-max">
            <SectionHeading
              eyebrow="03 / SELECTED WORK"
              title={
                <>
                  Things I've <i>built.</i>
                </>
              }
              desc="Projects, experiments and ideas brought to life."
              aside={
                <span className="section-count">
                  {String(projects.length).padStart(2, "0")} PROJECTS
                </span>
              }
            />
            {projects.length ? (
              <div className="project-grid grid">
                {projects.map((project, i) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.slug}`}
                    className="project-card">
                    <div className="project-cover">
                      {project.cover_url ? (
                        <img
                          loading="lazy"
                          src={project.cover_url}
                          alt={`${project.title} project screenshot`}
                        />
                      ) : (
                        <div className="project-graphic">
                          <Code2 size={42} />
                          <span>
                            PROJECT / {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                      )}
                      <span className="project-arrow">
                        <ArrowUpRight size={20} />
                      </span>
                    </div>
                    <div className="project-meta">
                      <span>{project.category || "DEVELOPMENT"}</span>
                      {project.featured && <span>FEATURED</span>}
                    </div>
                    <h3>{project.title}</h3>
                    <p>{project.short_description || project.description}</p>
                    <div className="tag-row flex flex-wrap">
                      {(project.technologies || []).slice(0, 4).map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-projects">
                <div className="empty-icon">
                  <Layers3 size={30} />
                </div>
                <div>
                  <span className="eyebrow">COMING SOON</span>
                  <h3>New work is on the horizon.</h3>
                  <p>
                    Verified projects haven't been added yet. This section
                    updates automatically when they're published from the
                    dashboard.
                  </p>
                </div>
                <a className="button button-outline" href="#contact">
                  Let's collaborate <ArrowUpRight size={17} />
                </a>
              </div>
            )}
          </div>
        </section>
        {/* ===== 05 EDUCATION / EXPERIENCE ===== */}
        <section className="section-pad journey-section" id="journey">
          <div className="container-max">
            <SectionHeading
              eyebrow="04 / THE JOURNEY"
              title={
                <>
                  Learning. Building. <i>Growing.</i>
                </>
              }
              desc="The experiences and education shaping how I work."
            />
            <div className="journey-grid grid">
              <div className="journey-column">
                <div className="journey-title">
                  <BriefcaseBusiness size={19} /> Experience
                </div>
                {experience.length ? (
                  experience.map((item) => (
                    <div className="timeline-item" key={item.id}>
                      <span className="timeline-dot" />
                      <div className="timeline-time">
                        {dateLabel(item.start_date)} —{" "}
                        {item.end_date ? dateLabel(item.end_date) : "Present"}
                      </div>
                      <h3>{item.role}</h3>
                      <strong>{item.organization}</strong>
                      <p>{item.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="muted">No experience published yet.</p>
                )}
              </div>
              <div className="journey-column">
                <div className="journey-title">
                  <GraduationCap size={21} /> Education
                </div>
                {education.length ? (
                  education.map((item) => (
                    <div className="timeline-item" key={item.id}>
                      <span className="timeline-dot" />
                      <div className="timeline-time">
                        {dateLabel(item.start_date)} —{" "}
                        {dateLabel(item.end_date) || "Present"}
                      </div>
                      <h3>{item.degree}</h3>
                      <strong>{item.institution}</strong>
                      <p>
                        {item.field}
                        {item.description ? ` · ${item.description}` : ""}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="muted">No education published yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>
        {(certificates.length > 0 || services.length > 0) && (
          <section className="section-pad credentials-section">
            <div className="container-max two-col-sections">
              {certificates.length > 0 && (
                <div>
                  <SectionHeading
                    eyebrow="05 / CONTINUOUS LEARNING"
                    title={
                      <>
                        Always <i>learning.</i>
                      </>
                    }
                  />
                  <div className="credential-list">
                    {certificates.map((c) => (
                      <div className="credential-row" key={c.id}>
                        <div className="credential-icon">
                          <Sparkles size={18} />
                        </div>
                        <div>
                          <h3>{c.title}</h3>
                          <p>
                            {c.issuer} · {dateLabel(c.issued_date)}
                          </p>
                        </div>
                        {(c.verification_url || c.file_url) && (
                          <a
                            href={c.verification_url || c.file_url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`View ${c.title}`}>
                            <ArrowUpRight size={17} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {services.length > 0 && (
                <div>
                  <SectionHeading
                    eyebrow="HOW I CAN HELP"
                    title={
                      <>
                        What I <i>do.</i>
                      </>
                    }
                  />
                  <div className="credential-list">
                    {services.map((s) => (
                      <div className="credential-row" key={s.id}>
                        <div className="credential-icon">
                          <Code2 size={18} />
                        </div>
                        <div>
                          <h3>{s.title}</h3>
                          <p>{s.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
        {/* ===== 07 CONTACT ===== */}
        <section className="section-pad contact-section" id="contact">
          <div className="container-max contact-grid">
            <div className="contact-left">
              <span className="eyebrow">
                <span className="eyebrow-line" />
                06 / LET'S CONNECT
              </span>
              <h2>
                Have something <i>in mind?</i>
              </h2>
              <p>
                Whether it's an opportunity, a collaboration, or just a friendly
                hello — my inbox is open.
              </p>
              <a className="contact-email" href={`mailto:${p?.email || ""}`}>
                {p?.email || "Email not configured"} <ArrowUpRight size={20} />
              </a>
              <div className="contact-extra">
                <span className="pulse-dot" /> Let's make something worth
                sharing.
              </div>
            </div>
            <div className="contact-form-card">
              <div className="card-heading">
                <MessageCircle size={20} />
                <span>Send a message</span>
              </div>
              <ContactForm />
            </div>
          </div>
        </section>
        <section className="comment-section section-pad">
          <div className="container-max comment-grid">
            <div>
              <SectionHeading
                eyebrow="07 / WORDS FROM VISITORS"
                title={
                  <>
                    Leave a <i>note.</i>
                  </>
                }
                desc="Feedback and thoughtful conversations are always welcome."
              />
              {comments.length ? (
                comments.map((c) => (
                  <div className="visitor-quote" key={c.id}>
                    <span>“</span>
                    <p>{c.comment}</p>
                    <small>— {c.name}</small>
                  </div>
                ))
              ) : (
                <p className="muted">
                  No approved notes yet. Be the first to share one.
                </p>
              )}
            </div>
            <div className="contact-form-card">
              <div className="card-heading">
                <MessageCircle size={20} />
                <span>Share your thoughts</span>
              </div>
              <ContactForm kind="comments" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter profile={p} settings={settings} />
    </>
  );
}
/** Entry for the / route: loading, failure and main content. */
export function Portfolio() {
  const { data, loading, error } = usePortfolio();
  if (loading) return <div className="status-screen">Loading portfolio…</div>;
  if (error)
    return (
      <div className="status-screen">
        <h1>Portfolio temporarily unavailable</h1>
        <p>{error}</p>
      </div>
    );
  return <PortfolioBody data={data || {}} />;
}
/** Detail route for /projects/:slug; finds a published project by its URL slug. */
export function ProjectDetails() {
  const { slug } = useParams();
  const { data, loading, error } = usePortfolio();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  if (loading) return <div className="status-screen">Loading project…</div>;
  const project = includeAtelierNorth(data?.projects).find((p) => p.slug === slug);
  if (error || !project)
    return (
      <div className="status-screen">
        <h1>Project not found</h1>
        <p>This project might not be published yet.</p>
        <Link to="/">Return home</Link>
      </div>
    );
  return (
    <>
      <PreviewBanner />
      <SiteHeader profile={data.profile} />
      <main className="container-max detail-page">
        <Link className="text-link" to="/#projects">
          <ChevronLeft size={16} /> All projects
        </Link>
        <span className="eyebrow detail-eyebrow">
          {project.category || "PROJECT"}
        </span>
        <h1>{project.title}</h1>
        <p className="detail-summary">{project.short_description}</p>
        <div className="detail-actions">
          {project.live_url && (
            <a
              className="button button-green"
              href={project.live_url}
              target="_blank"
              rel="noreferrer">
              View live project <ExternalLink size={17} />
            </a>
          )}
          {project.github_url && (
            <a
              className="button button-outline"
              href={project.github_url}
              target="_blank"
              rel="noreferrer">
              Source code <Github size={17} />
            </a>
          )}
        </div>
        {project.cover_url && (
          <img
            className="detail-cover"
            src={project.cover_url}
            alt={`${project.title} preview`}
          />
        )}
        {data.project_images?.filter((x) => x.project_id === project.id)
          .length > 0 && (
          <div className="detail-gallery">
            {data.project_images
              .filter((x) => x.project_id === project.id)
              .map((image) => (
                <figure key={image.id}>
                  <img
                    loading="lazy"
                    src={image.image_url}
                    alt={image.caption || `${project.title} screenshot`}
                  />
                  {image.caption && <figcaption>{image.caption}</figcaption>}
                </figure>
              ))}
          </div>
        )}
        <div className="detail-body">
          <h2>About this project</h2>
          <p>
            {project.description || "No further details have been published."}
          </p>
          <h3>Technologies</h3>
          <div className="tag-row flex flex-wrap">
            {(project.technologies || []).map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter profile={data.profile} settings={data.site_settings} />
    </>
  );
}
