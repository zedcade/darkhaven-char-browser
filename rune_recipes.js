// rune_recipes.js — Darkhaven runewords and Puzzle Box crafting recipes
// ---------------------------------------------------------------------------
// Provides: RUNE_RECIPES  (object with keys: runewords, puzzle_box_recipes)
//
// To add or change recipes, edit this file only — no app.js changes needed.
// Last updated: patch 0.0.23609 (2026-03-16)
// ---------------------------------------------------------------------------

const RUNE_RECIPES = {

  // ── Runewords ──────────────────────────────────────────────────────────────
  // Inserted into socketed items by slotting runes in the listed order.
  runewords: [
    { name: 'Unforgivable Act of Violence', sockets: 2, slot_type: 'weapon',  runes: ['ash', 'ka'],                          added_patch: 'pre-0.0.23609' },
    { name: 'Faith Is My Shield',           sockets: 2, slot_type: 'armor',   runes: ['ash', 'bat'],                         added_patch: 'pre-0.0.23609' },
    { name: 'Blood of Lambs',               sockets: 3, slot_type: 'dagger',  runes: ['elm', 'bat', 'ash'],                  added_patch: '0.0.23609' },
    { name: 'Tender are Their Eyes',        sockets: 4, slot_type: 'dagger',  runes: ['bat', 'elm', 'ash', 'ka'],            added_patch: '0.0.23609' },
    { name: 'One Hard Knock to the Head',   sockets: 5, slot_type: 'staff',   runes: ['deb', 'ash', 'bat', 'bat', 'ash'],    added_patch: '0.0.23609' },
    { name: 'Skyfather, Heed My Call',      sockets: 6, slot_type: 'staff',   runes: ['ash', 'elm', 'deb', 'ash', 'ka', 'ash'], added_patch: '0.0.23609' },
    { name: 'One Thousand Stars',           sockets: 3, slot_type: 'belt',    runes: ['deb', 'elm', 'ka'],                   added_patch: '0.0.23609' },
    { name: 'Mandate of Heaven',            sockets: 4, slot_type: 'helm',    runes: ['deb', 'bat', 'ka', 'ash'],            added_patch: '0.0.23609' },
  ],

  // ── Puzzle Box Recipes ─────────────────────────────────────────────────────
  // Combine ingredients in the Puzzle Box to produce the listed result.
  puzzle_box_recipes: [

    // Gem upgrades
    { result: '1× Flawed Gem (any type)',  ingredients: ['3× Cracked Gem (same type)'],                                          added_patch: 'pre-0.0.23609', notes: 'Type must match across all 3 gems' },
    { result: '1× Dull Gem (any type)',    ingredients: ['3× Flawed Gem (same type)'],                                           added_patch: 'pre-0.0.23609', notes: 'Type must match across all 3 gems' },

    // Rune upgrades / downgrades
    { result: 'Downgraded Rune + 2× Cracked Gem', ingredients: ['1× Rune (any)'],                                               added_patch: 'pre-0.0.23609', notes: 'Destroys the rune in exchange for gems' },
    { result: 'Upgraded Rune',             ingredients: ['1× Rune (any)', '2× Flawed Gem'],                                     added_patch: 'pre-0.0.23609' },

    // Unsocket
    { result: 'Unsocket (destructive) — item returned, socketables destroyed', ingredients: ['1× Socketed Item', '1× Cracked Gem'],  added_patch: 'pre-0.0.23609' },
    { result: 'Unsocket (preservative) — item and socketables returned',       ingredients: ['1× Socketed Item', '1× Ash Rune'],     added_patch: 'pre-0.0.23609' },

    // Dye
    { result: 'Rerolled Dye',              ingredients: ['2× Dye'],                                                             added_patch: 'pre-0.0.23609' },

    // Socketing
    { result: 'Add Socket to item',        ingredients: ['1× Item with no sockets', '1× Elm Rune'],                             added_patch: '0.0.23609' },

    // Magic rerolls
    { result: 'Reroll Magic Amulet',       ingredients: ['1× Magic Amulet', '2× Dull Gem'],                                     added_patch: '0.0.23609' },
    { result: 'Reroll Magic Ring or Flask', ingredients: ['1× Magic Ring or Flask', '2× Flawed Gem'],                           added_patch: '0.0.23609' },
    { result: 'Reroll Magic Weapon or Armor', ingredients: ['1× Magic Weapon or Armor', '3× Cracked Gem'],                      added_patch: '0.0.23609' },

    // Rare rerolls
    { result: 'Reroll Rare Amulet',        ingredients: ['1× Rare Amulet', '1× Bat Rune', '1× Dull Gem'],                      added_patch: '0.0.23609' },
    { result: 'Reroll Rare Ring or Flask', ingredients: ['1× Rare Ring or Flask', '1× Bat Rune', '1× Flawed Gem'],              added_patch: '0.0.23609' },
    { result: 'Reroll Rare Weapon or Armor', ingredients: ['1× Rare Weapon or Armor', '1× Bat Rune', '2× Cracked Gem'],         added_patch: '0.0.23609' },

    // Imbue
    { result: 'Fire Imbue socketed item',  ingredients: ['1× Common Item with ≥1 empty socket', '1× Fire Heart (Bogie Feral, Skeleton Mage [fire], or Ember Ghoul)', '1× Cracked Ruby'], added_patch: '0.0.23609', notes: 'Item must be common quality with at least one empty socket' },
  ],
};

// ── RUNE_DATA ──────────────────────────────────────────────────────────────────
// Consolidated rune reference data consumed by app.js.
// Centralised here so updates (new runes, changed effects) only need one edit.
// ---------------------------------------------------------------------------
const RUNE_DATA = {

  // Rune number → current image filename
  img: {
    '1': 'rune01_ash.png',
    '2': 'rune02_bat.png',
    '3': 'rune03_ka.png',
    '4': 'rune04_deb.png',
    '5': 'rune05_elm.png',
  },

  // Rune number → legacy image filename (fallback if current not found)
  img_legacy: {
    '1': 'rune_ash.png',
    '2': 'rune_bat.png',
    '3': 'rune_ka.png',
    '4': 'rune_deb.png',
    '5': 'rune_elm.png',
  },

  // Lowercase display name → rune number (for resolving socketed rune items by name)
  name_to_num: {
    'ash rune': '1',
    'bat rune': '2',
    'ka rune':  '3',
    'deb rune': '4',
    'elm rune': '5',
  },

  // Rune number → tattoo slot effect description
  tattoo_effect: {
    '1': 'Lightning shocks nearby enemies during your Glyph Lunge.',
    '2': 'Blood Lash has a 50% chance to entangle enemies.',
    '3': 'You are limited to 2 Crows, but they are eternal.',
    '4': 'Your Spine Breaker follows an arcing path.',
    '5': 'Your Bone Storm fires multiple missiles of blood rather than bone.',
  },

  // Rune number → array of { slots, effect } for socketing into gear
  socket_effects: {
    '1': [
      { slots: 'Weapon, Helm, Gloves',       effect: '+11 Attack' },
      { slots: 'Chest, Belt, Boots, Shield', effect: '+11 Armor' },
    ],
    '2': [
      { slots: 'Weapon',                     effect: '25% chance to Bleed on hit' },
      { slots: 'Helm, Gloves',               effect: '+20% Bleed Duration' },
      { slots: 'Chest, Shield',              effect: '+25% Reduced Bleed Duration' },
      { slots: 'Belt, Boots',               effect: '+0.2/s Life Regen' },
    ],
    '3': [
      { slots: 'Weapon',                     effect: '+13% Shadow Penetration' },
      { slots: 'Any armor piece',            effect: '+3% Magic Find' },
    ],
    '4': [
      { slots: 'Weapon',                     effect: '+13% Blunt Penetration' },
      { slots: 'Helm, Gloves',               effect: '+20% Stun Duration' },
      { slots: 'Chest, Shield',              effect: '+20% Reduced Stun Duration' },
      { slots: 'Belt, Boots',               effect: '+5% Gold Find' },
    ],
    '5': [
      { slots: 'Weapon',                     effect: '+13% Slashing Penetration' },
      { slots: 'Helm, Gloves',               effect: '+20% Bleed Duration' },
      { slots: 'Chest, Shield',              effect: '+20% Reduced Bleed Duration' },
      { slots: 'Belt, Boots',               effect: '+1 Stamina' },
    ],
  },
};
