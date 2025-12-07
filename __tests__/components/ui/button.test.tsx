import { render, screen } from '@/__tests__/utils/test-utils'
import { Button } from '@/app/components/ui/button'
import userEvent from '@testing-library/user-event'
import { Sword } from 'lucide-react'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with text content', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('renders with children elements', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      )
      expect(screen.getByText('Icon')).toBeInTheDocument()
      expect(screen.getByText('Text')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('renders primary variant by default', () => {
      render(<Button>Primary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-[#9d6fff]')
    })

    it('renders premium variant', () => {
      render(<Button variant="premium">Premium</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gradient-to-br', 'from-[#9d6fff]')
    })

    it('renders gold variant', () => {
      render(<Button variant="gold">Gold</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gradient-to-br', 'from-[#d4af37]')
    })

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-[#1a1a1f]')
    })

    it('renders outline variant', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border')
    })

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-[#1a1a1f]')
    })

    it('renders ghostGold variant', () => {
      render(<Button variant="ghostGold">Ghost Gold</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border-[#d4af37]/40', 'text-[#d4af37]')
    })

    it('renders danger variant', () => {
      render(<Button variant="danger">Danger</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-[#ef4444]')
    })
  })

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      render(<Button>Medium</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-6', 'py-3')
    })

    it('renders small size', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-4', 'py-2')
    })

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-8', 'py-4')
    })
  })

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:opacity-50')
    })

    it('shows loading state', () => {
      render(<Button isLoading>Loading</Button>)
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('shows spinner icon when loading', () => {
      render(<Button isLoading>Submit</Button>)
      const button = screen.getByRole('button')
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('animate-spin')
    })

    it('disables button when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('Interactions', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>Click</Button>)
      await user.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick} disabled>Click</Button>)
      await user.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('does not call onClick when loading', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick} isLoading>Click</Button>)
      await user.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('supports keyboard interaction (Enter)', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>Click</Button>)
      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{Enter}')

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('supports keyboard interaction (Space)', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>Click</Button>)
      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard(' ')

      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('HTML Attributes', () => {
    it('accepts custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })

    it('sets button type attribute', () => {
      render(<Button type="submit">Submit</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('spreads additional props', () => {
      render(<Button data-testid="custom-button">Button</Button>)
      expect(screen.getByTestId('custom-button')).toBeInTheDocument()
    })

    it('supports ref forwarding', () => {
      const ref = jest.fn()
      render(<Button ref={ref}>Button</Button>)
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper role', () => {
      render(<Button>Accessible</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('is focusable', () => {
      render(<Button>Focus me</Button>)
      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()
    })

    it('is not focusable when disabled', () => {
      render(<Button disabled>Not focusable</Button>)
      const button = screen.getByRole('button')
      button.focus()
      expect(button).not.toHaveFocus()
    })

    it('has depth shift animation class', () => {
      render(<Button>Hover</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:translate-y-[1px]')
      expect(button).toHaveClass('active:translate-y-[2px]')
    })
  })

  describe('Icons', () => {
    it('renders with icon on the left by default', () => {
      render(<Button icon={Sword}>Attack</Button>)
      const button = screen.getByRole('button')
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders with icon on the right', () => {
      render(<Button icon={Sword} iconPosition="right">Next</Button>)
      const button = screen.getByRole('button')
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders without icon when not provided', () => {
      render(<Button>No Icon</Button>)
      const button = screen.getByRole('button')
      const svg = button.querySelector('svg')
      expect(svg).toBeNull()
    })

    it('does not render icon when loading', () => {
      render(<Button icon={Sword} isLoading>Loading</Button>)
      const button = screen.getByRole('button')
      // Should only have spinner SVG, not the icon
      const svgs = button.querySelectorAll('svg')
      expect(svgs.length).toBe(1) // Only spinner
      expect(svgs[0]).toHaveClass('animate-spin')
    })
  })

  describe('Edge Cases', () => {
    it('renders with empty children', () => {
      render(<Button>{''}</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('handles very long text', () => {
      const longText = 'A'.repeat(100)
      render(<Button>{longText}</Button>)
      expect(screen.getByRole('button')).toHaveTextContent(longText)
    })

    it('handles multiple state combinations', () => {
      render(
        <Button variant="danger" size="sm" disabled className="custom">
          Complex
        </Button>
      )
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('bg-[#ef4444]', 'px-4', 'custom')
    })
  })
})
