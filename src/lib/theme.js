// Theme configuration with the provided color palette
export const theme = {
  colors: {
    background: "#F7F9F9",     // Light background
    secondary: "#BED8D4",      // Soft teal
    accent: "#78D5D7",         // Bright teal
    highlight: "#63D2FF",      // Bright blue
    primary: "#4068ec",        // Deep blue
  }
}

// Tailwind CSS color mapping for consistent use
export const tailwindColors = {
  background: "bg-[#F7F9F9]",
  backgroundGradient: "from-[#F7F9F9] to-[#BED8D4]",
  secondary: "bg-[#BED8D4]",
  accent: "bg-[#78D5D7]",
  highlight: "bg-[#63D2FF]",
  primary: {
    blue: '#4068ec',
    cyan: '#63D2FF',
    teal: '#78D5D7',
    lightTeal: '#BED8D4',
    bg: '#F7F9F9'
  },
  
  // Text colors
  textPrimary: "text-[#4068ec]",
  textAccent: "text-[#78D5D7]",
  
  // Border colors
  borderPrimary: "border-[#4068ec]",
  borderAccent: "border-[#78D5D7]",
  
  // Hover states
  hoverPrimary: "hover:bg-[#4068ec]",
  hoverAccent: "hover:bg-[#78D5D7]",
} 