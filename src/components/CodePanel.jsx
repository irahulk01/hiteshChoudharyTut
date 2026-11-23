export default function CodePanel({ code, highlightedLines = [], title = 'Counter.jsx' }) {
  return (
    <section className="code-panel panel">
      <header className="panel-heading">
        <div><span className="eyebrow">SOURCE CODE</span><h2>{title}</h2></div>
        <span className="language-badge">JSX</span>
      </header>
      <pre className="source-code" aria-label="Example source code"><code>
        {code.split('\n').map((line, index) => {
          const number = index + 1
          const highlighted = highlightedLines.includes(number)
          return <span className={`source-line ${highlighted ? 'line-active' : ''}`} key={number} id={`line-${number}`}><span className="line-number">{String(number).padStart(2, '0')}</span><span>{line || ' '}</span></span>
        })}
      </code></pre>
      <p className="code-hint"><span className="hint-dot"/>Highlighted lines match the current action.</p>
    </section>
  )
}

