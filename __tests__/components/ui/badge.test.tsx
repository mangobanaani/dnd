import { render, screen } from '@/__tests__/utils/test-utils'
import { Badge } from '@/app/components/ui/badge'
import { Star, Crown } from 'lucide-react'

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('renders with text content', () => {
      render(<Badge>Badge Text</Badge>)
      expect(screen.getByText('Badge Text')).toBeInTheDocument()
    })

    it('renders with complex children', () => {
      render(
        <Badge>
          <span>Count:</span>
          <span>5</span>
        </Badge>
      )
      expect(screen.getByText('Count:')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('renders default variant', () => {
      const { container } = render(<Badge>Default</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-[#1a1a1f]', 'text-[#f5f5f5]')
    })

    it('renders primary variant', () => {
      const { container } = render(<Badge variant="primary">Primary</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-[#9d6fff]/20', 'text-[#9d6fff]')
    })

    it('renders gold variant', () => {
      const { container } = render(<Badge variant="gold">Gold</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-[#d4af37]/20', 'text-[#d4af37]')
    })

    it('renders success variant', () => {
      const { container } = render(<Badge variant="success">Success</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-[#10b981]/20', 'text-[#10b981]')
    })

    it('renders warning variant', () => {
      const { container } = render(<Badge variant="warning">Warning</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-[#f59e0b]/20', 'text-[#f59e0b]')
    })

    it('renders danger variant', () => {
      const { container } = render(<Badge variant="danger">Danger</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-[#ef4444]/20', 'text-[#ef4444]')
    })

    it('renders outline variant', () => {
      const { container } = render(<Badge variant="outline">Outline</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('border', 'border-[#1a1a1f]', 'bg-transparent')
    })

    it('renders ghost variant', () => {
      const { container } = render(<Badge variant="ghost">Ghost</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('text-[#a1a1aa]', 'bg-transparent')
    })
  })

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      const { container } = render(<Badge>Medium</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('px-3', 'py-1', 'text-sm')
    })

    it('renders small size', () => {
      const { container } = render(<Badge size="sm">Small</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs')
    })

    it('renders large size', () => {
      const { container } = render(<Badge size="lg">Large</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('px-4', 'py-1.5', 'text-base')
    })
  })

  describe('Glow Effect', () => {
    it('does not have glow by default', () => {
      const { container } = render(<Badge variant="primary">No Glow</Badge>)
      const badge = container.firstChild
      expect(badge?.toString()).not.toContain('shadow-[0_0_12px')
    })

    it('applies glow to primary variant when enabled', () => {
      const { container } = render(
        <Badge variant="primary" glow>
          Glow
        </Badge>
      )
      const badge = container.firstChild
      expect(badge).toHaveClass('shadow-[0_0_12px_rgba(157,111,255,0.4)]')
    })

    it('applies glow to gold variant when enabled', () => {
      const { container } = render(
        <Badge variant="gold" glow>
          Gold Glow
        </Badge>
      )
      const badge = container.firstChild
      expect(badge).toHaveClass('shadow-[0_0_12px_rgba(212,175,55,0.4)]')
    })

    it('applies glow to success variant when enabled', () => {
      const { container } = render(
        <Badge variant="success" glow>
          Success Glow
        </Badge>
      )
      const badge = container.firstChild
      expect(badge).toHaveClass('shadow-[0_0_12px_rgba(16,185,129,0.4)]')
    })

    it('applies glow to warning variant when enabled', () => {
      const { container } = render(
        <Badge variant="warning" glow>
          Warning Glow
        </Badge>
      )
      const badge = container.firstChild
      expect(badge).toHaveClass('shadow-[0_0_12px_rgba(245,158,11,0.4)]')
    })

    it('applies glow to danger variant when enabled', () => {
      const { container } = render(
        <Badge variant="danger" glow>
          Danger Glow
        </Badge>
      )
      const badge = container.firstChild
      expect(badge).toHaveClass('shadow-[0_0_12px_rgba(239,68,68,0.4)]')
    })
  })

  describe('Icons', () => {
    it('renders with icon on the left by default', () => {
      const { container } = render(<Badge icon={Star}>Starred</Badge>)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders with icon on the right', () => {
      const { container } = render(
        <Badge icon={Crown} iconPosition="right">
          Legendary
        </Badge>
      )
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders without icon when not provided', () => {
      const { container } = render(<Badge>No Icon</Badge>)
      const svg = container.querySelector('svg')
      expect(svg).not.toBeInTheDocument()
    })

    it('uses correct icon size for small badge', () => {
      const { container } = render(
        <Badge size="sm" icon={Star}>
          Small
        </Badge>
      )
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('width', '12')
    })

    it('uses correct icon size for medium badge', () => {
      const { container } = render(
        <Badge size="md" icon={Star}>
          Medium
        </Badge>
      )
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('width', '14')
    })

    it('uses correct icon size for large badge', () => {
      const { container } = render(
        <Badge size="lg" icon={Star}>
          Large
        </Badge>
      )
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('width', '16')
    })
  })

  describe('Styling', () => {
    it('has rounded corners', () => {
      const { container } = render(<Badge>Rounded</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('rounded-md')
    })

    it('is inline-flex', () => {
      const { container } = render(<Badge>Inline</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('inline-flex')
    })

    it('has font-medium', () => {
      const { container } = render(<Badge>Medium Font</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('font-medium')
    })

    it('has premium transition', () => {
      const { container } = render(<Badge>Smooth</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('duration-[350ms]')
      expect(badge).toHaveClass('ease-[cubic-bezier(0.4,0.0,0.2,1)]')
    })

    it('accepts custom className', () => {
      const { container } = render(<Badge className="custom-badge">Custom</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('custom-badge')
    })
  })

  describe('HTML Attributes', () => {
    it('renders as span element', () => {
      const { container } = render(<Badge>Span</Badge>)
      expect(container.firstChild?.nodeName).toBe('SPAN')
    })

    it('spreads additional props', () => {
      render(<Badge data-testid="custom-badge">Badge</Badge>)
      expect(screen.getByTestId('custom-badge')).toBeInTheDocument()
    })

    it('supports onClick handler', () => {
      const handleClick = jest.fn()
      const { container } = render(<Badge onClick={handleClick}>Clickable</Badge>)
      const badge = container.firstChild as HTMLElement
      badge.click()
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      const { container } = render(<Badge>{''}</Badge>)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('handles very long text', () => {
      const longText = 'A'.repeat(100)
      render(<Badge>{longText}</Badge>)
      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('combines multiple features correctly', () => {
      const { container } = render(
        <Badge
          variant="gold"
          size="lg"
          glow
          icon={Crown}
          iconPosition="left"
          className="custom"
        >
          Premium Badge
        </Badge>
      )
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-[#d4af37]/20')
      expect(badge).toHaveClass('px-4', 'py-1.5', 'text-base')
      expect(badge).toHaveClass('shadow-[0_0_12px_rgba(212,175,55,0.4)]')
      expect(badge).toHaveClass('custom')
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })
})
