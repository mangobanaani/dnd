import { render, screen } from '@/__tests__/utils/test-utils'
import { Card, CardHeader, CardFooter } from '@/app/components/ui/card'
import { Sword, Shield } from 'lucide-react'

describe('Card Component', () => {
  describe('Rendering', () => {
    it('renders with children', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('renders with complex children', () => {
      render(
        <Card>
          <div>Header</div>
          <div>Body</div>
          <div>Footer</div>
        </Card>
      )
      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Body')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('renders default variant', () => {
      const { container } = render(<Card>Default</Card>)
      const card = container.firstChild
      expect(card).toHaveClass('border-[#1a1a1f]')
    })

    it('renders premium variant', () => {
      const { container } = render(<Card variant="premium">Premium</Card>)
      const card = container.firstChild
      expect(card).toHaveClass('border-[#9d6fff]/20')
    })

    it('renders gold variant', () => {
      const { container } = render(<Card variant="gold">Gold</Card>)
      const card = container.firstChild
      expect(card).toHaveClass('border-[#d4af37]/20')
    })
  })

  describe('Hover Effects', () => {
    it('has hover effect by default', () => {
      const { container } = render(<Card>Hover me</Card>)
      const card = container.firstChild
      expect(card).toHaveClass('hover:border-[#9d6fff]/30')
    })

    it('can disable hover effect', () => {
      const { container } = render(<Card hover={false}>No hover</Card>)
      const card = container.firstChild
      expect(card).not.toHaveClass('hover:border-[#9d6fff]/30')
    })
  })

  describe('Styling', () => {
    it('applies glass-card effect', () => {
      const { container } = render(<Card>Glass</Card>)
      const card = container.firstChild
      expect(card).toHaveClass('glass-card')
    })

    it('has rounded corners', () => {
      const { container } = render(<Card>Rounded</Card>)
      const card = container.firstChild
      expect(card).toHaveClass('rounded-xl')
    })

    it('has padding', () => {
      const { container } = render(<Card>Padded</Card>)
      const card = container.firstChild
      expect(card).toHaveClass('p-6')
    })

    it('accepts custom className', () => {
      const { container } = render(<Card className="custom-class">Custom</Card>)
      const card = container.firstChild
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('HTML Attributes', () => {
    it('spreads additional props', () => {
      render(<Card data-testid="custom-card">Content</Card>)
      expect(screen.getByTestId('custom-card')).toBeInTheDocument()
    })

    it('supports onClick handler', () => {
      const handleClick = jest.fn()
      const { container } = render(<Card onClick={handleClick}>Clickable</Card>)
      const card = container.firstChild as HTMLElement
      card.click()
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })
})

describe('CardHeader Component', () => {
  describe('Rendering', () => {
    it('renders title', () => {
      render(<CardHeader title="Card Title" />)
      expect(screen.getByText('Card Title')).toBeInTheDocument()
    })

    it('renders with subtitle', () => {
      render(<CardHeader title="Title" subtitle="Subtitle text" />)
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Subtitle text')).toBeInTheDocument()
    })

    it('renders without subtitle', () => {
      render(<CardHeader title="Just Title" />)
      expect(screen.getByText('Just Title')).toBeInTheDocument()
    })
  })

  describe('Icons', () => {
    it('renders with icon', () => {
      const { container } = render(<CardHeader title="Title" icon={Sword} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders without icon when not provided', () => {
      const { container } = render(<CardHeader title="No Icon" />)
      const svg = container.querySelector('svg')
      expect(svg).not.toBeInTheDocument()
    })

    it('applies purple variant to icon by default', () => {
      const { container } = render(<CardHeader title="Title" icon={Shield} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('text-[#9d6fff]')
    })

    it('applies gold variant to icon', () => {
      const { container } = render(
        <CardHeader title="Title" icon={Shield} iconVariant="gold" />
      )
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('text-[#d4af37]')
    })

    it('applies default variant to icon', () => {
      const { container } = render(
        <CardHeader title="Title" icon={Shield} iconVariant="default" />
      )
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('text-[#f5f5f5]')
    })

    it('applies glow effect to purple icon', () => {
      const { container } = render(
        <CardHeader title="Title" icon={Shield} iconVariant="purple" />
      )
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('drop-shadow-[0_0_8px_rgba(157,111,255,0.6)]')
    })

    it('applies glow effect to gold icon', () => {
      const { container } = render(
        <CardHeader title="Title" icon={Shield} iconVariant="gold" />
      )
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]')
    })
  })

  describe('Styling', () => {
    it('uses display font for title', () => {
      render(<CardHeader title="Display Title" />)
      const title = screen.getByText('Display Title')
      expect(title).toHaveClass('font-display')
    })

    it('applies text glow to title', () => {
      render(<CardHeader title="Glowing Title" />)
      const title = screen.getByText('Glowing Title')
      expect(title).toHaveClass('text-glow-purple')
    })

    it('has bottom border', () => {
      const { container } = render(<CardHeader title="Bordered" />)
      const header = container.firstChild
      expect(header).toHaveClass('border-b', 'border-[#1a1a1f]')
    })

    it('has padding and margin', () => {
      const { container } = render(<CardHeader title="Padded" />)
      const header = container.firstChild
      expect(header).toHaveClass('pb-4', 'mb-4')
    })

    it('subtitle has correct styling', () => {
      render(<CardHeader title="Title" subtitle="Subtitle" />)
      const subtitle = screen.getByText('Subtitle')
      expect(subtitle).toHaveClass('text-sm', 'text-[#a1a1aa]', 'mt-1')
    })
  })
})

describe('CardFooter Component', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(<CardFooter>Footer content</CardFooter>)
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('renders complex children', () => {
      render(
        <CardFooter>
          <button>Action</button>
          <span>Info</span>
        </CardFooter>
      )
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(screen.getByText('Info')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('has top border', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>)
      const footer = container.firstChild
      expect(footer).toHaveClass('border-t', 'border-[#1a1a1f]')
    })

    it('has top padding', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>)
      const footer = container.firstChild
      expect(footer).toHaveClass('pt-4')
    })

    it('accepts custom className', () => {
      const { container } = render(
        <CardFooter className="custom-footer">Footer</CardFooter>
      )
      const footer = container.firstChild
      expect(footer).toHaveClass('custom-footer')
    })
  })
})

describe('Card Integration', () => {
  it('renders complete card with all components', () => {
    render(
      <Card variant="premium">
        <CardHeader title="Premium Card" subtitle="With all features" icon={Sword} />
        <div>Main content</div>
        <CardFooter>Footer actions</CardFooter>
      </Card>
    )

    expect(screen.getByText('Premium Card')).toBeInTheDocument()
    expect(screen.getByText('With all features')).toBeInTheDocument()
    expect(screen.getByText('Main content')).toBeInTheDocument()
    expect(screen.getByText('Footer actions')).toBeInTheDocument()
  })

  it('renders card without header or footer', () => {
    render(<Card>Just content</Card>)
    expect(screen.getByText('Just content')).toBeInTheDocument()
  })
})
