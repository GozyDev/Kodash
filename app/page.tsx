  import Link from "next/link";
  import HomePage from "@/components/Hero";
  import HomeNav from "@/components/HomeNav";
import About from "@/components/About";
import WhatNext from "@/components/WhatNext";

  export default function Home() {
    return (
      <div className="min-h-screen text-textNa">
        <HomeNav />
        <HomePage />

        <About />
        <WhatNext />
        <footer className="border-t border-cardCB/50 bg-bgPrimary/80 text-textNc/80 py-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-center sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/privacy"
              className="text-sm text-textNc hover:text-primaryC transition-colors"
            >
              Privacy Policy
            </Link>
            <p className="text-sm text-textNc/70">
              © {new Date().getFullYear()} Scale Dash. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    );
  }
