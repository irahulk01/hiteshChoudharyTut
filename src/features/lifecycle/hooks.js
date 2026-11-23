export const hooks = [
  {
    id: 'useState', label: 'useState', group: 'State', demo: 'counter',
    definition: 'useState adds a value that React remembers between renders. Its setter requests a new render with the next value.',
    when: 'Use it for values that change and should be visible: a counter, input, selected tab, or open dialog.',
    analogy: 'Imagine a labeled box React keeps for your component. Each render reads the current value. A setter asks React to put in a new value and draw the screen again.',
    code: `import { useState } from 'react'\n\nfunction Counter() {\n  // 1. Read the value saved for this component.\n  const [count, setCount] = useState(0)\n\n  // 2. A click calls this event handler.\n  function increase() {\n    // 3. Ask React for the next value.\n    setCount(currentCount => currentCount + 1)\n  }\n\n  // 4. React renders this JSX with the new count.\n  return (\n    <button onClick={increase}>\n      Count: {count}\n    </button>\n  )\n}`,
    steps: [
      { lines: [5], title: 'Read state', detail: 'React gives this render the current count. On the first render it is 0.' },
      { lines: [8], title: 'Handle the click', detail: 'The browser click calls increase. Event handlers run because the user interacts.' },
      { lines: [10], title: 'Request an update', detail: 'The updater receives the latest queued value and returns the next count.' },
      { lines: [13, 14, 15], title: 'Render the new UI', detail: 'React calls the component again. The button now displays the new count.' },
    ],
  },
  {
    id: 'useEffect', label: 'useEffect', group: 'Synchronize', demo: 'timer',
    definition: 'useEffect synchronizes a component with something outside React after the screen is committed. Return a cleanup function to undo setup.',
    when: 'Use it for subscriptions, timers, browser APIs, and network synchronization. Avoid it for values that can be calculated during render.',
    analogy: 'An effect is a small start and stop process: connect when needed, disconnect before reconnecting or leaving the screen.',
    code: `import { useEffect, useState } from 'react'\n\nfunction Stopwatch() {\n  const [seconds, setSeconds] = useState(0)\n\n  useEffect(() => {\n    // Setup: start an external timer.\n    const timerId = setInterval(() => {\n      setSeconds(time => time + 1)\n    }, 1000)\n\n    // Cleanup: stop the same timer.\n    return () => clearInterval(timerId)\n  }, []) // Empty list: this timer belongs to this mount.\n\n  return <p>{seconds} seconds</p>\n}`,
    steps: [{ lines: [6], title: 'React commits the screen', detail: 'React commits the UI before running this Effect. It usually runs after paint; some interaction-related Effects may run earlier.' }, { lines: [8, 9, 10], title: 'Synchronize', detail: 'The interval updates state every second, which asks React to render again.' }, { lines: [13], title: 'Clean up', detail: 'When the component leaves, React clears the interval to prevent a leak.' }],
  },
  {
    id: 'useContext', label: 'useContext', group: 'Share data', demo: 'context',
    definition: 'useContext reads the nearest provider value above a component and subscribes it to changes in that value.',
    when: 'Use context for values needed across many levels, such as theme, locale, or the signed-in user.',
    analogy: 'A provider is a shared notice board. Any component inside its area can read the latest value without passing it through every parent.',
    code: `import { createContext, useContext } from 'react'\n\nconst ThemeContext = createContext('light')\n\nfunction Greeting() {\n  // Read the closest provider's value.\n  const theme = useContext(ThemeContext)\n  return <p className={theme}>Hello, learner!</p>\n}\n\nfunction App() {\n  return (\n    <ThemeContext.Provider value="dark">\n      <Greeting />\n    </ThemeContext.Provider>\n  )\n}`,
    steps: [{ lines: [12, 13], title: 'Provide a value', detail: 'The provider makes “dark” available to everything rendered inside it.' }, { lines: [7], title: 'Read context', detail: 'Greeting reads the closest matching provider value.' }, { lines: [8], title: 'Render from the value', detail: 'The value influences the returned UI. A changed provider value triggers a fresh render.' }],
  },
  {
    id: 'useRef', label: 'useRef', group: 'Keep a reference', demo: 'ref',
    definition: 'useRef returns the same object on every render. You can change its current property without asking React to render.',
    when: 'Use it to access a DOM node or hold mutable information that does not itself need to appear in the UI.',
    analogy: 'A ref is a persistent pocket attached to a component. React keeps the pocket, but changing what is inside does not redraw the screen.',
    code: `import { useRef } from 'react'\n\nfunction SearchBox() {\n  // React will place the input node in this ref.\n  const inputRef = useRef(null)\n\n  function focusSearch() {\n    // Use the reference to call a DOM method.\n    inputRef.current?.focus()\n  }\n\n  return (\n    <>\n      <input ref={inputRef} />\n      <button onClick={focusSearch}>Focus input</button>\n    </>\n  )\n}`,
    steps: [{ lines: [5], title: 'Create a persistent reference', detail: 'React returns the same ref object on subsequent renders.' }, { lines: [14], title: 'Connect the DOM node', detail: 'React assigns the real input element to inputRef.current.' }, { lines: [9], title: 'Use the reference', detail: 'The handler focuses the input without changing React state.' }],
  },
  {
    id: 'useReducer', label: 'useReducer', group: 'State', demo: 'reducer',
    definition: 'useReducer manages state with a reducer function. Dispatch an action, and the reducer calculates the next state.',
    when: 'Use it when several related updates or transitions are easier to explain as named actions.',
    analogy: 'Dispatch is like handing a request to a small state clerk. The reducer checks the action and returns the next state without changing the old one.',
    code: `import { useReducer } from 'react'\n\nfunction reducer(state, action) {\n  // Decide the next state from the action.\n  if (action.type === 'increment') {\n    return { count: state.count + 1 }\n  }\n  if (action.type === 'decrement') {\n    return { count: state.count - 1 }\n  }\n  return state\n}\n\nfunction Counter() {\n  const [state, dispatch] = useReducer(reducer, { count: 0 })\n  return <button onClick={() => dispatch({ type: 'increment' })}>\n    {state.count}\n  </button>\n}`,
    steps: [{ lines: [15], title: 'Dispatch an action', detail: 'A user interaction describes what happened with a named action.' }, { lines: [3, 5, 6], title: 'Calculate next state', detail: 'The reducer receives the current state and action, then returns a new state object.' }, { lines: [15, 16], title: 'Render from new state', detail: 'React stores the returned state and renders the component again.' }],
  },
  {
    id: 'useMemo', label: 'useMemo', group: 'Performance', demo: 'memo',
    definition: 'useMemo caches the result of a calculation until one of its dependencies changes.',
    when: 'Use it only when a calculation is expensive or a stable value avoids measured unnecessary work.',
    analogy: 'Keep a recipe result on the counter. If the ingredients have not changed, reuse the result instead of cooking it again.',
    code: `import { useMemo, useState } from 'react'\n\nfunction NameSearch({ names }) {\n  const [query, setQuery] = useState('')\n\n  // Recalculate when names or query changes.\n  const matches = useMemo(() => {\n    return names.filter(name =>\n      name.toLowerCase().includes(query.toLowerCase())\n    )\n  }, [names, query])\n\n  return <Results names={matches} />\n}`,
    steps: [{ lines: [7], title: 'Check dependencies', detail: 'React compares names and query with their values from the previous render.' }, { lines: [8, 9, 10], title: 'Calculate when needed', detail: 'If a dependency changed, run the filter calculation.' }, { lines: [7, 11], title: 'Reuse the cached result', detail: 'If neither changed, provide the previous result.' }],
  },
  {
    id: 'useCallback', label: 'useCallback', group: 'Performance', demo: 'callback',
    definition: 'useCallback caches a function definition until one of its dependencies changes.',
    when: 'Use it when a stable callback identity helps a memoized child avoid work. It is an optimization, not a requirement.',
    analogy: 'Keep the same instruction card until its ingredients change. This matters when another component checks whether the card itself changed.',
    code: `import { memo, useCallback, useState } from 'react'\n\nconst SearchInput = memo(function SearchInput({ onSearch }) {\n  return <button onClick={() => onSearch('React')}>Search React</button>\n})\n\nfunction SearchPage() {\n  const [query, setQuery] = useState('')\n\n  // Keep the same function while its dependencies stay the same.\n  const handleSearch = useCallback((nextQuery) => {\n    setQuery(nextQuery)\n  }, [])\n\n  return (\n    <>\n      <SearchInput onSearch={handleSearch} />\n      <Results query={query} />\n    </>\n  )\n}`,
    steps: [{ lines: [10, 11, 12], title: 'Create the callback', detail: 'The callback contains the behavior passed to the child.' }, { lines: [13], title: 'Track dependencies', detail: 'React returns the same function while its dependencies remain unchanged.' }, { lines: [17], title: 'Pass a stable prop', detail: 'Because SearchInput is memoized, it can skip rendering when this callback prop is unchanged.' }],
  },
  {
    id: 'useLayoutEffect', label: 'useLayoutEffect', group: 'Synchronize', demo: 'layout',
    definition: 'useLayoutEffect runs after React changes the DOM but before the browser paints those changes.',
    when: 'Use it for DOM measurements or visual corrections that must happen before paint. Prefer useEffect for most work.',
    analogy: 'It is a brief pause before the curtain rises: inspect the stage and make a tiny adjustment before anyone sees it.',
    code: `import { useLayoutEffect, useRef, useState } from 'react'\n\nfunction Tooltip() {\n  const tipRef = useRef(null)\n  const [height, setHeight] = useState(0)\n\n  useLayoutEffect(() => {\n    // Read layout before the browser paints.\n    const box = tipRef.current.getBoundingClientRect()\n    setHeight(box.height)\n  }, [])\n\n  return <div ref={tipRef} data-height={height}>Tip</div>\n}`,
    steps: [{ lines: [12], title: 'React commits DOM', detail: 'The new element now exists in the document.' }, { lines: [8], title: 'Measure before paint', detail: 'The effect reads the real DOM dimensions before the browser draws the frame.' }, { lines: [9], title: 'Correct layout', detail: 'React applies the measured value before the user sees a jump.' }],
  },
  {
    id: 'useId', label: 'useId', group: 'Accessibility', demo: 'id',
    definition: 'useId creates a stable unique ID for connecting related accessibility attributes.',
    when: 'Use it to connect labels, descriptions, and form fields. Do not use it as a list key or data identifier.',
    analogy: 'It prints a matching name tag for a label and its input so assistive technology knows they belong together.',
    code: `import { useId } from 'react'\n\nfunction EmailField() {\n  const emailId = useId()\n\n  return (\n    <>\n      <label htmlFor={emailId}>Email address</label>\n      <input id={emailId} type="email" />\n    </>\n  )\n}`,
    steps: [{ lines: [4], title: 'Create a stable ID', detail: 'React creates an ID that remains stable for this component.' }, { lines: [8], title: 'Label points to the ID', detail: 'htmlFor associates the visible label with the input.' }, { lines: [9], title: 'Input shares the ID', detail: 'The matching id lets browsers and assistive technology connect them.' }],
  },
  {
    id: 'useTransition', label: 'useTransition', group: 'Responsiveness', demo: 'transition',
    definition: 'useTransition marks some state updates as non-urgent so urgent interactions can stay responsive.',
    when: 'Use it for expensive screen updates, such as switching a large result list while keeping typing immediate.',
    analogy: 'Let the receptionist answer a quick question now while a large filing task continues in the background.',
    code: `import { useState, useTransition } from 'react'\n\nfunction Search({ items }) {\n  const [inputValue, setInputValue] = useState('')\n  const [query, setQuery] = useState('')\n  const [isPending, startTransition] = useTransition()\n\n  function handleChange(event) {\n    const nextQuery = event.target.value\n    setInputValue(nextQuery) // urgent: keep typing responsive\n    startTransition(() => {\n      setQuery(nextQuery) // non-urgent: update the expensive results\n    })\n  }\n\n  return (\n    <>\n      <input value={inputValue} onChange={handleChange} />\n      <Results items={items} query={query} pending={isPending} />\n    </>\n  )\n}`,
    steps: [{ lines: [11, 12], title: 'Mark lower priority work', detail: 'The result query is inside the transition, so React may pause or restart that render.' }, { lines: [6, 18], title: 'Track pending status', detail: 'React reports whether the non-urgent result update is still rendering.' }, { lines: [10, 17, 18], title: 'Keep UI responsive', detail: 'The input uses urgent state while the result list follows the transitioned query.' }],
  },
  {
    id: 'useDeferredValue', label: 'useDeferredValue', group: 'Responsiveness', demo: 'deferred',
    definition: 'useDeferredValue lets part of the UI render with a delayed version of a value while urgent updates happen first.',
    when: 'Use it when a costly view should catch up behind an immediate input or other urgent interaction.',
    analogy: 'The search box updates now; the large bookshelf index catches up a moment later when React has time.',
    code: `import { memo, useDeferredValue, useMemo, useState } from 'react'\n\nconst ResultsList = memo(function ResultsList({ items }) {\n  return <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>\n})\n\nfunction Search({ items }) {\n  const [query, setQuery] = useState('')\n  // This value can lag while React handles urgent input first.\n  const deferredQuery = useDeferredValue(query)\n  const isStale = query !== deferredQuery\n\n  // Recalculate only when the deferred query or items change.\n  const results = useMemo(() => items.filter(item =>\n    item.name.toLowerCase().includes(deferredQuery.toLowerCase())\n  ), [items, deferredQuery])\n\n  return (\n    <>\n      <input value={query} onChange={event => setQuery(event.target.value)} />\n      <div aria-busy={isStale} style={{ opacity: isStale ? 0.5 : 1 }}>\n        <ResultsList items={results} />\n      </div>\n    </>\n  )\n}`,
    steps: [{ lines: [8, 19], title: 'Update the urgent value', detail: 'The input state updates immediately and stays controlled by the latest query.' }, { lines: [10, 11], title: 'Defer the expensive view', detail: 'React can temporarily keep using the previous deferred value while urgent work takes priority.' }, { lines: [13, 14, 15, 16, 20], title: 'Catch up without repeating work', detail: 'The filtered list recalculates for the deferred query; memo lets the list skip renders while its items stay the same.' }],
  },
  {
    id: 'custom', label: 'Custom Hooks', group: 'Composition', demo: 'custom',
    definition: 'A custom Hook is a function starting with use that calls other Hooks to reuse stateful logic.',
    when: 'Use one to share behavior between components while keeping each component’s state independent.',
    analogy: 'Package a repeatable routine into a named recipe. Each component can follow it and still keep its own ingredients.',
    code: `import { useEffect, useState } from 'react'\n\nfunction useWindowWidth() {\n  const [width, setWidth] = useState(() =>\n    typeof window === 'undefined' ? 0 : window.innerWidth\n  )\n\n  useEffect(() => {\n    function updateWidth() {\n      setWidth(window.innerWidth)\n    }\n    window.addEventListener('resize', updateWidth)\n    return () => window.removeEventListener('resize', updateWidth)\n  }, [])\n\n  return width\n}`,
    steps: [{ lines: [3, 4], title: 'Define reusable behavior', detail: 'The use prefix tells React and lint tools this function follows Hook rules.' }, { lines: [9, 10, 13, 14], title: 'Compose built-in Hooks', detail: 'The custom Hook uses state and an effect to manage the browser listener.' }, { lines: [17], title: 'Return useful data', detail: 'Components receive the width while owning their separate Hook state.' }],
  },
  {
    id: 'useOptimistic', label: 'useOptimistic', group: 'Actions', demo: 'optimistic',
    definition: 'useOptimistic shows a temporary state while an Action is in progress, then settles on the confirmed state.',
    when: 'Use it when an interaction should feel immediate while a server request is still confirming the change.',
    analogy: 'Show the parcel as added to the cart right away. If the server accepts it, that becomes the real result; if not, React returns to confirmed state.',
    code: `import { startTransition, useOptimistic } from 'react'\n\nfunction Cart({ savedCount, saveCount }) {\n  const [shownCount, setShownCount] = useOptimistic(savedCount)\n\n  function addItem() {\n    startTransition(async () => {\n      // Show a temporary, immediate count.\n      setShownCount(count => count + 1)\n      // The server confirms the durable value.\n      await saveCount(savedCount + 1)\n    })\n  }\n\n  return <button onClick={addItem}>Cart: {shownCount}</button>\n}`,
    steps: [{ lines: [4], title: 'Read confirmed state', detail: 'The parent provides the last server-confirmed count.' }, { lines: [9], title: 'Show optimistic feedback', detail: 'The displayed count updates immediately inside the Action.' }, { lines: [11], title: 'Accept or roll back', detail: 'When the Action finishes, the display settles on the confirmed value.' }],
  },
  {
    id: 'useActionState', label: 'useActionState', group: 'Actions', demo: 'actionState',
    definition: 'useActionState stores the result of an Action, exposes a dispatch function, and reports whether it is pending.',
    when: 'Use it for form submissions and other Actions that produce a result and need pending state.',
    analogy: 'A submission desk remembers the last response, gives you a way to submit again, and shows when a request is underway.',
    code: `import { useActionState } from 'react'\n\nasync function joinClass(previousMessage, formData) {\n  const name = formData.get('name')\n  await saveMember(name)\n  return \`Welcome, \${name}!\`\n}\n\nfunction JoinForm() {\n  const [message, formAction, isPending] =\n    useActionState(joinClass, '')\n\n  return <form action={formAction}>\n    <input name="name" required />\n    <button disabled={isPending}>Join</button>\n    <p>{message}</p>\n  </form>\n}`,
    steps: [{ lines: [10], title: 'Read Action state', detail: 'React provides the latest returned message, a dispatcher, and pending status.' }, { lines: [12], title: 'Submit the Action', detail: 'The form calls formAction with its FormData.' }, { lines: [5, 6], title: 'Store the result', detail: 'When the async Action completes, its return value becomes the next state.' }],
  },
  {
    id: 'useFormStatus', label: 'useFormStatus', group: 'Actions', demo: 'formStatus',
    definition: 'useFormStatus reads the pending status and submitted data from the nearest parent form Action.',
    when: 'Use it in a child component inside a form when the submit button or nearby UI needs to respond to that form’s submission.',
    analogy: 'A submit button asks the form around it whether the request is still being handled, without receiving a pending prop from the parent.',
    code: `import { useFormStatus } from 'react-dom'

function SubmitButton() {
  // This component must be rendered inside the parent form.
  const { pending, data } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? \`Saving \${data?.get('name')}…\` : 'Save'}
    </button>
  )
}

function ProfileForm({ action }) {
  return (
    <form action={action}>
      <input name="name" required />
      <SubmitButton />
    </form>
  )
}`,
    steps: [{ lines: [1, 4], title: 'Read parent form status', detail: 'The Hook reads the nearest form submission. Calling it in the component that renders the form would not work.' }, { lines: [6, 7, 8], title: 'Show pending feedback', detail: 'Disable the submit button while the form Action is running, and show the submitted name.' }, { lines: [13, 15, 16], title: 'Render inside the form', detail: 'SubmitButton is a child of the form, so it can read that parent form’s status.' }],
  },
  {
    id: 'useImperativeHandle', label: 'useImperativeHandle', group: 'Refs', demo: 'imperative',
    definition: 'useImperativeHandle customizes the methods exposed through a component ref.',
    when: 'Use sparingly when a parent truly needs a small imperative action such as focus or scroll.',
    analogy: 'A component lends its parent a small remote control with only the buttons it wants to expose.',
    code: `import { useImperativeHandle, useRef } from 'react'\n\nfunction SearchInput({ ref }) {\n  const inputRef = useRef(null)\n\n  // Expose a focused, intentional API to the parent.\n  useImperativeHandle(ref, () => ({\n    focus() { inputRef.current?.focus() },\n  }), [])\n\n  return <input ref={inputRef} />\n}\n\nfunction Page() {\n  const searchRef = useRef(null)\n\n  return (\n    <>\n      <SearchInput ref={searchRef} />\n      <button onClick={() => searchRef.current?.focus()}>\n        Focus search\n      </button>\n    </>\n  )\n}`,
    steps: [{ lines: [4], title: 'Keep an internal ref', detail: 'The child privately holds the actual input element.' }, { lines: [7, 8], title: 'Choose what to expose', detail: 'The parent receives a focus method, not unrestricted access to the child DOM.' }, { lines: [17, 18], title: 'Call the exposed method', detail: 'The parent attaches the ref and calls the narrow focus API.' }],
  },
  {
    id: 'useEffectEvent', label: 'useEffectEvent', group: 'Effects', demo: 'effectEvent',
    definition: 'useEffectEvent separates non-reactive event logic from an Effect while letting that logic read the latest committed values.',
    when: 'Use it for a callback triggered by an Effect that needs current values but should not re-synchronize the Effect.',
    analogy: 'Keep one doorbell subscription, while its handler can still read today’s settings when the bell rings.',
    code: `import { useEffect, useEffectEvent } from 'react'\n\nfunction ChatRoom({ roomId, theme }) {\n  const onConnected = useEffectEvent(() => {\n    showNotice('Connected!', theme)\n  })\n\n  useEffect(() => {\n    const connection = connect(roomId)\n    connection.on('connected', () => onConnected())\n    connection.start()\n    return () => connection.disconnect()\n  }, [roomId]) // Theme does not reconnect the room.\n}`,
    steps: [{ lines: [4, 5], title: 'Read the latest value', detail: 'The Effect Event sees the latest committed theme when it is called.' }, { lines: [8, 9], title: 'Synchronize by room', detail: 'The connection setup reacts to roomId, the value that defines the connection.' }, { lines: [12], title: 'Clean up connection', detail: 'Changing roomId or leaving disconnects the old room.' }],
  },
  {
    id: 'useInsertionEffect', label: 'useInsertionEffect', group: 'Effects', demo: 'insertionEffect',
    definition: 'useInsertionEffect lets CSS-in-JS libraries insert styles before layout Effects need to measure the page.',
    when: 'This is intended for library authors that inject dynamic styles. Application code should usually use useEffect or useLayoutEffect.',
    analogy: 'A stage crew places the lighting rig before the measuring crew checks the set. This is a specialized backstage hook.',
    code: `import { useInsertionEffect } from 'react'\n\nfunction useInjectedRule(rule) {\n  useInsertionEffect(() => {\n    // Library code inserts a style before layout effects.\n    const style = document.createElement('style')\n    style.textContent = rule\n    document.head.appendChild(style)\n\n    return () => style.remove()\n  }, [rule])\n}`,
    steps: [{ lines: [4], title: 'Run at a specialized timing', detail: 'This runs before layout Effects, as styles are being inserted.' }, { lines: [6, 7, 8], title: 'Insert dynamic CSS', detail: 'A styling library makes its rule available before layout measurement.' }, { lines: [10], title: 'Remove old rule', detail: 'Cleanup removes the style when the rule changes or component leaves.' }],
  },
  {
    id: 'useSyncExternalStore', label: 'useSyncExternalStore', group: 'External stores', demo: 'externalStore',
    definition: 'useSyncExternalStore subscribes a component to a store that lives outside React.',
    when: 'Use it when integrating with an external mutable store or library. Prefer useState or useReducer for app state you own.',
    analogy: 'React subscribes to a notice board, reads its current snapshot, then refreshes the screen when the board changes.',
    code: `import { useSyncExternalStore } from 'react'\n\nfunction subscribe(callback) {\n  window.addEventListener('online', callback)\n  window.addEventListener('offline', callback)\n  return () => {\n    window.removeEventListener('online', callback)\n    window.removeEventListener('offline', callback)\n  }\n}\n\nfunction getSnapshot() {\n  return navigator.onLine\n}\n\nfunction NetworkStatus() {\n  const isOnline = useSyncExternalStore(subscribe, getSnapshot)\n  return <p>{isOnline ? 'Online' : 'Offline'}</p>\n}`,
    steps: [{ lines: [17], title: 'Read the snapshot', detail: 'React asks the store for the current browser online status.' }, { lines: [3, 4, 5], title: 'Subscribe to changes', detail: 'The browser calls the subscriber when connectivity changes.' }, { lines: [6, 7, 8], title: 'Unsubscribe on cleanup', detail: 'React removes both listeners when the component no longer subscribes.' }],
  },
  {
    id: 'useDebugValue', label: 'useDebugValue', group: 'Developer tools', demo: 'debugValue',
    definition: 'useDebugValue adds a readable label for a custom Hook in React Developer Tools.',
    when: 'Use it when authoring a reusable custom Hook that needs a helpful DevTools label. Most application components do not need it.',
    analogy: 'Put a clear name tag on a reusable mechanism so the maintainer can identify its current status in the inspection panel.',
    code: `import { useDebugValue, useSyncExternalStore } from 'react'\n\nfunction subscribeToNetwork(callback) {\n  window.addEventListener('online', callback)\n  window.addEventListener('offline', callback)\n  return () => {\n    window.removeEventListener('online', callback)\n    window.removeEventListener('offline', callback)\n  }\n}\n\nfunction useOnlineStatus() {\n  const isOnline = useSyncExternalStore(\n    subscribeToNetwork,\n    () => navigator.onLine,\n    () => true, // server snapshot\n  )\n\n  // Add a readable label for this custom Hook in React DevTools.\n  useDebugValue(isOnline, value => value ? 'Online' : 'Offline')\n  return isOnline\n}`,
    steps: [{ lines: [13, 14, 15, 16, 17], title: 'Read current status', detail: 'The custom Hook subscribes to a browser-owned value and reads its snapshot.' }, { lines: [20], title: 'Label in DevTools', detail: 'React DevTools displays a helpful formatted value for this custom Hook.' }, { lines: [21], title: 'Return behavior', detail: 'The component receives the boolean it needs to render.' }],
  },
  {
    id: 'use', label: 'use (Promise / Context)', group: 'React API', demo: 'useApi',
    definition: 'The React use API reads a cached Promise or context value during render. Unlike Hooks, it may be called conditionally or in loops.',
    when: 'Use it with Suspense for Promise-based data or to read context. For many data-fetching apps, prefer the framework’s data APIs.',
    analogy: 'Read the value from a package that may still be arriving. Suspense shows the loading state until it is ready.',
    code: `import { Suspense, use } from 'react'\n\nfunction Profile({ profilePromise }) {\n  // Suspends this render until the Promise resolves.\n  const profile = use(profilePromise)\n  return <h2>{profile.name}</h2>\n}\n\nfunction Page({ profilePromise }) {\n  return (\n    <Suspense fallback={<p>Loading profile…</p>}>\n      <Profile profilePromise={profilePromise} />\n    </Suspense>\n  )\n}`,
    steps: [{ lines: [12], title: 'Show the fallback', detail: 'Suspense displays its fallback while the Promise is pending.' }, { lines: [5], title: 'Read the Promise', detail: 'React suspends this render until the Promise settles.' }, { lines: [6], title: 'Render resolved data', detail: 'When ready, the component renders using the profile value.' }],
  },
]

export const hookGroups = [...new Set(hooks.map((hook) => hook.group))]
