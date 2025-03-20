'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { ImageLogo } from '@/components/icons/ImageLogo';
import { OnboardingFlow } from '@/components/onboarding-flow';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);

  const handleSubmit = async (e) => {
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

      // Show the onboarding flow after successful registration and sign-in
      setRegistrationComplete(true);
      setIsLoading(false);
    } catch (error) {
      setError(error.message || 'An error occurred during registration');
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async (preferences) => {
    setUserPreferences(preferences);
    
    try {
      // Save preferences to the user profile
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences
        }),
      });
      
      // Redirect to dashboard after collecting preferences
      router.push('/dashboard');
    } catch (error) {
      console.error("Error saving preferences:", error);
      // Still redirect even if preferences save fails
      router.push('/dashboard');
    }
  };

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F7F9F9] to-[#BED8D4]">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-4">
              <ImageLogo size={50} />
              <span className="text-2xl font-bold text-[#2081C3] ml-3">CollegeAdmit.AI</span>
            </div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-[#2081C3]">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-[#2081C3]/80">
              Or{' '}
              <Link href="/auth/signin" className="font-medium text-[#63D2FF] hover:text-[#78D5D7]">
                sign in to your existing account
              </Link>
            </p>
          </div>
          
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 space-y-6">
            <form className="space-y-6 auth-form" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#63D2FF] focus:outline-none focus:ring-[#63D2FF] sm:text-sm bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#63D2FF] focus:outline-none focus:ring-[#63D2FF] sm:text-sm bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#63D2FF] focus:outline-none focus:ring-[#63D2FF] sm:text-sm bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#63D2FF] focus:outline-none focus:ring-[#63D2FF] sm:text-sm bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full justify-center rounded-md bg-[#2081C3] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2081C3]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2081C3] disabled:bg-[#2081C3]/70 transition-colors"
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="text-center">
            <Link href="/" className="text-sm text-[#2081C3]/80 hover:text-[#2081C3]">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
      
      {/* Onboarding flow after successful registration */}
      {registrationComplete && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}
    </>
  );
} 