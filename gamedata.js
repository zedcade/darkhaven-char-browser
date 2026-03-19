// gamedata.js — Darkhaven static game data: display maps, colours, class config
// ---------------------------------------------------------------------------
// Provides all lookup tables and display constants consumed by maxparser.js
// and app.js. Edit this file to update names, colours, and mappings.
// No game logic lives here — pure data only.
//
// Exports (window globals):
//   CLASS_CONFIG           — class blueprints / branches / base stats
//   STAT_GUIDS             — stat GUID → key constants
//   ITEM_FIND_TYPES        — item-find sub-type prototype GUIDs
//   CONTAINERS             — container type GUIDs
//   DAMAGE_TYPE_GUIDS      — damage-type prototype GUIDs → short key
//   SLOT_INDEX_TO_KEY      — equipment slot index → slot key
//   SLOT_DISPLAY           — slot key → human label
//   TATTOO_SLOT_INDEX      — tattoo slot index → slot name
//   MOB_DISPLAY_NAMES      — DH_GUIDS name → kill-log display name
//   HEART_NAMES_MAP        — DH_GUIDS name → heart display base name
//   UNIQUE_HEART_MONSTERS  — Set of DH_GUIDS names that drop unique hearts
//   CANONICAL_WT           — normalizeName canonical overrides
//   RARITY_COLORS          — rarity label → hex colour (item quality)
//   RARITY_KILL_COLORS     — rarity label → hex colour (kill log)
//   RARITY_KILL_ORDER      — rarity label → sort order integer (kill log)
//   RARITY_DOT_COLOR       — rarity label → hex colour (achievement dots)
//   GEM_COLOR              — gem type → hex colour
//   DYE_COLOR_NAMES        — internal colour string → dye display name
//   DYE_TOKEN_COLORS       — dye name / channel token → CSS colour
//   DMG_COLORS             — damage type → hex colour
//   SLOT_GRID              — slot key → {col, row} in paperdoll grid
//   SLOT_ICON              — slot key → emoji icon
//   CAT_ICON               — legendary category → emoji icon
// ---------------------------------------------------------------------------

// ── Class definitions ──────────────────────────────────────────────────────
// blueprints: unit blueprint GUIDs that identify this class on units[0]
// branches:   skill-branch GUIDs used as a fallback class detector
// baseStats:  base stats added to whatever is stored in the save file
const CLASS_CONFIG = {
  Witch:        { blueprints: ['b14a45f43b3c7a740909d3601389b966'],
                  branches:   ['98d71cb016bc09c4299218b103d51941','86f24eb25dd7cae44a2065e622727df5','8adfe3bf7439a9341831c5fa90e81a67'],
                  baseStats:  { strength:20, dexterity:30, magic:30, vitality:25, attack:20, healthMax:5, manaMax:10 } },
  Crusader:     { blueprints: [],
                  branches:   [],
                  baseStats:  { strength:30, dexterity:20, magic:15, vitality:25, attack:30, healthMax:20, manaMax:0 } },
  Hunter:       { blueprints: [],
                  branches:   [],
                  baseStats:  { strength:25, dexterity:30, magic:15, vitality:20, attack:30, healthMax:10, manaMax:5 } },
  Technomancer: { blueprints: [],
                  branches:   [],
                  baseStats:  { strength:15, dexterity:25, magic:20, vitality:30, attack:25, healthMax:15, manaMax:10 } },
};

// ── Stat GUIDs ─────────────────────────────────────────────────────────────
const STAT_GUIDS = {
  PROPERNAME:        'b00f3f85f9ff6674d933093f1689bd9d',
  RARE_NAME:         '528fde312ad42d949a4847aa7ecc794b',
  LEVEL:             '58f688979805ad9448dd76c47394f635',
  EXPERIENCE:        '9509ba7b24ce0f844a22044dbc6e9a02',
  EXPERIENCE_NEXT:   'deba83f3d94a6e74faff8758c91df000',
  GOLD:              'e098506db56ab944794ce132ced2ea51',
  STONE:             'e2fca4e0f5f710446a6e4b44bd62a543',
  FLASK:             '446ee239b53115146a9e009f93f66ed5',
  FREE_FLASK:        '4af3c8c45eb30ab43b44505e4269fe8c',
  COMPOSITION:       '0b79b14976142af4a82d47d671f8172a',
  STRENGTH_BASE:     '6af4197f9df6cec4da7a18c6550d8696',
  DEXTERITY_BASE:    '6c31e84f2c7080440adeda7dec6abb56',
  MAGIC_BASE:        'a30b17b90d023f9449fce3c7735c2be9',
  VITALITY_BASE:     '6fe46d231b86bbe4e9cd3459c27f49ba',
  ATTACK_BASE:       '367bb8e76ee8a504a9c9eb76e1113e71',
  HEALTH:            'a12ff07e0f2eb2c458c46d895b3e984f',
  HEALTH_BASE:       'd935659c0a572ad4f91b0eb5149d899e',
  MANA:              'a1a41762eced5bf4eb07e65cb7fbed7e',
  MANA_BASE:         'e9910e346fbe25b459be261da9edc8ba',
  STAMINA:           'b952e7d961c1ee44fb4942edfe7f1f62',
  STAMINA_REGEN:     '851b7e40a03cdd544b983815849e7284',
  KILL_COUNTER:      'a3ecebb06794f564496a2e590a885145',
  KILLED_BY:         '64d4a87359cf9b94c9a496f0fec0880e',
  QUALITY:           '4a9f733126bc51442aa34b4a1c19bf63',
  ARMOR_BASE:        'ae186ac8917738a4d8272dca68d1f11c',
  IDENTIFIED:        'c86d0c41819c87f468f07dfb4f9df799',
  SOCKETS:           'b5a15f51cf6e00f4d924f5fec4a77a81',
  DMG_BASE_MIN:      'bebbd894bd559054f9dadcce9d78799a',
  DMG_BASE_MAX:      '0346077fcd461a54ba2b3dff55c0eb26',
  DMG_TYPE:          '9f9c320d8621b1047a69df8473d712c9',
  QUANTITY:          'ff480aacdcf23da4fb7f4216650961ab',
  EQUIP_ASPECT:      '4dccf3c1179ea3e4fb57240b3727d777',
  ITEM_MARK:         '5e8c72abf6d0350419aa7060edf20843',
  ITEM_PROG_REQ:     '5597d3540a0445f4eb67aa1ef5016dfb', // attr tome tier (long=1→I, 2→II)
  SKILL_TOME_REQ:    '92f5b0b797fcb204c8d048860eefb9e3', // skill tome tier (long=1→I, 2→II)
  STAT_REQ_BASE:     '0dc8cc7fc99c9734ca589b1ac7cd2d81', // attribute requirement value
  ATTACK:            '57d40243ca69cdc4293ab75783630ea9',
  EQUIP_ARMOR_BONUS: '0a44e6405a78a754390879f7dc500bf2',
  EQUIP_ARMOR_PCT:   'e3e0fd5ff5f469e43bdc2de52678b9c6',
  SKILL_BRANCH:      'be5801ab1de1c754e875c80e4cdc5260',
  RESISTANCE:        'fe9add0c2727d3c409ec60640cd420f0',
  PENETRATION:       'fce128493e8e2e8498616d6c73c35556',
  CRIT_CHANCE:       'f1888e2481817cf4cb0f2e000974df58',
  ATTACK_SPEED_MULT: '72a9c1d23b5aaa64bab15c8c5b7128fb', // e.g. 0.20 = +20%
  CAST_SPEED_MULT:   'ffa90dc178405304c9adcc1fec04bf36', // e.g. 0.14 = +14%
  CRIT_RESISTANCE:   '2422fdf6009941846aefa30e599d1254',
  MOVE_SPEED:        'b4f373c86515b1c4c8389c944ecb579b',
  WATER_WALKING:     '0e18262ae2504484c83a8feed23fd016',
  MAGIC_FIND:        '41edf57e3ff5689449a522ff28d4cf0a',
  GOLD_FIND:         '7dc4f108eb38fb44196ffd73a9f573ac',
  ITEM_FIND:         '29ced5a857c129d4298c238cfade2de2',
  EQUIP_CRIT_CHANCE: '8835ea40499ac5c45a949ccce7cd1be5',
  STAMINA_MAX:       'b8f43645839918c4b9328c71c5913577',
  STAMINA_BASE:      'c08bf0311c3d70842b17980f9518887a',
  STRENGTH_BONUS:    '90ca4ade65d73094084afb2524dd18bc',
  DEXTERITY_BONUS:   '8c6f382fc62e7a54abd32f04f6e67720',
  VITALITY_BONUS:    '646f85f5ebfa69947b558bdbd96c1331',
  HEALTH_BONUS:      '15261ada67c566a41ba01af15881152f',
  MANA_MAX_BONUS:    '7b8688dfc705e5a4795434a96f5faf88',
  MANA_REGEN:        '8834f016bd6cc3547b3a540212a96a47',
  FEATHER_FALLING:   '08085d1e3fcea624481f889ef6bf8329',
  MAGIC_BONUS:       'c76898bb84052c34c8a67bc3d0005878',
  MANA_ITEM_BONUS:   'de2fbbe8f89763b438b6eb80dce68361',
  CORE_SOURCE:       '67076e158ac595f45bc47c336b436b7d', // unitblueprint = monster that dropped the heart
  STR_INTRINSIC:     '9611aa13f24c978439ddd12e3d984000',
  DEX_INTRINSIC:     '2ad1e03444d0a1a49bc5438d073cfa3b',
  VIT_INTRINSIC:     'fbc8a101f047da24abaeb498ad22343c',
  MAG_INTRINSIC:     '38f897fd5d349c743b8f7a213b9072da',
};

// ── Item-find sub-type prototype GUIDs ─────────────────────────────────────
const ITEM_FIND_TYPES = {
  GEM:        'a0a483f116687984d987f66fb3bcb0af',
  HEALTH_ORB: 'cc413285852203b41b340769e8394c5d',
  MANA_ORB:   '76e6acaf15611074880f0383a1517cd2',
};

// ── Container type GUIDs ───────────────────────────────────────────────────
const CONTAINERS = {
  EQUIPMENT:     '0b50d10714d6c0c4bb7f5447dfb5a745',
  ALT_EQUIPMENT: '1d936ddad6b2af4418e3d46a2bc946ee',
  AFFIXES:       '864d7327e29b7464694ce0baf5bed2fd',
  BONUS_STATS:   '688a379c1b446ea40a944279e04382e8',
  STASH:         '3cc00cfe933e46344879c0f506594096',
};

// ── Damage type prototype GUIDs ────────────────────────────────────────────
const ALL_DAMAGE_TYPE_GUID = '99f2b799d71d7cb4ca4161e44224e4af';
const EL_KEYS_ALL = ['blunt','cold','fire','lightning','shadow','slashing'];
const DAMAGE_TYPE_GUIDS = {
  'bbe7b9d922575f5469ca80b9eeac9f02': 'blunt',
  'db1b573480f3568429f4dc8c70afeb7d': 'cold',
  '49c26b4693bceee48bb7695e3d6e6d76': 'fire',
  '59c4f390c4bfa4a4fa40dd370bb62244': 'lightning',
  '0d001a391d58dc34f99e415549444f66': 'shadow',
  '1952544644d9fad4993fe76109f43381': 'slashing',
};

// ── Equipment slot index → slot key ───────────────────────────────────────
const SLOT_INDEX_TO_KEY = {
  0:'hand_right', 1:'hand_left', 2:'chest', 3:'feet', 4:'head',
  5:'neck', 6:'finger_1', 7:'finger_2', 8:'hands', 9:'waist',
  10:'flask', 11:'hand_right_alt', 12:'hand_left_alt', 13:'hand_extra_alt', 14:'hand_extra_off'
};

// ── Slot key → human-readable label ───────────────────────────────────────
const SLOT_DISPLAY = {
  hand_right:'Main Hand',       hand_left:'Off Hand',         chest:'Chest',
  feet:'Boots',                 head:'Helm',                  neck:'Amulet',
  finger_1:'Ring 1',            finger_2:'Ring 2',            hands:'Gloves',
  waist:'Belt',                 flask:'Flask',
  hand_right_alt:'Alt Main Hand 1', hand_left_alt:'Alt Off Hand 1',
  hand_extra_alt:'Alt Main Hand 2', hand_extra_off:'Alt Off Hand 2',
};

// ── Tattoo (rune garment) slot indices ─────────────────────────────────────
const TATTOO_SLOT_INDEX = {
  15:'Crown',        16:'Heart',         17:'Core',        18:'Back',
  19:'Sacra',        20:'Right Shoulder',21:'Left Shoulder',22:'Right Arm',
  23:'Left Arm',     24:'Right Thigh',   25:'Left Thigh',  26:'Right Calf',
  27:'Left Calf'
};

// ── Kill-log display name overrides ────────────────────────────────────────
// Keyed by DH_GUIDS name string (all variant GUIDs share the same string value).
const MOB_DISPLAY_NAMES = {
  'Barrow Knight 1H Slashing Unique Unit': 'Disgraced Paladin',
  'Bogie Feral Unique Unit':               'Rokkudokin',
  'Bogie Tyrant Unique Unit':              'Warren Chief',
  'Gulpjaw Unique Unit':                   'Blubberjaw',
  'Melee Swamp Husk Unique Unit':          'Char Root',
  'Mega Gazer Unit':                       'Goke the Intruder',
  'Necropolis Lich Boss Unit':             'Narlathak',
  'Skeleton Shadow Mage Unique Unit':      'Council of Five',
  'Unique Bramblehusk Unit':               'Old Granddad',
  'Unique Deep Ones Unit':                 'Riptide Horror',
  'Leviathan Unique Unit':                 'Leviathan',
};

// ── Heart source name → base display name ─────────────────────────────────
const HEART_NAMES_MAP = {
  'Blight Roach Unit':                   'Blight Roach',
  'Bogie Chopper Unit':                  'Bogie Chopper',
  'Bogie Feral Unit':                    'Bogie Feral',
  'Bogie Spearman Unit':                 'Bogie Spearman',
  'Doomed Soldier 2H Spear Unit':        'Doomed Soldier',
  'Giant Blight Roach Unit':             'Giant Blight Roach',
  'Gloom Parasite Unit':                 'Gloom Parasite',
  'Gulpjaw Unit':                        'Gulpjaw',
  'Skeleton Frost Mage Unit':            'Skeleton Frost Mage',
  'Tunnel Thug Unit':                    'Tunnel Thug',
  // Unique bosses
  'Barrow Knight 1H Slashing Unique Unit': 'Disgraced Paladin',
  'Bogie Feral Unique Unit':             'Rokkudokin',
  'Bogie Tyrant Unique Unit':            'Warren Chief',
  'Gulpjaw Unique Unit':                 'Blubberjaw',
  'Melee Swamp Husk Unique Unit':        'Char Root',
  'Mega Gazer Unit':                     'Goke the Intruder',
  'Necropolis Lich Boss Unit':           'Narlathak',
  'Skeleton Shadow Mage Unique Unit':    'Council of Five',
  'Unique Bramblehusk Unit':             'Old Granddad',
  'Unique Deep Ones Unit':               'Riptide Horror',
  'Leviathan Unique Unit':               'Leviathan',
};

// ── Unique heart-drop monsters ─────────────────────────────────────────────
// These use the core_unique_{element}_heart.png image convention
const UNIQUE_HEART_MONSTERS = new Set([
  'Barrow Knight 1H Slashing Unique Unit',  // Disgraced Paladin
  'Bogie Feral Unique Unit',                // Rokkudokin
  'Gulpjaw Unique Unit',                    // Blubberjaw
  'Melee Swamp Husk Unique Unit',           // Char Root
  'Mega Gazer Unit',                        // Goke the Intruder
  'Necropolis Lich Boss Unit',              // Narlathak
  'Skeleton Shadow Mage Unique Unit',       // Council of Five
  'Unique Bramblehusk Unit',                // Old Granddad
  'Gloom Parasite Unit',                    // Gloom Parasite
  'Unique Deep Ones Unit',                  // Riptide Horror
]);

// ── Canonical item name overrides ─────────────────────────────────────────
// Used by normalizeName() — only entries where auto-logic produces wrong output.
const CANONICAL_WT = {
  'Cloth Armor':                'Tunic',
  'Moccasins Boots':            'Moccasins',
  'Cinderstep Clompers Boots':  'Cinderstep Clompers',
  'Wavewalkers Boots':          'Wavewalkers',
  'Studded Leather Bootss':     'Studded Leather Boots', // double-s blueprint bug
  'Hood Helm':                  'Hood',
  'Soft Leather Helm':          'Soft Leather Veil',
  'Hard Leather Helm':          'Hard Leather Mask',
  'Studded Leather Helm':       'Studded Leather Cap',
  'Shadowgrips Gloves':         'Shadowgrips',
  'Buckler Shield':             'Buckler',
  'Targe Shield':               'Targe',
  'Banded Heater Shield':       'Banded Heater',
  'Knife Dagger':               'Knife',
  'Sacrificial Knife Dagger':   'Sacrificial Knife',
  'Bodkin Dagger':              'Bodkin',
  'Gibbering Stabber Dagger':   'Gibbering Stabber',
  'Ripfury Claw Dagger':        'Ripfury Claw',
  'Poignard Dagger':            'Poignard',
  'Duskshear Dagger':           'Duskshear',
  'Snagtooth Pike Staff':       'Snagtooth Pike',
  'Tyrant Staff':               "Tyrant's Staff",
  'Ring 01':                    'Ring',
  'Ring 02':                    'Ring',
};

// ── Rarity colours — item quality ─────────────────────────────────────────
const RARITY_COLORS = {
  Legendary:     '#c9784c',
  Extraordinary: '#e07b39',
  Rare:          '#c9a84c',
  Magic:         '#4c8fc9',
  Common:        '#aaaaaa',
  Inferior:      '#666666',
  Runeword:      '#5bc4a8',
};

// ── Rarity colours — kill log ──────────────────────────────────────────────
const RARITY_KILL_COLORS = {
  Named:            '#fbbf24',
  Unique:           '#d4a84b',
  Boss:             '#f87171',
  Champion:         '#c084fc',
  'Champion Minion':'#a855f7',
  Elite:            '#60a5fa',
  Normal:           '#9ca3af',
};

// ── Rarity sort order — kill log ───────────────────────────────────────────
const RARITY_KILL_ORDER = {
  Named:0, Unique:1, Boss:2, Champion:3, 'Champion Minion':4, Elite:5, Normal:6
};

// ── Rarity colours — achievement dots ─────────────────────────────────────
const RARITY_DOT_COLOR = {
  Normal:           '#9ca3af',
  Elite:            '#60a5fa',
  Champion:         '#c084fc',
  'Champion Minion':'#a855f7',
  Unique:           '#d4a84b',
  Boss:             '#f87171',
  Named:            '#fbbf24',
};

// ── Gem colours ────────────────────────────────────────────────────────────
const GEM_COLOR = {
  amber: '#e8a040',
  lapis: '#4488dd',
  jade:  '#44aa66',
  ruby:  '#cc3344',
  opal:  '#e8e4d4',
  onyx:  '#7a7d85',
};

// ── Dye name maps ──────────────────────────────────────────────────────────
// Internal colour string → dye display name (mirrors maxparser _DYE_NAMES)
const DYE_COLOR_NAMES = {
  'Orange Brown Copper':      'Achiote',
  'Green Blue Steel':         'Cadet',
  'Red Black Steel':          'Cardinal',
  'Red White Copper':         'Cinnibar',
  'Black White Bronze':       'Eventide',
  'Yellow Black Copper':      'Hornet',
  'Blue Orange Bronze':       'Kingfisher',
  'Brown Yellow Copper':      'Lion',
  'DarkBrown Orange Brass':   'Monarch',
  'DarkBlue Yellow Brass':    'Myrmidon',
  'White Blue Steel':         'Nimbus',
  'Black Red Silver':         'Queen of Night',
  'Purple Orange Bronze':     'Royal',
  'Tan Brown Brass':          'Serengeti',
  'LightPurple Green Bronze': 'Syringa',
  'Orange Black Steel':       'Tigress',
  'LightBlue Yellow Steel':   'Ursa Major',
};

// Approximate CSS colours for dye names and individual channel tokens
const DYE_TOKEN_COLORS = {
  'Achiote':'#c85c00',    'Cadet':'#4a7a9b',       'Cardinal':'#9b1c1c',
  'Cinnibar':'#e34234',   'Eventide':'#4b3f72',     'Hornet':'#c9a227',
  'Kingfisher':'#1d7d8c', 'Lion':'#c8922a',         'Monarch':'#5a189a',
  'Myrmidon':'#1e6b4a',   'Nimbus':'#7ec8e3',       'Queen of Night':'#1a0a2e',
  'Royal':'#2d4b8e',      'Serengeti':'#c68b17',    'Syringa':'#8a5a9e',
  'Tigress':'#c05a00',    'Ursa Major':'#2e4a7a',
  // Channel tokens
  'Black':'#1a1a1a',  'White':'#f0f0f0',  'Red':'#c0392b',    'Green':'#1d7a3a',
  'Blue':'#2060c8',   'DarkBlue':'#0d2a6e','DarkBrown':'#4a2c17','LightBlue':'#6ab4e8',
  'LightPurple':'#9b72c8','Orange':'#e07020','Yellow':'#d4b800', 'Purple':'#6a2ab0',
  'Tan':'#c4a46e',    'Brown':'#7a4a22',   'Silver':'#a8a8b8', 'Gold':'#c9a84c',
  'Brass':'#b5a020',  'Bronze':'#8b5e20',  'Copper':'#b87333', 'Steel':'#5a7898',
};

// ── Damage type colours ────────────────────────────────────────────────────
const DMG_COLORS = {
  Shadow:   '#9d6aff',
  Physical: '#e0c060',
  Fire:     '#ff7d44',
  Lightning:'#55aaff',
  Cold:     '#88ccff',
  Blunt:    '#c8a87a',
  Slashing: '#e8e8a0',
};

// ── Paperdoll grid layout ──────────────────────────────────────────────────
const SLOT_GRID = {
  // Row 0: Amulet / Helm / Flask
  neck:{col:0,row:0},    head:{col:1,row:0},    flask:{col:2,row:0},
  // Row 1: Ring 1 / Chest / Ring 2
  finger_1:{col:0,row:1}, chest:{col:1,row:1},  finger_2:{col:2,row:1},
  // Row 2: Main Hand / Belt / Off Hand
  hand_right:{col:0,row:2}, waist:{col:1,row:2}, hand_left:{col:2,row:2},
  // Row 3: Alt Main Hand 1 / Gloves / Alt Off Hand 1
  hand_right_alt:{col:0,row:3}, hands:{col:1,row:3}, hand_left_alt:{col:2,row:3},
  // Row 4: Alt Main Hand 2 / Boots / Alt Off Hand 2
  hand_extra_alt:{col:0,row:4}, feet:{col:1,row:4}, hand_extra_off:{col:2,row:4},
};

// ── Slot icons (emoji) ─────────────────────────────────────────────────────
const SLOT_ICON = {
  head:'🪖',       chest:'🧥',     hands:'🧤',    waist:'🔰',    feet:'👟',
  hand_right:'⚔️', hand_left:'🛡️',
  hand_right_alt:'⚔️', hand_left_alt:'🛡️',
  hand_extra_alt:'⚔️', hand_extra_off:'🛡️',
  neck:'📿',       finger_1:'💍',  finger_2:'💍', flask:'🧪',
};

// ── Legendary category icons (emoji) ──────────────────────────────────────
const CAT_ICON = {
  Amulets:'📿', Belts:'🔰',  Boots:'👟', Chest:'🧥',    Daggers:'🗡️',
  Flasks:'🧪',  Gloves:'🧤', Helms:'🪖', Rings:'💍',    Shields:'🛡️',
  Staves:'🪄',
};

// ── Stash grid size per slot ───────────────────────────────────────────────
// Used by itemGridSize() in app.js
const SLOT_SIZE = {
  chest:{w:2,h:3}, hands:{w:2,h:2}, feet:{w:2,h:2}, head:{w:2,h:2},
  waist:{w:2,h:1}, flask:{w:1,h:1},
  neck:{w:1,h:1},  finger_1:{w:1,h:1}, finger_2:{w:1,h:1},
  hand_right:{w:1,h:2},  hand_left:{w:2,h:2},
  hand_right_alt:{w:1,h:2}, hand_left_alt:{w:2,h:2},
  hand_extra_alt:{w:1,h:2}, hand_extra_off:{w:2,h:2},
  gloves:{w:2,h:2}, boots:{w:2,h:2},
  mainhand:{w:1,h:2}, offhand:{w:2,h:2}, twohand:{w:1,h:4},
  belt:{w:2,h:1}, rune:{w:1,h:1}, gem:{w:1,h:1}, dye:{w:1,h:1}, core:{w:1,h:1},
  ring:{w:1,h:1}, tome:{w:2,h:2},
};

// ── Blueprint → Dye display name ───────────────────────────────────────────
// Catalogue-prototype GUIDs for dye items (some save variants use per-dye blueprints)
const DYE_BP = {
  'd55d2c9357213b4ee89318df52b30bc4': 'Cadet',
  'f33b0a9357213b4ee89318df52b30bc4': 'Cinnibar',
  'c34d9a9357213b4ee89318df52b30bc4': 'Eventide',
  'e22a9f9357213b4ee89318df52b30bc4': 'Hornet',
  'b23c8f9357213b4ee89318df52b30bc4': 'Kingfisher',
  'f67a2d9357213b4ee89318df52b30bc4': 'Lion',
  'b13c8f8d227448e89318df52b30bc412': 'Monarch',
  'e89c4f9357213b4ee89318df52b30bc4': 'Nimbus',
  'f90d5f9357213b4ee89318df52b30bc4': 'Queen of Night',
  'e56f1c9357213b4ee89318df52b30bc4': 'Royal',
  'a44c1b9357213b4ee89318df52b30bc4': 'Serengeti',
  'd94acd9357213b4ee89318df52b30bc4': 'Syringa',
  'd45e0b9357213b4ee89318df52b30bc4': 'Tigress',
  'a78b3e9357213b4ee89318df52b30bc4': 'Ursa Major',
};

// ── Monster quality / rarity prototypes ───────────────────────────────────
// p1.prototype → rarity label in kill log
const MONSTER_QUALITY_NAMES = {
  'acf3446efb1da8447b30904f1afe5b32': 'Normal',          // Quality 0
  'd7c2f0ac5e51d5048b28d65444101d3d': 'Elite',           // Quality 1
  '4faab5fef94929d4e9afb693c2779851': 'Champion',        // Quality 2
  'a59730ab948719c44bce2770b1bc239f': 'Unique',          // Quality 3
  '6f595e9bbd735bd42bce7f10c600ef0a': 'Boss',            // Quality 4
  'f4a7ae79ec7cb1a48a50563b119a3158': 'Champion Minion', // Quality 5
  '3ecc4f6eb4d55d04186b6fb6d94db2c3': 'Named',           // Quality -1 (fixed world encounters)
};

// ── Affix stats to always skip in display ─────────────────────────────────
// GUIDs of stats that are structural/meta and should never be shown as affixes
const AFFIX_STAT_ALWAYS_SKIP_GUIDS = [
  '827e9d066c8d3764b84236e658d7b227', // Drop Orb On Kill Behavior
  '451c001d1f78ae8408c12934cc48ce07', // Wardrobe Garment Stat
  'e0ed6cff34fb2f5408d9ce980894a613', // Item Set Stat
];

// ── Unique socket slot prototype ───────────────────────────────────────────
const UNIQUE_SOCKET_SLOT_PROTO = '07826ea7c73d5df40b02785076596196';

// ── Expose as window globals ───────────────────────────────────────────────
if (typeof window !== 'undefined') {
  window.CLASS_CONFIG           = CLASS_CONFIG;
  window.STAT_GUIDS             = STAT_GUIDS;
  window.ITEM_FIND_TYPES        = ITEM_FIND_TYPES;
  window.CONTAINERS             = CONTAINERS;
  window.ALL_DAMAGE_TYPE_GUID   = ALL_DAMAGE_TYPE_GUID;
  window.EL_KEYS_ALL            = EL_KEYS_ALL;
  window.DAMAGE_TYPE_GUIDS      = DAMAGE_TYPE_GUIDS;
  window.SLOT_INDEX_TO_KEY      = SLOT_INDEX_TO_KEY;
  window.SLOT_DISPLAY           = SLOT_DISPLAY;
  window.TATTOO_SLOT_INDEX      = TATTOO_SLOT_INDEX;
  window.MOB_DISPLAY_NAMES      = MOB_DISPLAY_NAMES;
  window.HEART_NAMES_MAP        = HEART_NAMES_MAP;
  window.UNIQUE_HEART_MONSTERS  = UNIQUE_HEART_MONSTERS;
  window.CANONICAL_WT           = CANONICAL_WT;
  window.RARITY_COLORS          = RARITY_COLORS;
  window.RARITY_KILL_COLORS     = RARITY_KILL_COLORS;
  window.RARITY_KILL_ORDER      = RARITY_KILL_ORDER;
  window.RARITY_DOT_COLOR       = RARITY_DOT_COLOR;
  window.GEM_COLOR              = GEM_COLOR;
  window.DYE_COLOR_NAMES        = DYE_COLOR_NAMES;
  window.DYE_TOKEN_COLORS       = DYE_TOKEN_COLORS;
  window.DYE_BP                 = DYE_BP;
  window.DMG_COLORS             = DMG_COLORS;
  window.SLOT_GRID              = SLOT_GRID;
  window.SLOT_ICON              = SLOT_ICON;
  window.CAT_ICON               = CAT_ICON;
  window.SLOT_SIZE              = SLOT_SIZE;
  window.MONSTER_QUALITY_NAMES  = MONSTER_QUALITY_NAMES;
  window.AFFIX_STAT_ALWAYS_SKIP_GUIDS = AFFIX_STAT_ALWAYS_SKIP_GUIDS;
  window.UNIQUE_SOCKET_SLOT_PROTO     = UNIQUE_SOCKET_SLOT_PROTO;
}
