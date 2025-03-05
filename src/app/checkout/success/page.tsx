'use client';

import { useEffect, useState, Suspense } from 'react';
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

// Loading component for Suspense
function SuccessLoading() {
  return (
    <div className="max-w-3xl mx-auto text-center py-12">
      <div className="animate-pulse">
        <div className="h-8 bg-green-100 rounded w-1/2 mx-auto mb-4"></div>
        <div className="h-4 bg-green-50 rounded w-2/3 mx-auto mb-2"></div>
        <div className="h-4 bg-green-50 rounded w-3/4 mx-auto"></div>
      </div>
    </div>
  );
}

// Success content component with search params
function SuccessContent() {
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
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    });
    return formatter.format(amount / 100);
  };
  
  // Determine content to display based on loading/error state
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading payment details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 bg-yellow-50 border-b border-yellow-100">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-800">Payment Verification Issue</h1>
                <p className="text-gray-600">We're having trouble verifying your payment</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Error Details</h2>
            <div className="bg-yellow-50 p-4 rounded-md text-yellow-700 mb-6">
              {error}
            </div>
            
            <p className="mb-4">
              Your payment might have been successful, but we couldn't verify its status. Please check your email for a confirmation, or contact our support team for assistance.
            </p>
            
            {combinedResponse && (
              <JsonDisplay data={combinedResponse} title="Technical Details" />
            )}
          </div>
          
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/" 
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md text-center hover:bg-indigo-700"
              >
                Return to Homepage
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
    );
  }
  
  // Define payment reference to display
  const paymentReference = (paymentDetails?.reference || sessionDetails?.reference || "Unknown") as string;
  
  // Determine amount and currency to display
  let displayAmount = "Unknown";
  let displayCurrency = "USD"; // Default currency
  
  if (paymentDetails?.amount && paymentDetails?.currency) {
    displayAmount = formatAmount(paymentDetails.amount, paymentDetails.currency);
    displayCurrency = paymentDetails.currency;
  } else if (sessionDetails?.amount && sessionDetails?.currency) {
    displayAmount = formatAmount(sessionDetails.amount, sessionDetails.currency);
    displayCurrency = sessionDetails.currency;
  } else if (storedPaymentData?.response && typeof storedPaymentData.response === 'object') {
    // Try to get amount/currency from stored data
    const resp = storedPaymentData.response as Record<string, any>;
    if (resp.amount && resp.currency) {
      displayAmount = formatAmount(Number(resp.amount), String(resp.currency));
      displayCurrency = String(resp.currency);
    }
  }
  
  // Get plan/tier details if available
  const tierName = (storedPaymentData?.tier?.name || "Subscription") as string;
  const tierDescription = (storedPaymentData?.tier?.description || "Thank you for your purchase!") as string;
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 bg-green-50 border-b border-green-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-800">Payment Successful!</h1>
              <p className="text-gray-600">Your payment has been processed successfully</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h2>
          
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Order Reference</dt>
              <dd className="mt-1 text-sm text-gray-900">{paymentReference}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Amount</dt>
              <dd className="mt-1 text-sm text-gray-900">{displayAmount}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{new Date().toLocaleDateString()}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Plan</dt>
              <dd className="mt-1 text-sm text-gray-900">{tierName}</dd>
            </div>
          </dl>
          
          <div className="mt-6 bg-green-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{tierDescription}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">What's Next?</h2>
          <div className="space-y-4 mb-6">
            <p className="text-gray-600">
              We've sent a confirmation email with your receipt and further instructions.
              Your account has been updated with your new subscription.
            </p>
            <p className="text-gray-600">
              You can now access your dashboard to manage your subscription and explore
              all the features of your new plan.
            </p>
          </div>
          
          {combinedResponse && (
            <JsonDisplay data={combinedResponse} title="Response Data (Developer View)" />
          )}
          
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
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12">
        <Suspense fallback={<SuccessLoading />}>
          <SuccessContent />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
} 