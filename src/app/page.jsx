import { SearchForm } from "@/components/search-form"
import NavigationBar from "@/components/navigation-bar"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F7F9F9] to-[#BED8D4]">
      <NavigationBar />
      <main className="flex-1 relative">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Sidebar */}
          <div className="lg:w-64 xl:w-72 lg:border-r border-[#BED8D4] bg-[#F7F9F9]/70 lg:overflow-y-auto lg:max-h-[calc(100vh-4rem)] scrollbar-hide">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#2081C3]">Find Your College</h2>
              <div>
                <SearchForm isSidebar={true} />
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 p-6 lg:p-8 lg:sticky lg:top-0 lg:h-screen">
            <div className="flex items-center justify-center h-full pb-20">
              <div className="w-full max-w-2xl px-6">
                <h2 className="text-5xl font-light text-[#2081C3] mb-4">Hello, I'm UniAI.</h2>
                <p className="text-[#2081C3]/80 mb-10 text-2xl">
                  I'm your college admissions assistant, ready to help you find the perfect match.
                </p>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Tell me what you're looking for..." 
                    className="w-full py-6 px-7 text-lg rounded-xl border border-[#BED8D4]/50 bg-white/50 text-[#2081C3] placeholder-[#2081C3]/60 focus:outline-none focus:ring-1 focus:ring-[#63D2FF] focus:border-[#63D2FF] transition-all"
                  />
                  <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#2081C3]/5 hover:bg-[#2081C3]/15 text-[#2081C3] p-2.5 rounded-lg transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-center mt-6">
                  <div className="w-2 h-2 rounded-full bg-[#78D5D7] mx-1"></div>
                  <div className="w-2 h-2 rounded-full bg-[#63D2FF] mx-1"></div>
                  <div className="w-2 h-2 rounded-full bg-[#2081C3] mx-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 