import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronRight, FileCode2, Folder, FolderOpen, Minus, Plus, RotateCcw, Trash2 } from 'lucide-react'
import CodePanel from '../../components/CodePanel.jsx'

const projectCode = {
  counter: `import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  function increase() {
    setCount(currentCount => currentCount + 1)
  }

  function decrease() {
    setCount(currentCount => currentCount - 1)
  }

  function reset() {
    setCount(0)
  }

  return (
    <section>
      <button onClick={decrease}>−</button>
      <output>{count}</output>
      <button onClick={increase}>+</button>
      <button onClick={reset}>Reset</button>
    </section>
  )
}`,
  props: `import { useState } from 'react'

const students = [
  { id: 'ada', name: 'Ada Lovelace', role: 'Learner', score: 92 },
  { id: 'grace', name: 'Grace Hopper', role: 'Mentor', score: 98 },
  { id: 'linus', name: 'Linus Torvalds', role: 'Contributor', score: 88 },
]

function Parent() {
  const [student, setStudent] = useState(students[0])

  function chooseStudent(id) {
    const nextStudent = students.find((item) => item.id === id)
    if (nextStudent) setStudent(nextStudent)
  }

  return (
    <>
      <select value={student.id}
        onChange={(event) => chooseStudent(event.target.value)}>
        {students.map((item) => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </select>
      <StudentCard name={student.name} role={student.role} score={student.score} />
    </>
  )
}

function StudentCard({ name, role, score }) {
  return <article>{name} · {role} · {score}%</article>
}`,
  queue: `import { useState } from 'react'

function ServiceQueue() {
  const [queue, setQueue] = useState([
    { id: 1, name: 'Ada' },
    { id: 2, name: 'Grace' },
  ])
  const [nextId, setNextId] = useState(3)
  const [name, setName] = useState('')

  function addToQueue(event) {
    event.preventDefault()
    const cleanName = name.trim()
    if (!cleanName) return
    const person = { id: nextId, name: cleanName }
    setQueue(currentQueue => [...currentQueue, person])
    setNextId(currentId => currentId + 1)
    setName('')
  }

  function serveNext() {
    setQueue(current => current.slice(1))
  }

  function clearQueue() {
    setQueue([])
  }

  return (
    <section>
      <p>Next: {queue[0]?.name ?? 'No one waiting'}</p>
      <form onSubmit={addToQueue}>
        <input value={name} onChange={event => setName(event.target.value)} />
        <button disabled={!name.trim()}>Add person</button>
      </form>
      <button type="button" onClick={serveNext} disabled={!queue.length}>
        Serve next
      </button>
      <button type="button" onClick={clearQueue} disabled={!queue.length}>
        Clear queue
      </button>
      <ol>{queue.map(person => <li key={person.id}>{person.name}</li>)}</ol>
    </section>
  )
}`,
}

function ProjectHeading({ project, eyebrow, title, description }) {
  return <div className="project-lesson-intro"><p className="eyebrow">{eyebrow}</p><div className="project-title-row"><div><h1>{title || project.name}</h1><p>{description || project.description}</p></div><span className="lesson-count">INTERACTIVE LAB</span></div></div>
}

function CounterProject({ project }) {
  const [count, setCount] = useState(0)
  const [lastAction, setLastAction] = useState('Start with zero, then change the value.')
  const [highlightedLines, setHighlightedLines] = useState([4])
  function changeCount(action) {
    const updates = {
      decrement: { lines: [10, 11, 20], message: 'Decrease clicked → the updater calculates the next count → React renders the output.' },
      increment: { lines: [6, 7, 22], message: 'Increase clicked → the updater calculates the next count → React renders the output.' },
      reset: { lines: [14, 15, 23], message: 'Reset clicked → setCount(0) requests a render with zero.' },
    }
    const update = updates[action]
    if (action === 'increment') setCount((currentCount) => currentCount + 1)
    if (action === 'decrement') setCount((currentCount) => currentCount - 1)
    if (action === 'reset') setCount(0)
    setHighlightedLines(update.lines)
    setLastAction(update.message)
  }
  return <section className="project-lesson">
    <ProjectHeading project={project} eyebrow="PROJECT 01 · STATE + EVENTS" title="A counter you can trace" description="Change the number, then follow the click handler and state update in the source."/>
    <div className="project-workbench">
      <section className="panel project-demo"><div className="project-demo-heading"><div><span className="eyebrow">LIVE COUNTER</span><h2>Component state</h2></div><span className="ready-badge"><i/> RENDERED</span></div><div className="project-counter-value" aria-live="polite"><AnimatePresence mode="popLayout"><motion.span key={count} initial={{ opacity: 0, y: 16, scale: .92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .2 }}>{count}</motion.span></AnimatePresence></div><div className="counter-controls"><button className="counter-button secondary" onClick={() => changeCount('decrement')} aria-label="Decrease count"><Minus aria-hidden size={18}/></button><button className="counter-button primary" onClick={() => changeCount('increment')}><Plus aria-hidden size={18}/><span>Increase</span></button><button className="counter-button secondary reset-button" onClick={() => changeCount('reset')}><RotateCcw aria-hidden size={15}/>Reset</button></div><div className="project-event" aria-live="polite"><span className="live-dot"/><p>{lastAction}</p></div></section>
      <CodePanel code={projectCode.counter} highlightedLines={highlightedLines} title="Counter.jsx"/>
    </div>
    <div className="project-learning-cards"><article className="panel"><span className="eyebrow">WHAT CHANGED?</span><h2>State is the source of truth</h2><p>The number is stored in the component. A click calls a setter; React then calls the component again with the new state and updates the output.</p></article><article className="panel"><span className="eyebrow">WHY AN UPDATER?</span><h2>Calculate from the previous value</h2><p><code>currentCount =&gt; currentCount + 1</code> receives the latest queued state. This avoids relying on an older value captured by a click handler.</p></article></div>
  </section>
}

function PropsProject({ project }) {
  const students = [
    { id: 'ada', name: 'Ada Lovelace', role: 'Learner', score: 92, color: 'violet' },
    { id: 'grace', name: 'Grace Hopper', role: 'Mentor', score: 98, color: 'purple' },
    { id: 'linus', name: 'Linus Torvalds', role: 'Contributor', score: 88, color: 'blue' },
  ]
  const [studentId, setStudentId] = useState('ada')
  const [highlightedLines, setHighlightedLines] = useState([10, 17, 25, 30, 31])
  const [lastAction, setLastAction] = useState('Choose a profile. Parent state becomes child props.')
  const student = students.find((entry) => entry.id === studentId)
  function selectStudent(event) {
    const nextId = event.target.value
    setStudentId(nextId)
    setHighlightedLines([12, 13, 14, 25])
    setLastAction(`Parent updated student → passed name, role, and score to StudentCard.`)
  }
  return <section className="project-lesson">
    <ProjectHeading project={project} eyebrow="PROJECT 02 · DATA FLOW" title="Props move data down" description="Change the parent’s selected student and watch the child update from the props it receives."/>
    <div className="project-workbench">
      <section className="panel project-demo props-demo"><div className="project-demo-heading"><div><span className="eyebrow">PARENT COMPONENT</span><h2>Choose the data</h2></div><span className="ready-badge"><i/> LIVE</span></div><label className="project-field">Selected student<select value={studentId} onChange={selectStudent}>{students.map((entry) => <option value={entry.id} key={entry.id}>{entry.name}</option>)}</select></label><div className="props-flow"><div className="props-node parent-node"><span>Parent state</span><b>{student.name}</b><small>student object</small></div><motion.div className="props-connector" key={student.id} initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ duration: .3 }}>name · role · score <span><ArrowRight aria-hidden size={18}/></span></motion.div><AnimatePresence mode="wait"><motion.article className={`student-card ${student.color}`} key={student.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .2 }}><div className="student-avatar">{student.name.split(' ').map((part) => part[0]).join('')}</div><div><span className="eyebrow">CHILD · STUDENTCARD</span><h3>{student.name}</h3><p>{student.role}</p><strong>{student.score}% <small>learning score</small></strong></div></motion.article></AnimatePresence></div><div className="project-event"><span className="live-dot"/><p>{lastAction}</p></div></section>
      <CodePanel code={projectCode.props} highlightedLines={highlightedLines} title="StudentCard.jsx"/>
    </div>
    <div className="project-learning-cards"><article className="panel"><span className="eyebrow">DATA FLOW</span><h2>Parent → child</h2><p>The parent owns the selected student. It passes specific values as props. The child reads them to render a profile card.</p></article><article className="panel"><span className="eyebrow">IMPORTANT RULE</span><h2>Props are read-only</h2><p>A child should not mutate props. To change this example, update the parent state, then React passes the new values down.</p></article></div>
  </section>
}

function QueueProject({ project }) {
  const [queue, setQueue] = useState([{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }])
  const [nextId, setNextId] = useState(3)
  const [name, setName] = useState('')
  const [highlightedLines, setHighlightedLines] = useState([4])
  const [lastAction, setLastAction] = useState('Two people are waiting. Add someone or serve the next person.')
  function addPerson(event) {
    event.preventDefault()
    const cleanName = name.trim()
    if (!cleanName) return
    setQueue((currentQueue) => [...currentQueue, { id: nextId, name: cleanName }])
    setNextId((currentId) => currentId + 1)
    setName('')
    setHighlightedLines([11, 12, 13, 14, 15, 16, 17, 18, 32, 33, 34])
    setLastAction(`${cleanName} joins the end of the queue. The previous order is preserved.`)
  }
  function serveNext() {
    if (!queue.length) return
    const served = queue[0].name
    setQueue((currentQueue) => currentQueue.slice(1))
    setHighlightedLines([21, 22, 36, 37, 38])
    setLastAction(`${served} was served. slice(1) creates a new array without the first person.`)
  }
  function clearQueue() {
    setQueue([])
    setHighlightedLines([25, 26, 39, 40, 41])
    setLastAction('The waiting list is empty. The UI now renders the empty state.')
  }
  return <section className="project-lesson">
    <ProjectHeading project={project} eyebrow="PROJECT 03 · ARRAYS + STATE" title="Manage a service queue" description="Add and serve people while keeping the queue immutable and the order predictable."/>
    <div className="project-workbench">
      <section className="panel project-demo queue-demo"><div className="project-demo-heading"><div><span className="eyebrow">SERVICE DESK</span><h2>Waiting queue</h2></div><span className="queue-count">{queue.length} {queue.length === 1 ? 'PERSON' : 'PEOPLE'}</span></div><div className="queue-next"><span className="eyebrow">NOW SERVING NEXT</span><AnimatePresence mode="wait"><motion.b key={queue[0]?.id || 'empty'} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>{queue[0]?.name || 'No one waiting'}</motion.b></AnimatePresence><span className="queue-position">POSITION 01</span></div><form className="queue-form" onSubmit={addPerson}><label className="project-field">Add a person<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter a name" maxLength={24}/></label><button className="action-button" type="submit" disabled={!name.trim()}><Plus aria-hidden size={16}/>Add to queue</button></form><ol className="queue-list" aria-label="People waiting in order"><AnimatePresence initial={false}>{queue.map((person, index) => <motion.li key={person.id} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }} transition={{ duration: .22 }}><span>{String(index + 1).padStart(2, '0')}</span><b>{person.name}</b>{index === 0 && <small>NEXT</small>}</motion.li>)}</AnimatePresence>{queue.length === 0 && <li className="queue-empty">The queue is empty. Add the first person.</li>}</ol><div className="queue-actions"><button className="action-button primary" onClick={serveNext} disabled={!queue.length}><ArrowRight aria-hidden size={16}/>Serve next person</button><button className="action-button" onClick={clearQueue} disabled={!queue.length}><Trash2 aria-hidden size={15}/>Clear queue</button></div><div className="project-event"><span className="live-dot"/><p>{lastAction}</p></div></section>
      <CodePanel code={projectCode.queue} highlightedLines={highlightedLines} title="ServiceQueue.jsx"/>
    </div>
    <div className="project-learning-cards"><article className="panel"><span className="eyebrow">IMMUTABLE UPDATE</span><h2>Create a new array</h2><p><code>[...currentQueue, cleanName]</code> keeps everyone already waiting and adds one person at the end.</p></article><article className="panel"><span className="eyebrow">FIRST IN, FIRST OUT</span><h2>Serve the head</h2><p><code>slice(1)</code> returns a new array without the first entry. React sees a new array reference and renders the updated queue.</p></article></div>
  </section>
}

function flattenSourceFiles(nodes) {
  return nodes.flatMap((node) => node.type === 'directory' ? flattenSourceFiles(node.children) : [node.path])
}

function findInitialSourceFile(nodes, projectSlug) {
  const flattened = flattenSourceFiles(nodes)
  if (projectSlug === 'lifecycle') return flattened.find((filePath) => filePath === 'features/lifecycle/hooks.js') || flattened[0] || ''
  return flattened.find((filePath) => filePath.endsWith('/src/App.jsx')) || flattened.find((filePath) => filePath.endsWith('src/App.jsx')) || flattened[0] || ''
}

function SourceTree({ nodes, selectedPath, onSelect, depth = 0 }) {
  return <ul className="source-tree-list">{nodes.map((node) => <li key={node.path}>
    {node.type === 'directory' ? <details open={depth === 0}>
      <summary><ChevronRight className="tree-folder-icon" aria-hidden size={15}/><Folder aria-hidden size={15}/>{node.name}</summary>
      <SourceTree nodes={node.children} selectedPath={selectedPath} onSelect={onSelect} depth={depth + 1}/>
    </details> : <button className={selectedPath === node.path ? 'selected' : ''} aria-current={selectedPath === node.path ? 'page' : undefined} onClick={() => onSelect(node.path)}><FileCode2 aria-hidden size={14}/>{node.name}</button>}
  </li>)}</ul>
}

export function ProjectFileBrowser({ projectSlug }) {
  const [isOpen, setIsOpen] = useState(false)
  const [projectFiles, setProjectFiles] = useState(null)
  const [selectedPath, setSelectedPath] = useState('')
  const [sourceFile, setSourceFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen || projectFiles) return undefined
    const controller = new AbortController()
    setIsLoading(true)
    fetch('/__explorer/api/projects', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('The project file list could not be loaded.')
        return response.json()
      })
      .then((projectsOnDisk) => {
        const currentProject = projectsOnDisk.find((entry) => entry.slug === projectSlug)
        if (!currentProject) throw new Error(`Could not find the ${projectSlug} tutorial folder.`)
        setProjectFiles(currentProject.files)
        setSelectedPath(findInitialSourceFile(currentProject.files, projectSlug))
        setError('')
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [isOpen, projectFiles, projectSlug])

  useEffect(() => {
    if (!isOpen || !selectedPath) return undefined
    const controller = new AbortController()
    setIsLoading(true)
    fetch(`/__explorer/api/file?path=${encodeURIComponent(`${projectSlug}/${selectedPath}`)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('That source file could not be opened.')
        return response.json()
      })
      .then((file) => {
        setSourceFile(file)
        setError('')
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [isOpen, projectSlug, selectedPath])

  return <section className="project-source-browser panel">
    <header className="source-browser-heading"><div><span className="eyebrow">REAL PROJECT FILES</span><h2>Explore the source tree</h2><p>Open a folder and select a file to read its actual contents.</p></div><button className="action-button" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>{isOpen ? 'Hide file browser' : 'Browse files'}</button></header>
    {isOpen && <div className="source-browser-workspace">
      <nav className="source-tree" aria-label={`${projectSlug} project files`}>
        <div className="source-tree-root"><FolderOpen aria-hidden size={16}/>{projectSlug === 'lifecycle' ? 'src/' : `${projectSlug}/`}</div>
        {projectFiles ? <SourceTree nodes={projectFiles} selectedPath={selectedPath} onSelect={setSelectedPath}/> : <p className="source-loading">{error || 'Loading project files…'}</p>}
      </nav>
      <section className="source-file-view" aria-label="Selected source file">
        <header><span>{sourceFile?.path || 'Choose a file'}</span><span>{isLoading ? 'LOADING' : sourceFile?.binary ? 'BINARY ASSET' : sourceFile ? `${sourceFile.content.split('\n').length} LINES` : 'SOURCE'}</span></header>
        {error && projectFiles && <p className="source-loading">{error}</p>}
        {sourceFile?.binary
          ? <p className="source-loading">This file is a binary asset, so it has no readable source text.</p>
          : sourceFile
            ? <pre className="file-source-code"><code>{sourceFile.content}</code></pre>
            : <p className="source-loading">Select a file from the tree to inspect it.</p>}
      </section>
    </div>}
  </section>
}

export default function ProjectContent({ project }) {
  return <>
    {project.id === 'counter' ? <CounterProject project={project}/> : project.id === 'props' ? <PropsProject project={project}/> : <QueueProject project={project}/>}
    <ProjectFileBrowser key={project.sourceDir} projectSlug={project.sourceDir}/>
  </>
}

