import { useEffect, useMemo, useRef, useState } from 'react'
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
import { fetchPredictions, savePrediction, uploadAudio } from './services/emotionAPI'
import './App.css'

const API_URL = 'https://spindle-party-treachery.ngrok-free.dev/predict'
const GITHUB_URL = 'https://github.com/filbert6431/Emotional_Fatigue_AwanDeka/'

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

const defaultPredictionCounts = { low: 0, medium: 0, high: 0 }

const defaultMonthlyUploads = [
  { label: 'Jan', value: 0 },
  { label: 'Feb', value: 0 },
  { label: 'Mar', value: 0 },
  { label: 'Apr', value: 0 },
  { label: 'May', value: 0 },
  { label: 'Jun', value: 0 },
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
  {
    name: 'Filbert Anggriawan',
    role: 'Machine Learning Developer',
    initials: 'FA',
    imageSrc: '/Images/Filbert Angg.jpeg',
  },
  {
    name: 'Alya Deka Danisha',
    role: 'Machine Learning Developer',
    initials: 'DK',
    imageSrc: '/Images/Alya.jpeg',
  },
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
  // Try common textual label fields first
  const rawLabelField = data?.predicted_class_label ?? data?.predicted_label ?? data?.prediction ?? data?.label ?? data?.result ?? ''
  let classLabel = String(rawLabelField ?? '').toLowerCase()

  // Try numeric index fields
  const classIndex = data?.predicted_class_index ?? data?.predicted_index ?? data?.class_index ?? data?.class ?? null

  // If backend provided the classes/labels array, map index through it
  const classesArray = data?.classes ?? data?.labels ?? data?.class_labels
  if (Array.isArray(classesArray) && classIndex != null && classesArray[classIndex]) {
    classLabel = String(classesArray[classIndex]).toLowerCase()
  }

  // Normalize textual label
  if (classLabel.includes('low')) return 'low'
  if (classLabel.includes('medium')) return 'medium'
  if (classLabel.includes('high')) return 'high'

  // Fallback numeric mapping (default convention)
  if (classIndex != null && Number.isFinite(Number(classIndex))) {
    const idx = Number(classIndex)
    if (idx === 0) return 'low'
    if (idx === 1) return 'medium'
    if (idx === 2) return 'high'
  }

  return 'medium'
}

function normalizeConfidence(data) {
  const rawConfidence = data?.confidence ?? data?.confidence_score ?? data?.score ?? data?.probability
  const numeric = Number(rawConfidence)

  if (!Number.isFinite(numeric)) return null
  return numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric)
}

function getPredictionCounts(predictions) {
  return predictions.reduce(
    (summary, prediction) => {
      const level = String(prediction.emotional_fatigue_level || '').toLowerCase()

      if (level.includes('low')) summary.low += 1
      if (level.includes('medium')) summary.medium += 1
      if (level.includes('high')) summary.high += 1

      return summary
    },
    { ...defaultPredictionCounts },
  )
}

function getMonthlyUploads(predictions) {
  const groupedUploads = predictions.reduce((months, prediction) => {
    const createdAt = new Date(prediction.created_at)

    if (Number.isNaN(createdAt.getTime())) return months

    const monthKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`
    const label = createdAt.toLocaleString('en-US', { month: 'short' })
    const currentMonth = months.get(monthKey) || { label, value: 0, date: createdAt }

    currentMonth.value += 1
    months.set(monthKey, currentMonth)

    return months
  }, new Map())

  return Array.from(groupedUploads.values())
    .sort((first, second) => first.date - second.date)
    .slice(-6)
    .map(({ label, value }) => ({ label, value }))
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
                Fatigue Sense AwanDeka
              </span>
              <span className="block text-xs font-medium text-[var(--color-muted)]">Fatigue Detection System</span>
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
          <p>Fatigue Sense AwanDeka Web Application</p>
          <p>Research demonstration powered by CNN audio classification.</p>
        </div>
      </footer>
    </div>
  )
}

function HomePage({ onStart }) {
  const [displayStats, setDisplayStats] = useState(stats)
  const [predictionCounts, setPredictionCounts] = useState(defaultPredictionCounts)
  const [monthlyUploads, setMonthlyUploads] = useState(defaultMonthlyUploads)

  useEffect(() => {
    async function loadStats() {
      try {
        const predictions = await fetchPredictions()
        const total = predictions.length
        const counts = getPredictionCounts(predictions)
        const uploadsByMonth = getMonthlyUploads(predictions)

        setDisplayStats([
          { label: 'Total Data Analyzed', value: total.toLocaleString(), detail: 'Audio samples processed' },
          {
            label: 'Prediction Summary',
            value: `${counts.low}/${counts.medium}/${counts.high}`,
            detail: 'Low / Medium / High fatigue',
          },
          { label: 'Total Prediction', value: total.toLocaleString(), detail: 'Stored prediction records' },
        ])
        setPredictionCounts(counts)
        setMonthlyUploads(uploadsByMonth.length > 0 ? uploadsByMonth : defaultMonthlyUploads)
      } catch {
        setDisplayStats(stats)
        setPredictionCounts(defaultPredictionCounts)
        setMonthlyUploads(defaultMonthlyUploads)
      }
    }

    loadStats()
  }, [])

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
              Fatigue Sense AwanDeka
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
            {displayStats.map((stat) => (
              <article key={stat.label} className="rounded-[20px] bg-white p-6 shadow-sm">
                <BarChart3 className="mb-5 text-[var(--color-primary)]" size={26} aria-hidden="true" />
                <p className="text-sm font-semibold text-[var(--color-muted)]">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--color-heading)]">{stat.value}</p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{stat.detail}</p>
                {stat.label === 'Prediction Summary' && (
                  <PredictionDonutChart counts={predictionCounts} />
                )}
              </article>
            ))}
          </div>
          <MonthlyUploadChart uploads={monthlyUploads} />
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
        text="This page explains the system workflow, research stack, and team behind the Fatigue Sense AwanDeka application."
      />

      <div className="mt-10 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <article className="rounded-[20px] bg-white p-7 shadow-sm">
          <Activity className="mb-5 text-[var(--color-primary)]" size={30} aria-hidden="true" />
          <h2 className="text-2xl font-semibold text-[var(--color-heading)]">Project Overview</h2>
          <p className="mt-4 leading-8 text-[var(--color-muted)]">
            Fatigue Sense AwanDeka uses audio processing and deep learning to classify fatigue
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

      <div className="mt-5 rounded-[20px] bg-white p-7 shadow-sm">
        <h2 className="text-2xl font-semibold text-[var(--color-heading)]">Process Flowchart</h2>
        <div className="mt-6 flex justify-center">
          <img 
            src="/Images/FlowChart.png" 
            alt="System Workflow Flowchart" 
            className="max-w-full h-auto rounded-lg"
          />
        </div>
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
              <div className="grid h-20 w-20 overflow-hidden rounded-[20px] bg-[var(--color-surface)]">
                {member.imageSrc ? (
                  <img
                    src={member.imageSrc}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="place-items-center text-xl font-semibold text-[var(--color-primary)]">
                    {member.initials}
                  </div>
                )}
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

    const isWav = selectedFile.name.toLowerCase().endsWith('.wav')

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
      const audioFile = await uploadAudio(file)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      })

      // Safely parse response: backend may return HTML on errors (500)
      const contentType = response.headers.get('content-type') || ''
      let data

      if (contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        // Throw with the raw response text so the UI can show server traceback/html
        throw new Error(`Server returned non-JSON response (status ${response.status}): ${text}`)
      }

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || 'The audio file could not be processed.')
      }

      const key = normalizePrediction(data)
      const fatigueLevel = fatigueDetails[key].title

      await savePrediction(audioFile, fatigueLevel)

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
              <div className="mt-4 rounded-[10px] bg-[var(--color-background)] p-3 text-xs">
                <strong className="block mb-2">Raw API response (debug):</strong>
                <pre className="whitespace-pre-wrap break-words">{JSON.stringify(result.raw, null, 2)}</pre>
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

function PredictionDonutChart({ counts }) {
  const segments = [
    { label: 'Low', value: counts.low, color: 'var(--color-low)' },
    { label: 'Medium', value: counts.medium, color: 'var(--color-medium)' },
    { label: 'High', value: counts.high, color: 'var(--color-high)' },
  ]
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  let offset = 0

  return (
    <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 120 120" role="img" aria-label="Prediction summary donut chart">
          <circle
            cx="60"
            cy="60"
            r="42"
            fill="none"
            stroke="var(--color-surface)"
            strokeWidth="18"
          />
          {segments.map((segment) => {
            const dashLength = total > 0 ? (segment.value / total) * 263.89 : 0
            const circle = (
              <circle
                key={segment.label}
                cx="60"
                cy="60"
                r="42"
                fill="none"
                stroke={segment.color}
                strokeDasharray={`${dashLength} 263.89`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                strokeWidth="18"
                transform="rotate(-90 60 60)"
              />
            )

            offset += dashLength
            return circle
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <span className="text-2xl font-semibold text-[var(--color-heading)]">{total}</span>
        </div>
      </div>

      <div className="grid flex-1 gap-2">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 font-medium text-[var(--color-muted)]">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              {segment.label}
            </span>
            <span className="font-semibold text-[var(--color-heading)]">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MonthlyUploadChart({ uploads }) {
  const highestValue = Math.max(...uploads.map((upload) => upload.value), 1)

  return (
    <article className="mt-4 rounded-[20px] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--color-muted)]">Monthly Uploads</p>
          <h3 className="mt-2 text-2xl font-semibold text-[var(--color-heading)]">
            Uploaded audio per month
          </h3>
        </div>
        <BarChart3 className="text-[var(--color-primary)]" size={28} aria-hidden="true" />
      </div>

      <div className="mt-8 flex h-60 items-end gap-3 rounded-[20px] bg-[var(--color-background)] p-5">
        {uploads.map((upload) => {
          const height = upload.value > 0 ? Math.max((upload.value / highestValue) * 100, 10) : 4

          return (
            <div key={upload.label} className="flex h-full flex-1 flex-col items-center justify-end gap-3">
              <span className="text-sm font-semibold text-[var(--color-heading)]">
                {upload.value}
              </span>
              <div
                className="w-full max-w-16 rounded-t-2xl bg-[var(--color-primary)] transition"
                style={{ height: `${height}%` }}
                aria-label={`${upload.value} uploads in ${upload.label}`}
                role="img"
              />
              <span className="text-xs font-semibold text-[var(--color-muted)]">{upload.label}</span>
            </div>
          )
        })}
      </div>
    </article>
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
