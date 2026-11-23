import { Component, useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import CodePanel from '../../components/CodePanel.jsx'
import { classCycleCode, classStages, effectCycleCode, effectStages } from './lifecycleCycle'

function ProfileCard({ profile }) {
  if (!profile) {
    return (
      <div className="profile-skeleton">
        <span className="skeleton-avatar" />
        <span className="skeleton-bar" />
        <span className="skeleton-bar short" />
        <p>Loading profile from the local demo API…</p>
      </div>
    )
  }

  return (
    <motion.div
      className="profile-result"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="profile-portrait">{profile.initials}</div>
      <div className="profile-result-copy">
        <span className="profile-status"><i /> API RESPONSE · 200 OK</span>
        <h3>{profile.name}</h3>
        <p>{profile.role}</p>
        <small>{profile.location}</small>
      </div>
    </motion.div>
  )
}

function FunctionProfileFetcher({ userId, onStage }) {
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false
    setProfile(null)
    setStatus('loading')
    onStage('commit', 'React committed the loading card to the page.')
    onStage('setup', 'useEffect setup started the profile request.')

    fetch(`/__explorer/api/demo/profile?userId=${userId}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed with ${response.status}`)
        return response.json()
      })
      .then((data) => {
        if (ignore) return
        onStage('response', 'The API returned JSON; the Effect saved it in state.')
        setProfile(data)
        setStatus('success')
        onStage('update', 'State changed, so React rendered the profile card.')
      })
      .catch((error) => {
        if (ignore || error.name === 'AbortError') return
        setStatus('error')
      })

    return () => {
      ignore = true
      controller.abort()
      onStage('cleanup', 'Effect cleanup ignored stale data and aborted the request.')
    }
  }, [userId, onStage])

  if (status === 'error') return <div className="api-error">The profile request failed. Try mounting the demo again.</div>
  return <ProfileCard profile={profile}/>
}

class ClassProfileFetcher extends Component {
  state = { profile: null, status: 'loading' }
  controller = null

  componentDidMount() {
    this.props.onStage('commit', 'React committed the loading card; componentDidMount ran.')
    this.loadProfile(this.props.userId)
  }

  componentDidUpdate(previousProps) {
    if (previousProps.userId !== this.props.userId) {
      this.cancelRequest()
      this.loadProfile(this.props.userId)
    }
  }

  componentWillUnmount() {
    this.cancelRequest()
    this.props.onStage('cleanup', 'componentWillUnmount aborted the pending request.')
  }

  async loadProfile(userId) {
    this.controller = new AbortController()
    this.setState({ profile: null, status: 'loading' })
    this.props.onStage('setup', 'componentDidMount / componentDidUpdate started fetch.')

    try {
      const response = await fetch(`/__explorer/api/demo/profile?userId=${userId}`, { signal: this.controller.signal })
      if (!response.ok) throw new Error(`Request failed with ${response.status}`)
      const profile = await response.json()
      this.props.onStage('response', 'The API responded; class state is updated with setState.')
      this.setState({ profile, status: 'success' })
      this.props.onStage('update', 'setState caused render and componentDidUpdate.')
    } catch (error) {
      if (error.name !== 'AbortError') this.setState({ status: 'error' })
    }
  }

  cancelRequest() {
    this.controller?.abort()
  }

  render() {
    return this.state.status === 'error'
      ? <div className="api-error">The profile request failed. Try mounting the demo again.</div>
      : <ProfileCard profile={this.state.profile}/>
  }
}

export default function LifecycleWalkthrough() {
  const [style, setStyle] = useState('function')
  const [mounted, setMounted] = useState(true)
  const [userId, setUserId] = useState('1')
  const [stageId, setStageId] = useState('mount')
  const [events, setEvents] = useState(['Ready to walk through a component lifecycle.'])
  const stageList = style === 'function' ? effectStages : classStages
  const currentStage = stageList.find((stage) => stage.id === stageId) || stageList[0]

  const onStage = useCallback((nextStage, message) => {
    setStageId(nextStage)
    setEvents((current) => [`${new Date().toLocaleTimeString()}  ${message}`, ...current].slice(0, 7))
  }, [])

  const source = style === 'function' ? effectCycleCode : classCycleCode

  return (
    <section className="cycle-section">
      <div className="cycle-intro">
        <p className="eyebrow">COMPONENT LIFECYCLE · DEEP DIVE</p>
        <h1>From first render<br/>to clean unmount.</h1>
        <p>Follow a real request from mount to loading state, API response, update, and cleanup. Change the record while mounted, or unmount during a request to see cancellation.</p>
        <a className="docs-link" href="https://react.dev/learn/lifecycle-of-reactive-effects" target="_blank" rel="noreferrer">Read the official React Effect lifecycle guide ↗</a>
      </div>

      <div className="cycle-model panel">
        <div><span>COMPONENT</span><b>mount → update → unmount</b></div>
        <i>≠</i>
        <div><span>EFFECT</span><b>setup → cleanup → setup</b></div>
        <p>When the profile ID changes, the component stays mounted. React first cleans up the old request, then starts synchronization with the new ID.</p>
      </div>

      <div className="cycle-controls panel">
        <div className="cycle-control-group">
          <span className="eyebrow">IMPLEMENTATION</span>
          <div className="segmented-control">
            <button className={style === 'function' ? 'selected' : ''} onClick={() => { setStyle('function'); setStageId('mount'); setEvents(['Function component selected.']) }}>Function + useEffect</button>
            <button className={style === 'class' ? 'selected' : ''} onClick={() => { setStyle('class'); setStageId('mount'); setEvents(['Class component selected.']) }}>Class lifecycle</button>
          </div>
        </div>
        <label className="cycle-control-group">
          <span className="eyebrow">REQUEST PROFILE</span>
          <select value={userId} onChange={(event) => { setUserId(event.target.value); setStageId('cleanup') }}>
            <option value="1">Ada Lovelace · #1</option>
            <option value="2">Grace Hopper · #2</option>
            <option value="3">Katherine Johnson · #3</option>
          </select>
        </label>
      </div>

      <div className="lifecycle-rail panel" aria-label="Lifecycle phases">
        {stageList.map((stage, index) => (
          <button key={stage.id} className={`lifecycle-phase ${stageId === stage.id ? 'active phase-' + stage.id : ''}`} onClick={() => setStageId(stage.id)}>
            <span className="phase-index">{String(index + 1).padStart(2, '0')}</span>
            <b>{stage.label}</b>
            {index < stageList.length - 1 && <i>→</i>}
          </button>
        ))}
      </div>

      <div className="cycle-workbench">
        <section className="cycle-preview panel">
          <header className="panel-heading">
            <div><span className="eyebrow">BROWSER PREVIEW</span><h2>{mounted ? 'Profile page is mounted' : 'Component is unmounted'}</h2></div>
            <span className={`mount-state ${mounted ? 'mounted' : ''}`}><i/>{mounted ? 'MOUNTED' : 'UNMOUNTED'}</span>
          </header>
          <div className="preview-browser">
            <div className="browser-bar"><i/><i/><i/><span>learning-lab.local/profile/{userId}</span></div>
            <div className="browser-screen">
              {mounted
                ? style === 'function'
                  ? <FunctionProfileFetcher key={style} userId={userId} onStage={onStage}/>
                  : <ClassProfileFetcher key={style} userId={userId} onStage={onStage}/>
                : <div className="unmounted-message"><span>⌁</span><b>No component on this page</b><p>The component was removed. Its cleanup has run.</p></div>}
            </div>
          </div>
          <div className="mount-controls">
            {mounted
              ? <button className="action-button danger" onClick={() => { setStageId('cleanup'); setMounted(false); setEvents((current) => [`${new Date().toLocaleTimeString()}  Parent removed ProfilePanel from the tree.`, ...current].slice(0, 7)) }}>Unmount component</button>
              : <button className="action-button mount-button" onClick={() => { setStageId('mount'); setMounted(true); setEvents((current) => [`${new Date().toLocaleTimeString()}  Parent added ProfilePanel to the tree.`, ...current].slice(0, 7)) }}>Mount component</button>}
            <span>Try changing the profile selector while mounted to see cleanup → setup.</span>
          </div>
        </section>
        <CodePanel code={source} highlightedLines={currentStage.lines} title={style === 'function' ? 'ProfilePanel.jsx' : 'ClassProfilePanel.jsx'}/>
      </div>

      <div className="cycle-detail-grid">
        <section className="panel cycle-explanation">
          <span className="eyebrow">CURRENT PHASE · {currentStage.label.toUpperCase()}</span>
          <h2>{currentStage.label}</h2>
          <p>{currentStage.description}</p>
          <div className="cycle-note">
            <b>Why it matters</b>
            <span>{stageId === 'cleanup'
              ? 'Cleanup protects against stale responses and releases resources. Aborting a request is useful, but still guard against results that are no longer relevant.'
              : stageId === 'setup'
                ? 'Fetching is a side effect because it synchronizes the component with a network service. Start it after commit, not during render.'
                : 'Rendering describes the UI. React commits that description to the DOM, then runs synchronization work at the appropriate time.'}</span>
          </div>
        </section>
        <section className="panel event-panel">
          <header className="panel-heading"><div><span className="eyebrow">RUNTIME EVENT TRACE</span><h2>Watch the sequence</h2></div><button className="clear-events" onClick={() => setEvents([])}>Clear</button></header>
          <div className="event-list" aria-live="polite">
            {events.length
              ? events.map((event, index) => <p key={`${event}-${index}`}><span>{String(events.length - index).padStart(2, '0')}</span>{event}</p>)
              : <p className="empty-events">Events will appear here as you interact.</p>}
          </div>
        </section>
      </div>

      <p className="strict-mode-note"><b>Development note:</b> Strict Mode may run Effect setup → cleanup → setup once on mount to help reveal missing cleanup. This is a development check, not duplicate production behavior.</p>
    </section>
  )
}
