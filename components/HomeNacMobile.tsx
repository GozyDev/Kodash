import Link from "next/link";
import Image from "next/image";
import User from "./User";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface Props {
  user: SupabaseUser | null;
}

const HomeNavClientMobile = ({ user }: Props) => {
  return (
    <>
      <nav className="fixed md:hidden top-0 w-full z-50 border-b border-b-cardCB bg-bgPrimary">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <Image src="/Logo.png" alt="Kodash Logo" width={40} height={40} />
            KODASH
          </div>

          {user ? (
            <>
              <div className="flex gap-3">
                <User />
                <Link
                  href="/dashboard/organizations"
                  className="text-sm px-5 py-2 rounded butt transition-all"
                >
                  Dashboard
                </Link>
              </div>
            </>
          ) : (
            <Link
              href="/dashboard/auth/sign_in"
              className="text-sm px-5 py-2 rounded butt transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default HomeNavClientMobile;
