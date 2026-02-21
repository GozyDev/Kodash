import Link from "next/link";
import { ArrowLeft, XCircle } from "lucide-react";

interface CancelPageProps { searchParams?: { return?: string } }

export default function CancelPage({ searchParams }: CancelPageProps) {
  let returnTo = searchParams?.return ? decodeURIComponent(searchParams.return) : "/dashboard";
  if (!returnTo.startsWith("/")) returnTo = `/${returnTo}`;

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#121214] border border-zinc-800 p-8 rounded-3xl text-center shadow-2xl">
        
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-500/10 rounded-full text-red-500">
            <XCircle className="w-12 h-12" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-zinc-400 mb-8">
          It looks like your checkout session did not complete. You can try again or return to the app using the button below.
        </p>

        <div className="flex flex-col gap-3">
          <Link 
            href={returnTo}
            className="flex items-center justify-center gap-2 w-full bg-zinc-800 text-white py-3 rounded-xl font-semibold hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to your app
          </Link>
          <button className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            Need help? Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}