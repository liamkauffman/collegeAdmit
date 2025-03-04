'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import NavigationBar from '@/components/navigation-bar';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#F7F9F9] to-[#BED8D4]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#2081C3]">Loading...</h2>
          <p className="text-[#2081C3]/80">Please wait while we load your dashboard</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // This will be handled by the useEffect redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F9F9] to-[#BED8D4]">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2081C3]">Welcome, {session.user.name || 'User'}!</h1>
          <p className="text-[#2081C3]/80 mt-2">Manage your college applications and saved schools</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Saved Colleges Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-[#78D5D7]/30">
            <h2 className="text-xl font-semibold mb-4 text-[#2081C3]">Saved Colleges</h2>
            <p className="text-[#2081C3]/80 mb-4">View and manage your saved colleges</p>
            <button className="bg-[#2081C3] text-white px-4 py-2 rounded-md hover:bg-[#2081C3]/90 transition-colors">
              View Saved Colleges
            </button>
          </div>
          
          {/* Applications Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-[#78D5D7]/30">
            <h2 className="text-xl font-semibold mb-4 text-[#2081C3]">Applications</h2>
            <p className="text-[#2081C3]/80 mb-4">Track your college applications</p>
            <button className="bg-[#2081C3] text-white px-4 py-2 rounded-md hover:bg-[#2081C3]/90 transition-colors">
              Manage Applications
            </button>
          </div>
          
          {/* Notes Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-[#78D5D7]/30">
            <h2 className="text-xl font-semibold mb-4 text-[#2081C3]">College Notes</h2>
            <p className="text-[#2081C3]/80 mb-4">Review your notes on different colleges</p>
            <button className="bg-[#2081C3] text-white px-4 py-2 rounded-md hover:bg-[#2081C3]/90 transition-colors">
              View Notes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 