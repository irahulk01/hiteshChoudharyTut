import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const projectDirs = ['couter', 'prop-guide', 'que-management', 'lifecycle']
// The active lifecycle lessons live in the root app's src folder. Browsing
// "Lifecycle Labs" should show the code the dashboard actually runs.
const projectRoots = { couter: 'couter', 'prop-guide': 'prop-guide', 'que-management': 'que-management', lifecycle: 'src' }
const ignored = new Set(['node_modules', 'dist', '.git', '.DS_Store'])
const binaryExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.zip', '.mp4', '.woff', '.woff2'])

async function collectFiles(dir, base = '') {
  const entries = await readdir(dir, { withFileTypes: true })
  const results = []
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (ignored.has(entry.name)) continue
    const relative = path.posix.join(base, entry.name)
    const absolute = path.join(dir, entry.name)
    if (entry.isDirectory()) results.push({ type: 'directory', name: entry.name, path: relative, children: await collectFiles(absolute, relative) })
    else results.push({ type: 'file', name: entry.name, path: relative, binary: binaryExtensions.has(path.extname(entry.name).toLowerCase()) })
  }
  return results
}

function learningExplorerApi() {
  return {
    name: 'learning-explorer-api',
    configureServer(server) {
      server.middlewares.use('/__explorer/api/demo/profile', (req, res) => {
        const url = new URL(req.url, 'http://localhost')
        const profiles = {
          1: { id: 1, name: 'Ada Lovelace', role: 'Mathematician & computing pioneer', location: 'London, United Kingdom', initials: 'AL' },
          2: { id: 2, name: 'Grace Hopper', role: 'Computer scientist & Navy rear admiral', location: 'Arlington, United States', initials: 'GH' },
          3: { id: 3, name: 'Katherine Johnson', role: 'Mathematician & spaceflight pioneer', location: 'White Sulphur Springs, United States', initials: 'KJ' },
        }
        const profile = profiles[url.searchParams.get('userId')] || profiles[1]
        let closed = false
        const timer = setTimeout(() => {
          if (closed) return
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-store')
          res.end(JSON.stringify(profile))
        }, 900)
        res.on('close', () => {
          if (!res.writableEnded) {
            closed = true
            clearTimeout(timer)
          }
        })
      })
      server.middlewares.use('/__explorer/api/projects', async (_req, res) => {
        try {
          const projects = await Promise.all(projectDirs.map(async (slug) => {
            const dir = path.resolve(root, projectRoots[slug])
            const pkg = JSON.parse(await readFile(path.join(root, slug, 'package.json'), 'utf8'))
            const names = { couter: 'Counter', 'prop-guide': 'Props Guide', 'que-management': 'Queue Management', lifecycle: 'Lifecycle Lab' }
            const descriptions = {
              couter: 'Build intuition for state by changing a value and watching React update the screen.',
              'prop-guide': 'Explore how components receive data, render children, and share behavior through props.',
              'que-management': 'A starter app for organizing a customer queue and practicing component structure.',
              lifecycle: 'An interactive guide to function hooks and class component lifecycle methods.',
            }
            const accents = { couter: 'orange', 'prop-guide': 'blue', 'que-management': 'violet', lifecycle: 'green' }
            return { slug, name: names[slug], description: descriptions[slug], accent: accents[slug], files: await collectFiles(dir), scripts: pkg.scripts }
          }))
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(projects))
        } catch (error) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: error.message }))
        }
      })
      server.middlewares.use('/__explorer/api/file', async (req, res) => {
        try {
          const url = new URL(req.url, 'http://localhost')
          const relative = url.searchParams.get('path') || ''
          const [slug, ...segments] = relative.split('/')
          if (!projectDirs.includes(slug) || segments.length === 0) throw new Error('File is outside a tutorial folder')
          const baseDirectory = path.resolve(root, projectRoots[slug])
          const absolute = path.resolve(baseDirectory, ...segments)
          if (!absolute.startsWith(`${baseDirectory}${path.sep}`)) throw new Error('File is outside a tutorial folder')
          const info = await stat(absolute)
          if (!info.isFile()) throw new Error('Please select a file')
          res.setHeader('Content-Type', 'application/json')
          const binary = binaryExtensions.has(path.extname(absolute).toLowerCase())
          res.end(JSON.stringify({ path: relative, binary, content: binary ? '' : await readFile(absolute, 'utf8') }))
        } catch (error) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: error.message }))
        }
      })
    },
  }
}

export default defineConfig({ plugins: [react(), tailwindcss(), learningExplorerApi()] })
