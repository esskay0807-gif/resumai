export default function ScoreGauge({ score, size = 120 }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 75 ? '#22c55e'
    : score >= 60 ? '#3b82f6'
    : score >= 45 ? '#f59e0b'
    : '#ef4444';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="score-ring -rotate-90"
      style={{ '--target-offset': offset }}
    >
      <circle
        cx="50" cy="50" r={radius}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="8"
      />
      <circle
        className="progress"
        cx="50" cy="50" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
      />
      <text
        x="50" y="50"
        textAnchor="middle"
        dominantBaseline="middle"
        className="rotate-90"
        style={{
          transform: 'rotate(90deg)',
          transformOrigin: '50px 50px',
          fontSize: '18px',
          fontWeight: 700,
          fill: color,
        }}
      >
        {score}
      </text>
    </svg>
  );
}
