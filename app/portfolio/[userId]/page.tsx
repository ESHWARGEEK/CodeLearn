'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PublicPortfolioData, PortfolioProject } from '@/types/portfolio';

type SortOption = 'newest' | 'oldest' | 'name' | 'technology' | 'completion-date';
type FilterOption = 'all' | 'react' | 'vue' | 'nextjs' | 'nodejs';
type DateRangeOption = 'all' | 'last-week' | 'last-month' | 'last-year';
type SortOrderOption = 'asc' | 'desc';

const technologyIcons: Record<string, string> = {
  react: '⚛️',
  vue: '💚',
  nextjs: '▲',
  nodejs: '🟢',
  javascript: '🟨',
  typescript: '🔷',
};

const technologyColors: Record<string, string> = {
  react: 'bg-blue-500/20 text-blue-300',
  vue: 'bg-green-500/20 text-green-300',
  nextjs: 'bg-gray-500/20 text-gray-300',
  nodejs: 'bg-green-600/20 text-green-400',
  javascript: 'bg-yellow-500/20 text-yellow-300',
  typescript: 'bg-blue-600/20 text-blue-400',
};

interface PublicPortfolioPageProps {
  params: { userId: string };
}

export default function PublicPortfolioPage({ params }: PublicPortfolioPageProps) {
  const { userId } = params;
  const [portfolioData, setPortfolioData] = useState<PublicPortfolioData | null>(null);
  const [filteredProjects, setFilteredProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [sortOrder, setSortOrder] = useState<SortOrderOption>('desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [dateRange, setDateRange] = useState<DateRangeOption>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(9); // 3x3 grid

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchPortfolioData();
  }, [searchQuery, sortBy, sortOrder, filterBy, dateRange]);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterBy !== 'all') params.append('technology', filterBy);
      if (dateRange !== 'all') params.append('dateRange', dateRange);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      // Add pagination
      const offset = (currentPage - 1) * projectsPerPage;
      params.append('limit', projectsPerPage.toString());
      params.append('offset', offset.toString());

      const response = await fetch(`/api/portfolio/public/${userId}?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setPortfolioData(data.data);
        setFilteredProjects(data.data.projects);
      } else {
        setError(data.error?.message || 'Failed to load portfolio');
      }
    } catch (err) {
      setError('Failed to load portfolio');
      console.error('Public portfolio fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPortfolioData();
  };

  const totalPages = Math.ceil((portfolioData?.total || 0) / projectsPerPage);

  const copyPortfolioUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    // In a real app, you'd show a toast notification here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-red-400 mb-4">
            <span className="material-symbols-outlined text-6xl">error</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {error === 'This portfolio is private' ? 'Portfolio is Private' : 'Failed to Load Portfolio'}
          </h2>
          <p className="text-gray-400 mb-4">{error}</p>
          {error !== 'This portfolio is private' && (
            <Button onClick={fetchPortfolioData} className="bg-indigo-600 hover:bg-indigo-500">
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {portfolioData.user.avatar && (
                <img
                  src={portfolioData.user.avatar}
                  alt={portfolioData.user.name}
                  className="w-16 h-16 rounded-full border-2 border-gray-700"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {portfolioData.user.name}'s Portfolio
                </h1>
                <p className="text-gray-400">
                  {portfolioData.user.bio || 'Showcasing completed projects and live demos'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-green-400">
                <span className="material-symbols-outlined text-sm">public</span>
                <span className="text-sm font-medium">Public Portfolio</span>
              </div>
              <Button
                onClick={copyPortfolioUrl}
                variant="outline"
                className="flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">share</span>
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <Input
                placeholder="Search projects, descriptions, or technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1E293B] border-[#334155] text-white placeholder-gray-400"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-md text-white text-sm"
              >
                <option value="all">All Technologies</option>
                <option value="react">React</option>
                <option value="vue">Vue.js</option>
                <option value="nextjs">Next.js</option>
                <option value="nodejs">Node.js</option>
              </select>
              
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
                className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-md text-white text-sm"
              >
                <option value="all">All Time</option>
                <option value="last-week">Last Week</option>
                <option value="last-month">Last Month</option>
                <option value="last-year">Last Year</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-md text-white text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="technology">Technology</option>
                <option value="completion-date">Completion Date</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="border-[#334155] hover:border-gray-500 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">
                  {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                </span>
                {sortOrder === 'asc' ? 'Asc' : 'Desc'}
              </Button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="material-symbols-outlined text-6xl">folder_open</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Projects Found
            </h3>
            <p className="text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                Showing {filteredProjects.length} projects
                {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </p>
              
              {/* Clear Filters Button */}
              {(searchQuery || filterBy !== 'all' || dateRange !== 'all' || sortBy !== 'newest' || sortOrder !== 'desc') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterBy('all');
                    setDateRange('all');
                    setSortBy('newest');
                    setSortOrder('desc');
                    setCurrentPage(1);
                  }}
                  className="border-[#334155] hover:border-gray-500 text-sm"
                >
                  Clear Filters
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <PublicProjectCard 
                  key={project.id} 
                  project={project} 
                  settings={portfolioData.settings}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-[#334155] hover:border-gray-500"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={currentPage === pageNum 
                          ? "bg-indigo-600 hover:bg-indigo-500" 
                          : "border-[#334155] hover:border-gray-500"
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-[#334155] hover:border-gray-500"
                >
                  Next
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface PublicProjectCardProps {
  project: PortfolioProject;
  settings: {
    showGithubLinks: boolean;
    showTechStack: boolean;
  };
}

function PublicProjectCard({ project, settings }: PublicProjectCardProps) {
  const technologyIcon = technologyIcons[project.technology] || '🔧';
  const technologyColor = technologyColors[project.technology] || 'bg-gray-500/20 text-gray-300';

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="bg-[#1E293B] border-[#334155] hover:border-gray-500 transition-all group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-xl">
              {technologyIcon}
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                {project.name}
              </h3>
              <span className={`text-xs px-2 py-1 rounded ${technologyColor} capitalize`}>
                {project.technology}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
            <span className="text-xs text-green-400 font-medium">Completed</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>

        {/* Tech Stack */}
        {settings.showTechStack && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {project.techStack.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded"
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 3 && (
                <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                  +{project.techStack.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Project Stats */}
        <div className="mb-4">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>{project.progress}% Complete</span>
            </div>
            {project.completedAt && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">event_available</span>
                <span>Finished {formatDate(project.completedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Deployment Info */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="material-symbols-outlined text-sm">cloud_done</span>
            <span>Deployed on {project.deploymentPlatform}</span>
            <span>•</span>
            <span>{formatDate(project.deployedAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-indigo-600 hover:bg-indigo-500"
            onClick={() => window.open(project.deploymentUrl, '_blank')}
          >
            <span className="material-symbols-outlined text-sm mr-1">launch</span>
            Live Demo
          </Button>
          {settings.showGithubLinks && project.githubUrl && (
            <Button
              size="sm"
              variant="outline"
              className="border-[#334155] hover:border-gray-500"
              onClick={() => window.open(project.githubUrl, '_blank')}
            >
              <span className="material-symbols-outlined text-sm">code</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}