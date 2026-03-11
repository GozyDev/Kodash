"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="">
      {/* Hero Section */}
      <section className="relative pt-30 pb-20 md:pt-35 md:pb-32 px-6 overflow-hidden">
        <Image
          src="/grid.png"
          alt=""
          width={60}
          height={60}
          className="w-full absolute opacity-70"
        ></Image>

        <div className="w-[400px] h-[400px] bg-primaryC/10 absolute right-[500px] rounded-full blur-2xl animate-pulse"></div>
        <section className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primaryC/10 border border-primaryC/20 text-primaryC text-xs font-bold tracking-widest uppercase mb-8"
            >
              <Zap size={14} /> Now in Private Beta
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-[89px] font-black tracking-tight leading-[1.1] mb-8"
            >
              Secure Freelance Contracts with Kodash
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-textNd max-w-2xl mb-10 leading-relaxed"
            >
              Connect with clients, agree on terms, get paid securely through
              escrow, and resolve disputes easily. Kodash makes frelancing safe
              and reliable for both clients and freelancers.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col-reverse sm:flex-row gap-4"
            >
              <button className="w-full sm:w-auto px-8 py-4 butt font-bold rounded-xl transition-all flex items-center justify-center gap-2 group">
                Start Your Workspace{" "}
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-cardC border-cardCB font-bold rounded-xl transition-all">
                Watch Demo
              </button>
            </motion.div>
          </div>
          <img
            src="/contract.png"
            alt=""
            className="md:w-1/2 w-full opacity-80 object-cover rounded"
          />
        </section>
      </section>
    </div>
  );
}