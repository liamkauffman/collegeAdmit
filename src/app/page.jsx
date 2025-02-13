import { SearchForm } from "@/components/search-form"

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          <span className="text-[rgb(246,91,102)]">DeepLearning.AI</span> College Assistant
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Find the perfect college for you. 
          Enter your preferences below to get started.
        </p>
        <SearchForm />
      </div>
    </main>
  )
} 