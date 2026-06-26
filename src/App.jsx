import { useMemo, useRef, useState } from 'react'
import {
  Activity,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  HeartPulse,
  Loader2,
  Menu,
  Mic,
  RefreshCw,
  ShieldCheck,
  UploadCloud,
  Waves,
  X,
} from 'lucide-react'
import './App.css'

const API_URL = 'https://spindle-party-treachery.ngrok-free.dev/predict'
const GITHUB_URL = 'https://github.com/'

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'test', label: 'Fatigue Test' },
]

const stats = [
  { label: 'Total Data Analyzed', value: '1,248', detail: 'Audio samples processed' },
  { label: 'Prediction Summary', value: '3 Levels', detail: 'Low, medium, and high fatigue' },
  { label: 'Total Prediction', value: '928', detail: 'Demonstration predictions' },
]

const technologies = [
  'Python',
  'TensorFlow',
  'Flask API',
  'React',
  'Tailwind CSS',
  'Supabase Storage',
]

const workflow = [
  'Audio Recording',
  'Preprocessing',
  'Mel Spectrogram',
  'CNN Model',
  'Fatigue Prediction',
]

const team = [
  { name: 'Awan', role: 'Machine Learning Developer', initials: 'AW' },
  { name: 'Deka', role: 'Frontend Developer', initials: 'DK' },
  { name: 'Research Team', role: 'Data Mining Project', initials: 'RT' },
]

const fatigueDetails = {
  low: {
    title: 'Low Fatigue',
    color: '#6BAF92',
    description:
      'The audio pattern indicates a low level of fatigue. Your voice characteristics appear relatively stable for this analysis.',
    recommendation:
      'Maintain regular breaks, hydration, and healthy sleep habits to keep your energy level consistent.',
  },
  medium: {
    title: 'Medium Fatigue',
    color: '#E8B95B',
    description:
      'The audio pattern indicates moderate fatigue. You may be experiencing reduced alertness or early signs of tiredness.',
    recommendation:
      'Take a short rest, reduce demanding activity for a moment, and monitor how your body feels before continuing.',
  },
  high: {
    title: 'High Fatigue',
    color: '#D97B6C',
    description:
      'The audio pattern indicates a high level of fatigue. This result suggests that your current condition may need attention.',
    recommendation:
      'Prioritize rest, avoid risky activities that require high concentration, and seek support if fatigue persists.',
  },
}

function normalizePrediction(data) {
  const rawLabel = data?.label ?? data?.prediction ?? data?.class ?? data?.result
  const label = String(rawLabel ?? '').toLowerCase()

  if (label.includes('low') || rawLabel === 0 || rawLabel === 1 || label === '1') return 'low'
  if (label.includes('medium') || rawLabel === 2 || label === '2') return 'medium'
  if (label.includes('high') || rawLabel === 3 || label === '3') return 'high'

  return 'medium'
}

function normalizeConfidence(data) {
  const rawConfidence = data?.confidence ?? data?.confidence_score ?? data?.score ?? data?.probability
  const numeric = Number(rawConfidence)

  if (!Number.isFinite(numeric)) return null
  return numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric)
}

function App() {
  const [activePage, setActivePage] = useState('home')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigate = (page) => {
    setActivePage(page)
    setIsMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const page = useMemo(() => {
    if (activePage === 'about') return <AboutPage />
    if (activePage === 'test') return <FatigueTestPage />
    return <HomePage onStart={() => navigate('test')} />
  }, [activePage])

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/85 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="flex items-center gap-3 text-left"
            aria-label="Go to home page"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--color-primary)] text-white shadow-sm">
              <HeartPulse size={22} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold text-[var(--color-heading)]">
                FatigueSense
              </span>
              <span className="block text-xs font-medium text-[var(--color-muted)]">
                Human Fatigue Detection
              </span>
            </span>
          </button>

          <div className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activePage === item.id
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-heading)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-black/10 bg-white text-[var(--color-heading)] md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {isMenuOpen && (
          <div className="border-t border-black/5 bg-white px-5 py-3 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                  className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
                    activePage === item.id
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-surface)] text-[var(--color-heading)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main>{page}</main>

      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>Human Fatigue Detection Web Application</p>
          <p>Research demonstration powered by CNN audio classification.</p>
        </div>
      </footer>
    </div>
  )
}

function HomePage({ onStart }) {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-white px-4 py-2 text-sm font-semibold text-[var(--color-primary)] shadow-sm">
              <Waves size={16} aria-hidden="true" />
              Voice-based fatigue screening
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[var(--color-heading)] sm:text-5xl lg:text-6xl">
              Human Fatigue Detection
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-muted)]">
              A calm web application for classifying fatigue levels from WAV audio using a
              Convolutional Neural Network model.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={onStart} className="btn-primary">
                Get Started
                <ChevronRight size={18} aria-hidden="true" />
              </button>
              <a href="#about-project" className="btn-secondary">
                Learn More
              </a>
            </div>
          </div>

          <div className="relative min-h-[360px] rounded-[20px] bg-white p-5 shadow-[0_24px_70px_rgba(47,58,60,0.12)]">
            <div className="grid h-full place-items-center rounded-2xl bg-[var(--color-surface)] p-6">
              <div className="w-full max-w-md">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-muted)]">Live Analysis</p>
                    <p className="text-2xl font-semibold text-[var(--color-heading)]">Audio Signal</p>
                  </div>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-accent)] text-white">
                    <Mic size={22} aria-hidden="true" />
                  </span>
                </div>
                <div className="flex h-44 items-end justify-between gap-2 rounded-2xl bg-white p-5">
                  {[42, 68, 38, 86, 54, 74, 45, 93, 62, 78, 40, 66, 52, 88].map((height, index) => (
                    <span
                      key={height + index}
                      className="w-full rounded-full bg-[var(--color-primary)]/70"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {['Low', 'Medium', 'High'].map((level) => (
                    <div key={level} className="rounded-2xl bg-white p-4 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                        {level}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[var(--color-heading)]">Ready</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about-project" className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <SectionIntro
            eyebrow="About Project"
            title="A research demonstration for accessible fatigue insight."
            text="The system helps users understand their fatigue level by uploading a WAV audio sample that is analyzed by a trained CNN model."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Purpose', 'Provide an easy way to demonstrate voice-based fatigue classification.'],
              ['Benefit', 'Support public awareness of fatigue through a simple web interface.'],
              ['Model', 'Connect frontend users to a Flask API powered by TensorFlow CNN.'],
            ].map(([title, text]) => (
              <article key={title} className="rounded-[20px] bg-[var(--color-background)] p-5">
                <CheckCircle2 className="mb-5 text-[var(--color-secondary)]" size={24} aria-hidden="true" />
                <h3 className="text-lg font-semibold text-[var(--color-heading)]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionIntro
            eyebrow="Statistics"
            title="System usage snapshot"
            text="Temporary demonstration data is shown here and can be connected to real usage metrics later."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-[20px] bg-white p-6 shadow-sm">
                <BarChart3 className="mb-5 text-[var(--color-primary)]" size={26} aria-hidden="true" />
                <p className="text-sm font-semibold text-[var(--color-muted)]">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--color-heading)]">{stat.value}</p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{stat.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-primary)] py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/75">Try the classifier</p>
            <h2 className="mt-2 text-3xl font-semibold">Analyze fatigue from a WAV audio file.</h2>
          </div>
          <button type="button" onClick={onStart} className="btn-light">
            Start Fatigue Test
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </section>
    </>
  )
}

function AboutPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
      <SectionIntro
        eyebrow="About"
        title="From voice recording to fatigue prediction."
        text="This page explains the system workflow, research stack, and team behind the Human Fatigue Detection application."
      />

      <div className="mt-10 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <article className="rounded-[20px] bg-white p-7 shadow-sm">
          <Activity className="mb-5 text-[var(--color-primary)]" size={30} aria-hidden="true" />
          <h2 className="text-2xl font-semibold text-[var(--color-heading)]">Project Overview</h2>
          <p className="mt-4 leading-8 text-[var(--color-muted)]">
            Human Fatigue Detection uses audio processing and deep learning to classify fatigue
            into low, medium, and high levels. The website presents the research and provides a
            direct interface for testing WAV audio through the available backend API.
          </p>
        </article>

        <article className="rounded-[20px] bg-white p-7 shadow-sm">
          <Brain className="mb-5 text-[var(--color-accent)]" size={30} aria-hidden="true" />
          <h2 className="text-2xl font-semibold text-[var(--color-heading)]">System Workflow</h2>
          <div className="mt-6 grid gap-3">
            {workflow.map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-[var(--color-background)] p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-sm font-semibold text-[var(--color-primary)]">
                  {index + 1}
                </span>
                <span className="font-semibold text-[var(--color-heading)]">{item}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <article className="rounded-[20px] bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-semibold text-[var(--color-heading)]">Technologies</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {technologies.map((technology) => (
              <span
                key={technology}
                className="rounded-full bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-heading)]"
              >
                {technology}
              </span>
            ))}
          </div>
        </article>

        <article className="rounded-[20px] bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-semibold text-[var(--color-heading)]">GitHub Project</h2>
          <p className="mt-4 leading-7 text-[var(--color-muted)]">
            The project repository can be linked here when the final public URL is available.
          </p>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-secondary mt-6 w-fit">
            <ExternalLink size={18} aria-hidden="true" />
            Open Repository
          </a>
        </article>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-[var(--color-heading)]">Developer Team</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {team.map((member) => (
            <article key={member.name} className="rounded-[20px] bg-white p-6 shadow-sm">
              <div className="grid h-20 w-20 place-items-center rounded-[20px] bg-[var(--color-surface)] text-xl font-semibold text-[var(--color-primary)]">
                {member.initials}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[var(--color-heading)]">{member.name}</h3>
              <p className="mt-2 text-sm font-medium text-[var(--color-muted)]">{member.role}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

function FatigueTestPage() {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleFile = (selectedFile) => {
    setResult(null)
    setError('')

    if (!selectedFile) return

    const isWav =
      selectedFile.name.toLowerCase().endsWith('.wav') ||
      selectedFile.type === 'audio/wav' ||
      selectedFile.type === 'audio/x-wav'

    if (!isWav) {
      setFile(null)
      setError('Please upload a valid WAV audio file.')
      return
    }

    setFile(selectedFile)
  }

  const analyzeFile = async () => {
    if (!file) {
      setError('Please choose a WAV file before starting the analysis.')
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || 'The audio file could not be processed.')
      }

      const key = normalizePrediction(data)
      setResult({
        ...fatigueDetails[key],
        confidence: normalizeConfidence(data),
        raw: data,
      })
    } catch (caughtError) {
      setError(caughtError.message || 'Something went wrong while analyzing the audio.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetTest = () => {
    setFile(null)
    setError('')
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
      <SectionIntro
        eyebrow="Fatigue Test"
        title="Upload a WAV audio file for fatigue classification."
        text="The audio will be sent to the backend model and classified into low, medium, or high fatigue."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <article className="rounded-[20px] bg-white p-6 shadow-sm">
          <div
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setIsDragging(false)
              handleFile(event.dataTransfer.files?.[0])
            }}
            className={`grid min-h-[330px] place-items-center rounded-[20px] border-2 border-dashed p-6 text-center transition ${
              isDragging
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                : 'border-[var(--color-primary)]/25 bg-[var(--color-background)]'
            }`}
          >
            <div>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-white text-[var(--color-primary)] shadow-sm">
                <UploadCloud size={30} aria-hidden="true" />
              </span>
              <h2 className="mt-6 text-2xl font-semibold text-[var(--color-heading)]">
                Drag and drop your audio file
              </h2>
              <p className="mt-3 text-[var(--color-muted)]">Supported format: WAV (.wav)</p>
              <input
                ref={inputRef}
                type="file"
                accept=".wav,audio/wav,audio/x-wav"
                onChange={(event) => handleFile(event.target.files?.[0])}
                className="sr-only"
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="btn-secondary mx-auto mt-6"
              >
                Browse File
              </button>
              {file && (
                <p className="mt-5 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[var(--color-heading)]">
                  Selected: {file.name}
                </p>
              )}
              {error && (
                <p className="mt-5 rounded-2xl bg-[var(--color-high)]/10 px-4 py-3 text-sm font-semibold text-[var(--color-high)]">
                  {error}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={analyzeFile} disabled={isLoading} className="btn-primary disabled:opacity-60">
              {isLoading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <ShieldCheck size={18} aria-hidden="true" />}
              {isLoading ? 'Analyzing Audio' : 'Analyze Fatigue'}
            </button>
            <button type="button" onClick={resetTest} className="btn-secondary">
              <RefreshCw size={18} aria-hidden="true" />
              Analyze Again
            </button>
          </div>
        </article>

        <aside className="rounded-[20px] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-[var(--color-heading)]">Prediction Result</h2>
          {!result ? (
            <div className="mt-6 rounded-[20px] bg-[var(--color-background)] p-6">
              <p className="text-[var(--color-muted)]">
                Your fatigue prediction will appear here after the WAV file is processed.
              </p>
            </div>
          ) : (
            <div className="mt-6">
              <div
                className="rounded-[20px] p-6 text-white"
                style={{ backgroundColor: result.color }}
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
                  Fatigue Level
                </p>
                <h3 className="mt-2 text-3xl font-semibold">{result.title}</h3>
                <p className="mt-4 text-white/90">
                  Confidence Score: {result.confidence === null ? 'Not provided' : `${result.confidence}%`}
                </p>
              </div>
              <div className="mt-5 space-y-4">
                <InfoBlock title="Description" text={result.description} />
                <InfoBlock title="Recommendation" text={result.recommendation} />
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

function SectionIntro({ eyebrow, title, text }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-primary)]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight text-[var(--color-heading)] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 leading-8 text-[var(--color-muted)]">{text}</p>
    </div>
  )
}

function InfoBlock({ title, text }) {
  return (
    <div className="rounded-[20px] bg-[var(--color-background)] p-5">
      <h4 className="font-semibold text-[var(--color-heading)]">{title}</h4>
      <p className="mt-2 leading-7 text-[var(--color-muted)]">{text}</p>
    </div>
  )
}

export default App
