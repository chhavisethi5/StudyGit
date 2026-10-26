import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Clock,
  Compass,
  GitFork,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Layers,
  BookOpen,
  PlusCircle,
  RefreshCw,
  FileEdit,
  Check,
  X,
  AlertCircle,
  Loader2,
  Video,
  FileText,
  FileCode,
  User,
  ShieldCheck,
} from 'lucide-react';
import { getPullRequestById, acceptPullRequest, rejectPullRequest } from '../api/pullRequestApi';
import { useAuth } from '../context/AuthContext';

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

export default function PullRequestDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [pullRequest, setPullRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review action modal states
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  const newlyCreated = location.state?.newlyCreated;

  const loadPullRequest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPullRequestById(id);
      setPullRequest(response.data || response);
    } catch (err) {
      setError(err.message || 'Failed to load pull request details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadPullRequest();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-4 w-48 bg-git-canvas rounded" />
        <div className="rounded-lg border border-git-border bg-white p-6 space-y-3">
          <div className="h-6 w-2/3 bg-git-canvas rounded" />
          <div className="h-4 w-1/3 bg-git-canvas rounded" />
        </div>
        <div className="h-40 bg-git-canvas rounded-lg border border-git-border" />
      </div>
    );
  }

  if (error || !pullRequest) {
    return (
      <div className="space-y-5">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-git-textMuted">
          <Link to="/pull-requests" className="hover:text-git-text inline-flex items-center space-x-1">
            <GitPullRequest className="h-3.5 w-3.5 text-git-indigo" />
            <span>Pull Requests</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-git-textSubtle" />
          <span className="text-git-text">Error</span>
        </nav>

        <div className="rounded-lg border border-git-border bg-white p-10 text-center shadow-2xs">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-git-redSubtle border border-git-red/20 text-git-redText mb-3">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h1 className="text-sm font-semibold text-git-text">Pull Request Not Found</h1>
          <p className="mt-1.5 text-xs text-git-textMuted max-w-md mx-auto">
            {error || 'The requested pull request does not exist or you do not have permission to view it.'}
          </p>
          <div className="mt-4">
            <Link
              to="/pull-requests"
              className="inline-flex items-center space-x-1.5 rounded-md border border-git-border bg-white px-3 py-1.5 text-xs font-medium text-git-text hover:bg-git-canvas transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Pull Requests</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentUserId = user?._id || user?.id;
  const originalOwnerId =
    pullRequest.originalRoadmapId?.ownerId?._id || pullRequest.originalRoadmapId?.ownerId;
  const isOriginalOwner = Boolean(
    currentUserId && originalOwnerId && currentUserId.toString() === originalOwnerId.toString()
  );
  const isProposer = Boolean(
    currentUserId &&
      pullRequest.proposerId?._id &&
      currentUserId.toString() === pullRequest.proposerId._id.toString()
  );

  // Status Badge config
  const renderStatusBadge = () => {
    switch (pullRequest.status) {
      case 'open':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white bg-git-green">
            <GitPullRequest className="h-3.5 w-3.5" />
            <span>Open</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white bg-[#8250df]">
            <Check className="h-3.5 w-3.5" />
            <span>Merged</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white bg-git-red">
            <X className="h-3.5 w-3.5" />
            <span>Closed</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Handle Accept
  const handleAccept = async () => {
    setIsProcessing(true);
    setActionFeedback(null);
    try {
      const response = await acceptPullRequest(pullRequest._id);
      setIsAcceptModalOpen(false);
      setActionFeedback({
        type: 'success',
        message: 'Pull request accepted! Proposed changes have been merged into the original roadmap.',
      });
      // Refresh PR details
      await loadPullRequest();
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Failed to accept pull request.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Reject
  const handleReject = async () => {
    setIsProcessing(true);
    setActionFeedback(null);
    try {
      await rejectPullRequest(pullRequest._id, rejectionReason);
      setIsRejectModalOpen(false);
      setActionFeedback({
        type: 'success',
        message: 'Pull request closed without modifying the original roadmap.',
      });
      // Refresh PR details
      await loadPullRequest();
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Failed to reject pull request.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-git-textMuted">
        <Link to="/pull-requests" className="hover:text-git-text inline-flex items-center space-x-1 transition-colors">
          <GitPullRequest className="h-3.5 w-3.5 text-git-indigo" />
          <span>Pull Requests</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-git-textSubtle" />
        <span className="text-git-text font-medium truncate max-w-sm">{pullRequest.title}</span>
      </nav>

      {/* Creation Flash */}
      {newlyCreated && (
        <div className="rounded-md border border-git-green/20 bg-git-greenSubtle p-3 text-xs text-git-greenText flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Pull request created successfully! The roadmap author has been notified for review.</span>
        </div>
      )}

      {/* Action Feedback */}
      {actionFeedback && (
        <div
          className={`rounded-md p-3 text-xs flex items-center space-x-2 ${
            actionFeedback.type === 'success'
              ? 'border border-git-green/20 bg-git-greenSubtle text-git-greenText'
              : 'border border-git-red/20 bg-git-redSubtle text-git-redText'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Header Info Card */}
      <section className="rounded-lg border border-git-border bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {renderStatusBadge()}
              <span className="text-xs font-mono text-git-textSubtle">
                #{pullRequest._id.slice(-6)}
              </span>
              <span className="text-xs text-git-textMuted">
                opened on {new Date(pullRequest.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })} by <strong className="text-git-text">{pullRequest.proposerId?.name || 'Contributor'}</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-git-text">
              {pullRequest.title}
            </h1>
          </div>

          {/* Upstream & Fork Badges */}
          <div className="flex flex-col sm:items-end gap-1.5 text-xs text-git-textMuted shrink-0">
            <div className="flex items-center space-x-1">
              <Compass className="h-3.5 w-3.5 text-git-indigo shrink-0" />
              <span>Target: </span>
              <Link
                to={`/explore/${pullRequest.originalRoadmapId?._id}`}
                className="font-semibold text-git-indigo hover:underline truncate max-w-xs"
              >
                {pullRequest.originalRoadmapId?.title || 'Original Roadmap'}
              </Link>
            </div>
            {pullRequest.sourceForkId && (
              <div className="flex items-center space-x-1">
                <GitFork className="h-3 w-3 text-git-green shrink-0" />
                <span>Source Fork: </span>
                <Link
                  to={`/explore/${pullRequest.sourceForkId?._id}`}
                  className="font-medium text-git-text hover:underline truncate max-w-xs"
                >
                  {pullRequest.sourceForkId?.title || 'Personal Fork'}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Status Callout Banner */}
        {pullRequest.status === 'accepted' && (
          <div className="rounded-md border border-[#8250df]/20 bg-[#f5f0ff] p-3 text-xs text-[#5c30aa] flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 shrink-0 font-bold" />
              <span>
                <strong>Accepted and Merged:</strong> Changes were merged into{' '}
                <span className="font-semibold">{pullRequest.originalRoadmapId?.title}</span> by{' '}
                {pullRequest.resolvedBy?.name || 'Roadmap Author'}{' '}
                {pullRequest.resolvedAt &&
                  `on ${new Date(pullRequest.resolvedAt).toLocaleDateString()}`}
                .
              </span>
            </div>
            <Link
              to={`/explore/${pullRequest.originalRoadmapId?._id}`}
              className="inline-flex items-center space-x-1 font-semibold underline shrink-0 hover:text-[#411e80]"
            >
              <span>View Roadmap</span>
              <ArrowLeft className="h-3 w-3 rotate-180" />
            </Link>
          </div>
        )}

        {pullRequest.status === 'rejected' && (
          <div className="rounded-md border border-git-red/20 bg-git-redSubtle p-3 text-xs text-git-redText space-y-1">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 shrink-0" />
              <span>
                <strong>Closed / Rejected:</strong> This pull request was rejected by{' '}
                {pullRequest.resolvedBy?.name || 'the author'}{' '}
                {pullRequest.resolvedAt &&
                  `on ${new Date(pullRequest.resolvedAt).toLocaleDateString()}`}
                . The original roadmap was not modified.
              </span>
            </div>
            {pullRequest.rejectionReason && (
              <div className="pl-6 text-[11px] italic text-git-textMuted">
                Reason: "{pullRequest.rejectionReason}"
              </div>
            )}
          </div>
        )}
      </section>

      {/* Description / Explanation Card */}
      <section className="rounded-lg border border-git-border bg-white p-5 shadow-2xs space-y-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-git-text pb-2 border-b border-git-borderMuted">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-git-canvas border border-git-border text-[10px] font-semibold text-git-text">
            {pullRequest.proposerId?.name ? pullRequest.proposerId.name[0].toUpperCase() : 'U'}
          </div>
          <span>
            {pullRequest.proposerId?.name || 'Proposer'}'s Explanation & Rationale
          </span>
        </div>
        <div className="text-xs sm:text-sm text-git-text leading-relaxed whitespace-pre-line pt-1">
          {pullRequest.description || (
            <span className="italic text-git-textSubtle">No explanation provided.</span>
          )}
        </div>
      </section>

      {/* Proposed Changes Diff View */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-git-text flex items-center space-x-2">
            <span>Proposed Changes</span>
            <span className="rounded-full bg-git-canvas border border-git-border px-2 py-0.5 text-[10px] font-mono text-git-textMuted">
              {pullRequest.proposedChanges?.length || 0} change
              {pullRequest.proposedChanges?.length === 1 ? '' : 's'}
            </span>
          </h2>
        </div>

        <div className="space-y-3">
          {pullRequest.proposedChanges?.map((change, idx) => (
            <div
              key={change._id || idx}
              className="rounded-lg border border-git-border bg-white shadow-2xs overflow-hidden"
            >
              {/* Change Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-git-border px-4 py-2.5 bg-git-canvas text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-git-text">Module: {change.moduleTitle}</span>
                  <span className="text-git-textSubtle">&rsaquo;</span>
                  <span className="font-medium text-git-textMuted">Topic: {change.topicTitle}</span>
                </div>

                <div>
                  {change.type === 'add_resource' && (
                    <span className="inline-flex items-center space-x-1 rounded px-2 py-0.5 text-[10px] font-medium text-git-greenText bg-git-greenSubtle border border-git-green/20">
                      <PlusCircle className="h-3 w-3" />
                      <span>Add Resource</span>
                    </span>
                  )}
                  {change.type === 'replace_resource' && (
                    <span className="inline-flex items-center space-x-1 rounded px-2 py-0.5 text-[10px] font-medium text-git-indigoText bg-git-indigoSubtle border border-git-indigo/20">
                      <RefreshCw className="h-3 w-3" />
                      <span>Replace Resource</span>
                    </span>
                  )}
                  {change.type === 'update_topic_description' && (
                    <span className="inline-flex items-center space-x-1 rounded px-2 py-0.5 text-[10px] font-medium text-git-amberText bg-git-amberSubtle border border-git-amber/20">
                      <FileEdit className="h-3 w-3" />
                      <span>Topic Description Correction</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Change Body */}
              <div className="p-4 space-y-3 text-xs">
                {/* 1. Add Resource */}
                {change.type === 'add_resource' && change.resource && (
                  <div className="rounded-md border border-git-green/30 bg-git-greenSubtle/40 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getResourceIcon(change.resource.type)}
                        <span className="font-semibold text-git-text">
                          {change.resource.title}
                        </span>
                      </div>
                      <span className="rounded bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-git-textMuted border border-git-border">
                        {change.resource.type}
                      </span>
                    </div>

                    <a
                      href={change.resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-git-indigo hover:underline font-mono text-[11px] break-all"
                    >
                      <span>{change.resource.url}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>

                    {change.resource.description && (
                      <p className="text-git-textMuted text-[11px] pt-1">
                        {change.resource.description}
                      </p>
                    )}
                  </div>
                )}

                {/* 2. Replace Resource */}
                {change.type === 'replace_resource' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Original Resource */}
                    <div className="rounded-md border border-git-red/20 bg-git-redSubtle/30 p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase text-git-redText">
                          Existing Resource to Replace
                        </span>
                      </div>
                      <div className="font-medium text-git-text line-through text-git-textMuted">
                        {change.targetResourceTitle || 'Original Resource'}
                      </div>
                    </div>

                    {/* Replacement Resource */}
                    {change.resource && (
                      <div className="rounded-md border border-git-green/30 bg-git-greenSubtle/40 p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase text-git-greenText">
                            Proposed Replacement
                          </span>
                          <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium uppercase text-git-textMuted border border-git-border">
                            {change.resource.type}
                          </span>
                        </div>
                        <div className="font-semibold text-git-text">
                          {change.resource.title}
                        </div>
                        <a
                          href={change.resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-git-indigo hover:underline font-mono text-[11px] break-all"
                        >
                          <span>{change.resource.url}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                        {change.resource.description && (
                          <p className="text-git-textMuted text-[11px] pt-0.5">
                            {change.resource.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Update Description */}
                {change.type === 'update_topic_description' && (
                  <div className="space-y-2">
                    <div className="rounded-md border border-git-border bg-git-canvas p-3 space-y-1">
                      <span className="text-[10px] font-semibold uppercase text-git-textSubtle">
                        Current Description
                      </span>
                      <p className="text-git-textMuted italic whitespace-pre-line">
                        {change.oldDescription || 'No previous description'}
                      </p>
                    </div>

                    <div className="rounded-md border border-git-green/30 bg-git-greenSubtle/30 p-3 space-y-1">
                      <span className="text-[10px] font-semibold uppercase text-git-greenText">
                        Proposed Corrected Description
                      </span>
                      <p className="text-git-text whitespace-pre-line font-medium">
                        {change.newDescription}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Review Actions Section (Owner of original roadmap only) */}
      {isOriginalOwner && pullRequest.status === 'open' && (
        <section className="rounded-lg border-2 border-git-indigo/30 bg-git-indigoSubtle/20 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-git-indigo" />
              <div>
                <h3 className="text-sm font-semibold text-git-text">
                  Author Review & Resolution
                </h3>
                <p className="text-xs text-git-textMuted">
                  You are the author of this roadmap. Review the proposed modifications and decide whether to merge or close.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-git-borderMuted">
            <button
              type="button"
              onClick={() => setIsAcceptModalOpen(true)}
              className="inline-flex items-center space-x-1.5 rounded-md border border-git-green bg-git-green px-4 py-2 text-xs font-semibold text-white hover:bg-git-greenHover shadow-2xs transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Accept and Merge Changes</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRejectModalOpen(true)}
              className="inline-flex items-center space-x-1.5 rounded-md border border-git-border bg-white px-4 py-2 text-xs font-semibold text-git-redText hover:bg-git-redSubtle hover:border-git-red/30 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Reject Request</span>
            </button>
          </div>
        </section>
      )}

      {/* Confirmation Modal: Accept and Merge */}
      {isAcceptModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-git-text/40 p-4 backdrop-blur-2xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-lg border border-git-border bg-white p-5 shadow-xl space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-git-greenSubtle border border-git-green/20 text-git-greenText">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-git-text">Confirm Merge Changes</h3>
                <p className="text-xs text-git-textMuted">Apply proposed changes directly to syllabus</p>
              </div>
            </div>

            <p className="text-xs text-git-textMuted leading-relaxed">
              Accepting this pull request will immediately update the original roadmap{' '}
              <strong className="text-git-text">"{pullRequest.originalRoadmapId?.title}"</strong>{' '}
              with all validated changes and increment its version number.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-git-border">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setIsAcceptModalOpen(false)}
                className="rounded-md border border-git-border bg-white px-3 py-1.5 text-xs font-medium text-git-text hover:bg-git-canvas"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleAccept}
                className="inline-flex items-center space-x-1.5 rounded-md border border-git-green bg-git-green px-4 py-1.5 text-xs font-semibold text-white hover:bg-git-greenHover"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Merging...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Confirm & Merge</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Reject */}
      {isRejectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-git-text/40 p-4 backdrop-blur-2xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-lg border border-git-border bg-white p-5 shadow-xl space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-git-redSubtle border border-git-red/20 text-git-redText">
                <X className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-git-text">Reject Pull Request</h3>
                <p className="text-xs text-git-textMuted">Close without applying changes</p>
              </div>
            </div>

            <p className="text-xs text-git-textMuted leading-relaxed">
              The original roadmap will remain completely unchanged. You can optionally leave a note explaining why this pull request was rejected.
            </p>

            <div>
              <label className="block text-xs font-medium text-git-text mb-1">
                Rejection Reason <span className="text-git-textSubtle">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. The proposed resource is behind a paywall, or syllabus already covers this..."
                className="w-full rounded-md border border-git-border px-3 py-1.5 text-xs text-git-text placeholder:text-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-git-border">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setIsRejectModalOpen(false)}
                className="rounded-md border border-git-border bg-white px-3 py-1.5 text-xs font-medium text-git-text hover:bg-git-canvas"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleReject}
                className="inline-flex items-center space-x-1.5 rounded-md border border-git-red bg-git-red px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <>
                    <X className="h-3.5 w-3.5" />
                    <span>Confirm Rejection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
