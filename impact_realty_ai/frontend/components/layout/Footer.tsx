'use client';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border px-6 py-4 mt-auto">
      <div className="flex items-center justify-between max-w-7xl mx-auto text-sm text-muted">
        <div className="flex items-center space-x-4">
          <span>Agentic OS v1.0.0</span>
          <span>•</span>
          <span>Impact Realty AI</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <a 
            href="#" 
            className="hover:text-text transition-colors duration-200"
          >
            Documentation
          </a>
          <a 
            href="#" 
            className="hover:text-text transition-colors duration-200"
          >
            Support
          </a>
          <a 
            href="#" 
            className="hover:text-text transition-colors duration-200"
          >
            API
          </a>
        </div>
      </div>
    </footer>
  );
} 