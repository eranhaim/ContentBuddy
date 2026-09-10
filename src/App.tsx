import { useEffect, useMemo, useState, type ReactNode } from 'react'
import './App.css'

type ViewId = 'dashboard' | 'creators' | 'shoots' | 'library' | 'review' | 'schedule' | 'posting'
type AssetType = 'raw' | 'full' | 'clean' | 'variant'
type AssetStatus = 'uploaded' | 'in_review' | 'approved' | 'rejected' | 'posted'
type SlotStatus = 'draft' | 'ready' | 'posted' | 'failed' | 'skipped'

type Account = {
  id: string
  creatorId: string
  handle: string
  variant: number
  device: string
  niche: string
  operator: string
  cadence: number
}

type Creator = {
  id: string
  name: string
  handle: string
  initials: string
  color: string
}

type Shoot = {
  id: string
  creatorId: string
  date: string
  title: string
  conceptCount: number
  filmedCount: number
  status: 'in_progress' | 'ready' | 'draft'
}

type Concept = {
  id: string
  creatorId: string
  shootId: string
  title: string
  location: string
  outfit: string
  overlay: string
  caption: string
  filmed: boolean
  category: string
}

type Asset = {
  id: string
  conceptId: string
  creatorId: string
  name: string
  type: AssetType
  version?: number
  status: AssetStatus
  size: string
  createdAt: string
  parentId?: string
}

type ScheduleSlot = {
  id: string
  creatorId: string
  accountId: string
  assetId: string
  date: string
  status: SlotStatus
  pinned: boolean
  caption: string
}

type AppState = {
  creators: Creator[]
  accounts: Account[]
  shoots: Shoot[]
  concepts: Concept[]
  assets: Asset[]
  slots: ScheduleSlot[]
}

const today = '2026-09-11'
const storageKey = 'contentbuddy-demo-state-v2'

const initialState: AppState = {
  creators: [
    { id: 'zaya', name: 'Zaya Asfoor', handle: '@zayaasfoor', initials: 'ZA', color: '#e4a38b' },
    { id: 'mariel', name: 'Mariel Cohen', handle: '@marielcohen', initials: 'MC', color: '#aabddd' },
    { id: 'adel', name: 'Adel Levi', handle: '@adellevi', initials: 'AL', color: '#b7d5c6' },
  ],
  accounts: [
    { id: 'zaya-v1', creatorId: 'zaya', handle: 'Zaya.asfoor · V1', variant: 1, device: 'Device 09', niche: 'Main', operator: 'Lovely', cadence: 1 },
    { id: 'zaya-v2', creatorId: 'zaya', handle: 'Zayaasfoor54 · V2', variant: 2, device: 'Device 09', niche: 'Gym girl', operator: 'Darlene', cadence: 1 },
    { id: 'zaya-v3', creatorId: 'zaya', handle: 'ItsZayaasfoor_ · V3', variant: 3, device: 'Device 03', niche: 'Lifestyle', operator: 'Lovely', cadence: 1 },
    { id: 'mariel-v1', creatorId: 'mariel', handle: 'Mariel.official · V1', variant: 1, device: 'Device 11', niche: 'Main', operator: 'Darlene', cadence: 1 },
    { id: 'mariel-v2', creatorId: 'mariel', handle: 'Mariel.daily · V2', variant: 2, device: 'Device 11', niche: 'Lifestyle', operator: 'Lovely', cadence: 1 },
  ],
  shoots: [
    { id: 'shoot-zaya-0826', creatorId: 'zaya', date: '2026-08-26', title: 'Zaya · August concepts', conceptCount: 12, filmedCount: 10, status: 'ready' },
    { id: 'shoot-mariel-0902', creatorId: 'mariel', date: '2026-09-02', title: 'Mariel · September opening', conceptCount: 8, filmedCount: 6, status: 'in_progress' },
  ],
  concepts: [
    { id: 'concept-estrogen', creatorId: 'zaya', shootId: 'shoot-zaya-0826', title: 'Estrogen', location: 'Carmel Market', outfit: 'Tight black dress', overlay: 'What three months on estrogen can do', caption: 'Would you have guessed?', filmed: true, category: 'Lifestyle' },
    { id: 'concept-dateme', creatorId: 'zaya', shootId: 'shoot-zaya-0826', title: 'DateMe', location: 'Neutral background', outfit: 'White top', overlay: 'Hot · funny · slim', caption: 'Date me if you can keep up.', filmed: true, category: 'Lifestyle' },
    { id: 'concept-paybills', creatorId: 'zaya', shootId: 'shoot-zaya-0826', title: 'PayBills', location: 'Neutral background', outfit: 'Microphone', overlay: 'Groupies in the IDF?', caption: 'Let’s talk about it.', filmed: true, category: 'Talking' },
    { id: 'concept-global', creatorId: 'zaya', shootId: 'shoot-zaya-0826', title: 'GlobalWarming', location: 'Street', outfit: 'Casual', overlay: 'Who would you vote for?', caption: 'Ask the people around you.', filmed: true, category: 'Street' },
    { id: 'concept-pool', creatorId: 'zaya', shootId: 'shoot-zaya-0826', title: 'Pool day', location: 'Pool', outfit: 'Blue swimsuit', overlay: 'POV: summer is not over', caption: 'One more swim?', filmed: true, category: 'Lifestyle' },
    { id: 'concept-mirror', creatorId: 'mariel', shootId: 'shoot-mariel-0902', title: 'Mirror check', location: 'Bedroom', outfit: 'Red dress', overlay: 'Ready in five minutes', caption: 'Which look wins?', filmed: true, category: 'Fashion' },
  ],
  assets: [
    { id: 'asset-estrogen-raw', conceptId: 'concept-estrogen', creatorId: 'zaya', name: 'Zaya_2608_S01_RAW', type: 'raw', status: 'uploaded', size: '1.2 GB', createdAt: '2026-08-26' },
    { id: 'asset-estrogen-full', conceptId: 'concept-estrogen', creatorId: 'zaya', name: 'Zaya_2608_S01_FULL', type: 'full', status: 'approved', size: '38 MB', createdAt: '2026-08-28', parentId: 'asset-estrogen-raw' },
    { id: 'asset-estrogen-clean', conceptId: 'concept-estrogen', creatorId: 'zaya', name: 'Zaya_2608_S01_CLEAN', type: 'clean', status: 'approved', size: '35 MB', createdAt: '2026-08-28', parentId: 'asset-estrogen-raw' },
    { id: 'asset-estrogen-v1', conceptId: 'concept-estrogen', creatorId: 'zaya', name: 'Zaya_2608_S01_V1', type: 'variant', version: 1, status: 'approved', size: '39 MB', createdAt: '2026-08-29', parentId: 'asset-estrogen-full' },
    { id: 'asset-dateme-raw', conceptId: 'concept-dateme', creatorId: 'zaya', name: 'Zaya_2608_S02_RAW', type: 'raw', status: 'uploaded', size: '920 MB', createdAt: '2026-08-26' },
    { id: 'asset-dateme-full', conceptId: 'concept-dateme', creatorId: 'zaya', name: 'Zaya_2608_S02_FULL', type: 'full', status: 'in_review', size: '42 MB', createdAt: '2026-09-09', parentId: 'asset-dateme-raw' },
    { id: 'asset-dateme-clean', conceptId: 'concept-dateme', creatorId: 'zaya', name: 'Zaya_2608_S02_CLEAN', type: 'clean', status: 'in_review', size: '40 MB', createdAt: '2026-09-09', parentId: 'asset-dateme-raw' },
    { id: 'asset-paybills-v1', conceptId: 'concept-paybills', creatorId: 'zaya', name: 'Zaya_2608_S03_V1', type: 'variant', version: 1, status: 'approved', size: '41 MB', createdAt: '2026-09-04', parentId: 'asset-estrogen-full' },
    { id: 'asset-paybills-v2', conceptId: 'concept-paybills', creatorId: 'zaya', name: 'Zaya_2608_S03_V2', type: 'variant', version: 2, status: 'in_review', size: '42 MB', createdAt: '2026-09-10', parentId: 'asset-estrogen-full' },
    { id: 'asset-global-v1', conceptId: 'concept-global', creatorId: 'zaya', name: 'Zaya_2608_S04_V1', type: 'variant', version: 1, status: 'approved', size: '36 MB', createdAt: '2026-09-05', parentId: 'asset-estrogen-full' },
    { id: 'asset-pool-v1', conceptId: 'concept-pool', creatorId: 'zaya', name: 'Zaya_2608_S05_V1', type: 'variant', version: 1, status: 'approved', size: '44 MB', createdAt: '2026-09-06', parentId: 'asset-estrogen-full' },
    { id: 'asset-mirror-full', conceptId: 'concept-mirror', creatorId: 'mariel', name: 'Mariel_0209_S01_FULL', type: 'full', status: 'in_review', size: '52 MB', createdAt: '2026-09-10', parentId: 'asset-estrogen-raw' },
    { id: 'asset-mirror-v1', conceptId: 'concept-mirror', creatorId: 'mariel', name: 'Mariel_0209_S01_V1', type: 'variant', version: 1, status: 'approved', size: '48 MB', createdAt: '2026-09-08', parentId: 'asset-mirror-full' },
    { id: 'asset-mirror-v2', conceptId: 'concept-mirror', creatorId: 'mariel', name: 'Mariel_0209_S01_V2', type: 'variant', version: 2, status: 'approved', size: '49 MB', createdAt: '2026-09-09', parentId: 'asset-mirror-full' },
  ],
  slots: [
    { id: 'slot-1', creatorId: 'zaya', accountId: 'zaya-v1', assetId: 'asset-paybills-v1', date: '2026-09-11', status: 'ready', pinned: false, caption: 'Let’s talk about it.' },
    { id: 'slot-2', creatorId: 'zaya', accountId: 'zaya-v2', assetId: 'asset-global-v1', date: '2026-09-11', status: 'ready', pinned: false, caption: 'Ask the people around you.' },
    { id: 'slot-3', creatorId: 'zaya', accountId: 'zaya-v3', assetId: 'asset-pool-v1', date: '2026-09-11', status: 'ready', pinned: false, caption: 'One more swim?' },
    { id: 'slot-4', creatorId: 'mariel', accountId: 'mariel-v1', assetId: 'asset-mirror-v1', date: '2026-09-11', status: 'draft', pinned: false, caption: 'Which look wins?' },
    { id: 'slot-5', creatorId: 'mariel', accountId: 'mariel-v2', assetId: 'asset-mirror-v2', date: '2026-09-12', status: 'draft', pinned: false, caption: 'Which look wins?' },
  ],
}

const navItems: Array<{ id: ViewId; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Overview', icon: '⌂' },
  { id: 'creators', label: 'Creators', icon: '○' },
  { id: 'shoots', label: 'Shoot plans', icon: '▦' },
  { id: 'library', label: 'Content library', icon: '▤' },
  { id: 'review', label: 'Review queue', icon: '◒' },
  { id: 'schedule', label: 'Schedule', icon: '□' },
  { id: 'posting', label: 'Posting queue', icon: '→' },
]

const viewTitles: Record<ViewId, { eyebrow: string; title: string; description: string }> = {
  dashboard: { eyebrow: 'Operations center', title: 'Good morning, Eran', description: 'Here is what needs attention across the content workflow.' },
  creators: { eyebrow: 'People and channels', title: 'Creators', description: 'Manage each creator’s content, accounts, devices, and ownership.' },
  shoots: { eyebrow: 'Production planning', title: 'Shoot plans', description: 'Turn a creative brief into traceable concepts and raw uploads.' },
  library: { eyebrow: 'Asset intelligence', title: 'Content library', description: 'Every asset, derivative, and usage event in one searchable place.' },
  review: { eyebrow: 'Work in progress', title: 'Review queue', description: 'Approve or return edits before they enter the scheduling pool.' },
  schedule: { eyebrow: 'Distribution planning', title: 'Schedule', description: 'Generate a draft calendar, pin exceptions, and publish the operator queue.' },
  posting: { eyebrow: 'Today’s operations', title: 'Posting queue', description: 'Give every operator the exact account, device, file, caption, and outcome.' },
}

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) as AppState : initialState
  } catch {
    return initialState
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(new Date(`${value}T12:00:00`))
}

function formatLongDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${value}T12:00:00`))
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    search: 'M11 3a8 8 0 1 0 5.2 14.1L21 21',
    plus: 'M12 5v14M5 12h14',
    arrow: 'M5 12h13m-5-5 5 5-5 5',
    check: 'm5 12 4 4L19 6',
    play: 'm8 5 10 7-10 7z',
    upload: 'M12 16V4m0 0L7 9m5-5 5 5M5 20h14',
    filter: 'M4 6h16M7 12h10m-7 6h4',
    more: 'M5 12h.01M12 12h.01M19 12h.01',
    calendar: 'M6 3v3m12-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13H4V6a1 1 0 0 1 1-1Z',
  }
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name] ?? paths.more} />
    </svg>
  )
}

function StatusPill({ status }: { status: AssetStatus | SlotStatus }) {
  const labels: Record<string, string> = {
    uploaded: 'Uploaded',
    in_review: 'In review',
    approved: 'Approved',
    rejected: 'Changes requested',
    posted: 'Posted',
    draft: 'Draft',
    ready: 'Ready',
    failed: 'Failed',
    skipped: 'Skipped',
  }
  return <span className={`status status-${status}`}>{labels[status]}</span>
}

function App() {
  const [state, setState] = useState<AppState>(loadState)
  const [activeView, setActiveView] = useState<ViewId>('dashboard')
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [libraryFilter, setLibraryFilter] = useState<'all' | AssetType>('all')
  const [showConceptModal, setShowConceptModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const reviewAssets = state.assets.filter((asset) => asset.status === 'in_review')
  const reservedAssetIds = new Set(state.slots
    .filter((slot) => slot.status !== 'skipped' && slot.status !== 'failed')
    .map((slot) => slot.assetId))
  const readyAssets = state.assets.filter((asset) => asset.type === 'variant' && asset.status === 'approved' && !reservedAssetIds.has(asset.id))
  const todaySlots = state.slots.filter((slot) => slot.date === today)
  const pendingPosts = todaySlots.filter((slot) => slot.status === 'ready')
  const creatorCounts = useMemo(() => state.creators.map((creator) => ({
    creator,
    concepts: state.concepts.filter((concept) => concept.creatorId === creator.id).length,
    assets: state.assets.filter((asset) => asset.creatorId === creator.id).length,
    accounts: state.accounts.filter((account) => account.creatorId === creator.id).length,
  })), [state])

  const notify = (message: string) => setToast(message)

  const navigate = (view: ViewId) => {
    setActiveView(view)
    setSelectedCreatorId(null)
    setQuery('')
  }

  const approveAsset = (assetId: string) => {
    setState((current) => ({
      ...current,
      assets: current.assets.map((asset) => asset.id === assetId ? { ...asset, status: 'approved' } : asset),
    }))
    notify('Asset approved and added to the scheduling pool.')
  }

  const rejectAsset = (assetId: string) => {
    setState((current) => ({
      ...current,
      assets: current.assets.map((asset) => asset.id === assetId ? { ...asset, status: 'rejected' } : asset),
    }))
    notify('Changes requested. The editor will see this in their queue.')
  }

  const markSlot = (slotId: string, status: SlotStatus) => {
    setState((current) => ({
      ...current,
      slots: current.slots.map((slot) => slot.id === slotId ? { ...slot, status } : slot),
      assets: status === 'posted'
        ? current.assets.map((asset) => {
          const slot = current.slots.find((item) => item.id === slotId)
          return slot && asset.id === slot.assetId ? { ...asset, status: 'posted' } : asset
        })
        : current.assets,
    }))
    notify(status === 'posted' ? 'Posted recorded. This file is now consumed globally.' : `Post marked ${status}.`)
  }

  const generateSchedule = () => {
    setState((current) => {
      const approvedVariants = current.assets.filter((asset) => asset.type === 'variant' && asset.status === 'approved')
      const reservedAssetIds = new Set(current.slots.filter((slot) => slot.status !== 'skipped' && slot.status !== 'failed').map((slot) => slot.assetId))
      const existingKeys = new Set(current.slots.map((slot) => `${slot.accountId}:${slot.date}`))
      const occupiedConceptDates = new Set(current.slots
        .filter((slot) => slot.status !== 'skipped' && slot.status !== 'failed')
        .map((slot) => {
          const asset = current.assets.find((item) => item.id === slot.assetId)
          return asset ? `${slot.creatorId}:${asset.conceptId}:${slot.date}` : ''
        }))
      const additions: ScheduleSlot[] = []
      let assetIndex = 0
      current.accounts.forEach((account) => {
        const dayOffset = Math.floor(assetIndex / Math.max(1, current.accounts.length))
        const date = new Date(`${today}T12:00:00`)
        date.setDate(date.getDate() + dayOffset + 1)
        const dateValue = date.toISOString().slice(0, 10)
        const key = `${account.id}:${dateValue}`
        const available = approvedVariants.find((asset) => {
          const conceptDateKey = `${account.creatorId}:${asset.conceptId}:${dateValue}`
          return asset.creatorId === account.creatorId
            && !reservedAssetIds.has(asset.id)
            && !additions.some((slot) => slot.assetId === asset.id)
            && !occupiedConceptDates.has(conceptDateKey)
            && !additions.some((slot) => {
              const additionAsset = current.assets.find((item) => item.id === slot.assetId)
              return additionAsset?.conceptId === asset.conceptId && slot.creatorId === account.creatorId && slot.date === dateValue
            })
        })
        if (!available) return
        if (!existingKeys.has(key)) {
          const concept = current.concepts.find((item) => item.id === available.conceptId)
          additions.push({
            id: `slot-generated-${Date.now()}-${assetIndex}`,
            creatorId: account.creatorId,
            accountId: account.id,
            assetId: available.id,
            date: dateValue,
            status: 'draft',
            pinned: false,
            caption: concept?.caption ?? '',
          })
          assetIndex += 1
        }
      })
      return { ...current, slots: [...current.slots, ...additions] }
    })
    setActiveView('schedule')
    notify('Draft schedule generated from approved, unused variants.')
  }

  const openCreator = (creatorId: string) => {
    setSelectedCreatorId(creatorId)
    setActiveView('creators')
  }

  const filteredAssets = state.assets.filter((asset) => {
    const concept = state.concepts.find((item) => item.id === asset.conceptId)
    const creator = state.creators.find((item) => item.id === asset.creatorId)
    const matchesQuery = !query || [asset.name, concept?.title, creator?.name].some((value) => value?.toLowerCase().includes(query.toLowerCase()))
    const matchesFilter = libraryFilter === 'all' || asset.type === libraryFilter
    return matchesQuery && matchesFilter
  })

  const renderView = () => {
    if (activeView === 'dashboard') {
      return <Dashboard state={state} reviewCount={reviewAssets.length} readyCount={readyAssets.length} postCount={pendingPosts.length} onNavigate={navigate} onGenerate={generateSchedule} />
    }
    if (activeView === 'creators') {
      return <Creators state={state} counts={creatorCounts} selectedCreatorId={selectedCreatorId} onOpen={openCreator} onAddConcept={() => setShowConceptModal(true)} />
    }
    if (activeView === 'shoots') {
      return <ShootPlans state={state} onAddConcept={() => setShowConceptModal(true)} />
    }
    if (activeView === 'library') {
      return <Library state={state} assets={filteredAssets} filter={libraryFilter} setFilter={setLibraryFilter} onNavigate={navigate} />
    }
    if (activeView === 'review') {
      return <ReviewQueue state={state} assets={reviewAssets} onApprove={approveAsset} onReject={rejectAsset} />
    }
    if (activeView === 'schedule') {
      return <Schedule state={state} onGenerate={generateSchedule} />
    }
    return <PostingQueue state={state} slots={todaySlots} onMark={markSlot} />
  }

  const title = viewTitles[activeView]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate('dashboard')}>
          <span className="brand-mark">C</span>
          <span><strong>ContentBuddy</strong><small>Content operations</small></span>
        </button>
        <div className="workspace-switcher">
          <span className="workspace-avatar">CB</span>
          <span><strong>ContentBuddy Agency</strong><small>Workspace</small></span>
          <span className="chevron">⌄</span>
        </div>
        <nav className="side-nav" aria-label="Main navigation">
          <div className="nav-label">Workspace</div>
          {navItems.map((item) => (
            <button key={item.id} className={activeView === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>
              <span className="nav-icon">{item.icon}</span><span>{item.label}</span>
              {item.id === 'review' && reviewAssets.length > 0 && <b>{reviewAssets.length}</b>}
              {item.id === 'posting' && pendingPosts.length > 0 && <b>{pendingPosts.length}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="nav-label">Workspace</div>
          <button><span className="nav-icon">⚙</span><span>Settings</span></button>
          <div className="user-card"><span className="user-avatar">EH</span><span><strong>Eran Haim</strong><small>Owner</small></span><span className="more">···</span></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div><span className="breadcrumb">ContentBuddy <span>/</span> {title.eyebrow}</span><h1>{title.title}</h1></div>
          <div className="topbar-actions">
            <label className="global-search"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search content, creators..." /></label>
            <button className="icon-button" aria-label="Notifications">♢<i /></button>
            <button className="user-avatar top-avatar">EH</button>
          </div>
        </header>
        <div className="page-content">
          <div className="page-intro"><p>{title.description}</p>{activeView === 'dashboard' && <button className="primary-button" onClick={() => setShowConceptModal(true)}><Icon name="plus" /> New concept</button>}</div>
          {renderView()}
        </div>
      </main>
      {showConceptModal && <ConceptModal state={state} onClose={() => setShowConceptModal(false)} onSave={(concept) => {
        setState((current) => ({ ...current, concepts: [...current.concepts, concept], shoots: current.shoots.map((shoot) => shoot.id === concept.shootId ? { ...shoot, conceptCount: shoot.conceptCount + 1 } : shoot) }))
        setShowConceptModal(false)
        notify('Concept added to the shoot plan.')
      }} />}
      {toast && <div className="toast"><span className="toast-check">✓</span>{toast}</div>}
    </div>
  )
}

function Dashboard({ state, reviewCount, readyCount, postCount, onNavigate, onGenerate }: { state: AppState; reviewCount: number; readyCount: number; postCount: number; onNavigate: (view: ViewId) => void; onGenerate: () => void }) {
  const recentAssets = state.assets.slice(-5).reverse()
  return (
    <div className="view-stack">
      <section className="stat-grid">
        <StatCard label="In review" value={reviewCount} delta="Needs attention" tone="coral" onClick={() => onNavigate('review')} />
        <StatCard label="Ready to schedule" value={readyCount} delta="Approved variants" tone="mint" onClick={() => onNavigate('schedule')} />
        <StatCard label="Posts today" value={postCount} delta={`${state.slots.filter((slot) => slot.date === today && slot.status === 'posted').length} completed`} tone="sky" onClick={() => onNavigate('posting')} />
        <StatCard label="Active creators" value={state.creators.length} delta={`${state.accounts.length} connected accounts`} tone="lavender" onClick={() => onNavigate('creators')} />
      </section>
      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <PanelHeader title="Production overview" subtitle="Assets moving through the workflow" action={<button className="text-button" onClick={() => onNavigate('library')}>View library <Icon name="arrow" /></button>} />
          <div className="chart">
            <div className="chart-y"><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span></div>
            <div className="bars">
              {[['Mon', 25, 15, 10], ['Tue', 34, 22, 17], ['Wed', 18, 31, 12], ['Thu', 39, 27, 21], ['Fri', 30, 35, 18], ['Sat', 20, 24, 9], ['Sun', 28, 18, 14]].map(([day, raw, edited, approved]) => (
                <div className="bar-group" key={day as string}><div className="bar-stack"><i style={{ height: `${raw as number * 2.1}px` }} /><i style={{ height: `${edited as number * 1.5}px` }} /><i style={{ height: `${approved as number}px` }} /></div><span>{day}</span></div>
              ))}
            </div>
          </div>
          <div className="chart-legend"><span><i className="legend-raw" />Raw uploads</span><span><i className="legend-edited" />Edited</span><span><i className="legend-approved" />Approved</span></div>
        </section>
        <section className="panel action-panel">
          <PanelHeader title="Next best actions" subtitle="Keep the workflow moving" />
          <ActionRow number="01" title={`${reviewCount} assets need review`} detail="Approve or request changes" onClick={() => onNavigate('review')} />
          <ActionRow number="02" title={`${readyCount} variants are available`} detail="Build the next account schedule" onClick={onGenerate} />
          <ActionRow number="03" title={`${postCount} posts are ready today`} detail="Open the operator queue" onClick={() => onNavigate('posting')} />
        </section>
      </div>
      <div className="dashboard-grid lower-grid">
        <section className="panel">
          <PanelHeader title="Recent activity" subtitle="Latest changes across the workspace" action={<button className="text-button" onClick={() => onNavigate('library')}>See all <Icon name="arrow" /></button>} />
          <div className="activity-list">{recentAssets.map((asset) => {
            const creator = state.creators.find((item) => item.id === asset.creatorId)
            return <div className="activity-row" key={asset.id}><span className="file-icon">▧</span><div><strong>{asset.name}</strong><small>{creator?.name} · {asset.type} file · {formatDate(asset.createdAt)}</small></div><StatusPill status={asset.status} /></div>
          })}</div>
        </section>
        <section className="panel">
          <PanelHeader title="Creator workload" subtitle="Current assets by creator" action={<button className="text-button" onClick={() => onNavigate('creators')}>Manage <Icon name="arrow" /></button>} />
          <div className="workload-list">{state.creators.map((creator) => {
            const count = state.assets.filter((asset) => asset.creatorId === creator.id).length
            const width = Math.min(100, count / 12 * 100)
            return <div className="workload-row" key={creator.id}><span className="avatar" style={{ background: creator.color }}>{creator.initials}</span><div className="workload-name"><strong>{creator.name}</strong><small>{count} assets · {state.accounts.filter((account) => account.creatorId === creator.id).length} accounts</small></div><div className="progress"><i style={{ width: `${width}%`, background: creator.color }} /></div></div>
          })}</div>
        </section>
      </div>
    </div>
  )
}

function StatCard({ label, value, delta, tone, onClick }: { label: string; value: number; delta: string; tone: string; onClick: () => void }) {
  return <button className={`stat-card tone-${tone}`} onClick={onClick}><span className="stat-label">{label}<span className="stat-arrow">↗</span></span><strong>{value}</strong><small>{delta}</small></button>
}

function PanelHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return <div className="panel-header"><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</div>
}

function ActionRow({ number, title, detail, onClick }: { number: string; title: string; detail: string; onClick: () => void }) {
  return <button className="action-row" onClick={onClick}><span className="action-number">{number}</span><span><strong>{title}</strong><small>{detail}</small></span><Icon name="arrow" /></button>
}

function Creators({ state, counts, selectedCreatorId, onOpen, onAddConcept }: { state: AppState; counts: Array<{ creator: Creator; concepts: number; assets: number; accounts: number }>; selectedCreatorId: string | null; onOpen: (id: string) => void; onAddConcept: () => void }) {
  const creator = state.creators.find((item) => item.id === selectedCreatorId)
  if (creator) {
    const accounts = state.accounts.filter((account) => account.creatorId === creator.id)
    const concepts = state.concepts.filter((concept) => concept.creatorId === creator.id)
    return <div className="view-stack"><button className="back-button" onClick={() => onOpen('')}><span>←</span> All creators</button><section className="creator-hero"><span className="creator-large-avatar" style={{ background: creator.color }}>{creator.initials}</span><div><span className="eyebrow">Creator workspace</span><h2>{creator.name}</h2><p>{creator.handle} · {accounts.length} connected accounts</p></div><button className="primary-button compact" onClick={onAddConcept}><Icon name="plus" /> Add concept</button></section><div className="detail-grid"><section className="panel"><PanelHeader title="Connected accounts" subtitle="Destination channels and operating rules" /><div className="account-list">{accounts.map((account) => <div className="account-row" key={account.id}><span className="account-dot">{account.variant}</span><div><strong>{account.handle}</strong><small>{account.niche} · {account.cadence} post/day</small></div><span className="device-tag">{account.device}</span><span className="operator">{account.operator}</span></div>)}</div></section><section className="panel"><PanelHeader title="Recent concepts" subtitle={`${concepts.length} concepts in the current workspace`} /><div className="concept-mini-list">{concepts.map((concept) => <div className="concept-mini" key={concept.id}><span className={`film-dot ${concept.filmed ? 'done' : ''}`} /> <div><strong>{concept.title}</strong><small>{concept.location} · {concept.category}</small></div><span>{concept.filmed ? 'Filmed' : 'Planned'}</span></div>)}</div></section></div></div>
  }
  return <div className="view-stack"><section className="creator-grid">{counts.map(({ creator: item, concepts, assets, accounts }) => <button className="creator-card" key={item.id} onClick={() => onOpen(item.id)}><div className="creator-card-top"><span className="creator-large-avatar" style={{ background: item.color }}>{item.initials}</span><span className="more-button">···</span></div><h2>{item.name}</h2><p>{item.handle}</p><div className="creator-card-stats"><span><strong>{concepts}</strong> concepts</span><span><strong>{assets}</strong> assets</span><span><strong>{accounts}</strong> accounts</span></div><div className="creator-card-footer"><span className="online-dot" /> Active workspace <Icon name="arrow" /></div></button>)}<button className="add-card" onClick={onAddConcept}><span><Icon name="plus" /></span><strong>Add a creator</strong><small>Set up a new content workspace</small></button></section></div>
}

function ShootPlans({ state, onAddConcept }: { state: AppState; onAddConcept: () => void }) {
  return <div className="view-stack"><div className="section-toolbar"><div className="filter-tabs"><button className="selected">All shoots</button><button>In progress</button><button>Ready</button></div><button className="primary-button" onClick={onAddConcept}><Icon name="plus" /> New concept</button></div><section className="shoot-table panel"><div className="table-head"><span>Shoot plan</span><span>Creator</span><span>Progress</span><span>Status</span><span /></div>{state.shoots.map((shoot) => { const creator = state.creators.find((item) => item.id === shoot.creatorId); const progress = shoot.conceptCount ? shoot.filmedCount / shoot.conceptCount * 100 : 0; return <div className="table-row" key={shoot.id}><div className="shoot-name"><span className="calendar-icon"><Icon name="calendar" /></span><span><strong>{shoot.title}</strong><small>{formatLongDate(shoot.date)}</small></span></div><div className="creator-cell"><span className="avatar small" style={{ background: creator?.color }}>{creator?.initials}</span>{creator?.name}</div><div className="progress-cell"><div className="progress"><i style={{ width: `${progress}%` }} /></div><small>{shoot.filmedCount}/{shoot.conceptCount} filmed</small></div><StatusPill status={shoot.status === 'in_progress' ? 'in_review' : shoot.status === 'ready' ? 'approved' : 'draft'} /><button className="more-button">···</button></div> })}</section><section className="panel concepts-table"><PanelHeader title="Current shoot concepts" subtitle="The creative brief that powers the rest of the lifecycle" /><div className="table-head"><span>Concept</span><span>Location / outfit</span><span>Category</span><span>Filmed</span><span /></div>{state.concepts.map((concept) => <div className="table-row" key={concept.id}><div className="concept-name"><span className="concept-thumbnail">{concept.title.slice(0, 1)}</span><span><strong>{concept.title}</strong><small>{concept.overlay || 'Creative brief ready for input'}</small></span></div><span className="muted-cell">{concept.location}<br />{concept.outfit}</span><span className="tag">{concept.category}</span><span className={`check-state ${concept.filmed ? 'complete' : ''}`}>{concept.filmed ? '✓ Filmed' : 'Planned'}</span><button className="more-button">···</button></div>)}</section></div>
}

function Library({ state, assets, filter, setFilter, onNavigate }: { state: AppState; assets: Asset[]; filter: 'all' | AssetType; setFilter: (filter: 'all' | AssetType) => void; onNavigate: (view: ViewId) => void }) {
  return <div className="view-stack"><div className="section-toolbar"><div className="filter-tabs"><button className={filter === 'all' ? 'selected' : ''} onClick={() => setFilter('all')}>All assets</button>{(['raw', 'full', 'clean', 'variant'] as AssetType[]).map((type) => <button className={filter === type ? 'selected' : ''} key={type} onClick={() => setFilter(type)}>{type[0].toUpperCase() + type.slice(1)}</button>)}</div><button className="secondary-button"><Icon name="filter" /> More filters</button></div><section className="panel asset-table"><div className="table-head"><span>Asset</span><span>Lineage</span><span>Creator</span><span>Added</span><span>Status</span><span /></div>{assets.map((asset) => { const creator = state.creators.find((item) => item.id === asset.creatorId); const concept = state.concepts.find((item) => item.id === asset.conceptId); return <div className="table-row" key={asset.id}><div className="asset-name"><span className={`asset-type asset-${asset.type}`}>{asset.type === 'variant' ? `V${asset.version}` : asset.type.slice(0, 1).toUpperCase()}</span><span><strong>{asset.name}</strong><small>{concept?.title} · {asset.size}</small></span></div><span className="lineage-cell">{asset.type === 'raw' ? 'Original upload' : `↳ ${asset.parentId ? state.assets.find((item) => item.id === asset.parentId)?.name ?? 'Parent asset' : 'Concept'}`}</span><span className="creator-cell"><span className="avatar small" style={{ background: creator?.color }}>{creator?.initials}</span>{creator?.name}</span><span className="muted-cell">{formatDate(asset.createdAt)}</span><StatusPill status={asset.status} /><button className="more-button">···</button></div> })}{assets.length === 0 && <div className="empty-state"><span>⌕</span><strong>No assets match this search</strong><small>Try a different creator, concept, or asset type.</small><button className="text-button" onClick={() => onNavigate('shoots')}>Open shoot plans <Icon name="arrow" /></button></div>}</section></div>
}

function ReviewQueue({ state, assets, onApprove, onReject }: { state: AppState; assets: Asset[]; onApprove: (id: string) => void; onReject: (id: string) => void }) {
  return <div className="view-stack"><div className="notice-banner"><span className="notice-icon">!</span><span><strong>{assets.length} assets are waiting for approval.</strong> Both Full and Clean must be approved before variant work can begin.</span></div><section className="review-grid">{assets.map((asset) => { const concept = state.concepts.find((item) => item.id === asset.conceptId); const creator = state.creators.find((item) => item.id === asset.creatorId); const raw = state.assets.find((item) => item.id === concept?.id); return <article className="review-card" key={asset.id}><div className="media-preview"><span className="preview-label">VIDEO</span><span className="preview-play"><Icon name="play" /></span><span className="preview-title">{concept?.title}</span></div><div className="review-body"><div className="review-meta"><span className="avatar small" style={{ background: creator?.color }}>{creator?.initials}</span><span>{creator?.name}</span><span>·</span><span>{asset.type === 'full' ? 'Full edit' : 'Clean edit'}</span></div><h2>{asset.name}</h2><p>{asset.size} · uploaded {formatDate(asset.createdAt)} · waiting for social manager</p><div className="review-lineage"><span>Concept</span><strong>{concept?.title}</strong><span>Raw takes</span><strong>{raw?.name ?? 'Linked raw folder'}</strong></div><div className="review-actions"><button className="secondary-button" onClick={() => onReject(asset.id)}>Request changes</button><button className="primary-button" onClick={() => onApprove(asset.id)}><Icon name="check" /> Approve</button></div></div></article> })}</section>{assets.length === 0 && <div className="empty-state large"><span>✓</span><strong>Review queue is clear</strong><small>Approved assets will appear in the scheduling pool.</small></div>}</div>
}

function Schedule({ state, onGenerate }: { state: AppState; onGenerate: () => void }) {
  const dates = Array.from(new Set(state.slots.map((slot) => slot.date))).sort().slice(0, 7)
  return <div className="view-stack"><div className="schedule-toolbar"><div className="month-nav"><button>‹</button><strong>September 2026</strong><button>›</button></div><div><button className="secondary-button">Export</button><button className="primary-button" onClick={onGenerate}><Icon name="play" /> Generate draft</button></div></div><div className="schedule-note"><span className="notice-icon">i</span><span>Drafts use approved variants only. A posted file is consumed globally, and pinned dates survive regeneration.</span></div><section className="calendar-grid panel"><div className="calendar-header">{dates.map((date) => <div key={date}><small>{new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(`${date}T12:00:00`))}</small><strong className={date === today ? 'today' : ''}>{new Date(`${date}T12:00:00`).getDate()}</strong></div>)}</div><div className="calendar-body">{dates.map((date) => <div className="day-column" key={date}>{state.slots.filter((slot) => slot.date === date).map((slot) => { const asset = state.assets.find((item) => item.id === slot.assetId); const account = state.accounts.find((item) => item.id === slot.accountId); const creator = state.creators.find((item) => item.id === slot.creatorId); return <div className={`calendar-slot slot-${slot.status}`} key={slot.id}><div className="slot-top"><span className="slot-time">09:00</span>{slot.pinned && <span>◆</span>}</div><strong>{asset?.name}</strong><small>{account?.handle}</small><small><span className="avatar tiny" style={{ background: creator?.color }}>{creator?.initials}</span>{account?.device}</small><StatusPill status={slot.status} /></div> })}<button className="add-slot">+ Add slot</button></div>)}</div></section></div>
}

function PostingQueue({ state, slots, onMark }: { state: AppState; slots: ScheduleSlot[]; onMark: (id: string, status: SlotStatus) => void }) {
  return <div className="view-stack"><div className="posting-summary"><div><span className="eyebrow">Friday, 11 September 2026</span><h2>{slots.filter((slot) => slot.status === 'ready').length} posts ready for today</h2><p>Every row is a complete handoff for the posting operator.</p></div><div className="summary-progress"><strong>{slots.filter((slot) => slot.status === 'posted').length}/{slots.length}</strong><span>completed</span><div className="progress"><i style={{ width: `${slots.length ? slots.filter((slot) => slot.status === 'posted').length / slots.length * 100 : 0}%` }} /></div></div></div><section className="panel posting-table"><div className="table-head"><span>Account</span><span>Device</span><span>Content</span><span>Caption</span><span>Status</span><span /></div>{slots.map((slot) => { const account = state.accounts.find((item) => item.id === slot.accountId); const asset = state.assets.find((item) => item.id === slot.assetId); const creator = state.creators.find((item) => item.id === slot.creatorId); return <div className="posting-row" key={slot.id}><div className="account-cell"><span className="avatar small" style={{ background: creator?.color }}>{creator?.initials}</span><span><strong>{account?.handle}</strong><small>{creator?.name}</small></span></div><span className="device-tag">{account?.device}</span><div className="posting-file"><span className="asset-type asset-variant">V{asset?.version}</span><span><strong>{asset?.name}</strong><small>Approved · {asset?.size}</small></span></div><span className="caption-cell">{slot.caption}</span><div className="posting-actions"><StatusPill status={slot.status} />{slot.status === 'ready' && <><button className="icon-action success" title="Mark posted" onClick={() => onMark(slot.id, 'posted')}><Icon name="check" /></button><button className="icon-action fail" title="Mark failed" onClick={() => onMark(slot.id, 'failed')}>×</button></>}</div></div> })}</section></div>
}

function ConceptModal({ state, onClose, onSave }: { state: AppState; onClose: () => void; onSave: (concept: Concept) => void }) {
  const [title, setTitle] = useState('')
  const [creatorId, setCreatorId] = useState(state.creators[0]?.id ?? '')
  const [location, setLocation] = useState('')
  const [outfit, setOutfit] = useState('')
  const [caption, setCaption] = useState('')
  const shoot = state.shoots.find((item) => item.creatorId === creatorId) ?? state.shoots[0]
  const save = () => {
    if (!title.trim() || !shoot) return
    onSave({ id: `concept-${Date.now()}`, creatorId, shootId: shoot.id, title: title.trim(), location: location.trim() || 'To be decided', outfit: outfit.trim() || 'To be decided', overlay: '', caption: caption.trim(), filmed: false, category: 'Uncategorized' })
  }
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">Shoot planning</span><h2>Create a concept</h2><p>Capture the creative brief before the camera starts rolling.</p></div><button className="close-button" onClick={onClose}>×</button></div><div className="form-grid"><label>Creator<select value={creatorId} onChange={(event) => setCreatorId(event.target.value)}>{state.creators.map((creator) => <option value={creator.id} key={creator.id}>{creator.name}</option>)}</select></label><label>Concept title<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Morning routine" /></label><label>Location<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Where will this be filmed?" /></label><label>Props / outfit<input value={outfit} onChange={(event) => setOutfit(event.target.value)} placeholder="What is needed on set?" /></label><label className="full-field">Caption<textarea value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="The description that will be posted with the video" rows={3} /></label></div><div className="modal-footer"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={!title.trim()} onClick={save}>Create concept <Icon name="arrow" /></button></div></div></div>
}

export default App
