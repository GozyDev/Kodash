'use client'

import React, { Suspense } from 'react'
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react'

// 1. ISOLATE LOGIC: Move the main logic into a separate component
const ConfirmContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams();
  const eml = searchParams.get("eml");

  return (
    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 text-center">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail className="w-10 h-10 text-orange-500" />
      </div>

      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
        Check Your Email
      </h1>

      {/* Description */}
      <p className="text-gray-600 mb-6 leading-relaxed">
        {` We've sent a confirmation link to ${eml || 'your email'} .`}
        Please click the link in the email to verify your account and complete your registration.
      </p>

      {/* Important Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-amber-800 font-medium text-sm mb-1">Didn&apos;t receive the email?</p>
            <ul className="text-amber-700 text-sm space-y-1">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Wait a few minutes - it might take a moment to arrive</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-row md:flex-row-reverse gap-3">
        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Resend Confirmation Email
        </button>

        <button
          onClick={() => router.back()}
          className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
      </div>

      {/* Support Contact */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Need help?{' '}
          <a href="mailto:support@yourapp.com" className="text-orange-500 hover:text-orange-600 font-medium">
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 ">
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