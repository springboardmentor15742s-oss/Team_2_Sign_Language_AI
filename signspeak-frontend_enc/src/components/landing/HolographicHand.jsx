import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export function HolographicHand() {
  const canvasRef = useRef(null);

  // Background star dust / ambient particles animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.6,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3 - 0.15,
      opacity: Math.random() * 0.7 + 0.2,
      color: Math.random() > 0.4 ? '#20d8d3' : (Math.random() > 0.5 ? '#a855f7' : '#38bdf8'),
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-[500px] lg:max-w-[540px] mx-auto select-none flex items-center justify-center">
      {/* Background canvas for floating ambient neon particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Atmospheric neon glowing nebulae */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-cyan-500/20 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-600/25 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-64 h-64 rounded-full bg-blue-600/20 blur-[80px] pointer-events-none" />

      {/* Main floating container */}
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-full h-full flex items-center justify-center z-10"
      >
        {/* Holographic Pedestal at the base */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[300px] h-[75px] pointer-events-none">
          {/* Base vertical light beam */}
          <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-44 h-48 bg-gradient-to-t from-cyan-500/30 via-purple-500/15 to-transparent blur-xl" />

          {/* Outer glowing floor ring */}
          <div className="absolute inset-0 rounded-[100%] border-2 border-cyan-400/60 shadow-[0_0_35px_rgba(32,216,211,0.55)] scale-y-50" />
          {/* Inner purple glow ring */}
          <div className="absolute inset-2 rounded-[100%] border border-purple-500/70 shadow-[0_0_25px_rgba(168,85,247,0.5)] scale-y-50" />
          {/* Center core emitter */}
          <div className="absolute inset-5 rounded-[100%] bg-gradient-to-r from-cyan-400/30 via-blue-500/40 to-purple-500/30 blur-md scale-y-50" />
        </div>

        {/* 3D Tilted Orbital Scanner Rings around the hand */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[440px] h-[170px] -rotate-12 pointer-events-none"
        >
          <svg viewBox="0 0 440 170" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="orbitGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#20d8d3" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            <ellipse
              cx="220"
              cy="85"
              rx="210"
              ry="75"
              fill="none"
              stroke="url(#orbitGrad1)"
              strokeWidth="1.8"
              strokeDasharray="10 8"
              className="drop-shadow-[0_0_14px_rgba(32,216,211,0.6)]"
            />
            <circle cx="25" cy="85" r="3.5" fill="#20d8d3" className="drop-shadow-[0_0_8px_#20d8d3]" />
            <circle cx="415" cy="85" r="4" fill="#a855f7" className="drop-shadow-[0_0_8px_#a855f7]" />
          </svg>
        </motion.div>

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[390px] h-[145px] rotate-8 pointer-events-none"
        >
          <svg viewBox="0 0 390 145" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="orbitGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#20d8d3" stopOpacity="0.75" />
              </linearGradient>
            </defs>
            <ellipse
              cx="195"
              cy="72"
              rx="185"
              ry="62"
              fill="none"
              stroke="url(#orbitGrad2)"
              strokeWidth="1.3"
              strokeDasharray="6 12"
              className="drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
            />
            <circle cx="195" cy="10" r="2.5" fill="#20d8d3" className="drop-shadow-[0_0_6px_#20d8d3]" />
          </svg>
        </motion.div>

        {/* 3D Cybernetic Holographic Wireframe Hand */}
        <div className="relative w-[320px] h-[430px] flex items-center justify-center">
          <svg
            viewBox="0 0 320 430"
            className="w-full h-full overflow-visible drop-shadow-[0_0_40px_rgba(32,216,211,0.5)]"
          >
            <defs>
              {/* Hand wireframe linear and radial gradients */}
              <linearGradient id="meshGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#8b5cf6" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#20d8d3" stopOpacity="1.0" />
              </linearGradient>

              <linearGradient id="handGlowBody" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#312e81" stopOpacity="0.15" />
                <stop offset="40%" stopColor="#6b21a8" stopOpacity="0.2" />
                <stop offset="80%" stopColor="#0891b2" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.35" />
              </linearGradient>

              <linearGradient id="facetGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#20d8d3" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.08" />
              </linearGradient>

              <linearGradient id="facetGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.08" />
              </linearGradient>

              <filter id="handGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Hand Silhouette Silhouette Base for solid 3D feel */}
            <path
              d="M 125,390
                 C 125,360 115,310 110,270
                 C 100,240 70,225 45,185
                 C 35,170 38,150 48,145
                 C 58,140 75,160 90,195
                 C 95,205 105,215 112,215
                 C 112,180 115,90 120,40
                 C 122,25 138,25 142,40
                 C 145,80 148,150 148,190
                 C 152,190 156,155 160,140
                 C 164,130 178,130 180,142
                 C 180,165 178,190 178,200
                 C 182,195 186,160 190,150
                 C 194,140 208,140 210,152
                 C 210,175 208,205 208,220
                 C 212,215 235,130 248,70
                 C 252,55 268,60 266,78
                 C 258,135 240,210 230,265
                 C 220,310 205,360 205,390
                 Z"
              fill="url(#handGlowBody)"
            />

            {/* Polygonal Mesh Facets */}
            {/* Forearm & Wrist */}
            <polygon points="125,390 165,330 205,390" fill="url(#facetGrad1)" />
            <polygon points="125,390 165,330 115,320" fill="url(#facetGrad2)" />
            <polygon points="205,390 165,330 215,320" fill="url(#facetGrad1)" />

            {/* Palm Base & Center */}
            <polygon points="115,320 165,330 140,250" fill="url(#facetGrad1)" />
            <polygon points="165,330 215,320 190,250" fill="url(#facetGrad2)" />
            <polygon points="140,250 165,330 190,250" fill="url(#facetGrad1)" />
            <polygon points="115,320 140,250 90,240" fill="url(#facetGrad2)" />
            <polygon points="215,320 190,250 230,245" fill="url(#facetGrad1)" />

            {/* Mid Palm to Knuckles */}
            <polygon points="140,250 190,250 165,195" fill="url(#facetGrad2)" />
            <polygon points="90,240 140,250 120,205" fill="url(#facetGrad1)" />
            <polygon points="140,250 165,195 130,195" fill="url(#facetGrad2)" />
            <polygon points="165,195 190,250 200,195" fill="url(#facetGrad1)" />
            <polygon points="190,250 230,245 225,200" fill="url(#facetGrad2)" />

            {/* Thumb (Extended Outward Left) */}
            <polygon points="90,240 70,195 50,150" fill="url(#facetGrad1)" />
            <polygon points="90,240 120,205 70,195" fill="url(#facetGrad2)" />
            <polygon points="70,195 50,150 45,145" fill="url(#facetGrad1)" />

            {/* Index Finger (Extended Straight Up) */}
            <polygon points="120,205 130,195 125,140" fill="url(#facetGrad1)" />
            <polygon points="130,195 140,140 125,140" fill="url(#facetGrad2)" />
            <polygon points="125,140 140,140 126,85" fill="url(#facetGrad1)" />
            <polygon points="140,140 138,85 126,85" fill="url(#facetGrad2)" />
            <polygon points="126,85 138,85 131,35" fill="url(#facetGrad1)" />

            {/* Middle Finger (Curled Inward) */}
            <polygon points="130,195 165,195 150,150" fill="url(#facetGrad2)" />
            <polygon points="150,150 165,195 160,150" fill="url(#facetGrad1)" />
            <polygon points="150,150 160,150 155,175" fill="url(#facetGrad2)" />

            {/* Ring Finger (Curled Inward) */}
            <polygon points="165,195 200,195 180,155" fill="url(#facetGrad1)" />
            <polygon points="180,155 200,195 195,155" fill="url(#facetGrad2)" />
            <polygon points="180,155 195,155 188,180" fill="url(#facetGrad1)" />

            {/* Pinky Finger (Extended Upward Right) */}
            <polygon points="200,195 225,200 220,150" fill="url(#facetGrad2)" />
            <polygon points="225,200 240,150 220,150" fill="url(#facetGrad1)" />
            <polygon points="220,150 240,150 238,100" fill="url(#facetGrad2)" />
            <polygon points="240,150 252,100 238,100" fill="url(#facetGrad1)" />
            <polygon points="238,100 252,100 255,60" fill="url(#facetGrad1)" />

            {/* Glowing Wireframe Mesh Lines */}
            <g stroke="url(#meshGradient)" strokeWidth="1.6" fill="none" filter="url(#handGlow)">
              {/* Forearm & Wrist */}
              <line x1="125" y1="390" x2="165" y2="330" />
              <line x1="165" y1="330" x2="205" y2="390" />
              <line x1="125" y1="390" x2="205" y2="390" />
              <line x1="115" y1="320" x2="165" y2="330" />
              <line x1="165" y1="330" x2="215" y2="320" />
              <line x1="115" y1="320" x2="125" y2="390" />
              <line x1="215" y1="320" x2="205" y2="390" />

              {/* Palm Net */}
              <line x1="115" y1="320" x2="140" y2="250" />
              <line x1="165" y1="330" x2="140" y2="250" />
              <line x1="165" y1="330" x2="190" y2="250" />
              <line x1="215" y1="320" x2="190" y2="250" />
              <line x1="140" y1="250" x2="190" y2="250" />
              <line x1="115" y1="320" x2="90" y2="240" />
              <line x1="90" y1="240" x2="140" y2="250" />
              <line x1="215" y1="320" x2="230" y2="245" />
              <line x1="190" y1="250" x2="230" y2="245" />
              <line x1="140" y1="250" x2="165" y2="195" />
              <line x1="190" y1="250" x2="165" y2="195" />

              {/* Thumb */}
              <line x1="90" y1="240" x2="70" y2="195" />
              <line x1="120" y1="205" x2="70" y2="195" />
              <line x1="70" y1="195" x2="50" y2="150" />
              <line x1="50" y1="150" x2="45" y2="145" />

              {/* Index Finger */}
              <line x1="120" y1="205" x2="130" y2="195" />
              <line x1="120" y1="205" x2="125" y2="140" />
              <line x1="130" y1="195" x2="140" y2="140" />
              <line x1="125" y1="140" x2="140" y2="140" />
              <line x1="125" y1="140" x2="126" y2="85" />
              <line x1="140" y1="140" x2="138" y2="85" />
              <line x1="126" y1="85" x2="138" y2="85" />
              <line x1="126" y1="85" x2="131" y2="35" />
              <line x1="138" y1="85" x2="131" y2="35" />

              {/* Middle Finger (Curled) */}
              <line x1="130" y1="195" x2="165" y2="195" />
              <line x1="130" y1="195" x2="150" y2="150" />
              <line x1="165" y1="195" x2="160" y2="150" />
              <line x1="150" y1="150" x2="160" y2="150" />
              <line x1="150" y1="150" x2="155" y2="175" />
              <line x1="160" y1="150" x2="155" y2="175" />

              {/* Ring Finger (Curled) */}
              <line x1="165" y1="195" x2="200" y2="195" />
              <line x1="165" y1="195" x2="180" y2="155" />
              <line x1="200" y1="195" x2="195" y2="155" />
              <line x1="180" y1="155" x2="195" y2="155" />
              <line x1="180" y1="155" x2="188" y2="180" />
              <line x1="195" y1="155" x2="188" y2="180" />

              {/* Pinky Finger */}
              <line x1="200" y1="195" x2="225" y2="200" />
              <line x1="200" y1="195" x2="220" y2="150" />
              <line x1="225" y1="200" x2="240" y2="150" />
              <line x1="220" y1="150" x2="240" y2="150" />
              <line x1="220" y1="150" x2="238" y2="100" />
              <line x1="240" y1="150" x2="252" y2="100" />
              <line x1="238" y1="100" x2="252" y2="100" />
              <line x1="238" y1="100" x2="255" y2="60" />
              <line x1="252" y1="100" x2="255" y2="60" />
            </g>

            {/* Glowing Landmark Nodes */}
            {[
              { x: 165, y: 330, r: 4, c: '#a855f7' },
              { x: 115, y: 320, r: 3.5, c: '#818cf8' },
              { x: 215, y: 320, r: 3.5, c: '#818cf8' },
              { x: 140, y: 250, r: 4, c: '#20d8d3' },
              { x: 190, y: 250, r: 4, c: '#06b6d4' },
              { x: 90, y: 240, r: 3.5, c: '#38bdf8' },
              { x: 230, y: 245, r: 3.5, c: '#a855f7' },
              { x: 70, y: 195, r: 3.5, c: '#20d8d3' },
              { x: 50, y: 150, r: 4, c: '#20d8d3' },
              { x: 45, y: 145, r: 5.5, c: '#20d8d3', isTip: true }, // Thumb Tip
              { x: 120, y: 205, r: 3.5, c: '#06b6d4' },
              { x: 130, y: 195, r: 3.5, c: '#06b6d4' },
              { x: 125, y: 140, r: 3.5, c: '#20d8d3' },
              { x: 140, y: 140, r: 3.5, c: '#20d8d3' },
              { x: 126, y: 85, r: 4, c: '#20d8d3' },
              { x: 138, y: 85, r: 4, c: '#20d8d3' },
              { x: 131, y: 35, r: 6.5, c: '#20d8d3', isTip: true }, // Index Tip
              { x: 155, y: 175, r: 4, c: '#c084fc' }, // Middle Tip
              { x: 188, y: 180, r: 4, c: '#c084fc' }, // Ring Tip
              { x: 220, y: 150, r: 3.5, c: '#a855f7' },
              { x: 240, y: 150, r: 3.5, c: '#c084fc' },
              { x: 238, y: 100, r: 3.5, c: '#20d8d3' },
              { x: 252, y: 100, r: 3.5, c: '#20d8d3' },
              { x: 255, y: 60, r: 6, c: '#20d8d3', isTip: true }, // Pinky Tip
            ].map((node, i) => (
              <g key={i}>
                {node.isTip && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r + 5}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    opacity="0.85"
                    className="animate-ping"
                    style={{ transformOrigin: `${node.x}px ${node.y}px`, animationDuration: '2.8s' }}
                  />
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r}
                  fill={node.c}
                  className="drop-shadow-[0_0_10px_#20d8d3]"
                />
                <circle cx={node.x} cy={node.y} r={node.r * 0.45} fill="#ffffff" />
              </g>
            ))}
          </svg>
        </div>

        {/* Floating Holographic Letter Badges (A, B, C) */}
        {/* Orb A (Top Right) */}
        <motion.div
          animate={{ y: [-6, 6, -6], x: [-3, 3, -3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-12 right-2 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-600/40 border border-cyan-400/60 backdrop-blur-md flex items-center justify-center shadow-[0_0_25px_rgba(32,216,211,0.55)] cursor-pointer group"
        >
          <div className="absolute inset-1 rounded-full border border-white/20" />
          <span className="text-lg sm:text-2xl font-extrabold text-white font-display drop-shadow-[0_0_10px_#20d8d3] group-hover:scale-110 transition-transform">
            A
          </span>
        </motion.div>

        {/* Orb B (Middle Right) */}
        <motion.div
          animate={{ y: [6, -6, 6], x: [2, -2, 2] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-1/2 -right-3 sm:right-1 w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-gradient-to-br from-teal-400/30 to-cyan-600/40 border border-teal-300/60 backdrop-blur-md flex items-center justify-center shadow-[0_0_25px_rgba(20,201,197,0.55)] cursor-pointer group"
        >
          <div className="absolute inset-1 rounded-full border border-white/20" />
          <span className="text-lg sm:text-2xl font-extrabold text-white font-display drop-shadow-[0_0_10px_#20d8d3] group-hover:scale-110 transition-transform">
            B
          </span>
        </motion.div>

        {/* Orb C (Bottom Right) */}
        <motion.div
          animate={{ y: [-5, 7, -5], x: [-3, 2, -3] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-20 right-2 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-600/40 border border-cyan-400/60 backdrop-blur-md flex items-center justify-center shadow-[0_0_25px_rgba(32,216,211,0.55)] cursor-pointer group"
        >
          <div className="absolute inset-1 rounded-full border border-white/20" />
          <span className="text-lg sm:text-2xl font-extrabold text-white font-display drop-shadow-[0_0_10px_#20d8d3] group-hover:scale-110 transition-transform">
            C
          </span>
        </motion.div>

        {/* Mini Orb A (Bottom Left Orbit) */}
        <motion.div
          animate={{ y: [4, -4, 4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute bottom-24 left-4 sm:left-10 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/30 border border-cyan-400/40 backdrop-blur-sm flex items-center justify-center shadow-[0_0_15px_rgba(32,216,211,0.4)]"
        >
          <span className="text-xs font-bold text-cyan-300">A</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
