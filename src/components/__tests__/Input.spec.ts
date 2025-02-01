import { render, fireEvent } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import Input from '../Input.vue'

describe('Input.vue', () => {
  it('renders with placeholder and updates value', async () => {
    const { getByPlaceholderText, emitted } = render(Input, {
      props: { type: 'text', placeholder: 'Enter text', modelValue: '' }
    })

    const input = getByPlaceholderText('Enter text') as HTMLInputElement
    await fireEvent.update(input, 'Hello World')

    expect(emitted()['update:modelValue']).toBeTruthy()
    expect(emitted()['update:modelValue'][0]).toEqual(['Hello World'])
  })

  it('emits enter event on Enter key press', async () => {
    const { getByPlaceholderText, emitted } = render(Input, {
      props: { type: 'text', placeholder: 'Enter text', modelValue: '' }
    })

    const input = getByPlaceholderText('Enter text')
    await fireEvent.keyUp(input, { key: 'Enter' })

    expect(emitted()['enter']).toBeTruthy()
  })
})
