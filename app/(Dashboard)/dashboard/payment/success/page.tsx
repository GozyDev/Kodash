import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

interface SuccessPageProps { searchParams?: { return?: string } }

export default function SuccessPage({ searchParams }: SuccessPageProps) {
  // compute return path from query parameter, default /dashboard
  let returnTo = searchParams?.return ? decodeURIComponent(searchParams.return) : "/dashboard";
  if (!returnTo.startsWith("/")) returnTo = `/${returnTo}`;

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#121214] border border-zinc-800 p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden">
        {/* Decorative Background Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 blur-[100px]" />
        
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-emerald-500/10 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Payment Completed</h1>
        <p className="text-zinc-400 mb-8">
          Your transaction went through successfully. You can return to your project or continue working in the app.
        </p>

        <div className="space-y-3">
          <Link 
            href={returnTo}
            className="block w-full bg-zinc-800 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Back to your app
          </Link>
        </div>
      </div>
    </div>
  );
}