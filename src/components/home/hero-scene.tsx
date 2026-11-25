/**
 * Original flat-vector coastal landscape for the hero: hills, a lighthouse, two
 * palms and a winding road. Day and night variants swap with the theme.
 */
export function HeroScene({ label }: { label: string }) {
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 800 560"
      preserveAspectRatio="xMaxYMid slice"
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="hs-sky-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dff1ff" />
          <stop offset="1" stopColor="#f6fbff" />
        </linearGradient>
        <linearGradient id="hs-sky-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#07121a" />
          <stop offset="1" stopColor="#12303f" />
        </linearGradient>
      </defs>
      <g className="dark:hidden">
        <rect width="800" height="560" fill="url(#hs-sky-day)" />
        <circle cx="610" cy="120" r="46" fill="#fff6d6" />
      </g>
      <g className="hidden dark:block">
        <rect width="800" height="560" fill="url(#hs-sky-night)" />
        <path d="M600 90a40 40 0 1 0 40 56 32 32 0 1 1-40-56z" fill="#f4f1d0" />
        <g fill="#f4f1d0">
          <circle cx="420" cy="70" r="2" />
          <circle cx="500" cy="130" r="1.5" />
          <circle cx="720" cy="60" r="2" />
          <circle cx="330" cy="150" r="1.5" />
        </g>
      </g>
      {/* Sea band */}
      <rect
        y="300"
        width="800"
        height="70"
        className="fill-[#9bd4f5] dark:fill-[#17475f]"
      />
      {/* Hills */}
      <path
        d="M0 360C120 300 240 320 360 350S600 330 800 300V560H0z"
        className="fill-[#b7e39a] dark:fill-[#1e4a3a]"
      />
      <path
        d="M0 420C160 360 300 400 460 390S700 370 800 380V560H0z"
        className="fill-[#7ed956] dark:fill-[#2b6a45]"
      />
      <path
        d="M0 480C200 440 380 470 560 455S740 450 800 460V560H0z"
        className="fill-[#4fb34a] dark:fill-[#245a3b]"
      />
      {/* Lighthouse */}
      <g transform="translate(250 235)">
        <path
          d="M-14 100l8-80h12l8 80z"
          className="fill-white dark:fill-[#d7e6ee]"
        />
        <path d="M-11 60h22l-1.5 14h-19z" className="fill-[#e5484d]" />
        <rect x="-10" y="8" width="20" height="14" className="fill-[#0b2a45]" />
        <path d="M-12 8l12-14 12 14z" className="fill-[#e5484d]" />
        <circle cx="0" cy="15" r="3" className="fill-[#ffe28a]" />
      </g>
      {/* Winding road */}
      <path
        d="M800 560C700 500 560 470 480 440S330 420 240 400S60 400 0 410V440C80 430 200 440 300 470S520 520 600 560z"
        className="fill-[#3f434c]"
      />
      <path
        d="M760 560C680 515 550 485 470 456S320 436 230 418S60 420 0 426"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeDasharray="14 12"
      />
      {/* Palms */}
      <g className="fill-[#2f7d3a] dark:fill-[#1a4a2b]">
        <path
          d="M700 330c4 60 2 120-4 190h10c4-70 2-130-6-190z"
          className="fill-[#7a5a3a]"
        />
        <path d="M703 330c-40-10-70 10-85 40 30-20 60-25 85-40zM703 330c40-10 70 10 85 40-30-20-60-25-85-40zM703 330c-20-35-55-45-85-30 30 0 60 12 85 30zM703 330c20-35 55-45 85-30-30 0-60 12-85 30zM703 330c0-30 10-55 25-70-25 15-30 40-25 70z" />
      </g>
      <g
        className="fill-[#2f7d3a] dark:fill-[#1a4a2b]"
        transform="translate(-70 70) scale(.9)"
      >
        <path
          d="M700 330c4 60 2 120-4 190h10c4-70 2-130-6-190z"
          className="fill-[#7a5a3a]"
        />
        <path d="M703 330c-40-10-70 10-85 40 30-20 60-25 85-40zM703 330c40-10 70 10 85 40-30-20-60-25-85-40zM703 330c-20-35-55-45-85-30 30 0 60 12 85 30zM703 330c20-35 55-45 85-30-30 0-60 12-85 30z" />
      </g>
    </svg>
  );
}
