# React Learning Lab

An interactive React tutorial workspace. Change a value in the lesson and follow the matching source lines, then use the project browser to inspect the real tutorial folders.

## Run it

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. For a production bundle, run `npm run build`.

## What is inside

- **Counter** — increment, decrement, and reset state while tracing the setter and render.
- **Props Guide** — change the parent selection and watch the child update from props.
- **Queue Management** — add and serve people in order with immutable array updates.
- **Lifecycle Labs** — interactive lessons for the built-in React Hooks, the `use` API, a custom Hook, and class lifecycle methods.
- **Mount → API → unmount** — compare a function component with `useEffect` against a class component. The demo fetches from a delayed local Vite endpoint so loading, response, prop changes, and cleanup are visible without an external API.
- **Explore the source tree** — open a project’s actual files and folders from the dashboard.

## Project layout

```text
src/
  components/CodePanel.jsx
  features/lifecycle/     # Lesson data, method-specific class demos, and API lifecycle walkthrough
  features/projects/      # Counter, props, queue, and source-tree lessons
  App.jsx                 # Dashboard shell and interactive lesson renderers
  global.css              # Theme tokens, typography, and reduced-motion rules
  styles.css              # Responsive component styles
  tailwind.css            # Tailwind CSS v4 entry point
couter/                   # Original counter project (legacy folder spelling)
prop-guide/               # Props lesson project
que-management/           # Queue project
lifecycle/                # Original standalone lifecycle sample
```

The dashboard's live Lifecycle Labs source is under `src/features/lifecycle/` and its interactive renderer is in `src/App.jsx`. The file browser opens this active source tree when you choose Lifecycle Labs.

The file explorer and delayed profile API are provided by the root Vite plugin in `vite.config.js`; they are intended for the local tutorial workspace.

## UI details

- Dark mode is the default. The theme control switches to light mode and saves the choice in local storage.
- Tailwind CSS v4 is available for utility styling, with shared theme tokens and responsive styles in `src/global.css` and `src/styles.css`.
- Framer Motion animates state changes, transitions, queue movement, and lifecycle loading states. Its global configuration respects the operating system's reduced-motion preference.
- The interface supports reduced-motion preferences and includes keyboard-visible focus styles.
