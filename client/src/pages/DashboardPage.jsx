import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import Flashcard from '../components/Flashcard'
import IrrigationModal from '../components/IrrigationModal'
import Navbar from '../components/Navbar'
import './DashboardPage.css'

const FLASHCARD_CONFIG = [
  {
    title: 'Crop Selection & Rotation',
    dataKey: 'cropRotation',
    fields: [
      { label: 'Drought Forecast', key: 'droughtForecast', width: '140px' },
      { label: 'Vegetation Growth', key: 'vegetationGrowth', width: '120px' },
    ],
    tip: { key: 'tip', width: '70%' },
  },
  {
    title: 'Fertilization & Nutrient Management',
    dataKey: 'fertilization',
    fields: [
      { label: 'Soil Moisture', key: 'soilMoisture', width: '90px' },
      { label: 'Rainfall Forecast', key: 'rainfallForecast', width: '100px' },
    ],
    tip: { key: 'tip', width: '70%' },
  },
  {
    title: 'Harvest Timing',
    dataKey: 'harvest',
    fields: [
      { label: 'Precipitation Risk', key: 'precipitationRisk', width: '110px' },
      { label: 'ET Level', key: 'etLevel', width: '80px' },
    ],
    tip: { key: 'tip', width: '65%' },
  },
  {
    title: 'Pest & Disease Management',
    dataKey: 'pests',
    fields: [
      { label: 'Pest Outbreak Risk', key: 'pestRisk', width: '100px' },
      { label: 'Fungal Growth Risk', key: 'fungalRisk', width: '100px' },
    ],
    tip: { key: 'tip', width: '60%' },
  },
  {
    title: 'Soil Health & Erosion Control',
    dataKey: 'soilHealth',
    fields: [
      { label: 'Flood Risk', key: 'floodRisk', width: '90px' },
      { label: 'Erosion Control Needed', key: 'erosionControl', width: '70px' },
    ],
    tip: { key: 'tip', width: '60%' },
  },
  {
    title: 'Water Storage & Conservation',
    dataKey: 'water',
    fields: [
      { label: 'Drought Risk', key: 'droughtRisk', width: '90px' },
      { label: 'Water Storage Suggested', key: 'waterStorage', width: '80px' },
    ],
    tip: { key: 'tip', width: '70%' },
  },
  {
    title: 'Livestock Management',
    dataKey: 'livestock',
    fields: [
      { label: 'Heat Stress Risk', key: 'heatStress', width: '90px' },
      { label: 'Air Quality', key: 'airQuality', width: '80px' },
    ],
    tip: { key: 'tip', width: '65%' },
  },
  {
    title: 'Post-Harvest Handling',
    dataKey: 'postHarvest',
    fields: [
      { label: 'Humidity Risk', key: 'humidityRisk', width: '100px' },
      { label: 'Mold Risk', key: 'moldRisk', width: '100px' },
    ],
    tip: { key: 'tip', width: '60%' },
  },
  {
    title: 'Water-Flow Handling',
    dataKey: 'pump',
    fields: [
      { label: 'Pump State', key: 'state', width: '70px' },
    ],
    tip: { key: 'tip', width: '50%' },
  },
]

export default function DashboardPage() {
  const [searchParams] = useSearchParams()
  const crop = searchParams.get('crop')

  const [advice, setAdvice] = useState(null)
  const [summary, setSummary] = useState('')
  const [summaryLoaded, setSummaryLoaded] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [showIrrigationModal, setShowIrrigationModal] = useState(false)
  const [geoPosition, setGeoPosition] = useState(null)
  const [phase, setPhase] = useState('geo') // 'geo' | 'irrigation' | 'loading' | 'done' | 'error'

  // Step 0: Set crop cookie on server
  useEffect(() => {
    if (crop) {
      fetch(`/api/dashboard?crop=${encodeURIComponent(crop)}`)
        .catch(err => console.error('Failed to set crop cookie:', err))
    }
  }, [crop])

  // Step 1: Get geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      setPhase('error')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoPosition({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
        setPhase('irrigation')
        setShowIrrigationModal(true)
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('You denied the request for Geolocation.')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.')
            break
          case err.TIMEOUT:
            setError('The request to get user location timed out.')
            break
          default:
            setError('An unknown error occurred.')
        }
        setPhase('error')
      }
    )
  }, [])

  // Step 2: Fetch advice from server
  const fetchAdvice = useCallback(async (irrigation) => {
    if (!geoPosition) return

    setPhase('loading')
    setSummary('Loading advice... Please wait.')
    setSummaryLoaded(false)

    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: geoPosition.lat,
          lon: geoPosition.lon,
          irrigation,
        }),
      })

      const data = await res.json()
      const adviceData = data.Advice

      if (!adviceData) {
        setSummary('No advice available.')
        setSummaryLoaded(true)
        return
      }

      setSummary(adviceData.summary || 'No summary.')
      setSummaryLoaded(true)
      setAdvice(adviceData)
      setLoaded(true)
      setPhase('done')
    } catch (err) {
      console.error(err)
      setSummary('Failed to fetch advice.')
      setSummaryLoaded(true)
      setError('Failed to fetch advice from the server.')
      setPhase('error')
    }
  }, [geoPosition])

  const handleIrrigationSubmit = (value) => {
    setShowIrrigationModal(false)
    fetchAdvice(value)
  }

  const handleIrrigationSkip = () => {
    setShowIrrigationModal(false)
    fetchAdvice(null)
  }

  return (
    <div className="dashboard-page">
      <main>
        <div className="dashboard-container">
          <h1>Agriculture Advisory Dashboard</h1>

          {crop && (
            <p className="crop-indicator fade-up">
              Monitoring: <strong>{crop}</strong>
            </p>
          )}

          {/* Error state */}
          {phase === 'error' && error && (
            <div className="dashboard-error fade-up">
              <p>⚠️ {error}</p>
            </div>
          )}

          {/* Advice summary card */}
          <div className={`flashcard advice-section ${summaryLoaded ? 'appear' : ''}`}>
            <h2>Your Advisory</h2>
            <p className={summaryLoaded ? '' : 'skeleton skeleton-block skeleton-mask'}>
              {summary}
            </p>
          </div>

          {/* Flashcards grid */}
          {FLASHCARD_CONFIG.map(card => (
            <Flashcard
              key={card.dataKey}
              title={card.title}
              fields={card.fields}
              tip={card.tip}
              loaded={loaded}
              data={advice?.[card.dataKey]}
            />
          ))}
        </div>
      </main>

      <Navbar />

      {showIrrigationModal && (
        <IrrigationModal
          onSubmit={handleIrrigationSubmit}
          onSkip={handleIrrigationSkip}
        />
      )}
    </div>
  )
}
