export default function Footer() {
  return (
    <footer className="w-full mt-12 bg-card py-8 border-t border-border shadow-neumorph">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-lg font-heading font-semibold text-primary">SaaSify</div>
        <div className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} SaaSify. All rights reserved.</div>
        <div className="flex gap-3">
          <a href="#" className="hover:text-primary transition-colors" aria-label="Twitter">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 4.01c-.77.35-1.6.59-2.47.7a4.07 4.07 0 0 0 1.8-2.24c-.8.48-1.69.84-2.64 1.03A4.13 4.13 0 0 0 16.1 3c-2.3 0-4.16 1.86-4.16 4.16 0 .33.04.65.11.96C7.69 7.84 4.06 6.13 1.67 3.2c-.36.63-.57 1.36-.57 2.14 0 1.48.75 2.8 1.88 3.57a4.1 4.1 0 0 1-1.89-.52v.05c0 2.07 1.47 3.8 3.42 4.19-.36.1-.74.15-1.13.15-.28 0-.54-.03-.8-.08.54 1.68 2.13 2.91 4.01 2.94A8.3 8.3 0 0 1 2 19.54c-.44 0-.88-.02-1.3-.08A11.72 11.72 0 0 0 7.29 21.99c7.55 0 11.68-6.26 11.68-11.68l-.01-.53A8.35 8.35 0 0 0 22 4.01z" /></svg>
          </a>
          <a href="#" className="hover:text-accent transition-colors" aria-label="GitHub">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.86-.01-1.69-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.12-4.56-5A3.91 3.91 0 0 1 6.29 7.8a3.64 3.64 0 0 1 .1-2.68s.84-.27 2.75 1.02A9.51 9.51 0 0 1 12 5.8c.85.004 1.71.12 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.68a3.93 3.93 0 0 1 1.04 2.74c0 3.89-2.34 4.75-4.57 5 .36.31.68.92.68 1.86 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z" /></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
