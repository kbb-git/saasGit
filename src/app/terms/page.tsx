'use client';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-indigo max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Welcome to SaaSify. By accessing or using our service, you agree to be bound by these Terms of Service.
            </p>
            
            <h2>2. User Agreement</h2>
            <p>
              By using our services, you agree to these terms, our Privacy Policy, and any other guidelines or policies we may communicate to you.
            </p>
            
            <h2>3. Subscriptions and Payments</h2>
            <p>
              Our service operates on a subscription basis. You agree to pay the fees associated with your chosen subscription tier.
              Payments are processed securely through Checkout.com.
            </p>
            
            <h2>4. Cancellation and Refunds</h2>
            <p>
              You may cancel your subscription at any time. Refunds are provided in accordance with our refund policy.
            </p>
            
            <h2>5. Limitation of Liability</h2>
            <p>
              Our service is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of our service.
            </p>
            
            <h2>6. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the service constitutes acceptance of any changes.
            </p>
            
            <h2>7. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at support@saasify.com.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 