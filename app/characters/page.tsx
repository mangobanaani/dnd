"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useToast } from '@/app/components/ui/toast';
import { useConfirm } from '@/app/components/ui/confirm-dialog';
import { CharacterCardSkeleton } from '@/app/components/ui/skeleton';
import { CharacterCard } from '@/app/components/characters/character-card';
import { StorageService } from '@/app/lib/services/storage.service';
import { Character } from '@/app/types/character';
import { ScrollText } from 'lucide-react';

export default function CharactersPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const characterStorage = new StorageService<Character>('dnd-characters');

  // Load characters on mount only
  useEffect(() => {
    try {
      const stored = characterStorage.getAll();
      setCharacters(stored);
    } catch (error) {
      console.error('Failed to load characters:', error);
      addToast('Failed to load characters', 'error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteCharacter = async (id: string) => {
    const character = characters.find((c) => c.id === id);
    const confirmed = await confirm({
      title: 'Delete Character',
      message: 'Delete ' + (character?.name || 'this character') + '? This action cannot be undone.',
      confirmLabel: 'Delete',
      confirmVariant: 'danger',
    });

    if (confirmed) {
      try {
        characterStorage.remove(id);
        setCharacters(characters.filter((c) => c.id !== id));
        addToast((character?.name || 'Character') + ' deleted', 'success');
      } catch (error) {
        console.error('Failed to delete character:', error);
        addToast('Failed to delete character', 'error');
      }
    }
  };

  const filteredCharacters = characters.filter((char) =>
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.race.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.classes.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-10 w-64 bg-[#27272a] animate-pulse rounded mb-2" />
            <div className="h-6 w-96 bg-[#27272a] animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CharacterCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-display text-[#f5f5f5] mb-2 [text-shadow:0_0_20px_rgba(212,175,55,0.3),0_2px_8px_rgba(0,0,0,0.8)]">
                My Characters
              </h1>
              <p className="text-[#a1a1aa]">
                Manage your D&D 5e character sheets
              </p>
            </div>
            <Link href="/characters/create">
              <Button variant="primary">+ Create Character</Button>
            </Link>
          </div>

          {characters.length > 0 && (
            <div className="max-w-md">
              <Input
                type="text"
                placeholder="Search characters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          )}
        </div>

        {characters.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="flex justify-center mb-4">
              <ScrollText size={64} className="text-[#9d6fff]" />
            </div>
            <h3 className="text-xl font-display text-[#f5f5f5] mb-2">
              No characters yet
            </h3>
            <p className="text-[#a1a1aa] mb-6">
              Create your first D&D 5e character to begin your adventure
            </p>
            <Link href="/characters/create">
              <Button variant="primary">Create Your First Character</Button>
            </Link>
          </div>
        ) : filteredCharacters.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="flex justify-center mb-4">
              <ScrollText size={64} className="text-[#9d6fff]" />
            </div>
            <h3 className="text-xl font-display text-[#f5f5f5] mb-2">
              No characters found
            </h3>
            <p className="text-[#a1a1aa]">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onDelete={deleteCharacter}
                onClick={() => router.push('/characters/' + character.id)}
              />
            ))}
          </div>
        )}

        {characters.length > 0 && (
          <div className="mt-8 glass-card rounded-lg p-4">
            <p className="text-[#a1a1aa] text-sm text-center">
              Click on a character card to view and edit their full character sheet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
