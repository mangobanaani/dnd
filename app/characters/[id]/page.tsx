"use client";

import { useState, useEffect, use, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { InventoryItemModal } from '@/app/components/character/inventory-item-modal';
import { useToast } from '@/app/components/ui/toast';
import { useConfirm } from '@/app/components/ui/confirm-dialog';
import { StorageService } from '@/app/lib/services/storage.service';
import {
  Character,
  AbilityScores,
  InventoryItem,
  calculateModifier,
  formatModifier,
  calculateProficiencyBonus,
  calculateSkillModifier,
  calculateSavingThrow,
  calculateTotalWeight,
  calculateTotalValue,
  calculateMaxCarryWeight,
} from '@/app/types/character';

export default function CharacterSheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [character, setCharacter] = useState<Character | null>(null);
  const [editingHP, setEditingHP] = useState(false);
  const [hpInput, setHpInput] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemFilter, setItemFilter] = useState<'all' | 'equipped' | 'magical'>('all');

  // Initialize storage service
  const characterStorage = useMemo(() => new StorageService<Character>('dnd-characters'), []);

  useEffect(() => {
    try {
      const found = characterStorage.getById(id);
      if (found) {
        // Migrate old characters without inventory field
        const migrated = {
          ...found,
          inventory: found.inventory || [],
          currency: found.currency || {
            copper: 0,
            silver: 0,
            electrum: 0,
            gold: 0,
            platinum: 0,
          },
        };
        setCharacter(migrated);
        setHpInput(migrated.currentHitPoints.toString());

        // Save migrated character back if needed
        if (!found.inventory) {
          characterStorage.update(id, migrated);
        }
      }
    } catch (error) {
      console.error('Failed to load character:', error);
      addToast('Failed to load character', 'error');
    }
  }, [id, characterStorage, addToast]);

  const saveCharacter = useCallback((updated: Character) => {
    try {
      characterStorage.update(updated.id, updated);
      setCharacter(updated);
    } catch (error) {
      console.error('Failed to save character:', error);
      addToast('Failed to save character', 'error');
    }
  }, [characterStorage, addToast]);

  const updateHP = () => {
    if (!character) return;
    const newHP = parseInt(hpInput) || 0;
    const clamped = Math.max(0, Math.min(character.maxHitPoints, newHP));
    saveCharacter({
      ...character,
      currentHitPoints: clamped,
      updatedAt: new Date().toISOString(),
    });
    setHpInput(clamped.toString());
    setEditingHP(false);
  };

  const takeDamage = (amount: number) => {
    if (!character) return;
    const newHP = Math.max(0, character.currentHitPoints - amount);
    saveCharacter({
      ...character,
      currentHitPoints: newHP,
      updatedAt: new Date().toISOString(),
    });
    setHpInput(newHP.toString());
  };

  const heal = (amount: number) => {
    if (!character) return;
    const newHP = Math.min(
      character.maxHitPoints,
      character.currentHitPoints + amount
    );
    saveCharacter({
      ...character,
      currentHitPoints: newHP,
      updatedAt: new Date().toISOString(),
    });
    setHpInput(newHP.toString());
  };

  const shortRest = () => {
    if (!character) return;

    // In a full implementation, this would show a modal to roll hit dice
    // For now, we'll restore half of max HP as a simplified version
    const healAmount = Math.floor(character.maxHitPoints / 2);
    const newHP = Math.min(
      character.maxHitPoints,
      character.currentHitPoints + healAmount
    );
    const actualHealing = newHP - character.currentHitPoints;

    saveCharacter({
      ...character,
      currentHitPoints: newHP,
      updatedAt: new Date().toISOString(),
    });
    setHpInput(newHP.toString());

    if (actualHealing > 0) {
      addToast(`Short rest complete! Restored ${actualHealing} HP`, 'success');
    } else {
      addToast('Short rest complete! HP already at maximum', 'info');
    }
  };

  const longRest = () => {
    if (!character) return;

    // Long Rest: Restore all HP and reset all spell slots
    const updatedSpellSlots = character.spellSlots?.map(slot => ({
      ...slot,
      used: 0
    }));

    // Restore hit dice (half of total, minimum 1)
    const updatedHitDice = character.hitDice.map(hd => ({
      ...hd,
      current: Math.max(1, Math.ceil(hd.total / 2))
    }));

    const hpRestored = character.maxHitPoints - character.currentHitPoints;

    saveCharacter({
      ...character,
      currentHitPoints: character.maxHitPoints,
      spellSlots: updatedSpellSlots,
      hitDice: updatedHitDice,
      updatedAt: new Date().toISOString(),
    });
    setHpInput(character.maxHitPoints.toString());

    addToast(`Long rest complete! HP fully restored (+${hpRestored}), spell slots recharged, and hit dice recovered`, 'success', 4000);
  };

  // Inventory management functions
  const addOrUpdateItem = (item: Omit<InventoryItem, 'id'>) => {
    if (!character) return;

    let updatedInventory: InventoryItem[];

    if (editingItem) {
      // Update existing item
      updatedInventory = character.inventory.map(i =>
        i.id === editingItem.id ? { ...item, id: editingItem.id } : i
      );
    } else {
      // Add new item
      const newItem: InventoryItem = {
        ...item,
        id: crypto.randomUUID(),
      };
      updatedInventory = [...character.inventory, newItem];
    }

    saveCharacter({
      ...character,
      inventory: updatedInventory,
      updatedAt: new Date().toISOString(),
    });

    setShowAddItem(false);
    setEditingItem(null);
  };

  const deleteItem = async (itemId: string) => {
    if (!character) return;

    const item = character.inventory.find(i => i.id === itemId);
    const confirmed = await confirm({
      title: 'Delete Item',
      message: `Delete ${item?.name || 'this item'} from inventory?`,
      confirmLabel: 'Delete',
      confirmVariant: 'danger'
    });

    if (confirmed) {
      saveCharacter({
        ...character,
        inventory: character.inventory.filter(i => i.id !== itemId),
        updatedAt: new Date().toISOString(),
      });
      addToast(`${item?.name || 'Item'} removed from inventory`, 'success');
    }
  };

  const toggleEquipped = (itemId: string) => {
    if (!character) return;

    saveCharacter({
      ...character,
      inventory: character.inventory.map(i =>
        i.id === itemId ? { ...i, equipped: !i.equipped } : i
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const toggleAttuned = (itemId: string) => {
    if (!character) return;

    saveCharacter({
      ...character,
      inventory: character.inventory.map(i =>
        i.id === itemId ? { ...i, attuned: !i.attuned } : i
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    if (!character) return;

    saveCharacter({
      ...character,
      inventory: character.inventory.map(i =>
        i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
      ).filter(i => i.quantity > 0), // Remove items with 0 quantity
      updatedAt: new Date().toISOString(),
    });
  };

  const getFilteredInventory = () => {
    if (!character) return [];

    let items = character.inventory;

    if (itemFilter === 'equipped') {
      items = items.filter(i => i.equipped);
    } else if (itemFilter === 'magical') {
      items = items.filter(i => i.magical);
    }

    return items;
  };

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="text-[#fafafa] text-xl mb-4">Character not found</div>
          <Link href="/characters">
            <Button variant="primary">Back to Characters</Button>
          </Link>
        </div>
      </div>
    );
  }

  const proficiencyBonus = calculateProficiencyBonus(character.level);
  const getHPPercentage = () =>
    (character.currentHitPoints / character.maxHitPoints) * 100;
  const getHPColor = () => {
    const pct = getHPPercentage();
    if (pct > 66) return 'bg-green-500';
    if (pct > 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/characters">
            <Button variant="secondary" size="sm">
              ← Back to Characters
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={async () => {
              const confirmed = await confirm({
                title: 'Delete Character',
                message: `Are you sure you want to delete ${character?.name || 'this character'}? This action cannot be undone.`,
                confirmLabel: 'Delete Character',
                confirmVariant: 'danger'
              });

              if (confirmed) {
                const stored = localStorage.getItem('dnd-characters');
                if (stored) {
                  const characters: Character[] = JSON.parse(stored);
                  const updated = characters.filter((c) => c.id !== id);
                  localStorage.setItem('dnd-characters', JSON.stringify(updated));
                  addToast(`${character?.name || 'Character'} deleted`, 'success');
                  router.push('/characters');
                }
              }
            }}
          >
            Delete
          </Button>
        </div>

        {/* Character Header */}
        <div className="glass rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[#fafafa] mb-2">
                {character.name}
              </h1>
              <div className="flex items-center gap-4 text-[#a1a1aa]">
                <span>Level {character.level}</span>
                <span>•</span>
                <span>{character.race}</span>
                <span>•</span>
                <span>
                  {character.classes.map((c) => `${c.name} ${c.level}`).join(', ')}
                </span>
              </div>
              <div className="mt-1 text-sm text-[#a1a1aa]">
                {character.background && `${character.background} • `}
                {character.alignment}
              </div>
            </div>
          </div>

          {/* HP & Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* HP */}
            <div className="md:col-span-2 glass-subtle rounded-lg p-4">
              <div className="text-sm text-[#a1a1aa] mb-2">Hit Points</div>
              {editingHP ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={hpInput}
                    onChange={(e) => setHpInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') updateHP();
                      if (e.key === 'Escape') {
                        setEditingHP(false);
                        setHpInput(character.currentHitPoints.toString());
                      }
                    }}
                    className="w-24"
                    autoFocus
                  />
                  <Button variant="primary" size="sm" onClick={updateHP}>
                    ✓
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditingHP(false);
                      setHpInput(character.currentHitPoints.toString());
                    }}
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <div
                  className="text-3xl font-bold text-[#fafafa] mb-3 cursor-pointer hover:text-[#8b5cf6] transition-colors"
                  onClick={() => setEditingHP(true)}
                >
                  {character.currentHitPoints} / {character.maxHitPoints}
                </div>
              )}
              <div className="h-3 bg-black/20 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full ${getHPColor()} transition-all`}
                  style={{ width: `${getHPPercentage()}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => takeDamage(5)}
                >
                  -5
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => takeDamage(10)}
                >
                  -10
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => heal(5)}
                >
                  +5
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => heal(10)}
                >
                  +10
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={shortRest}
                  className="flex-1"
                >
                  Short Rest
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={longRest}
                  className="flex-1"
                >
                  Long Rest
                </Button>
              </div>
            </div>

            {/* AC */}
            <div className="glass-subtle rounded-lg p-4 text-center">
              <div className="text-sm text-[#a1a1aa] mb-2">Armor Class</div>
              <div className="text-5xl font-bold text-[#8b5cf6]">
                {character.armorClass}
              </div>
            </div>

            {/* Initiative */}
            <div className="glass-subtle rounded-lg p-4 text-center">
              <div className="text-sm text-[#a1a1aa] mb-2">Initiative</div>
              <div className="text-5xl font-bold text-[#fbbf24]">
                {formatModifier(
                  calculateModifier(character.abilityScores.dexterity)
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Ability Scores & Saves */}
          <div className="space-y-6">
            {/* Ability Scores */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#fafafa] mb-4">
                Ability Scores
              </h2>
              <div className="space-y-3">
                {(
                  Object.keys(character.abilityScores) as Array<
                    keyof AbilityScores
                  >
                ).map((ability) => {
                  const score = character.abilityScores[ability];
                  const modifier = calculateModifier(score);

                  return (
                    <div
                      key={ability}
                      className="glass-subtle rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium text-[#fafafa] capitalize">
                          {ability}
                        </div>
                        <div className="text-xs text-[#a1a1aa]">Score</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-[#8b5cf6]">
                          {formatModifier(modifier)}
                        </div>
                        <div className="text-sm text-[#a1a1aa]">{score}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Saving Throws */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#fafafa] mb-4">
                Saving Throws
              </h2>
              <div className="space-y-2">
                {(
                  Object.keys(character.abilityScores) as Array<
                    keyof AbilityScores
                  >
                ).map((ability) => {
                  const saveModifier = calculateSavingThrow(
                    ability,
                    character.abilityScores,
                    character.savingThrows,
                    proficiencyBonus
                  );
                  const isProficient = character.savingThrows.includes(ability);

                  return (
                    <div
                      key={ability}
                      className="flex items-center justify-between p-3 bg-[#27272a] rounded"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isProficient ? 'bg-[#8b5cf6]' : 'bg-[#52525b]'
                          }`}
                        />
                        <span className="text-sm text-[#fafafa] capitalize">
                          {ability}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-[#fafafa]">
                        {formatModifier(saveModifier)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Combat Stats */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#fafafa] mb-4">
                Combat Stats
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa]">Speed</span>
                  <span className="text-[#fafafa] font-medium">
                    {character.speed} ft.
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa]">Proficiency Bonus</span>
                  <span className="text-[#fafafa] font-medium">
                    +{proficiencyBonus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa]">Hit Dice</span>
                  <span className="text-[#fafafa] font-medium">
                    {character.hitDice
                      .map((hd) => `${hd.current}/${hd.total}${hd.die}`)
                      .join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Spell Slots (if spellcaster) */}
            {character.spellSlots && character.spellSlots.length > 0 && (
              <div className="glass rounded-xl p-6">
                <h2 className="text-xl font-bold text-[#fafafa] mb-4">
                  Spell Slots
                </h2>
                <div className="space-y-3">
                  {character.spellSlots.map((slot) => {
                    const available = slot.total - slot.used;
                    return (
                      <div key={slot.level} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[#a1a1aa]">
                            Level {slot.level}
                          </span>
                          <span className="text-[#fafafa] font-medium">
                            {available}/{slot.total}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: slot.total }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                const updatedSlots = character.spellSlots?.map(s =>
                                  s.level === slot.level
                                    ? { ...s, used: i < slot.used ? i : i + 1 }
                                    : s
                                );
                                saveCharacter({
                                  ...character,
                                  spellSlots: updatedSlots,
                                  updatedAt: new Date().toISOString(),
                                });
                              }}
                              className={`flex-1 h-8 rounded transition-colors ${
                                i < slot.used
                                  ? 'bg-[#27272a] hover:bg-[#3f3f46]'
                                  : 'bg-[#8b5cf6] hover:bg-[#7c3aed]'
                              }`}
                              title={i < slot.used ? 'Used' : 'Available'}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Middle Column - Skills */}
          <div className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#fafafa] mb-4">Skills</h2>
              <div className="space-y-2">
                {character.skills.map((skill) => {
                  const modifier = calculateSkillModifier(
                    skill,
                    character.abilityScores,
                    proficiencyBonus
                  );

                  return (
                    <div
                      key={skill.name}
                      className="flex items-center justify-between p-3 bg-[#27272a] rounded hover:bg-[#3f3f46] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            skill.expertise
                              ? 'bg-[#fbbf24]'
                              : skill.proficient
                              ? 'bg-[#8b5cf6]'
                              : 'bg-[#52525b]'
                          }`}
                        />
                        <div>
                          <div className="text-sm text-[#fafafa]">
                            {skill.name}
                          </div>
                          <div className="text-xs text-[#a1a1aa] capitalize">
                            {skill.ability}
                          </div>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-[#fafafa]">
                        {formatModifier(modifier)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Features & Equipment */}
          <div className="space-y-6">
            {/* Features & Traits */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#fafafa] mb-4">
                Features & Traits
              </h2>
              {character.features.length === 0 &&
              character.traits.length === 0 ? (
                <p className="text-[#a1a1aa] text-sm">
                  No features or traits added yet
                </p>
              ) : (
                <div className="space-y-2">
                  {[...character.features, ...character.traits].map(
                    (feature, index) => (
                      <div
                        key={index}
                        className="p-3 bg-[#27272a] rounded text-sm text-[#fafafa]"
                      >
                        {feature}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Inventory */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#fafafa]">Inventory</h2>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingItem(null);
                    setShowAddItem(true);
                  }}
                >
                  + Add Item
                </Button>
              </div>

              {/* Carry Capacity */}
              <div className="glass-subtle rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[#a1a1aa]">Carry Capacity</span>
                  <span className={`font-medium ${
                    calculateTotalWeight(character.inventory) > calculateMaxCarryWeight(character.abilityScores.strength)
                      ? 'text-red-400'
                      : 'text-[#fafafa]'
                  }`}>
                    {calculateTotalWeight(character.inventory).toFixed(1)} / {calculateMaxCarryWeight(character.abilityScores.strength)} lbs
                  </span>
                </div>
                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      calculateTotalWeight(character.inventory) > calculateMaxCarryWeight(character.abilityScores.strength)
                        ? 'bg-red-500'
                        : 'bg-[#8b5cf6]'
                    }`}
                    style={{
                      width: `${Math.min(100, (calculateTotalWeight(character.inventory) / calculateMaxCarryWeight(character.abilityScores.strength)) * 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setItemFilter('all')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    itemFilter === 'all'
                      ? 'bg-[#8b5cf6] text-white'
                      : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                  }`}
                >
                  All ({character.inventory.length})
                </button>
                <button
                  onClick={() => setItemFilter('equipped')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    itemFilter === 'equipped'
                      ? 'bg-[#8b5cf6] text-white'
                      : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                  }`}
                >
                  Equipped ({character.inventory.filter(i => i.equipped).length})
                </button>
                <button
                  onClick={() => setItemFilter('magical')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    itemFilter === 'magical'
                      ? 'bg-[#8b5cf6] text-white'
                      : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                  }`}
                >
                  Magical ({character.inventory.filter(i => i.magical).length})
                </button>
              </div>

              {/* Inventory List */}
              {getFilteredInventory().length === 0 ? (
                <p className="text-[#a1a1aa] text-sm text-center py-4">
                  {itemFilter === 'all' ? 'No items in inventory' : `No ${itemFilter} items`}
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {getFilteredInventory().map((item) => (
                    <div
                      key={item.id}
                      className="glass-subtle rounded-lg p-3 hover:bg-[#27272a] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#fafafa]">
                              {item.name}
                            </span>
                            {item.equipped && (
                              <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                                E
                              </span>
                            )}
                            {item.attuned && (
                              <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                                A
                              </span>
                            )}
                            {item.magical && (
                              <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                                ✨
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#a1a1aa] mt-1">
                            {item.type} • {item.weight} lbs • {item.value} gp
                            {item.rarity && item.rarity !== 'common' && ` • ${item.rarity}`}
                          </div>
                          {item.description && (
                            <div className="text-xs text-[#71717a] mt-1">
                              {item.description}
                            </div>
                          )}
                          {item.properties && item.properties.length > 0 && (
                            <div className="text-xs text-[#a1a1aa] mt-1">
                              {item.properties.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-2 mt-2">
                        {/* Quantity Controls */}
                        {item.quantity > 1 && (
                          <div className="flex items-center gap-1 bg-[#18181b] rounded px-2 py-1">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="text-xs text-[#a1a1aa] hover:text-white transition-colors"
                            >
                              −
                            </button>
                            <span className="text-xs text-[#fafafa] font-medium min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="text-xs text-[#a1a1aa] hover:text-white transition-colors"
                            >
                              +
                            </button>
                          </div>
                        )}

                        {/* Toggle Buttons */}
                        {(item.type === 'weapon' || item.type === 'armor') && (
                          <button
                            onClick={() => toggleEquipped(item.id)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              item.equipped
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                            }`}
                          >
                            {item.equipped ? 'Equipped' : 'Equip'}
                          </button>
                        )}

                        {item.magical && (
                          <button
                            onClick={() => toggleAttuned(item.id)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              item.attuned
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                            }`}
                          >
                            {item.attuned ? 'Attuned' : 'Attune'}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setShowAddItem(true);
                          }}
                          className="px-2 py-1 text-xs bg-[#27272a] text-[#a1a1aa] rounded hover:bg-[#3f3f46] transition-colors ml-auto"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteItem(item.id)}
                          className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Value */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
                <span className="text-[#a1a1aa]">Total Value</span>
                <span className="text-[#fbbf24] font-bold">
                  {calculateTotalValue(character.inventory)} gp
                </span>
              </div>
            </div>

            {/* Currency */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#fafafa] mb-4">
                Currency
              </h2>
              <div className="space-y-2">
                {Object.entries(character.currency).map(([type, amount]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-[#a1a1aa] capitalize">{type}</span>
                    <span className="text-[#fafafa] font-medium">{amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* XP */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#fafafa] mb-4">
                Experience
              </h2>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#8b5cf6] mb-1">
                  {character.experiencePoints.toLocaleString()}
                </div>
                <div className="text-sm text-[#a1a1aa]">XP</div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Item Modal */}
        <InventoryItemModal
          isOpen={showAddItem}
          onClose={() => {
            setShowAddItem(false);
            setEditingItem(null);
          }}
          onSave={addOrUpdateItem}
          editingItem={editingItem}
        />
      </div>
    </div>
  );
}
