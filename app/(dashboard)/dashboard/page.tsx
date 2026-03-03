'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';

interface DashboardStats {
  projectsCompleted: number;
  learningHours: number;
  linesOfCode: number;
  streak: number;
  level: string;
}

interface CurrentProject {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  progress: number;
  tasksCompleted: number;
  totalTasks: number;
  timeRemaining: string;
  techStack: string[];
}

interface RecommendedProject {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  duration: string;
  icon: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    projectsCompleted: 8,
    learningHours: 42,
    linesOfCode: 1240,
    streak: 12,
    level: 'Level 4 Developer',
  });

  const [currentProject] = useState<CurrentProject>({
    id: '1',
    name: 'Full-Stack E-commerce Dashboard',
    description: 'Learn to build a modern dashboard with charts, data tables, and...',
    difficulty: 'INTERMEDIATE',
    progress: 65,
    tasksCompleted: 12,
    totalTasks: 18,
    timeRemaining: '~2h remaining',
    techStack: ['React', 'Next.js'],
  });

  const [recommendedProjects] = useState<RecommendedProject[]>([
    {
      id: '2',
      name: 'Weather App with API',
      description: 'Master asynchronous JavaScript by fetching real-time weather data.',
      difficulty: 'Beginner',
      duration: '4 hours',
      icon: 'JS',
    },
    {
      id: '3',
      name: 'Supabase Backend Integration',
      description: 'Learn to connect your frontend to a real database with authentication.',
      difficulty: 'Advanced',
      duration: '8 hours',
      icon: '🗄️',
    },
  ]);

  return (
    <div className="flex h-screen bg-[#0F1419]">
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#1A1F2E] border-r border-[#2D3748] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#2D3748]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CL</span>
            </div>
            <span className="text-white font-bold text-lg">CodeLearn</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600/10 text-indigo-400 font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            Dashboard
          </Link>
          <Link
            href="/learning"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#2D3748] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">school</span>
            Learning Path
          </Link>
          <Link
            href="/developer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#2D3748] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">code</span>
            Developer Mode
            <span className="ml-auto text-xs bg-indigo-600 text-white px-2 py-0.5 rounded">PRO</span>
          </Link>
          <Link
            href="/projects"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#2D3748] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">folder</span>
            My Projects
          </Link>
          <Link
            href="/community"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#2D3748] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">groups</span>
            Community
          </Link>
        </nav>

        {/* Tech Stack */}
        <div className="p-4 border-t border-[#2D3748]">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Your Tech Stack</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              React
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Node.js
            </div>
            <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-2">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Technology
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-[#2D3748] flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.name || 'Alex Dev'}</div>
            <div className="text-xs text-gray-400">Free Plan</div>
          </div>
          <button className="text-gray-400 hover:text-white">
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {user?.name?.split(' ')[0] || 'Alex'}! 👋
              </h1>
              <div className="flex items-center gap-2 bg-[#1A1F2E] px-4 py-2 rounded-lg border border-[#2D3748]">
                <span className="material-symbols-outlined text-yellow-500 text-[20px]">local_fire_department</span>
                <span className="text-white font-semibold">{stats.streak} Day Streak</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">{stats.level}</span>
              </div>
            </div>
            <p className="text-gray-400">You're on a roll. Let's keep building.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-indigo-400 text-[24px]">folder_managed</span>
                </div>
                <div className="text-sm text-gray-400">Projects Completed</div>
              </div>
              <div className="text-4xl font-bold text-white mb-1">{stats.projectsCompleted}</div>
              <div className="text-sm text-green-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                +2 this week
              </div>
            </div>

            <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-400 text-[24px]">schedule</span>
                </div>
                <div className="text-sm text-gray-400">Total Learning Hours</div>
              </div>
              <div className="text-4xl font-bold text-white mb-1">{stats.learningHours}h</div>
              <div className="text-sm text-gray-500">Keep it up!</div>
            </div>

            <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-pink-600/20 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-pink-400 text-[24px]">code</span>
                </div>
                <div className="text-sm text-gray-400">Lines of Code Written</div>
              </div>
              <div className="text-4xl font-bold text-white mb-1">{stats.linesOfCode.toLocaleString()}</div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <span className="bg-pink-600/20 text-pink-400 px-2 py-0.5 rounded text-xs">Top 5%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Left Column - Continue Learning & Recommended */}
            <div className="col-span-2 space-y-8">
              {/* Continue Learning */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Continue Learning</h2>
                  <Link href="/learning" className="text-sm text-indigo-400 hover:text-indigo-300">
                    View all
                  </Link>
                </div>

                <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-xl p-6">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white text-[32px]">shopping_cart</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded font-medium">
                          {currentProject.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">• React & Next.js</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">{currentProject.name}</h3>
                      <p className="text-sm text-gray-400 mb-4">{currentProject.description}</p>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400">
                            Current Task: <span className="text-white">Implement Authentication Flow</span>
                          </span>
                          <span className="text-indigo-400 font-medium">{currentProject.progress}% Complete</span>
                        </div>
                        <div className="w-full bg-[#0F1419] rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                            style={{ width: `${currentProject.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          {currentProject.tasksCompleted}/{currentProject.totalTasks} subtasks done
                          <span className="text-gray-600 ml-2">{currentProject.timeRemaining}</span>
                        </div>
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                          <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                          Resume Project
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recommended for You */}
              <section>
                <h2 className="text-xl font-bold text-white mb-4">Recommended for You</h2>
                <div className="grid grid-cols-2 gap-4">
                  {recommendedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-[#1A1F2E] border border-[#2D3748] rounded-xl p-6 hover:border-indigo-600/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center text-2xl">
                          {project.icon}
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">{project.difficulty}</span>
                        </div>
                      </div>
                      <h3 className="text-base font-semibold text-white mb-2">{project.name}</h3>
                      <p className="text-sm text-gray-400 mb-4">{project.description}</p>
                      <div className="text-xs text-gray-500">{project.duration}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* AI Mentor */}
              <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-indigo-400 text-[24px]">psychology</span>
                  <h3 className="font-bold text-white">AI Mentor</h3>
                </div>
                <div className="bg-[#0F1419] border border-[#2D3748] rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-300">
                    "Hey Alex! I noticed you paused on the Authentication Flow. Want a quick refresher on JWTs?"
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-lg transition-colors">
                    Explain JWTs
                  </button>
                  <button className="flex-1 bg-[#2D3748] hover:bg-[#374151] text-white text-sm py-2 rounded-lg transition-colors">
                    Ask Question
                  </button>
                </div>
              </div>

              {/* Daily Code Challenge */}
              <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-sm">Daily Code Challenge</h3>
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded font-bold">HARD</span>
                </div>
                <div className="bg-[#0F1419] border border-[#2D3748] rounded-lg p-3 mb-3 font-mono text-xs text-gray-300">
                  <span className="text-purple-400">function</span>{' '}
                  <span className="text-blue-400">reverseList</span>(head) {'{\n'}
                  <span className="text-gray-500">  // Your code here...</span>
                  {'\n}'}
                </div>
                <button className="w-full bg-[#2D3748] hover:bg-[#374151] text-white text-sm py-2 rounded-lg transition-colors border border-dashed border-gray-600">
                  Solve Challenge (+50 XP)
                </button>
              </div>

              {/* Community Activity */}
              <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-xl p-5">
                <h3 className="font-bold text-white text-sm mb-4">Community Activity</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex-shrink-0"></div>
                    <div>
                      <p className="text-xs text-gray-300">
                        <span className="text-white font-medium">Sarah</span> forked your project{' '}
                        <span className="text-indigo-400">Todo App</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white text-[16px]">check_circle</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-300">
                        You completed the <span className="text-emerald-400">React Basics</span> module
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
