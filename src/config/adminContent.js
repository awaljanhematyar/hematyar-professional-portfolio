/**
 * ADMIN CONTENT CONFIGURATION
 *
 * This file is the master list of editable tables and form fields.
 * Each field is [databaseColumn, visibleLabel, inputType, required?].
 * Supported input types: text, textarea, number, date, url, checkbox,
 * tags (comma-separated), and asset:image / asset:pdf (Supabase Storage).
 *
 * To add an editor field:
 * 1. Verify that the database column actually exists.
 * 2. Add its definition under the correct table in `definitions`.
 * 3. Check RLS permissions and test Save Changes in the Admin Dashboard.
 *
 * This is UI configuration, NOT a database migration or security policy.
 */
import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  Code2,
  FileBadge,
  GraduationCap,
  Image,
  Layers3,
  Link2,
  Mail,
  MessageCircle,
  Settings,
  UserRound,
} from "lucide-react";

export const definitions = {
  skills: {
    label: "Skills",
    icon: Code2,
    fields: [
      ["name", "Skill name", "text", true],
      ["category", "Category", "text"],
      ["icon", "Icon name", "text"],
      ["sort_order", "Display order", "number"],
      ["published", "Published", "checkbox"],
    ],
  },
  projects: {
    label: "Projects",
    icon: Layers3,
    fields: [
      ["title", "Project title", "text", true],
      ["slug", "URL slug", "text", true],
      ["short_description", "Short description", "textarea"],
      ["description", "Detailed description", "textarea"],
      ["category", "Category", "text"],
      ["technologies", "Technologies (comma separated)", "tags"],
      ["cover_url", "Cover image URL", "asset:image"],
      ["github_url", "GitHub URL", "url"],
      ["live_url", "Live demo URL", "url"],
      ["featured", "Featured", "checkbox"],
      ["sort_order", "Display order", "number"],
      ["published", "Published", "checkbox"],
    ],
  },
  project_images: {
    label: "Project images",
    icon: Image,
    fields: [
      ["project_id", "Project ID", "text", true],
      ["image_url", "Image URL", "asset:image", true],
      ["caption", "Caption", "text"],
      ["sort_order", "Display order", "number"],
      ["published", "Published", "checkbox"],
    ],
  },
  experience: {
    label: "Experience",
    icon: BriefcaseBusiness,
    fields: [
      ["role", "Position", "text", true],
      ["organization", "Organization", "text", true],
      ["location", "Location", "text"],
      ["start_date", "Start date", "date"],
      ["end_date", "End date", "date"],
      ["description", "Description", "textarea"],
      ["sort_order", "Display order", "number"],
      ["published", "Published", "checkbox"],
    ],
  },
  education: {
    label: "Education",
    icon: GraduationCap,
    fields: [
      ["institution", "Institution", "text", true],
      ["degree", "Degree", "text", true],
      ["field", "Field of study", "text"],
      ["start_date", "Start date", "date"],
      ["end_date", "End date", "date"],
      ["description", "Description", "textarea"],
      ["sort_order", "Display order", "number"],
      ["published", "Published", "checkbox"],
    ],
  },
  certificates: {
    label: "Certificates",
    icon: FileBadge,
    fields: [
      ["title", "Certificate title", "text", true],
      ["issuer", "Issuing organization", "text", true],
      ["issued_date", "Issue date", "date"],
      ["description", "Description", "textarea"],
      ["verification_url", "Verification URL", "url"],
      ["file_url", "Certificate file URL", "asset:pdf"],
      ["sort_order", "Display order", "number"],
      ["published", "Published", "checkbox"],
    ],
  },
  services: {
    label: "Services",
    icon: ClipboardList,
    fields: [
      ["title", "Title", "text", true],
      ["description", "Description", "textarea"],
      ["icon", "Icon name", "text"],
      ["sort_order", "Display order", "number"],
      ["published", "Published", "checkbox"],
    ],
  },
  social_links: {
    label: "Social links",
    icon: Link2,
    fields: [
      ["platform", "Platform", "text", true],
      ["url", "Public URL", "url", true],
      ["sort_order", "Display order", "number"],
      ["published", "Published", "checkbox"],
    ],
  },
  profiles: {
    label: "Profile",
    icon: UserRound,
    single: true,
    fields: [
      ["full_name", "Full name", "text", true],
      ["headline", "Professional title", "text"],
      ["summary", "Short summary", "textarea"],
      ["bio", "Biography", "textarea"],
      ["location", "Location", "text"],
      ["email", "Public email", "email"],
      ["phone", "Phone (optional)", "text"],
      ["linkedin_url", "LinkedIn URL", "url"],
      ["github_url", "GitHub URL", "url"],
      ["profile_image_url", "Profile image URL", "asset:image"],
      ["cv_url", "CV PDF URL", "asset:pdf"],
      ["published", "Published", "checkbox"],
    ],
  },
  site_settings: {
    label: "Site settings",
    icon: Settings,
    single: true,
    fields: [
      ["site_title", "Site title", "text"],
      ["seo_description", "SEO description", "textarea"],
      ["footer_note", "Footer note", "text"],
    ],
  },
};
export const navigation = [
  ["overview", "Overview", BarChart3],
  ["profiles", "Profile", UserRound],
  ["skills", "Skills", Code2],
  ["projects", "Projects", Layers3],
  ["project_images", "Project Images", Image],
  ["experience", "Experience", BriefcaseBusiness],
  ["education", "Education", GraduationCap],
  ["certificates", "Certificates", FileBadge],
  ["services", "Services", ClipboardList],
  ["social_links", "Social Links", Link2],
  ["comments", "Comments", MessageCircle],
  ["contact_messages", "Messages", Mail],
  ["site_settings", "Site Settings", Settings],
];
export const firstField = (row, tab) =>
  row?.title ||
  row?.name ||
  row?.full_name ||
  row?.role ||
  row?.degree ||
  row?.institution ||
  row?.platform ||
  row?.site_title ||
  row?.project_id ||
  row?.email ||
  row?.id;
