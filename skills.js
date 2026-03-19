// skills.js — Darkhaven skill branch / upgrade definitions
// ---------------------------------------------------------------------------
// Provides: SKILLS_DEF  (consumed by app.js as BRANCH_DEF)
//
// Structure:
//   SKILLS_DEF = [
//     {
//       key:    string   — display name for the branch column header
//       match:  string   — prefix matched against skillBranches[].name from the save
//       skills: [
//         {
//           raw:      string   — skill name as it appears in save data (skillLevels[].skill)
//           display:  string   — human-readable display name
//           icon:     string   — relative path to skill icon image
//           dmg:      string   — damage type label (or '—')
//           cost:     string   — mana cost label (or '—')
//           scaling:  string   — attribute scaling or weapon damage label
//           tag:      string   — mechanic tags (· separated)
//           desc:     string   — tooltip description
//           requires: string?  — optional prerequisite label
//           upgrades: [
//             {
//               name:        string    — upgrade display name
//               proto:       string?   — prototype GUID from save for reliable matching
//               max:         number    — maximum upgrade level
//               requires:    string?   — optional prerequisite label
//               glyphBonus:  boolean?  — true if glyphChanceBonus applies
//               glyphBases:  number[]? — base % values per level (when glyphBonus=true)
//               levels:      string[]  — description per level (length === max)
//             }
//           ]
//         }
//       ]
//     }
//   ]
// ---------------------------------------------------------------------------

const SKILLS_DEF = [
  {
    key: 'Blood & Bone',
    match: 'Blood and Bone',
    skills: [
      {
        raw: 'Witch Blood Lash', display: 'Blood Lash',
        icon: 'img/skills/skill_blood_lash.png',
        dmg: 'Shadow', cost: '12 mana', scaling: 'Magic · Vitality', tag: 'Tether · Drain · Blood',
        desc: 'Lash distant target and reel it in. Consecutive swings boost attack speed. Gain 4.9% MANA on hit.',
        upgrades: [
          {
            name: 'Blood Rage', proto: '4790c83599850c24fb58bef8964894ed', max: 4,
            levels: [
              'Attack Speed boost lasts 5 seconds',
              'Attack Speed boost lasts 10 seconds',
              'Attack Speed boost lasts 15 seconds',
              'Attack Speed boost lasts 20 seconds',
            ],
          },
          {
            name: 'Ichor', proto: '6a52831d1e9610447a035afaa2e3801b', max: 3,
            levels: [
              'Wield 2 grappling tethers',
              'Wield 3 grappling tethers',
              'Wield 5 grappling tethers',
            ],
          },
          {
            name: 'Leech', proto: '282ceefefe661bd4ab06b049da4f335f', max: 3,
            levels: [
              'Gain 1% Life from target on hit',
              'Gain 2% Life from target on hit',
              'Gain 3% Life from target on hit',
            ],
          },
          {
            name: 'Blood Glyph', proto: '8f8b9de71cb09c54b92cb261689ab66f', max: 4,
            requires: 'Evocation', glyphBonus: true, glyphBases: [12, 20, 28, 36],
            levels: [
              '12% chance of Blood Glyph on kill — Blood Glyphs apply a bleed when evoked',
              '20% chance of Blood Glyph on kill — Blood Glyphs apply a bleed when evoked',
              '28% chance of Blood Glyph on kill — Blood Glyphs apply a bleed when evoked',
              '36% chance of Blood Glyph on kill — Blood Glyphs apply a bleed when evoked',
            ],
          },
        ],
      },
      {
        raw: 'Witch Bone Storm', display: 'Bone Storm',
        icon: 'img/skills/skill_bone_storm.png',
        dmg: 'Physical', cost: '25 mana', scaling: 'Magic', tag: 'AoE · Bone',
        desc: 'Fire a rapid blast of bone shard missiles.',
        upgrades: [
          {
            name: 'Bone Glyph', proto: '443b10d8d3ec1c248b3758eefddd557a', max: 4,
            glyphBonus: true, glyphBases: [20, 33, 40, 45],
            levels: [
              '20% chance of Bone Glyph on kill — Bone Glyphs apply a stun when evoked',
              '33% chance of Bone Glyph on kill — Bone Glyphs apply a stun when evoked',
              '40% chance of Bone Glyph on kill — Bone Glyphs apply a stun when evoked',
              '45% chance of Bone Glyph on kill — Bone Glyphs apply a stun when evoked',
            ],
          },
          {
            name: 'Impel', max: 3,
            levels: [
              'Applies a 200 strength knockback',
              'Applies a 300 strength knockback',
              'Applies a 400 strength knockback',
            ],
          },
          {
            name: 'Echo', max: 3,
            levels: [
              'Reflecting shots ×2',
              'Reflecting shots ×3',
              'Reflecting shots ×4',
            ],
          },
        ],
      },
    ],
  },

  {
    key: 'Glyph',
    match: 'Witch Glyph',
    skills: [
      {
        raw: 'Witch Glyph Lunge', display: 'Glyph Lunge',
        icon: 'img/skills/skill_glyph_lunge.png',
        dmg: '—', cost: '—', scaling: '150% weapon damage', tag: 'Basic Attack · Evocation · Focusing · Melee',
        requires: 'Weapon',
        desc: 'Lunges at a nearby target dealing 150% weapon damage and a 14% chance of generating a random Glyph. Three glyphs form a Spell — trigger Spells with Evocation skills.',
        upgrades: [
          {
            name: 'Reprise', max: 3,
            levels: [
              '40% chance an evoked Spell remains to be used again',
              '60% chance an evoked Spell remains to be used again',
              '80% chance an evoked Spell remains to be used again',
            ],
          },
        ],
      },
      {
        raw: 'Witch Spine Breaker', display: 'Spine Breaker',
        icon: 'img/skills/skill_spine_breaker.png',
        dmg: 'Physical', cost: '10 mana', scaling: 'Magic', tag: 'Projectile · Bone',
        desc: 'Launches bone projectiles that shatter on impact, dealing physical damage.',
        upgrades: [
          {
            name: 'Shadow Glyph', proto: '3d215a015edeff4489a50df7975816e9', max: 4,
            requires: 'Evocation',
            levels: [
              '30% chance of Shadow Glyph on kill — Shadow Glyphs return mana when evoked',
              '50% chance of Shadow Glyph on kill — Shadow Glyphs return mana when evoked',
              '70% chance of Shadow Glyph on kill — Shadow Glyphs return mana when evoked',
              '80% chance of Shadow Glyph on kill — Shadow Glyphs return mana when evoked',
            ],
          },
          {
            name: 'Adept', proto: '4c8493e66ebc14a4caae68081feeac98', max: 3,
            levels: [
              'Decrease Mana cost by 15%',
              'Decrease Mana cost by 30%',
              'Decrease Mana cost by 45%',
            ],
          },
          {
            name: 'Stun', max: 5,
            levels: [
              '40% chance to Stun for 3 seconds',
              '45% chance to Stun for 4.5 seconds',
              '50% chance to Stun for 6 seconds',
              '55% chance to Stun for 7.5 seconds',
              '60% chance to Stun for 9 seconds',
            ],
          },
          {
            name: 'Umbra', max: 3,
            levels: [
              'Trail of shadow lasting 3 seconds, dealing shadow damage to targets within',
              'Trail of shadow lasting 6 seconds, dealing shadow damage to targets within',
              'Trail of shadow lasting 9 seconds, dealing shadow damage to targets within',
            ],
          },
        ],
      },
    ],
  },

  {
    key: 'Shadow',
    match: 'Witch Shadow',
    skills: [
      {
        raw: 'Witch Crows', display: 'Feast for Crows',
        icon: 'img/skills/skill_feast_for_crows.png',
        dmg: 'Shadow', cost: '—', scaling: '—', tag: 'Basic Attack · Melee · Shadow',
        desc: 'On hit summons a Crow to your flock [Limit 5] for 20 seconds with a 5% chance of leaving a MANA ORB on release. Divebomb crows with STAND (Shift) or other FOCUSING skills.',
        upgrades: [
          {
            name: 'Flock', max: 2,
            levels: [
              'Gather a flock up to 8 Crows',
              'Gather a flock up to 11 Crows',
            ],
          },
          {
            name: 'Murder', proto: '9d3ac0c038c58034f8f217c54f70cef9', max: 3,
            levels: [
              '2% chance on hit to release a spiraling murder of Vicious Crow ×12',
              '3% chance on hit to release a spiraling murder of Vicious Crow ×14',
              '4% chance on hit to release a spiraling murder of Vicious Crow ×16',
            ],
          },
        ],
      },
      {
        raw: 'Witch Shadow Walk', display: 'Shadow Walk',
        icon: 'img/skills/skill_shadow_walk.png',
        dmg: 'Shadow', cost: '18 mana', scaling: 'Magic', tag: 'Teleport · Invulnerability · Shadow',
        desc: 'Teleport to location where enemies within 2 meters are knocked back and Cursed. The curse lowers their defenses and returns health to the Witch when killed.',
        upgrades: [
          {
            name: 'Cypher', max: 3,
            requires: 'Evocation',
            levels: [
              '20% chance of a glyph on cursed kills',
              '33% chance of a glyph on cursed kills',
              '40% chance of a glyph on cursed kills',
            ],
          },
          {
            name: 'Expanse', max: 2,
            levels: [
              'Extend the area of effect to 5 meters',
              'Extend the area of effect to 8 meters',
            ],
          },
          {
            name: 'Scourge', proto: 'ce04da600ddc71d45aa161b1619b08e6', max: 3,
            levels: [
              '1× Scourge lasting 5 seconds — each stack lowers target\'s resistances',
              '2× Scourge lasting 7 seconds — each stack lowers target\'s resistances',
              '3× Scourge lasting 10 seconds — each stack lowers target\'s resistances',
            ],
          },
        ],
      },
    ],
  },
];
