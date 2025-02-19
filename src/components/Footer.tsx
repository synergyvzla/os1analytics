
import React from 'react';
import { Instagram, Facebook, Twitter, Linkedin, Globe } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-white py-6 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-end gap-4">
          <p className="text-primary text-lg font-medium">@welldonemitigation</p>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/welldonemitigation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a
              href="https://facebook.com/welldonemitigation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <Facebook className="h-6 w-6" />
            </a>
            <a
              href="https://twitter.com/welldonemitigation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <Twitter className="h-6 w-6" />
            </a>
            <a
              href="https://tiktok.com/@welldonemitigation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="h-6 w-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            <a
              href="https://linkedin.com/company/welldonemitigation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
          <a
            href="https://www.welldonemitigation.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <Globe className="h-5 w-5" />
            <span className="text-lg">www.welldonemitigation.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
