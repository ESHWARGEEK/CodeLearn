'use client';

import { useState, useEffect } from 'react';

interface Technology {
  id: string;
  name: string;
  description: string;
  icon: string;
  projectCount: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  color: 'indigo' | 'violet' | 'pink' | 'emerald' | 'blue' | 'orange';
}

interface TechnologySelectorProps {
  onSelect: (technologyId: string) => void;
}

const colorClasses = {
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    hover: 'hover:border-indigo-500/50',
    badge: 'bg-indigo-500/20 text-indigo-300',
  },
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    hover: 'hover:border-violet-500/50',
    badge: 'bg-violet-500/20 text-violet-300',
  },
  pink: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    hover: 'hover:border-pink-500/50',
    badge: 'bg-pink-500/20 text-pink-300',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    hover: 'hover:border-emerald-500/50',
    badge: 'bg-emerald-500/20 text-emerald-300',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    hover: 'hover:border-blue-500/50',
    badge: 'bg-blue-500/20 text-blue-300',
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    hover: 'hover:border-orange-500/50',
    badge: 'bg-orange-500/20 text-orange-300',
  },
};

// Mock data for now - will be replaced with API call in task 5.2
const mockTechnologies: Technology[] = [
  {
    id: 'react',
    name: 'React',
    description: 'Build modern web applications with the most popular JavaScript library',
    icon: '⚛️',
    projectCount: 12,
    difficulty: 'Intermediate',
    color: 'blue',
  },
  {
    id: 'vue',
    name: 'Vue.js',
    description: 'Progressive framework for building user interfaces with ease',
    icon: '💚',
    projectCount: 8,
    difficulty: 'Beginner',
    color: 'emerald',
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    description: 'Full-stack React framework with server-side rendering and routing',
    icon: '▲',
    projectCount: 10,
    difficulty: 'Advanced',
    color: 'indigo',
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    description: 'Build scalable backend applications with JavaScript runtime',
    icon: '🟢',
    projectCount: 15,
    difficulty: 'Intermediate',
    color: 'emerald',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    description: 'Add type safety to your JavaScript projects for better code quality',
    icon: '📘',
    projectCount: 9,
    difficulty: 'Intermediate',
    color: 'blue',
  },
  {
    id: 'python',
    name: 'Python',
    description: 'Versatile language for web development, data science, and automation',
    icon: '🐍',
    projectCount: 14,
    difficulty: 'Beginner',
    color: 'orange',
  },
];

const difficultyColors = {
  Beginner: 'bg-green-500/20 text-green-300',
  Intermediate: 'bg-blue-500/20 text-blue-300',
  Advanced: 'bg-purple-500/20 text-purple-300',
};

export default function TechnologySelector({ onSelect }: TechnologySelectorProps) {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - will be replaced with actual API call in task 5.2
    const loadTechnologies = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/learning/technologies');
        // const data = await response.json();
        // setTechnologies(data.technologies);
        
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setTechnologies(mockTechnologies);
      } catch (error) {
        console.error('Failed to load technologies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTechnologies();
  }, []);

  const handleSelect = (technologyId: string) => {
    setSelectedTech(technologyId);
    onSelect(technologyId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Loading technologies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">Choose Your Learning Path</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Select a technology to start learning with real-world projects. Each path includes
          curated projects from beginner to advanced levels.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {technologies.map((tech: Technology) => {
          const colors = colorClasses[tech.color];
          const isSelected = selectedTech === tech.id;

          return (
            <button
              key={tech.id}
              onClick={() => handleSelect(tech.id)}
              className={`group bg-[#1E293B] border-2 ${
                isSelected ? 'border-indigo-500' : 'border-[#334155]'
              } ${colors.hover} rounded-xl p-6 text-left transition-all hover:shadow-lg hover:shadow-indigo-500/10 relative overflow-hidden`}
            >
              {/* Background gradient effect */}
              <div
                className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity`}
              ></div>

              {/* Content */}
              <div className="relative z-10">
                {/* Icon and badges */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-lg ${colors.bg} flex items-center justify-center text-3xl`}
                  >
                    {tech.icon}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${difficultyColors[tech.difficulty]} uppercase tracking-wide`}
                    >
                      {tech.difficulty}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.badge}`}>
                      {tech.projectCount} projects
                    </span>
                  </div>
                </div>

                {/* Title and description */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {tech.name}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">{tech.description}</p>

                {/* Arrow indicator */}
                <div className="mt-4 flex items-center justify-end">
                  <span
                    className={`material-symbols-outlined ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`}
                  >
                    arrow_forward
                  </span>
                </div>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[16px]">check</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Help text */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          Not sure where to start?{' '}
          <button className="text-indigo-400 hover:text-indigo-300 transition-colors underline">
            Take our quick quiz
          </button>
        </p>
      </div>
    </div>
  );
}
