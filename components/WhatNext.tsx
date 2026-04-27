'use client'
import React, { useState } from 'react'
import ClientNext from './ClientNext'
import FreelancerNext from './FreelancerNext'

const WhatNext = () => {
    const [isClient, setIsClient] = useState(true)
    const [isFreelancer, setIsFreelancer] = useState(false)

    const handleClientView = () => {
        setIsClient(true)
        setIsFreelancer(false)
    }

    const handleFreelancerView = () => {
        setIsClient(false)
        setIsFreelancer(true)
    }

    return (
        <section className='mx-auto max-w-[1400px] px-4 py-20'>
            <div><h2 className='text-5xl semi-bold text-center tracking-tighter'>What are the next steps?</h2></div>
            <div className='flex justify-center gap-4  py-10'>
                <div className='flex bg-cardC/70 border border-cardCB rounded-full gap-4'>
                    <button
                        onClick={handleClientView}
                        className={`text-textNb text-sm rounded-full p-3 transition-all duration-300 ease-out transform active:scale-95 ${isClient ? 'bg-cardICB/50 shadow-sm' : 'bg-transparent hover:bg-cardC/70'} cursor-pointer`}
                    >
                        Paying For Service
                    </button>
                    <button
                        onClick={handleFreelancerView}
                        className={`text-textNb text-sm rounded-full p-3 transition-all duration-300 ease-out transform active:scale-95 ${isFreelancer ? 'bg-cardICB/50 shadow-sm' : 'bg-transparent hover:bg-cardC/70'} cursor-pointer`}
                    >
                        Providing A Service
                    </button>
                </div>
            </div>
            <div className='pt-5'>
                {isClient && <ClientNext />}
                {isFreelancer && <FreelancerNext />}
            </div>
        </section>
    )
}

export default WhatNext