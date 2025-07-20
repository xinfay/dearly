import React, { useState } from 'react';
import { Heart, Menu, X } from 'lucide-react';

const defaultNavigationItems = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'About', href: '#about' },
  { label: 'Support', href: '#support' },
  { label: 'Start Creating', href: '/build', variant: 'primary' }
];

export const Header = ({
  navigationItems = defaultNavigationItems,
  showLogo = true,
  className = ''
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getButtonStyles = (variant = 'default') => {
    const baseStyles = 'px-4 py-2 rounded-full font-medium transition-all duration-200 text-sm';

    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-rose-500 text-white hover:bg-rose-600 shadow-sm hover:shadow-md`;
      case 'secondary':
        return `${baseStyles} bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200`;
      default:
        return `${baseStyles} text-gray-700 hover:text-rose-600 hover:bg-rose-50`;
    }
  };

  return (
    <header className={`bg-white/95 backdrop-blur-sm border-b border-rose-100 sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          {showLogo && (
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-rose-500" />
              <h1 className="font-playfair text-xl font-bold text-gray-900">
                Dearly
              </h1>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={getButtonStyles(item.variant)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-rose-100 py-4">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className={`${getButtonStyles(item.variant)} text-center`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent opacity-50"></div>
    </header>
  );
};