import {signup } from "@/action/auth";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bgPrimary px-4">
      <form className="w-full max-w-md bg-cardC p-6 rounded-lg shadow-sm border border-cardCB text-textNa">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Welcome</h1>
            <p className="text-sm text-textNc/70">Sign up for an account</p>
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
              className="w-full px-3 py-2 pb-4 bg-cardCB   focus:outline-none   focus:border-b focus:border-primaryC rounded"
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
              className="w-full px-3 py-2 pb-4 bg-cardCB   focus:outline-none   focus:border-b focus:border-primaryC rounded" 
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            formAction={signup}
            className="flex-1 bg-primaryC text-white py-2 px-4 rounded-md hover:bg-primaryHC transition-colors font-medium"
          >
            Sign up
          </button>
        </div>

        {/* Login Link - Only Addition */}
        <div className="mt-6 text-center">
          <p className="text-sm text-textNc/70">
            Already have an account?{" "}
            <Link
              href="/dashboard/auth/sign_in"
              className="text-primaryC hover:text-primaryHC font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
