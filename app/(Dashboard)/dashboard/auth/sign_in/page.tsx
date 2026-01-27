import { login } from "@/action/auth";
import Google from "@/components/Google";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-textNa">
      <form className="w-full max-w-md bg-cardC p-6 rounded-lg shadow-sm border border-cardCB">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-textNc mb-2">Welcome Back</h1>
          <p className="text-sm text-textNc/70">Sign in to your account</p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-textNc mb-1"
            >
              Email:
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 pb-4 bg-cardCB/50   focus:outline-none   focus:border-b focus:border-primaryC rounded"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-textNc mb-1"
            >
              Password:
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 pb-4 bg-cardCB/50   focus:outline-none   focus:border-b focus:border-primaryC rounded"
            />
          </div>
        </div>

        {/* Continue with Google Button */}
        <Google />

        <div className="flex gap-3 mt-6">
          <button
            formAction={login}
            className="flex-1  text-white py-2 px-4 rounded-md  transition-colors font-medium butt"
          >
            Log in
          </button>
        </div>

        {/* Signup Link Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-textNc/70">
            Don&apos;t have an account?{" "}
            <Link
              href="/dashboard/auth/sign_up"
              className="text-primaryC hover:text-primaryHC font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Forgot Password Link */}
        <div className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-textNc/70 hover:text-primaryC transition-colors"
          >
            Forgot your password?
          </Link>
        </div>
      </form>
    </div>
  );
}
