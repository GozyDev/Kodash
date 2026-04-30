'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const faqItems = [
    {
        question: 'How does Scale Dash keep payments safe?',
        answer:
            'Funds are held securely and only released when both sides confirm milestones or delivery terms are met.',
    },
    {
        question: 'Can I use Scale Dash for one-time and ongoing projects?',
        answer:
            'Yes. You can run one-off jobs or split long projects into milestones so payments and progress stay clear.',
    },
    {
        question: 'What happens if there is a disagreement on delivery?',
        answer:
            'Scale Dash records agreements and milestone history so both parties can resolve disputes with shared context.',
    },
    {
        question: 'Do clients and freelancers both see progress updates?',
        answer:
            'Yes. Both sides can track status updates in one place, which helps reduce confusion and improve trust.',
    },
]

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0)
    const shouldReduceMotion = useReducedMotion()

    const handleToggle = (index: number) => {
        setOpenIndex((current) => (current === index ? null : index))
    }

    return (
        <section className='mx-auto max-w-[1400px] px-4 py-20'>
            <div>
                <h2 className='text-5xl semi-bold text-center tracking-tighter'>Frequently Asked Questions</h2>
            </div>
            <div className='mx-auto mt-10 flex w-full max-w-4xl flex-col gap-4 py-10'>
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