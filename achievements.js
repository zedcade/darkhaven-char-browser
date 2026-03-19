// achievements.js — Darkhaven achievement definitions and beast catalogue
// These are unofficial fan curated achievements based on in-game content, not actual in-game achievements.
// ---------------------------------------------------------------------------
// Loaded as a plain <script> tag after gamedata.js and bestiary.js.
// Provides:
//   BEAST_CATALOGUE   — (species × rarity) kill-tracking entries
//   BEAST_TOTAL       — pre-computed total entry count
//   ACHIEVEMENT_BP    — blueprint GUIDs for specific named bosses
//   ACHIEVEMENT_DEFS  — all achievement categories and their achievements
//
// The tracking state and rendering logic live in app.js.
// This file is PURE DATA — to add an achievement, add it here only.
//
// ── BEAST_CATALOGUE entry structure ───────────────────────────────────────
//   species  {string}        — display name for the species card
//   entries  [{bp, rarity}]  — one entry per (blueprint GUID × rarity)
//   expandable {boolean?}    — if true, the card in the UI is collapsible
//                              (used for Hunter Extraordinaire's beast grid)
//
// ── ACHIEVEMENT_DEFS category structure ───────────────────────────────────
//   category     {string}   — unique key (used for localStorage collapse state)
//   label        {string}   — section display name
//   icon         {string}   — emoji for the section header
//   achievements [...]      — ordered list of achievement entries
//
// ── Achievement entry structure ────────────────────────────────────────────
//   id          {string}   — unique key (used for localStorage expand state)
//   name        {string}   — display name shown in the card header
//   desc        {string}   — description shown below the name
//   expandable  {boolean?} — if true, renders an expand/collapse toggle
//                            (the beast grid sub-content is built by app.js
//                             based on the 'hunter_extraordinaire' id)
//   evaluate    {function} — (state) → { earned, progress, progressMax }
//                            progressMax = 0 means no progress bar
//
// ── State object passed to evaluate() ─────────────────────────────────────
//   s.beastKilled    {object}  "bp|rarity" → bool, true if ≥1 kill
//   s.beastDone      {number}  count of (bp|rarity) pairs with ≥1 kill
//   s.beastTotal     {number}  BEAST_TOTAL
//   s.narlathakKills {number}  total Narlathak kills across all chars
//   s.leviathanKills {number}  total Leviathan kills across all chars
//   s.totalKills     {number}  grand total kills across all chars
//   s.legFound       {number}  distinct legendaries found (any char)
//   s.legTotal       {number}  LEGENDARY_CATALOGUE.length
//   s.tattooMax      {number}  max filled tattoo slots on any single char
//   s.runesInTattoos {Set}     rune nums (1–5) present in tattoos any char
//   s.skillBranchMax {number}  max fully-maxed skill branches on any char
//   s.fullArsenal    {boolean} any char has all 3 branches assigned
//   s.deathsMax      {number}  highest death count on any single char
//   s.deathFree      {boolean} any char reached level 20 with 0 deaths
//   s.hoarder        {boolean} any legendary found ≥3 times
//   s.gemsInStash    {Set}     gem types ('amber','jade',...) seen in stash
//
// Last updated: patch 0.0.23609 (2026-03-16)
// ---------------------------------------------------------------------------

// ── Beast catalogue ─────────────────────────────────────────────────────────
// Each entry = one species with every (blueprint GUID × rarity) kill to track.
// Only combinations that actually exist in-game are listed per species.
const BEAST_CATALOGUE = [
  // ── Barrow Knights ─────────────────────────────────────────────────────────
  { species:'Barrow Knight (Blunt)',   entries:[{ bp:'5358dd17a27de2c419f353a6a7fb0cea', rarity:'Normal' }]},
  { species:'Barrow Knight',           entries:[
    { bp:'f28094abdc2654f45a02bfaed002317d', rarity:'Normal' },
    { bp:'f28094abdc2654f45a02bfaed002317d', rarity:'Elite'  }]},
  { species:'Disgraced Paladin',       entries:[{ bp:'22cd6f4baf72ac943990d1c9d2e7f0f6', rarity:'Unique' }]},

  // ── Blight Roaches ─────────────────────────────────────────────────────────
  { species:'Blight Roach',            entries:[
    { bp:'361ef9853fab58940b4328e832b19e73', rarity:'Normal'          },
    { bp:'361ef9853fab58940b4328e832b19e73', rarity:'Elite'           },
    { bp:'361ef9853fab58940b4328e832b19e73', rarity:'Champion'        },
    { bp:'361ef9853fab58940b4328e832b19e73', rarity:'Champion Minion' }]},
  { species:'Giant Blight Roach',      entries:[
    { bp:'6298e5ec318de6e4e952086319a82cb8', rarity:'Normal'          },
    { bp:'6298e5ec318de6e4e952086319a82cb8', rarity:'Elite'           },
    { bp:'6298e5ec318de6e4e952086319a82cb8', rarity:'Champion'        },
    { bp:'6298e5ec318de6e4e952086319a82cb8', rarity:'Champion Minion' }]},

  // ── Bogies ─────────────────────────────────────────────────────────────────
  { species:'Bogie Bomb Thrower',      entries:[
    { bp:'99f26babee4e8724f842ebb6eead2d33', rarity:'Normal'          },
    { bp:'99f26babee4e8724f842ebb6eead2d33', rarity:'Elite'           },
    { bp:'99f26babee4e8724f842ebb6eead2d33', rarity:'Champion'        },
    { bp:'99f26babee4e8724f842ebb6eead2d33', rarity:'Champion Minion' }]},
  { species:'Bogie Chopper',           entries:[
    { bp:'d0227c83ef9eaf54da2096d5e0bd1693', rarity:'Normal'          },
    { bp:'d0227c83ef9eaf54da2096d5e0bd1693', rarity:'Elite'           },
    { bp:'d0227c83ef9eaf54da2096d5e0bd1693', rarity:'Champion'        },
    { bp:'d0227c83ef9eaf54da2096d5e0bd1693', rarity:'Champion Minion' }]},
  { species:'Bogie Feral',             entries:[
    { bp:'e6769a7a8112d8942855db1f69f6808e', rarity:'Normal'   },
    { bp:'e6769a7a8112d8942855db1f69f6808e', rarity:'Elite'    },
    { bp:'e6769a7a8112d8942855db1f69f6808e', rarity:'Champion' }]},
  { species:'Bogie Feral Magma',       entries:[
    { bp:'745736227f970f14b82e439cc34025bc', rarity:'Normal' },
    { bp:'745736227f970f14b82e439cc34025bc', rarity:'Elite'  }]},
  { species:'Rokkudokin',              entries:[{ bp:'4b44f26ef7fac194a80f3e2fe53c6349', rarity:'Unique' }]},
  { species:'Bogie Spearman',          entries:[
    { bp:'f4c329883f4f1df48b2645fb0f6f071b', rarity:'Normal'          },
    { bp:'f4c329883f4f1df48b2645fb0f6f071b', rarity:'Elite'           },
    { bp:'f4c329883f4f1df48b2645fb0f6f071b', rarity:'Champion'        },
    { bp:'f4c329883f4f1df48b2645fb0f6f071b', rarity:'Champion Minion' }]},
  { species:'Bogie Tyrant',            entries:[
    { bp:'e4295282e4e6fb34d923d6255383a2d7', rarity:'Normal'          },
    { bp:'e4295282e4e6fb34d923d6255383a2d7', rarity:'Elite'           },
    { bp:'e4295282e4e6fb34d923d6255383a2d7', rarity:'Champion Minion' }]},
  { species:'Warren Chief',            entries:[{ bp:'617854e717f433a4a91111560f532cf6', rarity:'Champion' }]},

  // ── Bone Legion ────────────────────────────────────────────────────────────
  { species:'Bone Legion (Unarmed)',   entries:[
    { bp:'8d0e558ff089ed749afd9f3ea17fed0a', rarity:'Normal'   },
    { bp:'8d0e558ff089ed749afd9f3ea17fed0a', rarity:'Elite'    },
    { bp:'8d0e558ff089ed749afd9f3ea17fed0a', rarity:'Champion' }]},
  { species:'Bone Legion (Blunt)',     entries:[
    { bp:'e741e350726b8a04b887491569272a05', rarity:'Normal' },
    { bp:'e741e350726b8a04b887491569272a05', rarity:'Elite'  }]},
  { species:'Bone Legion (Slashing)',  entries:[
    { bp:'fd4e8b14db3e78640824ed07fe39c511', rarity:'Normal' },
    { bp:'fd4e8b14db3e78640824ed07fe39c511', rarity:'Elite'  }]},
  { species:'Bone Legion (2H Blunt)',  entries:[
    { bp:'9376e6a42150fc642a30f8c875065bcd', rarity:'Normal'          },
    { bp:'9376e6a42150fc642a30f8c875065bcd', rarity:'Elite'           },
    { bp:'9376e6a42150fc642a30f8c875065bcd', rarity:'Champion Minion' }]},
  { species:'Bone Legion (2H Slash)',  entries:[
    { bp:'8c1ee1e6fc9580e4bae8c9b71ec97388', rarity:'Normal' },
    { bp:'8c1ee1e6fc9580e4bae8c9b71ec97388', rarity:'Elite'  }]},
  { species:'Bone Legion (2H Spear)', entries:[
    { bp:'8818faf3a5760424e9a33a581cef2f28', rarity:'Normal' },
    { bp:'8818faf3a5760424e9a33a581cef2f28', rarity:'Elite'  }]},

  // ── Bramblehusks ───────────────────────────────────────────────────────────
  { species:'Bramblehusk',             entries:[{ bp:'7356b62a5732fd349b7f211e5fc3bc55', rarity:'Normal' }]},
  { species:'Bramblehusk (Melee)',     entries:[{ bp:'b9d3299bc57411042b99650a8a48d826', rarity:'Normal' }]},
  { species:'Old Granddad',            entries:[{ bp:'09b2ef95b7ec95d4b99d88441399d413', rarity:'Unique' }]},

  // ── Council Aspirant ───────────────────────────────────────────────────────
  { species:'Council Aspirant',        entries:[{ bp:'8db4934532073824088fa1183c0aa9b3', rarity:'Elite'  }]},

  // ── Crypt Roach ────────────────────────────────────────────────────────────
  { species:'Crypt Roach',             entries:[
    { bp:'4c73e64c575a7e24fa82bfc2a6003696', rarity:'Normal' },
    { bp:'4c73e64c575a7e24fa82bfc2a6003696', rarity:'Elite'  }]},

  // ── Deep Ones ──────────────────────────────────────────────────────────────
  { species:'Deep Ones',               entries:[
    { bp:'58452b90094a5484ba8c0dd90df6ba72', rarity:'Normal'          },
    { bp:'58452b90094a5484ba8c0dd90df6ba72', rarity:'Elite'           },
    { bp:'58452b90094a5484ba8c0dd90df6ba72', rarity:'Champion'        },
    { bp:'58452b90094a5484ba8c0dd90df6ba72', rarity:'Champion Minion' }]},
  { species:'Deep Ones (Docile)',      entries:[
    { bp:'4b04299fde94c1e42ad972aa386d559a', rarity:'Normal' },
    { bp:'4b04299fde94c1e42ad972aa386d559a', rarity:'Elite'  }]},
  { species:'Deep Ones (Mini)',        entries:[{ bp:'5d06323d042fc2a45ab444e0230b327e', rarity:'Normal' }]},
  { species:'Riptide Horror',          entries:[{ bp:'056601646fc750146be48d6e7c84f3db', rarity:'Unique' }]},

  // ── Doomed Soldiers ────────────────────────────────────────────────────────
  { species:'Doomed Soldier (Unarmed)',entries:[{ bp:'c024cc5a898a53f41a5d36c021a29f20', rarity:'Normal' }]},
  { species:'Doomed Soldier (Blunt)',  entries:[
    { bp:'bde8616c5912a2e48a6f4eec31be9d56', rarity:'Normal' },
    { bp:'bde8616c5912a2e48a6f4eec31be9d56', rarity:'Elite'  }]},
  { species:'Doomed Soldier (Slash)',  entries:[{ bp:'2d21dfaef875e454184f030c6e8f91ed', rarity:'Normal' }]},
  { species:'Doomed Soldier (2H Bl.)',entries:[{ bp:'ec97abf2f01c7d84faa3c72bfbe6e766', rarity:'Normal' }]},
  { species:'Doomed Soldier (2H Sl.)',entries:[
    { bp:'adf09f858922f9a48a9341b3a69ed4fb', rarity:'Normal' },
    { bp:'adf09f858922f9a48a9341b3a69ed4fb', rarity:'Elite'  }]},
  { species:'Doomed Soldier (Spear)', entries:[
    { bp:'5684d640c9981684abb99e7114850cf8', rarity:'Normal' },
    { bp:'5684d640c9981684abb99e7114850cf8', rarity:'Elite'  }]},

  // ── Gazers ─────────────────────────────────────────────────────────────────
  { species:'Gazer',                   entries:[
    { bp:'ebc01332b20c1234cbc77535e1f92419', rarity:'Normal'          },
    { bp:'ebc01332b20c1234cbc77535e1f92419', rarity:'Champion'        },
    { bp:'ebc01332b20c1234cbc77535e1f92419', rarity:'Champion Minion' }]},
  { species:'Gazer (False)',           entries:[{ bp:'8999e759725ae9f40ada2b7cf5922e1f', rarity:'Normal' }]},
  { species:'Goke the Intruder',       entries:[{ bp:'cbfef513c94cf864ea2c945a5c87b80d', rarity:'Unique' }]},

  // ── Gloom ──────────────────────────────────────────────────────────────────
  { species:'Gloom Parasite',          entries:[{ bp:'f0cfc12dde7095c47a86568f9938fe60', rarity:'Boss'   }]},
  { species:'Gloomkin Grunt',          entries:[{ bp:'3e77bb91ba826ab46acb07512ad42515', rarity:'Normal' }]},

  // ── Gobkins ────────────────────────────────────────────────────────────────
  { species:'Gobkin Grunt',            entries:[{ bp:'af72b438990b26f4c888818e71fc46a7', rarity:'Normal' }]},
  { species:'Gobkin Slinger',          entries:[{ bp:'3d8ed0307494048408a8299fe5eac6c5', rarity:'Normal' }]},

  // ── Gulpjaws ───────────────────────────────────────────────────────────────
  { species:'Gulpjaw',                 entries:[
    { bp:'c3f5ac2eb37a81540b9a0aa85e67e61c', rarity:'Normal'          },
    { bp:'c3f5ac2eb37a81540b9a0aa85e67e61c', rarity:'Elite'           },
    { bp:'c3f5ac2eb37a81540b9a0aa85e67e61c', rarity:'Champion'        },
    { bp:'c3f5ac2eb37a81540b9a0aa85e67e61c', rarity:'Champion Minion' }]},
  { species:'Gulpjaw (Cave Salaman.)', entries:[{ bp:'82c40585c8adecd4292481d31d3dfab2', rarity:'Normal' }]},
  { species:'Blubberjaw',              entries:[{ bp:'e85d736511eba9f489cb848803b5f835', rarity:'Unique' }]},

  // ── Named Champions (fixed world encounters) ───────────────────────────────
  { species:'Baragon',                 entries:[
    { bp:'e4125f2c852acfa4d81dfe8b98bfc11e', rarity:'Named'    },
    { bp:'e4125f2c852acfa4d81dfe8b98bfc11e', rarity:'Champion' }]},
  { species:'Burial Knight',           entries:[
    { bp:'f9f5953c9a271004ebfbd33ca7552e02', rarity:'Named'    },
    { bp:'f9f5953c9a271004ebfbd33ca7552e02', rarity:'Champion' }]},
  { species:'Clonus Horror',           entries:[{ bp:'207eb2c6c2e0b5246b16b558bc4fb248', rarity:'Champion' }]},
  { species:'Gulpjaw (Named)',         entries:[
    { bp:'825fb6728dff88343a6d71c021d70063', rarity:'Named'    },
    { bp:'825fb6728dff88343a6d71c021d70063', rarity:'Champion' }]},
  { species:'Salazar',                 entries:[
    { bp:'09b846aff69ac714d882721387843921', rarity:'Named'    },
    { bp:'09b846aff69ac714d882721387843921', rarity:'Champion' }]},
  { species:'Tunnel Thug',             entries:[
    { bp:'842eae4f5f88e3c4fb172775607e7273', rarity:'Named'    },
    { bp:'842eae4f5f88e3c4fb172775607e7273', rarity:'Champion' }]},

  // ── Leviathan ──────────────────────────────────────────────────────────────
  { species:'Leviathan',               entries:[{ bp:'5276244482e51ef40951cf89ba3566ab', rarity:'Unique' }]},

  // ── Living Corpses ─────────────────────────────────────────────────────────
  { species:'Living Corpse',           entries:[
    { bp:'a70a43c12d1869945ae85eeb11649aab', rarity:'Normal' },
    { bp:'a70a43c12d1869945ae85eeb11649aab', rarity:'Elite'  }]},
  { species:'Living Corpse (Ember)',   entries:[
    { bp:'70b7bbb7551ee394f9fcf97adc4e0473', rarity:'Normal'          },
    { bp:'70b7bbb7551ee394f9fcf97adc4e0473', rarity:'Champion'        },
    { bp:'70b7bbb7551ee394f9fcf97adc4e0473', rarity:'Champion Minion' }]},

  // ── Necro Knights ──────────────────────────────────────────────────────────
  { species:'Necro Knight (Blunt)',    entries:[{ bp:'0c678a5c4cc1fff4b8a9b5b5e020fffa', rarity:'Normal' }]},
  { species:'Necro Knight (Slash)',    entries:[
    { bp:'da7522a801f9f2349a6ad4e2d6068924', rarity:'Normal'   },
    { bp:'da7522a801f9f2349a6ad4e2d6068924', rarity:'Champion' }]},

  // ── Necro Legion ───────────────────────────────────────────────────────────
  { species:'Necro Legion (Blunt)',    entries:[
    { bp:'90f98653f884a6b4581f573554bda333', rarity:'Normal' },
    { bp:'90f98653f884a6b4581f573554bda333', rarity:'Elite'  }]},
  { species:'Necro Legion (Slash)',    entries:[
    { bp:'feb1092e3284a8f46931d6bab2086e03', rarity:'Normal' },
    { bp:'feb1092e3284a8f46931d6bab2086e03', rarity:'Elite'  }]},
  { species:'Necro Legion (2H Blunt)',entries:[{ bp:'7c76074a425ad384c89e7e149c947031', rarity:'Normal' }]},
  { species:'Necro Legion (2H Slash)',entries:[{ bp:'dea9176d2beb8c645b012a38d93688e6', rarity:'Normal' }]},
  { species:'Necro Legion (2H Spear)',entries:[
    { bp:'a1f873e08be73e748a1840e0cd319210', rarity:'Normal' },
    { bp:'a1f873e08be73e748a1840e0cd319210', rarity:'Elite'  }]},

  // ── Narlathak ──────────────────────────────────────────────────────────────
  { species:'Narlathak',               entries:[{ bp:'875c95c4cf0f7354ea216079c4d479fb', rarity:'Boss'   }]},

  // ── Seafang ────────────────────────────────────────────────────────────────
  { species:'Seafang',                 entries:[
    { bp:'7ac1e91696ae73349a8fb306ed34f766', rarity:'Normal'          },
    { bp:'7ac1e91696ae73349a8fb306ed34f766', rarity:'Elite'           },
    { bp:'7ac1e91696ae73349a8fb306ed34f766', rarity:'Champion'        },
    { bp:'7ac1e91696ae73349a8fb306ed34f766', rarity:'Champion Minion' }]},

  // ── Skeleton Mages ─────────────────────────────────────────────────────────
  { species:'Skeleton Mage (Fire)',    entries:[
    { bp:'d2ba2e9672c687a42b539a88a5028be9', rarity:'Normal' },
    { bp:'d2ba2e9672c687a42b539a88a5028be9', rarity:'Elite'  }]},
  { species:'Skeleton Mage (Frost)',   entries:[{ bp:'7e6b467574f768e45ab5705401d8beea', rarity:'Normal' }]},
  { species:'Skeleton Mage (Light.)',  entries:[{ bp:'3564232e836cf914fa21c8f2a5d5e9e9', rarity:'Normal' }]},
  { species:'Skeleton Mage (Shadow)', entries:[{ bp:'87a2f7f48406e3f42a6ef2856bea9871', rarity:'Normal' }]},
  { species:'Council of Five',         entries:[{ bp:'3210511e261afbb40a2cc341129ae7cd', rarity:'Unique' }]},

  // ── Skelezombs ─────────────────────────────────────────────────────────────
  { species:'Skelezomb (Blunt)',       entries:[{ bp:'fc6fcaf0b73184141affe02fadb3d8df', rarity:'Normal' }]},
  { species:'Skelezomb (2H Blunt)',    entries:[{ bp:'217b32308b034ed43b6d5ce071cc6b51', rarity:'Normal' }]},
  { species:'Skelezomb (2H Slash)',    entries:[{ bp:'b236c7729cd31d649ab888c08e6e9fae', rarity:'Normal' }]},

  // ── Swamp Husks ────────────────────────────────────────────────────────────
  { species:'Swamp Husk',              entries:[
    { bp:'3ca6a162794aba94b96d1e9ec6d1041b', rarity:'Normal'   },
    { bp:'3ca6a162794aba94b96d1e9ec6d1041b', rarity:'Elite'    },
    { bp:'3ca6a162794aba94b96d1e9ec6d1041b', rarity:'Champion' }]},
  { species:'Char Root',               entries:[{ bp:'d8012e9b4025f7840b2284bae61af550', rarity:'Unique' }]},

  // ── Thorn Husks ────────────────────────────────────────────────────────────
  { species:'Thorn Husk',              entries:[
    { bp:'c3d8a4c94c1174b4eb061c998604660d', rarity:'Normal' },
    { bp:'c3d8a4c94c1174b4eb061c998604660d', rarity:'Elite'  }]},
  { species:'Thorn Husk (Melee)',      entries:[{ bp:'c8a8a6cd168713c47a6b6fd053862449', rarity:'Normal' }]},

  // ── Undead ─────────────────────────────────────────────────────────────────
  { species:'Undead Destroyer',        entries:[{ bp:'23b6e919c2fb7f24b8be0fd1a79250d0', rarity:'Normal' }]},
  { species:'Wraith',                  entries:[{ bp:'b2b5dae4a23b7194bb3dfd8ab32adcfa', rarity:'Normal' }]},

  // ── Zhark ──────────────────────────────────────────────────────────────────
  { species:'Zhark',                   entries:[
    { bp:'064da5f0cd749354290362b23d337386', rarity:'Normal'   },
    { bp:'064da5f0cd749354290362b23d337386', rarity:'Elite'    },
    { bp:'064da5f0cd749354290362b23d337386', rarity:'Champion' }]},
];

// Pre-computed total — number of (species × rarity) kill pairs to track
const BEAST_TOTAL = BEAST_CATALOGUE.reduce((sum, sp) => sum + sp.entries.length, 0);

// ── Blueprint GUIDs for specific bosses ────────────────────────────────────
const ACHIEVEMENT_BP = {
  narlathak: '875c95c4cf0f7354ea216079c4d479fb',
  leviathan: '5276244482e51ef40951cf89ba3566ab',
};

// ── Achievement definitions ─────────────────────────────────────────────────
// To add an achievement: add an entry below. No other file needs changing.
const ACHIEVEMENT_DEFS = [

  // ── Beastmaster ────────────────────────────────────────────────────────────
  {
    category: 'beastmaster',
    label: 'Beastmaster',
    icon: '🐾',
    achievements: [
      {
        id: 'hunter_extraordinaire',
        name: 'Hunter Extraordinaire',
        desc: "Kill each of Darkhaven's beasts in every rarity they appear.",
        expandable: true,  // beast grid rendered by app.js for this id
        evaluate: s => ({ earned: s.beastDone === s.beastTotal, progress: s.beastDone, progressMax: s.beastTotal }),
      },
      {
        id: 'finnfighter',
        name: 'FinnFighter',
        desc: 'Kill Leviathan.',
        evaluate: s => ({ earned: s.leviathanKills >= 1, progress: s.leviathanKills, progressMax: 1 }),
      },
      {
        id: 'leviathan_club',
        name: 'Leviathan Club',
        desc: 'Kill Leviathan 25 times.',
        evaluate: s => ({ earned: s.leviathanKills >= 25, progress: s.leviathanKills, progressMax: 25 }),
      },
      {
        id: 'lum_made_me_do_it',
        name: 'Lum made me do it',
        desc: 'Kill Narlathak.',
        evaluate: s => ({ earned: s.narlathakKills >= 1, progress: s.narlathakKills, progressMax: 1 }),
      },
      {
        id: 'doomslayer',
        name: 'Doomslayer',
        desc: 'Kill Narlathak 666 times.',
        evaluate: s => ({ earned: s.narlathakKills >= 666, progress: s.narlathakKills, progressMax: 666 }),
      },
      {
        id: 'veteran',
        name: 'Veteran',
        desc: 'Accumulate 10,000 kills across all characters.',
        evaluate: s => ({ earned: s.totalKills >= 10000, progress: s.totalKills, progressMax: 10000 }),
      },
    ],
  },

  // ── Treasure Master ────────────────────────────────────────────────────────
  {
    category: 'treasure_master',
    label: 'Treasure Master',
    icon: '💎',
    achievements: [
      {
        id: 'keeper_of_the_legendaries',
        name: 'Keeper of the Legendaries',
        desc: 'Find all Legendary items at least once across your characters.',
        evaluate: s => ({ earned: s.legFound === s.legTotal, progress: s.legFound, progressMax: s.legTotal }),
      },
      {
        id: 'hoarder',
        name: 'Hoarder',
        desc: 'Find the same Legendary item 3 or more times.',
        evaluate: s => ({ earned: s.hoarder, progress: s.hoarder ? 1 : 0, progressMax: 0 }),
      },
      {
        id: 'the_collector',
        name: 'The Collector',
        desc: 'Have every gem type in your stash (Amber, Jade, Lapis, Ruby, Opal, Onyx).',
        evaluate: s => ({
          earned: ['amber','jade','lapis','ruby','opal','onyx'].every(g => s.gemsInStash.has(g)),
          progress: s.gemsInStash.size,
          progressMax: 6,
        }),
      },
    ],
  },

  // ── Inkmaster ──────────────────────────────────────────────────────────────
  {
    category: 'inkmaster',
    label: 'Inkmaster',
    icon: '🖋',
    achievements: [
      {
        id: 'tattooist_thirteenth_order',
        name: 'Tattooist of the Thirteenth Order',
        desc: 'Fill all 13 tattoo slots on a single character.',
        evaluate: s => ({ earned: s.tattooMax >= 13, progress: s.tattooMax, progressMax: 13 }),
      },
      {
        id: 'alchemist',
        name: 'Alchemist',
        desc: 'Have all 5 rune types inscribed across your tattoos (Ash, Bat, Ka, Deb, Elm).',
        evaluate: s => ({
          earned: ['1','2','3','4','5'].every(r => s.runesInTattoos.has(r)),
          progress: s.runesInTattoos.size,
          progressMax: 5,
        }),
      },
      {
        id: 'first_ink',
        name: 'First Ink',
        desc: 'Apply your first tattoo.',
        evaluate: s => ({ earned: s.runesInTattoos.size > 0, progress: Math.min(s.runesInTattoos.size, 1), progressMax: 1 }),
      },
    ],
  },

  // ── Skillmaster ────────────────────────────────────────────────────────────
  {
    category: 'skillmaster',
    label: 'Skillmaster',
    icon: '⚡',
    achievements: [
      {
        id: 'lethal_weapon_i',
        name: 'Lethal Weapon I',
        desc: 'Max out all skills in one Skill Branch on a single character.',
        evaluate: s => ({ earned: s.skillBranchMax >= 1, progress: Math.min(s.skillBranchMax, 1), progressMax: 1 }),
      },
      {
        id: 'lethal_weapon_ii',
        name: 'Lethal Weapon II',
        desc: 'Max out all skills in two Skill Branches on a single character.',
        evaluate: s => ({ earned: s.skillBranchMax >= 2, progress: Math.min(s.skillBranchMax, 2), progressMax: 2 }),
      },
      {
        id: 'lethal_weapon_iii',
        name: 'Lethal Weapon III',
        desc: 'Max out all skills in all three Skill Branches on a single character.',
        evaluate: s => ({ earned: s.skillBranchMax >= 3, progress: Math.min(s.skillBranchMax, 3), progressMax: 3 }),
      },
      {
        id: 'the_full_arsenal',
        name: 'The Full Arsenal',
        desc: 'Have all 3 Skill Branches assigned on a single character.',
        evaluate: s => ({ earned: s.fullArsenal, progress: s.fullArsenal ? 1 : 0, progressMax: 0 }),
      },
    ],
  },

  // ── Survivor ───────────────────────────────────────────────────────────────
  {
    category: 'survivor',
    label: 'Survivor',
    icon: '💀',
    achievements: [
      {
        id: 'death_is_for_others',
        name: 'Death is for Others',
        desc: 'Reach level 20 without dying on a single character.',
        evaluate: s => ({ earned: s.deathFree, progress: s.deathFree ? 1 : 0, progressMax: 0 }),
      },
      {
        id: 'deathwish',
        name: 'Deathwish',
        desc: 'Die 100 times on a single character.',
        evaluate: s => ({ earned: s.deathsMax >= 100, progress: Math.min(s.deathsMax, 100), progressMax: 100 }),
      },
    ],
  },

];

// ── Expose as window globals ───────────────────────────────────────────────
if (typeof window !== 'undefined') {
  window.BEAST_CATALOGUE  = BEAST_CATALOGUE;
  window.BEAST_TOTAL      = BEAST_TOTAL;
  window.ACHIEVEMENT_BP   = ACHIEVEMENT_BP;
  window.ACHIEVEMENT_DEFS = ACHIEVEMENT_DEFS;
}
