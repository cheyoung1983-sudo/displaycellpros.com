import React from "react";

interface BrandLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  layout?: "row" | "col";
  textColor?: string;
}

export function BrandLogo({
  className = "",
  size = 48,
  showText = true,
  layout = "row",
  textColor = "text-white"
}: BrandLogoProps) {
  // SVG representation of the premium Display Cell Pros circuit-checkmark logo
  const svgMarkup = (
    <svg
      viewBox="0 0 240 160"
      width={size * 1.5}
      height={size}
      className="select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background container grid lines (subtle lab look) */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#222530" strokeWidth="0.5" />
        </pattern>
        <radialGradient id="amberGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFBF00" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFBF00" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Grid Pattern behind */}
      <rect width="240" height="160" fill="url(#grid)" opacity="0.15" />

      {/* High-Fidelity Circuit board checkmark paths */}
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* Outer Silver Tracks (Main Logic Board Grid Ground Lines) */}
        <path
          d="M 115 30 L 115 40 L 126 51 M 121 30 L 121 39 L 136 54 Q 139 57 144 54 M 140 70 L 129 81 L 115 67 L 90 92 L 67 92"
          stroke="#475569"
          strokeWidth="2.5"
          opacity="0.85"
        />
        
        {/* Left Side Terminal Nodes with diagonal tracks */}
        <path
          d="M 120 40 L 98 62 L 73 62 M 115 50 L 94 71 L 67 71 M 120 60 L 105 75 L 85 75 L 75 85 L 67 85"
          stroke="#64748B"
          strokeWidth="2"
        />

        {/* Silicon Blue Active logic line */}
        <path
          d="M 130 95 L 115 110 L 90 110 L 78 122 L 78 130"
          stroke="#00BFFF"
          strokeWidth="3.2"
          strokeDasharray="40"
          strokeDashoffset="0"
          className="animate-[dash_8s_linear_infinite]"
        />

        {/* Forensic Amber Highlight Route (Symptom-to-Circuit Core Node Line) */}
        <path
          d="M 113 72 L 100 85 L 88 85"
          stroke="#FFBF00"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="88" cy="85" r="5" fill="#FFBF00" />
        <circle cx="88" cy="85" r="10" fill="url(#amberGlow)" />
        <circle cx="113" cy="72" r="4.5" fill="#FFBF00" />

        {/* Secondary grounding nodes (Small circle targets) */}
        <circle cx="67" cy="92" r="3.5" fill="#1e293b" stroke="#64748B" strokeWidth="1.5" />
        <circle cx="67" cy="71" r="3.5" fill="#1e293b" stroke="#64748B" strokeWidth="1.5" />
        <circle cx="67" cy="85" r="3.5" fill="#1e293b" stroke="#64748B" strokeWidth="1.5" />
        <circle cx="118" cy="110" r="3" fill="#00BFFF" />
        <circle cx="126" cy="51" r="3" fill="#64748B" />
        
        {/* Direct Loop Back Checkmark Nodes */}
        <circle cx="132" cy="110" r="3.5" fill="#64748B" />
        <circle cx="145" cy="100" r="3.5" fill="#64748B" />

        {/* Embedded Forensic Audit Teal checkmark lines (Premium Core Emblem) */}
        {/* This matches the checkmark grid route shown in the reference image */}
        <path
          d="M 103 98 L 122 119 L 168 51"
          stroke="#38BDF8"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.4"
        />
        <path
          d="M 103 98 L 122 119 L 168 51"
          stroke="#008080"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );

  if (!showText) {
    return <div className={`inline-flex items-center justify-center ${className}`}>{svgMarkup}</div>;
  }

  if (layout === "col") {
    return (
      <div className={`p-4 flex flex-col items-center justify-center text-center ${className}`}>
        {svgMarkup}
        <div className="mt-4 select-none">
          <span className={`font-sans font-bold text-2xl tracking-[0.16em] uppercase block ${textColor}`}>
            Display Cell Pros
          </span>
          <span className="text-[10px] font-mono font-extrabold text-[#00BFFF] tracking-[0.4em] uppercase block mt-1.5 pl-1 select-none">
            Silicon Forensic Lab
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {svgMarkup}
      <div className="select-none text-left">
        <span className={`font-sans font-extrabold text-lg tracking-[0.11em] uppercase block ${textColor} leading-none`}>
          Display Cell Pros
        </span>
        <span className="text-[9px] font-mono font-bold text-[#00BFFF] tracking-[0.25em] h-3.5 mt-1 block uppercase select-none leading-none">
          Silicon Forensic Lab
        </span>
      </div>
    </div>
  );
}
