import NavigationBar from "@/components/navigation-bar"

export default function EssayReviewPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F7F9F9] to-[#BED8D4]">
      <NavigationBar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-[#2081C3]">
            Essay Review
          </h1>
          <p className="text-center text-[#2081C3]/80 mb-12 max-w-2xl mx-auto">
            Get feedback on your college application essays.
            Upload your essay and receive personalized suggestions.
          </p>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-[#78D5D7]/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col space-y-4">
                <h2 className="text-xl font-semibold text-[#2081C3]">Upload Your Essay</h2>
                <p className="text-[#2081C3]/80">
                  Our AI-powered tool will analyze your essay and provide detailed feedback.
                </p>
                <div className="border-2 border-dashed border-[#BED8D4] rounded-lg p-8 flex flex-col items-center justify-center bg-[#F7F9F9]">
                  <div className="w-16 h-16 rounded-full bg-[#78D5D7]/20 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2081C3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-[#2081C3] font-medium">Drag & drop your file here</p>
                  <p className="text-[#2081C3]/60 text-sm">or</p>
                  <button className="mt-2 px-4 py-2 bg-[#2081C3] text-white rounded-md hover:bg-[#2081C3]/90 transition-colors">
                    Browse Files
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col space-y-4">
                <h2 className="text-xl font-semibold text-[#2081C3]">Essay Requirements</h2>
                <div className="bg-[#F7F9F9] p-4 rounded-lg border border-[#BED8D4]">
                  <ul className="space-y-2 text-[#2081C3]/80">
                    <li className="flex items-start">
                      <span className="text-[#63D2FF] mr-2">✓</span>
                      <span>Personal statement (650 words max)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#63D2FF] mr-2">✓</span>
                      <span>Supplemental essays (varies by college)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#63D2FF] mr-2">✓</span>
                      <span>Scholarship essays</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#63D2FF] mr-2">✓</span>
                      <span>Activity descriptions</span>
                    </li>
                  </ul>
                </div>
                <p className="text-[#2081C3]/80 text-sm">
                  Our AI will analyze your essay for clarity, coherence, grammar, and alignment with college admissions criteria.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 