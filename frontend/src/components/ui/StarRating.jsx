import { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * Accessible star rating. In interactive mode it behaves like a radio group:
 * arrow keys move the selection, Enter/Space confirms, and each star is a
 * real focusable button with an accessible label.
 */
export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = 20,
  showValue = false,
}) {
  const [hovered, setHovered] = useState(null);
  const displayValue = hovered ?? value;

  if (readOnly) {
    return (
      <div className="inline-flex items-center gap-1" aria-label={`Rated ${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= Math.round(value) ? 'fill-primary text-primary' : 'text-border'}
          />
        ))}
        {showValue && <span className="ml-1 text-sm text-muted">{value ? value.toFixed(1) : '—'}</span>}
      </div>
    );
  }

  const handleKeyDown = (e, star) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(5, star + 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(1, star - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(star);
    }
  };

  return (
    <div role="radiogroup" aria-label="Rating" className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          className="focus-ring rounded p-0.5 transition-transform hover:scale-110"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(star)}
          onKeyDown={(e) => handleKeyDown(e, star)}
        >
          <Star
            size={size}
            className={star <= displayValue ? 'fill-primary text-primary' : 'text-border'}
          />
        </button>
      ))}
    </div>
  );
}
