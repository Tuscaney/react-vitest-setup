import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App.jsx'
import '@testing-library/jest-dom' // Adds jest-dom matchers for Vitest

describe('App component', () => {
  it('renders Vite + React text', () => {
    render(<App />)
    const heading = screen.getByRole('heading', { name: /vite \+ react/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders count button', () => {
    render(<App />)
    const button = screen.getByRole('button', { name: /count is 0/i })
    expect(button).toBeInTheDocument()
  })

  it('renders edit message with code element', () => {
    render(<App />)
    const codeEl = screen.getByText(/src\/App\.jsx/i)
    expect(codeEl).toBeInTheDocument()
  })

  it('renders link to React docs', () => {
    render(<App />)
    const reactLink = screen.getByRole('link', { name: /react logo/i })
    expect(reactLink).toHaveAttribute('href', 'https://react.dev')
  })
})


