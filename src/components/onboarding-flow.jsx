"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronRight, ChevronLeft, Check, HelpCircle } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

const onboardingQuestions = [
  {
    id: "education",
    question: "What's the highest level of education you've completed?",
    description: "This helps us understand where you're starting your journey from.",
    type: "selection",
    options: [
      { value: "high-school", label: "High School", tooltip: "Secondary education diploma awarded upon graduation from high school" },
      { value: "ged", label: "GED", tooltip: "General Educational Development test, equivalent to a high school diploma" },
      { value: "associate", label: "Associate", tooltip: "Two-year undergraduate degree typically from a community or junior college" },
      { value: "bachelor", label: "Bachelor's", tooltip: "Four-year undergraduate degree from a college or university" },
      { value: "master", label: "Master's", tooltip: "Graduate degree that typically requires 1-3 years beyond a bachelor's degree" },
      { value: "doctorate", label: "Doctorate", tooltip: "Advanced degree representing the highest level of academic achievement" }
    ],
    isRequired: true,
  },
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
    description: "Select all that apply to your interests.",
    type: "selection",
    multiSelect: true,
    options: [
      { value: "business", label: "Business", tooltip: "Includes management, marketing, finance, entrepreneurship, and related fields" },
      { value: "computer-science", label: "Computer Science", tooltip: "Study of computers and computational systems, programming, and software development" },
      { value: "engineering", label: "Engineering", tooltip: "Includes mechanical, electrical, civil, chemical engineering and related fields" },
      { value: "health-sciences", label: "Health Sciences", tooltip: "Medicine, nursing, public health, and healthcare-related disciplines" },
      { value: "humanities", label: "Humanities", tooltip: "Study of human culture, including literature, philosophy, languages, and history" },
      { value: "social-sciences", label: "Social Sciences", tooltip: "Study of human society and relationships, including psychology, sociology, economics" },
      { value: "natural-sciences", label: "Natural Sciences", tooltip: "Biology, chemistry, physics, astronomy, and earth sciences" },
      { value: "arts", label: "Arts", tooltip: "Visual, performing, and digital arts, including design, music, theater, and film" },
      { value: "education", label: "Education", tooltip: "Teaching, educational leadership, curriculum development, and school counseling" },
      { value: "undecided", label: "Undecided", tooltip: "Haven't made a decision yet about your major or field of study" }
    ],
    isRequired: true,
  },
  {
    id: "careerGoals",
    question: "Do you have any specific career goals or dream jobs in mind?",
    description: "Select all that apply or type your own.",
    type: "selection",
    multiSelect: true,
    options: [
      { value: "software-engineer", label: "Software Engineer", tooltip: "Design and develop software applications and systems" },
      { value: "doctor", label: "Doctor/Medicine", tooltip: "Diagnose and treat patients in various medical specialties" },
      { value: "lawyer", label: "Lawyer", tooltip: "Provide legal advice and representation in various areas of law" },
      { value: "business", label: "Business/Finance", tooltip: "Careers in management, investment, banking, and financial analysis" },
      { value: "engineer", label: "Engineer", tooltip: "Apply scientific principles to design and build structures, machines, or systems" },
      { value: "teacher", label: "Teacher/Professor", tooltip: "Educate students at various levels from K-12 to university" },
      { value: "scientist", label: "Scientist/Researcher", tooltip: "Conduct scientific research and experiments in various fields" },
      { value: "artist", label: "Artist/Creative", tooltip: "Careers in visual arts, design, writing, music, and other creative fields" },
      { value: "undecided", label: "Not Sure Yet", tooltip: "Still exploring career options and possibilities" }
    ],
    allowCustom: true,
    isRequired: false,
  },
  {
    id: "collegeSetting",
    question: "What type of college setting do you prefer?",
    description: "Consider the environment where you'd feel most comfortable.",
    type: "selection",
    options: [
      { value: "urban", label: "Urban", tooltip: "Located in a major city with access to cultural attractions, internships, and city amenities" },
      { value: "suburban", label: "Suburban", tooltip: "Located in residential areas outside of major cities, balancing accessibility with more space" },
      { value: "rural", label: "Rural", tooltip: "Located in countryside settings with natural surroundings and typically tight-knit communities" },
      { value: "no-preference", label: "No preference", tooltip: "Location type is not a deciding factor in your college search" }
    ],
    isRequired: true,
  },
  {
    id: "collegeType",
    question: "Do you prefer public or private universities?",
    description: "This can affect tuition costs and campus culture.",
    type: "selection",
    options: [
      { value: "public", label: "Public", tooltip: "State-funded institutions typically with lower tuition for in-state residents and larger student bodies" },
      { value: "private", label: "Private", tooltip: "Independently funded institutions often with higher tuition but potentially more financial aid and smaller class sizes" },
      { value: "no-preference", label: "No preference", tooltip: "Institution funding type is not a deciding factor in your college search" }
    ],
    isRequired: true,
  },
  {
    id: "sportsPrograms",
    question: "Do you want to attend a college with strong sports programs or a lot of school spirit?",
    description: "This can influence campus culture and community.",
    type: "selection",
    options: [
      { value: "yes", label: "Yes", tooltip: "Colleges with competitive athletics programs, active fan bases, and strong school traditions" },
      { value: "no", label: "No", tooltip: "Colleges where athletics aren't a central focus of campus culture" },
      { value: "no-preference", label: "No preference", tooltip: "Athletics presence is not a deciding factor in your college search" }
    ],
    isRequired: true,
  },
  {
    id: "extracurriculars",
    question: "What extracurricular activities are important to you?",
    description: "Select all that apply to your interests.",
    type: "selection",
    multiSelect: true,
    options: [
      { value: "music", label: "Music", tooltip: "Includes bands, orchestras, choirs, a cappella groups, and other musical ensembles" },
      { value: "theater", label: "Theater", tooltip: "Theater productions, acting groups, and performance opportunities" },
      { value: "athletics", label: "Athletics", tooltip: "Varsity, club, and intramural sports teams and competitions" },
      { value: "research", label: "Research", tooltip: "Opportunities to conduct research with faculty or in labs outside of coursework" },
      { value: "debate", label: "Debate", tooltip: "Competitive debate teams and public speaking groups" },
      { value: "volunteering", label: "Volunteering", tooltip: "Community service opportunities and volunteer organizations" },
      { value: "student-government", label: "Student Government", tooltip: "Elected student leadership positions that represent the student body" },
      { value: "journalism", label: "Journalism", tooltip: "Student newspapers, magazines, radio stations, and other media" },
      { value: "art", label: "Art", tooltip: "Visual art, photography, filmmaking, and other creative pursuits" }
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
  const [customInput, setCustomInput] = useState("");

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

  const handleSelectionClick = (value) => {
    setError("");
    const currentQuestion = onboardingQuestions[currentQuestionIndex];
    
    if (currentQuestion.multiSelect) {
      // For multi-select questions
      setCurrentAnswer(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        if (prevArray.includes(value)) {
          return prevArray.filter(item => item !== value);
        } else {
          return [...prevArray, value];
        }
      });
    } else {
      // For single-select questions
      // Set the answer first
      setCurrentAnswer(value);
      
      // Save the answer to the main answers state
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: value
      }));
      
      // Auto-advance for single selections after ensuring state is updated
      setTimeout(() => {
        if (currentQuestionIndex < onboardingQuestions.length - 1) {
          setCurrentQuestionIndex(prevIndex => prevIndex + 1);
          
          // Set appropriate initial value for next question
          const nextQuestion = onboardingQuestions[currentQuestionIndex + 1];
          if (nextQuestion.multiSelect) {
            setCurrentAnswer([]);
          } else {
            setCurrentAnswer("");
          }
        } else {
          // Last question completed, handle submission
          handleCompletionSequence();
        }
      }, 300);
    }
  };

  const handleAddCustomOption = () => {
    if (!customInput.trim()) return;
    
    setCurrentAnswer(prev => {
      const prevArray = Array.isArray(prev) ? prev : [];
      return [...prevArray, customInput];
    });
    setCustomInput("");
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

  // Handle the sequence of completing the onboarding
  const handleCompletionSequence = async () => {
    setIsSaving(true);
    try {
      const finalAnswers = {
        ...answers,
      };
      
      // Ensure all fields are properly included
      console.log("Saving onboarding answers:", finalAnswers);
      
      // Save to database
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            ...finalAnswers,
            academicNotes: finalAnswers.academicNotes || "", // Ensure academicNotes is included
            education: finalAnswers.education || "" // Ensure education is included
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
  };

  const handleNext = async () => {
    const currentQuestion = onboardingQuestions[currentQuestionIndex];
    
    // Validate required fields
    if (currentQuestion.isRequired) {
      if (currentQuestion.multiSelect) {
        if (!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)) {
          setError("Please select at least one option");
          return;
        }
      } else if (!currentAnswer || (typeof currentAnswer === 'string' && currentAnswer.trim() === "")) {
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
      
      // Set appropriate initial value for next question
      const nextQuestion = onboardingQuestions[currentQuestionIndex + 1];
      if (nextQuestion.multiSelect) {
        setCurrentAnswer([]);
      } else {
        setCurrentAnswer("");
      }
      
    } else {
      // All questions answered
      handleCompletionSequence();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
      // Restore previous answer
      const prevQuestion = onboardingQuestions[currentQuestionIndex - 1];
      setCurrentAnswer(answers[prevQuestion.id] || 
        (prevQuestion.multiSelect ? [] : "")
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
        [currentQuestion.id]: currentQuestion.multiSelect ? [] : ""
      }));
      
      if (currentQuestionIndex < onboardingQuestions.length - 1) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        const nextQuestion = onboardingQuestions[currentQuestionIndex + 1];
        setCurrentAnswer(nextQuestion.multiSelect ? [] : "");
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

        {currentQuestion.type === "selection" && (
          <TooltipProvider>
            <div className={`grid ${currentQuestion.multiSelect ? "grid-cols-2 sm:grid-cols-3 gap-3" : "grid-cols-1 sm:grid-cols-2 gap-4"} mb-6`}>
              {currentQuestion.options.map((option) => {
                const isSelected = currentQuestion.multiSelect 
                  ? Array.isArray(currentAnswer) && currentAnswer.includes(option.value)
                  : currentAnswer === option.value;
                
                return (
                  <Tooltip key={option.value} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <motion.button
                        type="button"
                        onClick={() => handleSelectionClick(option.value)}
                        className={`py-3 px-4 rounded-xl text-center transition-all duration-200 relative ${
                          isSelected 
                            ? "bg-blue-100 border-2 border-blue-600 text-blue-800 font-medium" 
                            : "bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-800"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="pr-4">{option.label}</span>
                        {option.tooltip && (
                          <span className="absolute top-1/2 right-2 -translate-y-1/2 opacity-60">
                            <HelpCircle size={14} />
                          </span>
                        )}
                      </motion.button>
                    </TooltipTrigger>
                    {option.tooltip && (
                      <TooltipContent side="top" align="center" sideOffset={5} className="max-w-xs z-50">
                        {option.tooltip}
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        )}

        {currentQuestion.type === "text" && (
          <div className="relative pb-2">
            <div className="relative">
              <Input
                placeholder={currentQuestion.placeholder}
                value={currentAnswer || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="w-full mb-6 border-gray-200 dark:border-gray-700 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white py-6 text-base rounded-xl pr-10"
              />
              {currentQuestion.id === "gpa" && (
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <div className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-help">
                        <HelpCircle size={16} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="end" sideOffset={5} className="max-w-xs z-50">
                      Most high schools use a 4.0 scale (A=4.0, B=3.0, etc.). If your school uses a different scale (e.g., 5.0 for AP/IB courses), please convert or specify.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        )}

        {currentQuestion.type === "textarea" && (
          <div className="relative pb-2">
            <div className="relative">
              <Textarea
                placeholder={currentQuestion.placeholder}
                value={currentAnswer || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="w-full mb-6 border-gray-200 dark:border-gray-700 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white py-6 text-base rounded-xl min-h-[120px] pr-10"
              />
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-help">
                      <HelpCircle size={16} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="end" sideOffset={5} className="max-w-xs z-50">
                    {currentQuestion.id === "academicNotes" ? 
                      "Include details about academic achievements, competitions, awards, or specific areas of interest that might be relevant to your college search." :
                      "Share any specific preferences about location, campus size, religious affiliation, specialized programs, or other factors important to your college decision."}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        {currentQuestion.type === "compound" && (
          <div className="space-y-4 mb-6">
            {currentQuestion.fields.map((field) => (
              <div key={field.id} className="relative pb-2">
                <Label htmlFor={field.id} className="text-gray-900 dark:text-white mb-2 block text-sm font-medium">
                  {field.label}
                </Label>
                <div className="relative">
                  <Input
                    id={field.id}
                    placeholder={field.placeholder}
                    value={(currentAnswer && currentAnswer[field.id]) || ""}
                    onChange={(e) => handleAnswerChange(e.target.value, field.id)}
                    className="w-full border-gray-200 dark:border-gray-700 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white py-6 text-base rounded-xl pr-10"
                  />
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-help">
                          <HelpCircle size={16} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="end" sideOffset={5} className="max-w-xs z-50">
                        {field.id === "sat" ? 
                          "The SAT score scale runs from 400 to 1600, combining two sections: Evidence-Based Reading & Writing and Math." :
                          "The ACT has a composite score ranging from 1 to 36, averaging scores from English, Math, Reading, and Science sections."}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentQuestion.allowCustom && (
          <div className="mt-4 mb-6">
            <Label htmlFor="custom-option" className="text-gray-900 dark:text-white mb-2 block text-sm font-medium">
              Or add your own
            </Label>
            <div className="flex space-x-2">
              <Input
                id="custom-option"
                placeholder="Type your own answer"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="flex-1 border-gray-200 dark:border-gray-700 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white py-3 text-sm rounded-xl"
              />
              <Button 
                onClick={handleAddCustomOption}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-xl"
              >
                Add
              </Button>
            </div>
            
            {Array.isArray(currentAnswer) && currentAnswer.some(item => !currentQuestion.options.find(opt => opt.value === item)) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {currentAnswer.filter(item => !currentQuestion.options.find(opt => opt.value === item)).map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-blue-100 text-blue-800 py-1 px-3 rounded-lg text-sm font-medium flex items-center"
                  >
                    {item}
                    <button
                      type="button"
                      className="ml-2 text-blue-600 hover:text-blue-800"
                      onClick={() => setCurrentAnswer(prev => prev.filter(i => i !== item))}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {currentQuestion.type === "file" && (
          <div className="relative pb-6">
            <div className="relative">
              <FileUpload
                onFileSelect={handleFileSelect}
                accept=".pdf,.doc,.docx"
                maxSize={5}
              />
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 cursor-help">
                      <HelpCircle size={16} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="end" sideOffset={5} className="max-w-xs z-50">
                    Upload your resume to help us understand your academic and extracurricular achievements. This will help provide more tailored college recommendations.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
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
            {(currentQuestion.type !== "selection" || currentQuestion.multiSelect) && (
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
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px] md:max-w-[1000px] p-0 bg-white dark:bg-gray-900 border-0 rounded-2xl overflow-hidden shadow-lg">
        <DialogTitle className="sr-only">
          {showWelcome ? "Welcome to CollegeAdmit.AI" : onboardingQuestions[currentQuestionIndex].question}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {showWelcome ? "College admissions questionnaire" : onboardingQuestions[currentQuestionIndex].description}
        </DialogDescription>
        
        <div className="flex flex-col md:flex-row">
          <div className="flex-1">
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
          </div>
          
          {/* Right side panel with potential matches */}
          {!showWelcome && (
            <div className="hidden md:block md:w-[300px] bg-blue-50 dark:bg-blue-900/20 p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">We have over</h3>
              <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">6000</div>
              <p className="text-gray-700 dark:text-gray-300">
                potential matches for you.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                Let's personalize that list some more.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 