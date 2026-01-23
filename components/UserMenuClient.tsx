"use client";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

type User = {
    id: string;
    email: string | null;
    full_name?: string;
    avatar_url?: string;
};

export default function UserMenuClient({ user }: { user: User }) {
    const initials =
        user.full_name?.slice(0, 2) ??
        user.email?.slice(0, 2)?.toUpperCase() ??
        "U";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="relative cursor-pointer">
                    <Avatar className="w-9 h-9 border-2 border-transparent hover:border-[#327844] transition">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    {/* online dot */}
                    <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-neutral-900" />
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 border border-cardCB">
                {/* INFO SECTION */}
                <div className="px-3 py-2">
                    <div className="font-medium">{user.full_name ?? "User"}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>

                <DropdownMenuSeparator className="bg-cardCB" />

                {/* LOGOUT */}
                <DropdownMenuItem
                    className="cursor-pointer bg-red-500/50 hover:bg-red-500"
                    onClick={async () => {
                        await fetch("/api/logout", { method: "POST" });
                        window.location.href = "/login";
                    }}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
