import { Component, createContext, memo, startTransition, Suspense, use, useActionState, useCallback, useContext, useDebugValue, useEffect, useEffectEvent, useId, useImperativeHandle, useInsertionEffect, useLayoutEffect, useMemo, useOptimistic, useReducer, useRef, useState, useSyncExternalStore, useTransition, useDeferredValue } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, ArrowUpDown, Atom, Boxes, ChevronDown, Menu, Moon, Play, Sun } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { hooks } from './features/lifecycle/hooks'
import { lifecycleMethods } from './features/lifecycle/classLifecycle'
import LifecycleWalkthrough from './features/lifecycle/LifecycleWalkthrough.jsx'
import ClassMethodPlayground from './features/lifecycle/ClassMethodPlayground.jsx'
import CodePanel from './components/CodePanel.jsx'
import ProjectContent, { ProjectFileBrowser } from './features/projects/ProjectLessons.jsx'

const projects = [
  { id: 'counter', sourceDir: 'couter', name: 'Counter', description: 'State and events', icon: ArrowUpDown },
  { id: 'props', sourceDir: 'prop-guide', name: 'Props Guide', description: 'Pass data to components', icon: Boxes },
  { id: 'queue', sourceDir: 'que-management', name: 'Queue Management', description: 'Build a small app', icon: Activity },
  { id: 'lifecycle', sourceDir: 'lifecycle', name: 'Lifecycle Labs', description: 'Hooks and class methods', icon: Atom },
]

const ThemeContext = createContext('light')
const subscribeNetwork = (callback) => {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}
const getNetworkSnapshot = () => navigator.onLine
const useOnlineStatus = () => {
  const online = useSyncExternalStore(subscribeNetwork, getNetworkSnapshot, () => true)
  useDebugValue(online ? 'Online' : 'Offline')
  return online
}
function useWindowWidth() {
  const [width, setWidth] = useState(() => typeof window === 'undefined' ? 0 : window.innerWidth)
  useEffect(() => {
    const updateWidth = () => setWidth(window.innerWidth)
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])
  return width
}
function ImperativeSearchInput({ ref }) {
  const inputElement = useRef(null)
  useImperativeHandle(ref, () => ({ focus: () => inputElement.current?.focus() }), [])
  return <input ref={inputElement} className="demo-input" placeholder="Child-owned input"/>
}
const countReducer = (state, action) => action.type === 'increment' ? state + 1 : action.type === 'decrement' ? state - 1 : 0
async function greetAction(previousMessage, formData) {
  await new Promise((resolve) => window.setTimeout(resolve, 650))
  return `Welcome, ${formData.get('name')}!`
}
let cachedProfilePromise
function getCachedProfilePromise() {
  cachedProfilePromise ||= fetch('/__explorer/api/demo/profile?userId=1').then((response) => response.json())
  return cachedProfilePromise
}
function SuspenseProfileDemo() {
  const profile = use(getCachedProfilePromise())
  return <div className="profile-result"><div className="profile-portrait">{profile.initials}</div><div className="profile-result-copy"><span className="profile-status">PROMISE RESOLVED</span><h3>{profile.name}</h3><p>{profile.role}</p></div></div>
}
const MemoizedSearchButton = memo(function MemoizedSearchButton({ onSearch }) { return <button className="action-button" onClick={onSearch}>Call the stable handler</button> })
function FormStatusSubmitButton({ onAction }) {
  const { pending, data } = useFormStatus()
  const submittedName = data?.get('name')
  return <button className="action-button" type="submit" disabled={pending} onClick={() => onAction('formStatus')}>
    {pending ? `Saving ${submittedName || 'profile'}…` : 'Save profile'}
  </button>
}


function CounterDemo({ onAction }) {
  const [count, setCount] = useState(0)
  const update = (next, action) => {
    onAction(action)
    setCount(next)
  }
  return <div className="counter-demo">
    <div className="counter-topline"><span className="live-dot"/> WORKING EXAMPLE <span className="state-label">STATE: <b>{count}</b></span></div>
    <div className="counter-display" aria-live="polite"><AnimatePresence mode="popLayout"><motion.span key={count} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: .18 }}>{count}</motion.span></AnimatePresence></div>
    <div className="counter-controls">
      <button className="counter-button secondary" onClick={() => update(count - 1, 'decrement')} aria-label="Decrease count">−</button>
      <button className="counter-button primary" onClick={() => update(count + 1, 'increment')}>+ <span>Increase</span></button>
      <button className="counter-button secondary reset-button" onClick={() => update(0, 'reset')}>Reset</button>
    </div>
    <p className="demo-footnote">Press + or −. Watch the changed value and matching code lines on the right.</p>
  </div>
}

function ThemeContextDisplay({ onAction }) {
  const theme = useContext(ThemeContext)
  return <div className={`mini-demo context-demo ${theme}`}><span className="mini-label">SHARED THEME · useContext</span><strong>{theme === 'light' ? 'Light theme' : 'Dark theme'}</strong><button className="action-button" onClick={() => onAction(theme === 'light' ? 'dark' : 'light')}>Switch provided value</button><p>A child reads the nearest provider value.</p></div>
}

function HookPlayground({ lesson, onAction }) {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [theme, setTheme] = useState('light')
  const [reducerCount, dispatch] = useReducer(countReducer, 0)
  const [savedCart, setSavedCart] = useState(0)
  const [optimisticCart, setOptimisticCart] = useOptimistic(savedCart)
  const [actionMessage, actionDispatch, actionPending] = useActionState(greetAction, '')
  const [query, setQuery] = useState('')
  const [transitionQuery, setTransitionQuery] = useState('')
  const [isTransitionPending, startSearchTransition] = useTransition()
  const deferredQuery = useDeferredValue(query)
  const isOnline = useOnlineStatus()
  const inputRef = useRef(null)
  const measureRef = useRef(null)
  const inputId = useId()
  const [measuredBox, setMeasuredBox] = useState({ width: 0, height: 0 })
  const [noticeTheme, setNoticeTheme] = useState('')
  const connectedNotice = useEffectEvent(() => setNoticeTheme(theme))
  useLayoutEffect(() => {
    if (lesson.demo !== 'layout' || !measureRef.current) return
    const { width, height } = measureRef.current.getBoundingClientRect()
    setMeasuredBox({ width: Math.round(width), height: Math.round(height) })
  }, [lesson.demo])
  useInsertionEffect(() => {
    if (lesson.demo !== 'insertionEffect') return undefined
    const style = document.createElement('style')
    style.dataset.learningLab = 'insertion-effect'
    style.textContent = '.insertion-effect-demo { outline: 2px solid var(--accent); }'
    document.head.appendChild(style)
    return () => style.remove()
  }, [lesson.demo])
  useEffect(() => {
    if (lesson.demo !== 'effectEvent') return undefined
    const timer = window.setTimeout(() => connectedNotice(), 700)
    return () => window.clearTimeout(timer)
  }, [lesson.demo])
  const focusSearch = useCallback(() => inputRef.current?.focus(), [])
  const stableSearchHandler = useCallback(() => {
    setQuery('React')
    onAction('callback')
  }, [onAction])
  const windowWidth = useWindowWidth()
  const names = ['React', 'State', 'Effect', 'Component']
  const filtered = useMemo(() => names.filter((name) => name.toLowerCase().includes((lesson.demo === 'transition' ? transitionQuery : deferredQuery).toLowerCase())), [lesson.demo, transitionQuery, deferredQuery])

  useEffect(() => {
    if (!running) return undefined
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [running])

  if (lesson.demo === 'counter') return <CounterDemo onAction={onAction}/>
  if (lesson.demo === 'timer') return <div className="mini-demo"><span className="mini-label">STOPWATCH · useEffect</span><strong className="timer-value">{seconds}<small> sec</small></strong><button className="action-button" onClick={() => { setRunning((value) => !value); onAction(running ? 'stop' : 'start') }}>{running ? 'Stop timer' : 'Start timer'}</button><p>Start creates an interval. Stop triggers cleanup.</p></div>
  if (lesson.demo === 'context') return <ThemeContext.Provider value={theme}><ThemeContextDisplay onAction={(next) => { setTheme(next); onAction('context') }}/></ThemeContext.Provider>
  if (lesson.demo === 'ref') return <div className="mini-demo"><span className="mini-label">DOM REFERENCE · useRef</span><input ref={inputRef} className="demo-input" placeholder="Click focus to use the ref"/><button className="action-button" onClick={() => { focusSearch(); onAction('ref') }}>Focus input</button><p>Changing ref.current does not render again.</p></div>
  if (lesson.demo === 'reducer') return <div className="mini-demo"><span className="mini-label">ACTION-BASED STATE · useReducer</span><strong className="timer-value">{reducerCount}</strong><div className="mini-actions"><button className="action-button" onClick={() => { dispatch({ type: 'decrement' }); onAction('reducer') }}>Dispatch −</button><button className="action-button" onClick={() => { dispatch({ type: 'increment' }); onAction('reducer') }}>Dispatch +</button></div><p>Buttons dispatch named actions; the reducer returns the next state.</p></div>
  if (lesson.demo === 'memo') return <div className="mini-demo"><span className="mini-label">DERIVED LIST · useMemo</span><input className="demo-input" value={query} onChange={(event) => { setQuery(event.target.value); onAction('memo') }} placeholder="Filter React, State, Effect..."/><div className="result-chips">{filtered.map((name) => <span key={name}>{name}</span>)}</div><p>Filtered results update when the query changes.</p></div>
  if (lesson.demo === 'callback') return <div className="mini-demo"><span className="mini-label">STABLE CALLBACK · useCallback</span><MemoizedSearchButton onSearch={stableSearchHandler}/><div className="result-chips">{filtered.map((name) => <span key={name}>{name}</span>)}</div><p>This callback keeps its identity while the component re-renders.</p></div>
  if (lesson.demo === 'layout') return <div className="mini-demo"><span className="mini-label">BEFORE PAINT · useLayoutEffect</span><div ref={measureRef} className="layout-measure">Measured box <b>{measuredBox.width} × {measuredBox.height}</b></div><button className="action-button" onClick={() => onAction('layout')}>Measure before paint</button><p>Read layout after DOM commit, before the browser paints.</p></div>
  if (lesson.demo === 'id') return <div className="mini-demo"><span className="mini-label">ACCESSIBLE FIELD · useId</span><label className="demo-label" htmlFor={inputId}>Email address</label><input className="demo-input" id={inputId} type="email" placeholder="learner@example.com" onFocus={() => onAction('id')}/><p>The generated ID connects the label to its input.</p></div>
  if (lesson.demo === 'transition' || lesson.demo === 'deferred') return <div className="mini-demo"><span className="mini-label">RESPONSIVE SEARCH · {lesson.label}</span><input className="demo-input" value={query} onChange={(event) => { const next = event.target.value; setQuery(next); if (lesson.demo === 'transition') startSearchTransition(() => setTransitionQuery(next)); onAction(lesson.demo) }} placeholder="Type to search the lesson list"/><div className={`result-chips ${isTransitionPending ? 'pending-results' : ''}`}>{filtered.map((name) => <span key={name}>{name}</span>)}</div><p>{isTransitionPending ? 'React is working on the non-urgent results…' : 'Urgent input stays responsive while results catch up.'}</p></div>
  if (lesson.demo === 'optimistic') return <div className="mini-demo"><span className="mini-label">OPTIMISTIC CART · useOptimistic</span><strong className="timer-value">{optimisticCart} <small>items</small></strong><button className="action-button" onClick={() => { onAction('optimistic'); startTransition(async () => { setOptimisticCart((value) => value + 1); await new Promise((resolve) => window.setTimeout(resolve, 1600)); setSavedCart((value) => value + 1) }) }}>Add item (server takes 1.6s)</button><p>See instant feedback, then the confirmed state replaces it.</p></div>
  if (lesson.demo === 'actionState') return <form className="mini-demo" action={actionDispatch}><span className="mini-label">ACTION RESULT · useActionState</span><input className="demo-input" name="name" required placeholder="Type your name"/><button className="action-button" disabled={actionPending} onClick={() => onAction('actionState')}>{actionPending ? 'Submitting…' : 'Submit action'}</button><p>{actionMessage || 'Submit to see pending and returned state.'}</p></form>
  if (lesson.demo === 'formStatus') return <form className="mini-demo" action={actionDispatch}><span className="mini-label">FORM SUBMISSION · useFormStatus</span><label className="demo-label" htmlFor={inputId}>Profile name</label><input className="demo-input" id={inputId} name="name" required placeholder="Type your name"/><FormStatusSubmitButton onAction={onAction}/><p>{actionMessage || 'The nested submit button reads pending status from this parent form.'}</p></form>
  if (lesson.demo === 'imperative') return <div className="mini-demo"><span className="mini-label">EXPOSE A SMALL API · useImperativeHandle</span><ImperativeSearchInput ref={inputRef}/><button className="action-button" onClick={() => { inputRef.current?.focus(); onAction('imperative') }}>Parent calls childRef.focus()</button><p>The parent receives one intentional method, not the whole DOM node.</p></div>
  if (lesson.demo === 'effectEvent') return <div className="mini-demo"><span className="mini-label">LATEST VALUES · useEffectEvent</span><select className="demo-input" value={theme} onChange={(event) => setTheme(event.target.value)}><option value="light">Light notification</option><option value="dark">Dark notification</option></select><button className="action-button" onClick={() => onAction('effectEvent')}>Connection event runs after mount</button><p>{noticeTheme ? `Effect Event read the latest “${noticeTheme}” theme.` : 'Choose a theme while the connection timer starts.'}</p></div>
  if (lesson.demo === 'insertionEffect') return <div className="mini-demo"><span className="mini-label">CSS-IN-JS LIBRARIES · useInsertionEffect</span><button className="action-button" onClick={() => onAction('insertionEffect')}>Show style insertion order</button><div className="result-chips insertion-effect-demo"><span>1 · Insert CSS</span><span>2 · Measure layout</span><span>3 · Paint</span></div><p>A specialized hook for styling library authors, rarely app code.</p></div>
  if (lesson.demo === 'externalStore') return <div className="mini-demo"><span className="mini-label">BROWSER EXTERNAL STORE · useSyncExternalStore</span><strong>{isOnline ? 'Online' : 'Offline'}</strong><button className="action-button" onClick={() => onAction('externalStore')}>Check live network snapshot</button><p>This example subscribes to the browser’s online/offline events.</p></div>
  if (lesson.demo === 'debugValue') return <div className="mini-demo"><span className="mini-label">REACT DEVTOOLS · useDebugValue</span><button className="action-button" onClick={() => onAction('debugValue')}>Inspect custom hook label</button><div className="result-chips"><span>useOnlineStatus</span><span>{isOnline ? 'Online' : 'Offline'}</span></div><p>The label appears in React DevTools, not in the page UI.</p></div>
  if (lesson.demo === 'useApi') return <div className="mini-demo"><span className="mini-label">SUSPENSE RESOURCE · use</span><Suspense fallback={<div className="profile-skeleton"><span className="skeleton-avatar"/><span className="skeleton-bar"/><p>Suspense fallback while the Promise is pending…</p></div>}><SuspenseProfileDemo/></Suspense><p>The use API reads a cached Promise or context during render.</p></div>
  return <div className="mini-demo"><span className="mini-label">REUSABLE LOGIC · CUSTOM HOOK</span><div className="layout-measure">Window width <b>{windowWidth}px</b></div><button className="action-button" onClick={() => onAction('custom')}>Resize the window</button><p>The custom Hook packages state and a resize listener for reuse.</p></div>
}

class ErrorBoundary extends Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error) { console.error('Lifecycle lesson boundary caught:', error) }
  render() { return this.state.hasError ? <div className="error-note">The lesson hit an unexpected rendering error.</div> : this.props.children }
}

const hookFieldNotes = {
  useState: 'Store values that drive visible UI. If the next value depends on the previous one, use the updater form so queued updates stay correct.',
  useEffect: 'Use Effects to synchronize with external systems. If you can calculate a value from props or state during render, you probably do not need an Effect.',
  useContext: 'Keep providers close to the consumers that need them. A changed provider value updates its consumers, so avoid creating needless new objects on every render.',
  useRef: 'A ref is mutable storage that does not trigger rendering. If a changed value must become visible, put it in state instead.',
  useReducer: 'Keep the reducer pure and return a new state value. Named actions make complex transitions easier to review and test.',
  useMemo: 'Treat this as a measured performance optimization, not a correctness guarantee. Keep dependencies complete and compare before and after.',
  useCallback: 'It helps when function identity matters to a memoized child or dependency list. It is unnecessary for most event handlers.',
  useLayoutEffect: 'It blocks the browser from painting. Choose it only when you must measure or adjust layout before the user sees the frame.',
  useId: 'Use it to connect labels to inputs and create accessibility IDs. It is not a list key; use stable data IDs for keys.',
  useTransition: 'Transitions mark updates as non-urgent. Keep controlled input state urgent and transition the expensive results that follow.',
  useDeferredValue: 'This defers a value while rendering is busy; it does not impose a fixed delay. A memoized child can skip work while the value is unchanged.',
  custom: 'A custom Hook shares stateful logic, not one shared state instance. Each call has its own state unless it connects to a shared store.',
  useOptimistic: 'Use it inside an Action or Transition. The optimistic value is temporary; React returns to the base value if the Action does not confirm it.',
  useActionState: 'Actions can be async. Use the pending flag for feedback, and return a useful result that becomes the next state.',
  useFormStatus: 'The Hook must run in a component rendered inside the form. It reads the nearest parent form; it cannot read the form rendered by the same component.',
  useImperativeHandle: 'Prefer declarative props where possible. When a ref is necessary, expose the smallest API the parent needs.',
  useEffectEvent: 'Call an Effect Event from Effect-owned logic. It is not a way to hide reactive dependencies or handle ordinary button clicks.',
  useInsertionEffect: 'This exists for CSS-in-JS library authors. Most application components should use useEffect or useLayoutEffect instead.',
  useSyncExternalStore: 'The snapshot must stay referentially stable until the external store changes. Always return an unsubscribe function from subscribe.',
  useDebugValue: 'This only appears in React DevTools for custom Hooks. It helps maintainers inspect a reusable Hook without adding UI to the page.',
  use: 'The use API is not a Hook: it can be called conditionally. Cache Promises outside the render path and handle rejection with an Error Boundary.',
}

function LiveLesson({ lesson, activeStep, onAction, onPlaySequence }) {
  const step = lesson.steps[Math.min(activeStep, lesson.steps.length - 1)]
  const documentationPath = lesson.id === 'custom' ? 'hooks' : lesson.id === 'useFormStatus' ? 'react-dom/hooks/useFormStatus' : lesson.id
  const lessonKind = lesson.id === 'use' ? 'REACT API' : lesson.id === 'custom' ? 'CUSTOM HOOK' : lesson.id === 'useFormStatus' ? 'REACT DOM HOOK' : 'REACT HOOK'
  return <>
    <div className="lesson-intro"><div className="breadcrumb"><span>LIFECYCLE LAB</span><span>/</span><span>{lesson.group.toUpperCase()}</span></div><div className="lesson-title-row"><div><p className="eyebrow">{lessonKind} · INTERACTIVE LESSON</p><h1>{lesson.label}</h1></div><span className="lesson-count">LESSON {String(hooks.indexOf(lesson) + 1).padStart(2, '0')} / {hooks.length}</span></div><p className="lesson-definition">{lesson.definition}</p><div className="analogy-box"><span className="analogy-icon">✳</span><div><b>Think of it this way</b><p>{lesson.analogy}</p></div></div><div className="hook-guidance-grid"><article className="hook-guidance panel"><span className="eyebrow">WHEN TO REACH FOR IT</span><p>{lesson.when}</p></article><article className="hook-guidance panel"><span className="eyebrow">FIELD NOTE</span><p>{hookFieldNotes[lesson.id]}</p></article></div><a className="docs-link" href={`https://react.dev/reference/${documentationPath}`} target="_blank" rel="noreferrer">React documentation for {lesson.label} ↗</a></div>
    <div className="workbench-grid">
      <section className="playground panel"><header className="panel-heading"><div><span className="eyebrow">TRY IT YOURSELF</span><h2>Change something.</h2></div><span className="ready-badge"><i/> LIVE</span></header><HookPlayground lesson={lesson} onAction={onAction}/><div className="step-explainer"><span className="step-number">STEP {String(activeStep + 1).padStart(2, '0')}</span><div><b>{step.title}</b><p>{step.detail}</p></div></div></section>
      <CodePanel code={lesson.code} highlightedLines={step.lines}/>
    </div>
    <section className="sequence-panel panel"><div className="sequence-heading"><div><span className="eyebrow">FOLLOW THE UPDATE</span><h2>What React is doing</h2></div><div className="sequence-actions"><span className="sequence-hint">Select a step to inspect its code</span><button className="play-sequence" onClick={onPlaySequence}><Play aria-hidden size={15}/>Play the flow</button></div></div><div className="sequence-steps">{lesson.steps.map((item, index) => <button className={`sequence-step ${index === activeStep ? 'current' : ''}`} key={item.title} onClick={() => onAction('step', index)}><span>{String(index + 1).padStart(2, '0')}</span><b>{item.title}</b>{index < lesson.steps.length - 1 && <i>→</i>}</button>)}</div></section>
  </>
}

function LifecycleLab({ selectedHook, setSelectedHook, selectedMethod, setSelectedMethod, track, setTrack }) {
  const [activeStep, setActiveStep] = useState(0)
  const sequenceTimer = useRef(null)
  const activeLesson = track === 'hooks' ? hooks.find((hook) => hook.id === selectedHook) : lifecycleMethods.find((method) => method.id === selectedMethod)
  useEffect(() => () => window.clearInterval(sequenceTimer.current), [])
  useEffect(() => { if (track === 'hooks') setActiveStep(0) }, [selectedHook, track])

  function playSequence() {
    if (track !== 'hooks') return
    window.clearInterval(sequenceTimer.current)
    let current = 0
    setActiveStep(0)
    sequenceTimer.current = window.setInterval(() => {
      current += 1
      if (current >= activeLesson.steps.length) {
        window.clearInterval(sequenceTimer.current)
        return
      }
      setActiveStep(current)
    }, 1000)
  }

  const handleAction = useCallback((action, selectedIndex) => {
    if (action === 'step') { setActiveStep(selectedIndex); return }
    const stepMap = { increment: 1, decrement: 1, reset: 1, start: 1, stop: 2, context: 2, ref: 2, reducer: 1, memo: 1, callback: 1, layout: 1, id: 1, transition: 1, deferred: 1, custom: 1, formStatus: 1 }
    setActiveStep(stepMap[action] ?? 1)
    if (action === 'increment' || action === 'decrement' || action === 'reset') {
      window.setTimeout(() => setActiveStep(2), 250)
      window.setTimeout(() => setActiveStep(3), 600)
    }
  }, [])

  return <div className="lifecycle-page">
    <nav className="track-switch" aria-label="Lifecycle lesson type"><button className={track === 'hooks' ? 'selected' : ''} onClick={() => setTrack('hooks')}>Hooks &amp; API <span>{hooks.length}</span></button><button className={track === 'classes' ? 'selected' : ''} onClick={() => setTrack('classes')}>Class methods <span>{lifecycleMethods.length}</span></button><button className={track === 'cycle' ? 'selected' : ''} onClick={() => setTrack('cycle')}>Lifecycle walkthrough</button></nav>
    {track === 'hooks' ? <LiveLesson key={activeLesson.id} lesson={activeLesson} activeStep={Math.min(activeStep, activeLesson.steps.length - 1)} onAction={handleAction} onPlaySequence={playSequence}/> : track === 'classes' ? <ClassLesson key={activeLesson.id} method={activeLesson}/> : <LifecycleWalkthrough/>}
    <ProjectFileBrowser key="lifecycle-source" projectSlug="lifecycle"/>
  </div>
}

function ClassLesson({ method }) {
  const [events, setEvents] = useState([])
  const addLifecycleEvent = useCallback((message) => {
    setEvents((current) => [message, ...current].slice(0, 6))
  }, [])

  return <>
    <div className="lesson-intro"><div className="breadcrumb"><span>LIFECYCLE LAB</span><span>/</span><span>CLASS COMPONENTS</span><span>/</span><span>{method.phase.toUpperCase()}</span></div><div className="lesson-title-row"><div><p className="eyebrow">CLASS COMPONENT · LIFECYCLE METHOD</p><h1>{method.name}</h1></div><span className="lesson-count">{method.phase.toUpperCase()}</span></div><p className="lesson-definition">{method.summary} {method.detail}</p><div className="analogy-box"><span className="analogy-icon">↻</span><div><b>Lifecycle phase</b><p>React calls this method as the component mounts, updates, unmounts, or handles a rendering error.</p></div></div></div>
    <div className="workbench-grid"><ClassMethodPlayground method={method} onLifecycle={addLifecycleEvent}/><CodePanel code={method.code} highlightedLines={method.lines} title={`${method.name} example`}/></div>
    <section className="sequence-panel panel"><div className="sequence-heading"><div><span className="eyebrow">METHOD NOTES</span><h2>What to remember</h2></div></div><div className="method-notes"><div><b>Phase</b><span>{method.phase}</span></div><div><b>Purpose</b><span>{method.summary}</span></div><div><b>Practice tip</b><span>{method.phase === 'Legacy · avoid' ? 'This is historical code for reading and migration. Avoid the unsafe method in new components and use its suggested replacement.' : method.phase === 'Error boundary' ? 'Trigger a child render error and inspect the fallback plus the error trace. A boundary does not catch event-handler errors.' : 'Use the live controls and read the event trace. Keep render pure, compare previous values before updating, and clean up external work.'}</span></div></div></section>
    {events.length > 0 && <section className="sequence-panel panel"><div className="sequence-heading"><div><span className="eyebrow">LIVE TRACE</span><h2>Lifecycle event log</h2></div></div><div className="event-trace" aria-live="polite">{events.map((event, index) => <p key={`${event}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span>{event}</p>)}</div><p className="strict-mode-note">React Strict Mode can run an extra development-only mount → cleanup → mount check. This helps verify cleanup and does not repeat in production.</p></section>}
  </>
}


function App() {
  const [activeProject, setActiveProject] = useState('lifecycle')
  const [selectedHook, setSelectedHook] = useState('useState')
  const [selectedMethod, setSelectedMethod] = useState('componentDidMount')
  const [track, setTrack] = useState('hooks')
  const [openProject, setOpenProject] = useState('lifecycle')
  const [theme, setTheme] = useState(() => localStorage.getItem('learning-studio-theme') || 'dark')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('learning-studio-theme', theme)
  }, [theme])

  function toggleProject(projectId) {
    setOpenProject((current) => current === projectId ? '' : projectId)
    setActiveProject(projectId)
    setMobileNavOpen(false)
    if (projectId === 'lifecycle') setTrack('hooks')
  }

  return <div className="app-shell min-h-screen bg-[var(--canvas)] text-[var(--text)]">
    {mobileNavOpen && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)}/>}
    <aside className={`app-sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
      <a className="brand" href="#top"><span className="brand-mark"><Atom aria-hidden size={23} strokeWidth={1.8}/></span><span>React<br/>Learning Lab</span></a>
      <div className="sidebar-caption">YOUR PROJECTS <span>04</span></div>
      <nav className="project-list" aria-label="Tutorial projects">{projects.map((project) => {
        const isOpen = openProject === project.id
        const ProjectIcon = project.icon
        return <section className="project-accordion" key={project.id}>
          <button className={`project-trigger ${activeProject === project.id ? 'active' : ''}`} aria-expanded={isOpen} onClick={() => toggleProject(project.id)}><span className="project-index"><ProjectIcon aria-hidden size={18} strokeWidth={1.8}/></span><span className="project-label"><b>{project.name}</b><small>{project.description}</small></span><ChevronDown aria-hidden size={17} className={`chevron ${isOpen ? 'open' : ''}`}/></button>
          <AnimatePresence initial={false}>{isOpen && <motion.div className="accordion-content" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .22 }}>
            {project.id === 'lifecycle' ? <>
              <div className="menu-section-title">FUNCTION HOOKS &amp; API</div>
              {hooks.map((hook) => <button key={hook.id} className={`lesson-link ${track === 'hooks' && selectedHook === hook.id ? 'chosen' : ''}`} onClick={() => { setActiveProject('lifecycle'); setTrack('hooks'); setSelectedHook(hook.id); setMobileNavOpen(false) }}>{hook.label}</button>)}
              <div className="menu-section-title class-menu-title">CLASS COMPONENTS</div>
              {lifecycleMethods.map((method) => <button key={method.id} className={`lesson-link ${track === 'classes' && selectedMethod === method.id ? 'chosen' : ''}`} onClick={() => { setActiveProject('lifecycle'); setTrack('classes'); setSelectedMethod(method.id); setMobileNavOpen(false) }}>{method.name}</button>)}
              <div className="menu-section-title class-menu-title">VISUAL WALKTHROUGH</div>
              <button className={`lesson-link ${track === 'cycle' ? 'chosen' : ''}`} onClick={() => { setActiveProject('lifecycle'); setTrack('cycle'); setMobileNavOpen(false) }}>Mount → API → unmount</button>
            </> : <button className="lesson-link project-overview-link" onClick={() => { setActiveProject(project.id); setMobileNavOpen(false) }}>Project overview <span>→</span></button>}
          </motion.div>}</AnimatePresence>
        </section>
      })}</nav>
      <div className="sidebar-foot"><span className="profile-avatar">RL</span><span><b>Learning workspace</b><small>LOCAL TUTORIALS</small></span></div>
    </aside>
    <div className="app-main" id="top">
      <header className="topbar"><div className="breadcrumbs"><button className="mobile-nav-button" onClick={() => setMobileNavOpen(true)} aria-label="Open project navigation"><Menu aria-hidden size={20}/></button><span>LEARNING LAB</span><i>/</i><b>{projects.find((project) => project.id === activeProject)?.name}</b></div><div className="topbar-actions"><span className="workspace-status"><i/> LOCAL WORKSPACE</span><button className="theme-switch" onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}><span>{theme === 'dark' ? <Sun aria-hidden size={17}/> : <Moon aria-hidden size={17}/>}</span><b>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</b></button></div></header>
      <main className="lesson-main">{activeProject === 'lifecycle' ? <ErrorBoundary><LifecycleLab selectedHook={selectedHook} setSelectedHook={setSelectedHook} selectedMethod={selectedMethod} setSelectedMethod={setSelectedMethod} track={track} setTrack={setTrack}/></ErrorBoundary> : <ProjectContent project={projects.find((project) => project.id === activeProject)}/>}</main>
      <footer className="footer"><span>LEARN BY TRYING, THEN TRACE THE CODE.</span><span>REACT LEARNING LAB</span></footer>
    </div>
  </div>
}

export default App
