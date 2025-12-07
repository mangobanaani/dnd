/**
 * Parse monsters-full.csv into JSON format with all 26 fields
 * Run with: npx ts-node scripts/parse-monsters-full.ts
 */

const fs = require('fs');
const path = require('path');

interface Monster {
  name: string;
  size: string;
  type: string;
  tag: string;
  alignment: string;
  movement: string; // Fly/Hover/Swim
  cr: string;
  sourceBook: string;
  sourcePage: string;
  spellUser: boolean;
  legendaryActions: boolean;
  lairActions: boolean;
  abilities: string;
  actions: string;
  reaction: string;
  environments: {
    arctic: boolean;
    coastal: boolean;
    desert: boolean;
    forest: boolean;
    grassland: boolean;
    hill: boolean;
    mountain: boolean;
    swamp: boolean;
    underdark: boolean;
    underwater: boolean;
    urban: boolean;
    other: boolean;
  };
  credits: string;
}

function parseCSV(filePath: string): Monster[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Parse header to get column indices
  const header = lines[0].split(',');
  const monsters: Monster[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line (handling potential commas in quoted fields)
    const parts = parseCSVLine(line);
    if (parts.length < 26) continue;

    const [
      name, size, type, tag, alignment, movement, cr,
      sourceBook, sourcePage, spellUser, legendaryActions, lairActions,
      abilities, actions, reaction,
      arctic, coastal, desert, forest, grassland, hill, mountain, swamp, underdark, underwater, urban, other,
      empty, // extra empty column
      credits
    ] = parts;

    monsters.push({
      name: name.trim(),
      size: size.trim(),
      type: type.trim(),
      tag: tag.trim(),
      alignment: alignment.trim(),
      movement: movement.trim(),
      cr: cr.trim(),
      sourceBook: sourceBook.trim(),
      sourcePage: sourcePage.trim(),
      spellUser: spellUser.trim().toLowerCase() === 'y',
      legendaryActions: legendaryActions.trim().toLowerCase() === 'y',
      lairActions: lairActions.trim().toLowerCase() === 'y',
      abilities: abilities.trim(),
      actions: actions.trim(),
      reaction: reaction.trim(),
      environments: {
        arctic: arctic.trim().toLowerCase() === 'x',
        coastal: coastal.trim().toLowerCase() === 'x',
        desert: desert.trim().toLowerCase() === 'x',
        forest: forest.trim().toLowerCase() === 'x',
        grassland: grassland.trim().toLowerCase() === 'x',
        hill: hill.trim().toLowerCase() === 'x',
        mountain: mountain.trim().toLowerCase() === 'x',
        swamp: swamp.trim().toLowerCase() === 'x',
        underdark: underdark.trim().toLowerCase() === 'x',
        underwater: underwater.trim().toLowerCase() === 'x',
        urban: urban.trim().toLowerCase() === 'x',
        other: other.trim().toLowerCase() === 'x',
      },
      credits: credits?.trim() || '',
    });
  }

  return monsters;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current); // Add last field
  return result;
}

function groupMonstersByCR(monsters: Monster[]): Record<string, Monster[]> {
  const grouped: Record<string, Monster[]> = {};

  monsters.forEach((monster: Monster) => {
    const cr = monster.cr || '0';
    if (!grouped[cr]) {
      grouped[cr] = [];
    }
    grouped[cr].push(monster);
  });

  return grouped;
}

function groupMonstersByType(monsters: Monster[]): Record<string, Monster[]> {
  const grouped: Record<string, Monster[]> = {};

  monsters.forEach((monster: Monster) => {
    const baseType = monster.type.split('(')[0].trim();
    if (!grouped[baseType]) {
      grouped[baseType] = [];
    }
    grouped[baseType].push(monster);
  });

  return grouped;
}

function groupMonstersByEnvironment(monsters: Monster[]): Record<string, Monster[]> {
  const grouped: Record<string, Monster[]> = {
    arctic: [],
    coastal: [],
    desert: [],
    forest: [],
    grassland: [],
    hill: [],
    mountain: [],
    swamp: [],
    underdark: [],
    underwater: [],
    urban: [],
    other: [],
  };

  monsters.forEach((monster: Monster) => {
    Object.keys(monster.environments).forEach((env: string) => {
      if (monster.environments[env as keyof typeof monster.environments]) {
        grouped[env].push(monster);
      }
    });
  });

  return grouped;
}

function getMonsterStats(monsters: Monster[]) {
  const stats = {
    total: monsters.length,
    legendary: monsters.filter((m: Monster) => m.legendaryActions).length,
    withLairActions: monsters.filter((m: Monster) => m.lairActions).length,
    spellcasters: monsters.filter((m: Monster) => m.spellUser).length,
    bySize: {} as Record<string, number>,
    byCR: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    byEnvironment: {} as Record<string, number>,
  };

  monsters.forEach((monster: Monster) => {
    // Count by size
    stats.bySize[monster.size] = (stats.bySize[monster.size] || 0) + 1;

    // Count by CR
    const cr = monster.cr || '0';
    stats.byCR[cr] = (stats.byCR[cr] || 0) + 1;

    // Count by type
    const baseType = monster.type.split('(')[0].trim();
    stats.byType[baseType] = (stats.byType[baseType] || 0) + 1;

    // Count by environment
    Object.keys(monster.environments).forEach((env: string) => {
      if (monster.environments[env as keyof typeof monster.environments]) {
        stats.byEnvironment[env] = (stats.byEnvironment[env] || 0) + 1;
      }
    });
  });

  return stats;
}

// Main execution
const csvPath = path.join(__dirname, '../data/monsters-full.csv');
const outputPath = path.join(__dirname, '../public/data/monsters.json');

console.log('🐉 Parsing complete monster database...');
const monsters = parseCSV(csvPath);

console.log(`✅ Parsed ${monsters.length} monsters`);

// Get statistics
const stats = getMonsterStats(monsters);
console.log('\n📊 Monster Statistics:');
console.log(`  Total: ${stats.total}`);
console.log(`  Legendary: ${stats.legendary}`);
console.log(`  With Lair Actions: ${stats.withLairActions}`);
console.log(`  Spellcasters: ${stats.spellcasters}`);
console.log(`  Unique Types: ${Object.keys(stats.byType).length}`);
console.log(`  CR Range: ${Object.keys(stats.byCR).sort((a: string, b: string) => {
  const aNum = a === '1/8' ? 0.125 : a === '1/4' ? 0.25 : a === '1/2' ? 0.5 : parseFloat(a);
  const bNum = b === '1/8' ? 0.125 : b === '1/4' ? 0.25 : b === '1/2' ? 0.5 : parseFloat(b);
  return aNum - bNum;
}).join(', ')}`);

// Save to JSON
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(monsters, null, 2));
console.log(`\n💾 Saved to ${outputPath}`);

// Create grouped versions
const groupedByCR = groupMonstersByCR(monsters);
const groupedByCRPath = path.join(__dirname, '../public/data/monsters-by-cr.json');
fs.writeFileSync(groupedByCRPath, JSON.stringify(groupedByCR, null, 2));
console.log(`💾 Saved CR groups to ${groupedByCRPath}`);

const groupedByType = groupMonstersByType(monsters);
const groupedByTypePath = path.join(__dirname, '../public/data/monsters-by-type.json');
fs.writeFileSync(groupedByTypePath, JSON.stringify(groupedByType, null, 2));
console.log(`💾 Saved type groups to ${groupedByTypePath}`);

const groupedByEnv = groupMonstersByEnvironment(monsters);
const groupedByEnvPath = path.join(__dirname, '../public/data/monsters-by-environment.json');
fs.writeFileSync(groupedByEnvPath, JSON.stringify(groupedByEnv, null, 2));
console.log(`💾 Saved environment groups to ${groupedByEnvPath}`);

// Save stats
const statsPath = path.join(__dirname, '../public/data/monster-stats.json');
fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
console.log(`💾 Saved statistics to ${statsPath}`);

console.log('\n✨ Done!');
