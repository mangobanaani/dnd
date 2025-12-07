import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Add custom render function with providers if needed
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

// Re-export everything
export * from '@testing-library/react'
export { renderWithProviders as render }
