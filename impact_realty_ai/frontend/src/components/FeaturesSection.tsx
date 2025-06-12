const FEATURES = [
  {
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
      </svg>
    ),
    title: 'AI Recruitment',
    desc: 'Intelligent candidate sourcing and qualification powered by advanced AI algorithms.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4" />
        <path d="M21 12c.552 0 1-.448 1-1V8a2 2 0 0 0-2-2h-5L9.293 2.293A1 1 0 0 0 8.586 2H4a2 2 0 0 0-2 2v6c0 .552.448 1 1 1" />
      </svg>
    ),
    title: 'Compliance Automation',
    desc: 'Automated compliance checks and validation for real estate transactions and processes.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'Multi-Agent System',
    desc: 'Coordinated AI agents working together for complex real estate workflows.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 18 18.25V19a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-.75c0-.98.626-1.813 1.5-2.25Z" />
      </svg>
    ),
    title: 'Intelligent Insights',
    desc: 'Real-time analytics and decision support for data-driven real estate operations.'
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-16" id="features">
      <h2 className="text-3xl font-heading font-bold text-center mb-10 text-foreground">
        Why Choose Impact Realty AI?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="rounded-2xl bg-card shadow-glass flex flex-col items-center justify-center px-6 py-8 text-center hover:shadow-xl transition-shadow duration-200"
          >
            <div className="mb-4 animate-fade-in-slow">{f.icon}</div>
            <div className="text-xl font-semibold mb-2 text-primary font-heading">
              {f.title}
            </div>
            <div className="text-base text-muted-foreground">
              {f.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
