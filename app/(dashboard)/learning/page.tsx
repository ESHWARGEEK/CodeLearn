'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import Navbar from '@/components/shared/Navbar';
import TechnologySelector from '@/components/learning/TechnologySelector';

export default function LearningPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedTechnology, setSelectedTechnology] = useState<string | null>(null);

  const handleTechnologySelect = (technologyId: string) => {
    setSelectedTechnology(technologyId);
    console.log('Selected technology:', technologyId);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A]">
      <Navbar user={user} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-emerald-400">GitHub Certification Included</span>
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-4">
              Select a framework to start learning
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Master modern web development with project-based learning paths
            </p>
          </div>

          {/* Technology Selector */}
          <TechnologySelector onSelect={handleTechnologySelect} />

          {/* Coming Soon Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Coming Soon</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-[#1E293B]/50 backdrop-blur-sm border border-[#334155] rounded-xl p-6 hover:border-indigo-500/50 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Python Core</h3>
                    <span className="text-xs text-amber-400 font-medium">INTERMEDIATE</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Master Python fundamentals with hands-on projects
                </p>
              </div>

              <div className="bg-[#1E293B]/50 backdrop-blur-sm border border-[#334155] rounded-xl p-6 hover:border-indigo-500/50 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Go (Golang)</h3>
                    <span className="text-xs text-amber-400 font-medium">INTERMEDIATE</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Build scalable backend applications with Go
                </p>
              </div>
            </div>
          </div>

          {/* Career Path Section */}
          <div className="mt-16 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Not sure where to start?</h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Take our career path quiz to find the perfect learning path based on your goals and experience level
            </p>
            <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
              Take Career Path Quiz
            </button>
            <div className="mt-6 flex items-center justify-center gap-8 text-sm">
              <div>
                <div className="text-2xl font-bold text-indigo-400">$124k</div>
                <div className="text-gray-500">Avg. Frontend Salary</div>
              </div>
              <div className="h-12 w-px bg-gray-700"></div>
              <div>
                <div className="text-2xl font-bold text-indigo-400">$142k</div>
                <div className="text-gray-500">Avg. Full-Stack Salary</div>
              </div>
              <div className="h-12 w-px bg-gray-700"></div>
              <div>
                <div className="text-2xl font-bold text-indigo-400">$160k</div>
                <div className="text-gray-500">Avg. Backend Salary</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
