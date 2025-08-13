import React, { useState } from 'react';
import { Heart, Menu, X } from 'lucide-react';

const defaultNavigationItems = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'About', href: '/#about' },
  { label: 'Support', href: '/#support' },
  { label: 'Start Creating', href: '/#gifts', variant: 'primary' }
];

export const Header = ({
  navigationItems = defaultNavigationItems,
  showLogo = true,
  className = ''
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(v => !v);

  const getButtonStyles = (variant = 'default') => {
    const base = 'px-3.5 md:px-4 py-1.5 md:py-2 rounded-full text-sm font-medium transition-all duration-200';
    switch (variant) {
      case 'primary':
        return [
            base,
            // base gradient
            'text-white bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400',
            // warmer hover gradient (no blue)
            'hover:from-fuchsia-500 hover:via-rose-500 hover:to-amber-400 hover:brightness-105',
            // subtle motion & glow
            'shadow-[0_10px_25px_-10px_rgba(244,63,94,.55)] hover:shadow-[0_14px_32px_-10px_rgba(244,63,94,.7)] hover:scale-[1.02]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60'
          ].join(' ');
      case 'secondary':
        return [
          base,
          'text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100'
        ].join(' ');
      default:
        // subtle underline-on-hover for text links
        return [
          base,
          'text-slate-700 hover:text-slate-900 relative',
          'after:absolute after:-bottom-1 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2',
          'after:rounded-full after:bg-gradient-to-r after:from-pink-400 after:to-amber-300 hover:after:w-3/4 after:transition-all'
        ].join(' ');
    }
  };

  return (
    <header className={`sticky top-0 z-40 isolate ${className}`}>
      {/* Glow field behind the bar */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute w-[28%] h-[180%] -top-1/2 -left-20 bg-pink-300/30 blur-3xl rounded-full animate-pulse" />
        <div className="absolute w-[18%] h-[140%] -top-1/3 left-1/3 bg-rose-300/25 blur-3xl rounded-full animate-pulse" />
        <div className="absolute w-[22%] h-[140%] -top-1/3 right-10 bg-yellow-200/25 blur-3xl rounded-full animate-pulse" />
        <div className="absolute w-[20%] h-[140%] -top-1/3 right-1/3 bg-fuchsia-200/20 blur-3xl rounded-full animate-pulse" />
      </div>

      {/* Bar with frosted glass effect */}
      <div className="relative backdrop-blur-xl bg-white/65 supports-[backdrop-filter]:bg-white/55 border-b border-white/50">
        {/* Foreground glow blobs (over the bar, blurred by frosted glass) */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-6 left-10 w-40 h-40 bg-pink-300/35 blur-3xl rounded-full" />
          <div className="absolute -top-8 right-24 w-48 h-48 bg-amber-200/30 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-40 bg-rose-300/25 blur-3xl rounded-full" />
          {/* optional extra hue for variety */}
          <div className="absolute top-2 right-1/3 w-40 h-40 bg-fuchsia-200/25 blur-3xl rounded-full" />
        </div>
        <nav className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex h-14 md:h-16 items-center justify-between">
            {/* Logo */}
            {showLogo && (
              <a href="/" className="flex items-center gap-2">
                <span className="relative inline-flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-md">
                  <Heart className="h-4 w-4" />
                  <span className="absolute inset-0 rounded-full ring-2 ring-white/30" />
                </span>
                <span className="text-[15px] md:text-base font-semibold tracking-tight text-slate-800">Dearly</span>
              </a>
            )}

            {/* Desktop Navigation */}
            <ul className="hidden md:flex items-center gap-2">
              {navigationItems.map((item, i) => (
                <li key={i}>
                  <a href={item.href} className={getButtonStyles(item.variant)}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/60 bg-white/70 text-slate-700"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/50 bg-white/80 backdrop-blur-xl">
            <nav className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-2">
              {navigationItems.map((item, i) => (
                <a
                  key={i}
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

      {/* Under-header pastel spill */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-24 h-28 -z-10">
        <div className="absolute left-8 -top-16 w-72 h-72 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="absolute right-10 -top-20 w-64 h-64 rounded-full bg-amber-200/35 blur-3xl" />
        <div className="absolute left-1/3 -top-12 w-60 h-60 rounded-full bg-rose-200/25 blur-3xl" />
      </div>

      {/* Subtle gradient bottom line for depth */}
      <div className="pointer-events-none select-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-rose-200/70 to-transparent" />
    </header>
  );
};
