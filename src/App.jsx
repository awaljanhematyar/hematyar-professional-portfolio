/**
 * ======================================================
 * FILE: src/App.jsx
 * ======================================================
 *
 * PURPOSE:
 * This file manages all application routes.
 *
 * PERFORMANCE OPTIMIZATION:
 * React.lazy() loads page components only when needed.
 *
 * SECURITY:
 * AdminGate protects the admin interface.
 *
 * IMPORTANT:
 * Supabase RLS and Edge Function authorization
 * enforce the actual backend security.
 *
 * ======================================================
 */

import { lazy, Suspense } from "react";

import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./contexts/AuthContext.jsx";

import { configured } from "./lib/supabase.js";

// ======================================================
// 01. PUBLIC PAGE LAZY IMPORTS
// ======================================================

// Loads the Portfolio page when someone visits "/".
const Portfolio = lazy(() =>
  import("./pages/Portfolio.jsx").then((module) => ({
    default: module.Portfolio,
  })),
);

// Loads project details when someone visits a project.
const ProjectDetails = lazy(() =>
  import("./pages/Portfolio.jsx").then((module) => ({
    default: module.ProjectDetails,
  })),
);

// ======================================================
// 02. ADMIN PAGE LAZY IMPORTS
// ======================================================

// Loads the Admin Login page only when needed.
const AdminLogin = lazy(() =>
  import("./pages/Admin.jsx").then((module) => ({
    default: module.AdminLogin,
  })),
);

// Loads the Admin Dashboard only when needed.
const AdminDashboard = lazy(() =>
  import("./pages/Admin.jsx").then((module) => ({
    default: module.AdminDashboard,
  })),
);

// ======================================================
// 03. PAGE LOADING COMPONENT
// ======================================================

/**
 * Displays a temporary message while a lazy page
 * is being downloaded.
 */

function PageLoader() {
  return <div className="status-screen">Loading page…</div>;
}

// ======================================================
// 04. ADMIN ROUTE PROTECTION
// ======================================================

/**
 * Protects private admin pages.
 *
 * Checks:
 * 1. Supabase configuration
 * 2. Authentication loading state
 * 3. Logged-in user
 * 4. Administrator permission
 */

function AdminGate({ children }) {
  const { loading, user, admin } = useAuth();

  // Check whether Supabase is configured.
  if (!configured) {
    return (
      <div className="status-screen">
        <h1>Admin not configured</h1>

        <p>Set Supabase environment variables and run the database migration first.</p>

        <a href="/">Return to website</a>
      </div>
    );
  }

  // Wait while checking authentication.
  if (loading) {
    return <div className="status-screen">Checking administrator access…</div>;
  }

  // Redirect visitors who are not logged in.
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Block users who do not have admin permission.
  if (!admin) {
    return (
      <div className="status-screen">
        <h1>Access denied</h1>

        <p>This account is not listed in admin_users.</p>

        <a href="/">Return to website</a>
      </div>
    );
  }

  // Allow authorized administrators.
  return children;
}

// ======================================================
// 05. APPLICATION ROUTES
// ======================================================

/**
 * Controls which page appears for each URL.
 *
 * Suspense displays PageLoader while React
 * downloads a lazy-loaded page component.
 */

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* PUBLIC HOMEPAGE */}

        <Route path="/" element={<Portfolio />} />

        {/* PROJECT DETAILS */}

        <Route path="/projects/:slug" element={<ProjectDetails />} />

        {/* ADMIN LOGIN */}

        <Route path="/admin/login" element={<AdminLogin />} />

        {/* PROTECTED ADMIN DASHBOARD */}

        <Route
          path="/admin/*"
          element={
            <AdminGate>
              <AdminDashboard />
            </AdminGate>
          }
        />

        {/* UNKNOWN ROUTES */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
