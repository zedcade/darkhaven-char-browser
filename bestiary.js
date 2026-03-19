// bestiary.js — Darkhaven enemy bestiary
// ---------------------------------------------------------------------------
// Game version: 0.0.23272 
//
// Provides: BESTIARY  (array of category objects)
//
// Structure:
//   BESTIARY = [
//     {
//       category:    string   — category key (e.g. "goblinoids")
//       label:       string   — human-readable category name
//       description: string   — category description
//       icon:        string   — emoji icon for UI headers
//       enemies: [
//         {
//           id:          string    — unique identifier
//           name:        string    — display name
//           type:        string    — creature type (undead / goblinoid / etc.)
//           subtype:     string?   — e.g. "bogie", "gobkin", "floating_eye"
//           element:     string?   — elemental affinity
//           tier:        string?   — "elite" | "ranged" | "boss" | "caster" | "unique" | "warrior"
//           description: string    — flavour/lore text
//           attacks:     string[]  — attack types
//           variants:    string[]? — named sub-variants
//           behaviors:   string[]? — AI behavior tags
//           guid:        string?   — unit blueprint GUID (if known)
//           notes:       string?   — extra notes
//         }
//       ]
//     }
//   ]
// ---------------------------------------------------------------------------

const BESTIARY = [

  // ── GOBLINOIDS ─────────────────────────────────────────────────────────────
  // Small, cunning creatures that attack in groups. Includes Bogies and Gobkins.
  {
    category: 'goblinoids',
    label: 'Goblinoids',
    description: 'Small, cunning creatures that attack in groups. Includes Bogies and Gobkins.',
    icon: '👺',
    enemies: [
      // ── Bogies ────────────────────────────────────────────────────────────
      {
        id: 'bogie_feral',
        name: 'Bogie Feral',
        type: 'goblinoid', subtype: 'bogie',
        description: 'Wild, untamed bogies that attack with savage fury.',
        attacks: ['melee'],
        guid: '414d109a749260240b19f6b3e8e1f7e2',
      },
      {
        id: 'bogie_stabber',
        name: 'Bogie Stabber',
        type: 'goblinoid', subtype: 'bogie',
        description: 'Quick bogies that stab with daggers.',
        attacks: ['stab'],
      },
      {
        id: 'bogie_jabber',
        name: 'Bogie Jabber',
        type: 'goblinoid', subtype: 'bogie',
        description: 'Bogies that attack with jabbing motions.',
        attacks: ['jab'],
      },
      {
        id: 'bogie_chopper',
        name: 'Bogie Chopper',
        type: 'goblinoid', subtype: 'bogie', tier: 'warrior',
        description: 'Armored bogies wielding crude axes.',
        attacks: ['melee'],
      },
      {
        id: 'bogie_spearman',
        name: 'Bogie Spearman',
        type: 'goblinoid', subtype: 'bogie', tier: 'warrior',
        description: 'Bogies armed with spears, capable of charging attacks.',
        attacks: ['stab', 'charge'],
      },
      {
        id: 'bogie_shaman',
        name: 'Bogie Shaman',
        type: 'goblinoid', subtype: 'bogie', tier: 'caster',
        description: 'Bogie spellcasters that support their allies.',
        attacks: ['magic'],
      },
      {
        id: 'bogie_slingshotter',
        name: 'Bogie Slingshotter',
        type: 'goblinoid', subtype: 'bogie', tier: 'ranged',
        description: 'Bogies that attack from range with slings.',
        attacks: ['ranged'],
      },
      {
        id: 'bogie_bomb_thrower',
        name: 'Bogie Bomb Thrower',
        type: 'goblinoid', subtype: 'bogie', tier: 'ranged',
        description: 'Bogies that throw explosive molotov bombs.',
        attacks: ['molotov', 'head_strike', 'kick', 'palm_strike'],
      },
      {
        id: 'bogie_fire',
        name: 'Bogie Fire',
        type: 'goblinoid', subtype: 'bogie', element: 'fire',
        description: 'Fire-attuned bogies found in volcanic areas.',
        attacks: ['melee', 'fire'],
      },
      {
        id: 'bogie_magma',
        name: 'Bogie Magma',
        type: 'goblinoid', subtype: 'bogie', element: 'fire',
        description: 'Magma-infused bogies with burning attacks.',
        attacks: ['melee'],
      },
      {
        id: 'bogie_tyrant',
        name: 'Bogie Tyrant',
        type: 'goblinoid', subtype: 'bogie', tier: 'boss',
        description: 'Massive bogie chieftain with devastating magical abilities. Uses meteor attacks to devastate areas.',
        attacks: ['magic', 'melee', 'meteor'],
        notes: 'Keeps dungeon open until slain.',
      },
      // ── Gobkins ───────────────────────────────────────────────────────────
      {
        id: 'gobkin_grunt',
        name: 'Gobkin Grunt',
        type: 'goblinoid', subtype: 'gobkin',
        description: 'Basic gobkin warrior with sword and shield.',
        attacks: ['slash', 'stab', 'shield_bash'],
      },
      {
        id: 'gobkin_shaman',
        name: 'Gobkin Shaman',
        type: 'goblinoid', subtype: 'gobkin', tier: 'caster',
        description: 'Gobkin spellcaster providing magical support.',
        attacks: ['magic', 'melee'],
      },
      {
        id: 'gobkin_slinger',
        name: 'Gobkin Slinger',
        type: 'goblinoid', subtype: 'gobkin', tier: 'ranged',
        description: 'Gobkin that throws explosive bombs from range.',
        attacks: ['molotov', 'head_strike', 'kick', 'palm_strike'],
      },
    ],
  },

  // ── UNDEAD ─────────────────────────────────────────────────────────────────
  // Reanimated corpses and skeletal warriors that haunt the dark places of Darkhaven.
  {
    category: 'undead',
    label: 'Undead',
    description: 'Reanimated corpses and skeletal warriors that haunt the dark places of Darkhaven.',
    icon: '💀',
    enemies: [
      {
        id: 'living_corpse',
        name: 'Living Corpse',
        type: 'undead',
        description: 'A shambling corpse animated by dark magic.',
        attacks: ['strike'],
        variants: ['ember'],
      },
      {
        id: 'skelezomb_walker',
        name: 'Skelezomb Walker',
        type: 'undead',
        description: 'A partially decomposed skeleton that walks the crypts.',
        attacks: ['strike'],
        guid: 'fc75c41257e6fb44b9eddfc31acd4fbc',
      },
      {
        id: 'skelezomb_archer',
        name: 'Skelezomb Archer',
        type: 'undead', tier: 'ranged',
        description: 'Skeletal archer that attacks from range.',
        attacks: ['ranged'],
      },
      {
        id: 'skelezomb_champion',
        name: 'Skelezomb Champion',
        type: 'undead', tier: 'elite',
        description: 'A powerful skeletal warrior leading lesser undead.',
        attacks: ['strike'],
      },
      {
        id: 'doomed_soldier',
        name: 'Doomed Soldier',
        type: 'undead',
        description: 'A cursed warrior bound to fight eternally.',
        attacks: ['slashing_strike', 'blunt_strike'],
        guid: '69ba21950a3283c4394f9dc51fe4b40b',
      },
      {
        id: 'barrow_knight',
        name: 'Barrow Knight',
        type: 'undead', tier: 'elite',
        description: 'An armored undead knight, guardian of ancient tombs.',
        attacks: ['slashing_strike', 'blunt_strike'],
        variants: ['unique'],
        guid: 'aaa52fc7cd436c94cbb09e6e67bac08f',
      },
      {
        id: 'bone_legion',
        name: 'Bone Legion',
        type: 'undead',
        description: 'Skeletal soldiers that fight in coordinated groups.',
        attacks: ['slashing_strike', 'blunt_strike'],
        guid: 'b548a018176aafb4c8313f2e59bbff56',
      },
      {
        id: 'skeleton_mage',
        name: 'Skeleton Mage',
        type: 'undead', tier: 'ranged',
        description: 'An undead spellcaster wielding elemental magic.',
        attacks: ['fire_missile', 'frost_missile', 'lightning_charged_bolt', 'shadow_missile'],
        variants: ['fire', 'frost', 'lightning', 'shadow', 'unique_shadow'],
        guid: 'd3bfd0d138d6cb04e88e90f6ac98d3bb',
      },
      {
        id: 'lich',
        name: 'Lich',
        type: 'undead', tier: 'boss',
        description: 'A powerful undead sorcerer of immense magical power.',
        attacks: ['fire_missile', 'frost_missile', 'lightning_charged_bolt', 'shadow_missile', 'meteor'],
        guid: 'ae9dda7bfa4d2d34890a5b6b6b32e3be',
        notes: 'Known as Narlathak in-game.',
      },
      {
        id: 'necro_knight',
        name: 'Necro Knight',
        type: 'undead', tier: 'elite',
        description: 'A shadow-wielding undead champion.',
        attacks: ['shadow'],
        guid: 'f3eeba82c52fdf44688e8ab2e26f9c22',
      },
      {
        id: 'zombie',
        name: 'Zombie',
        type: 'undead',
        description: 'A slow-moving undead that attacks in groups.',
        attacks: ['strike'],
        guid: 'f464eb45e75d5c54da0d8b4e94ae0b0e',
      },
    ],
  },

  // ── ABERRATIONS ────────────────────────────────────────────────────────────
  // Eldritch and unnatural creatures from beyond, or twisted by dark magic.
  {
    category: 'aberrations',
    label: 'Aberrations',
    description: 'Eldritch and unnatural creatures from beyond, or twisted by dark magic.',
    icon: '👁️',
    enemies: [
      {
        id: 'gazer',
        name: 'Gazer',
        type: 'aberration', subtype: 'floating_eye',
        description: 'A floating eye creature that attacks with deadly beam attacks. Hovers above the ground and tracks targets precisely.',
        attacks: ['beam'],
        guid: 'bcb144ff8ba10c34c933fe9a6e29e1e9',
      },
      {
        id: 'false_gazer',
        name: 'False Gazer',
        type: 'aberration', subtype: 'floating_eye',
        description: 'A variant of the gazer with different abilities.',
        attacks: ['beam'],
        guid: 'b84e72995cc7fbc4cb351604e3dd4dc0',
      },
      {
        id: 'gulpjaw',
        name: 'Gulpjaw',
        type: 'aberration',
        description: 'A grotesque creature with a massive maw. Fast and aggressive, it strikes with devastating force.',
        attacks: ['strike'],
        guid: '8b8662a4574a7824abb7bae38f2a499b',
      },
      {
        id: 'ooze',
        name: 'Ooze',
        type: 'aberration', subtype: 'slime',
        description: 'Amorphous slime creatures that dissolve their prey.',
        attacks: ['strike', 'spit'],
        variants: ['shadow_ooze', 'lightning_ooze'],
      },
      {
        id: 'shadow_ooze',
        name: 'Shadow Ooze',
        type: 'aberration', subtype: 'slime', element: 'shadow',
        description: 'An ooze infused with shadow energy.',
        attacks: ['strike', 'spit'],
      },
      {
        id: 'lightning_ooze',
        name: 'Lightning Ooze',
        type: 'aberration', subtype: 'slime', element: 'lightning',
        description: 'An ooze crackling with electrical energy.',
        attacks: ['strike', 'spit'],
      },
      {
        id: 'wraith',
        name: 'Wraith',
        type: 'aberration', subtype: 'spectral', element: 'shadow',
        description: 'A spectral entity of pure shadow. Floats above the ground and can phase through obstacles.',
        attacks: ['shadow_touch'],
        guid: 'a5f93f9ce1b0d7a408ef71a057e578b5',
      },
      {
        id: 'deep_ones',
        name: 'Deep Ones',
        type: 'aberration', tier: 'elite',
        description: 'Aquatic horrors from the depths.',
        attacks: ['melee'],
        variants: ['unique'],
      },
      {
        id: 'leviathan',
        name: 'Leviathan',
        type: 'aberration', tier: 'unique',
        description: 'A massive aquatic leviathan lurking in the deep waters of Darkhaven.',
        attacks: ['melee', 'aquatic'],
        notes: 'Required for the FinnFighter achievement.',
      },
    ],
  },

  // ── CORRUPTED ──────────────────────────────────────────────────────────────
  // Creatures twisted by the Gloom, the dark force corrupting the land.
  {
    category: 'corrupted',
    label: 'Corrupted',
    description: 'Creatures twisted by the Gloom, the dark force corrupting the land.',
    icon: '☣️',
    enemies: [
      {
        id: 'gloomkin_grunt',
        name: 'Gloomkin Grunt',
        type: 'corrupted',
        description: 'Humanoids transformed by the Gloom into twisted warriors.',
        attacks: ['stab_left', 'stab_right', 'stab_cross'],
      },
      {
        id: 'gloomkin_demolisher',
        name: 'Gloomkin Demolisher',
        type: 'corrupted', tier: 'elite',
        description: 'Large, powerful gloomkin that smash through defenses.',
        attacks: ['bash_forward', 'punch'],
      },
      {
        id: 'gloom_parasite',
        name: 'Gloom Parasite',
        type: 'corrupted',
        description: 'Small parasitic creatures born from the Gloom.',
        attacks: ['strike'],
        notes: 'Boss-tier encounter. Drops unique hearts.',
      },
      {
        id: 'gloom_tentacle',
        name: 'Gloom Tentacle',
        type: 'corrupted',
        description: 'Writhing appendages of the Gloom that emerge from the ground.',
        attacks: ['strike', 'spit', 'sweep'],
      },
      {
        id: 'thorn_husk',
        name: 'Thorn Husk',
        type: 'corrupted',
        description: 'Plant-like husks covered in thorns.',
        attacks: ['strike'],
      },
      {
        id: 'melee_thorn_husk',
        name: 'Thorn Husk (Melee)',
        type: 'corrupted',
        description: 'A more aggressive thorn husk that closes to melee range.',
        attacks: ['strike'],
      },
      {
        id: 'swamp_husk',
        name: 'Swamp Husk',
        type: 'corrupted',
        description: 'Corrupted humanoids lurking in swamp areas.',
        attacks: ['strike'],
        variants: ['unique'],
        notes: 'Unique variant is Char Root.',
      },
      {
        id: 'undead_destroyer',
        name: 'Undead Destroyer',
        type: 'corrupted',
        description: 'A hulking corrupted abomination.',
        attacks: ['strike', 'slam'],
      },
    ],
  },

  // ── PLANTS ─────────────────────────────────────────────────────────────────
  // Animated plant and nature creatures that attack unwary travelers.
  {
    category: 'plants',
    label: 'Plants',
    description: 'Animated plant and nature creatures that attack unwary travelers.',
    icon: '🌿',
    enemies: [
      {
        id: 'bramblehusk',
        name: 'Bramblehusk',
        type: 'plant',
        description: 'A thorny plant creature that lies dormant until disturbed. Uses burrowing and thorn attacks to ambush prey.',
        attacks: ['strike', 'thorns'],
        behaviors: ['burrow', 'awake'],
        guid: '81396e6df39205840a9e94bb74f6b82e',
      },
      {
        id: 'melee_bramblehusk',
        name: 'Bramblehusk (Melee)',
        type: 'plant',
        description: 'An aggressive bramblehusk that charges into melee.',
        attacks: ['strike', 'thorns'],
      },
      {
        id: 'bramblehusk_guard',
        name: 'Bramblehusk Guard',
        type: 'plant', tier: 'elite',
        description: 'A larger, more dangerous bramblehusk protecting an area.',
        attacks: ['strike', 'thorns'],
      },
      {
        id: 'unique_bramblehusk',
        name: 'Unique Bramblehusk',
        type: 'plant', tier: 'unique',
        description: 'A unique variant of bramblehusk with enhanced abilities.',
        attacks: ['strike', 'thorns'],
        guid: '5dbd342b530fbdb4aa253ba77f7db5af',
        notes: 'Known as Old Granddad in-game. Slower movement but more power.',
      },
    ],
  },

  // ── CREATURES ──────────────────────────────────────────────────────────────
  // Various beasts and monsters that roam the wilds and dungeons.
  {
    category: 'creatures',
    label: 'Creatures',
    description: 'Various beasts and monsters that roam the wilds and dungeons.',
    icon: '🐛',
    enemies: [
      {
        id: 'blight_roach',
        name: 'Blight Roach',
        type: 'beast',
        description: 'Blighted insects infesting corrupted areas.',
        attacks: ['strike'],
      },
      {
        id: 'giant_blight_roach',
        name: 'Giant Blight Roach',
        type: 'beast', tier: 'elite',
        description: 'Massive blight roach posing a significant threat.',
        attacks: ['strike'],
      },
      {
        id: 'beetle',
        name: 'Beetle',
        type: 'beast',
        description: 'Large insects found in dark caves and swamps.',
        attacks: ['strike', 'spit'],
        guid: '94ad53c8429e9ed498e6e4aef8eb0590',
      },
      {
        id: 'death_beetle',
        name: 'Death Beetle',
        type: 'beast',
        description: 'A larger, more dangerous beetle species.',
        attacks: ['strike', 'spit'],
      },
      {
        id: 'giant_death_beetle',
        name: 'Giant Death Beetle',
        type: 'beast', tier: 'elite',
        description: 'Massive beetle that poses a significant threat.',
        attacks: ['strike', 'spit'],
      },
      {
        id: 'crypt_roach',
        name: 'Crypt Roach',
        type: 'beast',
        description: 'Oversized roaches that infest crypts and tombs.',
        attacks: ['strike'],
      },
      {
        id: 'gulpjaw_cave_salamander',
        name: 'Gulpjaw (Cave Salamander)',
        type: 'beast',
        description: 'A cave-dwelling gulpjaw variant with salamander traits.',
        attacks: ['strike'],
      },
      {
        id: 'seafang',
        name: 'Seafang',
        type: 'beast',
        description: 'A vicious aquatic predator found near coastal and underwater areas.',
        attacks: ['melee', 'bite'],
        notes: 'Appears in Normal, Elite, Champion, and Champion Minion rarities.',
      },
      {
        id: 'zhark',
        name: 'Zhark',
        type: 'beast',
        description: 'A fearsome creature native to Darkhaven.',
        attacks: ['melee'],
        notes: 'Appears in Normal, Elite, and Champion rarities.',
      },
      {
        id: 'mana_crystal',
        name: 'Mana Crystal',
        type: 'construct',
        description: 'Magical crystals that animate and attack nearby intruders.',
        attacks: ['magical_pulse'],
        notes: 'Not a traditional beast — counted in kill log but excluded from bestiary achievements.',
      },
    ],
  },

  // ── NAMED / UNIQUE BOSSES ──────────────────────────────────────────────────
  // Fixed world encounters and named champions with their own identities.
  {
    category: 'named',
    label: 'Named & Unique',
    description: 'Fixed world encounters, named champions, and unique bosses with distinct identities.',
    icon: '⭐',
    enemies: [
      {
        id: 'narlathak',
        name: 'Narlathak',
        type: 'undead', tier: 'boss',
        description: 'The Necropolis Lich — a tremendously powerful undead sorcerer ruling the Necropolis.',
        attacks: ['fire_missile', 'frost_missile', 'lightning_charged_bolt', 'shadow_missile', 'meteor'],
        notes: '"Lum made me do it" — kill once. "Doomslayer" — kill 666 times.',
      },
      {
        id: 'old_granddad',
        name: 'Old Granddad',
        type: 'plant', tier: 'unique',
        description: 'The Unique Bramblehusk. An ancient plant entity of tremendous power.',
        attacks: ['strike', 'thorns'],
      },
      {
        id: 'rokkudokin',
        name: 'Rokkudokin',
        type: 'goblinoid', tier: 'unique',
        description: 'The Bogie Feral Unique — a legendary feral bogie of terrifying strength.',
        attacks: ['melee'],
      },
      {
        id: 'warren_chief',
        name: 'Warren Chief',
        type: 'goblinoid', tier: 'unique',
        description: 'The Bogie Tyrant Unique — supreme leader of the bogie warrens.',
        attacks: ['magic', 'melee', 'meteor'],
      },
      {
        id: 'blubberjaw',
        name: 'Blubberjaw',
        type: 'aberration', tier: 'unique',
        description: 'The Gulpjaw Unique — a massive, grotesque aberration.',
        attacks: ['strike'],
      },
      {
        id: 'char_root',
        name: 'Char Root',
        type: 'corrupted', tier: 'unique',
        description: 'The Melee Swamp Husk Unique — a twisted, burning plant creature.',
        attacks: ['strike'],
      },
      {
        id: 'goke_the_intruder',
        name: 'Goke the Intruder',
        type: 'aberration', tier: 'unique',
        description: 'The Mega Gazer — a truly enormous floating eye aberration.',
        attacks: ['beam'],
      },
      {
        id: 'council_of_five',
        name: 'Council of Five',
        type: 'undead', tier: 'unique',
        description: 'The Skeleton Shadow Mage Unique — five shadow mages merged into one entity.',
        attacks: ['shadow_missile'],
      },
      {
        id: 'riptide_horror',
        name: 'Riptide Horror',
        type: 'aberration', tier: 'unique',
        description: 'The Unique Deep Ones — an ancient terror from the deepest waters.',
        attacks: ['melee'],
      },
      {
        id: 'disgraced_paladin',
        name: 'Disgraced Paladin',
        type: 'undead', tier: 'unique',
        description: 'The Barrow Knight 1H Slashing Unique — a fallen holy warrior condemned to walk as undead.',
        attacks: ['slashing_strike'],
      },
      // Named Champions (world-placed, not random spawns)
      {
        id: 'baragon',
        name: 'Baragon',
        type: 'named', tier: 'named',
        description: 'A fixed-world named champion encounter.',
        attacks: ['melee'],
      },
      {
        id: 'burial_knight',
        name: 'Burial Knight',
        type: 'named', tier: 'named',
        description: 'A fixed-world named champion encounter.',
        attacks: ['melee'],
      },
      {
        id: 'clonus_horror',
        name: 'Clonus Horror',
        type: 'named', tier: 'named',
        description: 'A fixed-world named horror champion.',
        attacks: ['melee'],
      },
      {
        id: 'salazar',
        name: 'Salazar',
        type: 'named', tier: 'named',
        description: 'A fixed-world named champion.',
        attacks: ['melee'],
      },
      {
        id: 'tunnel_thug',
        name: 'Tunnel Thug',
        type: 'named', tier: 'named',
        description: 'A named thug guarding the tunnels.',
        attacks: ['melee'],
      },
      {
        id: 'named_gulpjaw',
        name: 'Named Gulpjaw',
        type: 'named', tier: 'named',
        description: 'A fixed-world named gulpjaw champion.',
        attacks: ['strike'],
      },
    ],
  },

];

// ── Helper: flat enemy lookup by id ────────────────────────────────────────
const BESTIARY_BY_ID = Object.fromEntries(
  BESTIARY.flatMap(cat => cat.enemies.map(e => [e.id, { ...e, category: cat.category, categoryLabel: cat.label }]))
);

// ── Expose as window globals ───────────────────────────────────────────────
if (typeof window !== 'undefined') {
  window.BESTIARY       = BESTIARY;
  window.BESTIARY_BY_ID = BESTIARY_BY_ID;
}
