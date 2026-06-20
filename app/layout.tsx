import type { Metadata } from "next";
import { poppins } from "@/lib/font";
import "./globals.css";
// import NetworkStatus from "@/components/NetworkStatus";


export const metadata: Metadata = {

  title: {
    default: "Kodash — Contract-First Workspace for Freelancers & Clients",
    template: "%s | Kodash",
  },
  
  description:
    "Kodash is a contract-first workspace where freelancers and clients agree on scope, lock funds in escrow, and release payment only when work is approved.",


  metadataBase: new URL("https://www.kodash.online"),


  alternates: {
    canonical: "/",
  },


  keywords: [
    "freelance escrow platform",
    "contract-first workspace",
    "freelancer client agreement",
    "secure freelance payments",
    "escrow for freelancers",
    "freelance contract tool",
  ],

  openGraph: {

    title: "Kodash — Contract-First Workspace for Freelancers & Clients",
    description:
      "Agree on scope, lock funds in escrow, and release payment only when work is approved. Bring your own freelancer or client — no marketplace needed.",
    url: "https://www.kodash.online",
    siteName: "Kodash",
    images: [
      {
  
        url: "https://www.kodash.online/contract.png",
        width: 1200,
        height: 630,
        alt: "Kodash — Secure contract and escrow workspace for freelancers and clients",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    
    title: "Kodash — Contract-First Workspace for Freelancers & Clients",
    description:
      "Agree on scope, lock funds in escrow, and release payment only when work is approved. Bring your own freelancer or client — no marketplace needed.",
    images: ["https://www.kodash.online/contract.png"],
  
  },

};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} antialiased bg-bgPrimary`}
      >
        {/* <NetworkStatus /> */}
        {children}
      </body>
    </html>
  );
}
