import React from 'react';
import { Link } from 'react-router-dom';
import {
  GitBranch,
  GitFork,
  GitPullRequest,
  ArrowRight,
} from 'lucide-react';

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <section className="rounded-lg border border-git-border bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col space-y-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-git-text">
              StudyGit
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-git-textMuted leading-relaxed max-w-3xl">
              A Git-inspired collaborative study planner. Instructors and student leads publish syllabus
              roadmaps, students fork them to customize personal study timelines, and the community
              proposes resource upgrades via pull requests.
            </p>
          </div>

          {/* Conceptual Git Flow Ribbon */}
          <div className="pt-3 border-t border-git-borderMuted">
            <div className="flex flex-wrap items-center gap-2 text-xs text-git-textMuted">
              <span className="font-medium text-git-text">Collaborative Flow:</span>
              <span className="inline-flex items-center space-x-1.5 rounded bg-git-canvas px-2.5 py-1 border border-git-border text-git-text">
                <GitBranch className="h-3.5 w-3.5 text-git-indigo" />
                <span>Publish Roadmap</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-git-textSubtle" />
              <span className="inline-flex items-center space-x-1.5 rounded bg-git-canvas px-2.5 py-1 border border-git-border text-git-text">
                <GitFork className="h-3.5 w-3.5 text-git-green" />
                <span>Fork & Personalize</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-git-textSubtle" />
              <span className="inline-flex items-center space-x-1.5 rounded bg-git-canvas px-2.5 py-1 border border-git-border text-git-text">
                <GitPullRequest className="h-3.5 w-3.5 text-git-indigo" />
                <span>Propose Revisions</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Concepts Grid */}
      <section>
        <div className="mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-git-textSubtle">
            Core Workflow Concepts
          </h2>
          <p className="text-xs text-git-textMuted mt-0.5">
            How version control paradigms map to university curricula and student study schedules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Syllabus Roadmaps */}
          <div className="rounded-lg border border-git-border bg-white p-5 shadow-2xs hover:border-git-textSubtle transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-git-indigoSubtle border border-git-indigo/20 text-git-indigo">
                  <GitBranch className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-git-canvas border border-git-border text-git-textSubtle">
                  Master Trees
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-git-text">
                Syllabus Roadmaps
              </h3>
              <p className="mt-1.5 text-xs text-git-textMuted leading-relaxed">
                Standardized course syllabi organized as dependency graphs with milestones, verified
                reference textbooks, and weekly lecture schedules.
              </p>
            </div>
            <Link
              to="/explore"
              className="mt-4 pt-3 border-t border-git-borderMuted text-[11px] font-medium text-git-indigo hover:text-git-indigoHover flex items-center justify-between transition-colors"
            >
              <span>Explore published roadmaps</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Card 2: Forks & Personalization */}
          <div className="rounded-lg border border-git-border bg-white p-5 shadow-2xs hover:border-git-textSubtle transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-git-greenSubtle border border-git-green/20 text-git-green">
                  <GitFork className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-git-canvas border border-git-border text-git-textSubtle">
                  Personal Forks
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-git-text">
                Forks & Timelines
              </h3>
              <p className="mt-1.5 text-xs text-git-textMuted leading-relaxed">
                Students fork master roadmaps into private or public copies to adapt deadlines,
                pace weekly studies, and check off completed units.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-git-borderMuted text-[11px] text-git-textSubtle">
              Tailored student scheduling
            </div>
          </div>

          {/* Card 3: Pull Requests */}
          <div className="rounded-lg border border-git-border bg-white p-5 shadow-2xs hover:border-git-textSubtle transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-git-indigoSubtle border border-git-indigo/20 text-git-indigo">
                  <GitPullRequest className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-git-canvas border border-git-border text-git-textSubtle">
                  Peer Review
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-git-text">
                Pull Requests
              </h3>
              <p className="mt-1.5 text-xs text-git-textMuted leading-relaxed">
                Contribute solved exam questions, clearer video lecture links, or syllabus errata
                back to the community roadmap through reviewable pull requests.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-git-borderMuted text-[11px] text-git-textSubtle">
              Collaborative curation
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
