import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Import the types from the script
interface Monster {
  name: string;
  size: string;
  type: string;
  tag: string;
  alignment: string;
  movement: string;
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

// Helper function to parse CSV line (copied from script)
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

  result.push(current);
  return result;
}

// Helper function to parse CSV (copied from script)
function parseCSV(filePath: string): Monster[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const header = lines[0].split(',');
  const monsters: Monster[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    if (parts.length < 26) continue;

    const [
      name, size, type, tag, alignment, movement, cr,
      sourceBook, sourcePage, spellUser, legendaryActions, lairActions,
      abilities, actions, reaction,
      arctic, coastal, desert, forest, grassland, hill, mountain, swamp, underdark, underwater, urban, other,
      empty,
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
    stats.bySize[monster.size] = (stats.bySize[monster.size] || 0) + 1;

    const cr = monster.cr || '0';
    stats.byCR[cr] = (stats.byCR[cr] || 0) + 1;

    const baseType = monster.type.split('(')[0].trim();
    stats.byType[baseType] = (stats.byType[baseType] || 0) + 1;

    Object.keys(monster.environments).forEach((env: string) => {
      if (monster.environments[env as keyof typeof monster.environments]) {
        stats.byEnvironment[env] = (stats.byEnvironment[env] || 0) + 1;
      }
    });
  });

  return stats;
}

test.describe('CSV Parsing Tests', () => {
  const testCSVPath = path.join(__dirname, 'fixtures', 'test-monsters.csv');
  let monsters: Monster[];

  test.beforeAll(() => {
    monsters = parseCSV(testCSVPath);
  });

  test('should parse CSV file and return array of monsters', () => {
    expect(Array.isArray(monsters)).toBe(true);
    expect(monsters.length).toBeGreaterThan(0);
  });

  test('should correctly parse monster basic properties', () => {
    const goblin = monsters.find(m => m.name === 'Goblin');
    expect(goblin).toBeDefined();
    expect(goblin?.size).toBe('Small');
    expect(goblin?.type).toBe('humanoid');
    expect(goblin?.tag).toBe('goblinoid');
    expect(goblin?.alignment).toBe('neutral evil');
    expect(goblin?.cr).toBe('1/4');
    expect(goblin?.sourceBook).toBe('MM');
    expect(goblin?.sourcePage).toBe('166');
  });

  test('should correctly parse boolean flags for spell users', () => {
    const dragon = monsters.find(m => m.name === 'Ancient Red Dragon');
    const goblin = monsters.find(m => m.name === 'Goblin');

    expect(dragon?.spellUser).toBe(true);
    expect(goblin?.spellUser).toBe(false);
  });

  test('should correctly parse legendary actions flag', () => {
    const dragon = monsters.find(m => m.name === 'Ancient Red Dragon');
    const beholder = monsters.find(m => m.name === 'Beholder');
    const goblin = monsters.find(m => m.name === 'Goblin');

    expect(dragon?.legendaryActions).toBe(true);
    expect(beholder?.legendaryActions).toBe(true);
    expect(goblin?.legendaryActions).toBe(false);
  });

  test('should correctly parse lair actions flag', () => {
    const dragon = monsters.find(m => m.name === 'Ancient Red Dragon');
    const beholder = monsters.find(m => m.name === 'Beholder');
    const aboleth = monsters.find(m => m.name === 'Aboleth');

    expect(dragon?.lairActions).toBe(true);
    expect(beholder?.lairActions).toBe(true);
    expect(aboleth?.lairActions).toBe(false);
  });

  test('should correctly parse environment flags', () => {
    const goblin = monsters.find(m => m.name === 'Goblin');

    expect(goblin?.environments.grassland).toBe(true);
    expect(goblin?.environments.hill).toBe(true);
    expect(goblin?.environments.arctic).toBe(false);
    expect(goblin?.environments.coastal).toBe(false);
  });

  test('should parse monster with multiple environments', () => {
    const commoner = monsters.find(m => m.name === 'Commoner');

    // Commoner should be in all environments
    expect(commoner?.environments.arctic).toBe(true);
    expect(commoner?.environments.coastal).toBe(true);
    expect(commoner?.environments.desert).toBe(true);
    expect(commoner?.environments.forest).toBe(true);
    expect(commoner?.environments.grassland).toBe(true);
    expect(commoner?.environments.hill).toBe(true);
    expect(commoner?.environments.mountain).toBe(true);
    expect(commoner?.environments.swamp).toBe(true);
    expect(commoner?.environments.underdark).toBe(true);
    expect(commoner?.environments.underwater).toBe(true);
    expect(commoner?.environments.urban).toBe(true);
    expect(commoner?.environments.other).toBe(true);
  });

  test('should handle aquatic monsters correctly', () => {
    const aboleth = monsters.find(m => m.name === 'Aboleth');

    expect(aboleth?.movement).toBe('Swim');
    expect(aboleth?.environments.underwater).toBe(true);
    expect(aboleth?.environments.underdark).toBe(true);
  });

  test('should handle flying monsters correctly', () => {
    const dragon = monsters.find(m => m.name === 'Ancient Red Dragon');
    const beholder = monsters.find(m => m.name === 'Beholder');

    expect(dragon?.movement).toBe('Fly');
    expect(beholder?.movement).toBe('Fly');
  });

  test('should parse abilities and actions correctly', () => {
    const goblin = monsters.find(m => m.name === 'Goblin');

    expect(goblin?.abilities).toBe('Nimble Escape');
    expect(goblin?.actions).toBe('Scimitar, Shortbow');
  });

  test('should handle complex abilities and actions', () => {
    const dragon = monsters.find(m => m.name === 'Ancient Red Dragon');

    expect(dragon?.abilities).toBe('Legendary Resistance');
    expect(dragon?.actions).toContain('Fire Breath');
    expect(dragon?.reaction).toBe('Legendary Actions');
  });

  test('should skip empty lines', () => {
    // The test CSV has 5 monsters defined
    expect(monsters.length).toBe(5);
  });

  test('should handle optional credits field', () => {
    const goblin = monsters.find(m => m.name === 'Goblin');

    expect(goblin?.credits).toBe('Test Author');
  });
});

test.describe('parseCSVLine Function Tests', () => {
  test('should parse simple CSV line', () => {
    const line = 'value1,value2,value3';
    const result = parseCSVLine(line);

    expect(result).toEqual(['value1', 'value2', 'value3']);
  });

  test('should handle quoted fields with commas', () => {
    const line = 'value1,"value2,with,commas",value3';
    const result = parseCSVLine(line);

    expect(result).toEqual(['value1', 'value2,with,commas', 'value3']);
  });

  test('should handle empty fields', () => {
    const line = 'value1,,value3';
    const result = parseCSVLine(line);

    expect(result).toEqual(['value1', '', 'value3']);
  });

  test('should handle fields with only quotes', () => {
    const line = '"value1","value2","value3"';
    const result = parseCSVLine(line);

    expect(result).toEqual(['value1', 'value2', 'value3']);
  });

  test('should handle complex quoted content', () => {
    const line = 'Monster,"Bite, Claw, Tail",10';
    const result = parseCSVLine(line);

    expect(result).toEqual(['Monster', 'Bite, Claw, Tail', '10']);
  });
});

test.describe('Grouping Functions Tests', () => {
  const testCSVPath = path.join(__dirname, 'fixtures', 'test-monsters.csv');
  let monsters: Monster[];

  test.beforeAll(() => {
    monsters = parseCSV(testCSVPath);
  });

  test('groupMonstersByCR should group monsters by challenge rating', () => {
    const grouped = groupMonstersByCR(monsters);

    expect(grouped['1/4']).toBeDefined();
    expect(grouped['1/4'].length).toBe(1);
    expect(grouped['1/4'][0].name).toBe('Goblin');

    expect(grouped['24']).toBeDefined();
    expect(grouped['24'][0].name).toBe('Ancient Red Dragon');
  });

  test('groupMonstersByCR should handle CR 0', () => {
    const grouped = groupMonstersByCR(monsters);

    expect(grouped['0']).toBeDefined();
    expect(grouped['0'][0].name).toBe('Commoner');
  });

  test('groupMonstersByType should group monsters by type', () => {
    const grouped = groupMonstersByType(monsters);

    expect(grouped['humanoid']).toBeDefined();
    expect(grouped['humanoid'].length).toBe(2); // Goblin and Commoner

    expect(grouped['aberration']).toBeDefined();
    expect(grouped['aberration'].length).toBe(2); // Aboleth and Beholder

    expect(grouped['dragon']).toBeDefined();
    expect(grouped['dragon'].length).toBe(1);
  });

  test('groupMonstersByType should handle types with parentheses', () => {
    const testMonster: Monster = {
      name: 'Test',
      size: 'Medium',
      type: 'humanoid (elf)',
      tag: '',
      alignment: 'neutral',
      movement: '',
      cr: '1',
      sourceBook: 'MM',
      sourcePage: '1',
      spellUser: false,
      legendaryActions: false,
      lairActions: false,
      abilities: '',
      actions: '',
      reaction: '',
      environments: {
        arctic: false, coastal: false, desert: false, forest: true,
        grassland: false, hill: false, mountain: false, swamp: false,
        underdark: false, underwater: false, urban: false, other: false,
      },
      credits: '',
    };

    const grouped = groupMonstersByType([testMonster]);
    expect(grouped['humanoid']).toBeDefined();
    expect(grouped['humanoid'][0].name).toBe('Test');
  });

  test('groupMonstersByEnvironment should group monsters by environment', () => {
    const grouped = groupMonstersByEnvironment(monsters);

    expect(grouped.grassland).toBeDefined();
    expect(grouped.grassland.some(m => m.name === 'Goblin')).toBe(true);

    expect(grouped.underwater).toBeDefined();
    expect(grouped.underwater.some(m => m.name === 'Aboleth')).toBe(true);

    expect(grouped.underdark).toBeDefined();
    expect(grouped.underdark.length).toBeGreaterThan(0);
  });

  test('groupMonstersByEnvironment should allow monsters in multiple environments', () => {
    const grouped = groupMonstersByEnvironment(monsters);
    const commonerInEnvironments = Object.values(grouped).filter(
      envMonsters => envMonsters.some(m => m.name === 'Commoner')
    );

    // Commoner should appear in all 12 environments
    expect(commonerInEnvironments.length).toBe(12);
  });

  test('groupMonstersByEnvironment should have all environment keys', () => {
    const grouped = groupMonstersByEnvironment(monsters);

    expect(grouped).toHaveProperty('arctic');
    expect(grouped).toHaveProperty('coastal');
    expect(grouped).toHaveProperty('desert');
    expect(grouped).toHaveProperty('forest');
    expect(grouped).toHaveProperty('grassland');
    expect(grouped).toHaveProperty('hill');
    expect(grouped).toHaveProperty('mountain');
    expect(grouped).toHaveProperty('swamp');
    expect(grouped).toHaveProperty('underdark');
    expect(grouped).toHaveProperty('underwater');
    expect(grouped).toHaveProperty('urban');
    expect(grouped).toHaveProperty('other');
  });
});

test.describe('Statistics Function Tests', () => {
  const testCSVPath = path.join(__dirname, 'fixtures', 'test-monsters.csv');
  let monsters: Monster[];
  let stats: ReturnType<typeof getMonsterStats>;

  test.beforeAll(() => {
    monsters = parseCSV(testCSVPath);
    stats = getMonsterStats(monsters);
  });

  test('should calculate total monster count', () => {
    expect(stats.total).toBe(5);
  });

  test('should count legendary monsters', () => {
    expect(stats.legendary).toBe(2); // Ancient Red Dragon and Beholder
  });

  test('should count monsters with lair actions', () => {
    expect(stats.withLairActions).toBe(2); // Ancient Red Dragon and Beholder
  });

  test('should count spellcasters', () => {
    expect(stats.spellcasters).toBe(2); // Ancient Red Dragon and Aboleth
  });

  test('should group by size', () => {
    expect(stats.bySize['Small']).toBe(1); // Goblin
    expect(stats.bySize['Medium']).toBe(1); // Commoner
    expect(stats.bySize['Large']).toBe(2); // Aboleth, Beholder
    expect(stats.bySize['Gargantuan']).toBe(1); // Ancient Red Dragon
  });

  test('should group by CR', () => {
    expect(stats.byCR['0']).toBe(1); // Commoner
    expect(stats.byCR['1/4']).toBe(1); // Goblin
    expect(stats.byCR['10']).toBe(1); // Aboleth
    expect(stats.byCR['13']).toBe(1); // Beholder
    expect(stats.byCR['24']).toBe(1); // Ancient Red Dragon
  });

  test('should group by type', () => {
    expect(stats.byType['humanoid']).toBe(2); // Goblin, Commoner
    expect(stats.byType['aberration']).toBe(2); // Aboleth, Beholder
    expect(stats.byType['dragon']).toBe(1); // Ancient Red Dragon
  });

  test('should count by environment', () => {
    expect(stats.byEnvironment.urban).toBeGreaterThan(0);
    expect(stats.byEnvironment.underwater).toBeGreaterThan(0);
    expect(stats.byEnvironment.grassland).toBeGreaterThan(0);
  });

  test('should handle monsters with no environments', () => {
    const testMonsters: Monster[] = [{
      name: 'Test',
      size: 'Medium',
      type: 'construct',
      tag: '',
      alignment: 'neutral',
      movement: '',
      cr: '1',
      sourceBook: 'MM',
      sourcePage: '1',
      spellUser: false,
      legendaryActions: false,
      lairActions: false,
      abilities: '',
      actions: '',
      reaction: '',
      environments: {
        arctic: false, coastal: false, desert: false, forest: false,
        grassland: false, hill: false, mountain: false, swamp: false,
        underdark: false, underwater: false, urban: false, other: false,
      },
      credits: '',
    }];

    const testStats = getMonsterStats(testMonsters);

    expect(testStats.total).toBe(1);
    // When no environments are set, those environment counts should be 0 or undefined
    expect(testStats.byEnvironment.arctic || 0).toBe(0);
  });
});

test.describe('Edge Cases and Error Handling', () => {
  test('should handle CSV with incomplete lines', () => {
    const tempCSVPath = path.join(__dirname, 'fixtures', 'incomplete-test.csv');
    const csvContent = `name,size,type,tag,alignment,movement,cr,sourceBook,sourcePage,spellUser,legendaryActions,lairActions,abilities,actions,reaction,arctic,coastal,desert,forest,grassland,hill,mountain,swamp,underdark,underwater,urban,other,,credits
Goblin,Small,humanoid
Valid Monster,Medium,humanoid,human,neutral,,1,MM,1,,,,,,,,,,,,,,,,,,,Test`;

    fs.writeFileSync(tempCSVPath, csvContent);

    const monsters = parseCSV(tempCSVPath);

    // Should only parse the valid monster
    expect(monsters.length).toBe(1);
    expect(monsters[0].name).toBe('Valid Monster');

    // Cleanup
    fs.unlinkSync(tempCSVPath);
  });

  test('should handle empty CSV file', () => {
    const tempCSVPath = path.join(__dirname, 'fixtures', 'empty-test.csv');
    fs.writeFileSync(tempCSVPath, 'name,size,type,tag,alignment,movement,cr,sourceBook,sourcePage,spellUser,legendaryActions,lairActions,abilities,actions,reaction,arctic,coastal,desert,forest,grassland,hill,mountain,swamp,underdark,underwater,urban,other,,credits\n');

    const monsters = parseCSV(tempCSVPath);

    expect(monsters.length).toBe(0);

    // Cleanup
    fs.unlinkSync(tempCSVPath);
  });

  test('should trim whitespace from fields', () => {
    const tempCSVPath = path.join(__dirname, 'fixtures', 'whitespace-test.csv');
    const csvContent = `name,size,type,tag,alignment,movement,cr,sourceBook,sourcePage,spellUser,legendaryActions,lairActions,abilities,actions,reaction,arctic,coastal,desert,forest,grassland,hill,mountain,swamp,underdark,underwater,urban,other,,credits
  Goblin  ,  Small  ,  humanoid  ,  goblinoid  ,  neutral evil  ,,  1/4  ,  MM  ,  166  ,,,,"  Nimble Escape  ","  Scimitar  ",,,,,,x,x,,,,,,,,  Test  `;

    fs.writeFileSync(tempCSVPath, csvContent);

    const monsters = parseCSV(tempCSVPath);

    expect(monsters.length).toBe(1);
    expect(monsters[0].name).toBe('Goblin');
    expect(monsters[0].size).toBe('Small');
    expect(monsters[0].abilities).toBe('Nimble Escape');
    expect(monsters[0].credits).toBe('Test');

    // Cleanup
    fs.unlinkSync(tempCSVPath);
  });

  test('should handle missing credits field gracefully', () => {
    const tempCSVPath = path.join(__dirname, 'fixtures', 'no-credits-test.csv');
    const csvContent = `name,size,type,tag,alignment,movement,cr,sourceBook,sourcePage,spellUser,legendaryActions,lairActions,abilities,actions,reaction,arctic,coastal,desert,forest,grassland,hill,mountain,swamp,underdark,underwater,urban,other,,credits
Goblin,Small,humanoid,goblinoid,neutral evil,,1/4,MM,166,,,,,,,,,,,x,x,,,,,,,`;

    fs.writeFileSync(tempCSVPath, csvContent);

    const monsters = parseCSV(tempCSVPath);

    expect(monsters.length).toBe(1);
    expect(monsters[0].credits).toBe('');

    // Cleanup
    fs.unlinkSync(tempCSVPath);
  });
});

test.describe('Integration Tests', () => {
  const testCSVPath = path.join(__dirname, 'fixtures', 'test-monsters.csv');

  test('should parse, group, and generate stats for complete workflow', () => {
    // Parse
    const monsters = parseCSV(testCSVPath);
    expect(monsters.length).toBeGreaterThan(0);

    // Group by CR
    const byCR = groupMonstersByCR(monsters);
    expect(Object.keys(byCR).length).toBeGreaterThan(0);

    // Group by Type
    const byType = groupMonstersByType(monsters);
    expect(Object.keys(byType).length).toBeGreaterThan(0);

    // Group by Environment
    const byEnv = groupMonstersByEnvironment(monsters);
    expect(Object.keys(byEnv).length).toBe(12);

    // Get stats
    const stats = getMonsterStats(monsters);
    expect(stats.total).toBe(monsters.length);
    expect(stats.legendary).toBeGreaterThanOrEqual(0);
    expect(stats.spellcasters).toBeGreaterThanOrEqual(0);
  });

  test('should produce consistent results across multiple parses', () => {
    const monsters1 = parseCSV(testCSVPath);
    const monsters2 = parseCSV(testCSVPath);

    expect(monsters1.length).toBe(monsters2.length);
    expect(monsters1[0].name).toBe(monsters2[0].name);

    const stats1 = getMonsterStats(monsters1);
    const stats2 = getMonsterStats(monsters2);

    expect(stats1.total).toBe(stats2.total);
    expect(stats1.legendary).toBe(stats2.legendary);
  });
});
