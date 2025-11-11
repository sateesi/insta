import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100">
      <div className="w-full max-w-md space-y-6 rounded border bg-white p-6 shadow">
        <h1 className="text-center text-2xl font-semibold">Login</h1>
        <LoginForm />
        <p className="text-center text-sm text-slate-500">
          No account? <Link to="/signup" className="text-slate-900">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;


