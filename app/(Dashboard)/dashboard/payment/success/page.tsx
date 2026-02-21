import Link from "next/link";
import { CheckCircle2 } from "lucide-react"; // npm install lucide-react

export default function SuccessPage() {
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

        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-zinc-400 mb-8">
          Thank you for your purchase. Your course has been added to your dashboard.
        </p>

        <div className="space-y-3">
          <Link 
            href="/"
            className="block w-full bg-[#fafafa] text-black py-3 rounded-xl font-semibold hover:bg-emerald-400 transition-colors"
          >
            Go to My Courses
          </Link>
          <p className="text-xs text-zinc-500">
            A receipt has been sent to your email.
          </p>
        </div>
      </div>
    </div>
  );
}