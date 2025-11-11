import { Link } from "react-router-dom";
import SignupForm from "../components/SignupForm";

const SignupPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100">
      <div className="w-full max-w-md space-y-6 rounded border bg-white p-6 shadow">
        <h1 className="text-center text-2xl font-semibold">Sign up</h1>
        <SignupForm />
        <p className="text-center text-sm text-slate-500">
          Have an account? <Link to="/login" className="text-slate-900">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;


