import NavigationBar from "@/components/navigation-bar"

export default function TimelinePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F7F9F9] to-[#BED8D4]/30">
      <NavigationBar />
      <main className="flex-1 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#4068ec] to-[#63D2FF]">
            Admissions Timeline
          </h1>
          <p className="text-center text-[#4068ec]/70 dark:text-[#63D2FF]/70 mb-10 sm:mb-12 max-w-2xl mx-auto">
            Stay on track with your college application process.
            View important deadlines and milestones.
          </p>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8 border border-[#78D5D7]/30">
            <div className="flex flex-col space-y-8">
              {/* Timeline items */}
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#4068ec] to-[#63D2FF] flex items-center justify-center">
                    <span className="text-white text-xs font-medium">1</span>
                  </div>
                  <div className="w-1 h-full bg-gradient-to-b from-[#4068ec]/30 to-[#BED8D4]"></div>
                </div>
                <div className="bg-white rounded-lg shadow-md border border-[#BED8D4]/50 p-5 flex-1">
                  <h3 className="font-semibold text-xl text-[#4068ec] mb-2">August-September: College List</h3>
                  <p className="text-[#4068ec]/80">Finalize your college list and organize application requirements.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#4068ec] to-[#63D2FF] flex items-center justify-center">
                    <span className="text-white text-xs font-medium">2</span>
                  </div>
                  <div className="w-1 h-full bg-gradient-to-b from-[#4068ec]/30 to-[#BED8D4]"></div>
                </div>
                <div className="bg-white rounded-lg shadow-md border border-[#BED8D4]/50 p-5 flex-1">
                  <h3 className="font-semibold text-xl text-[#4068ec] mb-2">October-November: Applications</h3>
                  <p className="text-[#4068ec]/80">Complete and submit early applications and prepare for regular decision.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#4068ec] to-[#63D2FF] flex items-center justify-center">
                    <span className="text-white text-xs font-medium">3</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md border border-[#BED8D4]/50 p-5 flex-1">
                  <h3 className="font-semibold text-xl text-[#4068ec] mb-2">December-January: Regular Applications</h3>
                  <p className="text-[#4068ec]/80">Submit remaining applications and complete financial aid forms.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 