import { Component, createRef, useState } from 'react'

class ClassCounter extends Component {
  state = { count: 0 }

  componentDidMount() {
    this.props.onLifecycle('componentDidMount: class counter is now in the DOM.')
  }

  componentDidUpdate(previousProps, previousState) {
    if (previousState.count !== this.state.count) {
      this.props.onLifecycle(`componentDidUpdate: count changed to ${this.state.count}.`)
    }
  }

  componentWillUnmount() {
    this.props.onLifecycle('componentWillUnmount: cleanup ran before removal.')
  }

  render() {
    return (
      <>
        <p className="class-demo-caption">setState → render → componentDidUpdate</p>
        <div className="class-counter-value" aria-live="polite">{this.state.count}</div>
        <div className="counter-controls">
          <button className="counter-button secondary" aria-label="Decrease class count" onClick={() => this.setState(({ count }) => ({ count: count - 1 }))}>−</button>
          <button className="counter-button primary" onClick={() => this.setState(({ count }) => ({ count: count + 1 }))}>+ <span>Increase</span></button>
          <button className="counter-button secondary reset-button" onClick={() => this.setState({ count: 0 })}>Reset</button>
        </div>
      </>
    )
  }
}

class ConstructorCounter extends Component {
  constructor(props) {
    super(props)
    this.state = { count: 0 }
    // Binding makes this.increment keep the class instance as `this`.
    this.increment = this.increment.bind(this)
  }

  increment() {
    this.setState(({ count }) => ({ count: count + 1 }))
  }

  render() {
    return (
      <>
        <p className="class-demo-caption">The constructor created the initial state.</p>
        <div className="class-counter-value" aria-live="polite">{this.state.count}</div>
        <button className="action-button primary" onClick={this.increment}>Increment instance state</button>
      </>
    )
  }
}

class MountedTimer extends Component {
  state = { seconds: 0 }
  timerId = null

  componentDidMount() {
    this.props.onLifecycle('componentDidMount: started a one-second timer after the DOM commit.')
    this.timerId = window.setInterval(() => {
      this.setState(({ seconds }) => ({ seconds: seconds + 1 }))
    }, 1000)
  }

  componentWillUnmount() {
    window.clearInterval(this.timerId)
    this.props.onLifecycle('componentWillUnmount: cleared the timer before removal.')
  }

  render() {
    return (
      <>
        <p className="class-demo-caption">The timer starts only after mount. Unmount this component to stop it.</p>
        <div className="class-counter-value" aria-live="polite">{this.state.seconds}<small> sec</small></div>
      </>
    )
  }
}

class DerivedDraft extends Component {
  state = { previousRecordId: null, draft: '' }

  static getDerivedStateFromProps(props, state) {
    if (props.recordId !== state.previousRecordId) {
      return { previousRecordId: props.recordId, draft: props.initialDraft }
    }
    return null
  }

  render() {
    return (
      <label className="project-field">Draft for {this.props.recordName}
        <input value={this.state.draft} onChange={(event) => this.setState({ draft: event.target.value })}/>
      </label>
    )
  }
}

function DerivedPropsDemo({ onLifecycle }) {
  const records = [
    { id: 'one', name: 'Record One', draft: 'First draft' },
    { id: 'two', name: 'Record Two', draft: 'Second draft' },
  ]
  const [recordId, setRecordId] = useState(records[0].id)
  const record = records.find((entry) => entry.id === recordId)

  return (
    <>
      <label className="project-field">Choose a record
        <select value={recordId} onChange={(event) => {
          const nextId = event.target.value
          setRecordId(nextId)
          const nextRecord = records.find((entry) => entry.id === nextId)
          onLifecycle(`Parent changed to ${nextRecord.name}; getDerivedStateFromProps reset the draft.`)
        }}>
          {records.map((entry) => <option value={entry.id} key={entry.id}>{entry.name}</option>)}
        </select>
      </label>
      <DerivedDraft recordId={record.id} recordName={record.name} initialDraft={record.draft}/>
      <p className="class-demo-caption">Changing the record identity resets the draft from the new props.</p>
    </>
  )
}

class CountDisplay extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.count !== this.props.count
  }

  render() {
    return <div className="class-counter-value" aria-live="polite">Child count: {this.props.count}</div>
  }
}

function ShouldUpdateDemo({ onLifecycle }) {
  const [count, setCount] = useState(0)
  const [parentRender, setParentRender] = useState(0)

  return (
    <>
      <p className="class-demo-caption">Parent render: {parentRender} · child prop: {count}</p>
      <CountDisplay count={count}/>
      <div className="mini-actions">
        <button className="action-button" onClick={() => {
          setParentRender((value) => value + 1)
          onLifecycle('Parent rendered with the same count; shouldComponentUpdate returned false for the child.')
        }}>Render parent with same prop</button>
        <button className="action-button primary" onClick={() => {
          setCount((value) => value + 1)
          onLifecycle('Count changed; shouldComponentUpdate allowed the child to render.')
        }}>Change child prop</button>
      </div>
      <p className="class-demo-caption">The child skips the first update and renders when count changes.</p>
    </>
  )
}

class SnapshotList extends Component {
  listRef = createRef()
  state = { items: ['Message 1', 'Message 2', 'Message 3', 'Message 4', 'Message 5', 'Message 6'] }

  addMessage = () => {
    this.setState(({ items }) => ({ items: [`New message ${items.length + 1}`, ...items] }))
  }

  getSnapshotBeforeUpdate() {
    // Read the DOM before React inserts the new list item.
    return this.listRef.current.scrollHeight
  }

  componentDidUpdate(_previousProps, _previousState, previousHeight) {
    const list = this.listRef.current
    list.scrollTop += list.scrollHeight - previousHeight
    this.props.onLifecycle(`Snapshot captured ${previousHeight}px; scrollTop adjusted to keep the same message in view.`)
  }

  render() {
    return (
      <>
        <div className="snapshot-list" ref={this.listRef}>
          {this.state.items.map((item) => <p key={item}>{item}</p>)}
        </div>
        <button className="action-button primary" onClick={this.addMessage}>Insert a message above</button>
        <p className="class-demo-caption">Scroll the list, insert above, and notice the previous messages stay in the same place.</p>
      </>
    )
  }
}

class ErrorDemoBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    this.props.onLifecycle(`componentDidCatch: ${error.message}`)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-demo-fallback" role="alert">
          <b>Fallback UI is active.</b>
          <p>The boundary caught a render error below it.</p>
          <button className="action-button" onClick={this.props.onReset}>Reset error demo</button>
        </div>
      )
    }
    return this.props.children
  }
}

function ErrorThrowingChild() {
  const [shouldThrow, setShouldThrow] = useState(false)
  if (shouldThrow) throw new Error('A deliberate render error')
  return <button className="action-button danger" onClick={() => setShouldThrow(true)}>Trigger a child render error</button>
}

function ErrorBoundaryDemo({ method, onLifecycle }) {
  const [resetKey, setResetKey] = useState(0)
  function reset() {
    setResetKey((key) => key + 1)
    onLifecycle('The demo boundary and its child were mounted again.')
  }

  return (
    <ErrorDemoBoundary key={resetKey} onLifecycle={onLifecycle} onReset={reset}>
      <p className="class-demo-caption">Cause a render error and watch {method.name} move the UI into a safe fallback.</p>
      <ErrorThrowingChild/>
    </ErrorDemoBoundary>
  )
}

function LegacyMethodNote({ method }) {
  const replacement = method.id === 'UNSAFE_componentWillMount'
    ? 'Initialize state with a class field or constructor. Start browser work in componentDidMount.'
    : method.id === 'UNSAFE_componentWillReceiveProps'
      ? 'Prefer a controlled component. Only use getDerivedStateFromProps when state truly must track a prop.'
      : 'Use getSnapshotBeforeUpdate for a DOM value before commit, or componentDidUpdate for post-commit synchronization.'

  return (
    <div className="legacy-method-note">
      <span className="eyebrow">DEPRECATED LIFECYCLE · CODE-ONLY DEMO</span>
      <h3>Learn the method; keep it out of new components.</h3>
      <p>React keeps this method for older class components. The live playground does not invoke it because modern rendering can pause or abandon work. The highlighted example shows the historical shape and the safer replacement.</p>
      <b>Safer replacement: {replacement}</b>
    </div>
  )
}

function PlaygroundShell({ children, onUnmount, mounted, onMount }) {
  return (
    <section className="playground panel">
      <header className="panel-heading"><div><span className="eyebrow">CLASS COMPONENT · LIVE DEMO</span><h2>Try the lifecycle.</h2></div><span className="ready-badge"><i/> LIVE</span></header>
      <div className="class-method-demo">{children}</div>
      {onUnmount && <button className={`action-button ${mounted ? 'danger' : 'mount-button'}`} onClick={mounted ? onUnmount : onMount}>{mounted ? 'Unmount class component' : 'Mount class component'}</button>}
    </section>
  )
}

function ClassCounterDemo({ onLifecycle, DemoComponent = ClassCounter }) {
  const [mounted, setMounted] = useState(true)
  return (
    <PlaygroundShell mounted={mounted} onUnmount={() => setMounted(false)} onMount={() => setMounted(true)}>
      {mounted
        ? <DemoComponent onLifecycle={onLifecycle}/>
        : <div className="unmounted-message"><b>The class instance was removed.</b><p>Its componentWillUnmount cleanup ran.</p></div>}
    </PlaygroundShell>
  )
}

export default function ClassMethodPlayground({ method, onLifecycle }) {
  if (method.id === 'getDerivedStateFromError' || method.id === 'componentDidCatch') {
    return <PlaygroundShell><ErrorBoundaryDemo method={method} onLifecycle={onLifecycle}/></PlaygroundShell>
  }

  if (method.id.startsWith('UNSAFE_')) {
    return <PlaygroundShell><LegacyMethodNote method={method}/></PlaygroundShell>
  }

  if (method.id === 'constructor') {
    return <PlaygroundShell><ConstructorCounter/></PlaygroundShell>
  }

  if (method.id === 'getDerivedStateFromProps') {
    return <PlaygroundShell><DerivedPropsDemo onLifecycle={onLifecycle}/></PlaygroundShell>
  }

  if (method.id === 'shouldComponentUpdate') {
    return <PlaygroundShell><ShouldUpdateDemo onLifecycle={onLifecycle}/></PlaygroundShell>
  }

  if (method.id === 'getSnapshotBeforeUpdate') {
    return <PlaygroundShell><SnapshotList onLifecycle={onLifecycle}/></PlaygroundShell>
  }

  if (method.id === 'componentDidMount' || method.id === 'componentWillUnmount') {
    return <ClassCounterDemo onLifecycle={onLifecycle} DemoComponent={MountedTimer}/>
  }

  return <ClassCounterDemo onLifecycle={onLifecycle}/>
}
