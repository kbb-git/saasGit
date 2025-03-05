import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">About SaaSify</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We are on a mission to help creators and businesses sell their digital products with ease.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:mt-10 lg:max-w-none lg:grid-cols-12">
            <div className="relative lg:order-last lg:col-span-5">
              <figure className="border-l border-indigo-600 pl-8">
                <blockquote className="text-xl font-semibold leading-8 tracking-tight text-gray-900">
                  <p>
                    "SaaSify has transformed how we approach our digital business. Their platform is intuitive, powerful, and constantly evolving to meet our needs."
                  </p>
                </blockquote>
                <figcaption className="mt-8 flex gap-x-4">
                  <div className="text-sm leading-6">
                    <div className="font-semibold text-gray-900">Emma Rodriguez</div>
                    <div className="text-gray-600">Co-founder of LearnStack Academy</div>
                  </div>
                </figcaption>
              </figure>
            </div>
            <div className="lg:col-span-7">
              <div className="text-base leading-7 text-gray-700">
                <p className="mb-6">
                  Founded in 2020, SaaSify was born from a simple idea: make it easy for anyone to sell digital products online. 
                  Whether you're a solo creator or a growing business, our platform provides all the tools you need to succeed.
                </p>
                <p className="mb-6">
                  Our team of industry experts has built a platform that combines powerful features with simplicity. 
                  We believe that technology should work for you, not the other way around.
                </p>
                <h3 className="mt-12 text-2xl font-bold tracking-tight text-gray-900">Our Values</h3>
                <ul className="mt-6 list-disc pl-8 space-y-3">
                  <li>Customer Success: Your success is our success. We're committed to helping you grow.</li>
                  <li>Innovation: We constantly evolve our platform to stay ahead of market trends.</li>
                  <li>Simplicity: Powerful doesn't have to mean complicated. We focus on usability.</li>
                  <li>Security: Your data and your customers' data are safe with us.</li>
                </ul>
                <h3 className="mt-12 text-2xl font-bold tracking-tight text-gray-900">Our Team</h3>
                <p className="mt-6">
                  We're a diverse team of engineers, designers, and business experts united by a common goal: 
                  to build the best platform for selling digital products. We're remote-first, with team members 
                  across the globe bringing their unique perspectives to our work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 