import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#121214] border border-zinc-800 p-8 rounded-3xl text-center shadow-2xl">
        
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-orange-500/10 rounded-full text-orange-500">
            <ShoppingBag className="w-12 h-12" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Order Cancelled</h1>
        <p className="text-zinc-400 mb-8">
          No worries! Your payment was not processed. If you had trouble with the checkout, feel free to try again.
        </p>

        <div className="flex flex-col gap-3">
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-zinc-800 text-white py-3 rounded-xl font-semibold hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
          <button className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            Need help? Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}