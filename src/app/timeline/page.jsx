import NavigationBar from "@/components/navigation-bar"

export default function TimelinePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F7F9F9] to-[#BED8D4]">
      <NavigationBar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-[#2081C3]">
            Admissions Timeline
          </h1>
          <p className="text-center text-[#2081C3]/80 mb-12 max-w-2xl mx-auto">
            Stay on track with your college application process.
            View important deadlines and milestones.
          </p>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-[#78D5D7]/30">
            <div className="flex flex-col space-y-6">
              {/* Timeline items */}
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-4 h-4 rounded-full bg-[#2081C3]"></div>
                  <div className="w-1 h-full bg-[#BED8D4]"></div>
                </div>
                <div className="bg-[#F7F9F9] p-4 rounded-lg border border-[#BED8D4] flex-1">
                  <h3 className="font-semibold text-[#2081C3]">August-September: College List</h3>
                  <p className="text-[#2081C3]/80">Finalize your college list and organize application requirements.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-4 h-4 rounded-full bg-[#78D5D7]"></div>
                  <div className="w-1 h-full bg-[#BED8D4]"></div>
                </div>
                <div className="bg-[#F7F9F9] p-4 rounded-lg border border-[#BED8D4] flex-1">
                  <h3 className="font-semibold text-[#2081C3]">October-November: Applications</h3>
                  <p className="text-[#2081C3]/80">Complete and submit early applications and prepare for regular decision.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-4 h-4 rounded-full bg-[#63D2FF]"></div>
                </div>
                <div className="bg-[#F7F9F9] p-4 rounded-lg border border-[#BED8D4] flex-1">
                  <h3 className="font-semibold text-[#2081C3]">December-January: Regular Applications</h3>
                  <p className="text-[#2081C3]/80">Submit remaining applications and complete financial aid forms.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 