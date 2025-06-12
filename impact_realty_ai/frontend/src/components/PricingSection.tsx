const PLANS = [
  {
    name: 'Starter',
    price: '$0',
    desc: 'For early teams getting started',
    features: [
      'Unlimited projects',
      'Basic analytics',
      'Community support'
    ],
    highlight: false
  },
  {
    name: 'Pro',
    price: '$29',
    desc: 'Best for growing SaaS businesses',
    features: [
      'All Starter features',
      'Advanced analytics',
      'Integrations',
      'Priority email support'
    ],
    highlight: true
  },
  {
    name: 'Enterprise',
    price: 'Contact Us',
    desc: 'Custom solutions for large orgs',
    features: [
      'All Pro features',
      'Custom integrations',
      'Dedicated manager',
      '24/7 Premium support'
    ],
    highlight: false
  }
];

export default function PricingSection() {
  return (
    <section className="py-20" id="pricing">
      <h2 className="text-3xl font-heading font-bold text-center mb-10 text-foreground">
        Flexible Pricing for Every Team
      </h2>
      <div className="flex flex-col md:flex-row gap-8 justify-center">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`flex-1 rounded-2xl bg-card shadow-glass px-8 py-10 flex flex-col items-center text-center border-2 transition-all duration-200 ${plan.highlight ? 'border-primary scale-105 shadow-xl' : 'border-border'}`}
          >
            <div className="text-2xl font-heading font-semibold mb-2 text-primary">{plan.name}</div>
            <div className="text-4xl font-bold mb-2 text-foreground">{plan.price}</div>
            <div className="text-muted-foreground mb-4">{plan.desc}</div>
            <ul className="text-sm mb-8 w-full space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-success flex-shrink-0 mt-[0.5rem]" />
                  <span className="text-left">{f}</span>
                </li>
              ))}
            </ul>
            <button className={`px-6 py-3 rounded-lg font-semibold shadow ${plan.highlight ? 'bg-primary text-white hover:bg-secondary' : 'bg-muted text-primary border border-primary/20 hover:bg-card'} transition-colors duration-200`}>
              {plan.price === 'Contact Us' ? 'Contact Sales' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
