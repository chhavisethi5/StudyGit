import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitPullRequest,
  X,
  Loader2,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  FileEdit,
  ExternalLink,
  Layers,
  BookOpen,
} from 'lucide-react';
import { createPullRequest } from '../api/pullRequestApi';

export default function ProposeChangesModal({ isOpen, onClose, fork }) {
  const navigate = useNavigate();

  // Selected module and topic IDs
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');

  // Change type: 'add_resource' | 'replace_resource' | 'update_topic_description'
  const [changeType, setChangeType] = useState('add_resource');

  // PR metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Add / Replace Resource fields
  const [targetResourceId, setTargetResourceId] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceType, setResourceType] = useState('video');
  const [resourceDescription, setResourceDescription] = useState('');

  // Topic description correction field
  const [newTopicDescription, setNewTopicDescription] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize selected module and topic when modal opens
  useEffect(() => {
    if (fork && fork.modules && fork.modules.length > 0) {
      const firstMod = fork.modules[0];
      setSelectedModuleId(firstMod._id);
      if (firstMod.topics && firstMod.topics.length > 0) {
        setSelectedTopicId(firstMod.topics[0]._id);
      }
    }
  }, [fork, isOpen]);

  // Find currently selected module object
  const currentModule = useMemo(() => {
    if (!fork || !fork.modules) return null;
    return fork.modules.find((m) => m._id === selectedModuleId) || fork.modules[0] || null;
  }, [fork, selectedModuleId]);

  // Find currently selected topic object
  const currentTopic = useMemo(() => {
    if (!currentModule || !currentModule.topics) return null;
    return currentModule.topics.find((t) => t._id === selectedTopicId) || currentModule.topics[0] || null;
  }, [currentModule, selectedTopicId]);

  // When module changes, update selected topic
  const handleModuleChange = (newModId) => {
    setSelectedModuleId(newModId);
    const mod = fork?.modules?.find((m) => m._id === newModId);
    if (mod && mod.topics && mod.topics.length > 0) {
      setSelectedTopicId(mod.topics[0]._id);
    } else {
      setSelectedTopicId('');
    }
    setTargetResourceId('');
  };

  // When topic changes or changeType becomes replace_resource, initialize targetResourceId
  useEffect(() => {
    if (changeType === 'replace_resource' && currentTopic && currentTopic.resources?.length > 0) {
      if (!targetResourceId || !currentTopic.resources.some((r) => r._id === targetResourceId)) {
        setTargetResourceId(currentTopic.resources[0]._id);
      }
    }
    if (changeType === 'update_topic_description' && currentTopic) {
      setNewTopicDescription(currentTopic.description || '');
    }
  }, [changeType, currentTopic, targetResourceId]);

  if (!isOpen || !fork) return null;

  const originalRoadmapId = fork.parentRoadmapId?._id || fork.parentRoadmapId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a title describing your proposed change.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide an explanation of why this change should be accepted by the author.');
      return;
    }

    if (!selectedModuleId || !selectedTopicId) {
      setError('Please select both a target module and topic.');
      return;
    }

    // Prepare proposed change payload with mapped original IDs and fork IDs
    const change = {
      type: changeType,
      moduleId: currentModule?.originalModuleId || selectedModuleId,
      originalModuleId: currentModule?.originalModuleId || null,
      forkModuleId: selectedModuleId,
      moduleTitle: currentModule?.title || '',
      topicId: currentTopic?.originalTopicId || selectedTopicId,
      originalTopicId: currentTopic?.originalTopicId || null,
      forkTopicId: selectedTopicId,
      topicTitle: currentTopic?.title || '',
    };

    if (changeType === 'add_resource') {
      if (!resourceTitle.trim()) {
        setError('Resource title is required.');
        return;
      }
      if (!resourceUrl.trim() || !/^https?:\/\/.+/i.test(resourceUrl.trim())) {
        setError('A valid HTTP or HTTPS resource URL is required.');
        return;
      }
      change.resource = {
        title: resourceTitle.trim(),
        url: resourceUrl.trim(),
        type: resourceType,
        description: resourceDescription.trim(),
      };
    } else if (changeType === 'replace_resource') {
      if (!targetResourceId) {
        setError('Please select the resource you want to replace.');
        return;
      }
      if (!resourceTitle.trim()) {
        setError('Replacement resource title is required.');
        return;
      }
      if (!resourceUrl.trim() || !/^https?:\/\/.+/i.test(resourceUrl.trim())) {
        setError('A valid HTTP or HTTPS replacement resource URL is required.');
        return;
      }
      const existing = currentTopic?.resources?.find((r) => r._id === targetResourceId);
      change.targetResourceId = existing?.originalResourceId || targetResourceId;
      change.originalResourceId = existing?.originalResourceId || null;
      change.forkResourceId = targetResourceId;
      change.targetResourceTitle = existing?.title || '';
      change.resource = {
        title: resourceTitle.trim(),
        url: resourceUrl.trim(),
        type: resourceType,
        description: resourceDescription.trim(),
      };
    } else if (changeType === 'update_topic_description') {
      if (!newTopicDescription.trim()) {
        setError('Please provide the corrected topic description.');
        return;
      }
      change.oldDescription = currentTopic?.description || '';
      change.newDescription = newTopicDescription.trim();
    }

    setIsSubmitting(true);
    try {
      const response = await createPullRequest({
        originalRoadmapId,
        sourceForkId: fork._id,
        title: title.trim(),
        description: description.trim(),
        proposedChanges: [change],
      });

      const newPR = response.data;
      onClose();
      navigate(`/pull-requests/${newPR._id}`, {
        state: { newlyCreated: true },
      });
    } catch (err) {
      setError(err.message || 'Failed to submit pull request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-git-text/40 p-4 backdrop-blur-2xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl rounded-lg border border-git-border bg-white shadow-xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-git-border px-5 py-3.5 bg-git-canvas">
          <div className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-git-indigoSubtle border border-git-indigo/20 text-git-indigo">
              <GitPullRequest className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-git-text">Propose Changes to Syllabus</h2>
              <p className="text-[11px] text-git-textMuted">
                Submit a pull request to the original roadmap author
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-git-textSubtle hover:bg-white hover:text-git-text transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="rounded-md border border-git-red/20 bg-git-redSubtle p-3 text-xs text-git-redText flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upstream Info */}
          <div className="text-xs text-git-textMuted bg-git-canvas border border-git-border rounded-md px-3 py-2 flex items-center justify-between">
            <span>
              Proposing to:{' '}
              <strong className="text-git-text">
                {fork.parentRoadmapId?.title || 'Original Syllabus Roadmap'}
              </strong>
            </span>
            <span className="text-[10px] font-mono text-git-textSubtle">From: {fork.title}</span>
          </div>

          {/* PR Title & Explanation */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-git-text mb-1">
                Pull Request Title <span className="text-git-redText">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Add MIT OCW video lectures and fix chapter outline"
                className="w-full rounded-md border border-git-border px-3 py-1.5 text-xs text-git-text placeholder:text-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-git-text mb-1">
                Explanation & Rationale <span className="text-git-redText">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain why this resource or correction improves the roadmap and why the author should accept it..."
                className="w-full rounded-md border border-git-border px-3 py-1.5 text-xs text-git-text placeholder:text-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
              />
            </div>
          </div>

          {/* Module & Topic Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-git-text mb-1 flex items-center space-x-1">
                <Layers className="h-3 w-3 text-git-indigo" />
                <span>Target Module</span>
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => handleModuleChange(e.target.value)}
                className="w-full rounded-md border border-git-border bg-white px-2.5 py-1.5 text-xs text-git-text focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
              >
                {fork.modules?.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-git-text mb-1 flex items-center space-x-1">
                <BookOpen className="h-3 w-3 text-git-green" />
                <span>Target Topic</span>
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => {
                  setSelectedTopicId(e.target.value);
                  setTargetResourceId('');
                }}
                disabled={!currentModule?.topics?.length}
                className="w-full rounded-md border border-git-border bg-white px-2.5 py-1.5 text-xs text-git-text focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo disabled:opacity-50"
              >
                {currentModule?.topics?.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Change Type Selection */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-git-text mb-1.5">
              Type of Proposed Contribution
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChangeType('add_resource')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-md border text-center transition-all ${
                  changeType === 'add_resource'
                    ? 'border-git-indigo bg-git-indigoSubtle/50 text-git-indigo font-semibold shadow-2xs'
                    : 'border-git-border bg-white text-git-textMuted hover:border-git-borderMuted hover:text-git-text'
                }`}
              >
                <PlusCircle className="h-4 w-4 mb-1" />
                <span className="text-[11px]">Add Resource</span>
              </button>

              <button
                type="button"
                onClick={() => setChangeType('replace_resource')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-md border text-center transition-all ${
                  changeType === 'replace_resource'
                    ? 'border-git-indigo bg-git-indigoSubtle/50 text-git-indigo font-semibold shadow-2xs'
                    : 'border-git-border bg-white text-git-textMuted hover:border-git-borderMuted hover:text-git-text'
                }`}
              >
                <RefreshCw className="h-4 w-4 mb-1" />
                <span className="text-[11px]">Replace Resource</span>
              </button>

              <button
                type="button"
                onClick={() => setChangeType('update_topic_description')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-md border text-center transition-all ${
                  changeType === 'update_topic_description'
                    ? 'border-git-indigo bg-git-indigoSubtle/50 text-git-indigo font-semibold shadow-2xs'
                    : 'border-git-border bg-white text-git-textMuted hover:border-git-borderMuted hover:text-git-text'
                }`}
              >
                <FileEdit className="h-4 w-4 mb-1" />
                <span className="text-[11px]">Correct Description</span>
              </button>
            </div>
          </div>

          {/* Form fields based on selected changeType */}
          <div className="rounded-md border border-git-border bg-git-canvas/40 p-3.5 space-y-3">
            {changeType === 'replace_resource' && (
              <div>
                <label className="block text-xs font-semibold text-git-text mb-1">
                  Select Existing Resource to Replace <span className="text-git-redText">*</span>
                </label>
                {currentTopic?.resources && currentTopic.resources.length > 0 ? (
                  <select
                    value={targetResourceId}
                    onChange={(e) => setTargetResourceId(e.target.value)}
                    className="w-full rounded-md border border-git-border bg-white px-2.5 py-1.5 text-xs text-git-text focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
                  >
                    {currentTopic.resources.map((r) => (
                      <option key={r._id} value={r._id}>
                        [{r.type}] {r.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-git-amberText bg-git-amberSubtle border border-git-amber/20 p-2 rounded">
                    This topic currently has no resources to replace. Choose "Add Resource" instead.
                  </p>
                )}
              </div>
            )}

            {(changeType === 'add_resource' || changeType === 'replace_resource') && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-git-text mb-1">
                      {changeType === 'replace_resource' ? 'Replacement Resource Title' : 'Resource Title'}{' '}
                      <span className="text-git-redText">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={resourceTitle}
                      onChange={(e) => setResourceTitle(e.target.value)}
                      placeholder="e.g. Stanford CS106B Lecture on Trees"
                      className="w-full rounded-md border border-git-border px-2.5 py-1.5 text-xs text-git-text bg-white placeholder:text-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-git-text mb-1">
                      Resource Type
                    </label>
                    <select
                      value={resourceType}
                      onChange={(e) => setResourceType(e.target.value)}
                      className="w-full rounded-md border border-git-border bg-white px-2.5 py-1.5 text-xs text-git-text focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
                    >
                      <option value="video">Video</option>
                      <option value="article">Article</option>
                      <option value="pdf">PDF</option>
                      <option value="documentation">Documentation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-git-text mb-1">
                    Resource URL (HTTP/HTTPS) <span className="text-git-redText">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={resourceUrl}
                    onChange={(e) => setResourceUrl(e.target.value)}
                    placeholder="https://example.com/lecture-notes"
                    className="w-full rounded-md border border-git-border px-2.5 py-1.5 text-xs text-git-text bg-white placeholder:text-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-git-text mb-1">
                    Resource Description / Note <span className="text-git-textSubtle">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={resourceDescription}
                    onChange={(e) => setResourceDescription(e.target.value)}
                    placeholder="e.g. Free full-length video covering all subtopics"
                    className="w-full rounded-md border border-git-border px-2.5 py-1.5 text-xs text-git-text bg-white placeholder:text-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
                  />
                </div>
              </>
            )}

            {changeType === 'update_topic_description' && (
              <div className="space-y-3">
                <div>
                  <span className="block text-[11px] font-medium text-git-textSubtle uppercase tracking-wider mb-1">
                    Current Topic Description (Reference)
                  </span>
                  <div className="rounded border border-git-border bg-git-canvas px-3 py-2 text-xs text-git-textMuted italic max-h-24 overflow-y-auto">
                    {currentTopic?.description || 'No description currently set.'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-git-text mb-1">
                    Proposed Corrected Description <span className="text-git-redText">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newTopicDescription}
                    onChange={(e) => setNewTopicDescription(e.target.value)}
                    placeholder="Enter the proposed updated description or textbook chapter syllabus..."
                    className="w-full rounded-md border border-git-border bg-white px-3 py-2 text-xs text-git-text placeholder:text-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-git-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-git-border bg-white px-3 py-1.5 text-xs font-medium text-git-text hover:bg-git-canvas transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-1.5 rounded-md border border-git-green bg-git-green px-4 py-1.5 text-xs font-medium text-white hover:bg-git-greenHover transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Submitting PR...</span>
                </>
              ) : (
                <>
                  <GitPullRequest className="h-3.5 w-3.5" />
                  <span>Create Pull Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
