"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap ,Mouse} from "lucide-react";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartWorkspace = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/user");
      const data = await res.json();

      if (data.user) {
        // User is logged in, route to dashboard
        router.push("/dashboard/organizations");
      } else {
        // User is not logged in, route to sign in
        router.push("/dashboard/auth/sign_in");
      }
    } catch (error) {
      // If there's an error, assume not logged in
      router.push("/dashboard/auth/sign_in");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="">
      {/* Hero Section */}
      <section className=" pt-30 pb-20 md:pt-69 md:pb-32 px-6 overflow-hidden relative">
        {/* <Image
          src="/grid.png"
          alt=""
          width={60}
          height={60}
          className="w-full absolute opacity-70"
        ></Image>

        <div className="w-[400px] h-[400px] bg-primaryC/10 absolute right-[500px] rounded-full blur-2xl animate-pulse"></div> */}
        
          <div className=" z-10 relative ">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="md:mx-auto  w-max mb-3 "
            >
              <span className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-primaryC/50  text-textNc text-xs font-bold tracking-widest uppercase ">
                <Zap size={14} /> Now in Private Beta
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-[80px] font-black tracking-tight leading-[1.1] mb-3 md:text-center"
            >
              Secure Freelance Contracts with Kodash
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-textNc max-w-2xl mb-10 leading-relaxed md:text-center md:mx-auto"
            >
              Connect with clients, agree on terms, get paid securely through
              escrow, and resolve disputes easily. Kodash makes frelancing safe
              and reliable for both clients and freelancers.
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
                className="w-full sm:w-auto px-8 py-4 butt font-bold rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading..." : "Start Your Workspace"}{" "}
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

       

          <div className="absolute -z-0 left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-max">
            <div className="w-full relative">
              <video
                src="/contract.mp4"
                className=" object-cover -z-0"
                autoPlay
                muted
                loop
                playsInline
              ></video>
              <div className="bg-bgPrimary/85 w-full h-full absolute top-0 left-0"/>
              <button className="bg-primaryC/50 backdrop-blur-sm w-16 h-16 absolute right-4.5 bottom-2 rounded-full md:flex items-center justify-center hidden">
                
              <Mouse className=" animate-bounce text-sm" />
              </button>
            </div>
          </div>
        </section>
    
    </div>
  );
}