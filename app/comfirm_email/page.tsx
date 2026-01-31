'use client'

import React, { Suspense } from 'react'
import { useSearchParams, useRouter } from "next/navigation";
import {CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Image from 'next/image';

// 1. ISOLATE LOGIC: Move the main logic into a separate component
const ConfirmContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams();
  const eml = searchParams.get("eml");

  return (
    <div className="max-w-2xl w-full bg-cardC rounded-2xl shadow-lg px-2 py-4 md:p-8 text-center">
      {/* Success Icon */}
     <Image
              src="/Logo.png"
              alt="Kodash Logo"
              width={100}
              height={100}
              className="mb-5 mx-auto"
            />

      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold  mb-4 text-textNa">
        Check Your Email
      </h1>

      {/* Description */}
      <p className=" mb-6 text-sm leading-relaxed text-textNc">
        {` We've sent a confirmation link to ${eml || 'your email'} .`}
        Please click the link in the email to verify your account and complete your registration.
      </p>

      {/* Important Note */}
      <div className="bg-cardICB/50 border border-cardCB rounded-lg p-2 md:p-4 mb-6 text-left text-sm">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-primaryC mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-textNb font-medium text-sm mb-1">Didn&apos;t receive the email?</p>
            <ul className="text-textNc text-sm space-y-1">
              <li> Check your spam or junk folder</li>
              <li> Make sure you entered the correct email address</li>
              <li> Wait a few minutes - it might take a moment to arrive</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse md:flex-row-reverse gap-3">
        <button className="w-full butt text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Resend Confirmation Email
        </button>

        <button
          onClick={() => router.back()}
          className="w-full border border-cardCB text-textNa hover:bg-gray-50/10 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
      </div>

      {/* Support Contact */}
      <div className="mt-6 pt-6 border-t border-cardCB" >
        <p className="text-sm text-gray-500">
          Need help?{' '}
          <a href="mailto:support@yourapp.com" className="text-primaryC hover:text-primaryHC font-medium">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  )
}

// 2. MAIN PAGE: Wrap the content in Suspense
const ConfirmPage = () => {
  return (
    <div className="min-h-screen bg-bgPrimary flex items-center justify-center px-4 ">
      <Suspense fallback={<ConfirmFallback />}>
        <ConfirmContent />
      </Suspense>
    </div>
  )
}

// Optional: A simple loading state while URL params are being read
const ConfirmFallback = () => (
  <div className="flex flex-col items-center justify-center">
    <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-500">Loading...</p>
  </div>
)

export default ConfirmPage