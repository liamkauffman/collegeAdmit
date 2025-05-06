import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";

// Define the primary font (Roboto)
const primaryFont = Roboto({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

// Define the mono font (Roboto Mono)
const monoFont = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "CollegeCompass.AI - College Admissions Assistant",
  description: "Find your perfect college match with CollegeCompass.AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${primaryFont.variable} ${monoFont.variable} font-primary antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
