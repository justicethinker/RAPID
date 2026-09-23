interface GlobeDotMapProps {
  className?: string;
}

export function AfricaDotMap({ className }: GlobeDotMapProps) {
  return (
    <div className={className} aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <svg
        viewBox="0 0 420 420"
        className="w-full h-full"
        style={{
          filter: 'drop-shadow(0 0 18px rgba(21,230,160,.3))',
          maskImage: 'radial-gradient(circle at 50% 50%, black 35%, transparent 68%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 35%, transparent 68%)',
        }}
      >
        {/* Globe outline */}
        <circle cx="210" cy="210" r="170" fill="none" stroke="#15E6A0" strokeWidth="0.8" strokeOpacity="0.2" />

        {/* Latitude lines */}
        {[-60, -30, 0, 30, 60].map((lat) => {
          const r = 170 * Math.cos((lat * Math.PI) / 180);
          const cy = 210 - 170 * Math.sin((lat * Math.PI) / 180) * 0.94;
          return (
            <ellipse
              key={`lat-${lat}`}
              cx="210"
              cy={cy}
              rx={r}
              ry={r * 0.15}
              fill="none"
              stroke="#15E6A0"
              strokeWidth="0.6"
              strokeOpacity="0.18"
            />
          );
        })}

        {/* Longitude lines (ellipses at different angles) */}
        {[0, 30, 60, 90, 120, 150].map((lon) => (
          <ellipse
            key={`lon-${lon}`}
            cx="210"
            cy="210"
            rx={170 * Math.abs(Math.sin((lon * Math.PI) / 180))}
            ry="170"
            fill="none"
            stroke="#15E6A0"
            strokeWidth="0.6"
            strokeOpacity="0.18"
            transform={`rotate(${lon > 90 ? lon - 90 : 0} 210 210)`}
          />
        ))}

        {/* Dot grid on the globe surface */}
        {GLOBE_DOTS.map((dot, i) => (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={dot.r}
            fill="#15E6A0"
            fillOpacity={dot.opacity}
          />
        ))}
      </svg>

      {/* Nigeria marker with pulse */}
      <div className="absolute" style={{ left: '54%', top: '42%' }}>
        <div className="relative">
          <div className="h-3 w-3 rounded-full bg-brand-500 shadow-[0_0_14px_rgba(21,230,160,.9)]" />
          <div
            className="absolute inset-0 h-3 w-3 rounded-full border-2 border-brand-500/60"
            style={{ animation: 'pulseRing 2.6s ease-out 3' }}
          />
        </div>
      </div>
    </div>
  );
}

// Pre-computed dot positions for the globe
const GLOBE_DOTS: Array<{ x: number; y: number; r: number; opacity: number }> = [];

{
  const cx = 210, cy = 210, R = 165;
  const tiltDeg = 15; // tilt to show Africa prominently

  for (let lat = -75; lat <= 75; lat += 10) {
    for (let lon = -180; lon < 180; lon += 10) {
      const latR = ((lat + tiltDeg) * Math.PI) / 180;
      const lonR = (lon * Math.PI) / 180;

      // Rotate so Africa (lon ~20E) faces front
      const rotLon = lonR - (20 * Math.PI) / 180;

      const x3d = Math.cos(latR) * Math.sin(rotLon);
      const y3d = -Math.sin(latR);
      const z3d = Math.cos(latR) * Math.cos(rotLon);

      if (z3d > 0) {
        const edge = z3d;
        GLOBE_DOTS.push({
          x: parseFloat((cx + x3d * R).toFixed(1)),
          y: parseFloat((cy + y3d * R).toFixed(1)),
          r: parseFloat((1.2 + 0.8 * edge).toFixed(2)),
          opacity: parseFloat((0.15 + 0.7 * edge).toFixed(2)),
        });
      }
    }
  }
}
