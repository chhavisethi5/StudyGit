import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  ChevronRight,
  BookOpen,
  Layers,
  Clock,
  ExternalLink,
  Video,
  FileText,
  FileCode,
  Tag,
  Building,
  Calendar,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CalendarDays,
  Pencil,
  GitFork,
  GitPullRequest,
  Check,
  CalendarRange,
  Lock,
  LogIn,
  Plus,
} from 'lucide-react';
import { getRoadmapById, updateTopicCompletion } from '../api/roadmapApi';
import { useAuth } from '../context/AuthContext';
import ForkRoadmapModal from '../components/ForkRoadmapModal';
import ProposeChangesModal from '../components/ProposeChangesModal';

// Resource type icon helper
const getResourceIcon = (type) => {
  switch (type) {
    case 'video':
      return <Video className="h-3.5 w-3.5 text-git-redText" />;
    case 'article':
      return <FileText className="h-3.5 w-3.5 text-git-indigoText" />;
    case 'documentation':
      return <BookOpen className="h-3.5 w-3.5 text-git-greenText" />;
    case 'pdf':
      return <FileCode className="h-3.5 w-3.5 text-git-amberText" />;
    default:
      return <ExternalLink className="h-3.5 w-3.5 text-git-textSubtle" />;
  }
};

export default function RoadmapDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [roadmap, setRoadmap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isForkModalOpen, setIsForkModalOpen] = useState(false);
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  const [updatingTopicId, setUpdatingTopicId] = useState(null);

  // Check if just navigated from creation, update, or fork flow
  const newlyCreated = location.state?.newlyCreated;
  const wasUpdated = location.state?.updated;
  const newlyForked = location.state?.newlyForked;

  useEffect(() => {
    let isMounted = true;

    const loadRoadmap = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getRoadmapById(id);
        if (isMounted) {
          setRoadmap(response.data || response);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.message || 'Failed to load roadmap. Please verify the ID or network connection.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (!authLoading && !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    if (id && isAuthenticated) {
      loadRoadmap();
    } else if (!id) {
      setError('Invalid or missing roadmap identifier');
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id, isAuthenticated, authLoading]);

  // Loading Skeleton State
  if (authLoading || (isLoading && isAuthenticated)) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 w-48 bg-git-canvas rounded" />
        <div className="rounded-lg border border-git-border bg-white p-6 space-y-4">
          <div className="h-6 w-3/4 bg-git-canvas rounded" />
          <div className="h-4 w-full bg-git-canvas rounded" />
          <div className="h-4 w-2/3 bg-git-canvas rounded" />
          <div className="flex gap-2 pt-2">
            <div className="h-5 w-20 bg-git-canvas rounded" />
            <div className="h-5 w-24 bg-git-canvas rounded" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-24 bg-git-canvas rounded-lg border border-git-border" />
          <div className="h-24 bg-git-canvas rounded-lg border border-git-border" />
        </div>
      </div>
    );
  }

  // Unauthenticated Visitor Sign-In Prompt State
  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 space-y-5">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-git-textMuted">
          <Link to="/explore" className="hover:text-git-text inline-flex items-center space-x-1 transition-colors">
            <Compass className="h-3.5 w-3.5 text-git-indigo" />
            <span>Explore Roadmaps</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-git-textSubtle" />
          <span className="text-git-text font-medium truncate">Authentication Required</span>
        </nav>

        <div className="rounded-xl border border-git-border bg-white p-8 text-center shadow-2xs space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-git-indigoSubtle border border-git-indigo/20 text-git-indigo">
            <Lock className="h-6 w-6" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-lg font-bold tracking-tight text-git-text">
              Sign in to view this roadmap
            </h1>
            <p className="text-xs text-git-textMuted max-w-sm mx-auto leading-relaxed">
              Full syllabus roadmaps with verified lecture resources, milestone checklists, and personal fork schedules are available to registered StudyGit members.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/login"
              state={{ from: location.pathname }}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 rounded-md bg-git-indigo px-4 py-2 text-xs font-semibold text-white hover:bg-git-indigoHover shadow-2xs transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Log in to continue</span>
            </Link>
            <Link
              to="/register"
              state={{ from: location.pathname }}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 rounded-md bg-git-green px-4 py-2 text-xs font-semibold text-white hover:bg-git-greenHover border border-git-greenHover shadow-2xs transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create free account</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-git-borderMuted">
            <Link
              to="/explore"
              className="text-xs text-git-textSubtle hover:text-git-indigo inline-flex items-center space-x-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Explore Roadmaps</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !roadmap) {
    return (
      <div className="space-y-5">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-git-textMuted">
          <Link to="/explore" className="hover:text-git-text inline-flex items-center space-x-1">
            <Compass className="h-3.5 w-3.5 text-git-indigo" />
            <span>Explore Roadmaps</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-git-textSubtle" />
          <span className="text-git-text">Error</span>
        </nav>

        <div className="rounded-lg border border-git-border bg-white p-10 text-center shadow-2xs">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-git-redSubtle border border-git-red/20 text-git-redText mb-3">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h1 className="text-sm font-semibold text-git-text">Roadmap Not Found</h1>
          <p className="mt-1.5 text-xs text-git-textMuted max-w-md mx-auto leading-relaxed">
            {error || 'The requested syllabus roadmap could not be found or has been removed.'}
          </p>
          <div className="mt-4">
            <Link
              to="/explore"
              className="inline-flex items-center space-x-1.5 rounded-md border border-git-border bg-white px-3 py-1.5 text-xs font-medium text-git-text hover:bg-git-canvas transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Explore Roadmaps</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculations for summary stats
  const totalModules = roadmap.modules ? roadmap.modules.length : 0;
  let totalTopics = 0;
  let totalEstimatedHours = 0;
  let completedTopicsCount = 0;

  if (roadmap.modules) {
    roadmap.modules.forEach((mod) => {
      if (mod.topics) {
        totalTopics += mod.topics.length;
        mod.topics.forEach((top) => {
          totalEstimatedHours += Number(top.estimatedHours) || 0;
          if (top.isCompleted) completedTopicsCount++;
        });
      }
    });
  }

  const progressPercent =
    totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

  // Ownership check: logged in user matches roadmap owner
  const currentUserId = user?._id || user?.id;
  const ownerIdStr = roadmap.ownerId?._id
    ? roadmap.ownerId._id.toString()
    : roadmap.ownerId
    ? roadmap.ownerId.toString()
    : null;
  const isOwner = Boolean(currentUserId && ownerIdStr && currentUserId.toString() === ownerIdStr);

  // Safe Creator Attribution
  let creatorDisplayName = 'Community contribution';
  let creatorInitials = 'CC';
  if (roadmap.ownerId && typeof roadmap.ownerId === 'object' && roadmap.ownerId.name) {
    creatorDisplayName = roadmap.ownerId.name;
    const parts = creatorDisplayName.trim().split(/\s+/);
    creatorInitials =
      parts.length > 1
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : creatorDisplayName.slice(0, 2).toUpperCase();
  } else if (roadmap.ownerId) {
    creatorDisplayName = 'Creator unknown';
    creatorInitials = 'CU';
  }

  // Handle topic completion toggle
  const handleToggleTopic = async (topicId, currentStatus) => {
    if (!isOwner) return;
    setUpdatingTopicId(topicId);

    // Optimistically update
    setRoadmap((prev) => {
      if (!prev || !prev.modules) return prev;
      return {
        ...prev,
        modules: prev.modules.map((mod) => ({
          ...mod,
          topics: (mod.topics || []).map((t) => {
            if (t._id === topicId) {
              return {
                ...t,
                isCompleted: !currentStatus,
                completedAt: !currentStatus ? new Date().toISOString() : null,
              };
            }
            return t;
          }),
        })),
      };
    });

    try {
      await updateTopicCompletion(roadmap._id, topicId, !currentStatus);
    } catch (err) {
      console.error('Failed to update topic completion:', err);
      // Revert on failure
      setRoadmap((prev) => {
        if (!prev || !prev.modules) return prev;
        return {
          ...prev,
          modules: prev.modules.map((mod) => ({
            ...mod,
            topics: (mod.topics || []).map((t) => {
              if (t._id === topicId) {
                return {
                  ...t,
                  isCompleted: currentStatus,
                  completedAt: currentStatus ? new Date().toISOString() : null,
                };
              }
              return t;
            }),
          })),
        };
      });
    } finally {
      setUpdatingTopicId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-git-textMuted">
        <Link to="/explore" className="hover:text-git-text inline-flex items-center space-x-1 transition-colors">
          <Compass className="h-3.5 w-3.5 text-git-indigo" />
          <span>Explore Roadmaps</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-git-textSubtle" />
        <span className="text-git-text font-medium truncate max-w-xs">{roadmap.title}</span>
      </nav>

      {/* Success Banner if just created, updated, or forked */}
      {newlyCreated && (
        <div className="rounded-md border border-git-green/20 bg-git-greenSubtle p-3 text-xs text-git-greenText flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Roadmap published successfully to StudyGit!</span>
        </div>
      )}

      {wasUpdated && (
        <div className="rounded-md border border-git-green/20 bg-git-greenSubtle p-3 text-xs text-git-greenText flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Roadmap updated successfully!</span>
        </div>
      )}

      {newlyForked && (
        <div className="rounded-md border border-git-green/20 bg-git-greenSubtle p-3 text-xs text-git-greenText flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Personal study fork created successfully! Track topic completion and your exam schedule below.</span>
        </div>
      )}

      {/* Header Info Card */}
      <section className="rounded-lg border border-git-border bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        {/* Fork Origin Indicator */}
        {roadmap.parentRoadmapId && (
          <div className="flex items-center space-x-1.5 text-xs text-git-textMuted bg-git-canvas border border-git-border rounded-md px-3 py-1.5">
            <GitFork className="h-3.5 w-3.5 text-git-indigo shrink-0" />
            <span>Forked from </span>
            <Link
              to={`/explore/${roadmap.parentRoadmapId._id || roadmap.parentRoadmapId}`}
              className="font-semibold text-git-indigo hover:underline truncate"
            >
              {roadmap.parentRoadmapId.title || 'Original Syllabus Roadmap'}
            </Link>
          </div>
        )}

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-git-indigoText bg-git-indigoSubtle border border-git-indigo/20">
            {roadmap.subject}
          </span>
          {roadmap.parentRoadmapId && (
            <span className="inline-flex items-center space-x-1 rounded px-2 py-0.5 text-xs font-medium text-git-indigoText bg-git-indigoSubtle border border-git-indigo/20">
              <GitFork className="h-3 w-3" />
              <span>Personal Fork</span>
            </span>
          )}
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono font-medium text-git-textMuted bg-git-canvas border border-git-border">
            v{roadmap.version || 1}
          </span>
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium text-git-greenText bg-git-greenSubtle border border-git-green/20">
            {roadmap.visibility || 'public'}
          </span>
          {isOwner && (
            <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium text-git-indigoText bg-git-indigoSubtle border border-git-indigo/20">
              Author (You)
            </span>
          )}
          {roadmap.university && (
            <span className="inline-flex items-center space-x-1 text-xs text-git-textMuted">
              <Building className="h-3 w-3 text-git-textSubtle" />
              <span>{roadmap.university}</span>
            </span>
          )}
          {roadmap.semester && (
            <span className="inline-flex items-center space-x-1 text-xs text-git-textMuted">
              <Calendar className="h-3 w-3 text-git-textSubtle" />
              <span>{roadmap.semester}</span>
            </span>
          )}
        </div>

        {/* Title, Actions & Creator Attribution */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-git-text">
                {roadmap.title}
              </h1>

              {/* Creator Attribution Section */}
              <div className="flex items-center space-x-2 text-xs text-git-textMuted">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-git-canvas border border-git-border text-[10px] font-semibold text-git-text select-none shrink-0">
                  {creatorInitials}
                </div>
                <span>
                  Created by <span className="font-semibold text-git-text">{creatorDisplayName}</span>
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 pt-0.5">
              {/* Propose changes button (Fork owner only) */}
              {roadmap.parentRoadmapId && isOwner && (
                <button
                  type="button"
                  onClick={() => setIsProposeModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 rounded-md border border-git-indigo/30 bg-git-indigoSubtle px-3 py-1.5 text-xs font-semibold text-git-indigoText hover:bg-git-indigo/15 shadow-2xs transition-colors shrink-0"
                  title="Propose syllabus resource additions or corrections to the upstream roadmap"
                >
                  <GitPullRequest className="h-3.5 w-3.5 text-git-indigo" />
                  <span>Propose changes</span>
                </button>
              )}

              {/* Fork button (on original roadmap or non-owned forks) */}
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    setIsForkModalOpen(true);
                  }
                }}
                className="inline-flex items-center space-x-1.5 rounded-md border border-git-border bg-white px-3 py-1.5 text-xs font-medium text-git-text hover:bg-git-canvas hover:border-git-borderMuted shadow-2xs transition-colors shrink-0"
                title="Fork into a personalized study plan"
              >
                <GitFork className="h-3.5 w-3.5 text-git-indigo" />
                <span>Fork Roadmap</span>
              </button>

              {/* View Pull Requests link */}
              <Link
                to="/pull-requests"
                className="inline-flex items-center space-x-1.5 rounded-md border border-git-border bg-white px-3 py-1.5 text-xs font-medium text-git-text hover:bg-git-canvas hover:border-git-borderMuted shadow-2xs transition-colors shrink-0"
                title="View pull requests"
              >
                <GitPullRequest className="h-3.5 w-3.5 text-git-textSubtle" />
                <span>Pull Requests</span>
              </Link>

              {/* Edit button (Owner only) */}
              {isOwner && (
                <Link
                  to={`/explore/${roadmap._id}/edit`}
                  className="inline-flex items-center space-x-1.5 rounded-md border border-git-border bg-white px-3 py-1.5 text-xs font-medium text-git-text hover:bg-git-canvas hover:border-git-borderMuted shadow-2xs transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5 text-git-textSubtle" />
                  <span>Edit roadmap</span>
                </Link>
              )}
            </div>
          </div>

          {roadmap.description ? (
            <p className="mt-2 text-xs sm:text-sm text-git-textMuted leading-relaxed max-w-3xl whitespace-pre-line">
              {roadmap.description}
            </p>
          ) : (
            <p className="mt-1 text-xs text-git-textSubtle italic">No description provided.</p>
          )}
        </div>

        {/* Tags */}
        {roadmap.tags && roadmap.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <Tag className="h-3 w-3 text-git-textSubtle mr-0.5" />
            {roadmap.tags.map((t, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-md bg-git-canvas px-2 py-0.5 text-[11px] font-mono text-git-text border border-git-border"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Metrics Bar */}
        <div className="pt-3 border-t border-git-borderMuted grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-git-indigo" />
            <div>
              <div className="font-semibold text-git-text">{totalModules}</div>
              <div className="text-[11px] text-git-textSubtle">Modules</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-git-green" />
            <div>
              <div className="font-semibold text-git-text">{totalTopics}</div>
              <div className="text-[11px] text-git-textSubtle">Topics</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-git-amber" />
            <div>
              <div className="font-semibold text-git-text">{totalEstimatedHours} hrs</div>
              <div className="text-[11px] text-git-textSubtle">Est. Study Time</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <CalendarDays className="h-4 w-4 text-git-textSubtle" />
            <div>
              <div className="font-semibold text-git-text">
                {roadmap.createdAt
                  ? new Date(roadmap.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recent'}
              </div>
              <div className="text-[11px] text-git-textSubtle">Published Date</div>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Study Plan & Topic Progress Tracker (for forks) */}
      {roadmap.parentRoadmapId && (
        <section className="rounded-lg border border-git-border bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-git-borderMuted pb-3">
            <div>
              <h2 className="text-sm font-semibold text-git-text flex items-center space-x-2">
                <CalendarRange className="h-4 w-4 text-git-indigo" />
                <span>Personal Study Timeline & Progress</span>
              </h2>
              <p className="text-xs text-git-textMuted mt-0.5">
                Target milestones, daily study pace, and topic completion progress.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-git-textSubtle">Daily Target:</span>
              <span className="inline-flex items-center rounded bg-git-canvas border border-git-border px-2 py-0.5 font-mono font-medium text-git-text">
                {roadmap.dailyStudyHours || 2} hrs/day
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-md border border-git-border bg-git-canvas/30 p-2.5">
              <div className="text-[11px] text-git-textSubtle">Start Date</div>
              <div className="font-semibold text-git-text mt-0.5">
                {roadmap.startDate ? new Date(roadmap.startDate).toLocaleDateString() : 'Immediate'}
              </div>
            </div>

            <div className="rounded-md border border-git-border bg-git-canvas/30 p-2.5">
              <div className="text-[11px] text-git-textSubtle">Exam / Target Date</div>
              <div className="font-semibold text-git-text mt-0.5">
                {roadmap.examDate ? new Date(roadmap.examDate).toLocaleDateString() : 'Open'}
              </div>
            </div>

            <div className="rounded-md border border-git-border bg-git-canvas/30 p-2.5">
              <div className="text-[11px] text-git-textSubtle">Days Remaining</div>
              <div className="font-semibold text-git-text mt-0.5 font-mono">
                {roadmap.examDate
                  ? `${Math.max(0, Math.ceil((new Date(roadmap.examDate) - new Date()) / (1000 * 60 * 60 * 24)))} days`
                  : 'Flexible'}
              </div>
            </div>

            <div className="rounded-md border border-git-border bg-git-canvas/30 p-2.5">
              <div className="text-[11px] text-git-textSubtle">Topic Progress</div>
              <div className="font-semibold text-git-text mt-0.5 font-mono">
                {completedTopicsCount} / {totalTopics} topics ({progressPercent}%)
              </div>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-git-textMuted">
              <span>Overall Curriculum Completion</span>
              <span className="font-semibold text-git-text font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full bg-git-canvas rounded-full h-2.5 overflow-hidden border border-git-border">
              <div
                className="bg-git-green h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Modules Curriculum Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-git-textSubtle flex items-center space-x-2">
            <Layers className="h-4 w-4 text-git-indigo" />
            <span>Syllabus Modules & Topics ({totalModules})</span>
          </h2>
        </div>

        {totalModules === 0 ? (
          <div className="rounded-lg border border-git-border bg-white p-8 text-center shadow-2xs">
            <p className="text-xs text-git-textMuted">
              No modules have been defined for this roadmap yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {roadmap.modules.map((moduleItem, mIdx) => {
              const moduleHours = (moduleItem.topics || []).reduce(
                (sum, t) => sum + (Number(t.estimatedHours) || 0),
                0
              );

              return (
                <div
                  key={moduleItem._id || mIdx}
                  className="rounded-lg border border-git-border bg-white shadow-2xs overflow-hidden"
                >
                  {/* Module Title Header */}
                  <div className="bg-git-canvas border-b border-git-border px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-white border border-git-border text-[11px] font-mono font-medium text-git-text">
                        {mIdx + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-git-text">{moduleItem.title}</h3>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-git-textMuted">
                      <span>{(moduleItem.topics || []).length} topics</span>
                      <span>•</span>
                      <span className="inline-flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-git-amber" />
                        <span>{moduleHours} hrs</span>
                      </span>
                    </div>
                  </div>

                  {/* Module Description (if present) */}
                  {moduleItem.description && (
                    <div className="px-4 py-2.5 bg-white border-b border-git-borderMuted text-xs text-git-textMuted">
                      {moduleItem.description}
                    </div>
                  )}

                  {/* Topics List */}
                  <div className="divide-y divide-git-borderMuted">
                    {(!moduleItem.topics || moduleItem.topics.length === 0) ? (
                      <div className="p-4 text-xs text-git-textSubtle italic">
                        No topics listed in this module.
                      </div>
                    ) : (
                      moduleItem.topics.map((topicItem, tIdx) => (
                        <div key={topicItem._id || tIdx} className="p-4 space-y-2.5 hover:bg-git-canvas/30 transition-colors">
                          {/* Topic Heading */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-git-text flex items-center space-x-2 flex-wrap">
                                {roadmap.parentRoadmapId ? (
                                  <button
                                    type="button"
                                    disabled={!isOwner || updatingTopicId === topicItem._id}
                                    onClick={() => handleToggleTopic(topicItem._id, topicItem.isCompleted)}
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                      topicItem.isCompleted
                                        ? 'bg-git-green border-git-green text-white'
                                        : 'border-git-border bg-white hover:border-git-indigo'
                                    } ${!isOwner ? 'cursor-default opacity-70' : 'cursor-pointer'}`}
                                    title={
                                      isOwner
                                        ? (topicItem.isCompleted ? 'Mark topic as incomplete' : 'Mark topic as complete')
                                        : 'Completion status'
                                    }
                                  >
                                    {topicItem.isCompleted && <Check className="h-3 w-3 stroke-[3]" />}
                                  </button>
                                ) : (
                                  <span className="h-1.5 w-1.5 rounded-full bg-git-indigo shrink-0" />
                                )}
                                <span className={topicItem.isCompleted ? 'line-through text-git-textMuted' : 'text-git-text'}>
                                  {topicItem.title}
                                </span>
                                {topicItem.isCompleted && (
                                  <span className="text-[10px] font-medium text-git-greenText bg-git-greenSubtle px-1.5 py-0.2 rounded border border-git-green/20">
                                    Completed
                                  </span>
                                )}
                              </h4>
                              {topicItem.description && (
                                <p className="text-xs text-git-textMuted pl-6 leading-relaxed">
                                  {topicItem.description}
                                </p>
                              )}
                            </div>

                            {topicItem.estimatedHours > 0 && (
                              <span className="inline-flex items-center space-x-1 rounded bg-git-canvas border border-git-border px-2 py-0.5 text-[10px] font-mono text-git-textMuted shrink-0">
                                <Clock className="h-3 w-3 text-git-textSubtle" />
                                <span>{topicItem.estimatedHours} hrs</span>
                              </span>
                            )}
                          </div>

                          {/* Curated Resources */}
                          {topicItem.resources && topicItem.resources.length > 0 && (
                            <div className="pl-3.5 space-y-1.5 pt-1">
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-git-textSubtle">
                                Recommended Resources
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {topicItem.resources.map((res, rIdx) => (
                                  <a
                                    key={res._id || rIdx}
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-start space-x-2 rounded-md border border-git-border bg-white p-2 hover:border-git-indigo hover:bg-git-indigoSubtle/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-indigo transition-all"
                                  >
                                    <div className="mt-0.5 shrink-0">
                                      {getResourceIcon(res.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-1">
                                        <span className="text-xs font-medium text-git-text group-hover:text-git-indigoText truncate">
                                          {res.title}
                                        </span>
                                        <ExternalLink className="h-3 w-3 text-git-textSubtle shrink-0 group-hover:text-git-indigo" />
                                      </div>
                                      {res.description && (
                                        <p className="text-[11px] text-git-textMuted truncate mt-0.5">
                                          {res.description}
                                        </p>
                                      )}
                                    </div>
                                    <span className="text-[9px] font-mono uppercase rounded px-1 py-0.2 bg-git-canvas border border-git-border text-git-textSubtle shrink-0">
                                      {res.type || 'link'}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer Back Button */}
      <div className="pt-2">
        <Link
          to="/explore"
          className="inline-flex items-center space-x-1.5 text-xs text-git-textMuted hover:text-git-text transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Explore Roadmaps</span>
        </Link>
      </div>

      {/* Fork & Personalize Modal */}
      <ForkRoadmapModal
        isOpen={isForkModalOpen}
        onClose={() => setIsForkModalOpen(false)}
        roadmap={roadmap}
      />

      {/* Propose Changes Modal */}
      {roadmap && roadmap.parentRoadmapId && isOwner && (
        <ProposeChangesModal
          isOpen={isProposeModalOpen}
          onClose={() => setIsProposeModalOpen(false)}
          fork={roadmap}
        />
      )}
    </div>
  );
}

