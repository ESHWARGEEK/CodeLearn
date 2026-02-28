import Navbar from '@/components/shared/Navbar';
import StatsCard from '@/components/shared/StatsCard';
import ProjectCard from '@/components/shared/ProjectCard';
import AIMentorChat from '@/components/shared/AIMentorChat';

// Mock data - will be replaced with real API calls
const mockUser = {
  name: 'Alex Dev',
  email: 'alex@example.com',
  avatarUrl: '',
  tier: 'free' as const,
};

const mockStats = {
  projectsCompleted: 8,
  projectsTrend: '+2 this week',
  learningHours: 42,
  linesOfCode: 1240,
  linesRank: 'Top 5%',
  streak: 12,
  level: 4,
};

const mockCurrentProject = {
  id: 'proj-1',
  name: 'Full-Stack E-commerce Dashboard',
  description: 'Learn to build a modern dashboard with charts, data tables, and authentication.',
  technology: 'React & Next.js',
  difficulty: 'Intermediate' as const,
  progress: 65,
  currentTask: 'Implement Authentication Flow',
  completedTasks: 12,
  totalTasks: 18,
  estimatedHoursRemaining: 2,
  githubUrl: 'https://github.com/example/dashboard',
  previewImage: '',
  activeStudents: 420,
};

const mockRecommendedProjects = [
  {
    id: 'proj-2',
    name: 'Weather App with API',
    description: 'Master asynchronous JavaScript by fetching real-time weather data.',
    difficulty: 'Beginner' as const,
    estimatedHours: 4,
    icon: 'JS',
  },
  {
    id: 'proj-3',
    name: 'Supabase Backend Integration',
    description: 'Learn to connect your frontend to a real database with authentication.',
    difficulty: 'Advanced' as const,
    estimatedHours: 6,
    icon: 'dataset',
  },
];

export default function DashboardPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar user={mockUser} />

      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
        {/* Welcome header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-bold text-white mb-2">
              Welcome back, {mockUser.name}! 👋
            </h2>
            <p className="text-gray-400">You&apos;re on a roll. Let&apos;s keep building.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-[#1E293B] px-4 py-2 rounded-full border border-[#334155]">
            <span className="material-symbols-outlined text-yellow-500 text-[18px]">
              local_fire_department
            </span>
            <span className="font-medium text-white">{mockStats.streak} Day Streak</span>
            <span>•</span>
            <span>Level {mockStats.level} Developer</span>
          </div>
        </div>

        {/* Statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Projects Completed"
            value={mockStats.projectsCompleted}
            icon="folder_managed"
            trend={mockStats.projectsTrend}
            color="indigo"
          />
          <StatsCard
            title="Total Learning Hours"
            value={`${mockStats.learningHours}h`}
            icon="schedule"
            color="violet"
          />
          <StatsCard
            title="Lines of Code Written"
            value={mockStats.linesOfCode}
            icon="code"
            badge={mockStats.linesRank}
            color="pink"
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Continue Learning & Recommended */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Continue Learning</h3>
                <a className="text-sm text-indigo-400 hover:text-indigo-300" href="#">
                  View all
                </a>
              </div>
              <ProjectCard project={mockCurrentProject} variant="featured" />
            </section>

            {/* Recommended projects */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4">Recommended for You</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockRecommendedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} variant="compact" />
                ))}
              </div>
            </section>
          </div>

          {/* Right column - AI Mentor & Activity */}
          <aside className="space-y-6">
            <AIMentorChat />

            {/* Daily Code Challenge */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-sm">Daily Code Challenge</h3>
                <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded uppercase">
                  Hard
                </span>
              </div>
              <div className="bg-[#0F172A] p-3 rounded-lg border border-[#334155] font-mono text-xs text-gray-300 mb-3">
                <span className="text-purple-400">function</span>{' '}
                <span className="text-blue-400">reverseList</span>(head) {'{\n'}
                <span className="text-gray-500">{'//'} Your code here...</span>
                {'\n}'}
              </div>
              <button className="w-full text-center text-sm text-gray-300 hover:text-white hover:bg-[#334155] py-2 rounded-lg transition-colors border border-dashed border-gray-600 hover:border-transparent">
                Solve Challenge (+50 XP)
              </button>
            </div>

            {/* Community Activity */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5">
              <h3 className="font-bold text-white text-sm mb-4">Community Activity</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-medium">
                    S
                  </div>
                  <div>
                    <p className="text-xs text-gray-300">
                      <span className="font-bold text-white">Sarah</span> forked your project{' '}
                      <span className="text-indigo-400">Todo App</span>
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-300">
                      You completed the <span className="text-emerald-400">React Basics</span>{' '}
                      module
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">Yesterday</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Upgrade CTA for free users */}
        {mockUser.tier === 'free' && (
          <div className="bg-gradient-to-r from-indigo-900/20 to-violet-900/20 border border-indigo-500/20 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Unlock Unlimited Learning</h3>
            <p className="text-gray-400 mb-4">
              Upgrade to Pro for unlimited templates, AI Mentor access, and private repos.
            </p>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-900/20">
              Upgrade to Pro - $19/mo
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
