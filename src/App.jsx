/**
 * CLIENT ROUTES
 * Public pages are open; AdminGate checks current auth state and admin role.
 * IMPORTANT: this frontend check is UX only, not the security boundary.
 * Supabase RLS and Edge Function authorization must protect the real data.
 */
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import { Portfolio, ProjectDetails } from "./pages/Portfolio.jsx";
import { AdminDashboard, AdminLogin } from "./pages/Admin.jsx";
import { configured } from "./lib/supabase.js";

/** Only admins may access the dashboard; the database enforces permissions too. */
function AdminGate({ children }) {
  const { loading, user, admin } = useAuth();

  // Public environment variables must be configured before attempting login.
  if (!configured) {
    return (
      <div className="status-screen">
        <h1>Admin not configured</h1>
        <p>Set Supabase environment variables and run the database migration first.</p>
        <a href="/">Return to website</a>
      </div>
    );
  }

  if (loading) {
    return <div className="status-screen">Checking administrator access…</div>;
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  if (!admin) {
    return (
      <div className="status-screen">
        <h1>Access denied</h1>
        <p>This account is not listed in admin_users.</p>
        <a href="/">Return to website</a>
      </div>
    );
  }

  return children;
}

/** Public pages + authenticated admin pages. */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/projects/:slug" element={<ProjectDetails />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/*"
        element={
          <AdminGate>
            <AdminDashboard />
          </AdminGate>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
