export default function Testimonials() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-semibold leading-8 tracking-tight text-indigo-600">Testimonials</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by businesses worldwide
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author.name} className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200 h-full">
                <div>
                  <div className="flex items-center gap-x-4">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-50">
                      <svg
                        className="absolute h-full w-full text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.author.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.author.role}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <svg
                        key={rating}
                        className={`h-5 w-5 ${
                          rating < testimonial.rating ? 'text-yellow-400' : 'text-gray-200'
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-4 text-gray-600">{testimonial.content}</p>
                </div>
                <p className="mt-6 text-sm italic text-gray-500">{testimonial.company}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const testimonials = [
  {
    content:
      "We've been using SaaSify to sell our premium courses for over a year now. The platform is incredibly intuitive and the analytics give us valuable insights into our customers' behavior. Highly recommend!",
    author: {
      name: 'Emma Rodriguez',
      role: 'Co-founder',
    },
    rating: 5,
    company: 'LearnStack Academy',
  },
  {
    content:
      "The subscription management features have saved us countless hours. We used to handle everything manually, but now it's all automated. Customer support is also excellent whenever we have questions.",
    author: {
      name: 'Michael Chen',
      role: 'CEO',
    },
    rating: 5,
    company: 'CodeMasters Pro',
  },
  {
    content:
      'SaaSify has been a game-changer for our digital product business. The payment system is rock-solid, and our customers love the seamless checkout experience. Worth every penny!',
    author: {
      name: 'Sarah Johnson',
      role: 'Digital Product Manager',
    },
    rating: 4,
    company: 'CreativeAssets',
  },
] 