'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export default function FailurePage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  
  // Get error info from URL if available
  const errorMessage = searchParams.get('error');
  const sessionId = searchParams.get('session_id');
  
  useEffect(() => {
    // Display the error message from the URL or a default message
    setError(errorMessage || 'Your payment could not be processed at this time.');
    
    // If we have a session ID, we could fetch more details here
  }, [errorMessage, sessionId]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6 bg-red-50 border-b border-red-100">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-800">Payment Failed</h1>
                  <p className="text-gray-600">We were unable to process your payment</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">What Happened?</h2>
              <div className="bg-red-50 p-4 rounded-md text-red-700 mb-6">
                {error}
              </div>
              
              <h3 className="font-medium text-gray-700 mb-2">Common reasons for payment failures:</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Insufficient funds in your account</li>
                <li>Card information entered incorrectly</li>
                <li>Card expired or blocked for online transactions</li>
                <li>Transaction declined by your bank for security reasons</li>
                <li>Technical issues with the payment processor</li>
              </ul>
            </div>
            
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">What Can You Do?</h2>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Try again with a different payment method</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Verify your card details and billing information</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Contact your bank to authorize the transaction</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Contact our support team for assistance</span>
                </li>
              </ul>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link 
                  href="/checkout" 
                  className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md text-center hover:bg-indigo-700"
                >
                  Try Again
                </Link>
                <Link 
                  href="/support" 
                  className="inline-block bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-md text-center hover:bg-indigo-50"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 