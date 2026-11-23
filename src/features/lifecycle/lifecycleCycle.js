export const effectCycleCode = `import { useEffect, useState } from 'react'

function ProfilePanel({ userId }) {
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false
    setStatus('loading')

    fetch(\`/__explorer/api/demo/profile?userId=\${userId}\`, {
      signal: controller.signal,
    })
      .then(response => {
        if (!response.ok) throw new Error('Request failed')
        return response.json()
      })
      .then(data => {
        if (!ignore) {
          setProfile(data)
          setStatus('success')
        }
      })
      .catch(error => {
        if (!ignore && error.name !== 'AbortError') setStatus('error')
      })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [userId])

  if (status === 'loading') return <LoadingCard />
  if (status === 'error') return <ErrorCard />
  return <ProfileCard profile={profile} />
}`

export const classCycleCode = `class ProfilePanel extends Component {
  state = { profile: null, status: 'loading' }
  controller = null

  componentDidMount() {
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
  }

  async loadProfile(userId) {
    this.controller = new AbortController()
    this.setState({ status: 'loading' })
    try {
      const response = await fetch(
        \`/__explorer/api/demo/profile?userId=\${userId}\`,
        { signal: this.controller.signal },
      )
      const profile = await response.json()
      this.setState({ profile, status: 'success' })
    } catch (error) {
      if (error.name !== 'AbortError') this.setState({ status: 'error' })
    }
  }

  cancelRequest() {
    this.controller?.abort()
  }

  render() {
    return <ProfileView {...this.state} />
  }
}`

export const effectStages = [
  { id: 'mount', label: 'Mount', description: 'React calls the component and places its initial loading UI on the page.', lines: [3, 4, 5, 35, 36] },
  { id: 'commit', label: 'Commit', description: 'React commits the rendered DOM. The user can see the loading card.', lines: [35, 36] },
  { id: 'setup', label: 'Effect setup', description: 'After commit, the Effect creates an AbortController and starts the request.', lines: [7, 8, 9, 10, 12, 13] },
  { id: 'response', label: 'API response', description: 'The local API responds. The Effect parses JSON and saves the profile in state.', lines: [15, 16, 17, 19, 20, 21, 22] },
  { id: 'update', label: 'Re-render', description: 'State changes from loading to success. React renders and commits the profile card.', lines: [19, 20, 21, 22, 35, 37] },
  { id: 'cleanup', label: 'Cleanup', description: 'Changing userId or unmounting runs cleanup. It marks this request stale and aborts it.', lines: [29, 30, 31, 32] },
]

export const classStages = [
  { id: 'mount', label: 'Mount', description: 'React creates the class instance, renders its initial loading state, and commits its DOM.', lines: [1, 2, 3, 39, 40, 41] },
  { id: 'commit', label: 'Commit', description: 'After the loading UI is committed, componentDidMount starts the profile request.', lines: [5, 6] },
  { id: 'setup', label: 'API setup', description: 'loadProfile creates an AbortController, marks the panel as loading, and sends the request.', lines: [20, 21, 22, 23, 24, 25, 26, 27] },
  { id: 'response', label: 'API response', description: 'The awaited response is parsed and saved. setState asks React to render again.', lines: [24, 25, 26, 27, 28, 29] },
  { id: 'update', label: 'Update', description: 'React renders the new state. If the userId prop changed, componentDidUpdate cancels the old request and starts the new one.', lines: [9, 10, 11, 12, 13, 14, 39, 40, 41] },
  { id: 'cleanup', label: 'Unmount cleanup', description: 'componentWillUnmount cancels in-flight work before the component leaves the page.', lines: [16, 17, 18, 35, 36, 37] },
]
