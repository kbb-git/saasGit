'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useRouter } from 'next/navigation';

// Pricing tiers from Pricing.tsx
const PRICING_TIERS = [
  {
    name: 'Starter',
    id: 'starter',
    priceMonthly: '29',
    description: 'Perfect for small creators just getting started.',
  },
  {
    name: 'Growth',
    id: 'growth',
    priceMonthly: '79',
    description: 'Ideal for growing businesses with more customers.',
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    priceMonthly: '199',
    description: 'Dedicated support and infrastructure for your company.',
  },
];

// Checkout.com public key
const CHECKOUT_PUBLIC_KEY = "pk_sbox_e5v4rg3sztzmdusp47pvdg53kmc";
const ENVIRONMENT = "sandbox";

// Create a more comprehensive appearance object that matches the site design
const flowAppearance = {
  colorAction: '#4F46E5',
  colorBackground: '#FFFFFF',
  colorBorder: '#E5E7EB',
  colorDisabled: '#9CA3AF',
  colorError: '#DC2626',
  colorFormBackground: '#F9FAFB',
  colorFormBorder: '#E5E7EB',
  colorInverse: '#FFFFFF',
  colorOutline: '#C7D2FE',
  colorPrimary: '#1F2937',
  colorSecondary: '#6B7280',
  colorSuccess: '#10B981',
  button: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '24px',
  },
  input: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '24px',
  },
  label: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '20px',
  },
  subheading: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '24px',
  },
  borderRadius: ['0.5rem', '0.5rem'],
};

// Component options for customizing Flow components
const flowComponentOptions = {
  card: {
    displayCardholderName: 'top'
  }
};

// Add proper type definitions for Checkout.com objects
interface CheckoutInstance {
  create: (componentType: string) => CheckoutComponent;
  unmount: () => void;
}

interface CheckoutComponent {
  mount: (element: HTMLElement) => void;
}

// Components for customizing Flow components
interface PaymentResponseDataType {
  id: string;
  status: string;
  [key: string]: unknown;
}

// Type declaration for CheckoutOptions
interface PaymentSessionType {
  id: string;
  [key: string]: unknown;
}

interface CheckoutOptions {
  publicKey: string;
  environment: string;
  paymentSession: PaymentSessionType; // Using a specific type instead of any
  locale: string;
  appearance: typeof flowAppearance;
  componentOptions?: typeof flowComponentOptions;
  onReady: () => void;
  onPaymentCompleted: (component: unknown, paymentResponse: PaymentResponseDataType) => void;
  onError: (component: unknown, error: {message?: string}) => void;
}

declare global {
  interface Window {
    CheckoutWebComponents: (options: CheckoutOptions) => Promise<CheckoutInstance>;
  }
}

// Loading component for Suspense
function CheckoutLoading() {
  return (
    <div className="max-w-3xl mx-auto text-center py-12">
      <div className="animate-pulse">
        <div className="h-8 bg-indigo-100 rounded w-1/2 mx-auto mb-4"></div>
        <div className="h-4 bg-indigo-50 rounded w-2/3 mx-auto mb-2"></div>
        <div className="h-4 bg-indigo-50 rounded w-3/4 mx-auto"></div>
      </div>
    </div>
  );
}

// Component with search params
function CheckoutContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const flowContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Get plan from URL query parameters
  const planId = searchParams.get('plan');
  
  // Find the selected plan from pricing tiers
  const selectedPlan = PRICING_TIERS.find(tier => tier.id === planId) || PRICING_TIERS[0];
  
  useEffect(() => {
    // Check if we're in a browser environment and email has been submitted
    if (typeof window === 'undefined' || !emailSubmitted) return;
    
    let checkoutInstance: CheckoutInstance | null = null;
    
    const initializeCheckout = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!window.CheckoutWebComponents) {
          // Load Checkout.com Web Components script
          await loadCheckoutScript();
        }
        
        // Calculate amount in minor units (cents/pence)
        const amount = parseInt(selectedPlan.priceMonthly, 10) * 100;
        
        // Create payment session
        const sessionResponse = await fetch('/api/payment-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount,
            currency: 'USD',
            items: [{
              name: `${selectedPlan.name} Plan`,
              quantity: 1,
              unit_price: amount,
              total_amount: amount,
              reference: `PLAN-${selectedPlan.id}`
            }],
            customer: {
              email: email,
              name: '' // Name will be captured by Flow
            },
            plan: selectedPlan.id
          })
        });

        if (!sessionResponse.ok) {
          throw new Error('Failed to create payment session');
        }

        const paymentSession = await sessionResponse.json();
        
        // Initialize Checkout.com Web Components with enhanced styling
        const CheckoutWebComponentsInstance = window.CheckoutWebComponents;
        
        checkoutInstance = await CheckoutWebComponentsInstance({
          publicKey: CHECKOUT_PUBLIC_KEY,
          environment: ENVIRONMENT,
          paymentSession,
          locale: "en-US",
          appearance: flowAppearance,
          componentOptions: flowComponentOptions,
          onReady: () => {
            console.log('Payment components ready');
            setLoading(false);
          },
          onPaymentCompleted: (component: unknown, paymentResponse: PaymentResponseDataType) => {
            console.log('Payment completed:', paymentResponse);
            
            // Store payment response in localStorage
            const paymentData: Record<string, unknown> = {
              response: paymentResponse,
              sessionId: paymentSession.id,
              timestamp: new Date().toISOString(),
              tier: selectedPlan
            };
            
            localStorage.setItem('lastPaymentData', JSON.stringify(paymentData));
            
            // Let Checkout.com handle the redirect with its own parameters
            // It will automatically add cko-payment-session-id, cko-session-id, and cko-payment-id
            router.push(`/checkout/success`);
          },
          onError: (_component: unknown, error: {message?: string}) => {
            console.error('Payment error:', error);
            setError(error.message || 'Payment failed. Please try again.');
            setLoading(false);
          }
        });

        // Create and mount the Flow component
        if (checkoutInstance && flowContainerRef.current) {
          const flow = checkoutInstance.create('flow');
          flow.mount(flowContainerRef.current);
        }
        
      } catch (err: unknown) {
        console.error('Checkout initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
        setLoading(false);
      }
    };

    initializeCheckout();

    // Cleanup function
    return () => {
      if (checkoutInstance) {
        checkoutInstance.unmount();
      }
    };
  }, [email, selectedPlan, emailSubmitted, router]);

  // Handle email submission
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setEmailSubmitted(true);
    }
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6 bg-indigo-50 border-b border-indigo-100">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">Checkout</h2>
              <p className="text-gray-600">Complete your purchase to get started</p>
            </div>
            
            <div className="p-6">
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedPlan.name} Plan</h3>
                    <p className="text-sm text-gray-500">{selectedPlan.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">${selectedPlan.priceMonthly}</div>
                    <div className="text-sm text-gray-500">per month</div>
                  </div>
                </div>
              </div>
              
              {!emailSubmitted ? (
                <form onSubmit={handleEmailSubmit} className="mb-8">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 px-3 py-2 border"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mt-4">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
                    <button
                      onClick={() => setEmailSubmitted(false)}
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      Change Email
                    </button>
                  </div>
                  
                  {/* This is where the Checkout.com Flow component will be mounted */}
                  <div ref={flowContainerRef} className="min-h-[400px]">
                    {loading && (
                      <div className="flex justify-center items-center h-80">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
                      </div>
                    )}
                    
                    {error && !loading && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-6 text-xs text-gray-500">
                <p className="mb-2">
                  By completing this purchase, you agree to our <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">Terms of Service</Link> and <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</Link>.
                </p>
                <p>
                  Your payment is securely processed by Checkout.com. We do not store your full payment details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to load Checkout.com script
function loadCheckoutScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.checkout.com/web-components/v2.0/flow/web-components-flow.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Checkout.com script'));
    document.head.appendChild(script);
  });
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Suspense fallback={<CheckoutLoading />}>
          <CheckoutContent />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
} 