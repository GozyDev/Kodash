import Image from "next/image";


import { Settings } from "lucide-react";
import DropDownContent from "./DropDownContent";
import User from "./User";
import { SidebarTrigger } from "./ui/sidebar";

type Org = { id: string; name: string; plan?: string };

export default function OrgHeader({
  orgs = [],
  orgId,
}: {
  orgs?: Org[];
  orgId?: string;
}) {
  return (
    <header className="fixed top-0 left-0 w-full flex justify-between items-center  text-neutral-100 px-2 py-3 border-b border-cardCB/80 backdrop-blur-sm ">
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

        <div className="flex items-center gap-1">
          <p className="font-medium text-sm text-gray-100">
            {/* show active org name if present */}
            {orgs.find((o) => o.id === orgId)?.name ?? "Organizations"}
          </p>

         

          <DropDownContent orgs={orgs} /> 
        </div>

        <SidebarTrigger className="bg-cardC hover:bg-cardC/50" />

      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <button className="p-2 text-[12px] md:text-sm font-light border border-gray-800 rounded-lg hover:bg-gray-800">
            Feedback
          </button>
       
        </div>

        <User />
      </div>
    </header>
  );
}
