import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitPullRequest,
  Check,
  X,
  Clock,
  Compass,
  GitFork,
  ArrowRight,
  Filter,
  PlusCircle,
  RefreshCw,
  FileEdit,
  Loader2,
  AlertCircle,
  Inbox,
  Send,
  LogIn,
} from 'lucide-react';
import { getMyPullRequests, getReceivedPullRequests } from '../api/pullRequestApi';
import { useAuth } from '../context/AuthContext';

export default function PullRequestsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Active tab: 'received' | 'mine'
  const [activeTab, setActiveTab] = useState('received');
  // Status filter: 'all' | 'open' | 'accepted' | 'rejected'
  const [statusFilter, setStatusFilter] = useState('all');

  const [receivedPRs, setReceivedPRs] = useState([]);
  const [myPRs, setMyPRs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPRs = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [receivedRes, myRes] = await Promise.all([
        getReceivedPullRequests(),
        getMyPullRequests(),
      ]);
      setReceivedPRs(receivedRes.data || []);
      setMyPRs(myRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load pull requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchPRs();
    }
  }, [isAuthenticated, authLoading]);

  // Open counts for badge
  const openReceivedCount = receivedPRs.filter((pr) => pr.status === 'open').length;
  const openMyCount = myPRs.filter((pr) => pr.status === 'open').length;

  const currentList = activeTab === 'received' ? receivedPRs : myPRs;
  const filteredList = currentList.filter((pr) => {
    if (statusFilter === 'all') return true;
    return pr.status === statusFilter;
  });

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-git-greenText bg-git-greenSubtle border border-git-green/20">
            <GitPullRequest className="h-3 w-3" />
            <span>Open</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-[#5c30aa] bg-[#f5f0ff] border border-[#8250df]/20">
            <Check className="h-3 w-3" />
            <span>Merged</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-git-redText bg-git-redSubtle border border-git-red/20">
            <X className="h-3 w-3" />
            <span>Closed</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold tracking-tight text-git-text">Pull Requests</h1>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-git-canvas border border-git-border text-git-textMuted">
            Review
          </span>
        </div>
        <p className="text-xs text-git-textMuted mt-1">
          Review community recommendations, resource additions, and textbook chapter corrections.
        </p>
      </div>

      {/* Guest Login State */}
      {!isAuthenticated && !authLoading && (
        <div className="rounded-lg border border-git-border bg-white p-8 text-center shadow-2xs space-y-3">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-git-indigoSubtle border border-git-indigo/20 text-git-indigo">
            <LogIn className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-semibold text-git-text">Sign in to manage Pull Requests</h2>
          <p className="text-xs text-git-textMuted max-w-sm mx-auto">
            Log in to view incoming change proposals to your roadmaps or track contributions submitted from your forks.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 rounded-md border border-git-green bg-git-green px-4 py-1.5 text-xs font-semibold text-white hover:bg-git-greenHover transition-colors"
            >
              <span>Sign In to StudyGit</span>
            </Link>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <>
          {/* Main Tabs & Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-git-border pb-2">
            {/* Top Navigation Tabs */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('received');
                  setStatusFilter('all');
                }}
                className={`flex items-center space-x-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === 'received'
                    ? 'bg-git-indigoSubtle text-git-indigo border border-git-indigo/20 shadow-2xs'
                    : 'text-git-textMuted hover:bg-git-canvas hover:text-git-text'
                }`}
              >
                <Inbox className="h-4 w-4" />
                <span>Received Requests</span>
                {openReceivedCount > 0 && (
                  <span className="rounded-full bg-git-green text-white px-1.5 py-0.2 text-[10px] font-bold">
                    {openReceivedCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('mine');
                  setStatusFilter('all');
                }}
                className={`flex items-center space-x-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === 'mine'
                    ? 'bg-git-indigoSubtle text-git-indigo border border-git-indigo/20 shadow-2xs'
                    : 'text-git-textMuted hover:bg-git-canvas hover:text-git-text'
                }`}
              >
                <Send className="h-4 w-4" />
                <span>Submitted by You</span>
                {openMyCount > 0 && (
                  <span className="rounded-full bg-git-canvas border border-git-border text-git-textMuted px-1.5 py-0.2 text-[10px] font-bold">
                    {openMyCount}
                  </span>
                )}
              </button>
            </div>

            {/* Status Pills */}
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-[11px] text-git-textSubtle mr-1">Filter:</span>
              {['all', 'open', 'accepted', 'rejected'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                    statusFilter === status
                      ? 'bg-git-text text-white font-semibold'
                      : 'bg-git-canvas text-git-textMuted hover:text-git-text border border-git-border'
                  }`}
                >
                  {status === 'accepted' ? 'Merged' : status === 'rejected' ? 'Closed' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-git-canvas animate-pulse rounded-lg border border-git-border"
                />
              ))}
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="rounded-md border border-git-red/20 bg-git-redSubtle p-3 text-xs text-git-redText flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* PR Items List */}
          {!isLoading && !error && (
            <div className="space-y-2.5">
              {filteredList.length === 0 ? (
                <div className="rounded-lg border border-git-border bg-white p-10 text-center shadow-2xs">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-git-indigoSubtle border border-git-indigo/20 text-git-indigo mb-3">
                    <GitPullRequest className="h-5 w-5" />
                  </div>
                  <h2 className="text-sm font-semibold text-git-text">
                    {activeTab === 'received'
                      ? 'No received pull requests'
                      : 'No pull requests submitted'}
                  </h2>
                  <p className="mt-1.5 text-xs text-git-textMuted max-w-sm mx-auto leading-relaxed">
                    {activeTab === 'received'
                      ? 'When other students propose resource recommendations or syllabus corrections from their forks to your roadmaps, they will appear here.'
                      : 'To submit a pull request, fork any public syllabus roadmap, make adjustments, and click "Propose changes".'}
                  </p>
                  <div className="mt-4">
                    <Link
                      to="/explore"
                      className="inline-flex items-center space-x-1.5 rounded-md border border-git-border bg-white px-3 py-1.5 text-xs font-medium text-git-text hover:bg-git-canvas transition-colors"
                    >
                      <Compass className="h-3.5 w-3.5 text-git-indigo" />
                      <span>Explore Public Roadmaps</span>
                    </Link>
                  </div>
                </div>
              ) : (
                filteredList.map((pr) => (
                  <div
                    key={pr._id}
                    className="rounded-lg border border-git-border bg-white p-4 shadow-2xs hover:border-git-borderMuted transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {renderStatusBadge(pr.status)}
                        <Link
                          to={`/pull-requests/${pr._id}`}
                          className="text-sm font-bold text-git-text hover:text-git-indigo hover:underline truncate"
                        >
                          {pr.title}
                        </Link>
                        <span className="text-[11px] font-mono text-git-textSubtle">
                          #{pr._id.slice(-6)}
                        </span>
                      </div>

                      {/* Meta links */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-git-textMuted">
                        <span className="flex items-center space-x-1">
                          <Compass className="h-3 w-3 text-git-indigo" />
                          <span>Target:</span>
                          <Link
                            to={`/explore/${pr.originalRoadmapId?._id}`}
                            className="font-medium text-git-text hover:underline truncate max-w-[200px]"
                          >
                            {pr.originalRoadmapId?.title || 'Original Roadmap'}
                          </Link>
                        </span>

                        {pr.sourceForkId && (
                          <span className="flex items-center space-x-1">
                            <GitFork className="h-3 w-3 text-git-green" />
                            <span>From:</span>
                            <span className="font-medium text-git-text truncate max-w-[180px]">
                              {pr.sourceForkId?.title || 'Fork'}
                            </span>
                          </span>
                        )}

                        <span className="text-git-textSubtle">
                          by <strong className="text-git-text">{pr.proposerId?.name || 'User'}</strong> &bull;{' '}
                          {new Date(pr.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Change summaries */}
                      {pr.proposedChanges && pr.proposedChanges.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {pr.proposedChanges.map((change, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center space-x-1 rounded bg-git-canvas border border-git-border px-1.5 py-0.5 text-[10px] text-git-textMuted"
                            >
                              {change.type === 'add_resource' && (
                                <>
                                  <PlusCircle className="h-3 w-3 text-git-greenText" />
                                  <span>+ Resource: {change.topicTitle}</span>
                                </>
                              )}
                              {change.type === 'replace_resource' && (
                                <>
                                  <RefreshCw className="h-3 w-3 text-git-indigoText" />
                                  <span>~ Resource: {change.topicTitle}</span>
                                </>
                              )}
                              {change.type === 'update_topic_description' && (
                                <>
                                  <FileEdit className="h-3 w-3 text-git-amberText" />
                                  <span>✎ Desc: {change.topicTitle}</span>
                                </>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* View Details Link Button */}
                    <div className="shrink-0 pt-1 sm:pt-0">
                      <Link
                        to={`/pull-requests/${pr._id}`}
                        className="inline-flex items-center space-x-1 rounded-md border border-git-border bg-git-canvas px-3 py-1.5 text-xs font-medium text-git-text hover:bg-white hover:border-git-borderMuted shadow-2xs transition-colors"
                      >
                        <span>Review Changes</span>
                        <ArrowRight className="h-3 w-3 text-git-textSubtle" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
