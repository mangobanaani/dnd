import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#0a0a0f] to-[#131318] p-4">
      <div className="max-w-md w-full">
        <div className="glass-strong rounded-2xl p-8 text-center space-y-6">
          <div className="text-6xl">🗺️</div>
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-white">404</h2>
            <p className="text-xl text-[#d4d4d8]">
              Page not found
            </p>
          </div>
          <p className="text-[#a1a1aa]">
            The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back on the adventure.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg font-semibold transition-all hover:scale-105"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
