/**
 * Parse monsters.txt into JSON format
 * Run with: npx ts-node scripts/parse-monsters.ts
 */

const fs = require('fs');
const path = require('path');

interface Monster {
  name: string;
  cr: string;
  type: string;
  size: string;
  ac: number;
  hp: number;
  speed: string[];
  alignment: string;
  legendary: boolean;
  source: string;
}

function parseMonstersFile(filePath: string): Monster[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Skip header line
  const monsters: Monster[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split by tabs
    const parts = line.split('\t').filter((p: string) => p.trim());
    if (parts.length < 10) continue;

    const [name, cr, type, size, ac, hp, speed, alignment, legendary, source] = parts;

    // Parse speed into array
    const speedArray = speed.trim()
      ? speed.split(',').map((s: string) => s.trim()).filter((s: string) => s)
      : [];

    monsters.push({
      name: name.trim(),
      cr: cr.trim(),
      type: type.trim(),
      size: size.trim(),
      ac: parseInt(ac.trim()) || 0,
      hp: parseInt(hp.trim()) || 0,
      speed: speedArray,
      alignment: alignment.trim(),
      legendary: legendary.trim().toLowerCase() === 'legendary',
      source: source.trim(),
    });
  }

  return monsters;
}

function groupMonstersByType(monsters: Monster[]): Record<string, Monster[]> {
  const grouped: Record<string, Monster[]> = {};

  monsters.forEach(monster => {
    const baseType = monster.type.split('(')[0].trim();
    if (!grouped[baseType]) {
      grouped[baseType] = [];
    }
    grouped[baseType].push(monster);
  });

  return grouped;
}

function getMonsterStats(monsters: Monster[]) {
  const stats = {
    total: monsters.length,
    legendary: monsters.filter(m => m.legendary).length,
    bySize: {} as Record<string, number>,
    byCR: {} as Record<string, number>,
    byType: {} as Record<string, number>,
  };

  monsters.forEach(monster => {
    // Count by size
    stats.bySize[monster.size] = (stats.bySize[monster.size] || 0) + 1;

    // Count by CR
    stats.byCR[monster.cr] = (stats.byCR[monster.cr] || 0) + 1;

    // Count by type
    const baseType = monster.type.split('(')[0].trim();
    stats.byType[baseType] = (stats.byType[baseType] || 0) + 1;
  });

  return stats;
}

// Main execution
const monstersPath = '/Users/pekka/Documents/dandd/monsters.txt';
const outputPath = path.join(__dirname, '../public/data/monsters.json');

console.log('🐉 Parsing monsters.txt...');
const monsters = parseMonstersFile(monstersPath);

console.log(`✅ Parsed ${monsters.length} monsters`);

// Get statistics
const stats = getMonsterStats(monsters);
console.log('\n📊 Monster Statistics:');
console.log(`  Total: ${stats.total}`);
console.log(`  Legendary: ${stats.legendary}`);
console.log(`  Types: ${Object.keys(stats.byType).length}`);
console.log(`  CR Range: 0 to 30`);

// Save to JSON
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(monsters, null, 2));
console.log(`\n💾 Saved to ${outputPath}`);

// Also create grouped version
const grouped = groupMonstersByType(monsters);
const groupedPath = path.join(__dirname, '../public/data/monsters-by-type.json');
fs.writeFileSync(groupedPath, JSON.stringify(grouped, null, 2));
console.log(`💾 Saved grouped version to ${groupedPath}`);

console.log('\n✨ Done!');
