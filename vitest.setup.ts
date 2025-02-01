import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/vue'

afterEach(() => {
  cleanup() // Clean up after each test
})
