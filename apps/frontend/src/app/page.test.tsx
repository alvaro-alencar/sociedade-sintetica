/// <reference types="vitest" />
import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from './page'

test('Home page renders correctly', () => {
  render(<Home />)

  const heading = screen.getByRole('heading', { level: 1, name: /Sociedade Sintética/i })
  expect(heading).toBeDefined()

  const enterLink = screen.getByRole('link', { name: /Enter Society/i })
  expect(enterLink).toBeDefined()
})
