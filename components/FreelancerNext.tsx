'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const FreelancerNext = () => {
    const shouldReduceMotion = useReducedMotion()
    const baseSteps = [
        {
            title: 'Create or Join a Workspace',
            description:
                'Creating or joining a workspace helps you bring your work and collaboration into one organized space. You can set up a new workspace for a client you already know, or simply accept an invite to join an existing project. This makes it easier to manage tasks, communicate clearly, and keep everything in one place. It’s a simple way to stay connected and work smoothly with others from the start.',
            image: 'CreateWorkspace.png',
        },
        {
            title: 'Bring Your Client Onboard',
            description:
                'Bringing your client onboard helps you move your existing work into a more organized and professional setup. You can invite them directly to the platform so both of you can manage the project in one place. This makes communication clearer and keeps everything structured from start to finish. It’s an easy way to improve how you work together and keep the project on track.',
            image: 'inviteMenber.png',
        },
        {
            title: 'Define the Work Clearly',
            description:
                'Defining the work clearly helps both sides understand exactly what needs to be delivered. By submitting a “definition of done,” you set simple and clear expectations before any work starts. This reduces confusion and makes sure everyone is aligned on the final outcome. It also helps the project run more smoothly from beginning to end',
            image: 'clearly.png',
        },

        {
            title: 'Work with Confidence',
            description:
                'Working with confidence means you can begin a project knowing everything is properly secured from the start. Once the payment is held safely in escrow, you don’t have to worry about whether the funds are available. This creates trust between both parties and allows you to focus fully on delivering good work. It’s a simple way to make the process safer and more reliable for everyone involved.',
            image: 'confidence.png',
        },
        {
            title: 'Deliver and Refine',
            description:
                'Delivering your work is the final step where you share the completed project with the client. If the client requests changes, you can make revisions to ensure everything meets their expectations. This process helps improve the quality of the final result and keeps both sides satisfied. Once the client approves the work, the payment is released, completing the project smoothly.',
            image: 'Delivery.png',
        },
    ]
    const steps = baseSteps.map((step, index) => ({
        ...step,
        imagePosition: (index % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
    }))

    const getDirectionalAnimation = (direction: 'left' | 'right') => ({
        hidden: {
            opacity: 0,
            x: shouldReduceMotion ? 0 : direction === 'left' ? -56 : 56,
            y: shouldReduceMotion ? 0 : 18,
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
        },
    })

    return (
        <div className=''>
            {steps.map((step) => (
                <article
                    key={step.title}
                    className='grid items-center gap-6 md:grid-cols-2'
                >
                    <motion.div
                        className={step.imagePosition === 'left' ? 'md:order-1' : 'md:order-2'}
                        variants={getDirectionalAnimation(step.imagePosition)}
                        initial='hidden'
                        whileInView='visible'
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{
                            duration: shouldReduceMotion ? 0 : 0.7,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <img
                            src={step.image}
                            alt={step.title}
                            className='h-auto w-[500px] rounded-lg object-cover mx-auto z-0'
                        />
                    </motion.div>
                    <motion.div
                        className={step.imagePosition === 'left' ? 'md:order-2' : 'md:order-1'}
                        variants={getDirectionalAnimation(step.imagePosition === 'left' ? 'right' : 'left')}
                        initial='hidden'
                        whileInView='visible'
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{
                            duration: shouldReduceMotion ? 0 : 0.75,
                            delay: shouldReduceMotion ? 0 : 0.12,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <div className={` p-3  py-6 bg-cardC/40 backdrop-blur z- ${step.imagePosition === 'left' ? "md:ml-[-150px] border-r-2 border-r-primaryC  " : "md:mr-[-150px] border-l-2 border-l-primaryC"}`}>
                            <h3 className='mb-2 text-xl font-bold text-textNc tracking-tight uppercase'>{step.title}</h3>
                            <p className='text-sm leading-7 text-textNd'>{step.description}</p>
                        </div>
                    </motion.div>
                </article>
            ))}
        </div>
    )
}

export default FreelancerNext
