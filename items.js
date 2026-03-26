// items.js — Darkhaven item catalogue: base items, legendaries, images
// ---------------------------------------------------------------------------
// Provides:
//   BASE_ITEMS           — every non-legendary base item in the game
//   LEGENDARY_CATALOGUE  — static list of all legendary items
//   LEG_IMAGES           — legendary id → image filename
//
// BASE_ITEMS entry structure:
//   name       {string}   — in-game display name (matches normalizeName output)
//   category   {string}   — "armours" | "weapons" | "jewelry" | "gems" |
//                           "runes" | "dyes" | "tomes" | "special"
//   slot       {string}   — slot key used in SLOT_INDEX_TO_KEY / SLOT_DISPLAY,
//                           or "—" for unslotted consumables
//   rarity     {string}   — "variable" (can be Common/Magic/Rare) |
//                           "Common" | "special" (unique base, not rarity-rolled) |
//                           "Extraordinary Tome" | "Legendary Puzzle Box"
//   reqLevel   {number|null} — required character level, null = no requirement
//
// "variable" rarity means the item can drop as Common (white), Magic (blue),
// or Rare (yellow). "special" means it is a unique base type that does not
// roll standard rarity tiers (e.g. Shadowgrips, Tunic).
//
// LEGENDARY_CATALOGUE entry structure:
//   id     {string}  — "Legendary SlotNN" key matching LEGENDARY_AFFIX_NAMES
//   name   {string}  — in-game display name
//   cat    {string}  — category label (for grouping in the UI)
//   slot   {string}  — slot display label (used for tooltip / icon fallback)
//
// To add a new base item: append to BASE_ITEMS.
// To add a newly discovered legendary: append to LEGENDARY_CATALOGUE and add
// its image filename to LEG_IMAGES. No other file needs changing.
//
// Last updated: patch 0.0.23609 (2026-03-16)
// baseSpeed: weapon base attack speed (attacks/sec). Used by app.js tooltip for Attacks/s and DPS calc.
// ---------------------------------------------------------------------------

// ── Base item catalogue ────────────────────────────────────────────────────
const BASE_ITEMS = [

  // ── Jewelry ───────────────────────────────────────────────────────────────
  { name:'Amulet',               category:'jewelry',  slot:'neck',       rarity:'variable',           reqLevel:null },
  { name:'Ancient Ring',         category:'jewelry',  slot:'ring',       rarity:'variable',           reqLevel:null },
  { name:'Blue Gem Ring',        category:'jewelry',  slot:'ring',       rarity:'variable',           reqLevel:null },

  // ── Armours — Belts ───────────────────────────────────────────────────────
  { name:'Cord Belt',            category:'armours',  slot:'waist',      rarity:'variable',           reqLevel:null },
  { name:'Hard Leather Belt',    category:'armours',  slot:'waist',      rarity:'variable',           reqLevel:null },
  { name:'Soft Leather Belt',    category:'armours',  slot:'waist',      rarity:'variable',           reqLevel:null },
  { name:'Studded Leather Belt', category:'armours',  slot:'waist',      rarity:'variable',           reqLevel:null },

  // ── Armours — Boots ───────────────────────────────────────────────────────
  { name:'Cinderstep Clompers',  category:'armours',  slot:'feet',       rarity:'special',            reqLevel:null },
  { name:'Hard Leather Boots',   category:'armours',  slot:'feet',       rarity:'variable',           reqLevel:null },
  { name:'Moccasins',            category:'armours',  slot:'feet',       rarity:'variable',           reqLevel:null },
  { name:'Soft Leather Boots',   category:'armours',  slot:'feet',       rarity:'variable',           reqLevel:null },
  { name:'Studded Leather Boots',category:'armours',  slot:'feet',       rarity:'variable',           reqLevel:null },
  { name:'Wavewalkers',          category:'armours',  slot:'feet',       rarity:'special',            reqLevel:null },

  // ── Armours — Chest ───────────────────────────────────────────────────────
  { name:'Hard Leather Armor',   category:'armours',  slot:'chest',      rarity:'variable',           reqLevel:null },
  { name:'Padded Armor',         category:'armours',  slot:'chest',      rarity:'variable',           reqLevel:null },
  { name:'Soft Leather Armor',   category:'armours',  slot:'chest',      rarity:'variable',           reqLevel:null },
  { name:'Studded Leather Armor',category:'armours',  slot:'chest',      rarity:'variable',           reqLevel:null },
  { name:'Tunic',                category:'armours',  slot:'chest',      rarity:'special',            reqLevel:null },

  // ── Armours — Gloves ──────────────────────────────────────────────────────
  { name:'Heavy Leather Gloves', category:'armours',  slot:'hands',      rarity:'variable',           reqLevel:null },
  { name:'Padded Gloves',        category:'armours',  slot:'hands',      rarity:'variable',           reqLevel:null },
  { name:'Shadowgrips',          category:'armours',  slot:'hands',      rarity:'special',            reqLevel:null },
  { name:'Soft Leather Gloves',  category:'armours',  slot:'hands',      rarity:'variable',           reqLevel:null },
  { name:'Studded Leather Gloves',category:'armours', slot:'hands',      rarity:'variable',           reqLevel:null },

  // ── Armours — Helms ───────────────────────────────────────────────────────
  { name:'Hard Leather Mask',    category:'armours',  slot:'head',       rarity:'variable',           reqLevel:null },
  { name:'Hood',                 category:'armours',  slot:'head',       rarity:'variable',           reqLevel:null },
  { name:'Soft Leather Veil',    category:'armours',  slot:'head',       rarity:'variable',           reqLevel:null },
  { name:'Studded Leather Cap',  category:'armours',  slot:'head',       rarity:'variable',           reqLevel:null },

  // ── Armours — Shields ─────────────────────────────────────────────────────
  { name:'Banded Heater',        category:'armours',  slot:'hand_left',  rarity:'variable',           reqLevel:null },
  { name:'Buckler',              category:'armours',  slot:'hand_left',  rarity:'variable',           reqLevel:null },
  { name:'Carapace Shield',      category:'armours',  slot:'hand_left',  rarity:'variable',           reqLevel:null },
  { name:'Heater Shield',        category:'armours',  slot:'hand_left',  rarity:'variable',           reqLevel:null },
  { name:'Round Shield',         category:'armours',  slot:'hand_left',  rarity:'variable',           reqLevel:null },
  { name:'Targe',                category:'armours',  slot:'hand_left',  rarity:'variable',           reqLevel:null },

  // ── Weapons — Main Hand (Daggers & One-Handed) ────────────────────────────
  { name:'Bodkin',               category:'weapons',  slot:'hand_right', rarity:'variable',           reqLevel:null, baseSpeed:1.666666667 },
  { name:'Dagger',               category:'weapons',  slot:'hand_right', rarity:'variable',           reqLevel:null, baseSpeed:1.666666667 },
  { name:'Duskshear',            category:'weapons',  slot:'hand_right', rarity:'special',            reqLevel:null, baseSpeed:1.666666667 },
  { name:'Gibbering Stabber',    category:'weapons',  slot:'hand_right', rarity:'special',            reqLevel:null, baseSpeed:1.515 },
  { name:'Knife',                category:'weapons',  slot:'hand_right', rarity:'variable',           reqLevel:null, baseSpeed:1.666666667 },
  { name:'Poignard',             category:'weapons',  slot:'hand_right', rarity:'variable',           reqLevel:null, baseSpeed:1.666666667 },
  { name:'Ripfury Claw',         category:'weapons',  slot:'hand_right', rarity:'special',            reqLevel:null, baseSpeed:1.922 },
  { name:'Ritual Dagger',        category:'weapons',  slot:'hand_right', rarity:'variable',           reqLevel:null, baseSpeed:1.4492 },
  { name:'Sacrificial Knife',    category:'weapons',  slot:'hand_right', rarity:'variable',           reqLevel:null, baseSpeed:1.45 },
  { name:'Sword',                category:'weapons',  slot:'hand_right', rarity:'variable',           reqLevel:null, baseSpeed:1.1  },
  { name:'Tyrant',               category:'weapons',  slot:'hand_right', rarity:'variable',           reqLevel:null, baseSpeed:0.9  },
  { name:'Crystal Shard',        category:'weapons',  slot:'hand_right', rarity:'variable',           reqLevel:null, baseSpeed:1.1  },

  // ── Weapons — Two-Handed (Staves) ─────────────────────────────────────────
  { name:'Bramble Staff',        category:'weapons',  slot:'twohand',    rarity:'special',            reqLevel:null, baseSpeed:1.03 },
  { name:'The Golden Bough',     category:'weapons',  slot:'twohand',    rarity:'legendary',            reqLevel:null, baseSpeed:1.159 },
  { name:'Crystal Shard Staff', category:'weapons',  slot:'twohand',    rarity:'variable',           reqLevel:null, baseSpeed:1.11111111111111 },
  { name:'Gnarled Staff',        category:'weapons',  slot:'twohand',    rarity:'variable',           reqLevel:null, baseSpeed:1.11111111111111 },
  { name:'Snagtooth Pike',       category:'weapons',  slot:'twohand',    rarity:'special',            reqLevel:null, baseSpeed:1.25 },
  { name:'Spired Staff',         category:'weapons',  slot:'twohand',    rarity:'variable',           reqLevel:null, baseSpeed:1.1109 },
  { name:'Thorn Staff',          category:'weapons',  slot:'twohand',    rarity:'special',            reqLevel:null, baseSpeed:1.00 },
  { name:'Twin Pronged Staff',   category:'weapons',  slot:'twohand',    rarity:'variable',           reqLevel:null, baseSpeed:1.11111111111111 },
  { name:"Tyrant's Staff",       category:'weapons',  slot:'twohand',    rarity:'special',            reqLevel:null, baseSpeed:1.00 },

  // ── Gems ──────────────────────────────────────────────────────────────────
  { name:'Cracked Amber',        category:'gems',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Flawed Amber',         category:'gems',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Dull Amber',           category:'gems',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Cracked Jade',         category:'gems',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Flawed Jade',          category:'gems',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Dull Jade',            category:'gems',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Cracked Lapis',        category:'gems',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Flawed Lapis',         category:'gems',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Dull Lapis',           category:'gems',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Cracked Onyx',         category:'gems',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Flawed Onyx',          category:'gems',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Dull Onyx',            category:'gems',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Cracked Opal',         category:'gems',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Flawed Opal',          category:'gems',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Dull Opal',            category:'gems',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Cracked Ruby',         category:'gems',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Flawed Ruby',          category:'gems',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Dull Ruby',            category:'gems',     slot:'—',          rarity:'Common',             reqLevel:null },

  // ── Runes ─────────────────────────────────────────────────────────────────
  { name:'Ash Rune',             category:'runes',    slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Bat Rune',             category:'runes',    slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Ka Rune',              category:'runes',    slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Deb Rune',             category:'runes',    slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Elm Rune',             category:'runes',    slot:'—',          rarity:'Common',             reqLevel:null },

  // ── Dyes ──────────────────────────────────────────────────────────────────
  { name:'Cadet Dye',            category:'dyes',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Cinnibar Dye',         category:'dyes',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Eventide Dye',         category:'dyes',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Hornet Dye',           category:'dyes',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Kingfisher Dye',       category:'dyes',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Lion Dye',             category:'dyes',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Monarch Dye',          category:'dyes',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Nimbus Dye',           category:'dyes',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Queen of Night Dye',   category:'dyes',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Royal Dye',            category:'dyes',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Serengeti Dye',        category:'dyes',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Syringa Dye',          category:'dyes',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Tigress Dye',          category:'dyes',     slot:'—',          rarity:'Common',             reqLevel:null },
  { name:'Ursa Major Dye',       category:'dyes',     slot:'—',          rarity:'Common',             reqLevel:null },

  // ── Tomes ─────────────────────────────────────────────────────────────────
  // Attribute tomes grant a permanent intrinsic stat bonus when consumed
  { name:'Tome of Agility',      category:'tomes',    slot:'—',          rarity:'Extraordinary Tome', reqLevel:null },
  { name:'Tome of Might',        category:'tomes',    slot:'—',          rarity:'Extraordinary Tome', reqLevel:null },
  { name:'Tome of Power',        category:'tomes',    slot:'—',          rarity:'Extraordinary Tome', reqLevel:null },
  { name:'Tome of Vigor I',      category:'tomes',    slot:'—',          rarity:'Extraordinary Tome', reqLevel:null },
  // Skill tomes unlock or upgrade skill upgrades
  { name:'Tome of Blood Lash I', category:'tomes',    slot:'—',          rarity:'Extraordinary Tome', reqLevel:null },
  { name:'Tome of Shadow Walk I',category:'tomes',    slot:'—',          rarity:'Extraordinary Tome', reqLevel:null },
  { name:'Tome of Skill',        category:'tomes',    slot:'—',          rarity:'Extraordinary Tome', reqLevel:null },
  { name:'Tome of Talents',      category:'tomes',    slot:'—',          rarity:'Extraordinary Tome', reqLevel:null },

  // ── Special ───────────────────────────────────────────────────────────────
  { name:"Murakami's Puzzle Box", category:'special', slot:'—',          rarity:'Legendary Puzzle Box', reqLevel:null },
];

const LEGENDARY_CATALOGUE = [
  // ── Amulets ───────────────────────────────────────────────────────────────
  { id:'Legendary Amulet01', name:'Heart of White Mountain',        cat:'Amulets', slot:'Amulet'    },
  { id:'Legendary Amulet02', name:'Key of Silver Flame',            cat:'Amulets', slot:'Amulet'    },
  { id:'Legendary Amulet03', name:'Mouth of Madness',               cat:'Amulets', slot:'Amulet'    },
  // ── Belts ─────────────────────────────────────────────────────────────────
  { id:'Legendary Belt01',   name:'Misery Cord',                    cat:'Belts',   slot:'Belt'      },
  { id:'Legendary Belt03',   name:"War Goddess's Girdle",           cat:'Belts',   slot:'Belt'      },
  // ── Boots ─────────────────────────────────────────────────────────────────
  { id:'Legendary Boots01',  name:'Hushpaws',                       cat:'Boots',   slot:'Boots'     },
  { id:'Legendary Boots02',  name:'Twin Hurricanes',                cat:'Boots',   slot:'Boots'     },
  { id:'Legendary Boots04',  name:'Voidstalkers',                   cat:'Boots',   slot:'Boots'     },
  // ── Chest ─────────────────────────────────────────────────────────────────
  { id:'Legendary Chest01',  name:"Night's Embrace",                cat:'Chest',   slot:'Chest'     },
  { id:'Legendary Chest02',  name:"Johann's Mystic Dreamcoat",      cat:'Chest',   slot:'Chest'     },
  { id:'Legendary Chest07',  name:'Bloody Bones',                   cat:'Chest',   slot:'Chest'     },
  // ── Daggers ───────────────────────────────────────────────────────────────
  { id:'Legendary Dagger01', name:'Grimalkin',                      cat:'Daggers', slot:'Main Hand' },
  { id:'Legendary Dagger02', name:'Flickerfang',                    cat:'Daggers', slot:'Main Hand' },
  { id:'Legendary Dagger03', name:'Shiver',                         cat:'Daggers', slot:'Main Hand' },
  { id:'Legendary Dagger04', name:'Emberthorn',                     cat:'Daggers', slot:'Main Hand' },
  { id:'Legendary Dagger06', name:'Sorcere',                        cat:'Daggers', slot:'Main Hand' },
  // ── Flasks ────────────────────────────────────────────────────────────────
  { id:'Legendary Flask01',  name:'Holy Flask',                     cat:'Flasks',  slot:'Flask'     },
  { id:'Legendary Flask03',  name:'Legendary Flask 3',              cat:'Flasks',  slot:'Flask'     },
  // ── Gloves ────────────────────────────────────────────────────────────────
  { id:'Legendary Gloves01', name:'Fenix Fingers',                  cat:'Gloves',  slot:'Gloves'    },
  { id:'Legendary Gloves03', name:"Johann's Bedazzlers",            cat:'Gloves',  slot:'Gloves'    },
  { id:'Legendary Gloves06', name:'Gloom Talon',                    cat:'Gloves',  slot:'Gloves'    },
  // ── Helms ─────────────────────────────────────────────────────────────────
  { id:'Legendary Helm01',   name:"Executioner's Hood",             cat:'Helms',   slot:'Helm'      },
  { id:'Legendary Helm02',   name:"Midnight's Veil",                cat:'Helms',   slot:'Helm'      },
  { id:'Legendary Helm06',   name:'Visage of the Undying',          cat:'Helms',   slot:'Helm'      },
  // ── Rings ─────────────────────────────────────────────────────────────────
  { id:'Legendary Ring01',   name:'Bastion',                        cat:'Rings',   slot:'Ring'      },
  { id:'Legendary Ring02',   name:"Johann's Glory",                 cat:'Rings',   slot:'Ring'      },
  // ── Shields ───────────────────────────────────────────────────────────────
  { id:'Legendary Shield01', name:'Falce di Luna',                  cat:'Shields', slot:'Off Hand'  },
  { id:'Legendary Shield02', name:'Spearbreaker',                   cat:'Shields', slot:'Off Hand'  },
  // ── Staves ────────────────────────────────────────────────────────────────
  { id:'Legendary Staff01',  name:'Wormwood Crook',                 cat:'Staves',  slot:'Main Hand' },
  { id:'Legendary Staff02',  name:'The Golden Bough',               cat:'Staves',  slot:'Main Hand' },
  { id:'Legendary Staff05',  name:'The Arvinrod',                   cat:'Staves',  slot:'Main Hand' },
];

// ── Legendary image filenames ──────────────────────────────────────────────
// Key: legendary id string.  Value: filename under img/items/.
// Missing entries fall back to a slot emoji icon in the UI — no error thrown.
const LEG_IMAGES = {
  'Legendary Amulet01': 'l_amulet01_heart_of_white_mountain.webp',
  'Legendary Amulet02': 'l_amulet02_key_of_silver_flame.webp',
  'Legendary Amulet03': 'l_amulet03_mouth_of_madness.webp',
  'Legendary Belt01':   'l_belt01_misery_cord.webp',
  'Legendary Belt03':   'l_belt03_war_godesses_girdle.webp',
  'Legendary Boots01':  'l_boots01_hushpaws.webp',
  'Legendary Boots02':  'l_boots02_twin_hurricanes.webp',
  'Legendary Boots04':  'l_boots04_voidwalkers.webp',
  'Legendary Chest01':  'l_chest01_nights_embrace.webp',
  'Legendary Chest02':  'l_chest02_johanns_mystic_dreamcoat.webp',
  'Legendary Chest07':  'l_chest07_bloody_bones.webp',
  'Legendary Dagger01': 'l_dagger01_grimalkin.webp',
  'Legendary Dagger02': 'l_dagger02_flickerfang.webp',
  'Legendary Dagger03': 'l_dagger03_shiver.webp',
  'Legendary Dagger04': 'l_dagger04_emberthorn.webp',
  'Legendary Dagger06': 'l_dagger06_sorcere.webp',
  'Legendary Flask01':  'l_flask01_holy_flask.webp',
  'Legendary Flask03':  'l_flask03_name.webp',
  'Legendary Gloves01': 'l_gloves01_fenix_fingers.webp',
  'Legendary Gloves03': 'l_gloves03_johanns_bedazzlers.webp',
  'Legendary Gloves06': 'l_gloves06_gloom_talon.webp',
  'Legendary Helm01':   'l_helm01_executioners_hood.webp',
  'Legendary Helm02':   'l_helm02_midnights_veil.webp',
  'Legendary Helm06':   'l_helm06_visage_of_the_undying.webp',
  'Legendary Ring01':   'l_ring01_bastion.webp',
  'Legendary Ring02':   'l_ring02_johanns_glory.webp',
  'Legendary Shield01': 'l_shield01_falce_di_luna.webp',
  'Legendary Shield02': 'l_shield02_spearbreaker.webp',
  'Legendary Staff01':  'l_staff01_wormwood_crook.webp',
  'Legendary Staff02':  'l_staff02_the_golden_bough.webp',
  'Legendary Staff05':  'l_staff05_the_arvinrod.webp',
};

// ── Expose as window globals ───────────────────────────────────────────────
if (typeof window !== 'undefined') {
  window.BASE_ITEMS          = BASE_ITEMS;
  window.LEGENDARY_CATALOGUE = LEGENDARY_CATALOGUE;
  window.LEG_IMAGES          = LEG_IMAGES;
}
