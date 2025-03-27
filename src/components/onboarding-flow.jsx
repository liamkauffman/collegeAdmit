"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

const onboardingQuestions = [
  {
    id: "gpa",
    question: "What is your GPA?",
    description: "Please provide your unweighted or weighted GPA.",
    type: "text",
    placeholder: "e.g., 3.8",
    isRequired: true,
  },
  {
    id: "testScores",
    question: "What are your SAT or ACT scores?",
    description: "If you haven't taken them yet, you can skip this question.",
    type: "compound",
    fields: [
      { id: "sat", label: "SAT Score (out of 1600)", placeholder: "e.g., 1350" },
      { id: "act", label: "ACT Score (out of 36)", placeholder: "e.g., 28" }
    ],
    isRequired: false,
  },
  {
    id: "majors",
    question: "What majors or fields of study are you interested in?",
    description: "You can list multiple or say \"Undecided.\"",
    type: "textarea",
    placeholder: "e.g., Computer Science, Biology, Undecided",
    isRequired: true,
  },
  {
    id: "careerGoals",
    question: "Do you have any specific career goals or dream jobs in mind?",
    description: "If unsure, you can describe general areas of interest.",
    type: "textarea",
    placeholder: "e.g., Software Engineer, Doctor, Not sure yet but interested in creative fields",
    isRequired: false,
  },
  {
    id: "collegeSetting",
    question: "What type of college setting do you prefer?",
    description: "Consider the environment where you'd feel most comfortable.",
    type: "radio",
    options: [
      { value: "urban", label: "Urban" },
      { value: "suburban", label: "Suburban" },
      { value: "rural", label: "Rural" },
      { value: "no-preference", label: "No preference" }
    ],
    isRequired: true,
  },
  {
    id: "collegeType",
    question: "Do you prefer public or private universities?",
    description: "This can affect tuition costs and campus culture.",
    type: "radio",
    options: [
      { value: "public", label: "Public" },
      { value: "private", label: "Private" },
      { value: "no-preference", label: "No preference" }
    ],
    isRequired: true,
  },
  {
    id: "sportsPrograms",
    question: "Do you want to attend a college with strong sports programs or a lot of school spirit?",
    description: "This can influence campus culture and community.",
    type: "radio",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "no-preference", label: "No preference" }
    ],
    isRequired: true,
  },
  {
    id: "extracurriculars",
    question: "What extracurricular activities are important to you?",
    description: "Select all that apply to your interests.",
    type: "checkbox",
    options: [
      { value: "music", label: "Music" },
      { value: "theater", label: "Theater" },
      { value: "athletics", label: "Athletics" },
      { value: "research", label: "Research" },
      { value: "debate", label: "Debate" },
      { value: "volunteering", label: "Volunteering" },
      { value: "student-government", label: "Student Government" },
      { value: "journalism", label: "Journalism" },
      { value: "art", label: "Art" }
    ],
    isRequired: false,
  },
  {
    id: "resume",
    question: "Would you like to upload your resume?",
    description: "Upload your resume to help us better understand your academic and extracurricular achievements. We accept PDF, DOC, and DOCX files.",
    type: "file",
    isRequired: false,
  },
  {
    id: "academicNotes",
    question: "Tell us about your academic interests and achievements",
    description: "Share specific details about your academic interests, achievements, or goals to help us provide better college recommendations.",
    type: "textarea",
    placeholder: "E.g., I'm passionate about environmental science and have participated in several research projects. I'm looking for colleges with strong sustainability programs...",
    isRequired: false,
  },
  {
    id: "additionalPreferences",
    question: "Is there anything else that's important to you in your college search?",
    description: "Feel free to share any unique preferences or requirements.",
    type: "textarea",
    placeholder: "e.g., Study abroad options, specific programs, religious affiliation, etc.",
    isRequired: false,
  }
];

export function OnboardingFlow({ onComplete }) {
  const [open, setOpen] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  useEffect(() => {
    // Calculate progress percentage
    setProgress((currentQuestionIndex / onboardingQuestions.length) * 100);
  }, [currentQuestionIndex]);

  const handleAnswerChange = (value, field = null) => {
    setError("");
    if (field) {
      // For compound fields
      setCurrentAnswer(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setCurrentAnswer(value);
    }
  };

  const handleCheckboxChange = (value, checked) => {
    setError("");
    setCurrentAnswer(prev => {
      const prevArray = Array.isArray(prev) ? prev : [];
      if (checked) {
        return [...prevArray, value];
      } else {
        return prevArray.filter(item => item !== value);
      }
    });
  };

  const handleFileSelect = async (file) => {
    setError("");
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload/resume', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        const data = await response.json();
        setUploadedFile(data.fileUrl);
        handleAnswerChange(data.fileUrl);
      } catch (err) {
        console.error('Error uploading file:', err);
        setError('Failed to upload file. Please try again.');
      }
    } else {
      setUploadedFile(null);
      handleAnswerChange("");
    }
  };

  const handleNext = async () => {
    const currentQuestion = onboardingQuestions[currentQuestionIndex];
    
    // Validate required fields
    if (currentQuestion.isRequired) {
      if (currentQuestion.type === "checkbox") {
        if (!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)) {
          setError("Please select at least one option");
          return;
        }
      } else if (!currentAnswer || currentAnswer.trim() === "") {
        setError("This field is required");
        return;
      }
    }
    
    // Save answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: currentAnswer
    }));
    
    // Move to next question or complete
    if (currentQuestionIndex < onboardingQuestions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setCurrentAnswer(
        onboardingQuestions[currentQuestionIndex + 1].type === "checkbox" ? [] : ""
      );
    } else {
      // All questions answered
      setIsSaving(true);
      try {
        const finalAnswers = {
          ...answers,
          [currentQuestion.id]: currentAnswer // Add the last answer
        };
        
        // Save to database
        const response = await fetch('/api/user/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            preferences: {
              ...finalAnswers,
              academicNotes: finalAnswers.academicNotes || "" // Ensure academicNotes is included
            }
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save preferences');
        }

        setOpen(false);
        if (onComplete) {
          onComplete(finalAnswers);
        }
      } catch (err) {
        console.error('Error saving preferences:', err);
        setError('Failed to save your answers. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
      // Restore previous answer
      const prevQuestion = onboardingQuestions[currentQuestionIndex - 1];
      setCurrentAnswer(answers[prevQuestion.id] || 
        (prevQuestion.type === "checkbox" ? [] : "")
      );
    } else if (showWelcome === false) {
      setShowWelcome(true);
    }
  };

  const handleSkip = () => {
    const currentQuestion = onboardingQuestions[currentQuestionIndex];
    if (!currentQuestion.isRequired) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: ""
      }));
      
      if (currentQuestionIndex < onboardingQuestions.length - 1) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        setCurrentAnswer(
          onboardingQuestions[currentQuestionIndex + 1].type === "checkbox" ? [] : ""
        );
      } else {
        // All questions answered
        setOpen(false);
        if (onComplete) {
          onComplete(answers);
        }
      }
    }
  };

  const renderQuestionContent = () => {
    if (showWelcome) {
      return (
        <motion.div
          key="welcome"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center text-center p-8"
        >
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Let's get to know you
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
            I want to ask you a few questions to get a better understanding of you so that I can deliver the best college search results
          </p>
          <Button 
            onClick={() => setShowWelcome(false)}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 px-8 py-6 text-lg rounded-xl transition-all duration-300"
          >
            Let's Get Started <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      );
    }

    const currentQuestion = onboardingQuestions[currentQuestionIndex];

    return (
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="p-8"
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{currentQuestion.question}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{currentQuestion.description}</p>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {currentQuestion.type === "text" && (
          <Input
            placeholder={currentQuestion.placeholder}
            value={currentAnswer || ""}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full mb-6 border-gray-200 dark:border-gray-700 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white py-6 text-base rounded-xl"
          />
        )}

        {currentQuestion.type === "textarea" && (
          <Textarea
            placeholder={currentQuestion.placeholder}
            value={currentAnswer || ""}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full mb-6 border-gray-200 dark:border-gray-700 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white py-6 text-base rounded-xl min-h-[120px]"
          />
        )}

        {currentQuestion.type === "compound" && (
          <div className="space-y-4 mb-6">
            {currentQuestion.fields.map((field) => (
              <div key={field.id}>
                <Label htmlFor={field.id} className="text-gray-900 dark:text-white mb-2 block text-sm font-medium">
                  {field.label}
                </Label>
                <Input
                  id={field.id}
                  placeholder={field.placeholder}
                  value={(currentAnswer && currentAnswer[field.id]) || ""}
                  onChange={(e) => handleAnswerChange(e.target.value, field.id)}
                  className="w-full border-gray-200 dark:border-gray-700 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white py-6 text-base rounded-xl"
                />
              </div>
            ))}
          </div>
        )}

        {currentQuestion.type === "radio" && (
          <RadioGroup
            value={currentAnswer || ""}
            onValueChange={handleAnswerChange}
            className="space-y-4 mb-6"
          >
            {currentQuestion.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="border-gray-300 text-gray-900 dark:text-white"
                />
                <Label htmlFor={option.value} className="text-gray-900 dark:text-white text-base">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {currentQuestion.type === "checkbox" && (
          <div className="space-y-4 mb-6">
            {currentQuestion.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <Checkbox
                  id={option.value}
                  checked={Array.isArray(currentAnswer) && currentAnswer.includes(option.value)}
                  onCheckedChange={(checked) => handleCheckboxChange(option.value, checked)}
                  className="border-gray-300 text-gray-900 dark:text-white"
                />
                <Label htmlFor={option.value} className="text-gray-900 dark:text-white text-base">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )}

        {currentQuestion.type === "file" && (
          <FileUpload
            onFileSelect={handleFileSelect}
            accept=".pdf,.doc,.docx"
            maxSize={5}
          />
        )}

        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 py-6 px-8 rounded-xl transition-all duration-300"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
          <div className="flex space-x-3">
            {!currentQuestion.isRequired && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 py-6 px-8 rounded-xl"
              >
                Skip
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 py-6 px-8 rounded-xl transition-all duration-300"
            >
              {currentQuestionIndex < onboardingQuestions.length - 1 ? (
                <>Next <ChevronRight className="ml-2 h-5 w-5" /></>
              ) : (
                <>Complete <Check className="ml-2 h-5 w-5" /></>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-white dark:bg-gray-900 border-0 rounded-2xl overflow-hidden shadow-lg">
        <DialogTitle className="sr-only">
          {showWelcome ? "Welcome to CollegeAdmit.AI" : onboardingQuestions[currentQuestionIndex].question}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {showWelcome ? "College admissions questionnaire" : onboardingQuestions[currentQuestionIndex].description}
        </DialogDescription>
        
        {/* Progress bar */}
        {!showWelcome && (
          <div className="w-full h-1 bg-gray-100 dark:bg-gray-800">
            <motion.div
              className="h-full bg-gray-900 dark:bg-white"
              initial={{ width: `${progress}%` }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {renderQuestionContent()}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
} 