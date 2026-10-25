import React from 'react';
import { Activity } from 'lucide-react';

export default function ActivityPage() {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold tracking-tight text-git-text">Activity</h1>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-git-canvas border border-git-border text-git-textMuted">
            Audit Log
          </span>
        </div>
        <p className="text-xs text-git-textMuted mt-1">
          Recent syllabus commits, study session completions, roadmap forks, and contribution logs.
        </p>
      </div>

      <div className="rounded-lg border border-git-border bg-white p-10 text-center shadow-2xs">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-git-amberSubtle border border-git-amber/20 text-git-amberText mb-3">
          <Activity className="h-5 w-5" />
        </div>
        <h2 className="text-sm font-semibold text-git-text">No recent activity</h2>
        <p className="mt-1.5 text-xs text-git-textMuted max-w-sm mx-auto leading-relaxed">
          As you mark study milestones, fork roadmaps, or comment on pull requests, your chronological activity timeline will be recorded here.
        </p>
      </div>
    </div>
  );
}
