'use client';

import { useEffect, useState, useRef } from 'react';
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

export default function CheckoutPage() {
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
    if (email) {
      setEmailSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent drop-shadow-sm">Complete Your Purchase</h1>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg inline-block">{selectedPlan.name} Plan</h3>
                  <p className="text-gray-600 text-sm mt-2">{selectedPlan.description}</p>
                </div>
                <div className="text-xl font-bold bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg">${selectedPlan.priceMonthly}/month</div>
              </div>
            </div>
            
            {!emailSubmitted ? (
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Information</h2>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-indigo-700 font-medium"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h2>
                
                {/* Display submitted email */}
                <div className="mb-6 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="text-sm text-gray-600">Your email:</div>
                  <div className="text-indigo-700 font-medium break-all">{email}</div>
                </div>
                
                {loading && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
                    {error}
                  </div>
                )}
                
                {/* Checkout.com Flow container */}
                <div 
                  ref={flowContainerRef} 
                  className="min-h-[300px] bg-gray-50 rounded-md p-4"
                ></div>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <Link 
              href="/pricing" 
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Return to pricing
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Fix for loadCheckoutScript function to check for window.CheckoutWebComponents
function loadCheckoutScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && 'CheckoutWebComponents' in window) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout-web-components.checkout.com/index.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Checkout.com script'));
    document.head.appendChild(script);
  });
} 