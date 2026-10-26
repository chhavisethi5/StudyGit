import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Search,
  Plus,
  Filter,
  X,
  Layers,
  BookOpen,
  Clock,
  Building,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { getRoadmaps } from '../api/roadmapApi';
import { useAuth } from '../context/AuthContext';
import AuthPromptModal from '../components/AuthPromptModal';

export default function ExplorePage() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Auth prompt modal state for unauthenticated clicks
  const [selectedRoadmapForAuth, setSelectedRoadmapForAuth] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Search and filter state synced with URL search params
  const initialQ = searchParams.get('q') || '';
  const initialSubject = searchParams.get('subject') || '';
  const initialUniversity = searchParams.get('university') || '';
  const initialSemester = searchParams.get('semester') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchTerm, setSearchTerm] = useState(initialQ);
  const [subjectFilter, setSubjectFilter] = useState(initialSubject);
  const [universityFilter, setUniversityFilter] = useState(initialUniversity);
  const [semesterFilter, setSemesterFilter] = useState(initialSemester);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Data fetching state
  const [roadmaps, setRoadmaps] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch roadmaps from backend API
  const fetchExploreRoadmaps = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: 9,
      };

      if (searchTerm.trim()) params.q = searchTerm.trim();
      if (subjectFilter.trim()) params.subject = subjectFilter.trim();
      if (universityFilter.trim()) params.university = universityFilter.trim();
      if (semesterFilter.trim()) params.semester = semesterFilter.trim();

      const response = await getRoadmaps(params);

      setRoadmaps(response.data || []);
      setTotalCount(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('Error fetching roadmaps:', err);
      setError(err.message || 'Unable to fetch roadmaps. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, subjectFilter, universityFilter, semesterFilter, currentPage]);

  // Sync URL query parameters whenever filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (subjectFilter.trim()) params.set('subject', subjectFilter.trim());
    if (universityFilter.trim()) params.set('university', universityFilter.trim());
    if (semesterFilter.trim()) params.set('semester', semesterFilter.trim());
    if (currentPage > 1) params.set('page', currentPage.toString());

    setSearchParams(params, { replace: true });
  }, [searchTerm, subjectFilter, universityFilter, semesterFilter, currentPage, setSearchParams]);

  // Debounced search trigger (350ms) to avoid spamming the backend API
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExploreRoadmaps();
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchExploreRoadmaps]);

  // Filter change handlers that reset page to 1
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSubjectChange = (e) => {
    setSubjectFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleUniversityChange = (e) => {
    setUniversityFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSemesterChange = (e) => {
    setSemesterFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSubjectFilter('');
    setUniversityFilter('');
    setSemesterFilter('');
    setCurrentPage(1);
  };

  // Determine if any filters are active
  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      subjectFilter.trim() ||
      universityFilter.trim() ||
      semesterFilter.trim()
  );

  const handleRoadmapClick = (e, item) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setSelectedRoadmapForAuth(item);
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-git-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-git-text">Explore Roadmaps</h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-git-canvas border border-git-border text-git-textMuted">
              Directory
            </span>
          </div>
          <p className="text-xs text-git-textMuted mt-1">
            Browse published curriculum syllabi, study modules, and resource collections from universities and student groups.
          </p>
        </div>

        {/* New Roadmap Primary Action Button */}
        <div>
          <Link
            to="/explore/new"
            className="inline-flex items-center space-x-1.5 rounded-md bg-git-green px-3 py-1.5 text-xs font-medium text-white shadow-2xs border border-git-greenHover hover:bg-git-greenHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-green focus-visible:ring-offset-1 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Roadmap</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="rounded-lg border border-git-border bg-white p-3.5 shadow-2xs space-y-3">
        {/* Row 1: Search Input */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-git-textSubtle">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by title, subject, or description keyword..."
            className="h-9 w-full rounded-md border border-git-border bg-git-canvas py-1.5 pl-9 pr-9 text-xs text-git-text placeholder-git-textSubtle focus:bg-white focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-git-textSubtle hover:text-git-text"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Row 2: Secondary Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex items-center space-x-1 text-xs text-git-textSubtle font-medium mr-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          {/* Subject Filter */}
          <input
            type="text"
            value={subjectFilter}
            onChange={handleSubjectChange}
            placeholder="Filter subject..."
            className="h-7 w-36 rounded-md border border-git-border bg-white px-2.5 text-xs text-git-text placeholder-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo transition-colors"
          />

          {/* University Filter */}
          <input
            type="text"
            value={universityFilter}
            onChange={handleUniversityChange}
            placeholder="Filter university..."
            className="h-7 w-36 rounded-md border border-git-border bg-white px-2.5 text-xs text-git-text placeholder-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo transition-colors"
          />

          {/* Semester Filter */}
          <input
            type="text"
            value={semesterFilter}
            onChange={handleSemesterChange}
            placeholder="Filter semester..."
            className="h-7 w-32 rounded-md border border-git-border bg-white px-2.5 text-xs text-git-text placeholder-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo transition-colors"
          />

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center space-x-1 rounded-md border border-git-border bg-git-canvas px-2.5 py-1 text-xs font-medium text-git-textMuted hover:bg-white hover:text-git-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-git-indigo transition-colors ml-auto"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Result Counter & Active Filters Bar */}
      <div className="flex items-center justify-between text-xs text-git-textMuted px-0.5">
        <div>
          {isLoading ? (
            <span>Fetching roadmaps from database...</span>
          ) : (
            <span>
              Showing <strong className="text-git-text">{roadmaps.length}</strong> of{' '}
              <strong className="text-git-text">{totalCount}</strong> published{' '}
              {totalCount === 1 ? 'roadmap' : 'roadmaps'}
            </span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="text-[11px] font-mono text-git-textSubtle">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {/* Error Alert State */}
      {error && (
        <div className="rounded-md border border-git-red/20 bg-git-redSubtle p-4 text-xs text-git-redText flex items-start space-x-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Failed to load roadmaps:</span> {error}
            <div className="mt-2">
              <button
                type="button"
                onClick={fetchExploreRoadmaps}
                className="inline-flex items-center space-x-1 rounded bg-white px-2 py-1 text-xs font-medium border border-git-border text-git-text hover:bg-git-canvas shadow-2xs"
              >
                <span>Try again</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-git-border bg-white p-4 space-y-3 animate-pulse shadow-2xs"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-20 bg-git-canvas rounded" />
                <div className="h-4 w-8 bg-git-canvas rounded" />
              </div>
              <div className="h-5 w-3/4 bg-git-canvas rounded" />
              <div className="h-4 w-full bg-git-canvas rounded" />
              <div className="h-4 w-1/2 bg-git-canvas rounded" />
              <div className="pt-2 border-t border-git-borderMuted flex justify-between">
                <div className="h-3 w-16 bg-git-canvas rounded" />
                <div className="h-3 w-16 bg-git-canvas rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && roadmaps.length === 0 && (
        <div className="rounded-lg border border-git-border bg-white p-10 text-center shadow-2xs">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-git-indigoSubtle border border-git-indigo/20 text-git-indigo mb-3">
            <Compass className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-semibold text-git-text">
            {hasActiveFilters ? 'No roadmaps match your search criteria' : 'No roadmaps published yet'}
          </h2>
          <p className="mt-1.5 text-xs text-git-textMuted max-w-sm mx-auto leading-relaxed">
            {hasActiveFilters
              ? 'Try modifying your search keywords or clearing active filters to see all available roadmaps.'
              : 'Be the first to publish a curriculum roadmap and share learning milestones with the community.'}
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center space-x-1.5 rounded-md border border-git-border bg-git-canvas px-3 py-1.5 text-xs font-medium text-git-text hover:bg-white transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset all filters</span>
              </button>
            ) : (
              <Link
                to="/explore/new"
                className="inline-flex items-center space-x-1.5 rounded-md bg-git-green px-3 py-1.5 text-xs font-medium text-white border border-git-greenHover hover:bg-git-greenHover shadow-2xs transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Publish First Roadmap</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Roadmaps Grid */}
      {!isLoading && !error && roadmaps.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {roadmaps.map((item) => {
            const moduleCount = item.modules ? item.modules.length : 0;
            let topicCount = 0;
            let totalHours = 0;

            if (item.modules) {
              item.modules.forEach((mod) => {
                if (mod.topics) {
                  topicCount += mod.topics.length;
                  mod.topics.forEach((top) => {
                    totalHours += Number(top.estimatedHours) || 0;
                  });
                }
              });
            }

            return (
              <Link
                key={item._id}
                to={`/explore/${item._id}`}
                onClick={(e) => handleRoadmapClick(e, item)}
                className="group flex flex-col justify-between rounded-lg border border-git-border bg-white p-4 shadow-2xs hover:border-git-indigo hover:shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-indigo"
              >
                <div className="space-y-2.5">
                  {/* Top Badges Row */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium text-git-indigoText bg-git-indigoSubtle border border-git-indigo/20 truncate max-w-[150px]">
                      {item.subject}
                    </span>
                    <span className="text-[10px] font-mono text-git-textSubtle">
                      v{item.version || 1}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-sm font-semibold text-git-text group-hover:text-git-indigoText line-clamp-1 transition-colors">
                    {item.title}
                  </h2>

                  {/* University & Semester (if provided) */}
                  {(item.university || item.semester) && (
                    <div className="flex items-center space-x-2 text-[11px] text-git-textMuted">
                      {item.university && (
                        <span className="flex items-center space-x-1 truncate">
                          <Building className="h-3 w-3 text-git-textSubtle shrink-0" />
                          <span className="truncate">{item.university}</span>
                        </span>
                      )}
                      {item.university && item.semester && <span>•</span>}
                      {item.semester && (
                        <span className="flex items-center space-x-1 shrink-0">
                          <Calendar className="h-3 w-3 text-git-textSubtle shrink-0" />
                          <span>{item.semester}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-git-textMuted line-clamp-2 leading-relaxed">
                    {item.description || 'No description provided.'}
                  </p>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.tags.slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded px-1.5 py-0.2 text-[10px] font-mono text-git-textMuted bg-git-canvas border border-git-borderMuted"
                        >
                          #{t}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-[10px] text-git-textSubtle">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Metrics Row */}
                <div className="mt-4 pt-3 border-t border-git-borderMuted flex items-center justify-between text-[11px] text-git-textSubtle">
                  <div className="flex items-center space-x-2.5">
                    <span className="flex items-center space-x-1">
                      <Layers className="h-3 w-3 text-git-indigo" />
                      <span>{moduleCount} {moduleCount === 1 ? 'module' : 'modules'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <BookOpen className="h-3 w-3 text-git-green" />
                      <span>{topicCount} topics</span>
                    </span>
                  </div>

                  {totalHours > 0 && (
                    <span className="flex items-center space-x-1 font-mono text-git-textMuted">
                      <Clock className="h-3 w-3 text-git-amber" />
                      <span>{totalHours}h</span>
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-git-border pt-4">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center space-x-1 rounded-md border border-git-border bg-white px-3 py-1.5 text-xs font-medium text-git-text hover:bg-git-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-git-textMuted">
            Page <strong className="text-git-text">{currentPage}</strong> of{' '}
            <strong className="text-git-text">{totalPages}</strong>
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center space-x-1 rounded-md border border-git-border bg-white px-3 py-1.5 text-xs font-medium text-git-text hover:bg-git-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Login / Signup prompt modal for logged-out visitors */}
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        roadmap={selectedRoadmapForAuth}
        targetPath={selectedRoadmapForAuth ? `/explore/${selectedRoadmapForAuth._id}` : '/explore'}
      />
    </div>
  );
}
