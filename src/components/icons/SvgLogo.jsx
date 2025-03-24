import React from "react";
import Image from "next/image";

export function SvgLogo({ className, size = 40 }) {
  // Calculate height based on SVG aspect ratio (1280:1024 ≈ 5:4)
  const height = Math.round(size * 0.8);
  
  return (
    <div className={className} style={{ width: size, height: height }}>
      <Image
        src="/assets/CollegeAdmit.svg"
        alt="CollegeAdmit.AI Logo"
        width={size}
        height={height}
        style={{
          maxWidth: "100%",
          height: "auto",
          display: "block"
        }}
        priority
      />
    </div>
  );
} 