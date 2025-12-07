import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0a0a0f] via-[#0a0a0f] to-[#131318]">
      {/* Hero section */}
      <main className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        {/* Glass card */}
        <div className="glass-strong rounded-2xl p-12 space-y-6">
          {/* Title with gradient */}
          <h1 className="text-6xl font-bold bg-gradient-to-r from-[#8b5cf6] via-[#fbbf24] to-[#8b5cf6] bg-clip-text text-transparent">
            D&D Campaign Manager
          </h1>

          <p className="text-xl text-[#d4d4d8] max-w-2xl mx-auto">
            A modern, fluid, and beautiful tool for Dungeon Masters and players.
            Manage campaigns, track characters, roll dice, and bring your adventures to life.
          </p>

          {/* Feature cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pt-8">
            <Link href="/campaigns" className="glass rounded-xl p-6 space-y-3 hover:scale-105 transition-transform cursor-pointer">
              <div className="text-4xl">🗺️</div>
              <h3 className="font-semibold text-lg text-white">Campaign Manager</h3>
              <p className="text-sm text-[#a1a1aa]">
                Create and manage D&D campaigns with players and sessions
              </p>
            </Link>

            <Link href="/characters" className="glass rounded-xl p-6 space-y-3 hover:scale-105 transition-transform cursor-pointer">
              <div className="text-4xl">📜</div>
              <h3 className="font-semibold text-lg text-white">Character Builder</h3>
              <p className="text-sm text-[#a1a1aa]">
                Create and manage D&D 5e characters with full character sheets
              </p>
            </Link>

            <Link href="/combat" className="glass rounded-xl p-6 space-y-3 hover:scale-105 transition-transform cursor-pointer">
              <div className="text-4xl">⚔️</div>
              <h3 className="font-semibold text-lg text-white">Combat Tracker</h3>
              <p className="text-sm text-[#a1a1aa]">
                Track initiative, HP, and conditions during combat encounters
              </p>
            </Link>

            <Link href="/dice" className="glass rounded-xl p-6 space-y-3 hover:scale-105 transition-transform cursor-pointer">
              <div className="text-4xl">🎲</div>
              <h3 className="font-semibold text-lg text-white">Dice Roller</h3>
              <p className="text-sm text-[#a1a1aa]">
                Roll dice with advantage, disadvantage, and modifiers
              </p>
            </Link>

            <Link href="/monsters" className="glass rounded-xl p-6 space-y-3 hover:scale-105 transition-transform cursor-pointer">
              <div className="text-4xl">🐉</div>
              <h3 className="font-semibold text-lg text-white">Monster Compendium</h3>
              <p className="text-sm text-[#a1a1aa]">
                Browse 2,431 D&D 5e creatures with advanced filtering
              </p>
            </Link>

            <Link href="/encounters" className="glass rounded-xl p-6 space-y-3 hover:scale-105 transition-transform cursor-pointer">
              <div className="text-4xl">💰</div>
              <h3 className="font-semibold text-lg text-white">Encounter Builder</h3>
              <p className="text-sm text-[#a1a1aa]">
                Build balanced encounters with CR calculator and XP budgets
              </p>
            </Link>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-4 justify-center pt-4 flex-wrap">
            <Link href="/signup" className="px-8 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg font-semibold transition-all hover:scale-105 inline-block">
              Get Started
            </Link>
            <Link href="/login" className="px-8 py-3 glass hover:glass-strong rounded-lg font-semibold transition-all hover:scale-105 inline-block">
              Sign In
            </Link>
          </div>
        </div>

        {/* Status badge */}
        <div className="glass-subtle rounded-full px-6 py-2 inline-block">
          <span className="text-sm">
            <span className="inline-block w-2 h-2 bg-[#10b981] rounded-full mr-2 animate-pulse"></span>
            Built for D&D 5e • Dark Mode First • Mobile Ready
          </span>
        </div>
      </main>
    </div>
  );
}
