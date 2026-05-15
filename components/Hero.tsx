"use client"

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { alfa_slab_one } from "@/lib/font";
import KodashHeroCard from "./Kodashherocard";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const handleStartWorkspace = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/user");
      const data = await res.json();

      if (data.user) {
        router.push("/dashboard/organizations");
      } else {
        router.push("/dashboard/auth/sign_in");
      }
    } catch (error) {
      router.push("/dashboard/auth/sign_in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <section className="pt-30 pb-10 md:pt-40 md:pb-32 px-6 overflow-hidden relative">
        <div className="z-10 relative ">
          {
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="md:mx-auto w-max mb-10 border border-cardCB bg-black/30 px-6 py-2 rounded flex items-center gap-3"
            >
              <span className="w-3 h-3 bg-primaryC/10 border  border-primaryC animate-pulse rounded-full" />
              <var className="text-[14px]">
                Contract-First Workspace
              </var>
            </motion.div>
          }
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-5xl md:text-[70px] font-bold tracking leading-[1.1] mb-3 md:text-center ${alfa_slab_one.className}`}
          >
            You Found the Right Person. Now Work Safely
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-textNc max-w-3xl mb-10 leading-relaxed md:text-center md:mx-auto"
          >
            Invite whoever you&apos;re working with, agree on the scope, pay into
            escrow. Funds release when the job is done. Simple.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col-reverse sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={handleStartWorkspace}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-4 butt tracking-wide font-medium rounded transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : "Create Your Workspace"}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button className="w-full sm:w-auto px-8 py-4   tracking-wide font-medium transition-all rounded bg-primary">
              See How It Works
            </button>
          </motion.div>
        </div>

        {/* {!videoLoaded && (
          <div className=" bg-cardC animate-pulse rounded  mt-17 p-2 md:p-6 border-2 border-primaryC/50 max-w-7xl mx-auto">
            <Image
              src="/contract.png"
              alt=""
              width={100}
              height={100}
              className="w-full"
            ></Image>
          </div>
        )}

        {
          <div
            className={`md:w-max mx-auto bg-cardC mt-17 p-2 md:p-6 rounded border-2 border-primaryC/50 ${videoLoaded ? "block" : "hidden"}`}
          >
            <div className="relative">
              <video
                src="/contract.mp4"
                className="object-contain rounded"
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                onCanPlay={() => setVideoLoaded(true)}
              />
            </div>
          </div>
        } */}

        <KodashHeroCard />
      </section>
    </div>
  );
}
