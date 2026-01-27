import React from "react";
import Image from "next/image";
import { Settings } from "lucide-react";
import User from "./User";

const OrganizationHeader = async () => {
  return (
    <header className="flex justify-between items-center  text-neutral-100 px-6 py-3 border-b border-cardCB/80 backdrop-blur-sm">
      {/* Left Section - Logo and Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="">
            <Image
              src="/Logo.png"
              alt="Supabase Logo"
              width={35}
              height={35}
              className="text-white"
            />
          </div>
          <span className="font-light text-gray-300/50 text-lg">/</span>
        </div>

        <div className="flex items-center gap-2">
          <p className="font-medium text-sm text-gray-100">Organizations</p>
          {/* <ChevronDown className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-300" /> */}
        </div>
      </div>

      {/* Right Section - User Menu */}
      <div className="flex items-center gap-4">
        {/* Navigation Icons */}
        <div className="flex items-center gap-3 mr-2">
          <button className="p-2 text-sm font-light border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors group">
            Feedback
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors group">
            <Settings className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
          </button>
        </div>

        {/* User Avatar with Dropdown */}
        <User />
      </div>
    </header>
  );
};

export default OrganizationHeader;
