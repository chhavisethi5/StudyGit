import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  GitFork,
  Plus,
  Compass,
  Layers,
  BookOpen,
  Clock,
  Building,
  Calendar,
  AlertCircle,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyRoadmaps } from '../api/roadmapApi';

export default function MyRoadmapsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [roadmaps, setRoadmaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserRoadmaps = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getMyRoadmaps();
      setRoadmaps(response.data || []);
    } catch (err) {
      console.error('Error fetching personal roadmaps:', err);
      setError(
        err.message || 'Unable to load your roadmaps. Please verify your connection.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchUserRoadmaps();
    } else if (!authLoading && !isAuthenticated) {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, fetchUserRoadmaps]);

  // Loading Session State
  if (authLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-git-canvas rounded" />
        <div className="h-32 bg-git-canvas rounded-lg border border-git-border" />
      </div>
    );
  }

  // Unauthenticated Guest State
  if (!isAuthenticated) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-git-text">My Roadmaps</h1>
          <p className="text-xs text-git-textMuted mt-1">
            Personal study schedules, author contributions, and curriculum milestones.
          </p>
        </div>

        <div className="rounded-lg border border-git-border bg-white p-10 text-center shadow-2xs">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-git-indigoSubtle border border-git-indigo/20 text-git-indigo mb-3">
            <GitFork className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-semibold text-git-text">Sign in to view your roadmaps</h2>
          <p className="mt-1.5 text-xs text-git-textMuted max-w-sm mx-auto leading-relaxed">
            Authentication is required to track your published syllabi, study progress, and personalized curriculum schedules.
          </p>
          <div className="mt-4 flex items-center justify-center space-x-3">
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 rounded-md bg-git-green px-3 py-1.5 text-xs font-medium text-white border border-git-greenHover hover:bg-git-greenHover shadow-2xs transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign in</span>
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center space-x-1.5 rounded-md border border-git-border bg-white px-3 py-1.5 text-xs font-medium text-git-text hover:bg-git-canvas transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Create account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-git-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-git-text">My Roadmaps</h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-git-canvas border border-git-border text-git-textMuted">
              {user?.name || 'Personal'}
            </span>
          </div>
          <p className="text-xs text-git-textMuted mt-1">
            Curriculum syllabi and study schedules authored by your account ({user?.email}).
          </p>
        </div>

        {/* Action Button */}
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

      {/* Result Status Bar */}
      <div className="flex items-center justify-between text-xs text-git-textMuted px-0.5">
        <div>
          {isLoading ? (
            <span>Loading personal roadmaps...</span>
          ) : (
            <span>
              You have authored <strong className="text-git-text">{roadmaps.length}</strong>{' '}
              {roadmaps.length === 1 ? 'roadmap' : 'roadmaps'}
            </span>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-md border border-git-red/20 bg-git-redSubtle p-4 text-xs text-git-redText flex items-start space-x-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Error:</span> {error}
            <div className="mt-2">
              <button
                type="button"
                onClick={fetchUserRoadmaps}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-git-border bg-white p-4 space-y-3 animate-pulse shadow-2xs"
            >
              <div className="h-4 w-24 bg-git-canvas rounded" />
              <div className="h-5 w-3/4 bg-git-canvas rounded" />
              <div className="h-4 w-full bg-git-canvas rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && roadmaps.length === 0 && (
        <div className="rounded-lg border border-git-border bg-white p-10 text-center shadow-2xs">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-git-indigoSubtle border border-git-indigo/20 text-git-indigo mb-3">
            <GitFork className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-semibold text-git-text">You haven't created any roadmaps yet</h2>
          <p className="mt-1.5 text-xs text-git-textMuted max-w-sm mx-auto leading-relaxed">
            Publish your first curriculum roadmap with sequential study units, or browse community syllabi to get started.
          </p>
          <div className="mt-4 flex items-center justify-center space-x-3">
            <Link
              to="/explore/new"
              className="inline-flex items-center space-x-1.5 rounded-md bg-git-green px-3 py-1.5 text-xs font-medium text-white border border-git-greenHover hover:bg-git-greenHover shadow-2xs transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create a Roadmap</span>
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center space-x-1.5 rounded-md border border-git-border bg-white px-3 py-1.5 text-xs font-medium text-git-text hover:bg-git-canvas transition-colors"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Explore Directory</span>
            </Link>
          </div>
        </div>
      )}

      {/* Roadmaps Grid */}
      {!isLoading && !error && roadmaps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmaps.map((item) => {
            const moduleCount = item.modules ? item.modules.length : 0;
            let topicCount = 0;
            let totalHours = 0;
            let completedCount = 0;

            if (item.modules) {
              item.modules.forEach((mod) => {
                if (mod.topics) {
                  topicCount += mod.topics.length;
                  mod.topics.forEach((top) => {
                    totalHours += Number(top.estimatedHours) || 0;
                    if (top.isCompleted) completedCount++;
                  });
                }
              });
            }

            const isFork = Boolean(item.parentRoadmapId);

            return (
              <Link
                key={item._id}
                to={`/explore/${item._id}`}
                className="group flex flex-col justify-between rounded-lg border border-git-border bg-white p-4 shadow-2xs hover:border-git-indigo hover:shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-indigo"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium text-git-indigoText bg-git-indigoSubtle border border-git-indigo/20 truncate max-w-[150px]">
                      {item.subject}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {isFork ? (
                        <span className="inline-flex items-center space-x-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-git-indigoText bg-git-indigoSubtle border border-git-indigo/20">
                          <GitFork className="h-2.5 w-2.5" />
                          <span>Personal Fork</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded px-1.5 py-0.2 text-[10px] font-medium text-git-greenText bg-git-greenSubtle border border-git-green/20">
                          Original
                        </span>
                      )}
                      <span className="inline-flex items-center rounded px-1.5 py-0.2 text-[10px] font-mono text-git-textMuted bg-git-canvas border border-git-border">
                        {item.visibility || 'public'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-git-text group-hover:text-git-indigoText line-clamp-1 transition-colors">
                      {item.title}
                    </h2>

                    {/* Link back to original roadmap for forks */}
                    {isFork && item.parentRoadmapId && (
                      <div className="flex items-center space-x-1 text-[11px] text-git-textMuted pt-0.5">
                        <GitFork className="h-3 w-3 text-git-textSubtle shrink-0" />
                        <span>Forked from </span>
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = `/explore/${item.parentRoadmapId._id || item.parentRoadmapId}`;
                          }}
                          className="font-medium text-git-indigo hover:underline truncate max-w-[180px]"
                        >
                          {item.parentRoadmapId.title || 'Original Syllabus'}
                        </span>
                      </div>
                    )}
                  </div>

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

                  <p className="text-xs text-git-textMuted line-clamp-2 leading-relaxed">
                    {item.description || 'No description provided.'}
                  </p>

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
                    </div>
                  )}
                </div>

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

                  {isFork ? (
                    <span className="flex items-center space-x-1 font-mono text-[10px] text-git-greenText bg-git-greenSubtle px-1.5 py-0.5 rounded border border-git-green/20">
                      <span>{completedCount}/{topicCount} done</span>
                    </span>
                  ) : (
                    totalHours > 0 && (
                      <span className="flex items-center space-x-1 font-mono text-git-textMuted">
                        <Clock className="h-3 w-3 text-git-amber" />
                        <span>{totalHours}h</span>
                      </span>
                    )
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
