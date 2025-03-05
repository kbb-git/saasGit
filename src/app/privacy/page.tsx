'use client';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-indigo max-w-none">
            <h2>1. Introduction</h2>
            <p>
              At SaaSify, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.
            </p>
            
            <h2>2. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, subscribe to our service, or contact customer support.
              This may include your name, email address, billing information, and any other information you choose to provide.
            </p>
            
            <h2>3. How We Use Your Information</h2>
            <p>
              We use your information to provide, maintain, and improve our services, process transactions, send communications, and for other legitimate business purposes.
            </p>
            
            <h2>4. Payment Processing</h2>
            <p>
              We use Checkout.com to process payments. Your payment information is handled in accordance with Checkout.com's privacy policy and security standards.
              We do not store your complete payment details on our servers.
            </p>
            
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
            </p>
            
            <h2>6. Third-Party Services</h2>
            <p>
              Our service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties.
            </p>
            
            <h2>7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>
            
            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@saasify.com.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 