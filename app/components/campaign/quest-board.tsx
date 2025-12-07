"use client";

import { useState, DragEvent } from 'react';
import { CampaignQuest } from '@/app/types/campaign';
import { Button } from '@/app/components/ui/button';

interface QuestBoardProps {
  quests: CampaignQuest[];
  onQuestUpdate: (quest: CampaignQuest) => void;
  onQuestEdit: (quest: CampaignQuest) => void;
  onQuestDelete: (questId: string) => void;
  onQuestAdd: () => void;
}

type QuestStatus = 'available' | 'active' | 'completed' | 'failed';

const STATUS_CONFIG: Record<QuestStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  available: { label: 'Available', color: 'text-blue-400', bgColor: 'bg-blue-500/10', icon: '📋' },
  active: { label: 'Active', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', icon: '⚔️' },
  completed: { label: 'Completed', color: 'text-green-400', bgColor: 'bg-green-500/10', icon: '✓' },
  failed: { label: 'Failed', color: 'text-red-400', bgColor: 'bg-red-500/10', icon: '✗' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'text-gray-400', icon: '⬇' },
  medium: { label: 'Medium', color: 'text-blue-400', icon: '➡' },
  high: { label: 'High', color: 'text-orange-400', icon: '⬆' },
  critical: { label: 'Critical', color: 'text-red-400', icon: '‼' },
};

export function QuestBoard({
  quests,
  onQuestUpdate,
  onQuestEdit,
  onQuestDelete,
  onQuestAdd,
}: QuestBoardProps) {
  const [draggedQuest, setDraggedQuest] = useState<CampaignQuest | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<QuestStatus | null>(null);

  const columns: QuestStatus[] = ['available', 'active', 'completed', 'failed'];

  const getQuestsByStatus = (status: QuestStatus) => {
    return quests.filter(q => q.status === status);
  };

  const handleDragStart = (quest: CampaignQuest) => {
    setDraggedQuest(quest);
  };

  const handleDragEnd = () => {
    setDraggedQuest(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: DragEvent, status: QuestStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: DragEvent, newStatus: QuestStatus) => {
    e.preventDefault();
    if (draggedQuest && draggedQuest.status !== newStatus) {
      onQuestUpdate({
        ...draggedQuest,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    }
    setDraggedQuest(null);
    setDragOverColumn(null);
  };

  const getCompletionPercentage = (quest: CampaignQuest) => {
    if (quest.objectives.length === 0) return 0;
    const completed = quest.objectives.filter(obj => obj.completed).length;
    return Math.round((completed / quest.objectives.length) * 100);
  };

  const getDeadlineStatus = (quest: CampaignQuest) => {
    if (!quest.deadline) return null;
    const deadline = new Date(quest.deadline);
    const now = new Date();
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) return { text: 'Overdue', color: 'text-red-400' };
    if (daysUntil === 0) return { text: 'Due today', color: 'text-red-400' };
    if (daysUntil <= 3) return { text: `${daysUntil}d left`, color: 'text-orange-400' };
    return { text: `${daysUntil}d left`, color: 'text-gray-400' };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#fafafa]">Quest Board</h2>
        <Button variant="primary" size="sm" onClick={onQuestAdd}>
          + Add Quest
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(status => {
          const statusQuests = getQuestsByStatus(status);
          const config = STATUS_CONFIG[status];
          const isDragOver = dragOverColumn === status;

          return (
            <div
              key={status}
              className={`flex flex-col min-h-[400px] rounded-xl transition-all ${
                config.bgColor
              } ${
                isDragOver ? 'ring-2 ring-[#8b5cf6] scale-[1.02]' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-[#27272a]">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-semibold ${config.color} flex items-center gap-2`}>
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </h3>
                  <span className="text-xs text-[#a1a1aa] bg-[#27272a] px-2 py-1 rounded">
                    {statusQuests.length}
                  </span>
                </div>
              </div>

              {/* Quest Cards */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {statusQuests.length === 0 ? (
                  <div className="text-center py-8 text-[#71717a] text-sm">
                    No quests
                  </div>
                ) : (
                  statusQuests.map(quest => {
                    const isDragging = draggedQuest?.id === quest.id;
                    const completion = getCompletionPercentage(quest);
                    const deadlineStatus = getDeadlineStatus(quest);

                    return (
                      <div
                        key={quest.id}
                        draggable
                        onDragStart={() => handleDragStart(quest)}
                        onDragEnd={handleDragEnd}
                        className={`glass-subtle rounded-lg p-4 cursor-move hover:scale-[1.02] transition-all ${
                          isDragging ? 'opacity-50 scale-95' : ''
                        }`}
                      >
                        {/* Quest Title & Priority */}
                        <div className="flex items-start justify-between mb-2">
                          <h4
                            className="font-medium text-[#fafafa] text-sm flex-1 cursor-pointer hover:text-[#8b5cf6]"
                            onClick={() => onQuestEdit(quest)}
                          >
                            {quest.title}
                          </h4>
                          <span
                            className={`text-xs ${PRIORITY_CONFIG[quest.priority].color} ml-2`}
                            title={PRIORITY_CONFIG[quest.priority].label}
                          >
                            {PRIORITY_CONFIG[quest.priority].icon}
                          </span>
                        </div>

                        {/* Quest Description */}
                        <p className="text-xs text-[#a1a1aa] line-clamp-2 mb-3">
                          {quest.description}
                        </p>

                        {/* Progress Bar */}
                        {quest.objectives.length > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-[#a1a1aa] mb-1">
                              <span>Progress</span>
                              <span>{completion}%</span>
                            </div>
                            <div className="h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#8b5cf6] transition-all"
                                style={{ width: `${completion}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Quest Metadata */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {/* Quest Giver */}
                          {quest.giver && (
                            <span className="px-2 py-0.5 bg-[#27272a] text-[#a1a1aa] rounded">
                              👤 {quest.giver}
                            </span>
                          )}

                          {/* Location */}
                          {quest.location && (
                            <span className="px-2 py-0.5 bg-[#27272a] text-[#a1a1aa] rounded">
                              📍 {quest.location}
                            </span>
                          )}

                          {/* Deadline */}
                          {deadlineStatus && (
                            <span className={`px-2 py-0.5 bg-[#27272a] ${deadlineStatus.color} rounded`}>
                              ⏰ {deadlineStatus.text}
                            </span>
                          )}

                          {/* Public/Private */}
                          {!quest.isPublic && (
                            <span className="px-2 py-0.5 bg-[#27272a] text-[#a1a1aa] rounded" title="Hidden from players">
                              🔒
                            </span>
                          )}

                          {/* Has parent quest (part of chain) */}
                          {quest.parentQuestId && (
                            <span className="px-2 py-0.5 bg-[#27272a] text-[#8b5cf6] rounded" title="Part of quest chain">
                              ⛓️
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-3 pt-3 border-t border-[#27272a]">
                          <button
                            onClick={() => onQuestEdit(quest)}
                            className="flex-1 text-xs py-1.5 rounded bg-[#27272a] text-[#fafafa] hover:bg-[#3f3f46] transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onQuestDelete(quest.id)}
                            className="text-xs px-3 py-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="glass-subtle rounded-lg p-4 text-sm text-[#a1a1aa]">
        💡 <strong>Tip:</strong> Drag and drop quests between columns to change their status. Click a quest title to edit details. Use the chain icon to identify connected quests.
      </div>
    </div>
  );
}
