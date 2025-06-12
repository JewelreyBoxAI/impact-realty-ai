const FAQS = [
  {
    q: 'Can I try SaaSify for free?',
    a: 'Yes! Our Starter plan is free and provides access to core features. You can upgrade at any time.'
  },
  {
    q: 'How does billing work?',
    a: 'You are billed monthly or annually depending on your plan. Pro users receive a 10% discount for yearly subscriptions.'
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. We use industry best practices and advanced security features to protect your data.'
  },
  {
    q: 'Can I cancel or change plans?',
    a: 'Yes, you can cancel or change your plan at any time from your dashboard.'
  }
];

export default function FAQSection() {
  return (
    <section className="py-16" id="faq">
      <h2 className="text-3xl font-heading font-bold text-center mb-10 text-foreground">
        Frequently Asked Questions
      </h2>
      <div className="max-w-3xl mx-auto">
        {FAQS.map((faq, i) => (
          <details
            key={i}
            className="group mb-4 rounded-lg bg-card px-6 py-4 shadow-glass hover:shadow-xl transition-shadow duration-200 cursor-pointer"
          >
            <summary className="font-semibold text-foreground text-lg flex items-center justify-between select-none outline-none">
              {faq.q}
              <span className="ml-2 group-open:rotate-180 transition-transform">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
              </span>
            </summary>
            <div className="text-muted-foreground mt-2">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
