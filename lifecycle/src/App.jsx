import { Component, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react'

const functionalHooks = [
  { id: 'useState', name: 'useState', phase: 'State', summary: 'Store values that should trigger a render when they change.', rule: 'State is a snapshot for this render. Use the functional updater when a new value depends on the previous one.', code: `const [count, setCount] = useState(0)\n\n// Safe when several updates happen before React renders again.\nsetCount(previous => previous + 1)` },
  { id: 'useEffect', name: 'useEffect', phase: 'After paint', summary: 'Synchronize with things outside React: timers, subscriptions, network requests, or the document title.', rule: 'The dependency list describes the reactive values used by the effect. Cleanup runs before the next setup and when the component leaves.', code: `useEffect(() => {\n  const timer = setInterval(() => {\n    setSeconds(value => value + 1)\n  }, 1000)\n\n  // Cleanup prevents a timer from surviving this screen.\n  return () => clearInterval(timer)\n}, []) // Start once; clean up on unmount` },
  { id: 'useLayoutEffect', name: 'useLayoutEffect', phase: 'Before paint', summary: 'Read layout or make a visual DOM correction before the browser paints.', rule: 'It blocks paint, so use it only when a visible flicker matters. Prefer useEffect for ordinary synchronization.', code: `useLayoutEffect(() => {\n  const height = panelRef.current\n    .getBoundingClientRect().height\n  setPanelHeight(height)\n}, [])` },
  { id: 'useRef', name: 'useRef', phase: 'Persistent value', summary: 'Keep a mutable value between renders, or point to a DOM node, without causing a render.', rule: 'Changing ref.current does not update the screen. Use state for values users need to see.', code: `const inputRef = useRef(null)\n\nfunction focusInput() {\n  inputRef.current?.focus()\n}\n\n<input ref={inputRef} />` },
  { id: 'useMemo', name: 'useMemo', phase: 'Performance', summary: 'Cache a calculated value while its dependencies stay the same.', rule: 'A performance tool, not a correctness tool. First write a correct calculation; measure before adding memoization.', code: `const visibleItems = useMemo(() => {\n  return items.filter(item =>\n    item.name.includes(query)\n  )\n}, [items, query])` },
  { id: 'useReducer', name: 'useReducer', phase: 'State', summary: 'Manage related state changes with named actions and one predictable reducer.', rule: 'Useful when transitions are complex, several values change together, or you want a clear state-transition story.', code: `function reducer(state, action) {\n  if (action.type === 'increment') {\n    return { count: state.count + 1 }\n  }\n  return state\n}\n\nconst [state, dispatch] = useReducer(reducer, { count: 0 })` },
]

const classMethods = [
  ['constructor', 'Initialize state and bind methods when needed.', 'Runs before the first render. In modern classes, initialize state as a class field instead; never cause side effects here.'],
  ['static getDerivedStateFromProps', 'Rarely derive state from incoming props.', 'Runs before render on mount and updates. Prefer avoiding duplicated state; this method must be pure and returns an object or null.'],
  ['render', 'Describe the UI for the current props and state.', 'Required and pure: do not fetch, subscribe, or mutate state here. React may call render more than once.'],
  ['componentDidMount', 'Start subscriptions, requests, or imperative setup.', 'Runs after the component is added to the DOM. Pair persistent setup with cleanup in componentWillUnmount.'],
  ['shouldComponentUpdate', 'Optionally skip a render for measured performance reasons.', 'Return true to render or false to skip. Prefer PureComponent or memoization; incorrect comparisons can leave stale UI.'],
  ['getSnapshotBeforeUpdate', 'Capture a DOM value just before React updates the DOM.', 'Return a snapshot (such as scroll position) for componentDidUpdate. Rare; useful when an update would otherwise lose DOM information.'],
  ['componentDidUpdate', 'Synchronize after a committed update.', 'Compare previous props/state before setting state or fetching, or you can create an update loop.'],
  ['componentWillUnmount', 'Release subscriptions, timers, and other resources.', 'Runs before removal. Cleanup should undo setup and should not call setState.'],
  ['static getDerivedStateFromError', 'Render fallback state after a child throws during rendering.', 'Error-boundary method. Must be pure; return state that tells render to show a fallback.'],
  ['componentDidCatch', 'Log details about a rendering error caught below this boundary.', 'Error-boundary method. Send diagnostics to a reporting service here; it does not catch event-handler errors.'],
]

class LifecycleCounter extends Component {
  // Class field is the modern, concise way to initialize class state.
  state = { count: 0, previousCount: null }

  componentDidMount() {
    this.log('componentDidMount — the DOM is now available')
    document.title = 'Class component is mounted | Lifecycle Lab'
  }

  componentDidUpdate(previousProps, previousState) {
    // Guard against an update loop: only record when count actually changed.
    if (previousState.count !== this.state.count) {
      this.log(`componentDidUpdate — count changed from ${previousState.count} to ${this.state.count}`)
    }
  }

  componentWillUnmount() {
    this.log('componentWillUnmount — cleanup runs before removal')
    document.title = 'React Lifecycle Lab'
  }

  log(message) {
    this.props.onLog(message)
  }

  render() {
    return (
      <div className="demo-box">
        <div className="demo-label">CLASS COMPONENT · LIVE DEMO</div>
        <div className="counter-row">
          <div><span className="metric-label">STATE COUNT</span><strong className="metric">{this.state.count}</strong></div>
          <div className="button-row">
            <button className="button button-primary" onClick={() => this.setState(({ count }) => ({ count: count + 1 }))}>Increment</button>
            <button className="button button-quiet" onClick={() => this.setState({ count: 0 })}>Reset</button>
          </div>
        </div>
        <p className="muted small">Click a button and watch render → componentDidUpdate in the event log.</p>
      </div>
    )
  }
}

function FunctionalCounter({ onLog }) {
  const [count, setCount] = useState(0)
  const [active, setActive] = useState(true)
  const previousCount = useRef(null)
  const inputRef = useRef(null)
  const doubled = useMemo(() => count * 2, [count])

  // Runs after paint. This is the function-component analogue of mount/update
  // synchronization, with cleanup before the next run and on unmount.
  useEffect(() => {
    document.title = `Count ${count} | Lifecycle Lab`
    onLog(count === 0 && previousCount.current === null
      ? 'useEffect — mounted; document title synchronized'
      : `useEffect — count synchronized to ${count}`)
    previousCount.current = count
    return () => onLog('useEffect cleanup — before the next effect or unmount')
  }, [count, onLog])

  // Layout effects run before paint. This demo focuses an input without a
  // visible post-paint jump; ordinary work should use useEffect instead.
  useLayoutEffect(() => {
    if (active) inputRef.current?.focus({ preventScroll: true })
  }, [active])

  if (!active) return <div className="demo-box"><p className="muted">Functional demo is unmounted. Its effect cleanup ran.</p><button className="button button-primary" onClick={() => setActive(true)}>Mount functional demo</button></div>

  return (
    <div className="demo-box">
      <div className="demo-label">FUNCTION COMPONENT · LIVE DEMO</div>
      <div className="counter-row">
        <div><span className="metric-label">STATE COUNT</span><strong className="metric">{count}</strong></div>
        <div className="button-row">
          <button className="button button-primary" onClick={() => setCount(value => value + 1)}>Increment</button>
          <button className="button button-quiet" onClick={() => setCount(0)}>Reset</button>
        </div>
      </div>
      <div className="inline-facts"><span>useMemo result: <b>{doubled}</b></span><span>useRef previous count: <b>{previousCount.current ?? '—'}</b></span></div>
      <div className="button-row demo-controls"><input ref={inputRef} className="demo-input" aria-label="Focus demo input" placeholder="useLayoutEffect focuses me" /><button className="button button-quiet" onClick={() => setActive(false)}>Unmount demo</button></div>
      <p className="muted small">Increment to see state → render → effect. The previous count ref changes without a separate render.</p>
    </div>
  )
}

class ErrorBoundary extends Component {
  // Error boundaries need class lifecycle methods; hooks do not yet replace them.
  state = { hasError: false }

  static getDerivedStateFromError() { return { hasError: true } }

  componentDidCatch(error) { console.error('Caught by the lesson error boundary:', error) }

  render() {
    if (this.state.hasError) return <div className="callout"><b>Something went wrong.</b> The error boundary caught a rendering error.</div>
    return this.props.children
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('functions')
  const [showClass, setShowClass] = useState(true)
  const [events, setEvents] = useState(['Ready — try the controls to see lifecycle events.'])
  const log = useMemo(() => (message) => setEvents(previous => [`${new Date().toLocaleTimeString()}  ${message}`, ...previous].slice(0, 8)), [])
  const selectedHooks = functionalHooks

  return (
    <div className="app-shell">
      <header className="topbar"><a className="brand" href="#top"><span className="brand-mark">R</span> React Field Guide</a><span className="topbar-note">LEARNING SERIES <span className="dot">·</span> 04 / 08</span></header>
      <main id="top">
        <section className="hero">
          <div className="eyebrow"><span className="eyebrow-line" /> COMPONENT LIFECYCLE <span className="eyebrow-line" /></div>
          <h1>Understand every<br /><em>stage of a component.</em></h1>
          <p className="hero-copy">A practical field guide to React's function hooks and class lifecycle methods. Read the mental model, try the live demos, then use the commented code as a teaching reference.</p>
          <div className="hero-meta"><span><i className="status-dot" /> INTERACTIVE LESSON</span><span>12 MIN READ</span><span>REACT 19</span></div>
        </section>

        <section className="lesson-section">
          <div className="section-heading"><div><div className="section-kicker">01 — THE MENTAL MODEL</div><h2>Lifecycle, in one minute</h2></div><span className="section-index">01 / 04</span></div>
          <p className="section-intro">A component is a small UI process. React gives it data, asks it to describe the screen, commits changes to the DOM, and eventually removes it. Side effects belong around that render, never inside it.</p>
          <div className="flow-card">
            <div className="flow-step"><span className="flow-number">01</span><span className="flow-icon">↘</span><b>Receive</b><p>Props and state<br />are the inputs.</p></div><div className="flow-arrow">→</div>
            <div className="flow-step"><span className="flow-number">02</span><span className="flow-icon">⌘</span><b>Render</b><p>Describe what<br />the UI should be.</p></div><div className="flow-arrow">→</div>
            <div className="flow-step"><span className="flow-number">03</span><span className="flow-icon">▣</span><b>Commit</b><p>React updates<br />the real DOM.</p></div><div className="flow-arrow">→</div>
            <div className="flow-step"><span className="flow-number">04</span><span className="flow-icon">⌁</span><b>Synchronize</b><p>Effects connect<br />to the outside world.</p></div>
          </div>
          <div className="callout"><span className="callout-icon">✳</span><p><b>Render is not a lifecycle side effect.</b> Rendering must stay pure because React can pause, retry, or repeat it. Put subscriptions and browser synchronization in effects (functions) or lifecycle methods (classes).</p></div>
        </section>

        <section className="lesson-section" id="functional">
          <div className="section-heading"><div><div className="section-kicker">02 — FUNCTION COMPONENTS</div><h2>Hooks are your lifecycle tools</h2></div><span className="section-index">6 CORE HOOKS</span></div>
          <p className="section-intro">Hooks are called at the top level of a function component. They let you keep state and synchronize with external systems without turning the component into a class.</p>
          <div className="tabs" role="tablist" aria-label="Component style"><button className={`tab ${activeTab === 'functions' ? 'selected' : ''}`} role="tab" aria-selected={activeTab === 'functions'} onClick={() => setActiveTab('functions')}>Function components <span>6</span></button><button className={`tab ${activeTab === 'classes' ? 'selected' : ''}`} role="tab" aria-selected={activeTab === 'classes'} onClick={() => setActiveTab('classes')}>Class components <span>10</span></button></div>

          {activeTab === 'functions' ? <>
            <div className="hook-grid">{selectedHooks.map((hook, index) => <article className="hook-card" key={hook.id}><div className="hook-card-top"><span className="hook-number">0{index + 1}</span><span className="pill">{hook.phase}</span></div><h3>{hook.name}</h3><p>{hook.summary}</p><pre><code>{hook.code}</code></pre><div className="rule"><span>FIELD NOTE</span><p>{hook.rule}</p></div></article>)}</div>
            <div className="subheading"><div><div className="section-kicker">TRY THE SEQUENCE</div><h3>Watch a function component live</h3></div><span className="live-badge"><i /> LIVE</span></div>
            <p className="section-intro compact">Increment the counter. See the state-driven render, memoized value, ref, and effect synchronization in one place.</p>
            <FunctionalCounter onLog={log} />
          </> : <>
            <div className="class-note"><b>How to translate the mental model</b><p>Class components use named lifecycle methods. New code usually uses function components, but knowing the class timeline helps you maintain older applications and understand error boundaries.</p></div>
            <div className="timeline">{classMethods.map(([name, purpose, detail], index) => <article className="timeline-item" key={name}><span className="timeline-index">{String(index + 1).padStart(2, '0')}</span><div className="timeline-content"><div className="timeline-name">{name}</div><p className="timeline-purpose">{purpose}</p><p className="timeline-detail">{detail}</p></div><span className="timeline-phase">{index < 3 ? 'MOUNT' : index < 7 ? 'UPDATE / CLEANUP' : 'ERROR BOUNDARY'}</span></article>)}</div>
            <div className="subheading"><div><div className="section-kicker">TRY THE SEQUENCE</div><h3>Watch a class component live</h3></div><span className="live-badge"><i /> LIVE</span></div>
            <p className="section-intro compact">Toggle the component off to see unmount cleanup, then mount it again to restart its lifecycle.</p>
            {showClass ? <ErrorBoundary><LifecycleCounter onLog={log} /></ErrorBoundary> : <div className="demo-box"><p className="muted">Class demo is unmounted. componentWillUnmount ran.</p><button className="button button-primary" onClick={() => setShowClass(true)}>Mount class demo</button></div>}
            <button className="text-button" onClick={() => setShowClass(value => !value)}>{showClass ? 'Unmount class demo' : 'Mount class demo'} <span>↗</span></button>
          </>}

          <div className="event-panel"><div className="event-header"><div><span className="section-kicker">EVENT TRACE</span><b>What just happened</b></div><button className="text-button" onClick={() => setEvents(['Event log cleared.'])}>Clear log</button></div><div className="event-list" aria-live="polite">{events.map((event, index) => <div className="event-row" key={`${event}-${index}`}><span className="event-dot" />{event}</div>)}</div></div>
        </section>

        <section className="lesson-section compare-section">
          <div className="section-heading"><div><div className="section-kicker">03 — CONNECT THE DOTS</div><h2>Same moment, different API</h2></div><span className="section-index">QUICK REFERENCE</span></div>
          <div className="compare-table"><div className="compare-head"><span>WHAT YOU NEED</span><span>FUNCTION COMPONENT</span><span>CLASS COMPONENT</span></div><div><b>Store local state</b><code>useState / useReducer</code><code>this.state + this.setState</code></div><div><b>After mount / update sync</b><code>useEffect(..., dependencies)</code><code>componentDidMount / DidUpdate</code></div><div><b>Before browser paint</b><code>useLayoutEffect</code><code>getSnapshotBeforeUpdate</code></div><div><b>Cleanup before leaving</b><code>useEffect return function</code><code>componentWillUnmount</code></div><div><b>Catch render errors</b><code>Not available as a hook yet</code><code>getDerivedStateFromError + DidCatch</code></div></div>
          <div className="callout"><span className="callout-icon">↗</span><p><b>Don't map methods one-to-one.</b> An effect is best understood as a setup-and-cleanup process tied to its dependencies. It is not simply “componentDidMount in a function.”</p></div>
        </section>

        <section className="lesson-section checklist-section">
          <div className="section-heading"><div><div className="section-kicker">04 — SENIOR ENGINEER CHECKLIST</div><h2>Before you ship an effect</h2></div><span className="section-index">BUILD GOOD INSTINCTS</span></div>
          <div className="checklist">{[
            ['Name the external system', 'What are you synchronizing: a socket, timer, browser API, or network request? If there is no external system, you may not need an effect.'],
            ['List every reactive value', 'Include props, state, and functions declared in the component that the effect reads. Let the dependency linter help you find stale closures.'],
            ['Make cleanup symmetrical', 'Undo the listener, timer, subscription, or connection created by setup. Cleanup runs before a changed effect is set up again.'],
            ['Handle races and failures', 'For async work, guard against stale responses or use cancellation. Show loading, success, and error states deliberately.'],
            ['Test the lifecycle, not call counts', 'Strict Mode may run an extra setup and cleanup in development. Your code should remain correct when setup is repeated.'],
            ['Measure before optimizing', 'useMemo and shouldComponentUpdate add complexity. Use them when profiling shows a real rendering cost.'],
          ].map(([title, text], index) => <div className="check-row" key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><b>{title}</b><p>{text}</p></div><span className="check-mark">✓</span></div>)}</div>
        </section>
        <footer><a className="brand" href="#top"><span className="brand-mark">R</span> React Field Guide</a><span>Built for learning, practice, and teaching.</span><a href="#top" className="back-top">BACK TO TOP ↑</a></footer>
      </main>
    </div>
  )
}

export default App
