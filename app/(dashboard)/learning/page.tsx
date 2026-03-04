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
    
    // TODO: In task 5.4, this will trigger the curation job
    // For now, just log the selection
    console.log('Selected technology:', technologyId);
    
    // TODO: Navigate to project selection page once implemented
    // router.push(`/learning/projects/${technologyId}`);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar user={user} />

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <TechnologySelector onSelect={handleTechnologySelect} />
          
          {/* Debug info - remove in production */}
          {selectedTechnology && (
            <div className="mt-8 p-4 bg-[#1E293B] border border-[#334155] rounded-lg">
              <p className="text-sm text-gray-400">
                Selected: <span className="text-indigo-400 font-medium">{selectedTechnology}</span>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Note: Project curation will be implemented in task 5.4
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
