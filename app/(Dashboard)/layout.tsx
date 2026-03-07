import type { Metadata } from "next";
import { poppins } from "@/lib/font";
import { ToastContainer } from "react-toastify";
import "../globals.css";

export const metadata: Metadata = {
  title: "Kodash",
  description:
    "Kodash is a contract first platform for client and freelancer to make agreement upfront before work actually  start",

  // Open Graph metadata for link previews
  openGraph: {
    title: "Koadash",
    description:
      "Kodash is a contract first platform for client and freelancer to make agreement upfront before work actually  start",
    url: "https://kodash-one.vercel.app/", // your site URL
    siteName: "Koadash",
    images: [
      {
        url: "/contract.png", // the image shown in link previews
        width: 1200,
        height: 630,
        alt: "Koadash Platform Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter card metadata
  twitter: {
    card: "summary_large_image",
    title: "Koadash",
    description:
      "Kodash is a contract first platform for client and freelancer to make agreement upfront before work actually  start",
    images: ["/openGraph.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${poppins.className} antialiased `}>
      {children}
      <ToastContainer theme="dark" position="bottom-right" />
    </div>
  );
}
