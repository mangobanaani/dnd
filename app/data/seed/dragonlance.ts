import { Campaign } from '@/app/types/campaign';
import { Character } from '@/app/types/character';

// Dragonlance: Chronicles of the War of the Lance
export const dragonlanceCampaign: Campaign = {
  id: 'campaign-dragonlance-chronicles',
  name: 'Chronicles of the War of the Lance',
  description: 'Experience the epic tale of the Heroes of the Lance as they battle the forces of the Dark Queen Takhisis and her dragonarmies. Journey through Krynn during the Age of Despair, from the Inn of the Last Home in Solace to the ancient ruins of Xak Tsaroth, and beyond to the war-torn lands of Ansalon.',
  imageUrl: '/images/campaigns/dragonlance.jpg',

  setting: 'Dragonlance',
  startDate: new Date('2024-01-15').toISOString(),
  status: 'active',

  edition: '5e',
  homebrew: false,
  difficultyLevel: 'hard',

  dmId: 'dm-sample',
  playerIds: ['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'],
  characterIds: [
    'char-tanis',
    'char-raistlin',
    'char-caramon',
    'char-sturm',
    'char-goldmoon',
    'char-riverwind',
    'char-tasslehoff',
    'char-flint'
  ],

  sessionCount: 12,
  totalSessions: 24,
  currentLevel: 8,
  nextSessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),

  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString(),
  tags: ['Epic', 'Classic', 'War', 'Dragons', 'Dragonlance'],
  isPublic: true,
};

// Tanis Half-Elven - The Leader
export const tanis: Character = {
  id: 'char-tanis',
  name: 'Tanis Half-Elven',
  race: 'Half-Elf',
  classes: [{ name: 'Fighter', level: 5, hitDie: 'd10', subclass: 'Battle Master' }, { name: 'Ranger', level: 3, hitDie: 'd10' }],
  level: 8,
  background: 'Outlander',
  alignment: 'Neutral Good',
  experiencePoints: 34000,

  abilityScores: {
    strength: 16,
    dexterity: 14,
    constitution: 15,
    intelligence: 12,
    wisdom: 13,
    charisma: 14
  },

  maxHitPoints: 72,
  currentHitPoints: 72,
  temporaryHitPoints: 0,
  hitDice: [
    { total: 5, current: 5, die: 'd10' },
    { total: 3, current: 3, die: 'd10' }
  ],

  armorClass: 17,
  initiative: 2,
  speed: 30,

  proficiencyBonus: 3,
  savingThrows: ['strength', 'constitution', 'dexterity', 'wisdom'],
  skills: [
    { name: 'Athletics', ability: 'strength', proficient: true, expertise: false },
    { name: 'Perception', ability: 'wisdom', proficient: true, expertise: false },
    { name: 'Survival', ability: 'wisdom', proficient: true, expertise: false },
    { name: 'Persuasion', ability: 'charisma', proficient: true, expertise: false },
  ],

  features: [
    'Fey Ancestry',
    'Darkvision',
    'Fighting Style: Defense',
    'Second Wind',
    'Action Surge',
    'Combat Superiority',
    'Favored Enemy: Dragons',
    'Natural Explorer: Forest',
    'Primeval Awareness'
  ],
  traits: ['Diplomatic', 'Burdened by leadership', 'Torn between two worlds'],

  equipment: ['Longsword +1', 'Longbow', 'Half-Plate Armor', 'Shield'],
  inventory: [],
  currency: { copper: 0, silver: 50, electrum: 0, gold: 250, platinum: 5 },
  carriedWeight: 0,
  maxCarryWeight: 240, // Strength 16 * 15

  knownSpells: [],

  effects: [],
  exhaustionLevel: 0,

  avatarUrl: '/images/characters/tanis.jpg',
  notes: 'Leader of the Heroes of the Lance. Son of an elf mother and human father, struggling with his dual heritage.',

  campaignId: 'campaign-dragonlance-chronicles',
  playerId: 'Sample Player 1',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString(),
};

// Raistlin Majere - The Dark Mage
export const raistlin: Character = {
  id: 'char-raistlin',
  name: 'Raistlin Majere',
  race: 'Human',
  classes: [{ name: 'Wizard', level: 8, hitDie: 'd6', subclass: 'School of Evocation' }],
  level: 8,
  background: 'Sage',
  alignment: 'Neutral',
  experiencePoints: 34000,

  abilityScores: {
    strength: 8,
    dexterity: 10,
    constitution: 10,
    intelligence: 18,
    wisdom: 14,
    charisma: 12
  },

  maxHitPoints: 42,
  currentHitPoints: 42,
  temporaryHitPoints: 0,
  hitDice: [{ total: 8, current: 8, die: 'd6' }],

  armorClass: 13,
  initiative: 0,
  speed: 30,

  proficiencyBonus: 3,
  savingThrows: ['intelligence', 'wisdom'],
  skills: [
    { name: 'Arcana', ability: 'intelligence', proficient: true, expertise: true },
    { name: 'History', ability: 'intelligence', proficient: true, expertise: false },
    { name: 'Investigation', ability: 'intelligence', proficient: true, expertise: false },
    { name: 'Insight', ability: 'wisdom', proficient: true, expertise: false },
  ],

  features: [
    'Spellcasting',
    'Arcane Recovery',
    'Evocation Savant',
    'Sculpt Spells',
    'Potent Cantrip',
    'Hourglass Eyes (sees all time as sand)',
    'Staff of Magius (bonded)'
  ],
  traits: ['Ambitious', 'Frail and sickly', 'Golden skin and hourglass eyes', 'Ruthlessly pragmatic'],

  equipment: ['Staff of Magius', 'Red Robes of the Conclave', 'Spellbook', 'Component Pouch'],
  inventory: [],
  currency: { copper: 0, silver: 0, electrum: 0, gold: 150, platinum: 10 },
  carriedWeight: 0,
  maxCarryWeight: 120, // Strength 8 * 15

  knownSpells: [
    'Fireball',
    'Lightning Bolt',
    'Magic Missile',
    'Shield',
    'Counterspell',
    'Cone of Cold',
    'Dimension Door',
    'Detect Magic',
    'Identify'
  ],

  effects: [],
  exhaustionLevel: 0,

  avatarUrl: '/images/characters/raistlin.jpg',
  notes: 'Twin brother of Caramon. Red Robe wizard who passed the Test of High Sorcery at great cost, gaining golden skin and cursed hourglass eyes that show all living things as decaying.',

  campaignId: 'campaign-dragonlance-chronicles',
  playerId: 'Sample Player 2',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString(),
};

// Caramon Majere - The Warrior
export const caramon: Character = {
  id: 'char-caramon',
  name: 'Caramon Majere',
  race: 'Human',
  classes: [{ name: 'Fighter', level: 8, hitDie: 'd10', subclass: 'Champion' }],
  level: 8,
  background: 'Soldier',
  alignment: 'Neutral Good',
  experiencePoints: 34000,

  abilityScores: {
    strength: 18,
    dexterity: 14,
    constitution: 16,
    intelligence: 10,
    wisdom: 12,
    charisma: 11
  },

  maxHitPoints: 88,
  currentHitPoints: 88,
  temporaryHitPoints: 0,
  hitDice: [{ total: 8, current: 8, die: 'd10' }],

  armorClass: 18,
  initiative: 2,
  speed: 30,

  proficiencyBonus: 3,
  savingThrows: ['strength', 'constitution'],
  skills: [
    { name: 'Athletics', ability: 'strength', proficient: true, expertise: false },
    { name: 'Intimidation', ability: 'charisma', proficient: true, expertise: false },
    { name: 'Survival', ability: 'wisdom', proficient: true, expertise: false },
  ],

  features: [
    'Fighting Style: Protection',
    'Second Wind',
    'Action Surge',
    'Improved Critical',
    'Remarkable Athlete',
    'Additional Fighting Style: Defense'
  ],
  traits: ['Protective of his twin brother', 'Strong and dependable', 'Loyal to a fault', 'Simple but kind'],

  equipment: ['Greatsword', 'Longsword', 'Plate Armor', 'Shield'],
  inventory: [],
  currency: { copper: 100, silver: 200, electrum: 0, gold: 300, platinum: 2 },
  carriedWeight: 0,
  maxCarryWeight: 270, // Strength 18 * 15

  knownSpells: [],

  effects: [],
  exhaustionLevel: 0,

  avatarUrl: '/images/characters/caramon.jpg',
  notes: 'Twin brother of Raistlin. A powerful warrior devoted to protecting his frail twin. Strong, kind-hearted, and dependable.',

  campaignId: 'campaign-dragonlance-chronicles',
  playerId: 'Sample Player 3',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString(),
};

// Sturm Brightblade - The Knight
export const sturm: Character = {
  id: 'char-sturm',
  name: 'Sturm Brightblade',
  race: 'Human',
  classes: [{ name: 'Fighter', level: 8, hitDie: 'd10', subclass: 'Cavalier' }],
  level: 8,
  background: 'Noble',
  alignment: 'Lawful Good',
  experiencePoints: 34000,

  abilityScores: {
    strength: 17,
    dexterity: 12,
    constitution: 14,
    intelligence: 11,
    wisdom: 13,
    charisma: 15
  },

  maxHitPoints: 76,
  currentHitPoints: 76,
  temporaryHitPoints: 0,
  hitDice: [{ total: 8, current: 8, die: 'd10' }],

  armorClass: 18,
  initiative: 1,
  speed: 30,

  proficiencyBonus: 3,
  savingThrows: ['strength', 'constitution'],
  skills: [
    { name: 'Athletics', ability: 'strength', proficient: true, expertise: false },
    { name: 'History', ability: 'intelligence', proficient: true, expertise: false },
    { name: 'Persuasion', ability: 'charisma', proficient: true, expertise: false },
  ],

  features: [
    'Fighting Style: Dueling',
    'Second Wind',
    'Action Surge',
    'Born to the Saddle',
    'Unwavering Mark',
    'Warding Maneuver',
    'Hold the Line',
    'Knights Code of Honor'
  ],
  traits: ['Honorable', 'Lives by the Oath and the Measure', 'Stern and disciplined', 'Destined for greatness'],

  equipment: ['Brightblade Family Sword', 'Plate Armor (Solamnic)', 'Shield with Rose Emblem'],
  inventory: [],
  currency: { copper: 0, silver: 0, electrum: 0, gold: 100, platinum: 5 },
  carriedWeight: 0,
  maxCarryWeight: 255, // Strength 17 * 15

  knownSpells: [],

  effects: [],
  exhaustionLevel: 0,

  avatarUrl: '/images/characters/sturm.jpg',
  notes: 'Last of the Brightblade family, descendant of Solamnic Knights. Lives by the strict code of the Knights of Solamnia, seeking to restore honor to his name.',

  campaignId: 'campaign-dragonlance-chronicles',
  playerId: 'Sample Player 4',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString(),
};

// Goldmoon - The Cleric
export const goldmoon: Character = {
  id: 'char-goldmoon',
  name: 'Goldmoon',
  race: 'Human (Plainsman)',
  classes: [{ name: 'Cleric', level: 8, hitDie: 'd8', subclass: 'Life Domain' }],
  level: 8,
  background: 'Acolyte',
  alignment: 'Lawful Good',
  experiencePoints: 34000,

  abilityScores: {
    strength: 12,
    dexterity: 10,
    constitution: 14,
    intelligence: 11,
    wisdom: 18,
    charisma: 16
  },

  maxHitPoints: 62,
  currentHitPoints: 62,
  temporaryHitPoints: 0,
  hitDice: [{ total: 8, current: 8, die: 'd8' }],

  armorClass: 16,
  initiative: 0,
  speed: 30,

  proficiencyBonus: 3,
  savingThrows: ['wisdom', 'charisma'],
  skills: [
    { name: 'Medicine', ability: 'wisdom', proficient: true, expertise: true },
    { name: 'Religion', ability: 'intelligence', proficient: true, expertise: false },
    { name: 'Insight', ability: 'wisdom', proficient: true, expertise: false },
    { name: 'Persuasion', ability: 'charisma', proficient: true, expertise: false },
  ],

  features: [
    'Spellcasting',
    'Divine Domain: Life',
    'Disciple of Life',
    'Channel Divinity: Preserve Life',
    'Channel Divinity: Turn Undead',
    'Blessed Healer',
    'Divine Strike',
    'Blue Crystal Staff (artifact)'
  ],
  traits: ['Wise and compassionate', 'Chieftains daughter', 'Bearer of the Blue Crystal Staff', 'First to find true gods'],

  equipment: ['Blue Crystal Staff', 'Scale Mail', 'Shield', 'Holy Symbol of Mishakal'],
  inventory: [],
  currency: { copper: 0, silver: 100, electrum: 0, gold: 200, platinum: 8 },
  carriedWeight: 0,
  maxCarryWeight: 180, // Strength 12 * 15

  knownSpells: [
    'Cure Wounds',
    'Healing Word',
    'Prayer of Healing',
    'Lesser Restoration',
    'Revivify',
    'Beacon of Hope',
    'Mass Healing Word',
    'Bless',
    'Shield of Faith',
    'Spiritual Weapon',
    'Spirit Guardians'
  ],

  effects: [],
  exhaustionLevel: 0,

  avatarUrl: '/images/characters/goldmoon.jpg',
  notes: 'Chieftains daughter of the Que-Shu tribe. First to discover the Blue Crystal Staff and restore the worship of the true gods to Krynn.',

  campaignId: 'campaign-dragonlance-chronicles',
  playerId: 'Sample Player 5',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString(),
};

// Riverwind - The Ranger
export const riverwind: Character = {
  id: 'char-riverwind',
  name: 'Riverwind',
  race: 'Human (Plainsman)',
  classes: [{ name: 'Ranger', level: 8, hitDie: 'd10', subclass: 'Hunter' }],
  level: 8,
  background: 'Outlander',
  alignment: 'Lawful Good',
  experiencePoints: 34000,

  abilityScores: {
    strength: 17,
    dexterity: 16,
    constitution: 15,
    intelligence: 10,
    wisdom: 14,
    charisma: 11
  },

  maxHitPoints: 78,
  currentHitPoints: 78,
  temporaryHitPoints: 0,
  hitDice: [{ total: 8, current: 8, die: 'd10' }],

  armorClass: 16,
  initiative: 3,
  speed: 30,

  proficiencyBonus: 3,
  savingThrows: ['strength', 'dexterity'],
  skills: [
    { name: 'Athletics', ability: 'strength', proficient: true, expertise: false },
    { name: 'Perception', ability: 'wisdom', proficient: true, expertise: true },
    { name: 'Survival', ability: 'wisdom', proficient: true, expertise: true },
    { name: 'Stealth', ability: 'dexterity', proficient: true, expertise: false },
  ],

  features: [
    'Favored Enemy: Undead & Dragons',
    'Natural Explorer: Plains & Mountains',
    'Fighting Style: Archery',
    'Primeval Awareness',
    'Extra Attack',
    'Hunters Prey: Colossus Slayer',
    'Lands Stride',
    'Hide in Plain Sight'
  ],
  traits: ['Stoic and serious', 'Devoted to Goldmoon', 'Master tracker', 'Brave and honorable'],

  equipment: ['Longbow +1', 'Longsword', 'Hide Armor', 'Quiver of 40 Arrows'],
  inventory: [],
  currency: { copper: 50, silver: 150, electrum: 0, gold: 180, platinum: 3 },
  carriedWeight: 0,
  maxCarryWeight: 240, // Strength 16 * 15

  knownSpells: [
    'Hunters Mark',
    'Cure Wounds',
    'Pass Without Trace',
    'Conjure Animals'
  ],

  effects: [],
  exhaustionLevel: 0,

  avatarUrl: '/images/characters/riverwind.jpg',
  notes: 'Tall Plainsman warrior and devoted companion to Goldmoon. His quest to prove himself worthy led to the discovery of the Blue Crystal Staff.',

  campaignId: 'campaign-dragonlance-chronicles',
  playerId: 'Sample Player 6',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString(),
};

// Tasslehoff Burrfoot - The Kender Rogue
export const tasslehoff: Character = {
  id: 'char-tasslehoff',
  name: 'Tasslehoff Burrfoot',
  race: 'Kender (Halfling variant)',
  classes: [{ name: 'Rogue', level: 8, hitDie: 'd8', subclass: 'Thief' }],
  level: 8,
  background: 'Far Traveler',
  alignment: 'Chaotic Good',
  experiencePoints: 34000,

  abilityScores: {
    strength: 10,
    dexterity: 18,
    constitution: 12,
    intelligence: 12,
    wisdom: 8,
    charisma: 14
  },

  maxHitPoints: 52,
  currentHitPoints: 52,
  temporaryHitPoints: 0,
  hitDice: [{ total: 8, current: 8, die: 'd8' }],

  armorClass: 16,
  initiative: 4,
  speed: 25,

  proficiencyBonus: 3,
  savingThrows: ['dexterity', 'intelligence'],
  skills: [
    { name: 'Acrobatics', ability: 'dexterity', proficient: true, expertise: true },
    { name: 'Sleight of Hand', ability: 'dexterity', proficient: true, expertise: true },
    { name: 'Stealth', ability: 'dexterity', proficient: true, expertise: true },
    { name: 'Perception', ability: 'wisdom', proficient: true, expertise: false },
    { name: 'Investigation', ability: 'intelligence', proficient: true, expertise: false },
  ],

  features: [
    'Sneak Attack (4d6)',
    'Cunning Action',
    'Fast Hands',
    'Second-Story Work',
    'Supreme Sneak',
    'Fearless (Kender trait)',
    'Taunt (Kender trait)',
    'Evasion',
    'Uncanny Dodge'
  ],
  traits: [
    'Fearless and curious',
    'Compulsive borrower',
    'Never intentionally steals',
    'Tells tall tales',
    'Loves maps and new places'
  ],

  equipment: ['Hoopak (staff-sling)', 'Shortsword', 'Leather Armor', 'Thieves Tools', 'Many pouches full of borrowed items'],
  inventory: [],
  currency: { copper: 500, silver: 300, electrum: 20, gold: 80, platinum: 1 },
  carriedWeight: 0,
  maxCarryWeight: 150, // Strength 10 * 15

  knownSpells: [],

  effects: [],
  exhaustionLevel: 0,

  avatarUrl: '/images/characters/tasslehoff.jpg',
  notes: 'Classic kender - fearless, curious, and prone to handling things that dont belong to him. His stories are as legendary as his ability to get into (and out of) trouble.',

  campaignId: 'campaign-dragonlance-chronicles',
  playerId: 'Sample Player 7',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString(),
};

// Flint Fireforge - The Dwarf Fighter
export const flint: Character = {
  id: 'char-flint',
  name: 'Flint Fireforge',
  race: 'Mountain Dwarf',
  classes: [{ name: 'Fighter', level: 8, hitDie: 'd10', subclass: 'Battle Master' }],
  level: 8,
  background: 'Guild Artisan (Metalsmith)',
  alignment: 'Neutral Good',
  experiencePoints: 34000,

  abilityScores: {
    strength: 16,
    dexterity: 10,
    constitution: 17,
    intelligence: 11,
    wisdom: 14,
    charisma: 9
  },

  maxHitPoints: 90,
  currentHitPoints: 90,
  temporaryHitPoints: 0,
  hitDice: [{ total: 8, current: 8, die: 'd10' }],

  armorClass: 18,
  initiative: 0,
  speed: 25,

  proficiencyBonus: 3,
  savingThrows: ['strength', 'constitution'],
  skills: [
    { name: 'Athletics', ability: 'strength', proficient: true, expertise: false },
    { name: 'Insight', ability: 'wisdom', proficient: true, expertise: false },
    { name: 'Perception', ability: 'wisdom', proficient: true, expertise: false },
  ],

  features: [
    'Darkvision',
    'Dwarven Resilience',
    'Stonecunning',
    'Fighting Style: Defense',
    'Second Wind',
    'Action Surge',
    'Combat Superiority (5 dice)',
    'Know Your Enemy',
    'Improved Combat Superiority'
  ],
  traits: [
    'Grumpy but good-hearted',
    'Master craftsman',
    'Distrusts kender',
    'Loyal friend',
    'Old and wise'
  ],

  equipment: ['Battleaxe +1', 'Handaxe (throwing)', 'Plate Armor', 'Shield'],
  inventory: [],
  currency: { copper: 0, silver: 0, electrum: 0, gold: 400, platinum: 15 },
  carriedWeight: 0,
  maxCarryWeight: 210, // Strength 14 * 15

  knownSpells: [],

  effects: [],
  exhaustionLevel: 0,

  avatarUrl: '/images/characters/flint.jpg',
  notes: 'Elderly dwarf weaponsmith and longtime friend of Tanis. Gruff exterior hides a heart of gold. Constantly exasperated by Tasslehoffs antics.',

  campaignId: 'campaign-dragonlance-chronicles',
  playerId: 'Sample Player 8',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString(),
};

// Export all characters
export const heroesOfTheLance: Character[] = [
  tanis,
  raistlin,
  caramon,
  sturm,
  goldmoon,
  riverwind,
  tasslehoff,
  flint,
];

// Dragonlance Locations/Cities data structure
export interface Location {
  id: string;
  name: string;
  type: 'city' | 'town' | 'village' | 'fortress' | 'ruins' | 'landmark' | 'region';
  description: string;
  population?: number;
  government?: string;
  notable: string[];
  campaignId: string;
}

export const dragonlanceLocations: Location[] = [
  {
    id: 'loc-solace',
    name: 'Solace',
    type: 'town',
    description: 'A unique town built in the mighty vallenwood trees, connected by bridges and walkways. Home to the famous Inn of the Last Home, where the Heroes of the Lance first gathered.',
    population: 1200,
    government: 'Town Council',
    notable: [
      'Inn of the Last Home - Famous gathering place',
      'Vallenwood Trees - Ancient trees 100+ feet tall',
      'Tree-based architecture throughout',
      'Gateway to Solace Valley'
    ],
    campaignId: 'campaign-dragonlance-chronicles',
  },
  {
    id: 'loc-palanthas',
    name: 'Palanthas',
    type: 'city',
    description: 'The jewel of Solamnia, greatest city in all of Ansalon. Ancient and beautiful, with white towers and magnificent architecture. Seat of power for the Solamnic Knights.',
    population: 50000,
    government: 'Lord and High Council',
    notable: [
      'Great Library of Palanthas - Vast repository of knowledge',
      'High Clerists Tower - Fortress guarding the pass',
      'Old City - Ancient district with Kingpriest-era buildings',
      'Palace of the Lord - Seat of government',
      'Shoikan Grove - Cursed forest around the Tower of High Sorcery'
    ],
    campaignId: 'campaign-dragonlance-chronicles',
  },
  {
    id: 'loc-xak-tsaroth',
    name: 'Xak Tsaroth',
    type: 'ruins',
    description: 'Ancient ruined city, once a center of worship before the Cataclysm. Now lies at the bottom of a gorge, haunted by draconians and worse. Site where the Blue Crystal Staff was recovered.',
    population: 0,
    government: 'None (ruins)',
    notable: [
      'Temple of Mishakal - Where the Blue Crystal Staff was found',
      'Dragon throne - Lair of Onyx, a black dragon',
      'Sunken below ground level after the Cataclysm',
      'Draconian occupation'
    ],
    campaignId: 'campaign-dragonlance-chronicles',
  },
  {
    id: 'loc-pax-tharkas',
    name: 'Pax Tharkas',
    type: 'fortress',
    description: 'Massive fortress built into the mountainside by dwarves in ages past. Controls the only pass through the Kharolis Mountains. Captured by Dragon Highlord Verminaard and used as a slave camp.',
    population: 3000,
    government: 'Dragon Highlord Verminaard (Red Dragonarmy)',
    notable: [
      'Impregnable fortress in mountain pass',
      'Womens Auxiliary Tower - Where slaves are kept',
      'Red Dragonarmy occupation',
      'Lair of Ember (red dragon)',
      'Strategic chokepoint'
    ],
    campaignId: 'campaign-dragonlance-chronicles',
  },
  {
    id: 'loc-tarsis',
    name: 'Tarsis the Beautiful',
    type: 'city',
    description: 'Once a great seaport, now stranded far from the sea after the Cataclysm changed the geography. Still called "the Beautiful" though its glory has faded. Plagued by dragons.',
    population: 8000,
    government: 'Council of Merchants',
    notable: [
      'Ancient harbor now dry and landlocked',
      'Red Dragon Lair in the ruins',
      'Library containing crucial maps',
      'Marketplace and merchant quarter',
      'Faded glory of pre-Cataclysm era'
    ],
    campaignId: 'campaign-dragonlance-chronicles',
  },
  {
    id: 'loc-kalaman',
    name: 'Kalaman',
    type: 'city',
    description: 'Important port city on the Bay of Kalaman. Strategic location makes it target of Blue Dragonarmy. Known for its cavalry and military strength.',
    population: 25000,
    government: 'Lord Knight and City Council',
    notable: [
      'Strong military presence',
      'Important harbor and trade center',
      'Target of Blue Dragonarmy invasion',
      'Knights of Solamnia garrison',
      'City walls and defenses'
    ],
    campaignId: 'campaign-dragonlance-chronicles',
  },
  {
    id: 'loc-neraka',
    name: 'Neraka',
    type: 'city',
    description: 'Dark capital of the Dragon Empire, built in the Lords of Doom volcanic region. Center of Takhisis evil power and headquarters of the Dragonarmies.',
    population: 40000,
    government: 'Dragon Highlords and Dark Queen Takhisis',
    notable: [
      'Temple of Takhisis - Massive ziggurat',
      'Lords of Doom - Active volcanoes',
      'Dragonarmy headquarters',
      'Portal to the Abyss',
      'Dark heart of evil in Krynn'
    ],
    campaignId: 'campaign-dragonlance-chronicles',
  },
  {
    id: 'loc-thorbardin',
    name: 'Thorbardin',
    type: 'city',
    description: 'Underground dwarven kingdom, greatest of the dwarven realms. Sealed itself off after the Cataclysm. Magnificent underground caverns and forges.',
    population: 300000,
    government: 'Council of Thanes',
    notable: [
      'Vast underground kingdom',
      'Seven dwarven clans',
      'Legendary forges and craftsmanship',
      'Isolated from surface world',
      'Life Tree in center cavern'
    ],
    campaignId: 'campaign-dragonlance-chronicles',
  },
  {
    id: 'loc-qualinost',
    name: 'Qualinost',
    type: 'city',
    description: 'Beautiful capital of the Qualinesti elves, built of living trees and crystal. Located in a valley, protected by elven magic and natural defenses.',
    population: 15000,
    government: 'Speaker of the Sun (monarchy)',
    notable: [
      'Palace of Qualinost - Crystalline towers',
      'Gardens of Astarin',
      'Tower of the Sun - Speakers residence',
      'Elven craftwork and magic',
      'Threatened by dragonarmies'
    ],
    campaignId: 'campaign-dragonlance-chronicles',
  },
  {
    id: 'loc-inn-last-home',
    name: 'Inn of the Last Home',
    type: 'landmark',
    description: 'Famous inn in Solace where the Heroes of the Lance first reunited. Built in a massive vallenwood tree, warm and welcoming atmosphere despite troubled times.',
    notable: [
      'Owned by Otik Sandath',
      'Spiced potatoes - famous dish',
      'Meeting place of heroes',
      'Central firepit',
      'Home away from home'
    ],
    campaignId: 'campaign-dragonlance-chronicles',
  }
];

export const dragonlanceSeedData = {
  campaign: dragonlanceCampaign,
  characters: heroesOfTheLance,
  locations: dragonlanceLocations,
};
