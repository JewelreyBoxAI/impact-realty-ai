const TESTIMONIALS = [
  {
    avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=96&h=96&q=80',
    name: 'Jessica Lee',
    company: 'Growthly.io',
    text: 'SaaSify transformed our marketing efforts. The analytics are top-notch and the UI is simply beautiful.'
  },
  {
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=96&h=96&q=80',
    name: 'Michael Chen',
    company: 'CloudSuite',
    text: 'We grew our user base 3x last year after launching our SaaS on this platform. Highly recommend!'
  },
  {
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=96&h=96&q=80',
    name: 'Sara Patel',
    company: 'FinBoost',
    text: 'Support is always quick and helpful. The automation features save us hours every week.'
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-16" id="testimonials">
      <h2 className="text-3xl font-heading font-bold text-center mb-10 text-foreground">
        What Our Customers Say
      </h2>
      <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            className="flex-1 bg-card rounded-2xl shadow-glass px-8 py-8 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-200"
          >
            <img
              src={t.avatar}
              alt={t.name}
              className="w-20 h-20 rounded-full border-4 border-primary shadow-lg mb-4"
            />
            <div className="text-lg font-semibold text-foreground mb-2">{t.name}</div>
            <div className="text-sm text-primary mb-4 font-medium">{t.company}</div>
            <p className="text-base text-muted-foreground">{t.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
