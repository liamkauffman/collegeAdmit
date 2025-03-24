import NavigationBar from "@/components/navigation-bar"
import { Building2, Calendar, CheckCircle } from "lucide-react"

export default function CounselorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F7F9F9] to-[#BED8D4]/30">
      <NavigationBar />
      <main className="flex-1 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#4068ec] to-[#63D2FF]">
            Meet Our College Counselors
          </h1>
          <p className="text-center text-[#4068ec]/70 dark:text-[#63D2FF]/70 mb-10 sm:mb-12 max-w-2xl mx-auto">
            Connect with experienced college admissions counselors.
            Get personalized guidance for your college journey.
          </p>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8 border border-[#78D5D7]/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Counselor Cards */}
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-[#BED8D4]/50 transition-shadow hover:shadow-lg">
                <div className="h-48 bg-gradient-to-br from-[#4068ec]/10 to-[#63D2FF]/10 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#4068ec] to-[#63D2FF] flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-xl text-[#4068ec] mb-1">Dr. Sarah Johnson</h3>
                  <p className="text-[#4068ec]/70 text-sm mb-3">Former Admissions Officer, Harvard University</p>
                  <p className="text-[#4068ec]/80 text-sm flex-1 mb-4">Specializes in Ivy League applications and STEM-focused students.</p>
                  <button className="w-full py-2.5 bg-gradient-to-r from-[#4068ec] to-[#63D2FF] text-white rounded-lg hover:from-[#4068ec]/90 hover:to-[#63D2FF]/90 transition-all shadow">
                    Book Session
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-[#BED8D4]/50 transition-shadow hover:shadow-lg">
                <div className="h-48 bg-gradient-to-br from-[#4068ec]/10 to-[#63D2FF]/10 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#4068ec] to-[#63D2FF] flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-xl text-[#4068ec] mb-1">Michael Rodriguez</h3>
                  <p className="text-[#4068ec]/70 text-sm mb-3">College Counselor, 15+ years experience</p>
                  <p className="text-[#4068ec]/80 text-sm flex-1 mb-4">Focuses on finding the best financial aid packages and scholarships.</p>
                  <button className="w-full py-2.5 bg-gradient-to-r from-[#4068ec] to-[#63D2FF] text-white rounded-lg hover:from-[#4068ec]/90 hover:to-[#63D2FF]/90 transition-all shadow">
                    Book Session
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-[#BED8D4]/50 transition-shadow hover:shadow-lg">
                <div className="h-48 bg-gradient-to-br from-[#4068ec]/10 to-[#63D2FF]/10 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#4068ec] to-[#63D2FF] flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-xl text-[#4068ec] mb-1">Dr. Emily Chen</h3>
                  <p className="text-[#4068ec]/70 text-sm mb-3">Essay Specialist & Former English Professor</p>
                  <p className="text-[#4068ec]/80 text-sm flex-1 mb-4">Expert in crafting compelling personal statements and supplemental essays.</p>
                  <button className="w-full py-2.5 bg-gradient-to-r from-[#4068ec] to-[#63D2FF] text-white rounded-lg hover:from-[#4068ec]/90 hover:to-[#63D2FF]/90 transition-all shadow">
                    Book Session
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-10 p-6 bg-white rounded-xl shadow-md border border-[#BED8D4]/50">
              <h3 className="font-semibold text-xl text-[#4068ec] mb-5">How It Works</h3>
              <ol className="space-y-5">
                <li className="flex items-start">
                  <span className="bg-gradient-to-r from-[#4068ec] to-[#63D2FF] text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 shrink-0 shadow-sm">1</span>
                  <div>
                    <h4 className="font-medium text-[#4068ec] mb-1">Browse Counselors</h4>
                    <p className="text-[#4068ec]/80">Browse our counselor profiles and select the expert that matches your needs.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-gradient-to-r from-[#4068ec] to-[#63D2FF] text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 shrink-0 shadow-sm">2</span>
                  <div>
                    <h4 className="font-medium text-[#4068ec] mb-1">Schedule a Session</h4>
                    <p className="text-[#4068ec]/80">Schedule a 30-minute or 60-minute video consultation at a time that works for you.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-gradient-to-r from-[#4068ec] to-[#63D2FF] text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 shrink-0 shadow-sm">3</span>
                  <div>
                    <h4 className="font-medium text-[#4068ec] mb-1">Get Personalized Guidance</h4>
                    <p className="text-[#4068ec]/80">Receive personalized guidance and a follow-up action plan after your session.</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 