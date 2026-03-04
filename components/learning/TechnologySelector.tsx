'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface Technology {
  id: string;
  name: string;
  description: string;
  icon: string;
  projectCount: number;
  learningPath: string;
  difficulty: 'Beginner-friendly' | 'Intermediate' | 'Advanced';
  color: 'indigo' | 'violet' | 'pink' | 'emerald' | 'blue' | 'orange';
}

interface ComingSoonTech {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: string;
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
    button: 'bg-indigo-600 hover:bg-indigo-700',
  },
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    hover: 'hover:border-violet-500/50',
    badge: 'bg-violet-500/20 text-violet-300',
    button: 'bg-violet-600 hover:bg-violet-700',
  },
  pink: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    hover: 'hover:border-pink-500/50',
    badge: 'bg-pink-500/20 text-pink-300',
    button: 'bg-pink-600 hover:bg-pink-700',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    hover: 'hover:border-emerald-500/50',
    badge: 'bg-emerald-500/20 text-emerald-300',
    button: 'bg-emerald-600 hover:bg-emerald-700',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    hover: 'hover:border-blue-500/50',
    badge: 'bg-blue-500/20 text-blue-300',
    button: 'bg-blue-600 hover:bg-blue-700',
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    hover: 'hover:border-orange-500/50',
    badge: 'bg-orange-500/20 text-orange-300',
    button: 'bg-orange-600 hover:bg-orange-700',
  },
};

// Mock data
const mockTechnologies: Technology[] = [
  {
    id: 'react',
    name: 'React.js',
    description: 'Build dynamic and highly interactive user interfaces with the world&apos;s most popular UI library.',
    icon: '⚛️',
    projectCount: 24,
    learningPath: '12h path',
    difficulty: 'Beginner-friendly',
    color: 'blue',
  },
  {
    id: 'vue',
    name: 'Vue.js',
    description: 'The progressive framework for building modern web applications with ease and flexibility.',
    icon: '💚',
    projectCount: 18,
    learningPath: '10h path',
    difficulty: 'Beginner-friendly',
    color: 'emerald',
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    description: 'Master the React framework for production. SSR, Static Site Generation, and Edge functions.',
    icon: '▲',
    projectCount: 32,
    learningPath: '20h path',
    difficulty: 'Intermediate',
    color: 'indigo',
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    description: 'Learn scalable backend development. Databases, APIs, and real-time communication.',
    icon: '🟢',
    projectCount: 28,
    learningPath: '16h path',
    difficulty: 'Intermediate',
    color: 'emerald',
  },
];

const comingSoonTechs: ComingSoonTech[] = [
  {
    id: 'python',
    name: 'Python Core',
    description: 'Data science, automation, and backend development. Launching next month.',
    icon: '🐍',
    status: 'Next month',
  },
  {
    id: 'golang',
    name: 'Go (Golang)',
    description: 'Cloud-native development and microservices. Curriculum under development.',
    icon: '🔷',
    status: 'Q2 2026',
  },
];

const getDifficultyForTech = (techId: string): 'Beginner-friendly' | 'Intermediate' | 'Advanced' => {
  const difficultyMap: Record<string, 'Beginner-friendly' | 'Intermediate' | 'Advanced'> = {
    react: 'Beginner-friendly',
    vue: 'Beginner-friendly',
    nextjs: 'Intermediate',
    nodejs: 'Intermediate',
  };
  return difficultyMap[techId] || 'Intermediate';
};

const getColorForTech = (techId: string): 'indigo' | 'violet' | 'pink' | 'emerald' | 'blue' | 'orange' => {
  const colorMap: Record<string, 'indigo' | 'violet' | 'pink' | 'emerald' | 'blue' | 'orange'> = {
    react: 'blue',
    vue: 'emerald',
    nextjs: 'indigo',
    nodejs: 'emerald',
  };
  return colorMap[techId] || 'indigo';
};

export default function TechnologySelector({ onSelect }: TechnologySelectorProps) {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadTechnologies = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/learning/technologies');
        const data = await response.json();
        
        if (data.success && data.data?.technologies) {
          const enrichedTechnologies = data.data.technologies.map((tech: any) => ({
            ...tech,
            difficulty: getDifficultyForTech(tech.id),
            color: getColorForTech(tech.id),
            learningPath: '12h path', // Default value
          }));
          setTechnologies(enrichedTechnologies);
        } else {
          setTechnologies(mockTechnologies);
        }
      } catch (error) {
        console.error('Failed to load technologies:', error);
        setTechnologies(mockTechnologies);
      } finally {
        setLoading(false);
      }
    };

    loadTechnologies();
  }, []);

  const handleSelect = (technologyId: string) => {
    onSelect(technologyId);
  };

  const filteredTechnologies = technologies.filter(tech =>
    tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tech.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">Choose Your Technology</h1>
            <p className="text-gray-400 max-w-2xl">
              Select a framework to start learning. Master modern web development with project-based learning paths.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-indigo-300 font-medium">GitHub Certification Included</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search technologies (e.g. React, Backend, Mobile)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1E293B] border border-[#334155] rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-3 bg-[#1E293B] border border-[#334155] rounded-lg text-gray-300 hover:border-indigo-500/50 transition-colors">
            <span className="text-sm font-medium">Difficulty</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          <button className="flex items-center gap-2 px-4 py-3 bg-[#1E293B] border border-[#334155] rounded-lg text-gray-300 hover:border-indigo-500/50 transition-colors">
            <span className="text-sm font-medium">Popularity</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          <button className="flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">All Filters</span>
          </button>
        </div>
      </div>

      {/* Technology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTechnologies.map((tech) => {
          const colors = colorClasses[tech.color];

          return (
            <div
              key={tech.id}
              className="group bg-[#1E293B] border border-[#334155] hover:border-indigo-500/50 rounded-xl p-5 transition-all hover:shadow-lg hover:shadow-indigo-500/10 relative overflow-hidden"
            >
              {/* Difficulty Badge */}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                  tech.difficulty === 'Beginner-friendly' ? 'bg-emerald-500/20 text-emerald-300' :
                  tech.difficulty === 'Intermediate' ? 'bg-violet-500/20 text-violet-300' :
                  'bg-orange-500/20 text-orange-300'
                } uppercase tracking-wide`}>
                  {tech.difficulty}
                </span>
              </div>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center text-2xl mb-4`}>
                {tech.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-white mb-2">{tech.name}</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-2">
                {tech.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">folder</span>
                  <span>{tech.projectCount} Projects</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span>{tech.learningPath}</span>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={() => handleSelect(tech.id)}
                className={`w-full ${colors.button} text-white py-2.5 rounded-lg text-sm font-medium transition-colors`}
              >
                Start Learning
              </button>
            </div>
          );
        })}
      </div>

      {/* Coming Soon Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Coming Soon</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comingSoonTechs.map((tech) => (
            <div
              key={tech.id}
              className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 relative overflow-hidden opacity-60"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-500/10 flex items-center justify-center text-2xl flex-shrink-0">
                  {tech.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-white">{tech.name}</h3>
                    <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded text-[10px] font-bold uppercase">
                      {tech.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {tech.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Career Path Section */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/30 rounded-xl p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-400">school</span>
              </div>
              <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-xs font-bold uppercase">
                Career Path
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Don&apos;t know where to start?</h3>
            <p className="text-gray-400 mb-6 max-w-xl">
              Take our 2-minute skill assessment to get a personalized learning recommendation based on your career goals.
            </p>
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
              Take Career Quiz
            </button>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Frontend Architect</div>
            <div className="text-2xl font-bold text-white">$124k - $160k</div>
            <div className="text-xs text-gray-500 mt-1">Estimated Salary</div>
          </div>
        </div>
      </div>
    </div>
  );
}
