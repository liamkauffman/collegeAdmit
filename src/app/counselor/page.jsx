import NavigationBar from "@/components/navigation-bar"

export default function CounselorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F7F9F9] to-[#BED8D4]">
      <NavigationBar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-[#2081C3]">
            Counselor Connect
          </h1>
          <p className="text-center text-[#2081C3]/80 mb-12 max-w-2xl mx-auto">
            Connect with experienced college admissions counselors.
            Get personalized guidance for your college journey.
          </p>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-[#78D5D7]/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Counselor Cards */}
              <div className="bg-[#F7F9F9] rounded-lg overflow-hidden shadow-md border border-[#BED8D4] flex flex-col">
                <div className="h-48 bg-[#63D2FF]/20"></div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-[#2081C3] text-lg">Dr. Sarah Johnson</h3>
                  <p className="text-[#2081C3]/70 text-sm mb-2">Former Admissions Officer, Harvard University</p>
                  <p className="text-[#2081C3]/80 text-sm flex-1">Specializes in Ivy League applications and STEM-focused students.</p>
                  <button className="mt-4 w-full py-2 bg-[#2081C3] text-white rounded-md hover:bg-[#2081C3]/90 transition-colors">
                    Book Session
                  </button>
                </div>
              </div>
              
              <div className="bg-[#F7F9F9] rounded-lg overflow-hidden shadow-md border border-[#BED8D4] flex flex-col">
                <div className="h-48 bg-[#78D5D7]/20"></div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-[#2081C3] text-lg">Michael Rodriguez</h3>
                  <p className="text-[#2081C3]/70 text-sm mb-2">College Counselor, 15+ years experience</p>
                  <p className="text-[#2081C3]/80 text-sm flex-1">Focuses on finding the best financial aid packages and scholarships.</p>
                  <button className="mt-4 w-full py-2 bg-[#2081C3] text-white rounded-md hover:bg-[#2081C3]/90 transition-colors">
                    Book Session
                  </button>
                </div>
              </div>
              
              <div className="bg-[#F7F9F9] rounded-lg overflow-hidden shadow-md border border-[#BED8D4] flex flex-col">
                <div className="h-48 bg-[#BED8D4]/40"></div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-[#2081C3] text-lg">Dr. Emily Chen</h3>
                  <p className="text-[#2081C3]/70 text-sm mb-2">Essay Specialist & Former English Professor</p>
                  <p className="text-[#2081C3]/80 text-sm flex-1">Expert in crafting compelling personal statements and supplemental essays.</p>
                  <button className="mt-4 w-full py-2 bg-[#2081C3] text-white rounded-md hover:bg-[#2081C3]/90 transition-colors">
                    Book Session
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-[#F7F9F9] rounded-lg border border-[#BED8D4]">
              <h3 className="font-semibold text-[#2081C3] text-lg mb-4">How It Works</h3>
              <ol className="space-y-3 text-[#2081C3]/80">
                <li className="flex items-start">
                  <span className="bg-[#63D2FF] text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 shrink-0">1</span>
                  <span>Browse our counselor profiles and select the expert that matches your needs.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-[#78D5D7] text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 shrink-0">2</span>
                  <span>Schedule a 30-minute or 60-minute video consultation at a time that works for you.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-[#2081C3] text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 shrink-0">3</span>
                  <span>Receive personalized guidance and a follow-up action plan after your session.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 