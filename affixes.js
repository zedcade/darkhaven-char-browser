// affixes.js — Darkhaven affix detail dictionary
// ---------------------------------------------------------------------------
// Provides: DH_AFFIXES
//
// Schema per entry:
//   affixName  {string}  — display name shown in-game (prefix/suffix label)
//   style      {string}  — "Prefix" | "Suffix" | "Both" | "JewelrySuffix" | "Implicit"
//   tier       {number|null} — 1/2/3 for tiered affixes; null for un-tiered
//   stats      {Array}   — [{statName, min, max}] raw stat ranges
//
// Notes:
//   • "Both" = can appear as either prefix or suffix depending on item type
//   • "JewelrySuffix" = suffix that only appears on jewelry slots
//   • "Implicit" = inherent item property, not a rolled affix
//   • min/max are strings; some are tuples "(0, 0)" for type-only affixes
//   • Multiple entries may share the same affixName (same affix, different
//     slot pools or item categories)
// ---------------------------------------------------------------------------

const DH_AFFIXES = {

  // ── Armor Bonus ──────────────────────────────────────────────────────────
  "3ba6ac3d7d2f52f1cb46b87dbbc35d1d": {
    affixName: "of Defense",
    style: "Suffix",
    tier: 1,
    stats: [{ statName: "Equipment Armor Bonus", min: "3", max: "7" }]
  },
  "29c3e85090a6b6f248c7f82e0bdcd281": {
    affixName: "of Defense",
    style: "Suffix",
    tier: 2,
    stats: [{ statName: "Equipment Armor Bonus", min: "8", max: "12" }]
  },
  "6dc5e0d99f4af93e3d25d747bb3c8041": {
    affixName: "Shield",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Armor Bonus", min: "3", max: "5" }]
  },
  "3257c4976a38fdd2f5caa2b3d153fecf": {
    affixName: "Barrier",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Armor Bonus", min: "6", max: "9" }]
  },
  "e153b054db2cca817f48e43c58f7b064": {
    affixName: "Sturdy",
    style: "Prefix",
    tier: null,
    stats: [{ statName: "Equipment Armor Pct Bonus", min: "10", max: "20" }]
  },

  // ── Attack Bonus ─────────────────────────────────────────────────────────
  // 1H weapon
  "c337617b320339aa28fc3e5bff9d5d35": {
    affixName: "Hunter's",
    style: "Both",
    tier: 1,
    stats: [{ statName: "Attack", min: "10", max: "20" }]
  },
  "d52bf85b0fe8731724dd08a7c6ebfb03": {
    affixName: "Tracker's",
    style: "Both",
    tier: 2,
    stats: [{ statName: "Attack", min: "21", max: "30" }]
  },
  "54fe9bafd0e17212a9c491ff5a767d1c": {
    affixName: "Falconer's",
    style: "Both",
    tier: 3,
    stats: [{ statName: "Attack", min: "31", max: "40" }]
  },
  // 2H weapon
  "4de3e4fbf0cef048649083b047def779": {
    affixName: "Hunter's",
    style: "Both",
    tier: 1,
    stats: [{ statName: "Attack", min: "20", max: "30" }]
  },
  "b10b0db54d34133e85576288ca8ad327": {
    affixName: "Tracker's",
    style: "Both",
    tier: 2,
    stats: [{ statName: "Attack", min: "31", max: "50" }]
  },
  "4e7178d0b889936ca2c388ec2bd60046": {
    affixName: "Falconer's",
    style: "Both",
    tier: 3,
    stats: [{ statName: "Attack", min: "51", max: "70" }]
  },
  // Gloves/Helm (T1)
  "1782fa81479995e4e10f3194b6a50437": {
    affixName: "Sparrow's",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Attack", min: "10", max: "20" }]
  },
  "de13df7d928adec8044aee61c8a9417f": {
    affixName: "Raven's",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Attack", min: "21", max: "30" }]
  },
  // Jewelry (T1)
  "5dc86429f76b5c6fea651d0131f7247d": {
    affixName: "Sparrow's",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Attack", min: "10", max: "20" }]
  },
  "702e863a9298f3104099d4aa61c4b30f": {
    affixName: "Raven's",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Attack", min: "21", max: "30" }]
  },

  // ── Attack Speed ─────────────────────────────────────────────────────────
  "f5e18f169be207449e131667763df02b": {
    affixName: "Accurate",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Attack Speed Multiplier", min: "5", max: "10" }]
  },
  "767c83343aaba38a78e74c5f56fd8494": {
    affixName: "of Haste",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Equipment Attack Speed Multiplier", min: "0.1", max: "0.2" }]
  },

  // ── Attribute Bonuses ────────────────────────────────────────────────────
  "d14cc16355a687e572c92aaed5dbd953": {
    affixName: "Cat's",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Dexterity Bonus", min: "3", max: "7" }]
  },
  "ac6785c6099dd3bc4336c98aeff0dc7d": {
    affixName: "Serval's",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Dexterity Bonus", min: "8", max: "12" }]
  },
  "ef2ad277808523f9a1b62e493c1a7be7": {
    affixName: "Owl's",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Magic Bonus", min: "3", max: "7" }]
  },
  "1901be6a6408dcc569f7b579641ff65e": {
    affixName: "Crow's",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Magic Bonus", min: "8", max: "12" }]
  },
  "e338dc895728fad297342dc03646f312": {
    affixName: "Ogre's",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Strength Bonus", min: "3", max: "7" }]
  },
  "f6d764397067f9e79eaaecba48bc2d7c": {
    affixName: "Giant's",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Strength Bonus", min: "8", max: "12" }]
  },
  "ea46fe142a1434140050796e98b62ad9": {
    affixName: "Badger's",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Vitality Bonus", min: "3", max: "7" }]
  },
  "70a0c980948c774fddb3b2d07aa6390b": {
    affixName: "Boar's",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Vitality Bonus", min: "3", max: "7" }]
  },

  // ── Implicit / Special ───────────────────────────────────────────────────
  "0cd5112ea9acd11a1351fc3486465a39": {
    affixName: "",
    style: "Implicit",
    tier: null,
    stats: [{ statName: "Instrument Status Effect Chance Deliver Target", min: "(0, 0)", max: "(0, 0)" }]
  },
  "f8f6520acff0bd6de7d6995f296f703b": {
    affixName: "",
    style: "Implicit",
    tier: null,
    stats: [{ statName: "Instrument Status Effect Chance Deliver Target", min: "(0, 0)", max: "(0, 0)" }]
  },
  // Bogie Rotgut Flask — multi-stat implicit
  "6a85005d3d4dc8f83e54637899fb4d1c": {
    affixName: "",
    style: "Prefix",
    tier: null,
    stats: [
      { statName: "Resistance",     min: "15", max: "15" },
      { statName: "Resistance",     min: "15", max: "15" },
      { statName: "Critical Chance", min: "15", max: "15" }
    ]
  },

  // ── Cast Speed ───────────────────────────────────────────────────────────
  "c784f484702d1580f2ba04e4524617ec": {
    affixName: "Accurate",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Cast Speed Multiplier", min: "0.04", max: "0.08" }]
  },
  "dfb5f77870ed91f8399715740283d947": {
    affixName: "of Celerity",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Cast Speed Multiplier", min: "0.1", max: "0.2" }]
  },

  // ── Critical Chance ──────────────────────────────────────────────────────
  // Blunt 1H weapon (equipment crit)
  "0f959b8fbd02f3571663b49e49d573fa": {
    affixName: "Hard",
    style: "Both",
    tier: null,
    stats: [
      { statName: "Equipment Critical Chance", min: "20", max: "30" },
      { statName: "Equipment Critical Duration", min: "10", max: "15" }
    ]
  },
  "2a90db258f406016b5739e5c64983877": {
    affixName: "Hard",
    style: "Both",
    tier: null,
    stats: [
      { statName: "Equipment Critical Chance", min: "30", max: "40" },
      { statName: "Equipment Critical Duration", min: "15", max: "20" }
    ]
  },
  // Blunt GlovesHelm (skill crit)
  "80d13f4c467446a3257c09a0f178be22": {
    affixName: "of Pummeling",
    style: "Suffix",
    tier: null,
    stats: [
      { statName: "Critical Chance", min: "20", max: "30" },
      { statName: "Critical Duration", min: "10", max: "20" }
    ]
  },
  // Cold 1H weapon (equipment crit)
  "9b0103a3250dfdbf3dc829480c9bc9dd": {
    affixName: "Accurate",
    style: "Both",
    tier: null,
    stats: [
      { statName: "Equipment Critical Chance", min: "20", max: "30" },
      { statName: "Equipment Critical Duration", min: "10", max: "15" }
    ]
  },
  "c1feac06ffb6681bc6c8054bb0158b5a": {
    affixName: "Accurate",
    style: "Both",
    tier: null,
    stats: [
      { statName: "Equipment Critical Chance", min: "30", max: "40" },
      { statName: "Equipment Critical Duration", min: "15", max: "20" }
    ]
  },
  // Cold GlovesHelm (skill crit)
  "eda6902892fe3acdb00cea0df2f0ed3b": {
    affixName: "of Frost",
    style: "Suffix",
    tier: null,
    stats: [
      { statName: "Critical Chance", min: "20", max: "30" },
      { statName: "Critical Duration", min: "10", max: "20" }
    ]
  },
  // Fire 1H weapon (equipment crit)
  "4e5eeec78731a6bec0aac6a34e8c6cd4": {
    affixName: "of Kindling",
    style: "Suffix",
    tier: null,
    stats: [
      { statName: "Equipment Critical Chance", min: "20", max: "30" },
      { statName: "Equipment Critical Duration", min: "10", max: "15" }
    ]
  },
  "6985856532522ac4651f6171f8491c91": {
    affixName: "of Kindling",
    style: "Suffix",
    tier: null,
    stats: [
      { statName: "Equipment Critical Chance", min: "30", max: "40" },
      { statName: "Equipment Critical Duration", min: "15", max: "20" }
    ]
  },
  // Fire GlovesHelm (skill crit)
  "e90a781567783983549b313d834dbb05": {
    affixName: "of Kindling",
    style: "Suffix",
    tier: null,
    stats: [
      { statName: "Critical Chance", min: "20", max: "30" },
      { statName: "Critical Duration", min: "10", max: "20" }
    ]
  },
  // Lightning 1H weapon (equipment crit)
  "877130e47a96670178beccc0641a111f": {
    affixName: "of Shock",
    style: "Suffix",
    tier: null,
    stats: [
      { statName: "Equipment Critical Chance", min: "20", max: "30" },
      { statName: "Equipment Critical Duration", min: "10", max: "15" }
    ]
  },
  "ae01d2ac076c62d01ede5bbb277b28b6": {
    affixName: "of Shock",
    style: "Suffix",
    tier: null,
    stats: [
      { statName: "Equipment Critical Chance", min: "30", max: "40" },
      { statName: "Equipment Critical Duration", min: "15", max: "20" }
    ]
  },
  // Lightning GlovesHelm (skill crit)
  "cb199d02eb6ec300dfa260afa1c9f308": {
    affixName: "of Shock",
    style: "Suffix",
    tier: null,
    stats: [
      { statName: "Critical Chance", min: "20", max: "30" },
      { statName: "Critical Duration", min: "10", max: "20" }
    ]
  },
  // Shadow 1H weapon (equipment crit)
  "f20d15e168745b5af30d43605bb9192f": {
    affixName: "of Malediction",
    style: "Suffix",
    tier: null,
    stats: [
      { statName: "Equipment Critical Chance", min: "20", max: "30" },
      { statName: "Equipment Critical Duration", min: "10", max: "15" }
    ]
  },
  "5025041d7df212a2cdae9a2672061b48": {
    affixName: "of Malediction",
    style: "Suffix",
    tier: null,
    stats: [
      { statName: "Equipment Critical Chance", min: "30", max: "40" },
      { statName: "Equipment Critical Duration", min: "15", max: "20" }
    ]
  },
  // Shadow GlovesHelm (skill crit)
  "26b97b20ba9b3254e7563f4d9f736157": {
    affixName: "of Hexing",
    style: "Suffix",
    tier: null,
    stats: [
      { statName: "Critical Chance", min: "20", max: "30" },
      { statName: "Critical Duration", min: "10", max: "20" }
    ]
  },
  // Slashing 1H weapon (equipment crit)
  "f7c36baabf0f7fbf8517c30ce3ab3cb1": {
    affixName: "of Cutting",
    style: "Suffix",
    tier: null,
    stats: [
      { statName: "Equipment Critical Chance", min: "20", max: "30" },
      { statName: "Equipment Critical Duration", min: "10", max: "15" }
    ]
  },
  "9752edadeb69b376c527728c47c47aa0": {
    affixName: "of Cutting",
    style: "Suffix",
    tier: null,
    stats: [
      { statName: "Equipment Critical Chance", min: "30", max: "40" },
      { statName: "Equipment Critical Duration", min: "15", max: "20" }
    ]
  },
  // Slashing GlovesHelm (skill crit)
  "9c28e43941a6c65f575a7fb9c17f0a3f": {
    affixName: "of Tearing",
    style: "Suffix",
    tier: null,
    stats: [
      { statName: "Critical Chance", min: "20", max: "30" },
      { statName: "Critical Duration", min: "10", max: "20" }
    ]
  },

  // ── Critical Resistance ──────────────────────────────────────────────────
  // Blunt (Chest)
  "bce7b8ae86c16329587f3aaaba6d0ee5": {
    affixName: "of Stability",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Critical Resistance", min: "25", max: "50" }]
  },
  "2f52b76749f1106b3f096c229ca4359d": {
    affixName: "of Stability",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Critical Resistance", min: "50", max: "75" }]
  },
  // Cold (Chest)
  "a36eda8d3e747c8d3c94014bd2309066": {
    affixName: "of Warmth",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Critical Resistance", min: "25", max: "50" }]
  },
  "1b0f6f5121f5d7a981acb5251b1b8054": {
    affixName: "of Warmth",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Critical Resistance", min: "50", max: "75" }]
  },
  // Fire (Belt)
  "11554c761a12ee4c04bc634c726d73da": {
    affixName: "of Incombustibility",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Critical Resistance", min: "25", max: "50" }]
  },
  "f1d70c7cb6adde4138283515eef171f2": {
    affixName: "of Incombustibility",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Critical Resistance", min: "50", max: "75" }]
  },
  // Lightning (Belt)
  "0194adbae77de58677423d6806f09822": {
    affixName: "of Insulation",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Critical Resistance", min: "25", max: "50" }]
  },
  "c772194a8b3abb13ba5c798d74a8794a": {
    affixName: "of Insulation",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Critical Resistance", min: "50", max: "75" }]
  },
  // Shadow (Chest)
  "9ddebc472a211fcc344c114c3538efba": {
    affixName: "of Protection",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Critical Resistance", min: "25", max: "50" }]
  },
  "9a982c94dbca403313d2e52eb9b4ec15": {
    affixName: "of Protection",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Critical Resistance", min: "50", max: "75" }]
  },
  // Slashing (Belt)
  "2d10743fd1ada1352b4f939235d33de0": {
    affixName: "of Staunching",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Critical Resistance", min: "25", max: "50" }]
  },
  "f951700fc4cd778ff5c3e76bdec2df9e": {
    affixName: "of Staunching",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Critical Resistance", min: "50", max: "75" }]
  },

  // ── Crow Flock (Witch Helm affixes) ──────────────────────────────────────
  "299b295626ae8d2dead2d87619d6e9b2": {
    affixName: "Scattering",
    style: "Both",
    tier: null,
    stats: [{ statName: "Skill Trait", min: "30", max: "70" }]
  },
  "7079b4e0782de9409791e4379a28da92": {
    affixName: "Clustering",
    style: "Both",
    tier: null,
    stats: [{ statName: "Skill Trait", min: "-50", max: "-20" }]
  },
  "8aebbe9afb5b9b9ffaf8675c14b60407": {
    affixName: "Swarming",
    style: "Both",
    tier: null,
    stats: [{ statName: "Skill Trait", min: "2", max: "3" }]
  },

  // ── Damage Bonus ─────────────────────────────────────────────────────────
  // 1H weapon
  "c507be87c23b4b6f5031599a05daad54": {
    affixName: "Keen",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Equipment Damage Bonus", min: "2", max: "4" }]
  },
  "840035d8d30619be7c27bd3cd3c74124": {
    affixName: "Sharp",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Equipment Damage Bonus", min: "5", max: "7" }]
  },
  "e1ab09e15c20a1386c14105aea899998": {
    affixName: "Sharp",
    style: "Prefix",
    tier: 3,
    stats: [{ statName: "Equipment Damage Bonus", min: "8", max: "11" }]
  },
  // 2H weapon
  "02247a09c42f620415df70face43bcef": {
    affixName: "Keen",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Equipment Damage Bonus", min: "4", max: "8" }]
  },
  "e2e5f8ba6a941158c980889de14e6f76": {
    affixName: "Sharp",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Equipment Damage Bonus", min: "9", max: "15" }]
  },
  "31bfa0580380d108eaccaafdb11e5605": {
    affixName: "Sharp",
    style: "Prefix",
    tier: 3,
    stats: [{ statName: "Equipment Damage Bonus", min: "16", max: "24" }]
  },
  // Damage % (both weapon types)
  "5c52544a4a582336b15f552ccdb8485e": {
    affixName: "of Slaughter",
    style: "Both",
    tier: null,
    stats: [{ statName: "Equipment Damage Percent", min: "10", max: "15" }]
  },
  "fec91347f86ba6d15e8c3f1ff9a4b292": {
    affixName: "of Slaughter",
    style: "Both",
    tier: null,
    stats: [{ statName: "Equipment Damage Percent", min: "15", max: "25" }]
  },

  // ── Dash Distance ────────────────────────────────────────────────────────
  "9e4b3d78db58baedf48b8f1174674f99": {
    affixName: "Rushing",
    style: "Prefix",
    tier: null,
    stats: [{ statName: "Dash Distance Multiplier", min: "0.25", max: "0.25" }]
  },

  // ── Elemental Imbue (Damage Type) ────────────────────────────────────────
  "4a4e0fee83bda62b9f37a465d588fa56": {
    affixName: "Glacial",
    style: "Prefix",
    tier: null,
    stats: [{ statName: "Equipment Damage Type", min: "(0, 0)", max: "(0, 0)" }]
  },
  "87c07987d9664a162162d3deb740e210": {
    affixName: "Fiery",
    style: "Prefix",
    tier: null,
    stats: [{ statName: "Equipment Damage Type", min: "(0, 0)", max: "(0, 0)" }]
  },
  "ae65223b8bd07d4ff967950951bd4bef": {
    affixName: "Coruscating",
    style: "Prefix",
    tier: null,
    stats: [{ statName: "Equipment Damage Type", min: "(0, 0)", max: "(0, 0)" }]
  },
  "f81d6ab283b198eaa1705bb398fed056": {
    affixName: "Black",
    style: "Prefix",
    tier: null,
    stats: [{ statName: "Equipment Damage Type", min: "(0, 0)", max: "(0, 0)" }]
  },

  // ── Experience Gain ──────────────────────────────────────────────────────
  "4d2ebf6e4e1abdc4f4ee96f929cc1419": {
    affixName: "of Prudence",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Experience Gain", min: "3", max: "7" }]
  },

  // ── Fast Elite Mob ───────────────────────────────────────────────────────
  "4ac9992ab09827b268a202fb6eef8b67": {
    affixName: "",
    style: "Prefix",
    tier: null,
    stats: [
      { statName: "Attack Speed Multiplier",    min: "0.2", max: "0.2" },
      { statName: "Cast Speed Multiplier",      min: "0.2", max: "0.2" },
      { statName: "Movement Speed Multiplier",  min: "0.3", max: "0.3" }
    ]
  },

  // ── Feather Falling ──────────────────────────────────────────────────────
  "53628dedcbce59d64a239db096e61478": {
    affixName: "Naiad's",
    style: "Prefix",
    tier: null,
    stats: [{ statName: "Faster Swim Speed", min: "50", max: "50" }]
  },
  "4ca15b60f2f5f0db5777444fdea445cf": {
    affixName: "Winged",
    style: "Prefix",
    tier: null,
    stats: [{ statName: "Feather Falling", min: "1", max: "1" }]
  },

  // ── Find ─────────────────────────────────────────────────────────────────
  "d492d69812c2e204c1bcfcf9af661475": {
    affixName: "Gnomish",
    style: "Prefix",
    tier: null,
    stats: [{ statName: "Item Find", min: "4", max: "6" }]
  },
  "57a08ee01130151531247d8c02aee021": {
    affixName: "Medic's",
    style: "Prefix",
    tier: null,
    stats: [{ statName: "Item Find", min: "20", max: "30" }]
  },
  "bea860d42c372c9d893fe7941ea339a9": {
    affixName: "Apprentice's",
    style: "Prefix",
    tier: null,
    stats: [{ statName: "Item Find", min: "20", max: "30" }]
  },
  "62e0c5d82cb149b57d6e0e910f981f29": {
    affixName: "of Greed",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Gold Find", min: "5", max: "10" }]
  },

  // ── Flask / Growth ───────────────────────────────────────────────────────
  "5133bdfcd8badcf7d9872af410a0c53c": {
    affixName: "War",
    style: "Suffix",
    tier: null,
    stats: [
      { statName: "Scale",          min: "20", max: "20" },
      { statName: "Strength Bonus", min: "10", max: "20" }
    ]
  },

  // ── Health Bonus ─────────────────────────────────────────────────────────
  "915964de201a8d7ccfc681f8eba75733": {
    affixName: "Hale",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Health Bonus", min: "5", max: "10" }]
  },
  "0f32fb969af8745d1488a061fcb49311": {
    affixName: "Stout",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Health Bonus", min: "10", max: "20" }]
  },
  "6ac2befba52bfbe86b955175aec75824": {
    affixName: "of Life",
    style: "JewelrySuffix",
    tier: 1,
    stats: [{ statName: "Health Bonus", min: "5", max: "10" }]
  },
  "0e3572bab88a63997212561ef6b29c65": {
    affixName: "of Vigor",
    style: "JewelrySuffix",
    tier: 2,
    stats: [{ statName: "Health Bonus", min: "5", max: "10" }]
  },
  "d52b7f0f319e04f4f251aed3adbeea5f": {
    affixName: "of Life Everlasting",
    style: "JewelrySuffix",
    tier: null,
    stats: [{ statName: "Health Regen", min: "1", max: "1" }]
  },

  // ── Magic Find ───────────────────────────────────────────────────────────
  "c2c10dc4dc47ad74b2122a3ca8e23b41": {
    affixName: "Treasure Hunter's",
    style: "Prefix",
    tier: null,
    stats: [{ statName: "Magic Find", min: "5", max: "7" }]
  },

  // ── Mana Bonus ───────────────────────────────────────────────────────────
  "7c35c46beb7fd76117fa3cd42e002e0e": {
    affixName: "Apprentice's",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Mana Bonus", min: "3", max: "6" }]
  },
  "997803b45c1c2f1710d67ebac7dff62b": {
    affixName: "Novice's",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Mana Bonus", min: "7", max: "11" }]
  },
  "1b22d622434c07d11a4b7019639e5233": {
    affixName: "of Mana",
    style: "JewelrySuffix",
    tier: 1,
    stats: [{ statName: "Mana Bonus", min: "3", max: "5" }]
  },
  "82948fa0005d10d6155b0e61f419f063": {
    affixName: "of Glamour",
    style: "JewelrySuffix",
    tier: 2,
    stats: [{ statName: "Mana Bonus", min: "6", max: "9" }]
  },
  "bf0f7d6128e5df8bffed4cbf543d20f7": {
    affixName: "of Endless Mana",
    style: "JewelrySuffix",
    tier: null,
    stats: [{ statName: "Mana Regen", min: "1", max: "1" }]
  },

  // ── Movement Speed ───────────────────────────────────────────────────────
  "a6dcdb9686cd6a0acd848afc8982001d": {
    affixName: "of Haste",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Movement Speed Multiplier", min: "5", max: "10" }]
  },
  "000ccead0962acbe1cbecec57fd39873": {
    affixName: "of Quickness",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Movement Speed Multiplier", min: "0.1", max: "0.2" }]
  },

  // ── Penetration ──────────────────────────────────────────────────────────
  // Blunt 1H
  "5dccd2ec3ebdff56be77e5d560444cfd": {
    affixName: "Solid",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Penetration", min: "10", max: "20" }]
  },
  "1c32dbd5807d745f077020097912d49c": {
    affixName: "Heavy",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Penetration", min: "21", max: "40" }]
  },
  // Blunt 2H
  "fe6ae04d0f95fe17ed459bf78295a587": {
    affixName: "Solid",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Penetration", min: "20", max: "40" }]
  },
  "45a8570252eea7a68e922f3b8b9948a2": {
    affixName: "Heavy",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Penetration", min: "41", max: "60" }]
  },
  // Blunt GlovesHelm
  "eebea5c46bb4772a13f396bd392372b9": {
    affixName: "Solid",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Penetration", min: "10", max: "20" }]
  },
  "c74189c0996ed92a488d13d721b84a0a": {
    affixName: "Heavy",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Penetration", min: "21", max: "30" }]
  },
  // Cold 1H
  "b2585794891f94f6c9f73c4872b65eef": {
    affixName: "Snowy",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Penetration", min: "10", max: "20" }]
  },
  "a0065f4c27c5fd4bdba21a9a17ccd773": {
    affixName: "Frosty",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Penetration", min: "21", max: "40" }]
  },
  // Cold 2H
  "9707dbcd456c7afae06042df16ea7246": {
    affixName: "Snowy",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Penetration", min: "20", max: "40" }]
  },
  "b44e7f984a29e9eb8cf5b2c65c74f5b3": {
    affixName: "Frosty",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Penetration", min: "41", max: "60" }]
  },
  // Cold GlovesHelm
  "65b470136c2ea7ec9640a80a65bccc37": {
    affixName: "Snowy",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Penetration", min: "10", max: "20" }]
  },
  "a92219b80e4f5e5c3970f29c2dec8478": {
    affixName: "Frosty",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Penetration", min: "21", max: "30" }]
  },
  // Fire 1H
  "21ed78eecdfb4924cf5688c367b33dc7": {
    affixName: "Crimson",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Penetration", min: "10", max: "20" }]
  },
  "b7e65321f1730ded7ac67ee3da45daca": {
    affixName: "Searing",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Penetration", min: "21", max: "40" }]
  },
  // Fire 2H
  "69e2dad10f9bafabc7f0e930720e54d4": {
    affixName: "Crimson",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Penetration", min: "20", max: "40" }]
  },
  "4909993341a82e1adbd35d251898f213": {
    affixName: "Searing",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Penetration", min: "41", max: "60" }]
  },
  // Fire GlovesHelm
  "9bea4b86f887941fd59a6f6118d01415": {
    affixName: "Warm",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Penetration", min: "10", max: "20" }]
  },
  "9a8454790407cb08d2b76419f2a649cf": {
    affixName: "Searing",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Penetration", min: "21", max: "30" }]
  },
  // Lightning 1H
  "1db276337079ce2fad227bc1dcfc0a6f": {
    affixName: "Sparking",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Penetration", min: "10", max: "20" }]
  },
  "5a4fcab7bebbc8d7f35b0d2a9e99013c": {
    affixName: "Flashing",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Penetration", min: "21", max: "40" }]
  },
  // Lightning 2H
  "a93080ea66ecb82684ae92fc99ed765f": {
    affixName: "Sparking",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Penetration", min: "20", max: "40" }]
  },
  "2bb7f57c9341f3ddaac2a401d4a9414b": {
    affixName: "Flashing",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Penetration", min: "41", max: "60" }]
  },
  // Lightning GlovesHelm
  "07bc78dd3a818bdee18fc78ba44d035f": {
    affixName: "Sparking",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Penetration", min: "10", max: "20" }]
  },
  "7ff5679608c1ab161ad2d7c572010fff": {
    affixName: "Flashing",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Penetration", min: "21", max: "30" }]
  },
  // Shadow 1H
  "ecb04cf2de1cf28286e1dbd2d8d98f0e": {
    affixName: "Dim",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Penetration", min: "10", max: "20" }]
  },
  "97fffdaaa396882aee7cd806dc99c4b8": {
    affixName: "Murky",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Penetration", min: "21", max: "40" }]
  },
  // Shadow 2H
  "15526a880d28333dc6af29c304d79c1b": {
    affixName: "Dim",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Penetration", min: "20", max: "40" }]
  },
  "e768648bc429e08fdd6d43e0baebce43": {
    affixName: "Murky",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Penetration", min: "41", max: "60" }]
  },
  // Shadow GlovesHelm
  "2ed7b0a4fed652afbd244f3c8f6513da": {
    affixName: "Dim",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Penetration", min: "10", max: "20" }]
  },
  "8b99fb91fbd715a225139829167c3dd3": {
    affixName: "Murky",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Penetration", min: "21", max: "30" }]
  },
  // Slashing 1H
  "c5711f9908fc0503c45715297e45cfe2": {
    affixName: "Sharp",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Penetration", min: "10", max: "20" }]
  },
  "48a14ab177608cf41c6b0505afe808bd": {
    affixName: "Razor",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Penetration", min: "21", max: "40" }]
  },
  // Slashing 2H
  "1c97a144e4dc364304ea34f3b0bd7e77": {
    affixName: "Sharp",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Penetration", min: "20", max: "40" }]
  },
  "3a0d07d2905a73928af621a417ba3613": {
    affixName: "Razor",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Penetration", min: "41", max: "60" }]
  },
  // Slashing GlovesHelm
  "fcc247a9c8c205eb8c616a6da40e0939": {
    affixName: "Sharp",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Penetration", min: "10", max: "20" }]
  },
  "7444fe82196a6d45fcfb219373e24c69": {
    affixName: "Razor",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Penetration", min: "21", max: "30" }]
  },

  // ── Resistance ───────────────────────────────────────────────────────────
  // Blunt
  "dec56696f293eac89c74ce4abee20d01": {
    affixName: "Sepia",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Resistance", min: "10", max: "20" }]
  },
  "cfa4c623a47ba8989ce91a2a0b083d3b": {
    affixName: "Umber",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Resistance", min: "21", max: "30" }]
  },
  // Cold
  "c8431b00389812eda8ee8c655e608766": {
    affixName: "Teal",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Resistance", min: "10", max: "20" }]
  },
  "e614061b6ea4e2ca56ae025774d9bad2": {
    affixName: "Emerald",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Resistance", min: "21", max: "30" }]
  },
  // Fire
  "8c506d7e097c6180da08d3484b7021e3": {
    affixName: "Russet",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Resistance", min: "10", max: "20" }]
  },
  "d422b3142516f5acef433f02e3de7f7d": {
    affixName: "Crimson",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Resistance", min: "21", max: "30" }]
  },
  // Lightning
  "4fd824b6f289cb66694445843dbbbee4": {
    affixName: "Cerulean",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Resistance", min: "10", max: "20" }]
  },
  "f8f06d9a2c91f8ae35d95baad86a1756": {
    affixName: "Azure",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Resistance", min: "21", max: "30" }]
  },
  // Shadow
  "dc2dc41187f0a6feaff055d8317da86a": {
    affixName: "Charcoal",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Resistance", min: "10", max: "20" }]
  },
  "7927ae35c1173be4ac21b38410062a1e": {
    affixName: "Jet",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Resistance", min: "21", max: "30" }]
  },
  // Slashing
  "9d7ba4a8357db86ebc4c817457d2ea41": {
    affixName: "Alabaster",
    style: "Prefix",
    tier: 1,
    stats: [{ statName: "Resistance", min: "10", max: "20" }]
  },
  "880861b8fd92180be2e0a29754ac40d3": {
    affixName: "Ivory",
    style: "Prefix",
    tier: 2,
    stats: [{ statName: "Resistance", min: "21", max: "30" }]
  },

  // ── Runeword ─────────────────────────────────────────────────────────────
  "9d97645db2d179449eea13289822427d": {
    affixName: "",
    style: "Implicit",
    tier: null,
    stats: []
  },

  // ── Skill ────────────────────────────────────────────────────────────────
  "84b8454f3e92cabc12703180d64e6fa7": {
    affixName: "of the Witch",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Skill Level Bonus", min: "1", max: "1" }]
  },
  "f437f200425109900c8ec57a2e77ff2c": {
    affixName: "of the Witch",
    style: "Suffix",
    tier: null,
    stats: [{ statName: "Skill Level Bonus", min: "1", max: "2" }]
  },

  // ── Stamina / Misc ───────────────────────────────────────────────────────
  "b148d6a1e7e92a39714e2bd5d797477f": {
    affixName: "Mechanic's",
    style: "Both",
    tier: null,
    stats: []
  },
  "b23cea3a0410db3d057ce67a46cfc17d": {
    affixName: "Rugged",
    style: "Both",
    tier: null,
    stats: [{ statName: "Stamina Bonus", min: "1", max: "1" }]
  },
  "3f877c7ca3beb61b5d60a70819506d14": {
    affixName: "Enduring",
    style: "Both",
    tier: null,
    stats: [{ statName: "Stamina Regen Bonus Pct", min: "0.2", max: "0.2" }]
  },

  // ── Strength ─────────────────────────────────────────────────────────────
  "f59d348dfede8a762204a9f281a412a9": {
    affixName: "Burly",
    style: "Prefix",
    tier: null,
    stats: [{ statName: "Strength Bonus", min: "10", max: "20" }]
  },

  // ── Thorns ───────────────────────────────────────────────────────────────
  "0abe2f63d93bcfeb16ef3fa1e9991d57": {
    affixName: "Thorny",
    style: "Both",
    tier: null,
    stats: []
  },

  // ── Special / Unique weapon affixes ──────────────────────────────────────
  // Unnamed multi-stat (life steal)
  "f125d8db5b2123e2c35667a259bc7834": {
    affixName: "",
    style: "Prefix",
    tier: null,
    stats: [
      { statName: "Attack Speed Multiplier",   min: "0.1",  max: "0.1"  },
      { statName: "Movement Speed Multiplier", min: "0.1",  max: "0.3"  },
      { statName: "Life Steal",                min: "100",  max: "100"  }
    ]
  },
  // War (attack speed + attack)
  "c3fc3121bcb064b3c5694d28bb18640d": {
    affixName: "War",
    style: "Prefix",
    tier: null,
    stats: [
      { statName: "Attack Speed Multiplier", min: "0.05", max: "0.1" },
      { statName: "Attack",                  min: "10",   max: "20"  }
    ]
  },
  // Water Walking (Boots)
  "cf1f0049dfdaea66f0897cce306deb31": {
    affixName: "Scaly",
    style: "Prefix",
    tier: null,
    stats: [{ statName: "Water Walking", min: "1", max: "1" }]
  },

  // ── Dye / Colour ─────────────────────────────────────────────────────────
  "763ff1a5f01b7bb147b1441495e551ed": {
    affixName: "Reddish",
    style: "Both",
    tier: null,
    stats: []
  }

};

if (typeof window !== 'undefined') window.DH_AFFIXES = DH_AFFIXES;
