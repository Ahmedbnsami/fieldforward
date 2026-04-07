import { useState } from 'react'
import './IrrigationModal.css'

export default function IrrigationModal({ onSubmit, onSkip }) {
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(value.trim() === '' ? null : Number(value))
  }

  const handleSkip = () => {
    onSkip()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card fade-up">
        <div className="modal-icon">💧</div>
        <h2 className="modal-title">Irrigation Input</h2>
        <p className="modal-description">
          Enter your irrigation value in millimeters. Skip if you have no irrigation data.
        </p>
        <form onSubmit={handleSubmit} className="modal-form">
          <input
            type="number"
            className="modal-input"
            placeholder="e.g. 250"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            min="0"
            step="any"
            autoFocus
          />
          <div className="modal-actions">
            <button type="submit" className="modal-btn modal-btn-primary">
              Submit
            </button>
            <button type="button" className="modal-btn modal-btn-secondary" onClick={handleSkip}>
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
