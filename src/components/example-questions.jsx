import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export function ExampleQuestions({ onSelectQuestion, userSession }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExampleQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/example-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userProfile: userSession?.user?.preferences || null
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch example questions');
        }

        const data = await response.json();
        setQuestions(data.questions);
      } catch (error) {
        console.error('Error fetching example questions:', error);
        // Set default questions if API fails
        setQuestions([
          "Show me liberal arts colleges with strong computer science programs",
          "What are the best colleges for pre-med students on the East Coast?",
          "Find public universities with good financial aid in California",
          "Which colleges have strong engineering programs and Division I sports?"
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchExampleQuestions();
  }, [userSession]);

  if (loading) {
    return (
      <div className="w-full flex justify-center mt-8 animate-pulse">
        <div className="flex flex-col w-full max-w-xl">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="py-4 px-4">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              {i < 4 && <div className="h-px bg-gray-200 mt-4"></div>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-8 mb-16 flex justify-center animate-fade-in-up delay-200">
      <div className="w-full max-w-xl">
        {questions.map((question, index) => (
          <div 
            key={index} 
            className="relative"
          >
            <button
              className="w-full text-left py-4 px-4 text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => onSelectQuestion(question)}
              style={{ 
                opacity: 0,
                animation: `fadeIn 0.5s ease ${0.1 + index * 0.15}s forwards`,
              }}
            >
              <span className="text-sm font-medium">{question}</span>
            </button>
            {index < questions.length - 1 && (
              <div className="h-px bg-gray-200 mx-4"></div>
            )}
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
} 