// src/client.tsx
import { render } from 'hono/jsx/dom'
import NanoBananaDashboard from './components/NanoBananaDashboard'

const root = document.getElementById('app')
if (root) {
  render(<NanoBananaDashboard />, root)
}