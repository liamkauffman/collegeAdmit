import NavigationBar from "@/components/navigation-bar"
import { Upload, FileText, CheckCircle } from "lucide-react"

export default function EssayReviewPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F7F9F9] to-[#BED8D4]/30">
      <NavigationBar />
      <main className="flex-1 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#4068ec] to-[#63D2FF]">
            Essay Review
          </h1>
          <p className="text-center text-[#4068ec]/70 dark:text-[#63D2FF]/70 mb-10 sm:mb-12 max-w-2xl mx-auto">
            Get feedback on your college application essays.
            Upload your essay and receive personalized suggestions.
          </p>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8 border border-[#78D5D7]/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#4068ec] to-[#63D2FF]">
                  Upload Your Essay
                </h2>
                <p className="text-[#4068ec]/80 mb-4">
                  Our AI-powered tool will analyze your essay and provide detailed feedback.
                </p>
                <div className="border-2 border-dashed border-[#BED8D4] rounded-xl p-8 flex flex-col items-center justify-center bg-white hover:bg-[#4068ec]/5 transition-colors cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#4068ec]/10 to-[#63D2FF]/10 flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-[#4068ec]" />
                  </div>
                  <p className="font-medium text-[#4068ec] text-lg mb-1">Drag & drop your file here</p>
                  <p className="text-[#4068ec]/60 text-sm mb-4">or</p>
                  <button className="px-5 py-2.5 bg-gradient-to-r from-[#4068ec] to-[#63D2FF] text-white rounded-lg hover:from-[#4068ec]/90 hover:to-[#63D2FF]/90 transition-all shadow font-medium">
                    Browse Files
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#4068ec] to-[#63D2FF]">
                  Essay Requirements
                </h2>
                <div className="bg-white p-6 rounded-xl shadow-md border border-[#BED8D4]/50">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="mt-0.5 mr-3 text-[#4068ec]">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#4068ec]">Personal statement (650 words max)</h3>
                        <p className="text-sm text-[#4068ec]/70">The main essay for your Common Application</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="mt-0.5 mr-3 text-[#4068ec]">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#4068ec]">Supplemental essays</h3>
                        <p className="text-sm text-[#4068ec]/70">School-specific essays with various word counts</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="mt-0.5 mr-3 text-[#4068ec]">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#4068ec]">Scholarship essays</h3>
                        <p className="text-sm text-[#4068ec]/70">Essays for merit-based financial aid opportunities</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="mt-0.5 mr-3 text-[#4068ec]">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#4068ec]">Activity descriptions</h3>
                        <p className="text-sm text-[#4068ec]/70">Brief descriptions of your extracurricular activities</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <p className="text-[#4068ec]/80 text-sm mt-2">
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