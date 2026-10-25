import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  GitFork,
  GitPullRequest,
  Activity,
  BookOpen,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Overview', to: '/', icon: LayoutDashboard },
  { name: 'Explore Roadmaps', to: '/explore', icon: Compass },
  { name: 'My Roadmaps', to: '/my-roadmaps', icon: GitFork },
  { name: 'Pull Requests', to: '/pull-requests', icon: GitPullRequest },
  { name: 'Activity', to: '/activity', icon: Activity },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-git-text/20 backdrop-blur-2xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-14 left-0 z-20 w-64 transform border-r border-git-border bg-git-canvas px-3 py-4 transition-transform duration-150 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-lg md:shadow-none' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="px-2.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-git-textSubtle">
            Navigation
          </div>
          <nav className="space-y-1" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative flex items-center space-x-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-indigo ${
                      isActive
                        ? 'bg-white text-git-text border border-git-border shadow-2xs font-semibold'
                        : 'text-git-textMuted hover:bg-white hover:text-git-text border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Distinctive active left indicator using muted indigo */}
                      {isActive && (
                        <span
                          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-git-indigo"
                          aria-hidden="true"
                        />
                      )}
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-git-indigo'
                            : 'text-git-textSubtle group-hover:text-git-textMuted'
                        }`}
                      />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Concepts Section */}
          <div className="mt-6 border-t border-git-borderMuted pt-4">
            <div className="px-2.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-git-textSubtle">
              Concept Guide
            </div>
            <div className="space-y-2 px-1 text-xs text-git-textMuted">
              <div className="flex items-start space-x-2 rounded p-1.5 hover:bg-white transition-colors">
                <BookOpen className="h-3.5 w-3.5 mt-0.5 shrink-0 text-git-indigo" />
                <span className="leading-tight">
                  <strong className="font-medium text-git-text">Roadmaps:</strong> Versioned curriculum graphs
                </span>
              </div>
              <div className="flex items-start space-x-2 rounded p-1.5 hover:bg-white transition-colors">
                <GitFork className="h-3.5 w-3.5 mt-0.5 shrink-0 text-git-green" />
                <span className="leading-tight">
                  <strong className="font-medium text-git-text">Forks:</strong> Personalized study schedules
                </span>
              </div>
              <div className="flex items-start space-x-2 rounded p-1.5 hover:bg-white transition-colors">
                <GitPullRequest className="h-3.5 w-3.5 mt-0.5 shrink-0 text-git-indigo" />
                <span className="leading-tight">
                  <strong className="font-medium text-git-text">PRs:</strong> Peer-reviewed resource revisions
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
