import React from 'react'
import { render, screen } from '@/__tests__/utils/test-utils'
import { Input } from '@/app/components/ui/input'
import userEvent from '@testing-library/user-event'
import { Mail, Search } from 'lucide-react'

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('renders with label', () => {
      render(<Input label="Username" />)
      expect(screen.getByLabelText('Username')).toBeInTheDocument()
      expect(screen.getByText('Username')).toBeInTheDocument()
    })

    it('renders without label', () => {
      render(<Input />)
      const labels = screen.queryAllByRole('label')
      expect(labels).toHaveLength(0)
    })
  })

  describe('Input Types', () => {
    it('renders text input by default', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
    })

    it('renders email input', () => {
      render(<Input type="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    })

    it('renders password input', () => {
      render(<Input type="password" />)
      const inputs = document.querySelectorAll('input[type="password"]')
      expect(inputs.length).toBe(1)
      expect(inputs[0]).toHaveAttribute('type', 'password')
    })

    it('renders number input', () => {
      render(<Input type="number" />)
      expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
    })
  })

  describe('Error States', () => {
    it('renders without error by default', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).not.toHaveClass('border-[#ef4444]')
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    })

    it('displays error message', () => {
      render(<Input error="This field is required" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('applies error styling when error exists', () => {
      render(<Input error="Error" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-[#ef4444]')
    })

    it('shows error message in red', () => {
      render(<Input error="Error message" />)
      const errorText = screen.getByText('Error message')
      expect(errorText).toHaveClass('text-[#ef4444]')
    })
  })

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Input disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('applies disabled styling', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
    })

    it('handles required attribute', () => {
      render(<Input required />)
      expect(screen.getByRole('textbox')).toBeRequired()
    })

    it('handles readonly attribute', () => {
      render(<Input readOnly value="Read only" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('readonly')
    })
  })

  describe('User Interactions', () => {
    it('accepts text input', async () => {
      const user = userEvent.setup()
      render(<Input />)
      const input = screen.getByRole('textbox')

      await user.type(input, 'Hello World')
      expect(input).toHaveValue('Hello World')
    })

    it('calls onChange handler', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()

      render(<Input onChange={handleChange} />)
      const input = screen.getByRole('textbox')

      await user.type(input, 'Test')
      expect(handleChange).toHaveBeenCalled()
      expect(handleChange).toHaveBeenCalledTimes(4) // Once per character
    })

    it('calls onFocus handler', async () => {
      const handleFocus = jest.fn()
      const user = userEvent.setup()

      render(<Input onFocus={handleFocus} />)
      const input = screen.getByRole('textbox')

      await user.click(input)
      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('calls onBlur handler', async () => {
      const handleBlur = jest.fn()
      const user = userEvent.setup()

      render(<Input onBlur={handleBlur} />)
      const input = screen.getByRole('textbox')

      await user.click(input)
      await user.tab()
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('does not accept input when disabled', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()

      render(<Input disabled onChange={handleChange} />)
      const input = screen.getByRole('textbox')

      await user.type(input, 'Test')
      expect(handleChange).not.toHaveBeenCalled()
      expect(input).toHaveValue('')
    })
  })

  describe('Value Management', () => {
    it('displays initial value', () => {
      render(<Input value="Initial value" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('Initial value')
    })

    it('updates value when controlled', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('')
        return (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        )
      }

      const user = userEvent.setup()
      render(<TestComponent />)
      const input = screen.getByRole('textbox')

      await user.type(input, 'New value')
      expect(input).toHaveValue('New value')
    })

    it('supports defaultValue for uncontrolled input', () => {
      render(<Input defaultValue="Default" />)
      expect(screen.getByRole('textbox')).toHaveValue('Default')
    })
  })

  describe('HTML Attributes', () => {
    it('accepts custom className', () => {
      render(<Input className="custom-input" />)
      expect(screen.getByRole('textbox')).toHaveClass('custom-input')
    })

    it('sets maxLength attribute', () => {
      render(<Input maxLength={10} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '10')
    })

    it('sets minLength attribute', () => {
      render(<Input minLength={5} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('minLength', '5')
    })

    it('sets pattern attribute', () => {
      render(<Input pattern="[0-9]*" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('pattern', '[0-9]*')
    })

    it('sets autocomplete attribute', () => {
      render(<Input autoComplete="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('autoComplete', 'email')
    })

    it('supports ref forwarding', () => {
      const ref = jest.fn()
      render(<Input ref={ref} />)
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper role', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('associates label with input', () => {
      render(<Input label="Email Address" />)
      const input = screen.getByLabelText('Email Address')
      expect(input).toBeInTheDocument()
    })

    it('is focusable', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      input.focus()
      expect(input).toHaveFocus()
    })

    it('is not focusable when disabled', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      input.focus()
      expect(input).not.toHaveFocus()
    })

    it('supports aria-label', () => {
      render(<Input aria-label="Search" />)
      expect(screen.getByLabelText('Search')).toBeInTheDocument()
    })

    it('supports aria-describedby for error', () => {
      render(<Input error="Error message" aria-describedby="error-message" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'error-message')
    })
  })

  describe('Styling', () => {
    it('applies base styling', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('w-full', 'rounded-lg', 'glass-card')
    })

    it('applies premium dark theme colors', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('text-[#f5f5f5]')
      expect(input).toHaveClass('border-[#1a1a1f]')
    })

    it('applies purple glow on focus', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus:border-[#9d6fff]')
    })
  })

  describe('Floating Labels', () => {
    it('label floats up when input has value', () => {
      render(<Input label="Email" value="test@example.com" onChange={() => {}} />)
      const label = screen.getByText('Email')
      expect(label).toHaveClass('top-1', 'text-xs', 'text-[#9d6fff]')
    })

    it('label is in normal position when input is empty', () => {
      render(<Input label="Email" />)
      const label = screen.getByText('Email')
      expect(label).toHaveClass('top-3.5', 'text-sm', 'text-[#a1a1aa]')
    })

    it('label floats up when input is focused', async () => {
      const user = userEvent.setup()
      render(<Input label="Email" />)
      const input = screen.getByRole('textbox')
      const label = screen.getByText('Email')

      await user.click(input)
      expect(label).toHaveClass('top-1', 'text-xs', 'text-[#9d6fff]')
    })

    it('label returns to normal position when input is blurred and empty', async () => {
      const user = userEvent.setup()
      render(<Input label="Email" />)
      const input = screen.getByRole('textbox')
      const label = screen.getByText('Email')

      await user.click(input)
      await user.tab()
      expect(label).toHaveClass('top-3.5', 'text-sm', 'text-[#a1a1aa]')
    })
  })

  describe('Icons', () => {
    it('renders with icon on the left by default', () => {
      const { container } = render(<Input icon={Mail} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders with icon on the right', () => {
      const { container } = render(<Input icon={Search} iconPosition="right" />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders without icon when not provided', () => {
      const { container } = render(<Input />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBe(0)
    })

    it('adjusts label position when icon is present on left', () => {
      render(<Input label="Email" icon={Mail} iconPosition="left" />)
      const label = screen.getByText('Email')
      expect(label).toHaveClass('left-12')
    })

    it('changes icon color when error is present', () => {
      const { container } = render(<Input icon={Mail} error="Error" />)
      const iconWrapper = container.querySelector('[class*="text-[#ef4444]"]')
      expect(iconWrapper).toBeInTheDocument()
    })

    it('changes icon color when success is true', () => {
      const { container } = render(<Input icon={Mail} success />)
      const iconWrapper = container.querySelector('[class*="text-[#10b981]"]')
      expect(iconWrapper).toBeInTheDocument()
    })
  })

  describe('Success State', () => {
    it('applies success border color', () => {
      render(<Input success />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-[#10b981]')
    })

    it('applies success glow on focus', () => {
      render(<Input success />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus:border-[#10b981]')
    })

    it('prioritizes error over success', () => {
      render(<Input success error="Error message" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-[#ef4444]')
      expect(input).not.toHaveClass('border-[#10b981]')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty value', () => {
      render(<Input defaultValue="" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('')
    })

    it('handles very long text', async () => {
      const longText = 'A'.repeat(1000)
      render(<Input value={longText} onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue(longText)
    })

    it('handles special characters', async () => {
      const user = userEvent.setup()
      render(<Input />)
      const input = screen.getByRole('textbox')

      await user.type(input, '!@#$%^&*()')
      expect(input).toHaveValue('!@#$%^&*()')
    })

    it('handles label with error simultaneously', () => {
      render(<Input label="Username" error="Required" />)
      expect(screen.getByLabelText('Username')).toBeInTheDocument()
      expect(screen.getByText('Required')).toBeInTheDocument()
    })
  })
})
