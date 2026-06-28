"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QuickDiceRoller } from './quick-dice-roller';
import {
  Home,
  Map,
  ScrollText,
  Calendar,
  Swords,
  Dices,
  Skull,
  Sparkles,
  Dice6,
} from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/campaigns', label: 'Campaigns', icon: Map },
    { href: '/characters', label: 'Characters', icon: ScrollText },
    { href: '/sessions', label: 'Sessions', icon: Calendar },
    { href: '/combat', label: 'Combat', icon: Swords },
    { href: '/dice', label: 'Dice', icon: Dices },
    { href: '/monsters', label: 'Monsters', icon: Skull },
    { href: '/encounters', label: 'Encounters', icon: Sparkles },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 glass-premium border-b border-[#1a1a1f]">
      <nav className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Dice6 size={28} className="text-[#9d6fff] group-hover:text-[#d4af37] transition-all duration-350" />
            <span className="text-2xl font-display bg-gradient-to-r from-[#9d6fff] to-[#d4af37] bg-clip-text text-transparent">
              D&D Manager
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative px-4 py-2 text-sm font-medium transition-all duration-350
                  after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5
                  after:bg-gradient-to-r after:from-[#9d6fff] after:to-[#d4af37]
                  after:scale-x-0 after:origin-left after:transition-transform after:duration-350
                  ${isActive(item.href)
                    ? 'text-[#9d6fff] after:scale-x-100'
                    : 'text-[#a1a1aa] hover:text-[#f5f5f5] hover:after:scale-x-100'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <item.icon size={18} />
                  {item.label}
                </span>
              </Link>
            ))}
            <QuickDiceRoller />

            {/* Command Palette Hint */}
            <button
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#27272a]/50 hover:bg-[#27272a] transition-colors text-xs text-[#a1a1aa] border border-[#27272a]"
              onClick={() => {
                const event = new KeyboardEvent('keydown', {
                  key: 'k',
                  metaKey: true,
                  ctrlKey: true,
                });
                window.dispatchEvent(event);
              }}
            >
              <span>⌘K</span>
              <span>Search</span>
            </button>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[#27272a]">
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#9d6fff] hover:bg-[#7c3aed] text-white transition-all"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button & Quick Dice */}
          <div className="md:hidden flex items-center gap-2">
            <QuickDiceRoller />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className="p-2 text-[#fafafa] hover:bg-[#27272a] rounded-lg transition-colors"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden mt-3 pb-2 space-y-1 glass-card rounded-lg p-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? 'bg-[#9d6fff]/20 text-[#9d6fff] border border-[#9d6fff]/30'
                    : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <item.icon size={18} />
                  {item.label}
                </span>
              </Link>
            ))}

            {/* Mobile Auth Buttons */}
            <div className="pt-3 mt-3 border-t border-[#27272a] space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-center text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-center bg-[#9d6fff] hover:bg-[#7c3aed] text-white transition-all"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
