import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GitBranch,
  GitFork,
  GitPullRequest,
  Compass,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Layers,
  BookOpen,
  Calendar,
  Building,
  Check,
  Video,
  FileText,
  Lock,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
  Plus,
} from 'lucide-react';
import { getRoadmaps } from '../api/roadmapApi';
import AuthPromptModal from '../components/AuthPromptModal';

export default function LandingPage() {
  const navigate = useNavigate();

  // Real public roadmaps fetched from existing backend API
  const [realRoadmaps, setRealRoadmaps] = useState([]);
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(true);

  // Auth prompt modal state for clicking roadmap cards
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Mobile menu state for landing navbar
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchPublicPreviews = async () => {
      try {
        setIsLoadingRoadmaps(true);
        const res = await getRoadmaps({ limit: 6 });
        if (isMounted) {
          setRealRoadmaps(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch real roadmaps for landing preview:', err);
      } finally {
        if (isMounted) {
          setIsLoadingRoadmaps(false);
        }
      }
    };

    fetchPublicPreviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRoadmapCardClick = (roadmap) => {
    setSelectedRoadmap(roadmap);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-git-text flex flex-col selection:bg-git-indigoSubtle selection:text-git-indigoText">
      {/* 1. Pre-login Landing Navbar */}
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-git-border bg-white/95 px-4 md:px-8 backdrop-blur-xs">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="flex items-center space-x-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-indigo"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-git-canvas border border-git-border text-git-text shadow-2xs">
              <GitBranch className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-git-text">StudyGit</span>
            <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono font-medium text-git-indigoText bg-git-indigoSubtle border border-git-indigo/20">
              v0.1
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center space-x-5" aria-label="Landing Navigation">
          <Link
            to="/explore"
            className="text-xs font-medium text-git-textMuted hover:text-git-text transition-colors flex items-center space-x-1"
          >
            <Compass className="h-3.5 w-3.5 text-git-indigo" />
            <span>Explore Roadmaps</span>
          </Link>

          <div className="h-4 w-[1px] bg-git-borderMuted" />

          <Link
            to="/login"
            className="text-xs font-medium text-git-text hover:text-git-indigo transition-colors"
          >
            Log in
          </Link>

          <Link
            to="/register"
            className="inline-flex items-center space-x-1.5 rounded-md bg-git-green px-3 py-1.5 text-xs font-semibold text-white shadow-2xs border border-git-greenHover hover:bg-git-greenHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-green transition-colors"
          >
            <span>Sign up</span>
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <div className="sm:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-1.5 rounded text-git-textMuted hover:text-git-text hover:bg-git-canvas"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-git-border bg-white px-4 py-3 space-y-2.5 animate-in slide-in-from-top-2 duration-150">
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 py-1.5 text-xs font-medium text-git-text"
          >
            <Compass className="h-4 w-4 text-git-indigo" />
            <span>Explore Roadmaps</span>
          </Link>
          <div className="pt-2 border-t border-git-borderMuted flex items-center justify-between">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-medium text-git-text hover:text-git-indigo"
            >
              Log in
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center rounded-md bg-git-green px-3 py-1.5 text-xs font-semibold text-white shadow-2xs"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}

      {/* Main Landing Content Container */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="border-b border-git-border bg-gradient-to-b from-git-canvas/60 via-white to-white px-4 pt-12 pb-16 sm:px-6 md:px-8 md:pt-20 md:pb-24">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            {/* Version control pill badge */}
            <div className="inline-flex items-center space-x-2 rounded-full border border-git-indigo/25 bg-git-indigoSubtle/80 px-3 py-1 text-xs text-git-indigoText">
              <span className="flex h-1.5 w-1.5 rounded-full bg-git-indigo" />
              <span className="font-medium">Git-inspired Collaborative Study Planning</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-git-text max-w-4xl mx-auto leading-tight sm:leading-tight">
              Your goals. Your roadmap.{' '}
              <span className="text-git-indigo">Your progress.</span>
            </h1>

            {/* Product description */}
            <p className="mt-3 text-sm sm:text-base md:text-lg text-git-textMuted max-w-2xl mx-auto leading-relaxed">
              StudyGit applies proven version control workflows to higher education. University leads publish standardized syllabus roadmaps, students fork them to customize personal study timelines, and peers collaborate through reviewable resource pull requests.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-md bg-git-green px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs border border-git-greenHover hover:bg-git-greenHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-green transition-all"
              >
                <span>Create free account</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-md border border-git-border bg-white px-5 py-2.5 text-xs sm:text-sm font-medium text-git-text hover:bg-git-canvas hover:border-git-textSubtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-indigo transition-all shadow-2xs"
              >
                <Compass className="h-4 w-4 text-git-indigo" />
                <span>Explore published roadmaps</span>
              </Link>
            </div>


          </div>

          {/* 3. Realistic Product Preview */}
          <div className="max-w-4xl mx-auto mt-12 sm:mt-16">
            <div className="rounded-xl border border-git-border bg-white shadow-xl overflow-hidden">
              {/* Window Title Bar */}
              <div className="flex items-center justify-between border-b border-git-border bg-git-canvas px-4 py-2.5 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-git-border" />
                    <span className="h-2.5 w-2.5 rounded-full bg-git-border" />
                    <span className="h-2.5 w-2.5 rounded-full bg-git-border" />
                  </div>
                  <span className="text-git-border">|</span>
                  <div className="flex items-center space-x-1 font-mono text-[11px] text-git-textMuted">
                    <GitFork className="h-3.5 w-3.5 text-git-green" />
                    <span>chhavi/data-structures-and-algorithms</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 font-mono text-[10px] text-git-textSubtle">
                  <span className="inline-flex items-center space-x-1 rounded bg-white px-2 py-0.5 border border-git-border">
                    <GitBranch className="h-3 w-3 text-git-indigo" />
                    <span>main</span>
                  </span>
                  <span className="hidden sm:inline">commit 7a4f9e</span>
                </div>
              </div>

              {/* Fork Context Banner */}
              <div className="border-b border-git-border bg-git-indigoSubtle/30 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2 text-git-textMuted">
                  <GitFork className="h-3.5 w-3.5 text-git-green shrink-0" />
                  <span>
                    Forked from{' '}
                    <span className="font-semibold text-git-text">university/cs-core-dsa</span>
                  </span>
                  <span>•</span>
                  <span className="text-git-indigoText font-medium">Personal Study Schedule</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] text-git-textMuted">
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-git-amber" />
                    <span>Exam in 18 days</span>
                  </span>
                  <span>•</span>
                  <span>Goal: 2h / day</span>
                </div>
              </div>

              {/* Roadmap Header & Progress Bar */}
              <div className="p-4 sm:p-6 border-b border-git-border bg-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-git-indigoText bg-git-indigoSubtle border border-git-indigo/20">
                        Computer Science
                      </span>
                      <span className="text-[10px] font-mono text-git-textSubtle">Semester 3</span>
                    </div>
                    <h2 className="mt-1 text-base sm:text-lg font-bold text-git-text">
                      Data Structures & Algorithms
                    </h2>
                  </div>

                  {/* Upstream PR notice badge */}
                  <div className="inline-flex items-center space-x-1.5 rounded-md border border-git-indigo/30 bg-git-indigoSubtle px-2.5 py-1 text-xs font-medium text-git-indigoText">
                    <GitPullRequest className="h-3.5 w-3.5 text-git-indigo" />
                    <span>1 upstream PR under review</span>
                  </div>
                </div>

                {/* Progress Metric */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-git-text">Course Progress</span>
                    <span className="font-mono font-semibold text-git-greenText">
                      3 of 4 topics completed (75%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-git-canvas overflow-hidden border border-git-borderMuted">
                    <div className="h-full bg-git-green rounded-full w-3/4 transition-all duration-300" />
                  </div>
                </div>
              </div>

              {/* Modules & Topics Preview List */}
              <div className="divide-y divide-git-borderMuted bg-git-canvas/30 text-xs">
                {/* Module 1 */}
                <div className="p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] uppercase font-bold text-git-textSubtle">
                        Module 01
                      </span>
                      <h3 className="font-semibold text-git-text">
                        Linear Structures & Asymptotic Complexity
                      </h3>
                    </div>
                    <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-git-greenText font-medium bg-git-greenSubtle/60 px-2 py-0.5 rounded border border-git-green/20">
                      <Check className="h-3 w-3" />
                      <span>2 / 2 completed</span>
                    </span>
                  </div>

                  <div className="space-y-1.5 pl-2 sm:pl-4">
                    {/* Topic 1 */}
                    <div className="flex items-center justify-between rounded-md border border-git-border bg-white px-3 py-2 shadow-2xs">
                      <div className="flex items-center space-x-2.5">
                        <CheckCircle2 className="h-4 w-4 text-git-green shrink-0" />
                        <span className="text-git-text line-through text-git-textMuted">
                          Asymptotic Analysis & Big-O Notation
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center space-x-1 text-[10px] text-git-textSubtle font-mono">
                          <FileText className="h-3 w-3 text-git-indigo" />
                          <span>Lecture Notes</span>
                        </span>
                        <span className="text-[10px] font-mono text-git-textSubtle">4h</span>
                      </div>
                    </div>

                    {/* Topic 2 */}
                    <div className="flex items-center justify-between rounded-md border border-git-border bg-white px-3 py-2 shadow-2xs">
                      <div className="flex items-center space-x-2.5">
                        <CheckCircle2 className="h-4 w-4 text-git-green shrink-0" />
                        <span className="text-git-text line-through text-git-textMuted">
                          Dynamic Arrays & Amortized Resizing
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center space-x-1 text-[10px] text-git-textSubtle font-mono">
                          <Video className="h-3 w-3 text-git-redText" />
                          <span>Video</span>
                        </span>
                        <span className="text-[10px] font-mono text-git-textSubtle">3h</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Module 2 */}
                <div className="p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] uppercase font-bold text-git-textSubtle">
                        Module 02
                      </span>
                      <h3 className="font-semibold text-git-text">Trees & Graph Traversals</h3>
                    </div>
                    <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-git-amberText font-medium bg-git-amberSubtle/60 px-2 py-0.5 rounded border border-git-amber/20">
                      <span>1 / 2 in progress</span>
                    </span>
                  </div>

                  <div className="space-y-1.5 pl-2 sm:pl-4">
                    {/* Topic 3 */}
                    <div className="flex items-center justify-between rounded-md border border-git-border bg-white px-3 py-2 shadow-2xs">
                      <div className="flex items-center space-x-2.5">
                        <CheckCircle2 className="h-4 w-4 text-git-green shrink-0" />
                        <span className="text-git-text line-through text-git-textMuted">
                          Binary Search Trees & AVL Balancing
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-git-textSubtle">6h</span>
                    </div>

                    {/* Topic 4 (In progress) */}
                    <div className="flex items-center justify-between rounded-md border border-git-indigo bg-white px-3 py-2 shadow-xs">
                      <div className="flex items-center space-x-2.5">
                        <Circle className="h-4 w-4 text-git-indigo shrink-0" />
                        <span className="font-medium text-git-text">
                          Graph Traversal: Breadth-First & Depth-First
                        </span>
                        <span className="rounded px-1.5 py-0.2 text-[9px] font-mono font-medium text-git-indigoText bg-git-indigoSubtle border border-git-indigo/20">
                          Today's Goal
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-git-textSubtle">4h</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Visual Three-Step Workflow */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 border-b border-git-border bg-white">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-git-textSubtle">
                How It Works
              </h2>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-git-text">
                From master syllabus to personalized mastery
              </p>
              <p className="text-xs sm:text-sm text-git-textMuted max-w-xl mx-auto">
                Version control paradigms mapped directly to undergraduate and graduate coursework.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Step 1 */}
              <div className="rounded-xl border border-git-border bg-git-canvas/30 p-6 shadow-2xs relative flex flex-col justify-between space-y-4 hover:border-git-textSubtle transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-git-indigoSubtle border border-git-indigo/20 text-git-indigo">
                      <GitBranch className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-git-textSubtle">01</span>
                  </div>
                  <h3 className="text-base font-semibold text-git-text">Publish a Roadmap</h3>
                  <p className="text-xs text-git-textMuted leading-relaxed">
                    Course coordinators and student leads publish structured syllabus graphs with milestones, verified reference literature, and weekly lecture breakdowns.
                  </p>
                </div>
                <div className="pt-3 border-t border-git-borderMuted text-[11px] font-mono text-git-textSubtle flex items-center space-x-1">
                  <span>origin/master</span>
                  <span>•</span>
                  <span>Canonical course tree</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-git-border bg-git-canvas/30 p-6 shadow-2xs relative flex flex-col justify-between space-y-4 hover:border-git-textSubtle transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-git-greenSubtle border border-git-green/20 text-git-green">
                      <GitFork className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-git-textSubtle">02</span>
                  </div>
                  <h3 className="text-base font-semibold text-git-text">Fork & Personalise</h3>
                  <p className="text-xs text-git-textMuted leading-relaxed">
                    Fork master roadmaps into your personal schedule. Configure your exam deadlines, allocate daily study hour budgets, and track individual progress.
                  </p>
                </div>
                <div className="pt-3 border-t border-git-borderMuted text-[11px] font-mono text-git-greenText flex items-center space-x-1">
                  <span>student/fork</span>
                  <span>•</span>
                  <span>Custom exam calendar</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-git-border bg-git-canvas/30 p-6 shadow-2xs relative flex flex-col justify-between space-y-4 hover:border-git-textSubtle transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-git-indigoSubtle border border-git-indigo/20 text-git-indigo">
                      <GitPullRequest className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-git-textSubtle">03</span>
                  </div>
                  <h3 className="text-base font-semibold text-git-text">Propose Improvements</h3>
                  <p className="text-xs text-git-textMuted leading-relaxed">
                    Found a clearer YouTube video, solved past-year exam questions, or spotted a syllabus errata? Submit a pull request to upgrade the upstream roadmap.
                  </p>
                </div>
                <div className="pt-3 border-t border-git-borderMuted text-[11px] font-mono text-git-indigoText flex items-center space-x-1">
                  <span>pull-request</span>
                  <span>•</span>
                  <span>Peer-reviewed syllabus</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Compact Feature Sections */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 border-b border-git-border bg-git-canvas/40">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-git-textSubtle">
                Platform Capabilities
              </h2>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-git-text">
                Built for modern academic engineering
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Feature 1 */}
              <div className="rounded-lg border border-git-border bg-white p-5 shadow-2xs space-y-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-git-indigoSubtle border border-git-indigo/20 text-git-indigo">
                  <Layers className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-git-text">Shared Roadmaps</h3>
                <p className="text-xs text-git-textMuted leading-relaxed">
                  Canonical syllabi maintained across semesters with structured topic modules and verified lecture textbooks.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-lg border border-git-border bg-white p-5 shadow-2xs space-y-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-git-greenSubtle border border-git-green/20 text-git-green">
                  <Calendar className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-git-text">Personal Study Schedules</h3>
                <p className="text-xs text-git-textMuted leading-relaxed">
                  Adapt study pace to your personal timetable without disrupting the original curriculum structure.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-lg border border-git-border bg-white p-5 shadow-2xs space-y-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-git-amberSubtle border border-git-amber/20 text-git-amber">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-git-text">Progress Tracking</h3>
                <p className="text-xs text-git-textMuted leading-relaxed">
                  Check off finished units, track completed study hours, and monitor velocity leading up to midterm exams.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-lg border border-git-border bg-white p-5 shadow-2xs space-y-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-git-indigoSubtle border border-git-indigo/20 text-git-indigo">
                  <GitPullRequest className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-git-text">Pull Requests</h3>
                <p className="text-xs text-git-textMuted leading-relaxed">
                  Submit resource corrections, code snippets, and cheat sheets for instructor review and community merging.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Preview of Real Public Roadmaps (Fetched from API) */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 border-b border-git-border bg-white">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-git-textSubtle">
                  Live Public Roadmaps
                </h2>
                <p className="text-xl sm:text-2xl font-bold tracking-tight text-git-text mt-1">
                  Explore published course syllabi
                </p>
                <p className="text-xs text-git-textMuted mt-1">
                  Live roadmaps currently available on the platform. Sign in to view full modules and fork.
                </p>
              </div>

              <Link
                to="/explore"
                className="inline-flex items-center space-x-1 text-xs font-medium text-git-indigo hover:text-git-indigoHover transition-colors shrink-0"
              >
                <span>View all in Explore Directory</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Loading Skeleton */}
            {isLoadingRoadmaps && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-git-border bg-white p-4 space-y-3 animate-pulse shadow-2xs"
                  >
                    <div className="h-4 w-24 bg-git-canvas rounded" />
                    <div className="h-5 w-3/4 bg-git-canvas rounded" />
                    <div className="h-4 w-full bg-git-canvas rounded" />
                    <div className="pt-2 border-t border-git-borderMuted flex justify-between">
                      <div className="h-3 w-16 bg-git-canvas rounded" />
                      <div className="h-3 w-16 bg-git-canvas rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Real Public Roadmaps Grid */}
            {!isLoadingRoadmaps && realRoadmaps.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {realRoadmaps.slice(0, 6).map((item) => {
                  const moduleCount = item.modules ? item.modules.length : 0;
                  let topicCount = 0;
                  if (item.modules) {
                    item.modules.forEach((mod) => {
                      if (mod.topics) topicCount += mod.topics.length;
                    });
                  }

                  return (
                    <div
                      key={item._id}
                      onClick={() => handleRoadmapCardClick(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleRoadmapCardClick(item);
                        }
                      }}
                      className="group cursor-pointer flex flex-col justify-between rounded-lg border border-git-border bg-white p-4 shadow-2xs hover:border-git-indigo hover:shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-indigo"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium text-git-indigoText bg-git-indigoSubtle border border-git-indigo/20 truncate max-w-[150px]">
                            {item.subject}
                          </span>
                          <span className="text-[10px] font-mono text-git-textSubtle">
                            v{item.version || 1}
                          </span>
                        </div>

                        <h3 className="text-sm font-semibold text-git-text group-hover:text-git-indigoText line-clamp-1 transition-colors">
                          {item.title}
                        </h3>

                        {(item.university || item.semester) && (
                          <div className="flex items-center space-x-2 text-[11px] text-git-textMuted">
                            {item.university && (
                              <span className="flex items-center space-x-1 truncate">
                                <Building className="h-3 w-3 text-git-textSubtle shrink-0" />
                                <span className="truncate">{item.university}</span>
                              </span>
                            )}
                            {item.university && item.semester && <span>•</span>}
                            {item.semester && <span>{item.semester}</span>}
                          </div>
                        )}

                        <p className="text-xs text-git-textMuted line-clamp-2 leading-relaxed">
                          {item.description || 'Public curriculum roadmap.'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-git-borderMuted flex items-center justify-between text-[11px] text-git-textSubtle">
                        <span className="flex items-center space-x-1">
                          <Layers className="h-3 w-3 text-git-indigo" />
                          <span>{moduleCount} {moduleCount === 1 ? 'module' : 'modules'}</span>
                        </span>

                        <span className="inline-flex items-center space-x-1 font-medium text-git-indigo group-hover:underline">
                          <Lock className="h-3 w-3" />
                          <span>Sign in to view</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isLoadingRoadmaps && realRoadmaps.length === 0 && (
              <div className="rounded-lg border border-git-border bg-git-canvas p-8 text-center text-xs text-git-textMuted">
                No roadmaps currently published. Be the first to create one after registering!
              </div>
            )}
          </div>
        </section>

        {/* 7. Final Signup CTA */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 bg-git-canvas/50">
          <div className="max-w-4xl mx-auto rounded-xl border border-git-border bg-white p-8 sm:p-12 text-center shadow-2xs space-y-5">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-git-greenSubtle border border-git-green/20 text-git-green">
              <GitBranch className="h-5 w-5" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-git-text">
              Start organizing your semester with version control
            </h2>

            <p className="text-xs sm:text-sm text-git-textMuted max-w-lg mx-auto leading-relaxed">
              Join students and instructors building clearer syllabi, personalized study milestones, and peer-reviewed learning resources.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 rounded-md bg-git-green px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs border border-git-greenHover hover:bg-git-greenHover transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Create free account</span>
              </Link>
              <Link
                to="/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 rounded-md border border-git-border bg-white px-5 py-2.5 text-xs sm:text-sm font-medium text-git-text hover:bg-git-canvas transition-all"
              >
                <Compass className="h-4 w-4 text-git-indigo" />
                <span>Explore Roadmaps</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Landing Footer */}
      <footer className="border-t border-git-border bg-white px-4 py-8 text-xs text-git-textSubtle sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <GitBranch className="h-4 w-4 text-git-indigo" />
            <span className="font-semibold text-git-text">StudyGit</span>
            <span>— A Git-inspired collaborative study planner</span>
          </div>

          <div className="flex items-center space-x-5 text-git-textMuted">
            <Link to="/explore" className="hover:text-git-text transition-colors">
              Explore Roadmaps
            </Link>
            <Link to="/login" className="hover:text-git-text transition-colors">
              Log in
            </Link>
            <Link to="/register" className="hover:text-git-text transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </footer>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        roadmap={selectedRoadmap}
        targetPath={selectedRoadmap ? `/explore/${selectedRoadmap._id}` : '/explore'}
      />
    </div>
  );
}
