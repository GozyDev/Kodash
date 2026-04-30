'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const About = () => {
    const shouldReduceMotion = useReducedMotion()
    const cards = [
        {
            id: 'Work with total peace of mind',
            headline: 'Your trust is our top priority.',
            description:
                'We know that getting started on a new project takes confidence. That’s why we use a secure escrow system to keep project funds safe from the very beginning. Money only moves when everyone is happy with the final result, so you can focus on creating great things instead of worrying about payments.',
        },
        {
            id: 'Clear steps for big goals',
            headline: 'Stay on the same page, every step of the way.',
            description:
                'No one likes a project that feels confusing or never-ending. Kodash helps you break your big ideas into simple, clear milestones before the work even starts. This "contract-first" approach ensures that everyone knows exactly what to expect, making collaboration smooth and rewarding for everyone involved.',
        },
        {
            id: 'Built for people who build things',
            headline: 'Turning great ideas into real projects.',
            description:
                'Whether you’re a talented freelancer or a founder with a vision, we’re here to help you connect and grow. Kodash provides the reliable tools you need to build and scale your next big idea, fostering a community where accountability and helping each other succeed go hand-in-hand.',
        },
    ]

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
    }

    return (
        <section className="mx-auto max-w-[1400px] px-4 py-12">
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
                        className="rounded-xl border border-cardCB bg-cardC/50 p-4 shadow-sm relative"
                        variants={cardVariants}
                        transition={{
                            duration: shouldReduceMotion ? 0 : 0.65,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <p className="mb-3 text-sm font-semibold text-primaryC uppercase">{card.id}</p>
                        <h3 className="mb-3 text-xl font-medium text-textNc tracking-tighter">{card.headline}</h3>
                        <p className="text-sm leading-6 text-textNd">{card.description}</p>
                        <div className='w-20 h-20 rounded-full bg-primaryC/20    absolute bottom-5  right-10 blur-2xl'></div>
                    </motion.article>
                ))}
            </motion.div>
        </section>
    )
}

export default About    