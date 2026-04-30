'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const faqItems = [
    {
        question: 'What is Kodash and how is it different from platforms like Upwork?',
        answer:
            'Kodash is a contract-first workspace platform designed for people who already know who they want to work with. Instead of browsing jobs or bidding for work, you simply create a workspace, invite the other party, agree on the scope, and get started. It’s built for direct collaboration, not job searching.',
    },
    {
        question: 'Do I need to choose between being a client or a freelancer?',
        answer:
            'No, you don’t. Your role is decided per workspace. This means you can be a client in one project and a freelancer in another, depending on what you’re working on.',
    },
    {
        question: 'Can freelancers invite clients to Kodash?',
        answer:
            'Yes. If you already have a client outside the platform, you can invite them into a workspace on Kodash to manage the project in a more structured and secure way.',
    },
    {
        question: 'Is Kodash a job marketplace?',
        answer:
            'No. Kodash is not a job board. You won’t find job listings or bidding systems here. It’s designed for people who already have work agreements and want a better way to manage them.',
    },

    {
        question: 'How does payment work?',
        answer:
            'Before any work begins, the client funds the project. The payment is securely held in escrow, ensuring that the freelancer knows the project is funded and the client only releases payment when satisfied.',
    },
    {
        question: 'What is a “definition of done”?',
        answer:
            'It’s a clear outline created by the freelancer that explains exactly what will be delivered. The client reviews and approves it before work starts, so both sides are fully aligned.',
    },
    {
        question: 'What happens after the work is delivered?',
        answer:
            'The client reviews the work and can either approve it and release payment or request revisions if changes are needed.',
    },
    {
        question: 'What if there’s a disagreement?',
        answer:
            'If there’s an issue with delivery or revisions, either party can raise a dispute. This ensures that both sides have a fair way to resolve conflicts.',
    },
    {
        question: 'Why should I use Kodash instead of handling projects privately?',
        answer:
            'Kodash brings structure, clarity, and security to your workflow. It helps you avoid misunderstandings, ensures payments are protected, and keeps everything organized in one place.',
    },
]

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0)
    const shouldReduceMotion = useReducedMotion()

    const handleToggle = (index: number) => {
        setOpenIndex((current) => (current === index ? null : index))
    }

    return (
        <section className='mx-auto max-w-[1400px] px-4 py-10 md:py-20'>
            <div>
                <h2 className='text-3xl md:text-5xl semi-bold text-center tracking-tighter'>Frequently Asked Questions</h2>
            </div>
            <div className='mx-auto mt-10 flex w-full max-w-4xl flex-col gap-4 md:py-5'>
                {faqItems.map((item, index) => {
                    const isOpen = openIndex === index
                    const contentId = `faq-answer-${index}`
                    const buttonId = `faq-button-${index}`

                    return (
                        <button
                            key={item.question}
                            type='button'
                            onClick={() => handleToggle(index)}
                            className='w-full rounded-2xl border border-cardCB bg-cardC/60 px-6 py-5 text-left transition-colors hover:bg-cardC'
                            aria-expanded={isOpen}
                            aria-controls={contentId}
                            id={buttonId}
                        >
                            <div className='flex items-center justify-between gap-4'>
                                <h3 className='text-lg font-medium text-textNa'>{item.question}</h3>
                                <motion.span
                                    className='text-2xl leading-none text-textNc'
                                    animate={shouldReduceMotion ? { opacity: 1 } : { rotate: isOpen ? 45 : 0 }}
                                    transition={{
                                        duration: shouldReduceMotion ? 0 : 0.3,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                >
                                    +
                                </motion.span>
                            </div>
                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        id={contentId}
                                        role='region'
                                        aria-labelledby={buttonId}
                                        initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                                        transition={{
                                            duration: shouldReduceMotion ? 0 : 0.35,
                                            ease: [0.22, 1, 0.36, 1],
                                        }}
                                        className='overflow-hidden'
                                    >
                                        <p className='mt-4 text-sm leading-6 text-textNb'>{item.answer}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}

export default FAQ