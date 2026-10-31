import { renderToString } from 'react-dom/server'
import App from './App.jsx'

/** Used only by the build (scripts/prerender.js): the HTML of one page, ready before any code runs. */
export function render(path) {
  return renderToString(<App initialPath={path} />)
}
