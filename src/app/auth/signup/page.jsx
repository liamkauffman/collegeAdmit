'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { SvgLogo } from '@/components/icons/SvgLogo';
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
      
      // Redirect to homepage (college explore) after collecting preferences
      router.push('/');
    } catch (error) {
      console.error("Error saving preferences:", error);
      // Still redirect even if preferences save fails
      router.push('/');
    }
  };

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-4">
              <SvgLogo />
              <span className="text-2xl font-bold text-gray-900 dark:text-white ml-3">CollegeAdmit.AI</span>
            </div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Or{' '}
              <Link href="/auth/signin" className="font-medium text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300">
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white">
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
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-500 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm bg-white text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white">
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
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-500 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm bg-white text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-white">
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
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-500 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm bg-white text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 dark:text-white">
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
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-500 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm bg-white text-gray-900"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:bg-gray-400 transition-colors"
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="text-center">
            <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
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