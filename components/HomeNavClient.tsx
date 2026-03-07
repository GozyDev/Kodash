import React from "react";
import Link from "next/link";
import Image from "next/image";
import User from "./User";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface Props {
  user: SupabaseUser | null;
}

const HomeNavClient = ({ user }: Props) => {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-b-cardCB bg-bgPrimary">
      <div className="mx-auto px-6 h-16 flex items-center justify-between ">
        <div className="text-2xl font-black tracking-tighter flex items-center">
          <Image src="/Logo.png" alt="Kodash Logo" width={40} height={40} />
          KODASH
        </div>

        <div className="hidden md:flex items-center gap-3 text-sm font-medium text-textNc">
          {user ? (
            <>
              <Link
                href="/dashboard/organizations"
                className="px-5 py-2 rounded butt transition-all"
              >
                Dashboard
              </Link>

              <User />
            </>
          ) : (
            <Link
              href="/dashboard/auth/sign_in"
              className="px-5 py-2 rounded-full butt transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default HomeNavClient;
