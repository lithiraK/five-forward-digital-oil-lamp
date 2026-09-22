// Hardware-accelerated CSS animations replace framer-motion to save CPU

export function EnergyOrbits() {
  return (
    <div className="energy-orbits-container">
      <svg
        width="100%"
        height="100%"
        viewBox="-500 -500 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Inner Orbit (Purple Base) */}
        <g style={{ transformOrigin: 'center', transform: 'rotate(0deg)' }}>
          <ellipse
            cx="0"
            cy="0"
            rx="340"
            ry="240"
            fill="none"
            stroke="rgba(160, 42, 152, 0.25)"
            strokeWidth="1.5"
            style={{ transformOrigin: 'center', animation: 'spinOrbit 140s linear infinite' }}
          />
        </g>
        
        {/* Inner Orbit (Gold Stream) */}
        <g style={{ transformOrigin: 'center', transform: 'rotate(45deg)' }}>
          <ellipse
            cx="0"
            cy="0"
            rx="340"
            ry="240"
            fill="none"
            stroke="rgba(212, 175, 55, 0.85)"
            strokeWidth="3.5" /* slightly thicker to compensate for removed shadow */
            strokeDasharray="4 20 60 100 3000"
            style={{ transformOrigin: 'center', animation: 'spinOrbit 70s linear infinite' }}
          />
        </g>

        {/* Mid Orbit (Purple Base) */}
        <g style={{ transformOrigin: 'center', transform: 'rotate(60deg)' }}>
          <ellipse
            cx="0"
            cy="0"
            rx="440"
            ry="320"
            fill="none"
            stroke="rgba(160, 42, 152, 0.15)"
            strokeWidth="1.5"
            style={{ transformOrigin: 'center', animation: 'spinOrbitReverse 180s linear infinite' }}
          />
        </g>

        {/* Mid Orbit (Gold Stream) */}
        <g style={{ transformOrigin: 'center', transform: 'rotate(-60deg)' }}>
          <ellipse
            cx="0"
            cy="0"
            rx="440"
            ry="320"
            fill="none"
            stroke="rgba(212, 175, 55, 0.7)"
            strokeWidth="4"
            strokeDasharray="6 15 50 40 120 4000"
            style={{ transformOrigin: 'center', animation: 'spinOrbitReverse 90s linear infinite' }}
          />
        </g>

        {/* Outer Orbit (Faint Purple) */}
        <g style={{ transformOrigin: 'center', transform: 'rotate(120deg)' }}>
          <ellipse
            cx="0"
            cy="0"
            rx="540"
            ry="400"
            fill="none"
            stroke="rgba(160, 42, 152, 0.1)"
            strokeWidth="1"
            style={{ transformOrigin: 'center', animation: 'spinOrbit 240s linear infinite' }}
          />
        </g>

        {/* Outer Orbit (Fast Gold Stream) */}
        <g style={{ transformOrigin: 'center', transform: 'rotate(180deg)' }}>
          <ellipse
            cx="0"
            cy="0"
            rx="540"
            ry="400"
            fill="none"
            stroke="rgba(212, 175, 55, 0.5)"
            strokeWidth="2.5"
            strokeDasharray="3 10 30 50 5000"
            style={{ transformOrigin: 'center', animation: 'spinOrbit 60s linear infinite' }}
          />
        </g>
      </svg>
    </div>
  );
}
