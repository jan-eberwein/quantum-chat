import { render, fireEvent, screen } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import DarkModeToggle from '../DarkModeToggle.vue'

describe('DarkModeToggle.vue', () => {
  it('toggles dark mode', async () => {
    render(DarkModeToggle)
    
    const button = screen.getByRole('button')
    expect(button.textContent).toContain('Dark Mode 🌙')

    await fireEvent.click(button)
    expect(button.textContent).toContain('Light Mode 🌞')
  })
})
