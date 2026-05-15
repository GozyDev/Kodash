"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const About = () => {
  const shouldReduceMotion = useReducedMotion();
  const cards = [
    {
      id: "Work with total peace of mind",
      headline: "Your money doesn't move until you say so",
      description:
        "Fund the project upfront. It sits safely in escrow until the work meets your standard. No trust issues. No payment drama.",
    },
    {
      id: "Clear steps for big goals",
      headline: "No surprises. Just clear, agreed work",
      description:
        "Before anyone lifts a finger, both sides agree on exactly what gets delivered. Everyone knows what done looks like before it starts.",
    },
    {
      id: "Built for people who build things",
      headline: "Already know who you want to work with? Good.",
      description:
        "Kodash isn't a marketplace. Bring your own person, set up your workspace, and get to work without the middleman",
    },
  ];

  const cardVariants = {
    hidden: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.92,
      y: shouldReduceMotion ? 0 : 24,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
    },
  };

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-6 md:pb-12 ">
      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        transition={{
          staggerChildren: shouldReduceMotion ? 0 : 0.12,
          delayChildren: shouldReduceMotion ? 0 : 0.08,
        }}
      >
        {cards.map((card) => (
          <motion.article
            key={card.id}
            className="rounded border border-cardCB bg-cardC/50 p-4 shadow-sm relative"
            variants={cardVariants}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <h3 className="mb-3 text-xl font-medium text-textNc tracking-tighter">
              {card.headline}
            </h3>
            <p className="text-sm leading-6 text-textNd">{card.description}</p>
            <div className="w-20 h-20 rounded-full bg-primaryC/20    absolute bottom-5  right-10 blur-2xl"></div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
};

export default About;
