'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ImageLogo } from '@/components/icons/ImageLogo';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

      // Redirect to sign-in page after successful registration
      router.push('/auth/signin?registered=true');
    } catch (error) {
      setError(error.message || 'An error occurred during registration');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F7F9F9] to-[#BED8D4]">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center mb-4">
            <ImageLogo size={50} />
            <span className="text-2xl font-bold text-[#2081C3] ml-3">UniAI</span>
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
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-[#78D5D7]/30">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#2081C3]">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="mt-1 block w-full rounded-md border border-[#BED8D4] py-2 px-3 text-[#2081C3] bg-white/50 placeholder:text-[#2081C3]/60 focus:outline-none focus:ring-1 focus:ring-[#63D2FF] focus:border-[#63D2FF] transition-all"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-[#2081C3]">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block w-full rounded-md border border-[#BED8D4] py-2 px-3 text-[#2081C3] bg-white/50 placeholder:text-[#2081C3]/60 focus:outline-none focus:ring-1 focus:ring-[#63D2FF] focus:border-[#63D2FF] transition-all"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#2081C3]">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 block w-full rounded-md border border-[#BED8D4] py-2 px-3 text-[#2081C3] bg-white/50 placeholder:text-[#2081C3]/60 focus:outline-none focus:ring-1 focus:ring-[#63D2FF] focus:border-[#63D2FF] transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                />
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-[#2081C3]">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 block w-full rounded-md border border-[#BED8D4] py-2 px-3 text-[#2081C3] bg-white/50 placeholder:text-[#2081C3]/60 focus:outline-none focus:ring-1 focus:ring-[#63D2FF] focus:border-[#63D2FF] transition-all"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
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
  );
} 