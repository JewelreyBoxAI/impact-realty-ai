export default function HeroSection() {
  return (
    <section className="py-24 sm:py-32 w-full relative bg-hero rounded-2xl shadow-glass overflow-hidden mt-8">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center px-4">
        <h1 className="text-5xl sm:text-6xl font-heading font-bold text-primary drop-shadow-sm animate-fade-in mb-4">
          Intelligent Real Estate AI
        </h1>
        <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground mb-8 animate-fade-in delay-100">
          Transform your real estate operations with our advanced multi-agent AI system. 
          Automated recruitment, compliance management, and intelligent assistance at your fingertips.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#agents" className="px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow-lg hover:bg-secondary transition duration-200 text-lg">
            Try AI Agents
          </a>
          <a href="#features" className="px-6 py-3 rounded-xl bg-muted text-primary font-semibold shadow hover:bg-card transition duration-200 text-lg border border-primary/20">
            Learn More
          </a>
        </div>
      </div>
      <div className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full opacity-20 blur-2xl bg-gradient-to-br from-primary to-accent pointer-events-none" />
    </section>
  );
}
