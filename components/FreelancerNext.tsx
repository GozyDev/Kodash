import React from 'react'

const FreelancerNext = () => {
    const steps = [
        {
            title: 'Set up your profile',
            description: 'Showcase your skills, past projects, and rates to build trust with potential clients.',
        },
        {
            title: 'Send focused proposals',
            description: 'Respond to projects that match your strengths with clear scope, timeline, and deliverables.',
        },
        {
            title: 'Deliver and grow',
            description: 'Complete milestones on time, gather strong reviews, and build long-term client relationships.',
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

export default FreelancerNext
