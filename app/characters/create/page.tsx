"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  DND_CLASSES,
  DND_RACES,
  DND_ALIGNMENTS,
  DND_SKILLS,
  AbilityScores,
  Skill,
  calculateModifier,
  formatModifier,
} from '@/app/types/character';

type WizardStep = 'basic' | 'abilities' | 'skills' | 'equipment' | 'personality' | 'review';

export default function CreateCharacterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic');

  // Character state
  const [name, setName] = useState('');
  const [race, setRace] = useState<string>('Human');
  const [characterClass, setCharacterClass] = useState<string>('Fighter');
  const [background, setBackground] = useState('');
  const [alignment, setAlignment] = useState<string>('True Neutral');

  // Ability scores
  const [abilityScores, setAbilityScores] = useState<AbilityScores>({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  });

  // Skills
  const [skills, setSkills] = useState<Skill[]>(
    JSON.parse(JSON.stringify(DND_SKILLS))
  );

  // Equipment
  const [startingGold, setStartingGold] = useState(0);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  // Personality
  const [appearance, setAppearance] = useState('');
  const [personalityTraits, setPersonalityTraits] = useState('');
  const [ideals, setIdeals] = useState('');
  const [bonds, setBonds] = useState('');
  const [flaws, setFlaws] = useState('');

  const updateAbilityScore = (ability: keyof AbilityScores, value: number) => {
    setAbilityScores((prev) => ({
      ...prev,
      [ability]: Math.max(1, Math.min(20, value)),
    }));
  };

  const toggleSkillProficiency = (skillName: string) => {
    setSkills((prev) =>
      prev.map((skill) =>
        skill.name === skillName
          ? { ...skill, proficient: !skill.proficient }
          : skill
      )
    );
  };

  // Random generators
  const randomName = () => {
    const firstNames = [
      'Aldric', 'Brynn', 'Cedric', 'Dara', 'Elara', 'Finn', 'Gwyn', 'Haldor',
      'Isolde', 'Joren', 'Kara', 'Lyra', 'Magnus', 'Nessa', 'Orin', 'Petra',
      'Quinn', 'Rowan', 'Sera', 'Theron', 'Uma', 'Vex', 'Wren', 'Zara',
    ];
    const lastNames = [
      'Ashwood', 'Blackstone', 'Brightblade', 'Darkwater', 'Emberforge', 'Frostwind',
      'Goldleaf', 'Ironheart', 'Moonwhisper', 'Nightshade', 'Oakenshield', 'Ravenclaw',
      'Shadowstep', 'Silverstream', 'Stormborn', 'Swiftarrow', 'Thornguard', 'Wildmane',
    ];
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    setName(`${first} ${last}`);
  };

  const randomRace = () => {
    const randomIndex = Math.floor(Math.random() * DND_RACES.length);
    setRace(DND_RACES[randomIndex]);
  };

  const randomClass = () => {
    const randomIndex = Math.floor(Math.random() * DND_CLASSES.length);
    setCharacterClass(DND_CLASSES[randomIndex]);
  };

  const randomAlignment = () => {
    const randomIndex = Math.floor(Math.random() * DND_ALIGNMENTS.length);
    setAlignment(DND_ALIGNMENTS[randomIndex]);
  };

  const randomBackground = () => {
    const backgrounds = [
      'Acolyte', 'Charlatan', 'Criminal', 'Entertainer', 'Folk Hero', 'Guild Artisan',
      'Hermit', 'Noble', 'Outlander', 'Sage', 'Sailor', 'Soldier', 'Urchin',
    ];
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    setBackground(backgrounds[randomIndex]);
  };

  const randomizeBasic = () => {
    randomName();
    randomRace();
    randomClass();
    randomAlignment();
    randomBackground();
  };

  // Roll 4d6 drop lowest
  const roll4d6DropLowest = () => {
    const rolls = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];
    rolls.sort((a, b) => a - b);
    rolls.shift(); // Remove lowest
    return rolls.reduce((sum, roll) => sum + roll, 0);
  };

  const rollAbilityScores = () => {
    setAbilityScores({
      strength: roll4d6DropLowest(),
      dexterity: roll4d6DropLowest(),
      constitution: roll4d6DropLowest(),
      intelligence: roll4d6DropLowest(),
      wisdom: roll4d6DropLowest(),
      charisma: roll4d6DropLowest(),
    });
  };

  const useStandardArray = () => {
    const standardArray = [15, 14, 13, 12, 10, 8];
    const shuffled = [...standardArray].sort(() => Math.random() - 0.5);
    setAbilityScores({
      strength: shuffled[0],
      dexterity: shuffled[1],
      constitution: shuffled[2],
      intelligence: shuffled[3],
      wisdom: shuffled[4],
      charisma: shuffled[5],
    });
  };

  const randomizeAll = () => {
    randomizeBasic();
    rollAbilityScores();
  };

  const handleSave = () => {
    // In a real app, this would save to localStorage or database
    const character = {
      id: crypto.randomUUID(),
      name,
      race,
      classes: [{ name: characterClass, level: 1, hitDie: 'd10' }],
      level: 1,
      background,
      alignment,
      abilityScores,
      skills,
      experiencePoints: 0,
      maxHitPoints: 10 + calculateModifier(abilityScores.constitution),
      currentHitPoints: 10 + calculateModifier(abilityScores.constitution),
      temporaryHitPoints: 0,
      armorClass: 10 + calculateModifier(abilityScores.dexterity),
      initiative: calculateModifier(abilityScores.dexterity),
      speed: 30,
      proficiencyBonus: 2,
      savingThrows: ['strength', 'constitution'],
      features: [],
      traits: [],
      equipment: selectedEquipment,
      currency: { copper: 0, silver: 0, electrum: 0, gold: startingGold, platinum: 0 },
      hitDice: [{ total: 1, current: 1, die: 'd10' }],
      playerId: 'local-player',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: `Appearance: ${appearance}\n\nPersonality: ${personalityTraits}\n\nIdeals: ${ideals}\n\nBonds: ${bonds}\n\nFlaws: ${flaws}`,
    };

    // Save to localStorage for now
    const existingCharacters = JSON.parse(
      localStorage.getItem('dnd-characters') || '[]'
    );
    localStorage.setItem(
      'dnd-characters',
      JSON.stringify([...existingCharacters, character])
    );

    router.push('/characters');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#fafafa] mb-4">
                  Basic Information
                </h2>
                <p className="text-[#a1a1aa] mb-6">
                  Let&apos;s start with the basics of your character
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={randomizeBasic}
              >
                🎲 Randomize All
              </Button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#fafafa]">
                  Character Name
                </label>
                <button
                  type="button"
                  onClick={randomName}
                  className="text-xs text-[#8b5cf6] hover:text-[#7c3aed] transition-colors"
                >
                  🎲 Random
                </button>
              </div>
              <Input
                type="text"
                placeholder="Enter character name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-3">
                Race
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {DND_RACES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRace(r)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      race === r
                        ? 'bg-[#8b5cf6] text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-3">
                Class
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {DND_CLASSES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCharacterClass(c)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      characterClass === c
                        ? 'bg-[#8b5cf6] text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <Input
              type="text"
              label="Background"
              placeholder="e.g., Soldier, Noble, Folk Hero"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-3">
                Alignment
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {DND_ALIGNMENTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAlignment(a)}
                    className={`px-4 py-3 rounded-lg text-xs font-medium transition-all ${
                      alignment === a
                        ? 'bg-[#8b5cf6] text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'abilities':
        return (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#fafafa] mb-4">
                  Ability Scores
                </h2>
                <p className="text-[#a1a1aa] mb-6">
                  Set your character&apos;s core attributes (1-20)
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={rollAbilityScores}
                  title="Roll 4d6 drop lowest for each ability"
                >
                  🎲 Roll 4d6
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={useStandardArray}
                  title="Use standard array (15, 14, 13, 12, 10, 8)"
                >
                  📊 Standard Array
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(abilityScores) as Array<keyof AbilityScores>).map(
                (ability) => {
                  const score = abilityScores[ability];
                  const modifier = calculateModifier(score);

                  return (
                    <div
                      key={ability}
                      className="glass-subtle rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-[#fafafa] capitalize">
                          {ability}
                        </label>
                        <span className="text-2xl font-bold text-[#8b5cf6]">
                          {formatModifier(modifier)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => updateAbilityScore(ability, score - 1)}
                        >
                          −
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={score}
                          onChange={(e) =>
                            updateAbilityScore(
                              ability,
                              parseInt(e.target.value) || 10
                            )
                          }
                          className="text-center"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => updateAbilityScore(ability, score + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div className="glass-subtle rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#a1a1aa]">
                  Use quick buttons above or adjust manually with +/− buttons
                </p>
              </div>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#fafafa] mb-4">
                Skill Proficiencies
              </h2>
              <p className="text-[#a1a1aa] mb-6">
                Choose your character&apos;s trained skills
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skills.map((skill) => {
                const modifier = calculateModifier(abilityScores[skill.ability]);
                const profBonus = skill.proficient ? 2 : 0;
                const totalModifier = modifier + profBonus;

                return (
                  <button
                    key={skill.name}
                    type="button"
                    onClick={() => toggleSkillProficiency(skill.name)}
                    className={`glass-subtle rounded-lg p-4 text-left transition-all hover:scale-[1.02] ${
                      skill.proficient
                        ? 'ring-2 ring-[#8b5cf6]'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[#fafafa]">
                        {skill.name}
                      </span>
                      <span className="text-xl font-bold text-[#8b5cf6]">
                        {formatModifier(totalModifier)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                      <span className="capitalize">{skill.ability}</span>
                      {skill.proficient && (
                        <span className="px-2 py-0.5 bg-[#8b5cf6]/20 text-[#8b5cf6] rounded">
                          Proficient
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'equipment':
        const equipmentPacks = {
          'Dungeoneer\'s Pack': ['Backpack', 'Crowbar', '10 Torches', '10 Days Rations', 'Waterskin', '50ft Rope'],
          'Explorer\'s Pack': ['Backpack', 'Bedroll', 'Mess Kit', '10 Torches', '10 Days Rations', 'Waterskin', '50ft Rope'],
          'Priest\'s Pack': ['Backpack', 'Blanket', '10 Candles', 'Tinderbox', 'Alms Box', 'Incense', 'Vestments'],
          'Scholar\'s Pack': ['Backpack', 'Book of Lore', 'Ink', 'Ink Pen', 'Parchment (10 sheets)', 'Sand', 'Small Knife'],
          'Burglar\'s Pack': ['Backpack', 'Ball Bearings', '10ft String', 'Bell', '5 Candles', 'Crowbar', 'Hammer'],
        };

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#fafafa] mb-4">
                Starting Equipment
              </h2>
              <p className="text-[#a1a1aa] mb-6">
                Choose your starting equipment or take starting gold
              </p>
            </div>

            {/* Equipment Packs */}
            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-3">
                Equipment Pack
              </label>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(equipmentPacks).map(([packName, items]) => {
                  const isSelected = selectedEquipment.includes(packName);
                  return (
                    <button
                      key={packName}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedEquipment(selectedEquipment.filter(e => e !== packName));
                        } else {
                          setSelectedEquipment([...selectedEquipment, packName]);
                        }
                      }}
                      className={`glass-subtle rounded-lg p-4 text-left transition-all hover:scale-[1.01] ${
                        isSelected ? 'ring-2 ring-[#8b5cf6]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-[#fafafa]">{packName}</h4>
                        {isSelected && <span className="text-[#8b5cf6]">✓</span>}
                      </div>
                      <div className="text-xs text-[#a1a1aa] space-y-1">
                        {items.map((item, idx) => (
                          <div key={idx}>• {item}</div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Or Starting Gold */}
            <div className="glass-subtle rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#fafafa]">
                  Or take starting gold
                </label>
                <button
                  type="button"
                  onClick={() => {
                    // Roll based on class
                    const goldByClass: Record<string, number> = {
                      'Barbarian': 2 * 10, 'Bard': 5 * 10, 'Cleric': 5 * 10,
                      'Druid': 2 * 10, 'Fighter': 5 * 10, 'Monk': 5,
                      'Paladin': 5 * 10, 'Ranger': 5 * 10, 'Rogue': 4 * 10,
                      'Sorcerer': 3 * 10, 'Warlock': 4 * 10, 'Wizard': 4 * 10,
                      'Artificer': 5 * 10,
                    };
                    const baseGold = goldByClass[characterClass] || 50;
                    const rolled = Math.floor(Math.random() * baseGold) + Math.floor(baseGold / 2);
                    setStartingGold(rolled);
                    setSelectedEquipment([]);
                  }}
                  className="text-xs px-3 py-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded transition-colors"
                >
                  🎲 Roll for Gold
                </button>
              </div>
              {startingGold > 0 && (
                <div className="text-center py-4">
                  <span className="text-3xl font-bold text-[#fbbf24]">{startingGold}</span>
                  <span className="text-[#a1a1aa] ml-2">gold pieces</span>
                </div>
              )}
              <p className="text-xs text-[#71717a] mt-2">
                Rolling for gold allows you to buy exactly what you want, but you might end up with less than a pack.
              </p>
            </div>
          </div>
        );

      case 'personality':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#fafafa] mb-4">
                Personality & Appearance
              </h2>
              <p className="text-[#a1a1aa] mb-6">
                Bring your character to life with personality and appearance details
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Physical Appearance
              </label>
              <textarea
                value={appearance}
                onChange={(e) => setAppearance(e.target.value)}
                placeholder="Describe your character's appearance: height, build, hair, eyes, distinguishing features..."
                className="w-full px-4 py-3 bg-[#18181b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Personality Traits
              </label>
              <textarea
                value={personalityTraits}
                onChange={(e) => setPersonalityTraits(e.target.value)}
                placeholder="How does your character behave? What are their quirks and habits?"
                className="w-full px-4 py-3 bg-[#18181b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] resize-none"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Ideals
              </label>
              <textarea
                value={ideals}
                onChange={(e) => setIdeals(e.target.value)}
                placeholder="What beliefs drive your character? What principles do they hold dear?"
                className="w-full px-4 py-3 bg-[#18181b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] resize-none"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Bonds
              </label>
              <textarea
                value={bonds}
                onChange={(e) => setBonds(e.target.value)}
                placeholder="Who or what is your character connected to? What do they care about most?"
                className="w-full px-4 py-3 bg-[#18181b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] resize-none"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Flaws
              </label>
              <textarea
                value={flaws}
                onChange={(e) => setFlaws(e.target.value)}
                placeholder="What are your character's weaknesses? What vices or negative traits do they have?"
                className="w-full px-4 py-3 bg-[#18181b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] resize-none"
                rows={2}
              />
            </div>

            <div className="glass-subtle rounded-lg p-4 text-sm text-[#a1a1aa]">
              💡 <strong>Tip:</strong> These details help you roleplay your character and give the DM hooks for the story. They can always be updated later!
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#fafafa] mb-4">
                Review Character
              </h2>
              <p className="text-[#a1a1aa] mb-6">
                Review your character before creating
              </p>
            </div>

            <div className="glass-subtle rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#fafafa] mb-3">
                  {name || 'Unnamed Character'}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-[#a1a1aa]">Race:</span>{' '}
                    <span className="text-[#fafafa]">{race}</span>
                  </div>
                  <div>
                    <span className="text-[#a1a1aa]">Class:</span>{' '}
                    <span className="text-[#fafafa]">{characterClass} 1</span>
                  </div>
                  <div>
                    <span className="text-[#a1a1aa]">Background:</span>{' '}
                    <span className="text-[#fafafa]">
                      {background || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#a1a1aa]">Alignment:</span>{' '}
                    <span className="text-[#fafafa]">{alignment}</span>
                  </div>
                </div>
              </div>

              <hr className="border-[#27272a]" />

              <div>
                <h4 className="font-semibold text-[#fafafa] mb-2">
                  Ability Scores
                </h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {(
                    Object.keys(abilityScores) as Array<keyof AbilityScores>
                  ).map((ability) => (
                    <div
                      key={ability}
                      className="text-center p-2 bg-[#27272a] rounded"
                    >
                      <div className="text-xs text-[#a1a1aa] uppercase">
                        {ability.slice(0, 3)}
                      </div>
                      <div className="text-lg font-bold text-[#fafafa]">
                        {abilityScores[ability]}
                      </div>
                      <div className="text-xs text-[#8b5cf6]">
                        {formatModifier(calculateModifier(abilityScores[ability]))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-[#27272a]" />

              <div>
                <h4 className="font-semibold text-[#fafafa] mb-2">
                  Skill Proficiencies ({skills.filter((s) => s.proficient).length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills
                    .filter((s) => s.proficient)
                    .map((skill) => (
                      <span
                        key={skill.name}
                        className="px-2 py-1 bg-[#8b5cf6]/20 text-[#8b5cf6] rounded text-sm"
                      >
                        {skill.name}
                      </span>
                    ))}
                  {skills.filter((s) => s.proficient).length === 0 && (
                    <span className="text-[#a1a1aa] text-sm">
                      No proficiencies selected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const steps: WizardStep[] = ['basic', 'abilities', 'skills', 'equipment', 'personality', 'review'];
  const currentStepIndex = steps.indexOf(currentStep);
  const canGoNext = currentStep === 'basic' ? name.trim() !== '' : true;

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#fafafa] mb-2">
              Create Character
            </h1>
            <p className="text-[#a1a1aa]">
              Build your D&D 5e character step by step
            </p>
          </div>
          <Button
            variant="primary"
            onClick={randomizeAll}
            className="flex items-center gap-2"
          >
            🎲 Random Character
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`flex-1 ${index < steps.length - 1 ? 'mr-2' : ''}`}
              >
                <div
                  className={`h-2 rounded-full transition-all ${
                    index <= currentStepIndex
                      ? 'bg-[#8b5cf6]'
                      : 'bg-[#27272a]'
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
            <span>Basic</span>
            <span>Abilities</span>
            <span>Skills</span>
            <span>Equipment</span>
            <span>Personality</span>
            <span>Review</span>
          </div>
        </div>

        {/* Content */}
        <div className="glass rounded-2xl p-6 md:p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => {
              if (currentStepIndex > 0) {
                setCurrentStep(steps[currentStepIndex - 1]);
              } else {
                router.push('/characters');
              }
            }}
          >
            {currentStepIndex === 0 ? 'Cancel' : 'Back'}
          </Button>

          {currentStep === 'review' ? (
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!name.trim()}
            >
              Create Character
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => setCurrentStep(steps[currentStepIndex + 1])}
              disabled={!canGoNext}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
