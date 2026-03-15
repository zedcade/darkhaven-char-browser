// maxparser.js — Darkhaven .max save file parser
// ---------------------------------------------------------------------------
// CLASS DEFINITIONS
// Class is detected by matching units[0].blueprint against blueprints array,
// or falling back to skill branch GUIDs. Base stats (including dexterity)
// come from here — they are NOT stored directly in the save file.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// STAT GUIDs
// ---------------------------------------------------------------------------
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
  // Detailed stats
  RESISTANCE:        'fe9add0c2727d3c409ec60640cd420f0',
  PENETRATION:       'fce128493e8e2e8498616d6c73c35556',
  CRIT_CHANCE:       'f1888e2481817cf4cb0f2e000974df58',
  ATTACK_SPEED_MULT: '72a9c1d23b5aaa64bab15c8c5b7128fb',  // multiplier e.g. 0.20 = +20%
  CAST_SPEED_MULT:   'ffa90dc178405304c9adcc1fec04bf36',  // e.g. 0.14 = +14%
  CRIT_RESISTANCE:   '2422fdf6009941846aefa30e599d1254',
  MOVE_SPEED:        'b4f373c86515b1c4c8389c944ecb579b',
  WATER_WALKING:     '0e18262ae2504484c83a8feed23fd016',
  MAGIC_FIND:        '41edf57e3ff5689449a522ff28d4cf0a',
  GOLD_FIND:         '7dc4f108eb38fb44196ffd73a9f573ac',
  ITEM_FIND:         '29ced5a857c129d4298c238cfade2de2',
  EQUIP_CRIT_CHANCE: '8835ea40499ac5c45a949ccce7cd1be5',
  STAMINA_MAX:       'b8f43645839918c4b9328c71c5913577',
  STAMINA_BASE:      'c08bf0311c3d70842b17980f9518887a',
  // Additional affix stats
  STRENGTH_BONUS:    '90ca4ade65d73094084afb2524dd18bc',
  DEXTERITY_BONUS:   '8c6f382fc62e7a54abd32f04f6e67720',
  VITALITY_BONUS:    '646f85f5ebfa69947b558bdbd96c1331',
  HEALTH_BONUS:      '15261ada67c566a41ba01af15881152f',
  MANA_MAX_BONUS:    '7b8688dfc705e5a4795434a96f5faf88',
  MANA_REGEN:        '8834f016bd6cc3547b3a540212a96a47',
  FEATHER_FALLING:   '08085d1e3fcea624481f889ef6bf8329',
  MAGIC_BONUS:       'c76898bb84052c34c8a67bc3d0005878',
  MANA_ITEM_BONUS:   'de2fbbe8f89763b438b6eb80dce68361',
  CORE_SOURCE:       '67076e158ac595f45bc47c336b436b7d',  // unitblueprint = monster that dropped the heart
  // Per-attribute intrinsic bonuses (from consumable Tomes)
  STR_INTRINSIC:     '9611aa13f24c978439ddd12e3d984000',
  DEX_INTRINSIC:     '2ad1e03444d0a1a49bc5438d073cfa3b',
  VIT_INTRINSIC:     'fbc8a101f047da24abaeb498ad22343c',
  MAG_INTRINSIC:     '38f897fd5d349c743b8f7a213b9072da',
};

// ITEM_FIND sub-type prototype GUIDs
const ITEM_FIND_TYPES = {
  GEM:        'a0a483f116687984d987f66fb3bcb0af',
  HEALTH_ORB: 'cc413285852203b41b340769e8394c5d',
  MANA_ORB:   '76e6acaf15611074880f0383a1517cd2',
};

// Kill log display name overrides — keyed by DH_GUIDS name string.
// Each mob has multiple variant GUIDs so we key by name rather than GUID.
// All variant GUIDs share the same DH_GUIDS string value.
const _MOB_DISPLAY_NAMES = {
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
};

// Heart source monster BA name → base display name (prefix added based on blueprint rarity)
const _HEART_NAMES_MAP = {
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
  // Unique bosses — display names corrected per game data
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
};

// Unique heart drop monsters — these hearts use the core_unique_{element}_heart.png image convention
const _UNIQUE_HEART_MONSTERS = new Set([
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

// Resolve a heart's display name and rarity from source monster BP name + heart blueprint name.
// heartBpName: DH_GUIDS value for the heart's blueprint, e.g. "Core Champion Fire Item Unit"
// srcBpName:   DH_GUIDS value for the source monster,   e.g. "Bogie Tyrant Unique Unit"
function resolveHeartInfo(srcBpName, heartBpName) {
  let baseName = _HEART_NAMES_MAP[srcBpName];
  if (!baseName) {
    if (srcBpName) {
      baseName = srcBpName.replace(/\s*(Unique|Boss)?\s*Unit\s*$/i,'').replace(/\s+/g,' ').trim();
    } else {
      baseName = '???';
    }
  }
  // Rarity from the heart's own blueprint name
  let rarity = 'Common';
  if (/\bChampion\b/i.test(heartBpName))    rarity = 'Champion';
  else if (/\bElite\b/i.test(heartBpName))  rarity = 'Elite';
  else if (/\bUnique\b/i.test(heartBpName)) rarity = 'Unique';

  // Element from heart blueprint name (e.g. "Core Champion Fire Item Unit" → "fire")
  let element = 'fire';
  if (/\bCold\b/i.test(heartBpName))       element = 'cold';
  else if (/\bFire\b/i.test(heartBpName))  element = 'fire';
  else if (/\bLightning\b/i.test(heartBpName)) element = 'lightning';
  else if (/\bNature\b/i.test(heartBpName)) element = 'nature';
  else if (/\bShadow\b/i.test(heartBpName)) element = 'shadow';

  const prefix = rarity === 'Champion' ? 'Champion ' : rarity === 'Elite' ? 'Elite ' : '';
  const name   = prefix + baseName + ' Heart';
  const isUniqueSocket = _UNIQUE_HEART_MONSTERS.has(srcBpName);
  return { name, rarity, element, isUniqueSocket };
}

// Damage type prototype GUIDs → short key (alphabetical order for display)
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

const CONTAINERS = {
  EQUIPMENT:     '0b50d10714d6c0c4bb7f5447dfb5a745',
  ALT_EQUIPMENT: '1d936ddad6b2af4418e3d46a2bc946ee',
  AFFIXES:       '864d7327e29b7464694ce0baf5bed2fd',
  BONUS_STATS:   '688a379c1b446ea40a944279e04382e8',
  STASH:         '3cc00cfe933e46344879c0f506594096',
};

// Infer equipment slot from material/blueprint name (for stash items without explicit slot)
function inferSlotFromName(name) {
  const n = (name||'').toLowerCase().replace(/\d/g,'');
  if (/\bgem\b|\bcore\b|\bscroll\b|\bkey\b|\bdye\b|\bpotion\b/.test(n)) return null;
  if (/\bring\b/.test(n)) return 'ring';
  if (/\btome\b|\bbook\b/.test(n)) return 'tome';
  if (/\bamulet\b/.test(n)) return 'neck';
  if (/\bflask\b/.test(n)) return 'flask';
  if (/\bbelt\b|\bsash\b|\bwaist\b|\bcord\b|\bcincture\b/.test(n)) return 'waist';
  if (/\bglove|\bfist|\bhand\b/.test(n)) return 'hands';
  if (/\bboot|\bsabot|\bshoe|\bfoot|\bsole\b/.test(n)) return 'feet';
  if (/\bhelm|\bcap\b|\bcrown|\bhood|\bhat\b/.test(n)) return 'head';
  if (/\bshield|\bbuckler|\btarge|\bbucler|\bboard\b/.test(n)) return 'offhand';
  if (/\brobe|\bchest|\bvest|\btunic|\bharness|\barmor\b/.test(n)) return 'chest';
  if (/\bdagger|\bsword|\bmace|\baxe|\bwand|\bscepter|\bclub|\bknife|\bstabber\b|\bpoignard\b|\bbodkin\b|\bclaw\b/.test(n)) return 'mainhand';
  if (/\bstaff|\bbow|\bpolearm|\bhalberd|\bspear\b/.test(n)) return 'twohand';
  if (/\bbracers?\b|\bwrap\b/.test(n)) return 'wrists';
  return null;
}

// Equipment slot index
const SLOT_INDEX_TO_KEY = {
  0:'hand_right', 1:'hand_left', 2:'chest', 3:'feet', 4:'head',
  5:'neck', 6:'finger_1', 7:'finger_2', 8:'hands', 9:'waist',
  10:'flask', 11:'hand_right_alt', 12:'hand_left_alt', 13:'hand_extra_alt', 14:'hand_extra_off'
};

const SLOT_DISPLAY = {
  hand_right:'Main Hand', hand_left:'Off Hand', chest:'Chest', feet:'Boots',
  head:'Helm', neck:'Amulet', finger_1:'Ring 1', finger_2:'Ring 2',
  hands:'Gloves', waist:'Belt', flask:'Flask',
  hand_right_alt:'Alt Main Hand 1', hand_left_alt:'Alt Off Hand 1',
  hand_extra_alt:'Alt Main Hand 2', hand_extra_off:'Alt Off Hand 2',
};

// Tattoo (rune garment) slot indices in EQUIPMENT container
const TATTOO_SLOT_INDEX = {
  15:'Crown', 16:'Heart', 17:'Core', 18:'Back', 19:'Sacra',
  20:'Right Shoulder', 21:'Left Shoulder', 22:'Right Arm', 23:'Left Arm',
  24:'Right Thigh',    25:'Left Thigh',    26:'Right Calf',27:'Left Calf'
};
// ---------------------------------------------------------------------------
// GUID dictionaries (DH_GUIDS) defined in maxguids.js — load it before this file.
// QUALITY_GUIDS and LEGENDARY_AFFIX_NAMES are derived from DH_GUIDS at startup:
// ---------------------------------------------------------------------------

// Item quality GUID → rarity label, derived from DH_GUIDS "Item Quality N (Rarity)" entries
const QUALITY_GUIDS = Object.fromEntries(
  Object.entries(DH_GUIDS)
    .map(([k,v]) => { const m = v.match(/^Item Quality \d+ \((\w+)\)$/); return m ? [k, m[1]] : null; })
    .filter(Boolean)
);

// Legendary affix blueprint GUIDs → display name, derived from DH_GUIDS "Legendary XxxNN" entries
const LEGENDARY_AFFIX_NAMES = Object.fromEntries(
  Object.entries(DH_GUIDS).filter(([,v]) => /^Legendary \w+\d+$/.test(v))
);


// Stats to always skip entirely in affix display
const AFFIX_STAT_ALWAYS_SKIP = new Set([
  '827e9d066c8d3764b84236e658d7b227', // Drop Orb On Kill Behavior
  '451c001d1f78ae8408c12934cc48ce07', // Wardrobe Garment Stat
  'e0ed6cff34fb2f5408d9ce980894a613', // Item Set Stat
  STAT_GUIDS.LEVEL,
  STAT_GUIDS.QUALITY,
  STAT_GUIDS.SOCKETS,
  STAT_GUIDS.EQUIP_ASPECT,
  STAT_GUIDS.IDENTIFIED,
  STAT_GUIDS.ITEM_MARK,
  STAT_GUIDS.ITEM_PROG_REQ,
  STAT_GUIDS.SKILL_TOME_REQ,
  STAT_GUIDS.STAT_REQ_BASE,
  STAT_GUIDS.RARE_NAME,
  STAT_GUIDS.DMG_TYPE,     // shown as damageType on item, not as affix line
]);

// ---------------------------------------------------------------------------
// resolveSocketItemName() — pretty-print a socketed item's blueprint name
// Produces "Dull Jade" for gems, "Champion Fire Core" for cores, etc.
// ---------------------------------------------------------------------------
function resolveSocketItemName(bpName) {
  if (!bpName) return null;
  // Gem: "Gem Jade 03 Item Unit" → "Dull Jade"
  const gemM = bpName.match(/^Gem\s+(\w+)\s+0?(\d+)/i);
  if (gemM) {
    const type   = gemM[1].charAt(0).toUpperCase() + gemM[1].slice(1).toLowerCase();
    const level  = parseInt(gemM[2], 10);
    const GEM_LV = { 1:'Cracked', 2:'Flawed', 3:'Dull' };
    return (GEM_LV[level] || ('L'+level)) + ' ' + type;
  }
  // Core/Heart: "Core Champion Fire Item Unit" → "Champion Fire Core"
  const coreM = bpName.match(/^Core\s+(.+?)\s+Item/i);
  if (coreM) return coreM[1] + ' Core';
  // Rune: "Rune N Item Unit" → use name map
  const runeM = bpName.match(/^Rune\s+0?(\d+)/i);
  if (runeM) {
    const _RN = {'1':'Ash Rune','2':'Bat Rune','3':'Ka Rune','4':'Deb Rune','5':'Elm Rune'};
    return _RN[String(parseInt(runeM[1], 10))] || ('Rune ' + runeM[1]);
  }
  return normalizeName(bpName);
}

// ---------------------------------------------------------------------------
// normalizeName() 
// ---------------------------------------------------------------------------
// Canonical item name overrides — shared by normalizeName() and getItemTypeDisplay().
// Only needed where the automatic slot-keyword logic produces wrong output.
const _CANONICAL_WT = {
  // Chest — blueprint name differs from in-game display name
  'Cloth Armor':                'Tunic',
  // Boots — self-contained names (no "Boots" suffix needed)
  'Moccasins Boots':            'Moccasins',
  'Cinderstep Clompers Boots':  'Cinderstep Clompers',
  'Wavewalkers Boots':          'Wavewalkers',
  'Studded Leather Bootss':     'Studded Leather Boots', // double-s blueprint bug
  // Helms
  'Hood Helm':                  'Hood',
  'Soft Leather Helm':          'Soft Leather Veil',
  'Hard Leather Helm':          'Hard Leather Mask',
  'Studded Leather Helm':       'Studded Leather Cap',
  // Gloves
  'Shadowgrips Gloves':         'Shadowgrips',
  // Shields
  'Buckler Shield':             'Buckler',
  'Targe Shield':               'Targe',
  'Banded Heater Shield':       'Banded Heater',
  // Daggers
  'Knife Dagger':               'Knife',
  'Sacrificial Knife Dagger':   'Sacrificial Knife',
  'Bodkin Dagger':              'Bodkin',
  'Gibbering Stabber Dagger':   'Gibbering Stabber',
  'Ripfury Claw Dagger':        'Ripfury Claw',
  'Poignard Dagger':            'Poignard',
  'Duskshear Dagger':           'Duskshear',
  // Staves
  'Snagtooth Pike Staff':       'Snagtooth Pike',
  'Tyrant Staff':               "Tyrant's Staff",
  // Rings
  'Ring 01': 'Ring',
  'Ring 02': 'Ring',
};

function normalizeName(e) {
  if (!e) return '';
  let s = e
    .replace(/ Stat$/, '').replace(/ Damage Type$/, '')
    .replace(/^Item Quality \d+ \((\w+)\)$/, '$1')
    .replace(/^Monster Quality \d+ \((\w+)\)$/, '$1')
    .replace(/ Skill Branch$/, '').replace(/ Skill Option$/, '')
    .replace(/ Item Progression Prototype$/, '')
    .replace(/ Skill Unit$/, '').replace(/ Affix Unit$/, '')
    .replace(/ Item Unit$/, '').replace(/ Armor Unit$/, '')
    .replace(/ Weapon Unit$/, '').replace(/ Unit$/, '')
    // Dye: "Dye Black Red Silver Appearance Aspect" → "Black Red Silver"
    .replace(/^Dye\s+(.+?)\s+Appearance Aspect$/, '$1')
    .replace(/^(.+?)\s+Appearance Aspect$/, '$1')
    // Gem: "Gem Amber 01" → keep as-is (but strip trailing digit from short names)
    .replace(/([A-Za-z])\d+$/, '$1')
    .trim();
  // Strip leading/trailing spaces from word-only digit patterns
  // Strip leading slot-type prefix like "Belt03 ", "Boots06 ", "Helm06 "
  // but re-append the slot keyword if the remaining name doesn't include it
  {
    const pm = s.match(/^([A-Za-z]+)\s?\d+\s+(.*)/);
    if (pm) {
      const slotWord = pm[1]; // e.g. "Belt", "Boots", "Helm", "Chest", "Ring"
      const rest     = pm[2]; // e.g. "Soft Leather", "Studded Leather Boots"
      // Map slot prefix word → display name (with plural where needed)
      const SLOT_KW  = [['Belt','Belt'],['Boot','Boots'],['Helm','Helm'],['Cap','Cap'],
                        ['Crown','Crown'],['Chest','Armor'],['Robe','Armor'],['Tunic','Armor'],
                        ['Vest','Armor'],['Glove','Gloves'],['Ring','Ring'],['Amulet','Amulet'],
                        ['Bracer','Bracers'],['Quiver','Quiver'],['Wand','Wand'],['Staff','Staff'],
                        ['Scepter','Scepter'],['Axe','Axe'],['Mace','Mace'],['Sword','Sword'],
                        ['Dagger','Dagger'],['Shield','Shield'],['Bow','Bow'],['Harness','Armor'],
                        ['Coat','Armor']];
      const kwPair = SLOT_KW.find(([k]) => slotWord.toLowerCase().startsWith(k.toLowerCase()));
      const matchedKw  = kwPair ? kwPair[0] : null;
      const displayKw  = kwPair ? kwPair[1] : null;
      if (matchedKw && displayKw) {
        // Only append display keyword if the rest doesn't already contain it
        if (!rest.toLowerCase().includes(matchedKw.toLowerCase())) {
          s = rest + ' ' + displayKw;
        } else {
          // Replace the matched keyword in rest with its display form (e.g. Glove→Gloves)
          s = rest.replace(new RegExp(matchedKw, 'i'), displayKw);
        }
      } else {
        s = rest; // non-slot prefix (e.g. unit number), just strip it
      }
    }
  }
  if (_CANONICAL_WT[s]) s = _CANONICAL_WT[s];
  return s.trim() || e.trim();
}

// resolveGuid() — looks up blueprint GUID → display name
function resolveGuid(guid) {
  if (!guid) return null;
  const name = DH_GUIDS[guid];
  if (name) return normalizeName(name);
  return null;
}

// Extract "Material Type" for display from a blueprint name + slot key
// e.g. ("Legendary Chest02 Padded Armor Unit", "chest") → "Padded Armor"
//      ("Staff07 Spired Weapon Unit", "hand_right") → "Spired Staff"
const _SLOT_TYPE_DISPLAY = {
  // Equipment pass slot keys (from SLOT_INDEX_TO_KEY)
  chest:'Armor', waist:'Belt', feet:'Boots', head:'Helm',
  hands:'Gloves', neck:'Amulet', finger_1:'Ring', finger_2:'Ring', flask:'Flask',
  // inferSlotFromName output keys (used in stash pass)
  gloves:'Gloves', boots:'Boots', belt:'Belt', offhand:'Shield',
};
const _WEAPON_TYPES = ['Staff','Sword','Dagger','Axe','Mace','Bow','Wand','Scepter','Shield','Quiver'];

function getItemTypeDisplay(bpName, slotKey) {
  if (!bpName) return '';
  let mat = bpName;
  mat = mat.replace(/\s+(Armor|Weapon|Item)\s+Unit$/, '').replace(/\s+Unit$/, '');
  mat = mat.replace(/^Legendary\s+/, '');
  mat = mat.replace(/\s+Equipment\s*$/i, '').replace(/\s+Blueprint\s*$/i, '');

  let weaponTypeFromPrefix = null;
  const _pre = mat.match(/^([A-Za-z]+)\d+\s+/);
  if (_pre) {
    const _pw = _pre[1].toLowerCase();
    for (const _wTyp of _WEAPON_TYPES) {
      if (_pw === _wTyp.toLowerCase()) { weaponTypeFromPrefix = _pre[1]; break; }
    }
  }
  const _slotTypeKw = _SLOT_TYPE_DISPLAY[slotKey];
  if (_slotTypeKw) mat = mat.replace(new RegExp('^' + _slotTypeKw + '\\s+', 'i'), '');
  // Strip slot sub-type words like "Finger 01", "Hand Left" etc.
  mat = mat.replace(/\s*(Finger|Hand|Left|Right|Alt)\s*\d*\s*$/i, '').trim();
  // Strip leading standalone numbers and trailing standalone numbers
  mat = mat.replace(/^\d+\s+/, '');
  mat = mat.replace(/^[A-Za-z]+\s?\d+\s*/, '');
  mat = mat.replace(/([A-Za-z])\d+$/, '$1').trim();
  // If mat is purely numeric (e.g. "01" from "Ring 01") → clear it
  if (/^\d+$/.test(mat)) mat = '';

  let slotType = _slotTypeKw ?? null;
  if (!slotType && weaponTypeFromPrefix) slotType = weaponTypeFromPrefix;
  if (!slotType) {
    for (const _wTyp of _WEAPON_TYPES) {
      if (new RegExp('\\b' + _wTyp + '\\b', 'i').test(bpName)) { slotType = _wTyp; break; }
    }
  }
  let _result;
  if (slotType) {
    if (new RegExp('\\b' + slotType + '\\b', 'i').test(mat)) _result = mat;
    else _result = mat ? mat + ' ' + slotType : slotType;
  } else {
    _result = mat;
  }
  // Ring blueprints: "Ring 01 Item Unit" → mat gets fully stripped → detect and return 'Ring'
  if (!_result && /^Ring\s+\d+\b/i.test(bpName)) return 'Ring';
  // Apply same canonical overrides so typeDisplay matches normalizeName() output
  return _CANONICAL_WT[_result] || _result;
}



// getParam() 
function getParam(obj, key, prop) {
  return obj?.[key]?.[prop] ?? null;
}

// ---------------------------------------------------------------------------
// JSON repair
// ---------------------------------------------------------------------------
function repairSaveJson(str) {
  const MARKER = '"otherstats":{{';
  if (str.indexOf(MARKER) !== -1) {
    let out = [], cursor = 0, idx;
    while ((idx = str.indexOf(MARKER, cursor)) !== -1) {
      out.push(str.slice(cursor, idx), '"otherstats":{');
      let pos = idx + MARKER.length, depth = 2, inner = [];
      while (pos < str.length && depth > 0) {
        const ch = str[pos];
        if (ch === '{') { depth++; }
        else if (ch === '}') {
          depth--;
          if (depth === 1) { inner.push(ch); pos++; if (str[pos] === '}') pos++; break; }
        }
        inner.push(ch); pos++;
      }
      out.push(inner.join('')); cursor = pos;
    }
    out.push(str.slice(cursor));
    str = out.join('');
  }
  const chars = []; let inStr = false, esc = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (esc) { chars.push(ch); esc = false; continue; }
    if (ch === '\\' && inStr) { esc = true; chars.push(ch); continue; }
    if (ch === '"') inStr = !inStr;
    if (!inStr && ch === '}') {
      chars.push(ch);
      let j = i + 1;
      while (j < str.length && ' \t\r\n'.includes(str[j])) j++;
      if (j < str.length && str[j] === '{') chars.push(',');
      continue;
    }
    chars.push(ch);
  }
  return chars.join('');
}

// ---------------------------------------------------------------------------
// decodeFixed() — fixed-point decoder 
// ---------------------------------------------------------------------------
function decodeFixed(s) {
  const big  = BigInt(s);
  const u64  = BigInt.asUintN(64, big);
  const upper = Number(u64 >> 32n);
  const lower = Number(u64 & 0xFFFFFFFFn);
  const signed = upper >= 0x80000000 ? upper - 0x100000000 : upper;
  return signed + lower / 4294967296;
}

// readStat() 
function readStat(stat) {
  if (stat.long     !== undefined && stat.long     !== null) return { type: 'long',   value: stat.long };
  if (stat.fixed    !== undefined && stat.fixed    !== null) return { type: 'fixed',  value: Math.round(decodeFixed(String(stat.fixed)) * 100) / 100 };
  if (stat.string   !== undefined)                           return { type: 'string', value: stat.string };
  if (stat.prototype !== undefined)                          return { type: 'ref',    value: stat.prototype };
  if (stat.blueprint !== undefined)                          return { type: 'ref',    value: stat.blueprint };
  return { type: 'unknown', value: null };
}

// Friendly display-name overrides for verbose normalizeName() stat names
const STAT_DISPLAY_NAME = {
  'Equipment Damage Bonus':        'Damage Bonus',
  'Equipment Damage Percent':      'Damage %',
  'Equipment Armor Bonus':         'Armor Bonus',
  'Equipment Armor Pct Bonus':     'Armor %',
  'Equipment Attack Speed Multiplier': 'Attack Speed',
  'Equipment Critical Duration':   'Crit Duration',
  'Attack Speed Multiplier':       'Attack Speed',
  'Movement Speed Multiplier':     'Move Speed',
  'Health Bonus':                  'Life Bonus',
  'Strength Bonus':                'Strength',
  'Dexterity Bonus':               'Dexterity',
  'Magic Bonus':                   'Magic',
  'Vitality Bonus':                'Vitality',
  'Mana Bonus':                    'Mana',
  'Armor Bonus':                   'Armor',
  'Armor Pct Bonus':               'Armor %',
  'Critical Resistance':           'Crit Resistance',
  'Critical Chance':               'Crit Chance',
  'Critical Duration':             'Crit Duration',
  'Faster Swim Speed':             'Swim Speed',
  'Cast Speed Multiplier':         'Cast Speed',
  'Damage Reduction':              'Dmg Reduction',
  'Skill Level':                   '+All Skills',
};

// Stats stored as fixed-point fractions — multiply × 100 to display as percent
const MULT_STATS = new Set([
  'Equipment Attack Speed Multiplier', 'Attack Speed Multiplier',
  'Movement Speed Multiplier', 'Equipment Damage Percent',
  'Equipment Armor Pct Bonus', 'Armor Pct Bonus',
  'Cast Speed Multiplier', 'Equipment Critical Duration',
  'Critical Duration', 'Critical Chance', 'Damage Reduction',
]);

// ---------------------------------------------------------------------------
// buildAffixLines() — mirrors havenforge Nc() inner affix loop EXACTLY
// Returns array of { name, value } for display as "+{value} {name}"
// ---------------------------------------------------------------------------
function buildAffixLines(affixUnit) {
  const lines = [];
  for (const h of affixUnit.stats?.data ?? []) {
    if (AFFIX_STAT_ALWAYS_SKIP.has(h.stat)) continue;

    const name = resolveGuid(h.stat);
    if (!name) continue;

    const { type, value } = readStat(h);
    let A = (type === 'fixed' && value === Math.round(value))
              ? String(Math.round(value))
              : String(value ?? '');

    // If value is a GUID ref and ba has it, resolve to display name
    if (type === 'ref' && typeof value === 'string' && DH_GUIDS[value]) {
      A = resolveGuid(value);
    }

    // Append param qualifier — only p0.prototype (NOT p0.blueprint)
    const p0proto = getParam(h.params, 'p0', 'prototype');
    if (p0proto && !AFFIX_STAT_ALWAYS_SKIP.has(p0proto)) {
      const pname = resolveGuid(p0proto);
      if (pname && !pname.endsWith('…')) A = `${A} (${pname})`;
    }

    if (A === '' || A === 'null' || A === '0') continue;
    const displayName = STAT_DISPLAY_NAME[name] || name;
    // Stats stored as 'fixed' decimal fraction (0.23) that should display as percent (23%)
    // ONLY applies when readStat() returns type='fixed' — integers (type='long') are already in right unit
    // (MULT_STATS defined at module level)
    if (type === 'fixed' && MULT_STATS.has(name) && typeof value === 'number') {
      // Stored as fraction: multiply by 100 and show as %
      A = String(Math.round(value * 100)) + '%';
    }
    // Mark stat requirement lines so tooltip can separate them from regular affixes
    const isRequirement = name.includes('Stat Requirement');
    lines.push({ name: displayName, value: A, isRequirement });
  }
  return lines;
}

// Resolve rarity from quality stat
function resolveRarity(protoGuid) {
  if (!protoGuid) return null;
  if (QUALITY_GUIDS[protoGuid]) return QUALITY_GUIDS[protoGuid];
  const baName = DH_GUIDS[protoGuid] || '';
  const m = baName.match(/Item Quality \d+ \((\w+)\)/);
  return m ? m[1] : null;
}

// Detect class from character unit blueprint and skill branch stats
function detectClass(charUnit) {
  const bp = charUnit.blueprint || '';
  // Pass 1: blueprint match
  for (const [cls, cfg] of Object.entries(CLASS_CONFIG)) {
    if (cfg.blueprints.includes(bp)) return cls;
  }
  // Pass 2: skill branch match
  const branchGuids = (charUnit.stats?.data ?? [])
    .filter(s => s.stat === STAT_GUIDS.SKILL_BRANCH && s.prototype)
    .map(s => s.prototype);
  for (const [cls, cfg] of Object.entries(CLASS_CONFIG)) {
    if (cfg.branches.length && branchGuids.some(g => cfg.branches.includes(g))) return cls;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public: parse a .max ArrayBuffer → character data
// ---------------------------------------------------------------------------
function parseMaxFile(arrayBuffer) {
  const uint8 = new Uint8Array(arrayBuffer);
  if (uint8[0] !== 0x6D || uint8[1] !== 0x61 || uint8[2] !== 0x76)
    throw new Error('Not a valid .max save file');

  const inflated    = pako.inflateRaw(uint8.slice(8));
  const jsonString  = new TextDecoder('utf-8').decode(inflated);
  const saveWrapper = JSON.parse(jsonString);
  const actualData  = JSON.parse(repairSaveJson(saveWrapper.Data));
  const digest      = JSON.parse(saveWrapper.Digest);

  return processCharacterData(actualData, digest);
}

// Skill-related stat and assignment GUIDs
const SKILL_TREE_ASSIGN     = '58891c093990de64cad66fd4d3e74168'; // branch assignment
const SKILL_SLOT_ASSIGN     = 'cf616d6885c1b5745894e03892ffc160'; // slot assignment  
const SKILL_LEVEL_GUID      = 'ce0f739fa39de3348bd4922b00144ae3'; // skill level
const SKILL_OPTION_GUID     = '5779a972f48109041abcf17598217001'; // upgrade level
const SKILL_TOME_GUID       = '1638789fd4a687544b80f4d4b89660ce'; // tome bonus
const SKILL_BONUS_TAG_GUID  = '25b481d33060adb478dcc38fc70cb997'; // +N all/specific skills (rings etc)

// ---------------------------------------------------------------------------
// Internal: build character data object from parsed save
// ---------------------------------------------------------------------------
function processCharacterData(data, digest) {
  const units = data?.units;
  if (!units?.length) throw new Error('No units in save data');

  // Find character unit: it's the unit with NO location (armory xf() pattern)
  let charUnit = null, charUnitIdx = 0;
  for (let i = 0; i < units.length; i++) {
    if (!units[i].location) { charUnit = units[i]; charUnitIdx = i; break; }
  }
  if (!charUnit) { charUnit = units[0]; charUnitIdx = 0; } // fallback
  const className = detectClass(charUnit);
  const classCfg  = CLASS_CONFIG[className] || null;

  const charData = {
    name:      digest.Name  || 'Unknown',
    level:     digest.Level || 1,
    class:     className    || 'Unknown',
    experience: 0, experienceNext: 0,
    gold: 0, stone: 0,
    potionCharges: 0, potionMax: 0,
    kills: 0, deaths: 0,
    skills: [],    // legacy (kept for compat)
    skillBranches: [], skillLevels: [], skillOptions: [], skillSlots: [],
    killLog: [],   // { name, rarity, count } sorted by count desc
    stats: {
      strength:  0,  // will be set from STRENGTH_BASE stat
      dexterity: 0,  // will be set from DEX stats (base absent for DEX-less chars),
      magic:     0,  // built from MAG_BASE + MAG_INTRINSIC
      vitality:  0,  // built from VIT_BASE + VIT_INTRINSIC
      attack:    classCfg?.baseStats.attack    || 0,
      armor:     0,
      health:    0, healthMax: classCfg?.baseStats.healthMax || 0,
      mana:      0, manaMax:   null,   // null = not yet set; computed in final pass below
      stamina:   0, staminaMax: 0, staminaRegen: 0,
      // Detailed stats — totals
      resistance: 0, penetration: 0, critChance: 0, critResistance: 0,
      attackSpeed: 0, castSpeed: 0,
      moveSpeed: 0, waterWalking: 0,
      magicFind: 0, goldFind: 0, gemFind: 0, findHealthOrbs: 0, findManaOrbs: 0,
      manaRegen: 0, featherFalling: false,
      // Per-element stats (keyed by damage type short name)
      resistanceBy:    { blunt:0, cold:0, fire:0, lightning:0, shadow:0, slashing:0 },
      penetrationBy:   { blunt:0, cold:0, fire:0, lightning:0, shadow:0, slashing:0 },
      critChanceBy:    { blunt:0, cold:0, fire:0, lightning:0, shadow:0, slashing:0 },
      critResistBy:    { blunt:0, cold:0, fire:0, lightning:0, shadow:0, slashing:0 },
    },
    equipment: [],
  };

  // --- Character stats from units[0] (additive on top of class base) ---
  for (const stat of charUnit.stats?.data ?? []) {
    const { value: S } = readStat(stat);
    switch (stat.stat) {
      case STAT_GUIDS.PROPERNAME:      if (stat.string) charData.name = stat.string; break;
      case STAT_GUIDS.LEVEL:           charData.level = S; break;
      case STAT_GUIDS.EXPERIENCE:      charData.experience = S; break;
      case STAT_GUIDS.EXPERIENCE_NEXT: charData.experienceNext = S; break;
      case STAT_GUIDS.GOLD:            charData.gold = S; break;
      case STAT_GUIDS.STONE:           charData.stone = S; break;
      case STAT_GUIDS.FLASK:           charData.potionCharges = S; break;
      case STAT_GUIDS.FREE_FLASK:      charData.potionMax = S; break;
      case STAT_GUIDS.STRENGTH_BASE:   charData.stats.strengthBase  = S; break;
      case STAT_GUIDS.DEXTERITY_BASE:  charData.stats.dexterityBase = S; break;
      case STAT_GUIDS.STR_INTRINSIC:   charData.stats.strengthIntrinsic  = (charData.stats.strengthIntrinsic||0)  + S; break;
      case STAT_GUIDS.DEX_INTRINSIC:   charData.stats.dexterityIntrinsic = (charData.stats.dexterityIntrinsic||0) + S; break;
      case STAT_GUIDS.VIT_INTRINSIC:   charData.stats.vitalityIntrinsic  = (charData.stats.vitalityIntrinsic||0)  + S; break;
      case STAT_GUIDS.MAG_INTRINSIC:   charData.stats.magicIntrinsic     = (charData.stats.magicIntrinsic||0)  + S; break;
      case STAT_GUIDS.MAGIC_BASE:      charData.stats.magicBase    = S; break;
      case STAT_GUIDS.VITALITY_BASE:   charData.stats.vitalityBase  = S; break;
      case STAT_GUIDS.ATTACK_BASE:     charData.stats.attack    = S; break;
      case STAT_GUIDS.ARMOR_BASE:      charData.stats.armor    += S; break;
      case STAT_GUIDS.HEALTH:          charData.stats.healthCurrent = Math.round(S * 10) / 10; break;  // current HP
      case STAT_GUIDS.HEALTH_BASE:     charData.stats.healthBase = S; break;
      case STAT_GUIDS.MANA:            charData.stats.manaCurrent = Math.round(S * 10) / 10; break;
      case STAT_GUIDS.MANA_BASE:       charData.stats.manaBase  = S; break;
      case STAT_GUIDS.MANA_MAX_BONUS:  charData.stats.manaMax   = Math.round(S * 10) / 10; break;
      case STAT_GUIDS.STAMINA:         charData.stats.stamina      = S; break;
      case STAT_GUIDS.STAMINA_BASE:    charData.stats.staminaMax  += S; break;
      case STAT_GUIDS.STAMINA_MAX:     charData.stats.staminaMax  += S; break;
      case STAT_GUIDS.STAMINA_REGEN:   charData.stats.staminaRegen = S; break;
      case STAT_GUIDS.KILL_COUNTER: {
        const kbp  = stat.params?.p0?.unitblueprint;
        const rProto = stat.params?.p1?.prototype;
        if (!kbp && !rProto) {
          // No params → total kill counter
          charData.kills = S;
        } else if (kbp) {
          // Per-mob kill entry — use explicit display name map first, then DH_GUIDS lookup
          const _dhName = DH_GUIDS[kbp] || '';
          let ename = _MOB_DISPLAY_NAMES[_dhName] || resolveGuid(kbp);
          if (!ename) ename = kbp.slice(0, 8) + '…';
          // Resolve rarity from p1.prototype name
          // Rarity: first check p1 prototype name, then fall back to mob name
          const rraw = rProto ? (DH_GUIDS[rProto] || '') : '';
          // Also get full mob name for rarity extraction
          const mobraw = DH_GUIDS[kbp] || '';
          let erarity = null;
          const raritySource = rraw + ' ' + mobraw + ' ' + ename;
          if      (raritySource.includes('Unique'))    erarity = 'Unique';
          else if (raritySource.includes('Champion'))  erarity = 'Champion';
          else if (raritySource.includes('Boss'))      erarity = 'Boss';
          else if (raritySource.includes('Elite'))     erarity = 'Elite';
          else                                         erarity = 'Normal';
          charData.killLog.push({ blueprint: kbp, name: ename, rarity: erarity, count: S });
        }
        break;
      }
      case STAT_GUIDS.KILLED_BY:       charData.deaths = (charData.deaths || 0) + S; break;
      // resistance/penetration/crit come from item affixes only (equip pass2)
      case STAT_GUIDS.WATER_WALKING:   charData.stats.waterWalking   = S; break;
      case STAT_GUIDS.MAGIC_FIND:      charData.stats.magicFind     += S; break;
      case STAT_GUIDS.GOLD_FIND:       charData.stats.goldFind      += S; break;
      case STAT_GUIDS.ITEM_FIND: {
        const p0t = stat.params?.p0?.prototype;
        if      (p0t === ITEM_FIND_TYPES.GEM)        charData.stats.gemFind        += S;
        else if (p0t === ITEM_FIND_TYPES.HEALTH_ORB) charData.stats.findHealthOrbs += S;
        else if (p0t === ITEM_FIND_TYPES.MANA_ORB)   charData.stats.findManaOrbs   += S;
        else                                          charData.stats.gemFind        += S;
        break;
      }
      case STAT_GUIDS.MANA_REGEN:      charData.stats.manaRegen     += Math.round(S * 100) / 100; break;
      case STAT_GUIDS.FEATHER_FALLING: charData.stats.featherFalling = true; break;
    }
  }
  // Sort kill log by count desc
  charData.killLog.sort((a,b) => b.count - a.count);

  // --- Skills: parse from charUnit.stats.data (units[0]) ---

  charData.skillBranches = []; // {slot, name}
  charData.skillLevels   = []; // {skill, level, tomeBonus}
  charData.skillOptions  = []; // {option, level}
  charData.skillSlots    = []; // {group, slot, skill}
  charData.stats.skillLevelBonus  = 0; // global +N to all skills from items
  charData.stats.glyphChanceBonus = 0; // % bonus to glyph-chance upgrades (e.g. Johann's Bedazzlers)
  const _skillTomeBonus = {}; // skill blueprint → extra levels from consumed tomes

  for (const stat of charUnit.stats?.data ?? []) {
    const { value: S } = readStat(stat);
    switch (stat.stat) {
      case SKILL_TREE_ASSIGN: {
        // value = branch blueprint GUID; p0.long = slot index
        const slot = stat.params?.p0?.long ?? 0;
        const name = resolveGuid(S);
        if (name) charData.skillBranches.push({ slot, name });
        break;
      }
      case SKILL_SLOT_ASSIGN: {
        // value = skill blueprint GUID; p0.prototype = group; p1.long = slot
        const group = getParam(stat.params, 'p0', 'prototype');
        const slot  = stat.params?.p1?.long ?? stat.params?.p0?.long ?? 0;
        const skill = resolveGuid(S);
        if (skill) charData.skillSlots.push({ group: resolveGuid(group), slot, skill });
        break;
      }
      case SKILL_LEVEL_GUID: {
        // p0.blueprint = skill blueprint; value = level
        const bp   = getParam(stat.params, 'p0', 'blueprint') ?? '?';
        const name = resolveGuid(bp);
        if (name && typeof S === 'number') charData.skillLevels.push({ skill: name, level: S });
        break;
      }
      case SKILL_OPTION_GUID: {
        // p0.prototype = upgrade blueprint; value = level
        const proto = getParam(stat.params, 'p0', 'prototype') ?? '?';
        const name  = resolveGuid(proto);
        if (name && typeof S === 'number') charData.skillOptions.push({ option: name, proto, level: S });
        break;
      }
      case SKILL_TOME_GUID: {
        // Per-skill tome bonus: p0.blueprint = skill unit; value = extra levels
        const _tbp = getParam(stat.params, 'p0', 'blueprint') ?? '';
        if (_tbp && typeof S === 'number')
          _skillTomeBonus[_tbp] = (_skillTomeBonus[_tbp] || 0) + S;
        break;
      }
    }
  }
  // Merge tome bonuses and branch into skillLevels entries
  for (const _sk of charData.skillLevels) {
    const _tbpMatch = Object.keys(_skillTomeBonus).find(bp => resolveGuid(bp) === _sk.skill);
    _sk.tomeBonus = _tbpMatch ? _skillTomeBonus[_tbpMatch] : 0;
    // Find branch from skillSlots
    const _slotEntry = charData.skillSlots.find(sl => sl.skill === _sk.skill);
    _sk.branch = _slotEntry ? _slotEntry.group : null;
  }
  // Sort branches by slot
  charData.skillBranches.sort((a, b) => a.slot - b.slot);
  // Sort skill options: attach each option to its skill by name prefix
  // (e.g. "Witch Blood Lash Enrage Skill Option" → belongs to "Witch Blood Lash Skill Unit")
  for (const _opt of charData.skillOptions) {
    let _bestSkill = null, _bestLen = 0;
    for (const _sk of charData.skillLevels) {
      // Check if skill name is a prefix of option name (trimming " Skill" suffix)
      const _skillBase = _sk.skill.replace(/ Skill.*$/, '').trim();
      if (_opt.option.startsWith(_skillBase) && _skillBase.length > _bestLen) {
        _bestSkill = _sk.skill;
        _bestLen = _skillBase.length;
      }
    }
    _opt.parentSkill = _bestSkill;
  }

  // --- Tattoos: rune garment slots (EQUIPMENT indices 15–27) ---
  charData.tattoos = [];

  // --- Equipment: Pass 1 — collect base items ---
  const equipByIdx = {};
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const loc  = unit.location;
    if (!loc || loc.container !== CONTAINERS.EQUIPMENT) continue;
    const slotKey = SLOT_INDEX_TO_KEY[loc.index];
    if (!slotKey) {
      // Check if it's a tattoo slot (rune garment, indices 15–27)
      const tattooSlotName = TATTOO_SLOT_INDEX[loc.index];
      if (tattooSlotName) {
        const bp2     = unit.blueprint || '';
        const baName2 = DH_GUIDS[bp2];
        const TATTOO_SLOT_STAT  = '451c001d1f78ae8408c12934cc48ce07'; // slot location proto
        const TATTOO_TYPE_STAT  = '4267c6613bda4d94a99ef98fe962fce6'; // rune type proto
        const runeItem = {
          slot: tattooSlotName,
          blueprint: bp2,
          name: baName2 ? normalizeName(baName2).replace(/ Item Unit$/i,'').trim() : `Unknown (${bp2.slice(0,8)})`,
          level: null,
          slotProto: null,
          runeTypeProto: null,
          runeTypeName: null,
          runeElement: null, // Life | Health | AoE | Blood | Defend — from TATTOO_SLOT_STAT prototype
          runeName: null,    // "Ash Rune" / "Ka Rune" etc. — from blueprint number
          runeNum:  null,    // '1'–'5' — from blueprint "Rune N Item Unit"
        };
        // Ash=1, Bat=2, Ka=3, Deb=4, Elm=5
        const RUNE_NUM_MAP = { '1':'Ash Rune', '2':'Bat Rune', '3':'Ka Rune', '4':'Deb Rune', '5':'Elm Rune' };
        if (baName2) {
          const rnm = baName2.match(/Rune\s+(\d+)\s+Item/i);
          if (rnm) {
            const n = String(parseInt(rnm[1], 10)); // normalize "05" → "5"
            runeItem.runeNum = n;
            runeItem.runeName = RUNE_NUM_MAP[n] || ('Rune ' + n);
          }
        }
        for (const stat of unit.stats?.data ?? []) {
          const { value: v } = readStat(stat);
          switch (stat.stat) {
            case STAT_GUIDS.LEVEL:    runeItem.level = v; break;
            case TATTOO_SLOT_STAT:    runeItem.slotProto = stat.prototype; break;
            case TATTOO_TYPE_STAT:    runeItem.runeTypeProto = stat.params?.p0?.prototype; break;
          }
        }
        if (runeItem.runeTypeProto) {
          const rtName = resolveGuid(runeItem.runeTypeProto) || '';
          runeItem.runeTypeName = rtName.replace(/ Skill Trait$/i,'').trim();
        }
        // Extract rune element from the TATTOO_SLOT_STAT prototype (garment set blueprint name)
        // e.g. "Witch Rune Garment Set Defend LegUR" → elem = "Defend"
        if (runeItem.slotProto) {
          const garmentName = DH_GUIDS[runeItem.slotProto] || '';
          const elemMatch = garmentName.match(/Rune Garment Set\s+(AoE|Blood|Defend|Health|Life)/i);
          if (elemMatch) runeItem.runeElement = elemMatch[1];
        }
        charData.tattoos.push(runeItem);
      }
      // else: unknown index — skip silently
      continue;
    }

    const bp       = unit.blueprint || '';
    const baName   = DH_GUIDS[bp];
    const baseName = baName ? normalizeName(baName) : `Unknown (${bp.slice(0,8)})`;

    const item = {
      name: baseName, slot: slotKey, slotDisplay: SLOT_DISPLAY[slotKey] || slotKey,
      typeDisplay: getItemTypeDisplay(baName, slotKey),
      blueprint: bp, dbid: unit.dbid || '0x0',
      legendaryName: null, legendaryAffixGuid: null, rareName: null,
      level: null, rarity: null, armor: null, armorPct: null,
      damageMin: null, damageMax: null, damageType: null,
      socketCount: 0, sockets: [], socketSlots: [], socketed: [],
      dyeColor: null, dyeColors: null,
      affixLines: [],
    };

    for (const stat of unit.stats?.data ?? []) {
      const { value: v } = readStat(stat);
      switch (stat.stat) {
        case STAT_GUIDS.LEVEL:           item.level = v; break;
        case STAT_GUIDS.ITEM_PROG_REQ:   item.tomeTier = v; break;
        case STAT_GUIDS.SKILL_TOME_REQ:  item.tomeTier = item.tomeTier || v; break; // skill tomes use this instead
        case STAT_GUIDS.STAT_REQ_BASE:   item.tomeReqValue = v; item.tomeReqAttrProto = stat.params?.p0?.prototype || null; break;
        case STAT_GUIDS.ITEM_MARK:       item.favourite = (v === 2); break;
        case STAT_GUIDS.QUALITY:         item.rarity = resolveRarity(stat.prototype); break;
        case STAT_GUIDS.ARMOR_BASE:        item.armor = (item.armor || 0) + v; break;
        case STAT_GUIDS.EQUIP_ARMOR_PCT:   item.armorPct = (item.armorPct || 0) + v; break;
        case STAT_GUIDS.DMG_BASE_MIN:    item.damageMin = v; break;
        case STAT_GUIDS.DMG_BASE_MAX:    item.damageMax = v; break;
        case STAT_GUIDS.DMG_TYPE:        if (stat.prototype) item.damageType = resolveGuid(stat.prototype); break;
        case STAT_GUIDS.RARE_NAME:
          // String stat: the item's proper rare/magic name ("Wild Cincture", "Arcane Sabots", etc.)
          if (stat.string) item.rareName = stat.string;
          break;
        case STAT_GUIDS.SOCKETS: {
          const sockN = (typeof v === 'number' && v > 0) ? v : 1;
          item.socketCount = (item.socketCount || 0) + sockN;
          const _slotP = stat.params?.p0?.prototype || '';
          const _slotU = _slotP === '07826ea7c73d5df40b02785076596196';
          for (let _q = 0; _q < sockN; _q++) item.socketSlots.push(_slotU ? 'unique' : 'common');
          break;
        }
        case STAT_GUIDS.EQUIP_ASPECT: {
          const asp = stat.params?.p0?.prototype || stat.prototype;
          if (asp) {
            const raw = (DH_GUIDS[asp] || '').replace(/^Dye /i,'').replace(/ Appearance Aspect$/i,'').trim();
            if (raw) {
              item.dyeColor = raw;
              // Split e.g. "DarkBrown Orange Brass" → ['DarkBrown','Orange','Brass']
              item.dyeColors = raw.split(/(?=[A-Z])/).map(s => s.trim()).filter(Boolean);
            }
          }
          break;
        }
      }
    }

    // Use rare name if available, keep legendary name priority
    if (item.rareName && !item.legendaryName) item.name = item.rareName;

    // Tome usage: cross-reference tomeTier against character intrinsics.
    // ITEM_PROG_REQ long = tier (1=I, 2=II); intrinsic count >= tier → used.
    if (item.slot === 'tome' && item.tomeTier) {
      const _bn = (DH_GUIDS[item.blueprint] || '').toLowerCase();
      const _ic =
        _bn.includes('vigor')   ? (charData.stats.vitalityIntrinsic  || 0) :
        _bn.includes('might')   ? (charData.stats.strengthIntrinsic  || 0) :
        _bn.includes('agility') ? (charData.stats.dexterityIntrinsic || 0) :
        _bn.includes('power')   ? (charData.stats.magicIntrinsic     || 0) : -1;
      if (_ic >= 0) item.tomeUsed = (_ic >= item.tomeTier);
    }

    equipByIdx[i] = item;
    charData.equipment.push(item);
  }

  // --- Equipment: Pass 2 — attach affixes to items ---
  // Build affix-index → equip item map so BONUS_STATS sub-units of affixes can find their parent
  const affixOwnerToEquip = {};
  for (let i = 0; i < units.length; i++) {
    const u2 = units[i];
    if (!u2.location) continue;
    if (u2.location.container !== CONTAINERS.AFFIXES) continue;
    const p2 = equipByIdx[u2.location.owner];
    if (p2) affixOwnerToEquip[i] = p2;
  }

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const loc  = unit.location;
    if (!loc) continue;
    // Process both affix units AND bonus stat units attached to active equipment
    const isAffix      = loc.container === CONTAINERS.AFFIXES;
    const isBonusStat  = loc.container === CONTAINERS.BONUS_STATS;
    if (!isAffix && !isBonusStat) continue;
    // For BONUS_STATS: owner may be the item itself OR an affix sub-unit of the item
    const parent = equipByIdx[loc.owner] || affixOwnerToEquip[loc.owner] || null;
    if (!parent) continue;

    const bp = unit.blueprint || '';
    const legName = LEGENDARY_AFFIX_NAMES[bp];
    if (legName && !parent.legendaryName) {
      parent.legendaryName    = legName;
      parent.legendaryAffixGuid = bp;
      parent.name             = legName;
      if (!parent.rarity) parent.rarity = 'Legendary';
    }

    // Track socketed items (gems, hearts, runes) for socket display
    if (isBonusStat) {
      const bpName = DH_GUIDS[bp] || '';
      const isHeart = /core/i.test(bpName);
      const isRune  = /rune/i.test(bpName);
      const sockType = isHeart ? 'heart' : isRune ? 'rune' : 'gem';
      let sockRarity = 'Common', sockName = null, sockHeartRarity = undefined, sockHeartElement = undefined;

      if (isHeart) {
        // Look for CORE_SOURCE stat on the socketed heart's unit to get the source monster
        let heartSrcBp = null;
        for (const _st of unit.stats?.data ?? []) {
          if (_st.stat === STAT_GUIDS.CORE_SOURCE && _st.unitblueprint) { heartSrcBp = _st.unitblueprint; break; }
        }
        if (heartSrcBp) {
          const srcBpName   = DH_GUIDS[heartSrcBp] || '';
          const heartInfo   = resolveHeartInfo(srcBpName, bpName);
          sockName          = heartInfo.name;
          sockRarity        = heartInfo.rarity;
          sockHeartRarity   = heartInfo.rarity;
          sockHeartElement  = heartInfo.element;
        } else {
          // Fallback: infer rarity from blueprint name keywords
          if (/\bChampion\b/i.test(bpName))    { sockRarity = 'Champion'; sockHeartRarity = 'Champion'; }
          else if (/\bElite\b/i.test(bpName))  { sockRarity = 'Elite';    sockHeartRarity = 'Elite'; }
          else if (/\bunique\b/i.test(bpName)) { sockRarity = 'Unique';   sockHeartRarity = 'Unique'; }
          sockName = resolveSocketItemName(bpName) || normalizeName(bpName) || null;
        }
      } else {
        sockName = resolveSocketItemName(bpName) || normalizeName(bpName) || null;
        for (const _st of unit.stats?.data ?? []) {
          if (_st.stat === STAT_GUIDS.QUALITY) { sockRarity = resolveRarity(_st.prototype) || 'Common'; break; }
        }
        if (sockRarity === 'Common' && /unique/i.test(bpName))     sockRarity = 'Unique';
        else if (sockRarity === 'Common' && /rare/i.test(bpName))  sockRarity = 'Rare';
        else if (sockRarity === 'Common' && /magic/i.test(bpName)) sockRarity = 'Magic';
        else if (sockRarity === 'Common' && /legendary/i.test(bpName)) sockRarity = 'Legendary';
      }

      if (!parent.socketed) parent.socketed = [];
      parent.socketed.push({ type: sockType, rarity: sockRarity, heartRarity: sockHeartRarity, heartElement: sockHeartElement, name: sockName || sockType });
    }

    // Track per-item armor contributions from affixes (mirrors Hf())
    for (const stat of unit.stats?.data ?? []) {
      const { value: v } = readStat(stat);
      switch (stat.stat) {
        // Note: HEALTH and MANA stats already contain pre-computed totals incl. item bonuses
        case STAT_GUIDS.HEALTH_BONUS:
          if (!parent?.slot?.includes('_alt')) charData.stats.healthFromItems = (charData.stats.healthFromItems||0) + v; break;
        case STAT_GUIDS.MANA_ITEM_BONUS:
          if (!parent?.slot?.includes('_alt')) charData.stats.manaFromItems = (charData.stats.manaFromItems||0) + v; break;
        case STAT_GUIDS.MANA_REGEN:        charData.stats.manaRegen += Math.round(v * 100) / 100; break;
        case STAT_GUIDS.FEATHER_FALLING:   charData.stats.featherFalling = true; break;
        case STAT_GUIDS.ATTACK:            charData.stats.attack += v; break;
        case STAT_GUIDS.EQUIP_ARMOR_BONUS: parent._armorFlat = (parent._armorFlat || 0) + v; break;
        case STAT_GUIDS.EQUIP_ARMOR_PCT:   parent._armorPct  = (parent._armorPct  || 0) + v; break;
        case STAT_GUIDS.CRIT_CHANCE:
        case STAT_GUIDS.EQUIP_CRIT_CHANCE: {
          if (parent?.slot?.includes('_alt')) break;  // alt-slot weapons excluded
          const _cp = stat.params?.p0?.prototype;
          const _ce = DAMAGE_TYPE_GUIDS[_cp];
          if (_cp === ALL_DAMAGE_TYPE_GUID) { for (const k of EL_KEYS_ALL) charData.stats.critChanceBy[k] += v; }
          else if (_ce) charData.stats.critChanceBy[_ce] += v;
          else charData.stats.critChance += v;
          break;
        }
        case STAT_GUIDS.ATTACK_SPEED_MULT:
          if (!parent?.slot?.includes('_alt')) charData.stats.attackSpeed += v; break;
        case STAT_GUIDS.CAST_SPEED_MULT:
          if (!parent?.slot?.includes('_alt')) charData.stats.castSpeed   += v; break;
        case STAT_GUIDS.PENETRATION: {
          if (parent?.slot?.includes('_alt')) break;  // alt-slot weapon pen excluded
          const _pp = stat.params?.p0?.prototype;
          const _pe = DAMAGE_TYPE_GUIDS[_pp];
          if (_pp === ALL_DAMAGE_TYPE_GUID) { for (const k of EL_KEYS_ALL) charData.stats.penetrationBy[k] += v; }
          else if (_pe) charData.stats.penetrationBy[_pe] += v;
          else charData.stats.penetration += v;
          break;
        }
        case STAT_GUIDS.RESISTANCE: {
          const _rp = stat.params?.p0?.prototype;
          const _re = DAMAGE_TYPE_GUIDS[_rp];
          if (_rp === ALL_DAMAGE_TYPE_GUID) { for (const k of EL_KEYS_ALL) charData.stats.resistanceBy[k] += v; }
          else if (_re) charData.stats.resistanceBy[_re] += v;
          else charData.stats.resistance += v;
          break;
        }
        case STAT_GUIDS.CRIT_RESISTANCE: {
          const _crp = stat.params?.p0?.prototype;
          const _cre = DAMAGE_TYPE_GUIDS[_crp];
          if (_crp === ALL_DAMAGE_TYPE_GUID) { for (const k of EL_KEYS_ALL) charData.stats.critResistBy[k] += v; }
          else if (_cre) charData.stats.critResistBy[_cre] += v;
          else charData.stats.critResistance += v;
          break;
        }
        // Move speed only counts if it's an explicit equipment affix (not a bonus_stat base)
        case STAT_GUIDS.MOVE_SPEED:
          if (isAffix) charData.stats.moveSpeed += Math.round(v * 100); // store as integer %
          break;
        case STAT_GUIDS.MAGIC_FIND:        charData.stats.magicFind     += v; break;
        case STAT_GUIDS.GOLD_FIND:         charData.stats.goldFind      += v; break;
        case STAT_GUIDS.ITEM_FIND: {
          const p0t = stat.params?.p0?.prototype;
          if      (p0t === ITEM_FIND_TYPES.GEM)        charData.stats.gemFind        += v;
          else if (p0t === ITEM_FIND_TYPES.HEALTH_ORB) charData.stats.findHealthOrbs += v;
          else if (p0t === ITEM_FIND_TYPES.MANA_ORB)   charData.stats.findManaOrbs   += v;
          else                                          charData.stats.gemFind        += v;
          break;
        }
        case SKILL_BONUS_TAG_GUID: {
          // p0.prototype=null → global bonus; p0.prototype=skillBp → specific skill
          if (typeof v === 'number' && v > 0) {
            const _specificSkill = stat.params?.p0?.prototype ?? null;
            if (!_specificSkill) {
              // Global +N to ALL skills
              charData.stats.skillLevelBonus = (charData.stats.skillLevelBonus || 0) + v;
            }
          }
          break;
        }
        // Glyph Chance bonus from items like Johann's Bedazzlers
        // Blueprint f336d6309816cc44cace48e0d4632569 = 'Glyph Chance Skill Trait'
        // Its own stats contain a fixed value = the % bonus (e.g. 0.34 = 34%)
        case '39723a87dcd2a1044b281f10eeec49e3': // Witch Glyph Lunge Glyph Chance Skill Option
          if (typeof v === 'number' && !parent?.slot?.includes('_alt'))
            charData.stats.glyphChanceBonus = (charData.stats.glyphChanceBonus || 0) + v;
          break;
        case STAT_GUIDS.STRENGTH_BONUS:
          if (!parent?.slot?.includes('_alt')) { charData.stats.strengthFromItems  = (charData.stats.strengthFromItems  || 0) + v; } break;
        case STAT_GUIDS.DEXTERITY_BONUS:
          if (!parent?.slot?.includes('_alt')) { charData.stats.dexterityFromItems = (charData.stats.dexterityFromItems || 0) + v; } break;
        case STAT_GUIDS.VITALITY_BONUS:
          if (!parent?.slot?.includes('_alt')) { charData.stats.vitalityFromItems  = (charData.stats.vitalityFromItems  || 0) + v; } break;
        case STAT_GUIDS.MAGIC_BONUS:
          if (!parent?.slot?.includes('_alt')) { charData.stats.magicFromItems     = (charData.stats.magicFromItems     || 0) + v; } break;
      }
    }

    // Propagate SOCKETS stat from AFFIX unit to parent equip item
    if (isAffix) {
      for (const _est of unit.stats?.data ?? []) {
        if (_est.stat !== STAT_GUIDS.SOCKETS) continue;
        const { value: _esv } = readStat(_est);
        const _esn = (typeof _esv === 'number' && _esv > 0) ? _esv : 1;
        parent.socketCount = (parent.socketCount || 0) + _esn;
        const _esp = _est.params?.p0?.prototype || '';
        const _esu = _esp === '07826ea7c73d5df40b02785076596196';
        if (!parent.socketSlots) parent.socketSlots = [];
        for (let _eq = 0; _eq < _esn; _eq++) parent.socketSlots.push(_esu ? 'unique' : 'common');
      }
    }

    // Affix lines — havenforge-exact rendering
    const lines = buildAffixLines(unit);
    if (isBonusStat) {
      // Mark lines from socketed items with their type for bullet icon in tooltip
      const bpName = DH_GUIDS[unit.blueprint||''] || '';
      const sockT  = /core/i.test(bpName) ? 'heart' : /rune/i.test(bpName) ? 'rune' : 'gem';
      for (const ln of lines) { ln.socketed = true; ln.sockType = sockT; parent.affixLines.push(ln); }
    } else {
      // Flask affix units carry no stat values — their blueprint name IS the property
      // e.g. "War (Flask) Affix Unit" → show "War" as an affix line
      if (isAffix && lines.length === 0 && parent.slot === 'flask') {
        const bpName = DH_GUIDS[bp] || '';
        const flaskM = bpName.match(/^(.+?)\s*\(Flask\)\s*Affix Unit$/i);
        if (flaskM) parent.affixLines.push({ name: flaskM[1].trim(), value: '', isFlaskProp: true });
      } else {
        for (const ln of lines) parent.affixLines.push(ln);
      }
    }
  }

  // --- Final derived stats ---
  // Armor: Math.round( sum(item.armor * (1 + item._armorPct/100)) ) + sum(flat bonuses)
  let armorD = 0, armorF = 0;
  for (const item of charData.equipment) {
    if (item.armor != null) armorD += item.armor * (1 + (item._armorPct || 0) / 100);
    armorF += item._armorFlat || 0;
  }
  charData.stats.armor = Math.round(armorD) + armorF;

  // HEALTH stat = current HP at save time; healthBase = base max before items
  // Max HP = healthBase (HEALTH_BASE stat) + final vitality total
  // ── Attribute post-processing ─────────────────────────────────
  // Each attribute = base_stat (from save, includes class base + level-up points baked in)
  //               + intrinsic (per-level / tome bonus from save)
  //               + fromItems (accumulated by equip pass above)
  // NOTE: DEX_BASE is absent for Witch — fall back to class config base dexterity.
  charData.stats.strength  = (charData.stats.strengthBase  || classCfg?.baseStats.strength  || 0) + (charData.stats.strengthIntrinsic  || 0) + (charData.stats.strengthFromItems  || 0);
  charData.stats.dexterity = (charData.stats.dexterityBase || classCfg?.baseStats.dexterity || 0) + (charData.stats.dexterityIntrinsic || 0) + (charData.stats.dexterityFromItems || 0);
  charData.stats.vitality  = (charData.stats.vitalityBase  || classCfg?.baseStats.vitality  || 0) + (charData.stats.vitalityIntrinsic  || 0) + (charData.stats.vitalityFromItems  || 0);
  charData.stats.magic     = (charData.stats.magicBase     || classCfg?.baseStats.magic     || 0) + (charData.stats.magicIntrinsic     || 0) + (charData.stats.magicFromItems     || 0);

  // HP max = healthBase + final vitality (base + intrinsic + item bonuses) + flat HP from items
  charData.stats.healthMax = charData.stats.healthBase + charData.stats.vitality + (charData.stats.healthFromItems || 0);
  charData.stats.health = charData.stats.healthCurrent || charData.stats.healthMax;

  // Offline saves: dashes and flasks are always at max (not separately stored)
  charData.stats.dashCurrent = charData.stats.dashMax || 3;
  if (!charData.stats.potionMax) charData.stats.potionMax = charData.stats.potionCharges || 0;

  // manaMax: null unless MANA_MAX_BONUS was present in the char-stat pass (set directly).
  // manaFromItems accumulates per-item flat-mana bonuses from the equip pass.
  // Fallback: manaBase + magic (already includes magicFromItems finalised on line above).
  // Formula: manaBase + (magicBase + magicIntrinsic + magicFromItems) + manaFromItems.
  if (charData.stats.manaMax === null) {
    charData.stats.manaMax = (charData.stats.manaBase || 0) + (charData.stats.magic || 0);
  }
  charData.stats.manaMax += (charData.stats.manaFromItems || 0);
  charData.stats.mana = charData.stats.manaCurrent || charData.stats.manaMax;

  // Dexterity: DEXTERITY_BASE may be absent (Witch has no base Dex in save)
  // DEX_INTRINSIC bonus + item bonuses = final dex
  // (already accumulated into stats.dexterity via case handlers below)

  // --- Stash: Pass — collect items from STASH container ---
  charData.stash = [];
  const stashByIdx = {};
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const loc  = unit.location;
    if (!loc || loc.owner !== charUnitIdx || loc.container !== CONTAINERS.STASH) continue;

    const bp     = unit.blueprint || '';
    const baName = DH_GUIDS[bp];
    const baseName = baName ? normalizeName(baName) : `Unknown (${bp.slice(0,8)})`;

    const item = {
      name: baseName, slot: null, slotDisplay: null,
      typeDisplay: null, // will be set after slot is known
      blueprint: bp, dbid: unit.dbid || '0x0',
      legendaryName: null, legendaryAffixGuid: null, rareName: null,
      level: null, rarity: null, armor: null,
      damageMin: null, damageMax: null, damageType: null,
      socketCount: 0, sockets: [], socketSlots: [], socketed: [],
      dyeColor: null, dyeColors: null, quantity: null, gemType: null, gemLevel: null, dyeName: null,
      heartSourceBp: null, heartName: null, heartIsUniqueSocket: false,
      affixLines: [], stashIndex: loc.index,
      bagNum: loc.index >> 16,       // = stash row (0–15)
      bagCol: loc.index & 0xFFFF,      // = stash col (0–14) directly
    };

    for (const stat of unit.stats?.data ?? []) {
      const { value: v } = readStat(stat);
      switch (stat.stat) {
        case STAT_GUIDS.LEVEL:         item.level    = v; break;
        case STAT_GUIDS.ITEM_PROG_REQ: item.tomeTier = v; break;
        case STAT_GUIDS.SKILL_TOME_REQ: item.tomeTier = item.tomeTier || v; break;
        case STAT_GUIDS.STAT_REQ_BASE: item.tomeReqValue = v; item.tomeReqAttrProto = stat.params?.p0?.prototype || null; break;
        case STAT_GUIDS.ITEM_MARK:     item.favourite = (v === 2); break;
        case STAT_GUIDS.QUANTITY:      item.quantity = typeof v === 'number' ? v : null; break;
        case STAT_GUIDS.QUALITY:       item.rarity = resolveRarity(stat.prototype); break;
        case STAT_GUIDS.ARMOR_BASE:    item.armor  = (item.armor||0) + v; break;
        case STAT_GUIDS.DMG_BASE_MIN:  item.damageMin = v; break;
        case STAT_GUIDS.DMG_BASE_MAX:  item.damageMax = v; break;
        case STAT_GUIDS.DMG_TYPE:      if (stat.prototype) item.damageType = resolveGuid(stat.prototype); break;
        case STAT_GUIDS.PROPERNAME: {
          // Use the stored proper name if blueprint lookup failed
          const pn = resolveGuid(typeof v === 'string' ? v : stat.prototype);
          if (pn && item.name.startsWith('Unknown')) item.name = pn;
          break;
        }
        case STAT_GUIDS.COMPOSITION: {
          // Fallback name from item composition prototype
          const cn = resolveGuid(typeof v === 'string' ? v : stat.prototype);
          if (cn && item.name.startsWith('Unknown')) item.name = cn;
          break;
        }
        case STAT_GUIDS.RARE_NAME:
          if (stat.string) item.rareName = stat.string;
          break;
        case STAT_GUIDS.SOCKETS: {
          const sockN2 = (typeof v === 'number' && v > 0) ? v : 1;
          item.socketCount = (item.socketCount || 0) + sockN2;
          const _slotP2 = stat.params?.p0?.prototype || '';
          const _slotU2 = _slotP2 === '07826ea7c73d5df40b02785076596196';
          for (let _q2 = 0; _q2 < sockN2; _q2++) item.socketSlots.push(_slotU2 ? 'unique' : 'common');
          break;
        }
        case STAT_GUIDS.CORE_SOURCE:
          if (stat.unitblueprint) item.heartSourceBp = stat.unitblueprint;
          break;
        case STAT_GUIDS.EQUIP_ASPECT: {
          const asp2 = stat.params?.p0?.prototype || stat.prototype;
          if (asp2) {
            const raw2 = (DH_GUIDS[asp2] || '').replace(/^Dye /i,'').replace(/ Appearance Aspect$/i,'').trim();
            if (raw2) {
              item.dyeColor = raw2;
              item.dyeColors = raw2.split(/(?=[A-Z])/).map(s => s.trim()).filter(Boolean);
              if (item.name.startsWith('Unknown')) item.name = 'Dye: ' + raw2;
            }
          }
          break;
        }
      }
    }

    // Apply rare name (overrides material name; legendary name applied later)
    if (item.rareName && !item.legendaryName) item.name = item.rareName;
    // Rune item detection: blueprint = "Rune N Item Unit"
    const RUNE_NUM_TO_NAME = { '1':'Ash Rune', '2':'Bat Rune', '3':'Ka Rune', '4':'Deb Rune', '5':'Elm Rune' };
    const RUNE_NUM_TO_ELEM = { '1':'Health', '2':'Blood', '3':'AoE', '4':'Defend', '5':'Life' };
    if (baName) {
      const runeNm = baName.match(/Rune\s+(\d+)\s+Item/i);
      if (runeNm) {
        const n = String(parseInt(runeNm[1], 10)); // normalize "05" → "5"
        item.runeNum     = n;
        item.runeName    = RUNE_NUM_TO_NAME[n] || ('Rune ' + n);
        item.runeElement = RUNE_NUM_TO_ELEM[n] || null;
        item.name = item.runeName;
        item.slot = 'rune';
        item.slotDisplay = 'Rune';
        item.rarity = item.rarity || 'Common';
      }
    }
    // Gem item detection: blueprint = "Gem {Type} {N} Item Unit"
    if (baName) {
      const gemNm = baName.match(/^Gem\s+(\w+)\s+0?(\d+)\s+Item/i);
      if (gemNm) {
        item.gemType  = gemNm[1].toLowerCase();  // 'amber', 'jade', etc.
        item.gemLevel = parseInt(gemNm[2], 10);  // 1, 2, 3
        const GEM_LEVEL_PREFIX = { 1:'Cracked', 2:'Flawed', 3:'Dull' };
        const prefix = GEM_LEVEL_PREFIX[item.gemLevel] || ('Gem ' + gemNm[1]);
        item.name = prefix + ' ' + gemNm[1].charAt(0).toUpperCase() + gemNm[1].slice(1).toLowerCase();
        item.rarity = item.rarity || 'Common';
        item.slot   = item.slot   || 'gem';
      }
    }
    if (!item.slot) {
      const inferredSlot = inferSlotFromName(item.name) || inferSlotFromName(DH_GUIDS[item.blueprint] || '');
      if (inferredSlot) { item.slot = inferredSlot; item.slotDisplay = SLOT_DISPLAY[inferredSlot] || inferredSlot; }
    }
    // Set typeDisplay now that slot is known
    if (!item.typeDisplay) item.typeDisplay = getItemTypeDisplay(baName, item.slot || '');
    // Core hearts: resolve heartName from source monster blueprint
    // Maps internal DH_GUIDS unit name → heart display name + rarity
    if (item.heartSourceBp) {
      const _srcBpName  = DH_GUIDS[item.heartSourceBp] || '';
      const _heartBpName = DH_GUIDS[item.blueprint] || '';
      let _baseName = _HEART_NAMES_MAP[_srcBpName];
      if (!_baseName) {
        if (_srcBpName) {
          _baseName = _srcBpName.replace(/\s*(Unique|Boss)?\s*Unit\s*$/i,'').replace(/\s+/g,' ').trim();
        } else {
          _baseName = item.heartSourceBp.slice(0,8) + '…';
        }
      }
      // Derive rarity and element from the heart's own blueprint
      let _heartRarity = 'Common';
      if (/\bChampion\b/i.test(_heartBpName))    _heartRarity = 'Champion';
      else if (/\bElite\b/i.test(_heartBpName))  _heartRarity = 'Elite';
      else if (/\bUnique\b/i.test(_heartBpName)) _heartRarity = 'Unique';

      let _heartElement = 'fire';
      if (/\bCold\b/i.test(_heartBpName))            _heartElement = 'cold';
      else if (/\bFire\b/i.test(_heartBpName))        _heartElement = 'fire';
      else if (/\bLightning\b/i.test(_heartBpName))   _heartElement = 'lightning';
      else if (/\bNature\b/i.test(_heartBpName))      _heartElement = 'nature';
      else if (/\bShadow\b/i.test(_heartBpName))      _heartElement = 'shadow';

      const _namePrefix = _heartRarity === 'Champion' ? 'Champion '
                        : _heartRarity === 'Elite'     ? 'Elite '
                        : '';
      item.heartName            = _namePrefix + _baseName + ' Heart';
      item.name                 = item.heartName;
      item.heartRarity          = _heartRarity;
      item.heartElement         = _heartElement;
      item.heartIsUniqueSocket  = _UNIQUE_HEART_MONSTERS.has(_srcBpName);
      item.slot        = 'core';
      item.slotDisplay = 'Core';
    }
    // Dye items: resolve display name.
    // Primary: blueprint GUID lookup (each dye type has a distinct blueprint in some save variants).
    // Fallback: internal appearance-aspect color string mapping.
    if (item.dyeColor && (item.name === 'Dye' || item.name.endsWith(' Dye'))) {
      // Blueprint → dye display name (catalog prototype GUIDs from game data)
      const _DYE_BP = {
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
      // Color string → dye display name (appearance aspect mapping — used when all dyes share one blueprint)
      const _DYE_NAMES = {
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
      const dyeDisplayName = _DYE_BP[item.blueprint] || _DYE_NAMES[item.dyeColor];
      if (dyeDisplayName) {
        item.name = dyeDisplayName + ' Dye';
        item.dyeName = dyeDisplayName;
        item.typeDisplay = 'Common Dye';
      }
    }
    // Tome usage: cross-reference tomeTier against character intrinsics.
    if (item.slot === 'tome' && item.tomeTier) {
      const _bn = (baName || '').toLowerCase();
      const _intrinsicCount =
        _bn.includes('vigor')   ? (charData.stats.vitalityIntrinsic  || 0) :
        _bn.includes('might')   ? (charData.stats.strengthIntrinsic  || 0) :
        _bn.includes('agility') ? (charData.stats.dexterityIntrinsic || 0) :
        _bn.includes('power')   ? (charData.stats.magicIntrinsic     || 0) :
        -1;
      if (_intrinsicCount >= 0) item.tomeUsed = (_intrinsicCount >= item.tomeTier);
    }

    stashByIdx[i] = item;
    charData.stash.push(item);
  }

  // Stash affixes pass
  // Build affix-index → stash item map for BONUS_STATS lookup
  const stashAffixOwner = {};
  for (let i = 0; i < units.length; i++) {
    const u3 = units[i];
    if (!u3.location) continue;
    if (u3.location.container !== CONTAINERS.AFFIXES) continue;
    const p3 = stashByIdx[u3.location.owner];
    if (p3) stashAffixOwner[i] = p3;
  }

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const loc  = unit.location;
    if (!loc) continue;
    const isStashAffix = loc.container === CONTAINERS.AFFIXES;
    const isStashBonus = loc.container === CONTAINERS.BONUS_STATS;
    if (!isStashAffix && !isStashBonus) continue;
    const parent = stashByIdx[loc.owner] || stashAffixOwner[loc.owner] || null;
    if (!parent) continue;

    // Track socketed items in stash items
    if (isStashBonus) {
      const sbpName = DH_GUIDS[unit.blueprint||''] || '';
      const sIsHeart = /core/i.test(sbpName), sIsRune = /rune/i.test(sbpName);
      const sType = sIsHeart ? 'heart' : sIsRune ? 'rune' : 'gem';
      let sRarity = 'Common', sName = null, sHeartRarity = undefined, sHeartElement = undefined;

      if (sIsHeart) {
        let heartSrcBp2 = null;
        for (const _st2 of unit.stats?.data ?? []) {
          if (_st2.stat === STAT_GUIDS.CORE_SOURCE && _st2.unitblueprint) { heartSrcBp2 = _st2.unitblueprint; break; }
        }
        if (heartSrcBp2) {
          const srcBpName2   = DH_GUIDS[heartSrcBp2] || '';
          const heartInfo2   = resolveHeartInfo(srcBpName2, sbpName);
          sName              = heartInfo2.name;
          sRarity            = heartInfo2.rarity;
          sHeartRarity       = heartInfo2.rarity;
          sHeartElement      = heartInfo2.element;
        } else {
          if (/\bChampion\b/i.test(sbpName))    { sRarity = 'Champion'; sHeartRarity = 'Champion'; }
          else if (/\bElite\b/i.test(sbpName))  { sRarity = 'Elite';    sHeartRarity = 'Elite'; }
          else if (/\bunique\b/i.test(sbpName)) { sRarity = 'Unique';   sHeartRarity = 'Unique'; }
          sName = resolveSocketItemName(sbpName) || normalizeName(sbpName) || null;
        }
      } else {
        sName = resolveSocketItemName(sbpName) || normalizeName(sbpName) || null;
        for (const _st2 of unit.stats?.data ?? []) {
          if (_st2.stat === STAT_GUIDS.QUALITY) { sRarity = resolveRarity(_st2.prototype) || 'Common'; break; }
        }
        if (sRarity === 'Common' && /unique/i.test(sbpName))     sRarity = 'Unique';
        else if (sRarity === 'Common' && /rare/i.test(sbpName))  sRarity = 'Rare';
        else if (sRarity === 'Common' && /magic/i.test(sbpName)) sRarity = 'Magic';
        else if (sRarity === 'Common' && /legendary/i.test(sbpName)) sRarity = 'Legendary';
      }

      if (!parent.socketed) parent.socketed = [];
      parent.socketed.push({ type: sType, rarity: sRarity, heartRarity: sHeartRarity, heartElement: sHeartElement, name: sName || sType });
    }

    const bp      = unit.blueprint || '';
    const legName = LEGENDARY_AFFIX_NAMES[bp];
    if (legName && !parent.legendaryName) {
      parent.legendaryName     = legName;
      parent.legendaryAffixGuid = bp;
      parent.name              = legName;
      if (!parent.rarity) parent.rarity = 'Legendary';
    }
    // Propagate SOCKETS stat from affix unit to parent stash item
    if (isStashAffix) {
      for (const _sst of unit.stats?.data ?? []) {
        if (_sst.stat !== STAT_GUIDS.SOCKETS) continue;
        const { value: _ssv } = readStat(_sst);
        const _ssn = (typeof _ssv === 'number' && _ssv > 0) ? _ssv : 1;
        parent.socketCount = (parent.socketCount || 0) + _ssn;
        const _ssp = _sst.params?.p0?.prototype || '';
        const _ssu = _ssp === '07826ea7c73d5df40b02785076596196';
        if (!parent.socketSlots) parent.socketSlots = [];
        for (let _sk = 0; _sk < _ssn; _sk++) parent.socketSlots.push(_ssu ? 'unique' : 'common');
      }
    }
    const lines = buildAffixLines(unit);
    for (const ln of lines) parent.affixLines.push(ln);
  }

  return charData;
}
