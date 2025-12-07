'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from './input';

export interface Command {
  id: string;
  label: string;
  icon: string;
  keywords: string[];
  action: () => void;
  category: 'navigate' | 'create' | 'tools';
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    // Navigation
    { id: 'nav-home', label: 'Go to Home', icon: '🏠', keywords: ['home', 'dashboard'], category: 'navigate', action: () => router.push('/') },
    { id: 'nav-campaigns', label: 'Go to Campaigns', icon: '🗺️', keywords: ['campaigns', 'adventures'], category: 'navigate', action: () => router.push('/campaigns') },
    { id: 'nav-characters', label: 'Go to Characters', icon: '📜', keywords: ['characters', 'players', 'sheets'], category: 'navigate', action: () => router.push('/characters') },
    { id: 'nav-sessions', label: 'Go to Sessions', icon: '📅', keywords: ['sessions', 'notes', 'log'], category: 'navigate', action: () => router.push('/sessions') },
    { id: 'nav-combat', label: 'Go to Combat Tracker', icon: '⚔️', keywords: ['combat', 'tracker', 'initiative', 'battle'], category: 'navigate', action: () => router.push('/combat') },
    { id: 'nav-dice', label: 'Go to Dice Roller', icon: '🎲', keywords: ['dice', 'roll', 'random'], category: 'navigate', action: () => router.push('/dice') },
    { id: 'nav-monsters', label: 'Go to Monsters', icon: '🐉', keywords: ['monsters', 'creatures', 'bestiary'], category: 'navigate', action: () => router.push('/monsters') },
    { id: 'nav-encounters', label: 'Go to Encounters', icon: '💰', keywords: ['encounters', 'loot', 'treasure'], category: 'navigate', action: () => router.push('/encounters') },

    // Create actions
    { id: 'create-campaign', label: 'Create New Campaign', icon: '➕', keywords: ['new', 'campaign', 'create', 'start'], category: 'create', action: () => router.push('/campaigns/create') },
    { id: 'create-character', label: 'Create New Character', icon: '➕', keywords: ['new', 'character', 'create', 'sheet'], category: 'create', action: () => router.push('/characters/create') },

    // Tools
    { id: 'tool-data', label: 'Data Management', icon: '💾', keywords: ['export', 'import', 'backup', 'restore', 'data'], category: 'tools', action: () => router.push('/data-management') },
  ];

  const filteredCommands = commands.filter((cmd) => {
    const searchLower = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.keywords.some((k) => k.includes(searchLower))
    );
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      executeCommand(filteredCommands[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const executeCommand = (command: Command) => {
    command.action();
    onClose();
  };

  if (!isOpen) return null;

  const categoryOrder: Command['category'][] = ['navigate', 'create', 'tools'];
  const groupedCommands = categoryOrder.map((category) => ({
    category,
    commands: filteredCommands.filter((cmd) => cmd.category === category),
  })).filter((group) => group.commands.length > 0);

  const categoryLabels = {
    navigate: 'Navigate',
    create: 'Create',
    tools: 'Tools',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-20 px-4">
        <div className="w-full max-w-2xl glass-strong rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b border-[#27272a]">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 bg-transparent focus:ring-0"
            />
            <div className="flex items-center gap-4 mt-2 text-xs text-[#a1a1aa]">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-[#a1a1aa]">
                No commands found
              </div>
            ) : (
              groupedCommands.map((group) => (
                <div key={group.category}>
                  <div className="px-4 py-2 text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider bg-[#0a0a0f]/50">
                    {categoryLabels[group.category]}
                  </div>
                  {group.commands.map((cmd, idx) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={cmd.id}
                        onClick={() => executeCommand(cmd)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={'flex items-center gap-3 w-full px-4 py-3 text-left transition-colors ' + (isSelected ? 'bg-[#8b5cf6] text-white' : 'text-[#fafafa] hover:bg-[#27272a]')}
                      >
                        <span className="text-2xl">{cmd.icon}</span>
                        <span className="flex-1 font-medium">{cmd.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
