"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Modal } from '@/app/components/ui/modal';
import { validateCombatantInput, ValidationError } from '@/app/lib/validators/combat.validator';
import { useToast } from '@/app/components/ui/toast';
import { useConfirm } from '@/app/components/ui/confirm-dialog';
import {
  Combatant,
  Condition,
  CombatLogEntry,
  DND_CONDITIONS,
  CONDITION_DESCRIPTIONS,
  rollInitiative,
  sortCombatantsByInitiative,
  getHpPercentage,
  getHpColor,
  getHpTextColor,
  isDead,
  isBloodied,
  applyDamage,
  healCombatant,
  addCondition,
  removeCondition,
  decrementConditionDurations,
  createDefaultCombatant,
  createLogEntry,
  getCombatantIcon,
  getTypeColor,
  getTypeBgColor,
  addDeathSaveSuccess,
  addDeathSaveFailure,
  resetDeathSaves,
  isStable,
  isPermanentlyDead,
  initializeDeathSaves,
} from '@/app/types/combat';
import { Campaign } from '@/app/types/campaign';
import { Character, calculateModifier } from '@/app/types/character';
import { Monster } from '@/app/types/monster';
import { getXPThreshold } from '@/app/lib/xp-thresholds';
import { safeParseJSON } from '@/app/lib/utils/json-utils';

export default function CombatTrackerPage() {
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [log, setLog] = useState<CombatLogEntry[]>([]);

  // Drag and drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Add Combatant Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'player' | 'monster' | 'npc'>('monster');
  const [newInitMod, setNewInitMod] = useState(0);
  const [newMaxHp, setNewMaxHp] = useState(10);
  const [newAc, setNewAc] = useState(10);

  // Condition Modal
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [selectedCombatantId, setSelectedCombatantId] = useState<string | null>(null);

  // Load Party Modal
  const [showLoadPartyModal, setShowLoadPartyModal] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Random Encounter Modal
  const [showRandomEncounterModal, setShowRandomEncounterModal] = useState(false);
  const [partyLevel, setPartyLevel] = useState(1);
  const [partySize, setPartySize] = useState(4);
  const [encounterDifficulty, setEncounterDifficulty] = useState<'easy' | 'medium' | 'hard' | 'deadly'>('medium');
  const [monsters, setMonsters] = useState<Monster[]>([]);

  // Memoize sorted combatants to prevent unnecessary re-calculations
  const sortedCombatants = useMemo(
    () => sortCombatantsByInitiative(combatants),
    [combatants]
  );
  const currentCombatant = sortedCombatants[currentTurn] ?? null;

  // Load campaigns and monsters from localStorage
  useEffect(() => {
    const storedCampaigns = localStorage.getItem('dnd-campaigns');
    if (storedCampaigns) {
      const result = safeParseJSON<Campaign[]>(storedCampaigns, []);
      if (result.success) {
        setCampaigns(result.data);
      } else {
        console.error('Failed to load campaigns:', result.error);
        addToast('Failed to load campaigns. Data may be corrupted.', 'error');
      }
    }

    const storedMonsters = localStorage.getItem('dnd-monsters');
    if (storedMonsters) {
      const result = safeParseJSON<Monster[]>(storedMonsters, []);
      if (result.success) {
        setMonsters(result.data);
      } else {
        console.error('Failed to load monsters:', result.error);
        addToast('Failed to load monsters. Data may be corrupted.', 'error');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for pending encounter from encounter builder
  useEffect(() => {
    const pendingEncounter = sessionStorage.getItem('pending-encounter');
    if (pendingEncounter) {
      try {
        const encounterData = JSON.parse(pendingEncounter);

        // Load monsters into combat
        const newCombatants: Combatant[] = [];
        const logEntries: CombatLogEntry[] = [];

        encounterData.monsters.forEach(({ monster, quantity }: { monster: Monster, quantity: number }) => {
          const dexMod = calculateModifier(monster.dexterity || 10);

          for (let i = 0; i < quantity; i++) {
            const combatant: Combatant = {
              id: crypto.randomUUID(),
              name: quantity > 1 ? `${monster.name} ${i + 1}` : monster.name,
              type: 'monster',
              initiative: rollInitiative(dexMod),
              initiativeModifier: dexMod,
              maxHitPoints: monster.hit_points || 10,
              currentHitPoints: monster.hit_points || 10,
              temporaryHitPoints: 0,
              ac: monster.armor_class || 10,
              isActive: true,
              conditions: [],
              effects: [],
              exhaustionLevel: 0,
              monsterId: monster.slug || monster.name.toLowerCase().replace(/\s+/g, '-'),
              addedAt: new Date().toISOString(),
            };
            newCombatants.push(combatant);

            // Create log entry for this combatant
            logEntries.push(
              createLogEntry(
                'initiative',
                combatant.id,
                combatant.name,
                `${combatant.name} rolled initiative: ${combatant.initiative}`,
                1
              )
            );
          }
        });

        // Add encounter load log entry
        logEntries.unshift(
          createLogEntry(
            'other',
            '',
            'System',
            `📂 Encounter loaded: ${newCombatants.length} monsters added`,
            1
          )
        );

        setCombatants(prev => [...prev, ...newCombatants]);
        setLog(prev => [...logEntries, ...prev]);

        // Clear the pending encounter
        sessionStorage.removeItem('pending-encounter');
      } catch (error) {
        // Failed to load pending encounter
        sessionStorage.removeItem('pending-encounter');
      }
    }
  }, []);

  const loadPartyFromCampaign = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const storedCharacters = localStorage.getItem('dnd-characters');
    if (!storedCharacters) return;

    const result = safeParseJSON<Character[]>(storedCharacters, []);
    if (!result.success) {
      console.error('Failed to load characters:', result.error);
      addToast('Failed to load characters. Data may be corrupted.', 'error');
      return;
    }

    const allCharacters = result.data;
    const partyCharacters = allCharacters.filter(char =>
      campaign.characterIds.includes(char.id)
    );

    // Convert characters to combatants
    const newCombatants: Combatant[] = partyCharacters.map(char => {
      const dexMod = calculateModifier(char.abilityScores.dexterity);
      return {
        id: crypto.randomUUID(),
        name: char.name,
        type: 'player' as const,
        initiative: rollInitiative(dexMod),
        initiativeModifier: dexMod,
        maxHitPoints: char.maxHitPoints,
        currentHitPoints: char.currentHitPoints,
        temporaryHitPoints: char.temporaryHitPoints || 0,
        ac: char.armorClass,
        isActive: true,
        conditions: [],
        effects: char.effects ?? [],
        exhaustionLevel: char.exhaustionLevel ?? 0,
        concentration: char.concentration,
        characterId: char.id,
        addedAt: new Date().toISOString(),
      };
    });

    setCombatants(prev => [...prev, ...newCombatants]);

    // Log each character added
    newCombatants.forEach(combatant => {
      addLog('initiative', combatant.id, combatant.name, `${combatant.name} joined combat (Initiative: ${combatant.initiative})`);
    });

    setShowLoadPartyModal(false);
  };

  const loadActiveCampaignParty = () => {
    // Find the active campaign
    const activeCampaign = campaigns.find(c => c.status === 'active');

    if (!activeCampaign) {
      addToast('No active campaign found. Please set a campaign as "active" first, or use the "Load Party" button to select a campaign.', 'error');
      return;
    }

    loadPartyFromCampaign(activeCampaign.id);
  };

  const generateRandomEncounter = () => {
    if (monsters.length === 0) {
      addToast('No monsters available. Please import the monster database first.', 'error');
      return;
    }

    // Calculate XP budget using shared thresholds
    const levelThresholds = getXPThreshold(partyLevel, 10);
    const xpBudget = levelThresholds[encounterDifficulty] * partySize;

    // Filter monsters by appropriate CR (roughly party level +/- 2)
    const minCR = Math.max(0, partyLevel - 2);
    const maxCR = partyLevel + 2;
    const appropriateMonsters = monsters.filter((m: Monster) => {
      const cr = typeof m.challenge_rating === 'string' ? parseFloat(m.challenge_rating) : (m.challenge_rating ?? 0);
      return cr >= minCR && cr <= maxCR;
    });

    if (appropriateMonsters.length === 0) {
      addToast('No appropriate monsters found for this level range.', 'error');
      return;
    }

    // Simple random selection - pick 1-4 monsters that fit the XP budget
    const encounterMonsters: Monster[] = [];
    let currentXP = 0;
    const monsterCount = Math.floor(Math.random() * 3) + 1; // 1-3 monsters

    for (let i = 0; i < monsterCount && currentXP < xpBudget * 0.8; i++) {
      const randomMonster: Monster = appropriateMonsters[Math.floor(Math.random() * appropriateMonsters.length)];
      encounterMonsters.push(randomMonster);
      currentXP += randomMonster.xp || 0;
    }

    // Convert monsters to combatants
    const newCombatants: Combatant[] = encounterMonsters.map((monster, index) => {
      const dexMod = calculateModifier(monster.dexterity || 10);
      const name = encounterMonsters.filter(m => m.name === monster.name).length > 1
        ? `${monster.name} ${index + 1}`
        : monster.name;

      return {
        id: crypto.randomUUID(),
        name,
        type: 'monster' as const,
        initiative: rollInitiative(dexMod),
        initiativeModifier: dexMod,
        maxHitPoints: monster.hit_points || 10,
        currentHitPoints: monster.hit_points || 10,
        temporaryHitPoints: 0,
        ac: monster.armor_class || 10,
        isActive: true,
        conditions: [],
        effects: [],
        exhaustionLevel: 0,
        monsterId: monster.slug || monster.name.toLowerCase().replace(/\s+/g, '-'),
        addedAt: new Date().toISOString(),
      };
    });

    setCombatants(prev => [...prev, ...newCombatants]);

    // Log encounter
    addLog('other', '', 'System', `🎲 Random encounter generated: ${encounterMonsters.map(m => m.name).join(', ')}`);
    newCombatants.forEach(combatant => {
      addLog('initiative', combatant.id, combatant.name, `${combatant.name} rolled initiative: ${combatant.initiative}`);
    });

    setShowRandomEncounterModal(false);
  };

  const addCombatant = () => {
    if (!newName.trim()) {
      addToast('Name is required', 'error');
      return;
    }

    try {
      // Validate input values
      const validated = validateCombatantInput({
        hp: newMaxHp,
        ac: newAc,
        initiativeModifier: newInitMod,
      });

      const combatant: Combatant = {
        id: crypto.randomUUID(),
        ...createDefaultCombatant(newName, newType),
        initiativeModifier: validated.initiativeModifier,
        initiative: rollInitiative(validated.initiativeModifier),
        maxHitPoints: validated.hp,
        currentHitPoints: validated.hp,
        ac: validated.ac,
      };

      setCombatants(prev => [...prev, combatant]);
      addLog('initiative', combatant.id, combatant.name, `${combatant.name} rolled initiative: ${combatant.initiative}`);

      // Reset form
      setNewName('');
      setNewType('monster');
      setNewInitMod(0);
      setNewMaxHp(10);
      setNewAc(10);
      setShowAddModal(false);
    } catch (error) {
      if (error instanceof ValidationError) {
        addToast(error.message, 'error');
      } else {
        addToast('Failed to add combatant', 'error');
      }
    }
  };

  const removeCombatant = (id: string) => {
    const combatant = combatants.find((c) => c.id === id);
    if (combatant) {
      addLog('other', id, combatant.name, `${combatant.name} removed from combat`);
    }
    setCombatants(prev => prev.filter((c) => c.id !== id));
  };

  const updateCombatant = (id: string, updates: Partial<Combatant>) => {
    setCombatants(prev => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const takeDamage = (id: string, amount: number) => {
    const combatant = combatants.find((c) => c.id === id);
    if (!combatant) return;

    let updated = applyDamage(combatant, amount);
    addLog('damage', id, combatant.name, `${combatant.name} took ${amount} damage`, amount);

    // Initialize death saves for players when they drop to 0 HP
    if (updated.currentHitPoints <= 0 && combatant.currentHitPoints > 0) {
      if (combatant.type === 'player') {
        updated = { ...updated, deathSaves: initializeDeathSaves() };
        addLog('death', id, combatant.name, `${combatant.name} is unconscious! Rolling death saves...`);
      } else {
        addLog('death', id, combatant.name, `${combatant.name} is dead!`);
      }
    }

    updateCombatant(id, updated);
  };

  const heal = (id: string, amount: number) => {
    const combatant = combatants.find((c) => c.id === id);
    if (!combatant) return;

    let updated = healCombatant(combatant, amount);

    // Reset death saves if healing from 0 HP
    if (combatant.currentHitPoints === 0 && updated.currentHitPoints > 0) {
      updated = resetDeathSaves(updated);
      addLog('heal', id, combatant.name, `${combatant.name} healed ${amount} HP and regained consciousness`, amount);
    } else {
      addLog('heal', id, combatant.name, `${combatant.name} healed ${amount} HP`, amount);
    }

    updateCombatant(id, updated);
  };

  const addConditionToCombatant = (combatantId: string, conditionName: string) => {
    const combatant = combatants.find((c) => c.id === combatantId);
    if (!combatant) return;

    const condition: Condition = {
      name: conditionName,
      description: CONDITION_DESCRIPTIONS[conditionName as keyof typeof CONDITION_DESCRIPTIONS] || '',
      duration: -1, // Permanent until removed
    };

    const updated = addCondition(combatant, condition);
    updateCombatant(combatantId, updated);
    addLog('condition', combatantId, combatant.name, `${combatant.name} is now ${conditionName}`);
  };

  const removeConditionFromCombatant = (combatantId: string, conditionName: string) => {
    const combatant = combatants.find((c) => c.id === combatantId);
    if (!combatant) return;

    const updated = removeCondition(combatant, conditionName);
    updateCombatant(combatantId, updated);
    addLog('condition', combatantId, combatant.name, `${conditionName} removed from ${combatant.name}`);
  };

  const markDeathSaveSuccess = (id: string) => {
    const combatant = combatants.find((c) => c.id === id);
    if (!combatant) return;

    const updated = addDeathSaveSuccess(combatant);
    updateCombatant(id, updated);

    if (isStable(updated)) {
      addLog('death', id, combatant.name, `${combatant.name} is now stable (3 successful death saves)`);
    } else {
      addLog('death', id, combatant.name, `${combatant.name} succeeded on a death save (${updated.deathSaves?.successes}/3)`);
    }
  };

  const markDeathSaveFailure = (id: string) => {
    const combatant = combatants.find((c) => c.id === id);
    if (!combatant) return;

    const updated = addDeathSaveFailure(combatant);
    updateCombatant(id, updated);

    if (isPermanentlyDead(updated)) {
      addLog('death', id, combatant.name, `${combatant.name} has died (3 failed death saves)`);
    } else {
      addLog('death', id, combatant.name, `${combatant.name} failed a death save (${updated.deathSaves?.failures}/3)`);
    }
  };

  const nextTurn = () => {
    if (sortedCombatants.length === 0) return;

    // Decrement conditions on current combatant's turn end
    if (currentCombatant) {
      const updated = decrementConditionDurations(currentCombatant);
      updateCombatant(currentCombatant.id, updated);
    }

    // Scan forward past inactive (dead) combatants
    const len = sortedCombatants.length;
    let nextIndex = currentTurn;
    let roundIncremented = false;
    let foundActive = false;

    for (let i = 1; i <= len; i++) {
      const candidate = (currentTurn + i) % len;
      if (candidate === 0 && !roundIncremented) {
        roundIncremented = true;
      }
      if (sortedCombatants[candidate].isActive) {
        nextIndex = candidate;
        foundActive = true;
        break;
      }
    }

    if (!foundActive) {
      // No active combatants remain; leave turn unchanged
      return;
    }

    setCurrentTurn(nextIndex);

    if (roundIncremented) {
      const newRound = currentRound + 1;
      setCurrentRound(newRound);
      addLog('other', '', 'System', `--- Round ${newRound} begins ---`);
    }
  };

  const startCombat = () => {
    if (combatants.length === 0) return;
    setIsActive(true);
    setCurrentRound(1);
    setCurrentTurn(0);
    addLog('other', '', 'System', '⚔️ Combat started!');
  };

  const endCombat = () => {
    setIsActive(false);
    addLog('other', '', 'System', '✅ Combat ended');
  };

  const resetCombat = async () => {
    const confirmed = await confirm({
      title: 'Reset combat?',
      message: 'This will remove all combatants and history. This action cannot be undone.',
      confirmVariant: 'danger',
    });

    if (confirmed) {
      setCombatants([]);
      setCurrentRound(1);
      setCurrentTurn(0);
      setIsActive(false);
      setLog([]);
      addToast('Combat reset successfully', 'info');
    }
  };

  const addLog = (
    type: CombatLogEntry['type'],
    combatantId: string,
    combatantName: string,
    message: string,
    amount?: number
  ) => {
    const entry = createLogEntry(type, combatantId, combatantName, message, currentRound, amount);
    setLog(prevLog => [entry, ...prevLog]); // Newest first, using functional update to avoid race conditions
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Add a ghost image
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
    }
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    // Find the dragged and target combatants in the sorted array
    const draggedIndex = sortedCombatants.findIndex(c => c.id === draggedId);
    const targetIndex = sortedCombatants.findIndex(c => c.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    // Reorder by swapping initiative values without mutating existing objects
    const draggedCombatant = combatants.find(c => c.id === draggedId);
    const targetCombatant = combatants.find(c => c.id === targetId);

    if (draggedCombatant && targetCombatant) {
      const draggedInit = draggedCombatant.initiative;
      const targetInit = targetCombatant.initiative;
      const newCombatants = combatants.map(c =>
        c.id === draggedId ? { ...c, initiative: targetInit } :
        c.id === targetId ? { ...c, initiative: draggedInit } :
        c
      );
      setCombatants(newCombatants);
      addLog('other', draggedId, draggedCombatant.name, `${draggedCombatant.name} moved in initiative order`);
    }

    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-[#fafafa] mb-2">
                Combat Tracker
              </h1>
              <p className="text-[#a1a1aa]">
                Manage initiative, HP, and conditions during combat
              </p>
            </div>
            <div className="flex gap-2">
              {!isActive ? (
                <Button variant="primary" size="sm" onClick={startCombat} disabled={combatants.length === 0}>
                  Start Combat
                </Button>
              ) : (
                <Button variant="danger" size="sm" onClick={endCombat}>
                  End Combat
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={resetCombat}>
                Reset
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={() => setShowAddModal(true)}>
              + Add Combatant
            </Button>
            <Button variant="primary" size="sm" onClick={loadActiveCampaignParty}>
              ⚡ Load Active Party
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowLoadPartyModal(true)}>
              🗺️ Load Party
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowRandomEncounterModal(true)}>
              🎲 Random Encounter
            </Button>
          </div>
        </div>

        {/* Combat Status */}
        {isActive && (
          <div className="glass rounded-xl p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <div className="text-sm text-[#a1a1aa]">Round</div>
                <div className="text-4xl font-bold text-[#fafafa]">{currentRound}</div>
              </div>
              {currentCombatant && (
                <div className="flex-1 text-center">
                  <div className="text-sm text-[#a1a1aa]">Current Turn</div>
                  <div className="text-xl sm:text-2xl font-bold text-[#8b5cf6]">
                    {getCombatantIcon(currentCombatant.type)} {currentCombatant.name}
                  </div>
                </div>
              )}
              <Button variant="primary" onClick={nextTurn} className="w-full sm:w-auto">
                Next Turn →
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Initiative Tracker */}
          <div className="lg:col-span-2">
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#fafafa] mb-4">
                Initiative Order
              </h2>

              {combatants.length === 0 ? (
                <div className="text-center py-12 text-[#a1a1aa]">
                  <div className="text-6xl mb-4">⚔️</div>
                  <p className="text-lg mb-2">No combatants yet</p>
                  <p className="text-sm">Add characters and monsters to start combat</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedCombatants.map((combatant, index) => {
                    const isCurrentTurn = isActive && index === currentTurn;
                    const hpPercentage = getHpPercentage(combatant);
                    const dead = isDead(combatant);
                    const bloodied = isBloodied(combatant);

                    return (
                      <div
                        key={combatant.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, combatant.id)}
                        onDragOver={(e) => handleDragOver(e, combatant.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, combatant.id)}
                        onDragEnd={handleDragEnd}
                        className={`glass-subtle rounded-lg p-4 transition-all cursor-move ${
                          isCurrentTurn ? 'ring-2 ring-[#8b5cf6] scale-[1.02]' : ''
                        } ${dead ? 'opacity-50' : ''} ${
                          draggedId === combatant.id ? 'opacity-30 scale-95' : ''
                        } ${
                          dragOverId === combatant.id ? 'ring-2 ring-[#fbbf24]' : ''
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            {/* Drag Handle */}
                            <div
                              className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors cursor-grab active:cursor-grabbing pr-2 text-2xl sm:text-base touch-manipulation p-1"
                              title="Drag to reorder"
                            >
                              ⋮⋮
                            </div>
                            <div
                              className={`text-3xl font-bold ${
                                isCurrentTurn ? 'text-[#8b5cf6]' : 'text-[#fafafa]'
                              }`}
                            >
                              {combatant.initiative}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{getCombatantIcon(combatant.type)}</span>
                                <span className="font-semibold text-[#fafafa]">
                                  {combatant.name}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${getTypeBgColor(combatant.type)} ${getTypeColor(combatant.type)}`}>
                                  {combatant.type}
                                </span>
                                {bloodied && !dead && (
                                  <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
                                    Bloodied
                                  </span>
                                )}
                                {dead && (
                                  <span className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-400">
                                    Down
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[#a1a1aa] mt-1">
                                AC {combatant.ac} • Init +{combatant.initiativeModifier}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeCombatant(combatant.id)}
                            className="text-[#a1a1aa] hover:text-red-400 transition-colors text-xl p-2 touch-manipulation"
                          >
                            ✕
                          </button>
                        </div>

                        {/* HP Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-[#a1a1aa]">HP</span>
                            <span className={`font-medium ${getHpTextColor(hpPercentage)}`}>
                              {combatant.currentHitPoints}/{combatant.maxHitPoints}
                              {combatant.temporaryHitPoints > 0 && ` (+${combatant.temporaryHitPoints})`}
                            </span>
                          </div>
                          <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getHpColor(hpPercentage)} transition-all`}
                              style={{ width: `${hpPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 mb-3">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => takeDamage(combatant.id, 5)}
                            className="sm:flex-1"
                          >
                            -5
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => takeDamage(combatant.id, 10)}
                            className="sm:flex-1"
                          >
                            -10
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => heal(combatant.id, 5)}
                            className="sm:flex-1"
                          >
                            +5
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => heal(combatant.id, 10)}
                            className="sm:flex-1"
                          >
                            +10
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedCombatantId(combatant.id);
                              setShowConditionModal(true);
                            }}
                            className="col-span-2 sm:col-span-1 sm:flex-1"
                          >
                            + Condition
                          </Button>
                        </div>

                        {/* Death Saves (for player characters at 0 HP) */}
                        {combatant.type === 'player' && dead && combatant.deathSaves && (
                          <div className="glass-subtle rounded-lg p-4 mb-3">
                            <div className="text-sm font-semibold text-[#fafafa] mb-3">Death Saves</div>
                            <div className="space-y-3">
                              {/* Successes */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-green-400">Successes</span>
                                  <span className="text-xs text-[#a1a1aa]">
                                    {combatant.deathSaves.successes}/3
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  {[0, 1, 2].map((i) => (
                                    <button
                                      key={`success-${i}`}
                                      onClick={() => markDeathSaveSuccess(combatant.id)}
                                      disabled={combatant.deathSaves!.successes >= 3}
                                      className={`flex-1 h-8 rounded transition-colors ${
                                        i < combatant.deathSaves!.successes
                                          ? 'bg-green-500 cursor-default'
                                          : 'bg-[#27272a] hover:bg-green-500/50 cursor-pointer'
                                      }`}
                                      title={i < combatant.deathSaves!.successes ? 'Success' : 'Mark success'}
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Failures */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-red-400">Failures</span>
                                  <span className="text-xs text-[#a1a1aa]">
                                    {combatant.deathSaves.failures}/3
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  {[0, 1, 2].map((i) => (
                                    <button
                                      key={`failure-${i}`}
                                      onClick={() => markDeathSaveFailure(combatant.id)}
                                      disabled={combatant.deathSaves!.failures >= 3}
                                      className={`flex-1 h-8 rounded transition-colors ${
                                        i < combatant.deathSaves!.failures
                                          ? 'bg-red-500 cursor-default'
                                          : 'bg-[#27272a] hover:bg-red-500/50 cursor-pointer'
                                      }`}
                                      title={i < combatant.deathSaves!.failures ? 'Failure' : 'Mark failure'}
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Status Messages */}
                              {isStable(combatant) && (
                                <div className="text-xs text-green-400 text-center py-2 px-3 bg-green-500/10 rounded">
                                  Stable - Character is stabilized and unconscious
                                </div>
                              )}
                              {isPermanentlyDead(combatant) && (
                                <div className="text-xs text-red-400 text-center py-2 px-3 bg-red-500/10 rounded">
                                  Dead - Character has died
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Conditions */}
                        {combatant.conditions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {combatant.conditions.map((condition) => (
                              <button
                                key={condition.name}
                                onClick={() => removeConditionFromCombatant(combatant.id, condition.name)}
                                className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs hover:bg-orange-500/30 transition-colors"
                                title={`Click to remove. ${condition.description}`}
                              >
                                {condition.name}
                                {condition.duration > 0 && ` (${condition.duration})`}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Combat Log */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-[#fafafa] mb-4">Combat Log</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {log.length === 0 ? (
                <div className="text-center py-8 text-[#a1a1aa]">
                  <p className="text-sm">No events yet</p>
                </div>
              ) : (
                log.map((entry) => (
                  <div
                    key={entry.id}
                    className="text-sm p-2 rounded bg-[#1a1a22] text-[#a1a1aa]"
                  >
                    <span className="text-[#8b5cf6] font-medium">
                      [R{entry.round}]
                    </span>{' '}
                    {entry.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Add Combatant Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Combatant"
        >
          <div className="space-y-4">
            <Input
              type="text"
              label="Name"
              placeholder="Goblin 1"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Type
              </label>
              <div className="flex gap-2">
                {(['player', 'monster', 'npc'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewType(type)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      newType === type
                        ? 'bg-[#8b5cf6] text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    {getCombatantIcon(type)} {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                type="number"
                label="Max HP"
                value={newMaxHp}
                onChange={(e) => setNewMaxHp(parseInt(e.target.value) || 10)}
                min={1}
              />
              <Input
                type="number"
                label="AC"
                value={newAc}
                onChange={(e) => setNewAc(parseInt(e.target.value) || 10)}
                min={0}
              />
              <Input
                type="number"
                label="Init Mod"
                value={newInitMod}
                onChange={(e) => setNewInitMod(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={addCombatant}>
                Add
              </Button>
            </div>
          </div>
        </Modal>

        {/* Condition Modal */}
        <Modal
          isOpen={showConditionModal}
          onClose={() => setShowConditionModal(false)}
          title="Add Condition"
        >
          <div className="space-y-2">
            {DND_CONDITIONS.map((condition) => (
              <button
                key={condition}
                onClick={() => {
                  if (selectedCombatantId) {
                    addConditionToCombatant(selectedCombatantId, condition);
                    setShowConditionModal(false);
                  }
                }}
                className="w-full text-left px-4 py-3 rounded-lg bg-[#27272a] text-[#fafafa] hover:bg-[#3f3f46] transition-colors"
                title={CONDITION_DESCRIPTIONS[condition]}
              >
                <div className="font-medium">{condition}</div>
                <div className="text-xs text-[#a1a1aa] mt-1">
                  {CONDITION_DESCRIPTIONS[condition]}
                </div>
              </button>
            ))}
          </div>
        </Modal>

        {/* Load Party Modal */}
        <Modal
          isOpen={showLoadPartyModal}
          onClose={() => setShowLoadPartyModal(false)}
          title="Load Party from Campaign"
        >
          <div className="space-y-3">
            {campaigns.length === 0 ? (
              <div className="text-center py-8 text-[#a1a1aa]">
                <p className="text-sm">No campaigns found</p>
                <p className="text-xs mt-2">Create a campaign first and add characters to it</p>
              </div>
            ) : (
              campaigns.map((campaign) => (
                <button
                  key={campaign.id}
                  onClick={() => loadPartyFromCampaign(campaign.id)}
                  className="w-full text-left px-4 py-4 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#fafafa]">{campaign.name}</div>
                      <div className="text-sm text-[#a1a1aa] mt-1">
                        {campaign.characterIds.length} characters • Level {campaign.currentLevel}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      campaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      campaign.status === 'planning' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {campaign.status}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Modal>

        {/* Random Encounter Modal */}
        <Modal
          isOpen={showRandomEncounterModal}
          onClose={() => setShowRandomEncounterModal(false)}
          title="Generate Random Encounter"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Party Level"
                min={1}
                max={20}
                value={partyLevel}
                onChange={(e) => setPartyLevel(parseInt(e.target.value) || 1)}
              />
              <Input
                type="number"
                label="Party Size"
                min={1}
                max={10}
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value) || 4)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Encounter Difficulty
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['easy', 'medium', 'hard', 'deadly'] as const).map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setEncounterDifficulty(difficulty)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all capitalize ${
                      encounterDifficulty === difficulty
                        ? difficulty === 'easy' ? 'bg-green-500 text-white' :
                          difficulty === 'medium' ? 'bg-blue-500 text-white' :
                          difficulty === 'hard' ? 'bg-orange-500 text-white' :
                          'bg-red-500 text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-subtle rounded-lg p-4">
              <div className="text-sm text-[#a1a1aa]">
                This will generate a random encounter with 1-3 monsters appropriate for a level {partyLevel} party of {partySize} characters.
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowRandomEncounterModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={generateRandomEncounter}>
                Generate Encounter
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
