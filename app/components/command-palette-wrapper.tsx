'use client';

import { CommandPalette, useCommandPalette } from './ui/command-palette';

export function CommandPaletteWrapper() {
  const { isOpen, close } = useCommandPalette();

  return <CommandPalette isOpen={isOpen} onClose={close} />;
}
