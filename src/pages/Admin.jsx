import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  FileText,
  Layers3,
  LoaderCircle,
  LogOut,
  Mail,
  MessageCircle,
  PanelLeft,
  Plus,
  Save,
  Shield,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { configured, supabase } from "../lib/supabase.js";
import {
  readAdmin,
  removeRecord,
  retryNotification,
  saveRecord,
  uploadPublicAsset,
} from "../lib/api.js";
import { definitions, navigation, firstField } from "../config/adminContent.js";

/** Status component used consistently by editors and moderation screens. */
function Alert({ type = "info", children }) {
  return children ? (
    <p className={`admin-alert ${type}`} role="status">
      {children}
    </p>
  ) : null;
}

/** Login screen; real permission checks are enforced by Supabase RLS. */
export function AdminLogin() {
  const { user, admin, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (admin && !loading) navigate("/admin/dashboard", { replace: true });
  }, [admin, loading, navigate]);
  async function submit(e) {
    e.preventDefault();
    if (!configured) return;
    setError("");
    setBusy(true);
    try {
      const { error: e } = await signIn(email, password);
      if (e) throw e;
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-screen">
      <div className="login-layout">
        <Link to="/" className="login-back">
          <ArrowLeft size={17} /> Back to portfolio
        </Link>
        <div className="login-mark">
          AH<span>.</span>
        </div>
        <span className="eyebrow">PORTFOLIO CONTENT STUDIO</span>
        <h1>
          Welcome <i>back.</i>
        </h1>
        <p>Sign in to manage your portfolio, projects and messages.</p>
        {!configured ? (
          <Alert type="error">
            Supabase has not been configured. Add your VITE_SUPABASE_* variables
            and apply the SQL migration.
          </Alert>
        ) : null}
        {user && !admin && !loading ? (
          <Alert type="error">
            This account is signed in but has not been granted administrator
            access.
          </Alert>
        ) : null}
        <form className="admin-login-form" onSubmit={submit}>
          <label>
            Email address
            <input
              required
              type="email"
              autoComplete="username"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button
            className="button button-green full-width"
            disabled={busy || !configured}>
            {busy ? "Signing in…" : "Sign in to dashboard"}{" "}
            <ArrowUpRight size={17} />
          </button>
        </form>
        <Alert type="error">{error}</Alert>
        <p className="login-foot">
          Administrator accounts are created in Supabase and allowlisted in{" "}
          <code>admin_users</code>. Public sign-up is disabled.
        </p>
      </div>
    </main>
  );
}
/** Dashboard metrics are computed from real database queries, not mock values. */
function DashboardOverview({ openTab }) {
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    Promise.all(
      ["projects", "skills", "comments", "contact_messages"].map(readAdmin),
    )
      .then(([projects, skills, comments, messages]) => {
        if (alive)
          setCounts({
            projects: projects.length,
            published: projects.filter((x) => x.published).length,
            skills: skills.length,
            pending: comments.filter((x) => x.status === "pending").length,
            messages: messages.length,
            unread: messages.filter((x) => !x.is_read).length,
            failed: messages.filter((x) => x.notification_status === "failed")
              .length,
          });
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, []);
  const stats = counts
    ? [
        ["Published projects", counts.published, Layers3],
        ["Skills listed", counts.skills, Code2],
        ["Pending comments", counts.pending, MessageCircle],
        ["Unread messages", counts.unread, Mail],
        ["Total contact messages", counts.messages, Mail],
        ["Failed notifications", counts.failed, AlertTriangle],
      ]
    : [];
  return (
    <>
      <div className="admin-welcome">
        <div>
          <span className="eyebrow">DASHBOARD OVERVIEW</span>
          <h2>
            Everything, <i>in one place.</i>
          </h2>
          <p>Manage your website and follow new enquiries.</p>
        </div>
        <a
          className="button button-outline"
          href="/"
          target="_blank"
          rel="noreferrer">
          View website <ArrowUpRight size={17} />
        </a>
      </div>
      {error && <Alert type="error">{error}</Alert>}
      {counts ? (
        <div className="stat-grid grid">
          {stats.map(([label, count, Icon]) => (
            <div className="stat-card" key={label}>
              <span className="stat-top">
                <span>{label}</span>
                <Icon size={20} />
              </span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-card">Loading real database statistics…</div>
      )}
      <div className="quick-start">
        <h3>Quick actions</h3>
        <div className="quick-grid grid">
          {[
            ["projects", "Add a project", Plus],
            ["skills", "Manage skills", Code2],
            ["contact_messages", "Review messages", Mail],
            ["comments", "Moderate comments", MessageCircle],
          ].map(([tab, label, Icon]) => (
            <button key={tab} onClick={() => openTab(tab)}>
              <Icon size={19} />
              <span>{label}</span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
/**
 * Generic database record editor.
 * Its fields are controlled by src/config/adminContent.js.
 * Upload controls save files to Supabase Storage and store the resulting URL.
 */
function RecordForm({ tab, item, onSaved, onCancel }) {
  const def = definitions[tab];
  const [form, setForm] = useState(() => ({ ...item }));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");
  // Reset the editor when switching from one record to another.
  useEffect(() => {
    setForm({ ...item });
  }, [item]);
  async function onFile(field, file) {
    if (!file) return;
    setError("");
    setUploading(field);
    try {
      const url = await uploadPublicAsset(file, field.replace("_url", ""));
      setForm((v) => ({ ...v, [field]: url }));
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading("");
    }
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const record = {};
      // Convert HTML input values into the shapes expected by PostgreSQL.
      for (const [key, , kind] of def.fields) {
        let value = form[key];
        if (kind === "checkbox") value = Boolean(value);
        else if (kind === "number")
          value = value === "" || value === undefined ? 0 : Number(value);
        else if (kind === "tags")
          value = Array.isArray(value)
            ? value
            : String(value || "")
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean);
        else value = value === "" || value === undefined ? null : value;
        record[key] = value;
      }
      if (def.single) {
        const { error: upsertError } = await supabase
          .from(tab)
          .upsert({ ...record, id: true }, { onConflict: "id" });
        if (upsertError) throw upsertError;
      } else await saveRecord(tab, record, item?.id || null);
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="editor-panel">
      <div className="editor-header">
        <div>
          <span className="eyebrow">CONTENT EDITOR</span>
          <h3>
            {def.single ? "Edit" : item?.id ? "Edit" : "New"}{" "}
            {def.label.toLowerCase()}
          </h3>
        </div>
        {!def.single && (
          <button
            className="icon-button"
            onClick={onCancel}
            aria-label="Close editor">
            <X size={19} />
          </button>
        )}
      </div>
      <form className="editor-form" onSubmit={submit}>
        {def.fields.map(([key, label, kind, required]) => (
          <label key={key} className={kind === "checkbox" ? "check-label" : ""}>
            {kind === "checkbox" ? (
              <>
                <input
                  type="checkbox"
                  checked={Boolean(form[key])}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, [key]: e.target.checked }))
                  }
                />
                {label}
              </>
            ) : (
              <>
                {label}
                {kind === "textarea" ? (
                  <textarea
                    rows="4"
                    required={required}
                    value={form[key] ?? ""}
                    onChange={(e) =>
                      setForm((v) => ({ ...v, [key]: e.target.value }))
                    }
                  />
                ) : (
                  <input
                    type={
                      kind.startsWith("asset:")
                        ? "url"
                        : kind === "tags"
                          ? "text"
                          : kind
                    }
                    required={required}
                    placeholder={
                      kind === "tags" ? "React, Supabase, Tailwind" : undefined
                    }
                    value={
                      kind === "tags"
                        ? Array.isArray(form[key])
                          ? form[key].join(", ")
                          : form[key] || ""
                        : (form[key] ?? "")
                    }
                    onChange={(e) =>
                      setForm((v) => ({ ...v, [key]: e.target.value }))
                    }
                  />
                )}
                {kind.startsWith("asset:") && (
                  <div className="asset-upload">
                    <label className="file-picker">
                      <Upload size={14} />
                      {uploading === key ? "Uploading…" : "Upload file"}
                      <input
                        disabled={Boolean(uploading)}
                        type="file"
                        accept={
                          kind === "asset:pdf"
                            ? "application/pdf"
                            : "image/png,image/jpeg,image/webp"
                        }
                        onChange={(e) => onFile(key, e.target.files?.[0])}
                      />
                    </label>
                    {form[key] && (
                      <a href={form[key]} target="_blank" rel="noreferrer">
                        View current file <ArrowUpRight size={13} />
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </label>
        ))}
        <Alert type="error">{error}</Alert>
        <div className="editor-actions">
          {!def.single && (
            <button
              type="button"
              className="button button-outline"
              onClick={onCancel}>
              Cancel
            </button>
          )}
          <button
            disabled={busy || Boolean(uploading)}
            className="button button-green"
            type="submit">
            {busy ? "Saving…" : "Save changes"} <Save size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
/** List/create/edit/delete interface shared by all content tables. */
function ContentManager({ tab }) {
  const def = definitions[tab];
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await readAdmin(tab));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tab]);
  useEffect(() => {
    load();
    setEditing(null);
    setNote("");
  }, [load]);
  async function erase(row) {
    if (!window.confirm(`Permanently delete "${firstField(row, tab)}"?`))
      return;
    try {
      await removeRecord(tab, row.id);
      setNote("Record deleted.");
      load();
    } catch (e) {
      setError(e.message);
    }
  }
  const formItem = def.single ? rows[0] || {} : editing;
  return (
    <>
      <div className="admin-section-head">
        <div>
          <span className="eyebrow">CONTENT MANAGEMENT</span>
          <h2>{def.label}</h2>
          <p>
            Manage content in Supabase. Changes to published records appear on
            your website.
          </p>
        </div>
        {!def.single && (
          <button
            className="button button-green"
            onClick={() => setEditing({ published: true, sort_order: 0 })}>
            Add new <Plus size={17} />
          </button>
        )}
      </div>
      <Alert type="error">{error}</Alert>
      <Alert type="success">{note}</Alert>
      <div className={`manager-layout ${def.single ? "single" : ""}`}>
        {!def.single && (
          <div className="admin-card table-card">
            <div className="table-heading">
              <h3>
                {def.label} <span>{rows.length}</span>
              </h3>
              <button
                onClick={load}
                className="icon-button"
                aria-label="Refresh records">
                ↻
              </button>
            </div>
            {loading ? (
              <p className="admin-empty">Loading records…</p>
            ) : rows.length === 0 ? (
              <div className="admin-empty">
                No records yet. Add your first {def.label.toLowerCase()} item.
              </div>
            ) : (
              <div className="records-list">
                {rows.map((row) => (
                  <div
                    className={`record-row ${editing?.id === row.id ? "active" : ""}`}
                    key={row.id}>
                    <div className="record-information">
                      <strong>{firstField(row, tab)}</strong>
                      <span>
                        {row.category ||
                          row.issuer ||
                          row.organization ||
                          row.location ||
                          row.url ||
                          row.caption ||
                          row.status ||
                          "Content record"}
                      </span>
                    </div>
                    <span
                      className={`record-status ${row.published ? "on" : ""}`}>
                      {row.published ? "LIVE" : "DRAFT"}
                    </span>
                    <button
                      className="record-edit"
                      onClick={() => {
                        setEditing(row);
                        setNote("");
                      }}>
                      Edit
                    </button>
                    <button
                      className="icon-button danger"
                      onClick={() => erase(row)}
                      aria-label={`Delete ${firstField(row, tab)}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {(def.single || editing) && (
          <RecordForm
            key={`${tab}-${editing?.id || "new"}-${def.single ? rows.length : "edit"}`}
            tab={tab}
            item={formItem}
            onSaved={() => {
              setNote("Changes saved successfully.");
              setEditing(null);
              load();
            }}
            onCancel={() => setEditing(null)}
          />
        )}
      </div>
    </>
  );
}
/** Read and moderate comments and contact messages inside Admin. */
function Moderation({ tab }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await readAdmin(tab));
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tab]);
  useEffect(() => {
    load();
  }, [load]);
  async function patch(id, data) {
    try {
      const { error } = await supabase.from(tab).update(data).eq("id", id);
      if (error) throw error;
      await load();
    } catch (e) {
      setError(e.message);
    }
  }
  async function erase(id) {
    if (!confirm("Delete this permanently?")) return;
    try {
      await removeRecord(tab, id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }
  async function retry(id) {
    try {
      await retryNotification(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }
  const isComments = tab === "comments";
  const display = rows.filter(
    (x) =>
      (filter === "all" ||
        (isComments
          ? x.status === filter
          : filter === "unread"
            ? !x.is_read
            : x.notification_status === "failed")) &&
      [x.name, x.email, x.subject, x.comment, x.message].some((v) =>
        String(v || "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
  );
  return (
    <>
      <div className="admin-section-head">
        <div>
          <span className="eyebrow">INBOX & MODERATION</span>
          <h2>{isComments ? "Visitor comments" : "Contact messages"}</h2>
          <p>
            {isComments
              ? "Approve thoughtful comments before they appear publicly."
              : "Messages are private. Notification failures do not delete messages."}
          </p>
        </div>
      </div>
      <Alert type="error">{error}</Alert>
      <div className="filter-row">
        <input
          className="inbox-search"
          type="search"
          aria-label="Search messages and comments"
          placeholder="Search name, email or content…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {(isComments
          ? ["all", "pending", "approved", "rejected", "hidden"]
          : ["all", "unread", "failed"]
        ).map((f) => (
          <button
            className={filter === f ? "active" : ""}
            key={f}
            onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="admin-card">Loading records…</div>
      ) : display.length === 0 ? (
        <div className="admin-card admin-empty">
          No records match this filter.
        </div>
      ) : (
        <div className="inbox-list grid">
          {display.map((row) => (
            <article className="admin-card inbox-card" key={row.id}>
              <div className="inbox-top">
                <div>
                  <strong>{row.name}</strong>
                  <span>{row.email}</span>
                </div>
                <small>{new Date(row.created_at).toLocaleString()}</small>
              </div>
              {!isComments && <h3>{row.subject}</h3>}
              <p>{isComments ? row.comment : row.message}</p>
              <div className="inbox-actions">
                {isComments ? (
                  <>
                    <span className="inbox-state">{row.status}</span>
                    {["approved", "rejected", "hidden"]
                      .filter((x) => x !== row.status)
                      .map((s) => (
                        <button
                          key={s}
                          onClick={() => patch(row.id, { status: s })}>
                          {s === "approved"
                            ? "Approve"
                            : s === "rejected"
                              ? "Reject"
                              : "Hide"}
                        </button>
                      ))}
                  </>
                ) : (
                  <>
                    <span className="inbox-state">
                      Email: {row.notification_status}
                    </span>
                    {row.notification_status !== "sent" && (
                      <button onClick={() => retry(row.id)}>
                        Retry notification
                      </button>
                    )}
                    <button
                      onClick={() => patch(row.id, { is_read: !row.is_read })}>
                      {row.is_read ? "Mark unread" : "Mark read"}
                    </button>
                  </>
                )}
                <button className="delete-action" onClick={() => erase(row.id)}>
                  Delete <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
/** Admin layout; ?tab=... decides which content module is visible. */
export function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "overview";
  const [open, setOpen] = useState(false);
  const go = (t) => {
    setParams(t === "overview" ? {} : { tab: t });
    setOpen(false);
  };
  async function logout() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }
  return (
    <div className="admin-shell flex">
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <Link to="/" className="admin-brand">
          <span className="logo-mark">
            AH<span>.</span>
          </span>
          <span>
            CONTENT
            <br />
            <b>STUDIO</b>
          </span>
        </Link>
        <div className="admin-sidebar-label">WORKSPACE</div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {navigation.map(([id, label, Icon]) => (
            <button
              key={id}
              className={id === tab ? "active" : ""}
              onClick={() => go(id)}>
              <Icon size={18} />
              <span>{label}</span>
              {id === tab && <ChevronRight size={15} className="nav-chevron" />}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-user">
            <span className="admin-user-avatar">
              <Shield size={17} />
            </span>
            <div>
              <strong>Administrator</strong>
              <small>{user?.email}</small>
            </div>
          </div>
          <button className="admin-logout" onClick={logout}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="mobile-toggle"
            onClick={() => setOpen(true)}
            aria-label="Open admin navigation">
            <PanelLeft size={22} />
          </button>
          <div className="admin-breadcrumb">
            PORTFOLIO <ChevronRight size={13} />{" "}
            <b>{navigation.find(([id]) => id === tab)?.[1] || "Overview"}</b>
          </div>
          <span className="admin-online">
            <span className="tiny-dot" /> Connected to Supabase
          </span>
        </header>
        <div className="admin-content" key={tab}>
          {tab === "overview" ? (
            <DashboardOverview openTab={go} />
          ) : definitions[tab] ? (
            <ContentManager tab={tab} />
          ) : ["comments", "contact_messages"].includes(tab) ? (
            <Moderation tab={tab} />
          ) : (
            <p>Section not found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
