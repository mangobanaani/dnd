"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { InventoryItem } from '@/app/types/character';

interface InventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, 'id'>) => void;
  editingItem?: InventoryItem | null;
}

const ITEM_TYPES = [
  'weapon', 'armor', 'shield', 'potion', 'scroll', 'wand', 'ring',
  'amulet', 'tool', 'gear', 'consumable', 'treasure', 'other'
] as const;

const RARITY_LEVELS = [
  'common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'
] as const;

export function InventoryItemModal({ isOpen, onClose, onSave, editingItem }: InventoryItemModalProps) {
  const [formData, setFormData] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    type: 'gear',
    quantity: 1,
    weight: 0,
    value: 0,
    equipped: false,
    attuned: false,
    magical: false,
    rarity: 'common',
    description: '',
    properties: [],
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        type: editingItem.type,
        quantity: editingItem.quantity,
        weight: editingItem.weight,
        value: editingItem.value,
        equipped: editingItem.equipped,
        attuned: editingItem.attuned,
        magical: editingItem.magical,
        rarity: editingItem.rarity,
        description: editingItem.description,
        properties: editingItem.properties,
      });
    } else {
      setFormData({
        name: '',
        type: 'gear',
        quantity: 1,
        weight: 0,
        value: 0,
        equipped: false,
        attuned: false,
        magical: false,
        rarity: 'common',
        description: '',
        properties: [],
      });
    }
  }, [editingItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter an item name');
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="glass-strong rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#fafafa]">
              {editingItem ? 'Edit Item' : 'Add Item'}
            </h2>
            <button
              onClick={onClose}
              className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors text-2xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-1">
                Item Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Longsword"
                required
              />
            </div>

            {/* Type & Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#27272a] text-[#fafafa] rounded border border-white/10 focus:border-[#8b5cf6] focus:outline-none transition-colors"
                >
                  {ITEM_TYPES.map(type => (
                    <option key={type} value={type} className="capitalize">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#a1a1aa] mb-1">
                  Quantity
                </label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                  min="1"
                />
              </div>
            </div>

            {/* Weight & Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-1">
                  Weight (lbs)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Math.max(0, parseFloat(e.target.value) || 0) })}
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm text-[#a1a1aa] mb-1">
                  Value (gp)
                </label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Math.max(0, parseInt(e.target.value) || 0) })}
                  min="0"
                />
              </div>
            </div>

            {/* Magical & Rarity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.magical}
                    onChange={(e) => setFormData({ ...formData, magical: e.target.checked })}
                    className="w-4 h-4 rounded border-white/10 bg-[#27272a] text-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]"
                  />
                  <span className="text-sm text-[#a1a1aa]">Magical Item</span>
                </label>
              </div>

              {formData.magical && (
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-1">
                    Rarity
                  </label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData({ ...formData, rarity: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#27272a] text-[#fafafa] rounded border border-white/10 focus:border-[#8b5cf6] focus:outline-none transition-colors capitalize"
                  >
                    {RARITY_LEVELS.map(rarity => (
                      <option key={rarity} value={rarity} className="capitalize">
                        {rarity}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Equipped & Attuned */}
            <div className="flex gap-4">
              {(formData.type === 'weapon' || formData.type === 'armor') && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.equipped}
                    onChange={(e) => setFormData({ ...formData, equipped: e.target.checked })}
                    className="w-4 h-4 rounded border-white/10 bg-[#27272a] text-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]"
                  />
                  <span className="text-sm text-[#a1a1aa]">Equipped</span>
                </label>
              )}

              {formData.magical && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.attuned}
                    onChange={(e) => setFormData({ ...formData, attuned: e.target.checked })}
                    className="w-4 h-4 rounded border-white/10 bg-[#27272a] text-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]"
                  />
                  <span className="text-sm text-[#a1a1aa]">Attuned</span>
                </label>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#27272a] text-[#fafafa] rounded border border-white/10 focus:border-[#8b5cf6] focus:outline-none transition-colors resize-none"
                rows={3}
                placeholder="A finely crafted sword..."
              />
            </div>

            {/* Properties */}
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-1">
                Properties (comma-separated)
              </label>
              <Input
                type="text"
                value={formData.properties?.join(', ') || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  properties: e.target.value.split(',').map(p => p.trim()).filter(p => p)
                })}
                placeholder="Versatile, Finesse, Light"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                {editingItem ? 'Update Item' : 'Add Item'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
