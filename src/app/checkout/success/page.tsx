'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

interface PaymentDetails {
  id: string;
  status: string;
  amount: number;
  currency: string;
  [key: string]: unknown;
}

interface SessionDetails {
  id: string;
  status: string;
  amount: number;
  currency: string;
  payment_id?: string;
  [key: string]: unknown;
}

interface JsonData {
  [key: string]: unknown;
}

interface StoredPaymentData {
  response: Record<string, unknown>;
  sessionId: string;
  timestamp: string;
  tier?: {
    name: string;
    id: string;
    priceMonthly: string;
    description: string;
  };
}

// Component for displaying JSON data with copy and collapse functionality
function JsonDisplay({ data, title }: { data: JsonData; title: string }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };
  
  return (
    <div className="mt-4 bg-slate-50 rounded-md overflow-hidden border border-slate-200">
      <div className="flex justify-between items-center p-3 bg-slate-100 border-b border-slate-200">
        <h3 className="font-medium text-slate-700">{title}</h3>
        <div className="flex space-x-2">
          <button 
            onClick={copyToClipboard}
            className="text-xs bg-white px-2 py-1 rounded border border-slate-300 hover:bg-slate-50 text-slate-700"
            title="Copy to clipboard"
          >
            Copy
          </button>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xs bg-white px-2 py-1 rounded border border-slate-300 hover:bg-slate-50 text-slate-700"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? "Expand" : "Collapse"}
          </button>
        </div>
      </div>
      
      {!isCollapsed ? (
        <pre className="p-4 overflow-auto max-h-96 text-sm text-slate-800 bg-white">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <div className="p-4 text-slate-500 text-sm italic bg-white">
          Click expand to view full details
        </div>
      )}
    </div>
  );
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [combinedResponse, setCombinedResponse] = useState<JsonData | null>(null);
  const [storedPaymentData, setStoredPaymentData] = useState<StoredPaymentData | null>(null);
  
  // Get session ID from URL - prioritize the payment session ID
  const paymentSessionId = searchParams.get('cko-payment-session-id');
  const generalSessionId = searchParams.get('cko-session-id');
  const fallbackSessionId = searchParams.get('session_id');
  const sessionId = paymentSessionId || fallbackSessionId;
  
  // Get payment ID directly from URL if available
  const paymentId = searchParams.get('cko-payment-id');
  
  useEffect(() => {
    // Log all parameters to help with debugging
    console.log('URL parameters:', {
      'cko-payment-session-id': paymentSessionId,
      'cko-session-id': generalSessionId,
      'session_id': fallbackSessionId,
      'cko-payment-id': paymentId
    });
    
    // Get stored payment data from localStorage
    try {
      const storedData = localStorage.getItem('lastPaymentData');
      if (storedData) {
        const parsedData = JSON.parse(storedData) as StoredPaymentData;
        setStoredPaymentData(parsedData);
      }
    } catch (err) {
      console.error('Error parsing stored payment data:', err);
    }
    
    // Store session_id in sessionStorage for future reference
    if (sessionId) {
      sessionStorage.setItem('last_payment_session_id', sessionId);
    }
    
    if (!sessionId && !paymentId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }
    
    const fetchDetails = async () => {
      try {
        let sessionData = null;
        
        // Get session details if sessionId is available
        if (sessionId) {
          const sessionResponse = await fetch(`/api/payment-sessions/${sessionId}`);
          if (!sessionResponse.ok) {
            console.warn(`Failed to fetch session details with ID ${sessionId}`);
            // Don't throw error here, try to continue with payment ID if available
          } else {
            sessionData = await sessionResponse.json();
            setSessionDetails(sessionData);
          }
        }
        
        // Get payment details from URL parameter
        if (paymentId) {
          const paymentResponse = await fetch(`/api/payments/${paymentId}`);
          if (!paymentResponse.ok) {
            throw new Error('Failed to fetch payment details');
          }
          
          const paymentData = await paymentResponse.json();
          setPaymentDetails(paymentData);
          
          // Create a response with payment data even if session data isn't available
          setCombinedResponse({
            session: sessionData,
            payment: paymentData,
            storedData: storedPaymentData,
            urlParameters: {
              paymentSessionId,
              generalSessionId,
              fallbackSessionId,
              paymentId,
              allParams: Object.fromEntries(searchParams.entries())
            },
            timestamp: new Date().toISOString(),
          });
          
          setLoading(false);
          return;
        }
        
        // If we have session data but no payment data
        if (sessionData) {
          // If session has payment_id, get payment details
          if (sessionData.payment_id) {
            const paymentResponse = await fetch(`/api/payments/${sessionData.payment_id}`);
            if (!paymentResponse.ok) {
              throw new Error('Failed to fetch payment details');
            }
            
            const paymentData = await paymentResponse.json();
            setPaymentDetails(paymentData);
            
            setCombinedResponse({
              session: sessionData,
              payment: paymentData,
              storedData: storedPaymentData,
              urlParameters: {
                paymentSessionId,
                generalSessionId,
                fallbackSessionId,
                paymentId,
                allParams: Object.fromEntries(searchParams.entries())
              },
              timestamp: new Date().toISOString(),
            });
          } else {
            // No payment ID in session
            setCombinedResponse({
              session: sessionData,
              storedData: storedPaymentData,
              urlParameters: {
                paymentSessionId,
                generalSessionId,
                fallbackSessionId,
                paymentId,
                allParams: Object.fromEntries(searchParams.entries())
              },
              timestamp: new Date().toISOString(),
            });
          }
        } else if (storedPaymentData) {
          // If we have neither session nor payment data from API but have stored data
          setCombinedResponse({
            storedData: storedPaymentData,
            urlParameters: {
              paymentSessionId,
              generalSessionId,
              fallbackSessionId, 
              paymentId,
              allParams: Object.fromEntries(searchParams.entries())
            },
            timestamp: new Date().toISOString(),
          });
        } else {
          throw new Error('No payment or session data available');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching payment details:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [paymentSessionId, generalSessionId, fallbackSessionId, sessionId, paymentId, searchParams, storedPaymentData]);
  
  // Format amount for display (e.g., convert 2900 to $29.00)
  const formatAmount = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    });
    
    return formatter.format(amount / 100);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p>{error}</p>
              <div className="mt-6">
                <Link 
                  href="/" 
                  className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-6 bg-indigo-50 border-b border-indigo-100">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-full p-3">
                    <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h1 className="text-2xl font-bold text-gray-800">Payment Successful!</h1>
                    <p className="text-gray-600">Thank you for your purchase</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-b border-slate-200 bg-white">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Details</h2>
                
                {sessionDetails && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Order Reference:</span>
                      <span className="font-medium text-slate-900">{sessionDetails.reference || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Amount:</span>
                      <span className="font-medium text-slate-900">
                        {formatAmount(sessionDetails.amount, sessionDetails.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className="font-medium text-indigo-600">
                        {paymentDetails?.status || sessionDetails.status || 'Completed'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Date:</span>
                      <span className="font-medium text-slate-900">
                        {new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {storedPaymentData?.tier && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Plan:</span>
                        <span className="font-medium text-slate-900">{storedPaymentData.tier.name} (${storedPaymentData.tier.priceMonthly}/month)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Payment Response JSON Display Section */}
              <div className="p-6 border-b border-slate-200 bg-white">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h2>
                <p className="text-slate-600 mb-4">
                  Technical details of your payment for reference. You can use these details if you need 
                  to contact customer support.
                </p>
                
                {combinedResponse && (
                  <>
                    <JsonDisplay data={combinedResponse} title="Complete Payment Response" />
                    
                    {sessionDetails && (
                      <JsonDisplay data={sessionDetails as unknown as JsonData} title="Session Details" />
                    )}
                    
                    {paymentDetails && (
                      <JsonDisplay data={paymentDetails as unknown as JsonData} title="Payment Details" />
                    )}
                    
                    {storedPaymentData && (
                      <JsonDisplay 
                        data={storedPaymentData as unknown as JsonData} 
                        title="Client-Side Payment Data" 
                      />
                    )}
                  </>
                )}
              </div>
              
              <div className="p-6 bg-white">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">What&apos;s Next?</h2>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-slate-700">Your account has been activated</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-slate-700">You&apos;ll receive a confirmation email shortly</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-slate-700">Your subscription will renew automatically each month</span>
                  </li>
                </ul>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Link 
                    href="/dashboard" 
                    className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md text-center hover:bg-indigo-700"
                  >
                    Go to Dashboard
                  </Link>
                  <Link 
                    href="/" 
                    className="inline-block bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-md text-center hover:bg-indigo-50"
                  >
                    Return to Home
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
} 