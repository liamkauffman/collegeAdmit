"use client";

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SvgLogo } from '@/components/icons/SvgLogo';
import { OnboardingFlow } from '@/components/onboarding-flow';

export function AuthModal({ isOpen, onClose, redirectPath = "/", actionType = "search" }) {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      onClose();
      router.refresh();
    } catch (error) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // After successful registration, automatically sign in the user
      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.error) {
        throw new Error('Error signing in after registration');
      }

      // Show the onboarding flow as a popup instead of redirecting
      setShowOnboarding(true);
      setIsLoading(false);
    } catch (error) {
      setError(error.message || 'An error occurred during registration');
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async (answers) => {
    try {
      // Save onboarding answers to user profile
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferences: answers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }
      
      // Close all dialogs and refresh page
      setShowOnboarding(false);
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Error saving onboarding answers:", error);
      setShowOnboarding(false);
      onClose();
      router.refresh();
    }
  };

  // If the onboarding flow is showing, render it instead of the auth dialog
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 border-0 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-2xl">
        <div className="px-6 pt-6 pb-4">
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <SvgLogo />
              <span className="text-xl font-bold text-[#4068ec] dark:text-[#63D2FF] ml-2">CollegeAdmit.AI</span>
            </div>
            <DialogTitle className="text-2xl font-semibold text-center text-[#4068ec] dark:text-[#63D2FF]">
              {actionType === "search" 
                ? "Sign in to search for colleges" 
                : "Sign in to your account"}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 dark:text-gray-400 mt-1">
              {actionType === "search" 
                ? "To get personalized college recommendations, you'll need to sign in first."
                : "Access your personalized college recommendations and saved colleges."}
            </DialogDescription>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              className={`flex-1 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'signin'
                  ? 'border-[#4068ec] dark:border-[#63D2FF] text-[#4068ec] dark:text-[#63D2FF]'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('signin')}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'signup'
                  ? 'border-[#4068ec] dark:border-[#63D2FF] text-[#4068ec] dark:text-[#63D2FF]'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30">
              {error}
            </div>
          )}

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#63D2FF] focus:outline-none focus:ring-1 focus:ring-[#63D2FF] text-sm"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#63D2FF] focus:outline-none focus:ring-1 focus:ring-[#63D2FF] text-sm"
                  placeholder="••••••••"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#4068ec] hover:bg-[#4068ec]/90 dark:bg-[#63D2FF] dark:hover:bg-[#63D2FF]/90 text-white py-2 rounded-md transition-colors"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#63D2FF] focus:outline-none focus:ring-1 focus:ring-[#63D2FF] text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#63D2FF] focus:outline-none focus:ring-1 focus:ring-[#63D2FF] text-sm"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#63D2FF] focus:outline-none focus:ring-1 focus:ring-[#63D2FF] text-sm"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#63D2FF] focus:outline-none focus:ring-1 focus:ring-[#63D2FF] text-sm"
                  placeholder="••••••••"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#4068ec] hover:bg-[#4068ec]/90 dark:bg-[#63D2FF] dark:hover:bg-[#63D2FF]/90 text-white py-2 rounded-md transition-colors"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 