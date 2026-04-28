'use client'

import React, { useState } from 'react'

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

                    return (
                        <button
                            key={item.question}
                            type='button'
                            onClick={() => handleToggle(index)}
                            className='w-full rounded-2xl border border-cardCB bg-cardC/60 px-6 py-5 text-left transition-colors hover:bg-cardC'
                        >
                            <div className='flex items-center justify-between gap-4'>
                                <h3 className='text-lg font-medium text-textNa'>{item.question}</h3>
                                <span className='text-2xl leading-none text-textNc'>{isOpen ? '-' : '+'}</span>
                            </div>
                            {isOpen && <p className='mt-4 text-sm leading-6 text-textNb'>{item.answer}</p>}
                        </button>
                    )
                })}
            </div>
        </section>
    )
}

export default FAQ