import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './HomePage.css'

export default function HomePage() {
  const [crops, setCrops] = useState([])
  const [selectedCrop, setSelectedCrop] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/crops')
      .then(res => res.json())
      .then(data => {
        setCrops(data)
        if (data.length > 0) setSelectedCrop(data[0].name)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load crops:', err)
        setLoading(false)
      })
  }, [])

  const handleSubmit = () => {
    if (!selectedCrop) return
    navigate(`/dashboard?crop=${encodeURIComponent(selectedCrop)}`)
  }

  return (
    <div className="home-page">
      <h1 className="home-title fade-up">Welcome to Farm Manager</h1>

      <div className="home-container fade-up">
        <section className="crop-selection">
          <h1>Select Your Crop</h1>
          <p>Select the crop that you will get data based on.</p>

          {loading ? (
            <div className="dropdown skeleton skeleton-block" style={{ height: '56px' }} />
          ) : (
            <select
              id="crop-dropdown"
              className="dropdown"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              {crops.map(crop => (
                <option key={crop.name} value={crop.name}>
                  {crop.name}
                </option>
              ))}
            </select>
          )}
        </section>

        <button
          id="submit-crop-btn"
          type="button"
          onClick={handleSubmit}
          disabled={!selectedCrop}
          className="submit-btn"
        >
          Submit
        </button>
      </div>
    </div>
  )
}
