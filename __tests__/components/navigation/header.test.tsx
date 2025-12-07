import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/app/components/navigation/header';
import { usePathname } from 'next/navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock QuickDiceRoller
jest.mock('@/app/components/navigation/quick-dice-roller', () => ({
  QuickDiceRoller: () => <div data-testid="quick-dice-roller">Quick Dice</div>,
}));

describe('Header', () => {
  const mockUsePathname = usePathname as jest.Mock;

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  describe('Rendering', () => {
    it('renders the header with glass-premium background', () => {
      const { container } = render(<Header />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('glass-premium');
    });

    it('renders logo with display font', () => {
      render(<Header />);

      const logo = screen.getByText('D&D Manager');
      expect(logo).toHaveClass('font-display');
    });

    it('renders logo with gradient from purple to gold', () => {
      render(<Header />);

      const logo = screen.getByText('D&D Manager');
      expect(logo).toHaveClass('bg-gradient-to-r');
      expect(logo).toHaveClass('from-[#9d6fff]');
      expect(logo).toHaveClass('to-[#d4af37]');
    });

    it('renders all navigation items', () => {
      render(<Header />);

      expect(screen.getByText('Campaigns')).toBeInTheDocument();
      expect(screen.getByText('Characters')).toBeInTheDocument();
      expect(screen.getByText('Sessions')).toBeInTheDocument();
      expect(screen.getByText('Combat')).toBeInTheDocument();
      expect(screen.getByText('Dice')).toBeInTheDocument();
      expect(screen.getByText('Monsters')).toBeInTheDocument();
      expect(screen.getByText('Encounters')).toBeInTheDocument();
    });

    it('renders Quick Dice Roller', () => {
      render(<Header />);

      expect(screen.getAllByTestId('quick-dice-roller')).toHaveLength(2); // Desktop and mobile
    });

    it('renders desktop auth buttons', () => {
      render(<Header />);

      // Desktop auth buttons should always be visible
      const signInButtons = screen.getAllByText('Sign In');
      const signUpButtons = screen.getAllByText('Sign Up');

      expect(signInButtons.length).toBeGreaterThanOrEqual(1);
      expect(signUpButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('renders mobile auth buttons when menu is open', () => {
      render(<Header />);

      // Open mobile menu
      const menuButton = screen.getByText('☰');
      fireEvent.click(menuButton);

      // Both desktop and mobile auth buttons should be visible
      expect(screen.getAllByText('Sign In')).toHaveLength(2);
      expect(screen.getAllByText('Sign Up')).toHaveLength(2);
    });
  });

  describe('Navigation Icons', () => {
    it('uses Lucide icons instead of emojis', () => {
      const { container } = render(<Header />);

      // Should have SVG icons from Lucide, not emoji text
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);

      // Should not have emoji characters in nav links
      const navLinks = container.querySelectorAll('a');
      const hasEmojis = Array.from(navLinks).some(link =>
        /[\u{1F300}-\u{1F9FF}]/u.test(link.textContent || '')
      );
      expect(hasEmojis).toBe(false);
    });
  });

  describe('Active State', () => {
    it('highlights active nav link with gold underline', () => {
      mockUsePathname.mockReturnValue('/campaigns');
      const { container } = render(<Header />);

      // Find the Campaigns link
      const campaignsLink = screen.getAllByText('Campaigns')[0].closest('a');

      // Should have active styling
      expect(campaignsLink).toHaveClass('text-[#9d6fff]');

      // Should have gold underline animation
      const hasGoldUnderline = campaignsLink?.className.includes('after:bg-gradient-to-r') &&
                               campaignsLink?.className.includes('after:from-[#9d6fff]') &&
                               campaignsLink?.className.includes('after:to-[#d4af37]');
      expect(hasGoldUnderline).toBe(true);
    });

    it('applies correct styling to inactive nav links', () => {
      mockUsePathname.mockReturnValue('/campaigns');
      render(<Header />);

      // Characters link should be inactive
      const charactersLink = screen.getAllByText('Characters')[0].closest('a');
      expect(charactersLink).toHaveClass('text-[#a1a1aa]');
      expect(charactersLink).toHaveClass('hover:text-[#f5f5f5]');
    });

    it('identifies root path correctly', () => {
      mockUsePathname.mockReturnValue('/');
      render(<Header />);

      // Home link should be active only when pathname is exactly '/'
      const logoLink = screen.getByText('D&D Manager').closest('a');
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('identifies nested paths correctly', () => {
      mockUsePathname.mockReturnValue('/campaigns/some-campaign-id');
      render(<Header />);

      // Campaigns should still be active for nested paths
      const campaignsLink = screen.getAllByText('Campaigns')[0].closest('a');
      expect(campaignsLink).toHaveClass('text-[#9d6fff]');
    });
  });

  describe('Hover Effects', () => {
    it('applies gold underline animation on hover', () => {
      mockUsePathname.mockReturnValue('/');
      const { container } = render(<Header />);

      const campaignsLink = screen.getAllByText('Campaigns')[0].closest('a');

      // Should have after pseudo-element for underline
      expect(campaignsLink).toHaveClass('after:absolute');
      expect(campaignsLink).toHaveClass('after:bottom-0');
      expect(campaignsLink).toHaveClass('hover:after:scale-x-100');
    });
  });

  describe('Mobile Menu', () => {
    it('does not show mobile menu initially', () => {
      render(<Header />);

      // Mobile menu should not be visible initially
      const mobileNav = screen.queryByText('Home');
      expect(mobileNav).not.toBeInTheDocument();
    });

    it('toggles mobile menu when button is clicked', () => {
      render(<Header />);

      // Find mobile menu button
      const menuButton = screen.getByText('☰');

      // Click to open
      fireEvent.click(menuButton);

      // Mobile menu should now be visible
      expect(screen.getByText('Home')).toBeInTheDocument();

      // Button should change to close icon
      expect(screen.getByText('✕')).toBeInTheDocument();
    });

    it('closes mobile menu when a link is clicked', () => {
      render(<Header />);

      // Open mobile menu
      const menuButton = screen.getByText('☰');
      fireEvent.click(menuButton);

      // Click a navigation link
      const mobileHomeLink = screen.getByText('Home');
      fireEvent.click(mobileHomeLink);

      // Menu should close
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('applies glass-card styling to mobile menu', () => {
      const { container } = render(<Header />);

      // Open mobile menu
      const menuButton = screen.getByText('☰');
      fireEvent.click(menuButton);

      // Find mobile menu container
      const mobileMenu = container.querySelector('.md\\:hidden.mt-3');
      expect(mobileMenu).toHaveClass('glass-card');
    });
  });

  describe('Command Palette', () => {
    it('renders command palette button on large screens', () => {
      render(<Header />);

      const cmdButton = screen.getByText('Search');
      expect(cmdButton).toBeInTheDocument();
    });

    it('triggers keyboard event when command palette button is clicked', () => {
      render(<Header />);

      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

      const cmdButton = screen.getByText('Search');
      fireEvent.click(cmdButton);

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'k',
        })
      );

      dispatchEventSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic HTML', () => {
      const { container } = render(<Header />);

      const header = container.querySelector('header');
      const nav = container.querySelector('nav');

      expect(header).toBeInTheDocument();
      expect(nav).toBeInTheDocument();
    });

    it('has proper link structure', () => {
      render(<Header />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);

      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Color System', () => {
    it('uses updated purple color (#9d6fff)', () => {
      mockUsePathname.mockReturnValue('/campaigns');
      render(<Header />);

      const activeLink = screen.getAllByText('Campaigns')[0].closest('a');
      expect(activeLink?.className).toContain('#9d6fff');
    });

    it('uses gold accent color (#d4af37)', () => {
      render(<Header />);

      const logo = screen.getByText('D&D Manager');
      expect(logo.className).toContain('#d4af37');
    });

    it('uses new muted text color (#a1a1aa)', () => {
      mockUsePathname.mockReturnValue('/');
      render(<Header />);

      const inactiveLink = screen.getAllByText('Campaigns')[0].closest('a');
      expect(inactiveLink).toHaveClass('text-[#a1a1aa]');
    });
  });
});
