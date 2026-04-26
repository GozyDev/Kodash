import React from 'react'

const ClientNext = () => {
    const steps = [
        {
            title: 'Describe your project',
            description: 'Share your goals, timeline, and budget so freelancers know exactly what you need.',
        },
        {
            title: 'Review proposals',
            description: 'Compare portfolios, communication style, and cost to choose the best match.',
        },
        {
            title: 'Kick off with milestones',
            description: 'Break work into clear milestones and release payment only when each step is approved.',
        },
    ]

    return (
        <div className='grid gap-4 md:grid-cols-3'>
            {steps.map((step) => (
                <article key={step.title} className='rounded-xl border border-cardCB bg-cardC/50 p-5'>
                    <h3 className='mb-2 text-lg font-bold text-textNc'>{step.title}</h3>
                    <p className='text-sm leading-6 text-textNd'>{step.description}</p>
                </article>
            ))}
        </div>
    )
}

export default ClientNext
