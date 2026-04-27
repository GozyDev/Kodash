import React from 'react'

const ClientNext = () => {
    const baseSteps = [
        {
            title: 'Start a Workspace',
            description: "Starting a workspace gives your project a clear home where everything stays organized from the beginning. It allows you to outline exactly what you need, making it easier for others to understand your expectations. By writing a clear and simple request, you reduce confusion and help the right people take action faster. This step sets the foundation for smooth collaboration and better results",
            image: "CreateWorkspace.png",
        },
        {
            title: "Invite Your Freelancer",
            description:
                'Inviting your freelancer makes it easy to collaborate with someone you already know and trust. Whether it’s a previous partner or someone you’ve connected with elsewhere, you can bring them directly into your workspace without starting from scratch. This helps keep communication simple and ensures everyone is on the same page from the beginning. It’s a smooth way to continue working with the right person for your project.',
            image: 'inviteMenber.png',
        },
        {
            title: 'Agree on the Work',
            description:
                'Agreeing on the work helps both you and the freelancer understand exactly what needs to be delivered. By setting a clear “definition of done,” there’s no confusion about expectations or results. You can review the details together, make adjustments if needed, and ensure everything feels right before moving forward. This step builds clarity and prevents misunderstandings later on',
            image: 'Agree.png',
        },
        {
            title: 'Secure the Payment Upfront',
            description:
                'Securing the payment upfront helps build trust and keeps the project moving smoothly from the start. By funding the project before work begins, you show commitment while ensuring the payment is safely held until the job is done. This gives both you and the freelancer confidence, knowing everything is protected along the way. It creates a balanced and secure environment for getting the work completed.',
            image: 'secure.png',
        },

        {
            title: 'Review and Release Funds',
            description:
                'After the freelancer delivers the work, you get the chance to carefully review everything to make sure it meets your expectations. If something isn’t quite right, you can request revisions so it can be improved. Once you’re satisfied with the final result, you can approve the work and release the payment. This ensures quality while keeping the process fair and transparent for both sides.',
            image: 'ReleaseFunds.png',
        },
    ]
    const steps = baseSteps.map((step, index) => ({
        ...step,
        imagePosition: index % 2 === 0 ? 'left' : 'right',
    }))

    return (
        <div className='space-y-6'>
            {steps.map((step) => (
                <article
                    key={step.title}
                    className='grid items-center  md:grid-cols-2 '
                >
                    <div className={step.imagePosition === 'left' ? 'md:order-1' : 'md:order-2'}>
                        <img
                            src={step.image}
                            alt={step.title}
                            className='h-auto w-[500px] rounded-lg object-cover mx-auto z-0'
                        />
                    </div>
                    <div className={step.imagePosition === 'left' ? 'md:order-2' : 'md:order-1'}>
                        <div className={` p-3  py-6 bg-cardC/40 backdrop-blur z- ${step.imagePosition === 'left' ? "md:ml-[-150px] border-r-2 border-r-primaryC  " : "md:mr-[-150px] border-l-2 border-l-primaryC"}`}>
                            <h3 className='mb-2 text-xl font-bold text-textNc tracking-tight uppercase'>{step.title}</h3>
                            <p className='text-sm leading-7 text-textNd'>{step.description}</p>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    )
}

export default ClientNext
