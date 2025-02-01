import { render, screen } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import Button from '../Button.vue'
import '@testing-library/jest-dom'

describe('Button.vue', () => {
  it('renders the button with provided text', async () => {
    render(Button, { props: { text: 'Click me' } })
    expect(screen.getByText('Click me')).toBeInTheDocument() 
  })
})
