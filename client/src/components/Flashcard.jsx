import './Flashcard.css'

export default function Flashcard({ title, fields, tip, loaded, data, className }) {
  return (
    <div className={`flashcard ${loaded ? 'appear' : ''} ${className || ''}`}>
      <h2>{title}</h2>
      {fields.map(field => (
        <p key={field.key}>
          {field.label}:{' '}
          <span
            className={loaded ? '' : 'skeleton skeleton-text'}
            style={loaded ? {} : { width: field.width || '100px' }}
          >
            {loaded ? (data?.[field.key] ?? '—') : ''}
          </span>
        </p>
      ))}
      {tip && (
        <p className="tip">
          {loaded ? (
            data?.[tip.key] ?? ''
          ) : (
            <span
              className="skeleton skeleton-text"
              style={{ width: tip.width || '65%' }}
            />
          )}
        </p>
      )}
    </div>
  )
}
