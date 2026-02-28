'use client';

import Link from 'next/link';

interface BaseProject {
  id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface FeaturedProject extends BaseProject {
  technology: string;
  progress: number;
  currentTask: string;
  completedTasks: number;
  totalTasks: number;
  estimatedHoursRemaining: number;
  githubUrl?: string;
  previewImage?: string;
  activeStudents?: number;
}

interface CompactProject extends BaseProject {
  estimatedHours: number;
  icon: string;
}

type ProjectCardProps =
  | {
      project: FeaturedProject;
      variant: 'featured';
    }
  | {
      project: CompactProject;
      variant: 'compact';
    };

const difficultyColors = {
  Beginner: 'bg-green-500/20 text-green-300',
  Intermediate: 'bg-blue-500/20 text-blue-300',
  Advanced: 'bg-purple-500/20 text-purple-300',
};

export default function ProjectCard({ project, variant }: ProjectCardProps) {
  if (variant === 'featured') {
    const featuredProject = project as FeaturedProject;
    return (
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
                <span className="text-2xl">⚛️</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${difficultyColors[featuredProject.difficulty]} uppercase tracking-wide`}
                  >
                    {featuredProject.difficulty}
                  </span>
                  <span className="text-gray-500 text-xs">• {featuredProject.technology}</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-1">{featuredProject.name}</h4>
                <p className="text-sm text-gray-400 line-clamp-1">{featuredProject.description}</p>
              </div>
            </div>
            <Link
              href={`/learning/project/${featuredProject.id}`}
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20"
            >
              <span className="material-symbols-outlined text-[24px] ml-0.5">play_arrow</span>
            </Link>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-indigo-300">Current Task: {featuredProject.currentTask}</span>
              <span className="text-gray-400">{featuredProject.progress}% Complete</span>
            </div>
            <div className="h-2 w-full bg-[#0F172A] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full relative"
                style={{ width: `${featuredProject.progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-xs text-gray-500 font-mono">
                {featuredProject.completedTasks}/{featuredProject.totalTasks} subtasks done
              </span>
              <span className="text-xs text-gray-500">
                ~{featuredProject.estimatedHoursRemaining}h remaining
              </span>
            </div>
          </div>
        </div>
        <div className="bg-[#273549] px-6 py-3 border-t border-[#334155] flex items-center justify-between">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-[#1E293B] bg-gray-700" />
            ))}
            {featuredProject.activeStudents && (
              <span className="w-6 h-6 rounded-full border-2 border-[#1E293B] bg-gray-700 flex items-center justify-center text-[8px] text-white font-medium">
                +{featuredProject.activeStudents}
              </span>
            )}
          </div>
          <Link
            href={`/learning/project/${featuredProject.id}`}
            className="text-xs font-medium text-white hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            Resume Project{' '}
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    );
  }

  // Compact variant
  const compactProject = project as CompactProject;
  return (
    <Link
      href={`/learning/project/${compactProject.id}`}
      className="group bg-[#1E293B] border border-[#334155] rounded-xl p-5 hover:border-gray-500 transition-all cursor-pointer relative overflow-hidden block"
    >
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="material-symbols-outlined text-gray-400 text-[20px]">bookmark</span>
      </div>
      <div className="w-10 h-10 rounded bg-[#334155] flex items-center justify-center mb-4 text-white">
        {compactProject.icon.length > 2 ? (
          <span className="material-symbols-outlined">{compactProject.icon}</span>
        ) : (
          <span className="font-bold text-xl">{compactProject.icon}</span>
        )}
      </div>
      <h4 className="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
        {compactProject.name}
      </h4>
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{compactProject.description}</p>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span
          className={`bg-[#0F172A] px-2 py-1 rounded ${difficultyColors[compactProject.difficulty]}`}
        >
          {compactProject.difficulty}
        </span>
        <span>{compactProject.estimatedHours} hours</span>
      </div>
    </Link>
  );
}
