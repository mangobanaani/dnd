"use client";

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  DiceType,
  DiceRoll,
  DICE_COLORS,
  DICE_ICONS,
  QUICK_ROLLS,
  getDiceSides,
  performRoll,
  parseDiceFormula,
  formatDiceFormula,
  formatRollDisplay,
  formatRollTime,
  isCriticalHit,
  isCriticalFail,
  getRollResultColor,
  getRollResultBg,
  getCategoryBadgeColor,
  calculateAverageRoll,
} from '@/app/types/dice';

const ALL_DICE: DiceType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

export default function DiceRollerPage() {
  // Roll configuration
  const [selectedDice, setSelectedDice] = useState<DiceType>('d20');
  const [quantity, setQuantity] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  const [label, setLabel] = useState('');
  const [customFormula, setCustomFormula] = useState('');

  // Roll history
  const [history, setHistory] = useState<DiceRoll[]>([]);

  // Current result
  const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null);

  const roll = (category?: DiceRoll['category']) => {
    const result = performRoll(
      selectedDice,
      quantity,
      modifier,
      advantage,
      disadvantage,
      label || undefined,
      category
    );

    setLastRoll(result);
    setHistory([result, ...history]); // Newest first
  };

  const rollCustomFormula = () => {
    const formula = parseDiceFormula(customFormula);
    if (!formula) {
      alert('Invalid formula! Use format: 2d6+3');
      return;
    }

    const result = performRoll(
      formula.diceType,
      formula.quantity,
      formula.modifier,
      false,
      false,
      customFormula,
      'custom'
    );

    setLastRoll(result);
    setHistory([result, ...history]);
  };

  const rollQuick = (preset: keyof typeof QUICK_ROLLS) => {
    const config = QUICK_ROLLS[preset];
    const result = performRoll(
      config.diceType,
      config.quantity,
      config.modifier,
      false,
      false,
      preset,
      config.category
    );

    setLastRoll(result);
    setHistory([result, ...history]);
  };

  const clearHistory = () => {
    if (confirm('Clear all roll history?')) {
      setHistory([]);
      setLastRoll(null);
    }
  };

  const currentFormula = formatDiceFormula(quantity, selectedDice, modifier);
  const avgRoll = calculateAverageRoll(quantity, selectedDice, modifier);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-[#fafafa] mb-2">
            Dice Roller
          </h1>
          <p className="text-[#a1a1aa]">
            Roll D&D dice with advantage, disadvantage, and modifiers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dice Selector & Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Dice Buttons */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#fafafa] mb-4">
                Select Dice
              </h2>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                {ALL_DICE.map((dice) => {
                  const sides = getDiceSides(dice);
                  const isSelected = selectedDice === dice;

                  return (
                    <button
                      key={dice}
                      onClick={() => setSelectedDice(dice)}
                      className={`aspect-square rounded-xl transition-all ${
                        isSelected ? 'scale-110 ring-2 ring-white' : ''
                      } bg-gradient-to-br ${DICE_COLORS[dice]} hover:scale-105 flex flex-col items-center justify-center p-4`}
                    >
                      <div className="text-4xl mb-1">{DICE_ICONS[dice]}</div>
                      <div className="text-sm font-bold text-white">{dice.toUpperCase()}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Roll Configuration */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#fafafa] mb-4">
                Configure Roll
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Input
                    type="number"
                    label="Quantity"
                    min={1}
                    max={20}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    label="Modifier"
                    value={modifier}
                    onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    label="Label (optional)"
                    placeholder="Attack roll"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </div>
              </div>

              {/* Advantage/Disadvantage */}
              {selectedDice === 'd20' && quantity === 1 && (
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => {
                      setAdvantage(!advantage);
                      if (!advantage) setDisadvantage(false);
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      advantage
                        ? 'bg-blue-500 text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    ⬆️ Advantage
                  </button>
                  <button
                    onClick={() => {
                      setDisadvantage(!disadvantage);
                      if (!disadvantage) setAdvantage(false);
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      disadvantage
                        ? 'bg-orange-500 text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    ⬇️ Disadvantage
                  </button>
                </div>
              )}

              {/* Formula Display */}
              <div className="glass-subtle rounded-lg p-4 mb-4">
                <div className="text-sm text-[#a1a1aa] mb-1">Rolling</div>
                <div className="text-3xl font-bold text-[#8b5cf6]">
                  {currentFormula}
                </div>
                <div className="text-sm text-[#a1a1aa] mt-1">
                  Average: {avgRoll.toFixed(1)}
                </div>
              </div>

              {/* Roll Button */}
              <Button
                variant="primary"
                className="w-full text-xl py-6"
                onClick={() => roll()}
              >
                🎲 ROLL {currentFormula.toUpperCase()}
              </Button>
            </div>

            {/* Custom Formula */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#fafafa] mb-4">
                Custom Formula
              </h2>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g., 2d6+3 or 8d6"
                  value={customFormula}
                  onChange={(e) => setCustomFormula(e.target.value)}
                />
                <Button variant="secondary" onClick={rollCustomFormula}>
                  Roll
                </Button>
              </div>
              <p className="text-xs text-[#a1a1aa] mt-2">
                Supports d4, d6, d8, d10, d12, d20, d100
              </p>
            </div>

            {/* Quick Rolls */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#fafafa] mb-4">
                Quick Rolls
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.keys(QUICK_ROLLS).map((preset) => {
                  const config = QUICK_ROLLS[preset as keyof typeof QUICK_ROLLS];
                  const formula = formatDiceFormula(
                    config.quantity,
                    config.diceType,
                    config.modifier
                  );

                  return (
                    <button
                      key={preset}
                      onClick={() => rollQuick(preset as keyof typeof QUICK_ROLLS)}
                      className="glass-subtle rounded-lg p-3 text-left hover:scale-[1.02] transition-all"
                    >
                      <div className="text-sm font-medium text-[#fafafa]">
                        {preset}
                      </div>
                      <div className="text-xs text-[#a1a1aa]">{formula}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Last Roll Result */}
            {lastRoll && (
              <div
                className={`glass rounded-xl p-6 border-2 ${getRollResultBg(lastRoll)}`}
              >
                <h2 className="text-xl font-bold text-[#fafafa] mb-4">
                  Last Roll
                </h2>
                <div className="text-center mb-4">
                  <div className={`text-6xl font-bold mb-2 ${getRollResultColor(lastRoll)}`}>
                    {lastRoll.total}
                  </div>
                  {isCriticalHit(lastRoll) && (
                    <div className="text-2xl text-green-400 font-bold mb-2">
                      ✨ CRITICAL HIT! ✨
                    </div>
                  )}
                  {isCriticalFail(lastRoll) && (
                    <div className="text-2xl text-red-400 font-bold mb-2">
                      💀 CRITICAL FAIL! 💀
                    </div>
                  )}
                  {lastRoll.label && (
                    <div className="text-lg text-[#fafafa] mb-2">
                      {lastRoll.label}
                    </div>
                  )}
                  <div className="text-sm text-[#a1a1aa]">
                    {formatRollDisplay(lastRoll)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Roll History */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#fafafa]">
                History
              </h2>
              {history.length > 0 && (
                <Button variant="danger" size="sm" onClick={clearHistory}>
                  Clear
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-[800px] overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-center py-12 text-[#a1a1aa]">
                  <div className="text-4xl mb-2">🎲</div>
                  <p className="text-sm">No rolls yet</p>
                </div>
              ) : (
                history.map((roll) => (
                  <div
                    key={roll.id}
                    className={`glass-subtle rounded-lg p-3 border ${
                      isCriticalHit(roll) ? 'border-green-500/50' :
                      isCriticalFail(roll) ? 'border-red-500/50' :
                      'border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        {roll.label && (
                          <div className="text-sm font-medium text-[#fafafa] mb-1">
                            {roll.label}
                          </div>
                        )}
                        <div className="text-xs text-[#a1a1aa]">
                          {formatDiceFormula(roll.quantity, roll.diceType, roll.modifier)}
                          {roll.advantage && ' (Adv)'}
                          {roll.disadvantage && ' (Dis)'}
                        </div>
                      </div>
                      <div
                        className={`text-2xl font-bold ${getRollResultColor(roll)}`}
                      >
                        {roll.total}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-[#a1a1aa]">
                        [{roll.rolls.join(', ')}]
                      </div>
                      {roll.category && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${getCategoryBadgeColor(
                            roll.category
                          )}`}
                        >
                          {roll.category}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#52525b] mt-1">
                      {formatRollTime(roll.timestamp)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
