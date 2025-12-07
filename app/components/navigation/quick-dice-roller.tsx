"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  DiceType,
  DiceRoll,
  DICE_COLORS,
  DICE_ICONS,
  performRoll,
  formatDiceFormula,
  isCriticalHit,
  isCriticalFail,
  getRollResultColor,
} from '@/app/types/dice';

const QUICK_DICE: DiceType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

export function QuickDiceRoller() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null);
  const [modifier, setModifier] = useState(0);

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const roll = (diceType: DiceType) => {
    const result = performRoll(diceType, 1, modifier, false, false);
    setLastRoll(result);
  };

  const rollD20WithMod = (adv: boolean, dis: boolean) => {
    const result = performRoll('d20', 1, modifier, adv, dis);
    setLastRoll(result);
  };

  // Prevent hydration mismatch by not rendering until client-side
  if (!mounted) {
    return (
      <div className="p-2 text-[#fafafa] rounded-lg">
        <span className="text-xl">🎲</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-[#fafafa] hover:bg-[#27272a] rounded-lg transition-colors relative"
        title="Quick Dice Roller"
      >
        <span className="text-xl">🎲</span>
        {lastRoll && (
          <span className="absolute -top-1 -right-1 bg-[#8b5cf6] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {lastRoll.total}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 z-50 glass-strong rounded-xl p-4 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#fafafa]">Quick Roll</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Last Roll Display */}
            {lastRoll && (
              <div className="glass-subtle rounded-lg p-3 mb-4 text-center">
                <div className={`text-4xl font-bold ${getRollResultColor(lastRoll)}`}>
                  {lastRoll.total}
                </div>
                {isCriticalHit(lastRoll) && (
                  <div className="text-xs text-green-400 font-bold mt-1">
                    ✨ CRIT! ✨
                  </div>
                )}
                {isCriticalFail(lastRoll) && (
                  <div className="text-xs text-red-400 font-bold mt-1">
                    💀 FAIL! 💀
                  </div>
                )}
                <div className="text-xs text-[#a1a1aa] mt-1">
                  {formatDiceFormula(lastRoll.quantity, lastRoll.diceType, lastRoll.modifier)}
                  {lastRoll.advantage && ' (Adv)'}
                  {lastRoll.disadvantage && ' (Dis)'}
                </div>
                <div className="text-xs text-[#52525b] mt-1">
                  [{lastRoll.rolls.join(', ')}]
                </div>
              </div>
            )}

            {/* Modifier Input */}
            <div className="mb-4">
              <label className="text-xs text-[#a1a1aa] mb-1 block">
                Modifier
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setModifier(Math.max(-10, modifier - 1))}
                  className="px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] rounded text-[#fafafa] transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  value={modifier}
                  onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 bg-[#27272a] text-[#fafafa] rounded text-center border border-white/10 focus:border-[#8b5cf6] focus:outline-none transition-colors"
                />
                <button
                  onClick={() => setModifier(Math.min(10, modifier + 1))}
                  className="px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] rounded text-[#fafafa] transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* D20 with Advantage/Disadvantage */}
            <div className="mb-4">
              <label className="text-xs text-[#a1a1aa] mb-2 block">
                D20 Rolls
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => rollD20WithMod(false, true)}
                  className="px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded text-sm font-medium transition-colors"
                >
                  ⬇️ Disadv
                </button>
                <button
                  onClick={() => roll('d20')}
                  className="px-3 py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded text-sm font-medium transition-colors"
                >
                  🎲 d20
                </button>
                <button
                  onClick={() => rollD20WithMod(true, false)}
                  className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-sm font-medium transition-colors"
                >
                  ⬆️ Adv
                </button>
              </div>
            </div>

            {/* Quick Dice Buttons */}
            <div className="mb-4">
              <label className="text-xs text-[#a1a1aa] mb-2 block">
                Other Dice
              </label>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_DICE.filter(d => d !== 'd20').map((dice) => (
                  <button
                    key={dice}
                    onClick={() => roll(dice)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-all bg-gradient-to-br ${DICE_COLORS[dice]} hover:scale-105`}
                  >
                    <div className="text-lg">{DICE_ICONS[dice]}</div>
                    <div className="text-xs text-white font-bold">
                      {dice.toUpperCase()}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Link to Full Dice Roller */}
            <a
              href="/dice"
              className="block text-center text-xs text-[#8b5cf6] hover:text-[#fbbf24] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Open Full Dice Roller →
            </a>
          </div>
        </>
      )}
    </div>
  );
}
