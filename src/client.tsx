import { render } from 'hono/jsx/dom'
import { App } from './components/App'

const root = document.getElementById('app')
if (root) {
  render(<App />, root)
}