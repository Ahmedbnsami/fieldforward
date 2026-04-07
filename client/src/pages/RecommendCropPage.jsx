import { useState, useEffect, useCallback } from 'react'
import IrrigationModal from '../components/IrrigationModal'
import Navbar from '../components/Navbar'
import './RecommendCropPage.css'

export default function RecommendCropPage() {
  const [loading, setLoading] = useState(true)
  const [recommendedCrops, setRecommendedCrops] = useState([])
  const [environmentalData, setEnvironmentalData] = useState(null)
  const [error, setError] = useState('')
  const [showIrrigationModal, setShowIrrigationModal] = useState(false)
  const [geoPosition, setGeoPosition] = useState(null)

  // Step 1: Get geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoPosition({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
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
        setLoading(false)
      }
    )
  }, [])

  // Step 2: Fetch crop recommendations
  const fetchRecommendation = useCallback(async (irrigation) => {
    if (!geoPosition) return

    setLoading(true)

    try {
      const res = await fetch('/api/recommend-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: geoPosition.lat,
          lon: geoPosition.lon,
          irrigation,
        }),
      })

      const data = await res.json()
      setRecommendedCrops(data.recommendedCrops || [])
      setEnvironmentalData(data.environmentalData || null)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch data from server.')
      setLoading(false)
    }
  }, [geoPosition])

  const handleIrrigationSubmit = (value) => {
    setShowIrrigationModal(false)
    fetchRecommendation(value)
  }

  const handleIrrigationSkip = () => {
    setShowIrrigationModal(false)
    fetchRecommendation(null)
  }

  return (
    <div className="recommend-page">
      <main>
        <div className="recommend-container fade-up">
          <h1>Crop Recommendation System</h1>
          <p className="recommend-subtitle">
            We are fetching the best crops for your location based on environmental data.
          </p>

          {/* Loading spinner */}
          {loading && <div className="loader" />}

          {/* Error message */}
          {error && (
            <p className="error-message">⚠️ {error}</p>
          )}

          {/* Results */}
          {!loading && !error && recommendedCrops.length > 0 && (
            <div className="data-section fade-up">
              <div className="result-card">
                <h2>🌱 Recommended Crops</h2>
                <div className="crop-tags">
                  {recommendedCrops.map((crop, i) => (
                    <span key={i} className="crop-tag">{crop}</span>
                  ))}
                </div>
              </div>

              {environmentalData && (
                <div className="result-card env-card">
                  <h2>🌍 Environmental Data</h2>
                  <div className="env-grid">
                    {environmentalData.temperature != null && (
                      <div className="env-item">
                        <span className="env-label">Temperature</span>
                        <span className="env-value">{environmentalData.temperature.toFixed(1)}°C</span>
                      </div>
                    )}
                    {environmentalData.soilMoisture != null && (
                      <div className="env-item">
                        <span className="env-label">Soil Moisture</span>
                        <span className="env-value">{environmentalData.soilMoisture.toFixed(2)}%</span>
                      </div>
                    )}
                    {environmentalData.precipitation != null && (
                      <div className="env-item">
                        <span className="env-label">Precipitation</span>
                        <span className="env-value">{environmentalData.precipitation} mm</span>
                      </div>
                    )}
                    {environmentalData.evapotranspiration != null && (
                      <div className="env-item">
                        <span className="env-label">Evapotranspiration</span>
                        <span className="env-value">{environmentalData.evapotranspiration} mm</span>
                      </div>
                    )}
                    {environmentalData.irrigation != null && (
                      <div className="env-item">
                        <span className="env-label">Irrigation</span>
                        <span className="env-value">{environmentalData.irrigation} mm</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
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
