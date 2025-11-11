import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-semibold">
              InstaPOC
            </Link>
            <nav className="flex gap-3 text-sm text-slate-600">
              <Link to="/">Feed</Link>
              <Link to={`/profile/${user?.id ?? ""}`}>Profile</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span>@{user?.username}</span>
            <button onClick={handleLogout} className="rounded bg-slate-900 px-3 py-1 text-white">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

