"use client"
import { Menu, X } from "lucide-react";

import React, { useState } from "react";

const HomeNavSideBar = () => {
      const [open, setOpen] = useState(false);
  return (
    <div>
      {/* Mobile Hamburger */}
      <button onClick={() => setOpen(true)} className="md:hidden text-textNc">
        <Menu size={28} />
      </button>

       {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

       {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-bgPrimary border-l border-cardCB z-50 transform transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 flex flex-col gap-6">
          {/* Close button */}
          <button className="self-end" onClick={() => setOpen(false)}>
            <X size={28} />
          </button>

          {/* Mobile Menu */}
      
        </div>
      </div>
    </div>
  );
};

export default HomeNavSideBar;
