import React from 'react';
import { GitPullRequest } from 'lucide-react';

export default function PullRequestsPage() {
  return (
    <div className="space-y-5">
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

      <div className="rounded-lg border border-git-border bg-white p-10 text-center shadow-2xs">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-git-indigoSubtle border border-git-indigo/20 text-git-indigo mb-3">
          <GitPullRequest className="h-5 w-5" />
        </div>
        <h2 className="text-sm font-semibold text-git-text">No open pull requests</h2>
        <p className="mt-1.5 text-xs text-git-textMuted max-w-sm mx-auto leading-relaxed">
          Community proposals to update syllabi, suggest reference materials, or fix errata will appear here for review.
        </p>
      </div>
    </div>
  );
}
