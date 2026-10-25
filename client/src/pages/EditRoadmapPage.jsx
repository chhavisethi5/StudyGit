import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  Clock,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Save,
  Loader2,
} from 'lucide-react';
import { getRoadmapById, updateRoadmap } from '../api/roadmapApi';
import { useAuth } from '../context/AuthContext';

export default function EditRoadmapPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Loading and initial fetch state
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [originalRoadmap, setOriginalRoadmap] = useState(null);

  // Editable Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [university, setUniversity] = useState('');
  const [semester, setSemester] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [modules, setModules] = useState([]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  // Fetch existing roadmap
  useEffect(() => {
    let isMounted = true;

    const fetchRoadmap = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await getRoadmapById(id);
        const data = response.data || response;

        if (isMounted) {
          setOriginalRoadmap(data);
          // Prepopulate fields
          setTitle(data.title || '');
          setSubject(data.subject || '');
          setDescription(data.description || '');
          setUniversity(data.university || '');
          setSemester(data.semester || '');
          setTagsInput(Array.isArray(data.tags) ? data.tags.join(', ') : '');
          setVisibility(data.visibility || 'public');

          // Deep copy modules with topics and resources
          if (Array.isArray(data.modules) && data.modules.length > 0) {
            const formattedModules = data.modules.map((mod) => ({
              title: mod.title || '',
              description: mod.description || '',
              topics: Array.isArray(mod.topics)
                ? mod.topics.map((t) => ({
                    title: t.title || '',
                    description: t.description || '',
                    estimatedHours: Number(t.estimatedHours) || 0,
                    resources: Array.isArray(t.resources)
                      ? t.resources.map((r) => ({
                          title: r.title || '',
                          url: r.url || '',
                          type: r.type || 'article',
                          description: r.description || '',
                        }))
                      : [],
                  }))
                : [],
            }));
            setModules(formattedModules);
          } else {
            setModules([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setLoadError(
            err.message || 'Failed to load roadmap. Please verify the ID or your connection.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (id) {
      fetchRoadmap();
    } else {
      setLoadError('Invalid roadmap identifier.');
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Ownership verification helper
  const getOwnerId = (roadmap) => {
    if (!roadmap || !roadmap.ownerId) return null;
    return roadmap.ownerId._id ? roadmap.ownerId._id.toString() : roadmap.ownerId.toString();
  };

  const currentUserId = user?._id || user?.id;
  const roadmapOwnerId = getOwnerId(originalRoadmap);
  const isOwner = Boolean(
    isAuthenticated && currentUserId && roadmapOwnerId && currentUserId.toString() === roadmapOwnerId
  );

  // Module Handlers
  const addModule = () => {
    setModules((prev) => [
      ...prev,
      {
        title: `Module ${prev.length + 1}`,
        description: '',
        topics: [],
      },
    ]);
  };

  const removeModule = (mIndex) => {
    setModules((prev) => prev.filter((_, idx) => idx !== mIndex));
  };

  const updateModule = (mIndex, field, value) => {
    setModules((prev) => {
      const copy = [...prev];
      copy[mIndex] = { ...copy[mIndex], [field]: value };
      return copy;
    });
  };

  // Topic Handlers
  const addTopic = (mIndex) => {
    setModules((prev) => {
      const copy = [...prev];
      const targetModule = { ...copy[mIndex] };
      targetModule.topics = [
        ...targetModule.topics,
        {
          title: '',
          description: '',
          estimatedHours: 2,
          resources: [],
        },
      ];
      copy[mIndex] = targetModule;
      return copy;
    });
  };

  const removeTopic = (mIndex, tIndex) => {
    setModules((prev) => {
      const copy = [...prev];
      const targetModule = { ...copy[mIndex] };
      targetModule.topics = targetModule.topics.filter((_, idx) => idx !== tIndex);
      copy[mIndex] = targetModule;
      return copy;
    });
  };

  const updateTopic = (mIndex, tIndex, field, value) => {
    setModules((prev) => {
      const copy = [...prev];
      const targetModule = { ...copy[mIndex] };
      const topicsCopy = [...targetModule.topics];
      topicsCopy[tIndex] = { ...topicsCopy[tIndex], [field]: value };
      targetModule.topics = topicsCopy;
      copy[mIndex] = targetModule;
      return copy;
    });
  };

  // Resource Handlers
  const addResource = (mIndex, tIndex) => {
    setModules((prev) => {
      const copy = [...prev];
      const targetModule = { ...copy[mIndex] };
      const topicsCopy = [...targetModule.topics];
      const targetTopic = { ...topicsCopy[tIndex] };
      targetTopic.resources = [
        ...targetTopic.resources,
        {
          title: '',
          url: '',
          type: 'article',
          description: '',
        },
      ];
      topicsCopy[tIndex] = targetTopic;
      targetModule.topics = topicsCopy;
      copy[mIndex] = targetModule;
      return copy;
    });
  };

  const removeResource = (mIndex, tIndex, rIndex) => {
    setModules((prev) => {
      const copy = [...prev];
      const targetModule = { ...copy[mIndex] };
      const topicsCopy = [...targetModule.topics];
      const targetTopic = { ...topicsCopy[tIndex] };
      targetTopic.resources = targetTopic.resources.filter((_, idx) => idx !== rIndex);
      topicsCopy[tIndex] = targetTopic;
      targetModule.topics = topicsCopy;
      copy[mIndex] = targetModule;
      return copy;
    });
  };

  const updateResource = (mIndex, tIndex, rIndex, field, value) => {
    setModules((prev) => {
      const copy = [...prev];
      const targetModule = { ...copy[mIndex] };
      const topicsCopy = [...targetModule.topics];
      const targetTopic = { ...topicsCopy[tIndex] };
      const resourcesCopy = [...targetTopic.resources];
      resourcesCopy[rIndex] = { ...resourcesCopy[rIndex], [field]: value };
      targetTopic.resources = resourcesCopy;
      topicsCopy[tIndex] = targetTopic;
      targetModule.topics = topicsCopy;
      copy[mIndex] = targetModule;
      return copy;
    });
  };

  // Validation
  const validateForm = () => {
    const errors = {};

    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.trim().length > 200) {
      errors.title = 'Title cannot exceed 200 characters';
    }

    if (!subject.trim()) {
      errors.subject = 'Subject is required';
    } else if (subject.trim().length > 100) {
      errors.subject = 'Subject cannot exceed 100 characters';
    }

    // Validate modules, topics, and resources
    modules.forEach((mod, mIdx) => {
      if (!mod.title.trim()) {
        errors[`module_${mIdx}`] = `Module ${mIdx + 1} title is required`;
      }

      mod.topics.forEach((topic, tIdx) => {
        if (!topic.title.trim()) {
          errors[`module_${mIdx}_topic_${tIdx}`] = `Topic title in Module ${mIdx + 1} is required`;
        }

        const hrs = Number(topic.estimatedHours);
        if (isNaN(hrs) || hrs < 0) {
          errors[`module_${mIdx}_topic_${tIdx}_hours`] = `Estimated hours must be a non-negative number`;
        }

        topic.resources.forEach((res, rIdx) => {
          if (!res.title.trim()) {
            errors[`module_${mIdx}_topic_${tIdx}_res_${rIdx}_title`] = 'Resource title is required';
          }
          if (!res.url.trim()) {
            errors[`module_${mIdx}_topic_${tIdx}_res_${rIdx}_url`] = 'Resource URL is required';
          } else {
            try {
              const parsed = new URL(res.url.trim());
              if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                errors[`module_${mIdx}_topic_${tIdx}_res_${rIdx}_url`] = 'URL must start with http:// or https://';
              }
            } catch {
              errors[`module_${mIdx}_topic_${tIdx}_res_${rIdx}_url`] = 'Please enter a valid URL';
            }
          }
        });
      });
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!isAuthenticated) {
      setApiError('Authentication is required to edit this roadmap. Please sign in.');
      return;
    }

    if (!isOwner) {
      setApiError('Authorization error: You do not own this roadmap and cannot save changes.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const formattedModules = modules.map((mod, mIdx) => ({
        title: mod.title.trim(),
        description: mod.description.trim(),
        order: mIdx,
        topics: mod.topics.map((topic, tIdx) => ({
          title: topic.title.trim(),
          description: topic.description.trim(),
          estimatedHours: Math.max(0, Number(topic.estimatedHours) || 0),
          order: tIdx,
          resources: topic.resources.map((res) => ({
            title: res.title.trim(),
            url: res.url.trim(),
            type: res.type || 'other',
            description: res.description ? res.description.trim() : '',
          })),
        })),
      }));

      // Strictly omit immutable and protected fields (ownerId, parentRoadmapId, version, createdAt, updatedAt)
      const payload = {
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        university: university.trim(),
        semester: semester.trim(),
        tags,
        visibility,
        modules: formattedModules,
      };

      const result = await updateRoadmap(id, payload);

      if (result && result.data && result.data._id) {
        navigate(`/explore/${result.data._id}`, {
          state: { updated: true, title: result.data.title },
        });
      } else {
        navigate(`/explore/${id}`, {
          state: { updated: true },
        });
      }
    } catch (err) {
      console.error('Error updating roadmap:', err);
      // Ensure 401/403 or server errors are shown clearly without pretending success
      setApiError(
        err.message || 'Failed to update roadmap. Please verify your permissions and input values.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 w-48 bg-git-canvas rounded" />
        <div className="rounded-lg border border-git-border bg-white p-6 space-y-4">
          <div className="h-6 w-3/4 bg-git-canvas rounded" />
          <div className="h-4 w-full bg-git-canvas rounded" />
          <div className="h-10 w-full bg-git-canvas rounded" />
        </div>
      </div>
    );
  }

  // Load Error State
  if (loadError || !originalRoadmap) {
    return (
      <div className="space-y-5">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-git-textMuted">
          <Link to="/explore" className="hover:text-git-text inline-flex items-center space-x-1">
            <Compass className="h-3.5 w-3.5 text-git-indigo" />
            <span>Explore Roadmaps</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-git-textSubtle" />
          <span className="text-git-text">Edit</span>
        </nav>

        <div className="rounded-lg border border-git-border bg-white p-10 text-center shadow-2xs">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-git-redSubtle border border-git-red/20 text-git-redText mb-3">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h1 className="text-sm font-semibold text-git-text">Roadmap Not Found</h1>
          <p className="mt-1.5 text-xs text-git-textMuted max-w-md mx-auto leading-relaxed">
            {loadError || 'The requested roadmap could not be loaded for editing.'}
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

  // Unauthorized Access Check (Frontend guard)
  if (!isOwner) {
    return (
      <div className="space-y-5">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-git-textMuted">
          <Link to="/explore" className="hover:text-git-text inline-flex items-center space-x-1">
            <Compass className="h-3.5 w-3.5 text-git-indigo" />
            <span>Explore Roadmaps</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-git-textSubtle" />
          <Link to={`/explore/${originalRoadmap._id}`} className="hover:text-git-text truncate max-w-xs">
            {originalRoadmap.title}
          </Link>
          <ChevronRight className="h-3 w-3 text-git-textSubtle" />
          <span className="text-git-text font-medium">Edit</span>
        </nav>

        <div className="rounded-lg border border-git-border bg-white p-10 text-center shadow-2xs">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-git-amberSubtle border border-git-amber/20 text-git-amberText mb-3">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h1 className="text-sm font-semibold text-git-text">Permission Denied</h1>
          <p className="mt-1.5 text-xs text-git-textMuted max-w-md mx-auto leading-relaxed">
            You do not own this roadmap. Only the creator is authorized to modify its syllabus, topics, and settings.
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <Link
              to={`/explore/${originalRoadmap._id}`}
              className="inline-flex items-center space-x-1.5 rounded-md border border-git-border bg-white px-3 py-1.5 text-xs font-medium text-git-text hover:bg-git-canvas transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>View Roadmap</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-git-textMuted">
        <Link to="/explore" className="hover:text-git-text inline-flex items-center space-x-1 transition-colors">
          <Compass className="h-3.5 w-3.5 text-git-indigo" />
          <span>Explore Roadmaps</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-git-textSubtle" />
        <Link
          to={`/explore/${originalRoadmap._id}`}
          className="hover:text-git-text truncate max-w-xs transition-colors"
        >
          {originalRoadmap.title}
        </Link>
        <ChevronRight className="h-3 w-3 text-git-textSubtle" />
        <span className="text-git-text font-medium">Edit</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-git-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-git-text">Edit Roadmap</h1>
          <p className="text-xs text-git-textMuted mt-1">
            Update your learning roadmap, modules, topics, and study resources.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={`/explore/${originalRoadmap._id}`}
            className="inline-flex items-center space-x-1.5 rounded-md border border-git-border bg-white px-3 py-1.5 text-xs font-medium text-git-text hover:bg-git-canvas transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Cancel</span>
          </Link>
        </div>
      </div>

      {/* API / Authorization Error Notification */}
      {apiError && (
        <div className="rounded-md border border-git-red/20 bg-git-redSubtle p-3 text-xs text-git-redText flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Unable to save changes: </span>
            <span>{apiError}</span>
          </div>
        </div>
      )}

      {/* Main Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <section className="rounded-lg border border-git-border bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="border-b border-git-borderMuted pb-3">
            <h2 className="text-sm font-semibold text-git-text">Basic Information</h2>
            <p className="text-xs text-git-textMuted mt-0.5">
              Specify the subject, title, and institutional context for this syllabus.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="edit-title" className="block text-xs font-medium text-git-text">
                Roadmap Title <span className="text-git-redText">*</span>
              </label>
              <input
                id="edit-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder="e.g., Computer Systems & Architecture Fall 2026"
                className={`w-full rounded-md border px-3 py-1.5 text-xs text-git-text focus:outline-none focus:ring-1 transition-colors ${
                  formErrors.title
                    ? 'border-git-red focus:border-git-red focus:ring-git-red'
                    : 'border-git-border focus:border-git-indigo focus:ring-git-indigo'
                }`}
              />
              {formErrors.title && (
                <p className="text-[11px] text-git-redText mt-0.5">{formErrors.title}</p>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label htmlFor="edit-subject" className="block text-xs font-medium text-git-text">
                Subject Area <span className="text-git-redText">*</span>
              </label>
              <input
                id="edit-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={100}
                placeholder="e.g., Computer Science, Mathematics"
                className={`w-full rounded-md border px-3 py-1.5 text-xs text-git-text focus:outline-none focus:ring-1 transition-colors ${
                  formErrors.subject
                    ? 'border-git-red focus:border-git-red focus:ring-git-red'
                    : 'border-git-border focus:border-git-indigo focus:ring-git-indigo'
                }`}
              />
              {formErrors.subject && (
                <p className="text-[11px] text-git-redText mt-0.5">{formErrors.subject}</p>
              )}
            </div>

            {/* Visibility */}
            <div className="space-y-1">
              <label htmlFor="edit-visibility" className="block text-xs font-medium text-git-text">
                Visibility
              </label>
              <select
                id="edit-visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full rounded-md border border-git-border bg-white px-3 py-1.5 text-xs text-git-text focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
              >
                <option value="public">Public (Visible in Explore Directory)</option>
                <option value="private">Private (Restricted to creator)</option>
              </select>
            </div>

            {/* University */}
            <div className="space-y-1">
              <label htmlFor="edit-university" className="block text-xs font-medium text-git-text">
                University / Institution <span className="text-[10px] text-git-textSubtle font-normal">(Optional)</span>
              </label>
              <input
                id="edit-university"
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g., Stanford University"
                className="w-full rounded-md border border-git-border px-3 py-1.5 text-xs text-git-text focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
              />
            </div>

            {/* Semester */}
            <div className="space-y-1">
              <label htmlFor="edit-semester" className="block text-xs font-medium text-git-text">
                Semester / Term <span className="text-[10px] text-git-textSubtle font-normal">(Optional)</span>
              </label>
              <input
                id="edit-semester"
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g., Fall 2026, Semester 3"
                className="w-full rounded-md border border-git-border px-3 py-1.5 text-xs text-git-text focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="edit-description" className="block text-xs font-medium text-git-text">
                Description / Overview
              </label>
              <textarea
                id="edit-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of learning goals, prerequisites, and target audience..."
                className="w-full rounded-md border border-git-border px-3 py-1.5 text-xs text-git-text focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
              />
            </div>

            {/* Tags */}
            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="edit-tags" className="block text-xs font-medium text-git-text">
                Tags <span className="text-[10px] text-git-textSubtle font-normal">(Comma-separated)</span>
              </label>
              <input
                id="edit-tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="algorithms, hardware, assembly, operating-systems"
                className="w-full rounded-md border border-git-border px-3 py-1.5 text-xs text-git-text focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Modules, Topics & Resources */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-git-text flex items-center space-x-1.5">
                <Layers className="h-4 w-4 text-git-indigo" />
                <span>Modules & Topics</span>
              </h2>
              <p className="text-xs text-git-textMuted mt-0.5">
                Organize your study curriculum into sequential modules, key topics, and reference materials.
              </p>
            </div>

            <button
              type="button"
              onClick={addModule}
              className="inline-flex items-center space-x-1 rounded-md border border-git-border bg-white px-2.5 py-1 text-xs font-medium text-git-text hover:bg-git-canvas shadow-2xs transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Module</span>
            </button>
          </div>

          {modules.length === 0 ? (
            <div className="rounded-lg border border-dashed border-git-border bg-white p-8 text-center">
              <p className="text-xs text-git-textMuted">No modules added yet.</p>
              <button
                type="button"
                onClick={addModule}
                className="mt-2 inline-flex items-center space-x-1 text-xs text-git-indigo hover:underline font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add your first module</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((moduleItem, mIdx) => (
                <div
                  key={mIdx}
                  className="rounded-lg border border-git-border bg-white shadow-2xs overflow-hidden"
                >
                  {/* Module Header */}
                  <div className="bg-git-canvas border-b border-git-border p-3 sm:px-4 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-white border border-git-border text-[11px] font-mono font-medium text-git-text">
                        {mIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={moduleItem.title}
                        onChange={(e) => updateModule(mIdx, 'title', e.target.value)}
                        placeholder={`Module ${mIdx + 1} Title`}
                        className={`flex-1 rounded border bg-white px-2.5 py-1 text-xs font-medium text-git-text focus:outline-none focus:ring-1 ${
                          formErrors[`module_${mIdx}`]
                            ? 'border-git-red focus:border-git-red focus:ring-git-red'
                            : 'border-git-border focus:border-git-indigo focus:ring-git-indigo'
                        }`}
                      />
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => addTopic(mIdx)}
                        className="inline-flex items-center space-x-1 rounded border border-git-border bg-white px-2 py-1 text-[11px] font-medium text-git-text hover:bg-git-canvas transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Topic</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeModule(mIdx)}
                        aria-label="Remove module"
                        className="p-1 rounded text-git-textSubtle hover:text-git-redText hover:bg-git-redSubtle transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Module Description */}
                  <div className="p-3 sm:px-4 border-b border-git-borderMuted">
                    <input
                      type="text"
                      value={moduleItem.description}
                      onChange={(e) => updateModule(mIdx, 'description', e.target.value)}
                      placeholder="Optional module description or overview..."
                      className="w-full rounded border border-git-border px-2.5 py-1 text-xs text-git-text placeholder:text-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
                    />
                  </div>

                  {/* Topics List */}
                  <div className="p-3 sm:px-4 space-y-3 bg-white">
                    {moduleItem.topics.length === 0 ? (
                      <div className="text-center py-3 text-xs text-git-textSubtle italic">
                        No topics in this module yet.{' '}
                        <button
                          type="button"
                          onClick={() => addTopic(mIdx)}
                          className="text-git-indigo hover:underline not-italic font-medium"
                        >
                          Add a topic
                        </button>
                      </div>
                    ) : (
                      moduleItem.topics.map((topicItem, tIdx) => (
                        <div
                          key={tIdx}
                          className="rounded-md border border-git-border bg-git-canvas/30 p-3 space-y-3"
                        >
                          {/* Topic Details Row */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex-1 w-full space-y-1">
                              <div className="flex items-center space-x-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-git-indigo shrink-0" />
                                <input
                                  type="text"
                                  value={topicItem.title}
                                  onChange={(e) =>
                                    updateTopic(mIdx, tIdx, 'title', e.target.value)
                                  }
                                  placeholder="Topic Title *"
                                  className={`w-full rounded border bg-white px-2 py-1 text-xs text-git-text focus:outline-none focus:ring-1 ${
                                    formErrors[`module_${mIdx}_topic_${tIdx}`]
                                      ? 'border-git-red focus:border-git-red focus:ring-git-red'
                                      : 'border-git-border focus:border-git-indigo focus:ring-git-indigo'
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3 text-git-textSubtle" />
                                <input
                                  type="number"
                                  min="0"
                                  value={topicItem.estimatedHours}
                                  onChange={(e) =>
                                    updateTopic(mIdx, tIdx, 'estimatedHours', e.target.value)
                                  }
                                  className="w-14 rounded border border-git-border bg-white px-1.5 py-1 text-xs text-git-text text-center focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
                                />
                                <span className="text-[11px] text-git-textSubtle">hrs</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => addResource(mIdx, tIdx)}
                                className="inline-flex items-center space-x-1 rounded border border-git-border bg-white px-2 py-1 text-[11px] font-medium text-git-text hover:bg-git-canvas transition-colors"
                              >
                                <LinkIcon className="h-3 w-3 text-git-textSubtle" />
                                <span>Add Resource</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => removeTopic(mIdx, tIdx)}
                                aria-label="Remove topic"
                                className="p-1 rounded text-git-textSubtle hover:text-git-redText hover:bg-git-redSubtle transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Topic Description */}
                          <input
                            type="text"
                            value={topicItem.description}
                            onChange={(e) =>
                              updateTopic(mIdx, tIdx, 'description', e.target.value)
                            }
                            placeholder="Optional topic explanation, milestones, or learning objectives..."
                            className="w-full rounded border border-git-border bg-white px-2 py-1 text-xs text-git-text placeholder:text-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
                          />

                          {/* Curated Resources */}
                          {topicItem.resources && topicItem.resources.length > 0 && (
                            <div className="space-y-2 pt-1 border-t border-git-borderMuted">
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-git-textSubtle">
                                Resources ({topicItem.resources.length})
                              </div>

                              <div className="space-y-2">
                                {topicItem.resources.map((resItem, rIdx) => (
                                  <div
                                    key={rIdx}
                                    className="rounded border border-git-border bg-white p-2.5 space-y-2"
                                  >
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <div className="space-y-0.5">
                                        <input
                                          type="text"
                                          value={resItem.title}
                                          onChange={(e) =>
                                            updateResource(mIdx, tIdx, rIdx, 'title', e.target.value)
                                          }
                                          placeholder="Resource Title *"
                                          className={`w-full rounded border px-2 py-1 text-xs text-git-text focus:outline-none focus:ring-1 ${
                                            formErrors[
                                              `module_${mIdx}_topic_${tIdx}_res_${rIdx}_title`
                                            ]
                                              ? 'border-git-red focus:border-git-red focus:ring-git-red'
                                              : 'border-git-border focus:border-git-indigo focus:ring-git-indigo'
                                          }`}
                                        />
                                      </div>

                                      <div className="space-y-0.5 sm:col-span-1">
                                        <input
                                          type="url"
                                          value={resItem.url}
                                          onChange={(e) =>
                                            updateResource(mIdx, tIdx, rIdx, 'url', e.target.value)
                                          }
                                          placeholder="https://... *"
                                          className={`w-full rounded border px-2 py-1 text-xs text-git-text focus:outline-none focus:ring-1 ${
                                            formErrors[
                                              `module_${mIdx}_topic_${tIdx}_res_${rIdx}_url`
                                            ]
                                              ? 'border-git-red focus:border-git-red focus:ring-git-red'
                                              : 'border-git-border focus:border-git-indigo focus:ring-git-indigo'
                                          }`}
                                        />
                                      </div>

                                      <div className="flex items-center space-x-1.5 sm:col-span-1">
                                        <select
                                          value={resItem.type}
                                          onChange={(e) =>
                                            updateResource(mIdx, tIdx, rIdx, 'type', e.target.value)
                                          }
                                          className="w-full rounded border border-git-border bg-white px-2 py-1 text-xs text-git-text focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
                                        >
                                          <option value="article">Article</option>
                                          <option value="video">Video</option>
                                          <option value="documentation">Documentation</option>
                                          <option value="pdf">PDF</option>
                                          <option value="other">Other</option>
                                        </select>

                                        <button
                                          type="button"
                                          onClick={() => removeResource(mIdx, tIdx, rIdx)}
                                          aria-label="Remove resource"
                                          className="p-1 rounded text-git-textSubtle hover:text-git-redText hover:bg-git-redSubtle transition-colors shrink-0"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Resource Description */}
                                    <input
                                      type="text"
                                      value={resItem.description}
                                      onChange={(e) =>
                                        updateResource(
                                          mIdx,
                                          tIdx,
                                          rIdx,
                                          'description',
                                          e.target.value
                                        )
                                      }
                                      placeholder="Brief note on what this covers..."
                                      className="w-full rounded border border-git-border px-2 py-0.5 text-[11px] text-git-text placeholder:text-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end space-x-3 border-t border-git-border">
          <Link
            to={`/explore/${originalRoadmap._id}`}
            className="inline-flex items-center space-x-1.5 rounded-md border border-git-border bg-white px-3.5 py-1.5 text-xs font-medium text-git-text hover:bg-git-canvas transition-colors"
          >
            <span>Cancel</span>
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center space-x-1.5 rounded-md bg-git-green px-4 py-1.5 text-xs font-medium text-white border border-git-greenHover hover:bg-git-greenHover shadow-2xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving changes...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Roadmap</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
