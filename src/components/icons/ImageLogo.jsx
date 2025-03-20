import React from "react";
import Image from "next/image";

export function ImageLogo({ className, size = 32 }) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Image
        src="/assets/TempLogo.png"
        alt="CollegeAdmit.AI Logo"
        width={size}
        height={size}
        priority
      />
    </div>
  );
} 