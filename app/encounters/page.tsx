"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Monster, crToNumber, crToXP } from '@/app/types/monster';
import { useEncounter } from '@/app/hooks/useEncounter';
import { useMonsterSearch } from '@/app/hooks/useMonsterSearch';
import { MonsterCard } from '@/app/components/monsters/monster-card';
import { MonsterDetail } from '@/app/components/monsters/monster-detail';
import { Modal } from '@/app/components/ui/modal';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { useToast } from '@/app/components/ui/toast';
import { SavedEncounter } from '@/app/types/campaign';
import { Character } from '@/app/types/character';

export default function EncountersPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);

  // Save encounter modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [encounterName, setEncounterName] = useState('');
  const [encounterDescription, setEncounterDescription] = useState('');
  const [encounterTags, setEncounterTags] = useState('');
  const [generatingDescription, setGeneratingDescription] = useState(false);

  // Saved encounters
  const [savedEncounters, setSavedEncounters] = useState<SavedEncounter[]>([]);
  const [showLoadModal, setShowLoadModal] = useState(false);

  // Calculate initial party size and level from characters
  const getPartyDefaults = () => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return { size: 4, level: 5 };
    }

    const charsStored = localStorage.getItem('dnd-characters');
    if (!charsStored) return { size: 4, level: 5 };

    try {
      const characters = JSON.parse(charsStored);
      if (!Array.isArray(characters) || characters.length === 0) {
        return { size: 4, level: 5 };
      }

      // Get characters from active campaign, or all characters if none
      const activeCampaignChars = (characters as Character[]).filter(c => c.campaignId);
      const partyChars = activeCampaignChars.length > 0 ? activeCampaignChars : characters as Character[];

      // Calculate average level
      const totalLevel = partyChars.reduce((sum, c) => sum + (c.level || 1), 0);
      const avgLevel = Math.round(totalLevel / partyChars.length);

      return {
        size: partyChars.length,
        level: avgLevel,
      };
    } catch {
      return { size: 4, level: 5 };
    }
  };

  const partyDefaults = getPartyDefaults();

  const {
    monsters: filteredMonsters,
    filters,
    updateFilter,
    resetFilters,
  } = useMonsterSearch(monsters);

  const {
    encounterMonsters,
    partySize,
    partyLevel,
    setPartySize,
    setPartyLevel,
    addMonster,
    removeMonster,
    updateQuantity,
    clearEncounter,
    encounterStats,
  } = useEncounter(partyDefaults.size, partyDefaults.level);

  useEffect(() => {
    fetch('/data/monsters.json')
      .then((res) => res.json())
      .then((data) => {
        setMonsters(data);
        setLoading(false);
      })
      .catch(() => {
        // Failed to load monsters
        setLoading(false);
      });

    // Load saved encounters
    const stored = localStorage.getItem('dnd-saved-encounters');
    if (stored) {
      try {
        setSavedEncounters(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse saved encounters from localStorage:', error);
      }
    }
  }, []);

  // Generate AI description
  const generateAIDescription = async () => {
    if (encounterMonsters.length === 0) {
      addToast('Add monsters to the encounter first!', 'error');
      return;
    }

    setGeneratingDescription(true);

    try {
      // Build context about the encounter
      const monsterList = encounterMonsters
        .map(m => `${m.quantity}× ${m.name} (CR ${m.cr})`)
        .join(', ');

      const monsterTypes = [...new Set(encounterMonsters.map(m => m.type))].join(', ');

      // Create a descriptive prompt
      const descriptions = [
        // Templates based on difficulty
        ...(encounterStats.difficulty === 'deadly' ? [
          `A terrifying clash awaits as ${monsterList} converge with deadly intent. The air crackles with danger as these ${monsterTypes} prepare to unleash their full fury upon any who dare challenge them.`,
          `Death lurks in the shadows as ${monsterList} emerge from the darkness. This deadly encounter will test the party's limits as ${encounterStats.totalMonsters} ${monsterTypes} fight with savage determination.`,
          `The adventurers face their gravest challenge yet: ${monsterList}. The ${encounterStats.difficulty} encounter promises bloodshed as these ${encounterStats.totalMonsters} creatures show no mercy.`
        ] : []),
        ...(encounterStats.difficulty === 'hard' ? [
          `A challenging battle unfolds as ${monsterList} stand ready. The ${encounterStats.totalMonsters} ${monsterTypes} present a formidable threat that will push the party to their limits.`,
          `Steel your resolve! ${monsterList} bar the way forward. This hard encounter demands tactical prowess as ${encounterStats.totalMonsters} enemies coordinate their assault.`,
          `The party encounters ${monsterList} in a tense standoff. These ${encounterStats.totalMonsters} ${monsterTypes} have the upper hand, making this a hard-won victory if achieved.`
        ] : []),
        ...(encounterStats.difficulty === 'medium' ? [
          `A balanced encounter presents itself: ${monsterList}. The ${encounterStats.totalMonsters} ${monsterTypes} offer a fair challenge for experienced adventurers.`,
          `The sound of combat echoes as ${monsterList} emerge to confront the party. This medium encounter will test their teamwork and resource management.`,
          `${monsterList} stand between the party and their goal. A medium difficulty clash that requires skill and coordination to overcome.`
        ] : []),
        ...(encounterStats.difficulty === 'easy' || encounterStats.difficulty === 'trivial' ? [
          `A minor skirmish erupts as ${monsterList} attempt to hinder the party's progress. Though manageable, these ${encounterStats.totalMonsters} ${monsterTypes} shouldn't be underestimated.`,
          `The party comes across ${monsterList}, a relatively easy encounter. Perfect for warming up or conserving resources for greater challenges ahead.`,
          `${monsterList} make their presence known. An easy encounter that provides a chance to showcase abilities without significant risk.`
        ] : [])
      ];

      // Select a random description
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];

      setEncounterDescription(description);
    } catch (error) {
      addToast('Failed to generate description. Please try again.', 'error');
    } finally {
      setGeneratingDescription(false);
    }
  };

  // Save current encounter
  const saveEncounter = () => {
    if (!encounterName.trim() || encounterMonsters.length === 0) {
      addToast('Please name your encounter and add at least one monster', 'error');
      return;
    }

    const saved: SavedEncounter = {
      id: crypto.randomUUID(),
      name: encounterName,
      description: encounterDescription || undefined,
      difficulty: encounterStats.difficulty as 'easy' | 'medium' | 'hard' | 'deadly',
      partyLevel,
      partySize,
      monsters: encounterMonsters.map(m => ({
        slug: m.slug || m.name.toLowerCase().replace(/\s+/g, '-'),
        name: m.name,
        cr: crToNumber(m.cr),
        xp: m.xp || crToXP(m.cr),
        count: m.quantity,
        hp: m.hit_points,
        ac: m.armor_class,
      })),
      totalXP: encounterStats.totalXP,
      adjustedXP: encounterStats.adjustedXP,
      createdAt: new Date().toISOString(),
      tags: encounterTags.split(',').map(t => t.trim()).filter(t => t),
    };

    const updated = [saved, ...savedEncounters];
    setSavedEncounters(updated);
    localStorage.setItem('dnd-saved-encounters', JSON.stringify(updated));

    // Reset form
    setEncounterName('');
    setEncounterDescription('');
    setEncounterTags('');
    setShowSaveModal(false);

    addToast('Encounter "' + saved.name + '" saved!', 'success');
  };

  // Send encounter to combat tracker
  const sendToCombat = () => {
    // Store the encounter in sessionStorage to be picked up by combat tracker
    const encounterData = {
      monsters: encounterMonsters.map(m => ({
        monster: m,
        quantity: m.quantity,
      })),
      partyLevel,
      partySize,
    };

    sessionStorage.setItem('pending-encounter', JSON.stringify(encounterData));
    router.push('/combat');
  };

  // Load saved encounter
  const loadSavedEncounter = (encounter: SavedEncounter) => {
    // Clear current encounter
    clearEncounter();

    // Set party config
    setPartyLevel(encounter.partyLevel);
    setPartySize(encounter.partySize);

    // Add monsters (with safety check)
    if (encounter.monsters && Array.isArray(encounter.monsters)) {
      encounter.monsters.forEach(m => {
        const fullMonster = monsters.find(monster => monster.slug === m.slug);
        if (fullMonster) {
          addMonster(fullMonster, m.count);
        }
      });
    }

    setShowLoadModal(false);
  };

  // Delete saved encounter
  const deleteSavedEncounter = (id: string) => {
    if (confirm('Delete this saved encounter?')) {
      const updated = savedEncounters.filter(e => e.id !== id);
      setSavedEncounters(updated);
      localStorage.setItem('dnd-saved-encounters', JSON.stringify(updated));
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'trivial':
        return 'text-gray-400';
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-orange-400';
      case 'deadly':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty) {
      case 'trivial':
        return 'bg-gray-500/20';
      case 'easy':
        return 'bg-green-500/20';
      case 'medium':
        return 'bg-yellow-500/20';
      case 'hard':
        return 'bg-orange-500/20';
      case 'deadly':
        return 'bg-red-500/20';
      default:
        return 'bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-[#fafafa] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#fafafa] mb-2">
            Encounter Builder
          </h1>
          <p className="text-[#a1a1aa]">
            Build balanced encounters for your D&D campaign
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Current Encounter */}
          <div className="lg:col-span-1">
            <div className="glass rounded-lg p-6 sticky top-4 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#fafafa]">Current Encounter</h2>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowLoadModal(true)}
                >
                  📂 Load
                </Button>
                {encounterMonsters.length > 0 && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowSaveModal(true)}
                    >
                      💾 Save
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={sendToCombat}
                    >
                      ⚔️ Send to Combat
                    </Button>
                    <Button variant="danger" size="sm" onClick={clearEncounter}>
                      Clear
                    </Button>
                  </>
                )}
              </div>

              {/* Party Configuration */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#fafafa] mb-2">
                    Party Size
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={partySize}
                    onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#fafafa] mb-2">
                    Party Level
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={partyLevel}
                    onChange={(e) => setPartyLevel(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <hr className="border-[#27272a]" />

              {/* Difficulty Display */}
              <div className={`rounded-lg p-4 ${getDifficultyBg(encounterStats.difficulty)}`}>
                <div className="text-xs text-[#a1a1aa] mb-1">Difficulty</div>
                <div className={`text-3xl font-bold capitalize ${getDifficultyColor(encounterStats.difficulty)}`}>
                  {encounterStats.difficulty}
                </div>
                <div className="text-sm text-[#a1a1aa] mt-2">
                  {encounterStats.adjustedXP.toLocaleString()} Adjusted XP
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#a1a1aa]">Monsters:</span>
                  <span className="text-[#fafafa] font-medium">{encounterStats.totalMonsters}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#a1a1aa]">Raw XP:</span>
                  <span className="text-[#fafafa] font-medium">{encounterStats.totalXP.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#a1a1aa]">Adjusted XP:</span>
                  <span className="text-[#fafafa] font-medium">{encounterStats.adjustedXP.toLocaleString()}</span>
                </div>
              </div>

              <hr className="border-[#27272a]" />

              {/* XP Thresholds */}
              <div className="space-y-2">
                <div className="text-xs text-[#a1a1aa] mb-2">XP Thresholds</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-400">Easy:</span>
                    <span className="text-[#fafafa]">{encounterStats.thresholds.easy.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-400">Medium:</span>
                    <span className="text-[#fafafa]">{encounterStats.thresholds.medium.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-400">Hard:</span>
                    <span className="text-[#fafafa]">{encounterStats.thresholds.hard.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">Deadly:</span>
                    <span className="text-[#fafafa]">{encounterStats.thresholds.deadly.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <hr className="border-[#27272a]" />

              {/* Monster List */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-[#fafafa]">Monsters in Encounter</div>
                {encounterMonsters.length === 0 ? (
                  <div className="text-center py-8 text-[#a1a1aa]">
                    <div className="text-4xl mb-2">🎲</div>
                    <p className="text-sm">Add monsters from the right</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {encounterMonsters.map((monster) => (
                      <div
                        key={monster.instanceId}
                        className="glass-subtle rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[#fafafa] truncate">
                              {monster.name}
                            </div>
                            <div className="text-xs text-[#a1a1aa]">
                              CR {monster.cr}
                            </div>
                          </div>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeMonster(monster.instanceId)}
                          >
                            ✕
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => updateQuantity(monster.instanceId, monster.quantity - 1)}
                          >
                            −
                          </Button>
                          <span className="flex-1 text-center text-[#fafafa] font-medium">
                            ×{monster.quantity}
                          </span>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => updateQuantity(monster.instanceId, monster.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Monster Browser */}
          <div className="lg:col-span-2">
            <div className="glass rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-[#fafafa] mb-4">Add Monsters</h2>

              {/* Quick Filters */}
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={filters.name || ''}
                  onChange={(e) => updateFilter('name', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#fafafa] mb-2">
                      Min CR
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={30}
                      value={filters.crMin ?? 0}
                      onChange={(e) => updateFilter('crMin', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#fafafa] mb-2">
                      Max CR
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={30}
                      value={filters.crMax ?? 30}
                      onChange={(e) => updateFilter('crMax', parseFloat(e.target.value) || 30)}
                    />
                  </div>
                </div>
                {(filters.name || (filters.crMin ?? 0) > 0 || (filters.crMax ?? 30) < 30) && (
                  <Button variant="secondary" size="sm" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Monster Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMonsters.slice(0, 20).map((monster, index) => (
                <MonsterCard
                  key={`${monster.name}-${monster.sourceBook}-${index}`}
                  monster={monster}
                  onSelect={setSelectedMonster}
                  onAddToEncounter={(m) => addMonster(m, 1)}
                />
              ))}
            </div>

            {filteredMonsters.length > 20 && (
              <div className="text-center mt-6 text-[#a1a1aa]">
                Showing 20 of {filteredMonsters.length} results. Use filters to narrow down.
              </div>
            )}
          </div>
        </div>

        {/* Monster Detail Modal */}
        <Modal
          isOpen={!!selectedMonster}
          onClose={() => setSelectedMonster(null)}
          size="xl"
        >
          {selectedMonster && (
            <MonsterDetail
              monster={selectedMonster}
              onAddToEncounter={(m) => {
                addMonster(m, 1);
                setSelectedMonster(null);
              }}
            />
          )}
        </Modal>

        {/* Save Encounter Modal */}
        <Modal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          title="Save Encounter"
        >
          <div className="space-y-4">
            <Input
              type="text"
              label="Encounter Name"
              placeholder="e.g., Goblin Ambush"
              value={encounterName}
              onChange={(e) => setEncounterName(e.target.value)}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[#fafafa]">
                  Description (optional)
                </label>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={generateAIDescription}
                  disabled={generatingDescription || encounterMonsters.length === 0}
                >
                  {generatingDescription ? '✨ Generating...' : '✨ AI Generate'}
                </Button>
              </div>
              <textarea
                value={encounterDescription}
                onChange={(e) => setEncounterDescription(e.target.value)}
                placeholder="Describe the encounter context... or click 'AI Generate' for an automatic description"
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] min-h-[100px]"
              />
            </div>

            <Input
              type="text"
              label="Tags (comma-separated, optional)"
              placeholder="forest, bandits, level-3"
              value={encounterTags}
              onChange={(e) => setEncounterTags(e.target.value)}
            />

            <div className="glass-subtle rounded-lg p-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#a1a1aa]">Difficulty:</span>
                  <span className={`font-medium capitalize ${getDifficultyColor(encounterStats.difficulty)}`}>
                    {encounterStats.difficulty}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a1a1aa]">Monsters:</span>
                  <span className="text-[#fafafa]">{encounterStats.totalMonsters}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a1a1aa]">Party:</span>
                  <span className="text-[#fafafa]">Level {partyLevel}, {partySize} players</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveEncounter}>
                Save Encounter
              </Button>
            </div>
          </div>
        </Modal>

        {/* Load Encounter Modal */}
        <Modal
          isOpen={showLoadModal}
          onClose={() => setShowLoadModal(false)}
          title="Load Saved Encounter"
        >
          <div className="space-y-3">
            {savedEncounters.length === 0 ? (
              <div className="text-center py-8 text-[#a1a1aa]">
                <p className="text-sm">No saved encounters yet</p>
                <p className="text-xs mt-2">Build an encounter and click &quot;Save&quot; to save it</p>
              </div>
            ) : (
              savedEncounters.map((encounter) => (
                <div
                  key={encounter.id}
                  className="glass-subtle rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#fafafa] mb-1">
                        {encounter.name}
                      </h3>
                      {encounter.description && (
                        <p className="text-sm text-[#a1a1aa] mb-2">
                          {encounter.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded capitalize ${getDifficultyBg(encounter.difficulty)} ${getDifficultyColor(encounter.difficulty)}`}>
                          {encounter.difficulty}
                        </span>
                        <span className="text-xs text-[#a1a1aa]">
                          Level {encounter.partyLevel} • {encounter.partySize} players
                        </span>
                      </div>
                      <div className="text-xs text-[#a1a1aa]">
                        {encounter.monsters && Array.isArray(encounter.monsters)
                          ? encounter.monsters.map(m => `${m.count}× ${m.name}`).join(', ')
                          : 'No monsters'}
                      </div>
                      {encounter.tags && Array.isArray(encounter.tags) && encounter.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {encounter.tags.map((tag, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 bg-[#27272a] text-[#fafafa] rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => loadSavedEncounter(encounter)}
                      >
                        Load
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteSavedEncounter(encounter.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
