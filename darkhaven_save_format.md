# Darkhaven Save File Format (.max)

## File Structure

| Bytes | Content |
|-------|---------|
| 0–2 | Magic: `6d 61 76` (`mav`) |
| 3 | Format version byte. Known values: `0x2a` (`*`) pre-patch 0.0.23609; `0x01` from 0.0.23609 onward |
| 4–7 | Unknown — changes per save, not a timestamp. Possibly a checksum or unique save identifier |
| 8+ | Raw DEFLATE compressed payload (`pako.inflateRaw(data.slice(8))`) |

**Decompressed payload**: JSON string — outer wrapper:
```json
{ "Data": "<inner JSON string>", "Digest": "<digest JSON string>" }
```

**Inner JSON quirks** (must repair before parsing):
- `"otherstats":{{` → fix to `"otherstats":{` (double-brace bug, may appear on multiple units)
- Missing commas between adjacent `}{` object sequences → insert `,`

**Digest**: JSON object with per-character metadata used as fallback display values.

| Field | Type | Notes |
|-------|------|-------|
| `$version` | int | Always `1` |
| `Name` | string | Character name |
| `Level` | int | Character level |
| `World` | hex string | World ID (`"0x..."`) |
| `Id` | hex string | Character unique ID — **added in patch 0.0.23609**. Matches character unit `dbid` and save filename. Absent in pre-0.0.23609 saves. |

## Top-Level Structure
```json
{
  "$version": 1,
  "units": [ ... ]   // array of unit objects (main data)
}
```

---

## Unit Object Format
```json
{
  "blueprint": "<GUID>",
  "dbid": "0x0",
  "location": {
    "owner": <unit_index>,
    "container": "<GUID>",
    "index": <int>
  },
  "stats": {
    "data": [
      {
        "stat": "<GUID>",
        "long": <int>,
        "fixed": "0x...",
        "string": "...",
        "params": {
          "p0": { "blueprint": "<GUID>", "prototype": "<GUID>", "long": <int> },
          "p1": { ... }
        },
        "prototype": "<GUID>",
        "blueprint": "<GUID>"
      }
    ]
  },
  "otherstats": {
    "tag": "<GUID>",
    "statslist": { "data": [...] }
  }
}
```

**`dbid` notes:**
- Pre-patch 0.0.23609: character unit `dbid` is always `"0x0"`; item units vary.
- From patch 0.0.23609: character unit `dbid` is a unique 64-bit hex ID (`"0x{hex}"`), matching the save filename and `Digest.Id`.
- The character unit is identified by having **no `location` field** (not by `dbid`).
```

### Fixed-Point Decoding
```javascript
function decodeFixed(hexStr) {
  const big    = BigInt(hexStr);
  const u64    = BigInt.asUintN(64, big);
  const hi     = Number(u64 >> 32n);
  const lo     = Number(u64 & 0xFFFFFFFFn) / 4294967296;
  const signed = hi >= 0x80000000 ? hi - 0x100000000 : hi;
  return signed + lo;
}
```
Multiply by 100 for percentage stats (attack speed, cast speed, crit chance, penetration, resistance, etc.)

---

## Container GUIDs
| GUID | Name |
|------|------|
| `0b50d10714d6c0c4bb7f5447dfb5a745` | Hero Equipment Container |
| `1d936ddad6b2af4418e3d46a2bc946ee` | Alt Equipment Container |
| `864d7327e29b7464694ce0baf5bed2fd` | Affixes Container |
| `688a379c1b446ea40a944279e04382e8` | Bonus Stats (Socketables) Container |
| `3cc00cfe933e46344879c0f506594096` | Stash Container |

---

## Stash vs. Player Equipment

**Completely separate containers.**

| Container | GUID | What it holds |
|-----------|------|---------------|
| EQUIPMENT | `0b50d10714d6c0c4bb7f5447dfb5a745` | Active equipped items. Sequential integer indices (0–27). |
| ALT_EQUIPMENT | `1d936ddad6b2af4418e3d46a2bc946ee` | Alt-slot equipped items. Same scheme. |
| STASH | `3cc00cfe933e46344879c0f506594096` | All stored items. Grid-encoded, multi-bag. |

There is no separate player backpack. Items are either equipped or in the stash.

---

## Stash Index Encoding
`index = (row << 16) | col`
- `row = index >> 16` — stash grid row (0–15); each "bag" = one row
- `col = index & 0xFFFF` — stash grid column (0–14); direct, no further decoding
  - Example: `index = 0` → row 0, col 0
  - Example: `index = 131074` (0x00020002) → row 2, col 2
- Single unified **15 columns × 16 rows** grid (240 slots)
- Only top-left position stored; item occupies `w × h` cells from there

### Item Grid Sizes (w × h cells)
| Item Type | Width | Height | Keywords |
|-----------|-------|--------|----------|
| Chest / Robe / Vest / Tunic / Harness | 2 | 3 | `chest`, `robe`, `vest`, `tunic`, `harness` |
| Staff / Bow / Polearm / Halberd / Spear | 1 | 4 | `staff`, `bow`, `polearm`, `halberd`, `spear` |
| Helm / Gloves / Boots / Shield / Buckler / Targe / Tome / Book | 2 | 2 | `helm`, `cap`, `crown`, `hood`, `veil`, `gloves`, `boots`, `shield`, `buckler`, `targe`, `tome`, `book` |
| Heater / Carapace shields | 2 | 3 | `\bheater\b` or `\bcarapace\b` in name or typeDisplay |
| Sword / Mace / Axe | 1 | 3 | `sword`, `mace`, `axe`
| Dagger / Wand / Scepter / Knife | 1 | 2 | `dagger`, `wand`, `scepter`, `knife` 
| Belt / Sash / Cord / Cincture / Girdle | 2 | 1 | `belt`, `sash`, `cord`, `cincture`, `girdle` |
| Flask / Potion | 1 | 1 | `flask`, `potion` |
| Ring / Amulet / Gem / Core / Rune / Dye / Key / Scroll | 1 | 1 | *(default)* |

---

## Equipment Slot Indices
| Index | Slot Key | Display |
|-------|----------|---------|
| 0 | `hand_right` | Main Hand |
| 1 | `hand_left` | Off Hand |
| 2 | `chest` | Chest |
| 3 | `feet` | Boots |
| 4 | `head` | Helm |
| 5 | `neck` | Amulet |
| 6 | `finger_1` | Ring 1 |
| 7 | `finger_2` | Ring 2 |
| 8 | `hands` | Gloves |
| 9 | `waist` | Belt |
| 10 | `flask` | Flask |
| 11 | `hand_right_alt` | Alt Main Hand 1 — set 2 *(excluded from all bonuses)* |
| 12 | `hand_left_alt` | Alt Off Hand 1 — set 2 *(excluded from all bonuses)* |
| 13 | `hand_extra_alt` | Alt Main Hand 2 — set 3 *(excluded from all bonuses)* |
| 14 | `hand_extra_off` | Alt Off Hand 2 — set 3 *(excluded from all bonuses)* |
| 15–27 | *(tattoo slots)* | Rune Garment slots |

**Alt-slot exclusion rule**: Stats on items in slots 11–14 are not counted toward character totals.

---

## Tattoo Slots (Rune Garment) — EQUIPMENT indices 15–27

| Index | Slot Name | Body Location |
|-------|-----------|---------------|
| 15 | Crown | Head / face |
| 16 | Heart | Chest |
| 17 | Core | Stomach / belly |
| 18 | Back | Upper back |
| 19 | Sacra | Lower back / sacrum |
| 20 | Right Shoulder | Character's right upper arm |
| 21 | Left Shoulder | Character's left upper arm |
| 22 | Right Arm | Character's right lower arm |
| 23 | Left Arm | Character's left lower arm |
| 24 | Right Thigh | Character's right upper leg |
| 25 | Left Thigh | Character's left upper leg |
| 26 | Right Calf | Character's right lower leg |
| 27 | Left Calf | Character's left lower leg |

### Rune Item Blueprints

`blueprint` = `"Rune N Item Unit"`. **Ash=1, Bat=2, Ka=3, Deb=4, Elm=5.**

| Blueprint Name    | Rune # | Name     | Image            |
|-------------------|--------|----------|------------------|
| Rune 01 Item Unit | 1 | Ash Rune | `rune01_ash.png` |
| Rune 02 Item Unit | 2 | Bat Rune | `rune02_bat.png` |
| Rune 03 Item Unit | 3 | Ka Rune  | `rune03_ka.png`  |
| Rune 04 Item Unit | 4 | Deb Rune | `rune04_deb.png` |
| Rune 05 Item Unit | 5 | Elm Rune | `rune05_elm.png` |

### Rune Tattoo Effects (slotted in tattoo body slot)

| Rune | Tattoo Skill | Effect |
|------|-------------|--------|
| Ash | Charged Lunge | Lightning shocks nearby enemies during Glyph Lunge |
| Bat | Red Embrace | Blood Lash has a 50% chance to entangle enemies |
| Ka | Memory & Thought | Limited to 2 Crows, but they are eternal |
| Deb | Curved Spine | Spine Breaker follows an arcing path |
| Elm | Blood Storm | Bone Storm fires missiles of blood rather than bone |

### Rune Socket Effects (socketed into weapon or armor)

| Rune | Slot(s) | Effect |
|------|---------|--------|
| **Ash** | Weapon, Helm, Gloves | +11 Attack |
| **Ash** | Chest, Belt, Boots, Shield | +11 Armor |
| **Bat** | Weapon | 25% chance to Bleed on hit |
| **Bat** | Helm, Gloves | +20% Bleed Duration |
| **Bat** | Chest, Shield | +25% Reduced Bleed Duration |
| **Bat** | Belt, Boots | +0.2/s Life Regen |
| **Ka** | Weapon | +13% Shadow Penetration |
| **Ka** | Any armor | +3% Magic Find |
| **Deb** | Weapon | +13% Blunt Penetration |
| **Deb** | Helm, Gloves | +20% Stun Duration |
| **Deb** | Chest, Shield | +20% Reduced Stun Duration |
| **Deb** | Belt, Boots | +5% Gold Find |
| **Elm** | Weapon | +13% Slashing Penetration |
| **Elm** | Helm, Gloves | +20% Bleed Duration |
| **Elm** | Chest, Shield | +20% Reduced Bleed Duration |
| **Elm** | Belt, Boots | +1 Stamina |

### Garment Set Blueprint GUIDs (TATTOO_SLOT_STAT prototype)

`TATTOO_SLOT_STAT` = `451c001d1f78ae8408c12934cc48ce07`. The `prototype` field encodes slot + element tag.

```
703d0ef5… → Witch Rune Garment Set Life Head
25e9261d… → Witch Rune Garment Set Health Chest
5179a64b… → Witch Rune Garment Set Life Stomach
83bb3b91… → Witch Rune Garment Set AoE BackU
46cda93e… → Witch Rune Garment Set Defend BackL
2906414c… → Witch Rune Garment Set Life ArmUR
7fd59448… → Witch Rune Garment Set Life ArmUL
4a105b62… → Witch Rune Garment Set Defend ArmLR
90ca2e0b… → Witch Rune Garment Set Defend ArmLL
1dde2490… → Witch Rune Garment Set Defend LegUR
c3cd9b8c… → Witch Rune Garment Set Defend LegUL
e6a5b484… → Witch Rune Garment Set Health LegLR
135693d1… → Witch Rune Garment Set Health LegLL
```

Full GUIDs in `TATTOO_SLOT_PROTOS` in `maxparser.js`.

---

## Key Stat GUIDs

### Character Stats (on the character unit — the unit with no `location` field)
| GUID | Name | Encoding |
|------|------|----------|
| `b00f3f85f9ff6674d933093f1689bd9d` | Proper Name | `string` |
| `58f688979805ad9448dd76c47394f635` | Level | `long` |
| `9509ba7b24ce0f844a22044dbc6e9a02` | Experience | `long` (absent in offline saves) |
| `e098506db56ab944794ce132ced2ea51` | Gold | `long` |
| `e2fca4e0f5f710446a6e4b44bd62a543` | Stone | `long` |
| `446ee239b53115146a9e009f93f66ed5` | Flask Charges | `long` |
| `4af3c8c45eb30ab43b44505e4269fe8c` | Flask Max | `long` |
| `6af4197f9df6cec4da7a18c6550d8696` | Strength Base | `fixed` |
| `6c31e84f2c7080440adeda7dec6abb56` | Dexterity Base | `fixed` (absent for Witch) |
| `a30b17b90d023f9449fce3c7735c2be9` | Magic Base | `fixed` |
| `6fe46d231b86bbe4e9cd3459c27f49ba` | Vitality Base | `fixed` |
| `367bb8e76ee8a504a9c9eb76e1113e71` | Attack (base) | `fixed` |
| `a12ff07e0f2eb2c458c46d895b3e984f` | Health (current) | `fixed` |
| `d935659c0a572ad4f91b0eb5149d899e` | Health Base | `fixed` |
| `a1a41762eced5bf4eb07e65cb7fbed7e` | Mana (current) | `fixed` |
| `e9910e346fbe25b459be261da9edc8ba` | Mana Base | `fixed` |
| `7b8688dfc705e5a4795434a96f5faf88` | Mana Max Bonus | `fixed` (may be absent — use fallback) |
| `9611aa13f24c978439ddd12e3d984000` | Strength Intrinsic | `long`; from Tomes of Might |
| `2ad1e03444d0a1a49bc5438d073cfa3b` | Dexterity Intrinsic | from Tomes of Agility |
| `fbc8a101f047da24abaeb498ad22343c` | Vitality Intrinsic | from Tomes of Vigor |
| `38f897fd5d349c743b8f7a213b9072da` | Magic Intrinsic | from Tomes of Power |
| `b952e7d961c1ee44fb4942edfe7f1f62` | Stamina (current) | `fixed` |
| `c08bf0311c3d70842b17980f9518887a` | Stamina Base | `fixed` |
| `b8f43645839918c4b9328c71c5913577` | Stamina Max | `fixed` |
| `851b7e40a03cdd544b983815849e7284` | Stamina Regen | `fixed` |
| `41edf57e3ff5689449a522ff28d4cf0a` | Magic Find | `fixed` percentage |
| `7dc4f108eb38fb44196ffd73a9f573ac` | Gold Find | `fixed` percentage |
| `29ced5a857c129d4298c238cfade2de2` | Item Find | `fixed`; sub-type from `p0.prototype` |
| `8834f016bd6cc3547b3a540212a96a47` | Mana Regen | `fixed` |
| `08085d1e3fcea624481f889ef6bf8329` | Feather Falling | `long = 1` |
| `a3ecebb06794f564496a2e590a885145` | Kill Counter | Multiple entries; one per mob type |
| `64d4a87359cf9b94c9a496f0fec0880e` | Deaths | `long` |

### Attribute Bonus Stats (on Affix / BonusStat sub-units of equipped items)
| GUID | Name |
|------|------|
| `90ca4ade65d73094084afb2524dd18bc` | Strength Bonus |
| `8c6f382fc62e7a54abd32f04f6e67720` | Dexterity Bonus |
| `646f85f5ebfa69947b558bdbd96c1331` | Vitality Bonus |
| `c76898bb84052c34c8a67bc3d0005878` | Magic Bonus |
| `15261ada67c566a41ba01af15881152f` | Health Bonus (flat HP) |
| `de2fbbe8f89763b438b6eb80dce68361` | Mana Item Bonus |
| `7b8688dfc705e5a4795434a96f5faf88` | Mana Max Bonus |
| `8834f016bd6cc3547b3a540212a96a47` | Mana Regen |

### Combat Bonus Stats (on Affix / BonusStat sub-units)
| GUID | Name | Notes |
|------|------|-------|
| `57d40243ca69cdc4293ab75783630ea9` | Attack | Flat bonus |
| `0a44e6405a78a754390879f7dc500bf2` | Equip Armor Bonus | Flat armor |
| `e3e0fd5ff5f469e43bdc2de52678b9c6` | Equip Armor % | Multiplier |
| `72a9c1d23b5aaa64bab15c8c5b7128fb` | Attack Speed Multiplier | `fixed`; alt-slot excluded |
| `ffa90dc178405304c9adcc1fec04bf36` | Cast Speed Multiplier | `fixed`; alt-slot excluded |
| `fce128493e8e2e8498616d6c73c35556` | Penetration | Per-element; alt-slot excluded |
| `f1888e2481817cf4cb0f2e000974df58` | Crit Chance | Per-element; alt-slot excluded |
| `8835ea40499ac5c45a949ccce7cd1be5` | Equip Crit Chance | Same handling as Crit Chance |
| `2422fdf6009941846aefa30e599d1254` | Crit Resistance | Per-element |
| `fe9add0c2727d3c409ec60640cd420f0` | Resistance | Per-element |
| `b4f373c86515b1c4c8389c944ecb579b` | Move Speed | `fixed` |
| `0e18262ae2504484c83a8feed23fd016` | Water Walking | Boolean flag |
| `08085d1e3fcea624481f889ef6bf8329` | Feather Falling | Boolean flag |

### Skill Stats (on the character unit)
| GUID | Name | Encoding |
|------|------|----------|
| `58891c093990de64cad66fd4d3e74168` | Skill Branch Stat | `p0.prototype` = branch; `p0.long` = slot index |
| `cf616d6885c1b5745894e03892ffc160` | Skill Control Stat | `p0.prototype` = branch; `blueprint` = skill BP |
| `ce0f739fa39de3348bd4922b00144ae3` | Skill Level | `p0.blueprint` = skill BP; `long` = base level |
| `1638789fd4a687544b80f4d4b89660ce` | Skill Tome Bonus | `p0.blueprint` = skill BP; `long` = extra levels from Tomes of Skill |
| `5779a972f48109041abcf17598217001` | Skill Option Level | `p0.prototype` = upgrade proto; `long` = level |
| `25b481d33060adb478dcc38fc70cb997` | Skill Level Bonus Tag | `long` = +N; `p0.prototype` = null → global all-skills bonus; found on item affix sub-units |

### Item Stats
| GUID | Name |
|------|------|
| `4a9f733126bc51442aa34b4a1c19bf63` | Quality (rarity) — `prototype` = quality GUID |
| `528fde312ad42d949a4847aa7ecc794b` | Rare Name — `string` = rolled rare/magic item name |
| `ae186ac8917738a4d8272dca68d1f11c` | Armor Base |
| `bebbd894bd559054f9dadcce9d78799a` | Damage Base Min |
| `0346077fcd461a54ba2b3dff55c0eb26` | Damage Base Max |
| `9f9c320d8621b1047a69df8473d712c9` | Damage Type — `prototype` = element GUID |
| `b5a15f51cf6e00f4d924f5fec4a77a81` | Sockets — `long` = count; `p0.prototype` = socket type |
| `4dccf3c1179ea3e4fb57240b3727d777` | Equip Aspect (dye) — `p0.prototype` = appearance aspect proto |
| `5e8c72abf6d0350419aa7060edf20843` | Item Mark — `long = 2` = bookmarked/favourite |
| `5597d3540a0445f4eb67aa1ef5016dfb` | Item Progression Req — attribute tome tier; `long` = 1 (Tome I) or 2 (Tome II) |
| `92f5b0b797fcb204c8d048860eefb9e3` | Skill Tome Req — skill tome tier; same `long` encoding |
| `0dc8cc7fc99c9734ca589b1ac7cd2d81` | Stat Req Base — tome attribute requirement; `long` = value; `p0.prototype` = attribute GUID |
| `ff480aacdcf23da4fb7f4216650961ab` | Quantity — stackable item count |
| `67076e158ac595f45bc47c336b436b7d` | Core Source — `unitblueprint` = monster that dropped the heart |

### Socket Type Prototypes
| GUID | Type |
|------|------|
| `07826ea7c73d5df40b02785076596196` | Unique Socket |
| *(anything else)* | Common Socket |

---

## Damage / Element Type Prototype GUIDs
| GUID | Element |
|------|---------|
| `bbe7b9d922575f5469ca80b9eeac9f02` | Blunt |
| `db1b573480f3568429f4dc8c70afeb7d` | Cold |
| `49c26b4693bceee48bb7695e3d6e6d76` | Fire |
| `59c4f390c4bfa4a4fa40dd370bb62244` | Lightning |
| `0d001a391d58dc34f99e415549444f66` | Shadow |
| `1952544644d9fad4993fe76109f43381` | Slashing |
| `99f2b799d71d7cb4ca4161e44224e4af` | All (applies to all six simultaneously) |

---

## Item Quality GUIDs
The `Quality` stat uses its `prototype` field (not `long`) to identify rarity:

| GUID | Rarity |
|------|--------|
| `1c68e17dc20ee774b979ac8b7080c0b4` | Inferior |
| `6ca0be0d07c71f448a501203bc157292` | Common |
| `f1a38f31dfb7f524896b9156510bafb4` | Magic |
| `d2929ef2b92c9aa4ebd815d488f86b36` | Rare |
| `de2fcd8f48cd49e41a2961e8c45ca7c0` | Legendary |
| `6c12c7d9a15287b40aded128b6c75ce1` | Extraordinary |
| `9085e40916314054bab6c638db119953` | Runeword |

---

## Item Marks (Favourites)

`ITEM_MARK` stat (`5e8c72ab…`): `long = 2` → item is bookmarked. Present on both stash and equipped items. Renders as a bronze bookmark icon in the UI.

---

## Tome Items

Attribute tomes permanently increase an attribute's intrinsic value. Skill tomes add a permanent level bonus to a specific skill.

### Attribute Tomes

| Blueprint Contains | Intrinsic Stat Affected | Attribute |
|-------------------|------------------------|-----------|
| `vigor` | `VIT_INTRINSIC` | Vitality |
| `might` | `STR_INTRINSIC` | Strength |
| `agility` | `DEX_INTRINSIC` | Dexterity |
| `power` | `MAG_INTRINSIC` | Magic |

Parsed fields on attribute tome items:
- `item.tomeTier` — from `ITEM_PROG_REQ` (`long` = 1 or 2)
- `item.tomeReqValue` — from `STAT_REQ_BASE` (`long`)
- `item.tomeReqAttrProto` — from `STAT_REQ_BASE` `p0.prototype`

### Tome Usage Detection

A tome is **used** when the character's intrinsic count ≥ the tome's tier. Because tomes must be consumed sequentially (I before II), `intrinsic >= tier` reliably indicates whether a particular tome has been consumed:

```javascript
const intrinsicCount = charData.stats.vitalityIntrinsic;  // example: Vigor
item.tomeUsed = (intrinsicCount >= item.tomeTier);
```

### Skill Tomes

All skill and talent tomes share blueprint `da490a9d5daf7b4488a1a643d3d356da` (`"Tome of Skill Item Unit"`). They are **indistinguishable** from each other in the save — the game identifies the target skill via its own static data. Consumed tomes are removed from inventory; the bonus is recorded per-skill on the character unit via `Skill Tome Bonus` stat (`1638789f…`).

Skill tome tier is stored in `SKILL_TOME_REQ` (`92f5b0b7…`) instead of `ITEM_PROG_REQ`.

### Tome Image Files
| Tome | Image |
|------|-------|
| Tome of Agility I/II | `img/tomes/tome_of_agility.png` |
| Tome of Might I/II | `img/tomes/tome_of_might.png` |
| Tome of Power I/II | `img/tomes/tome_of_power.png` |
| Tome of Vigor I/II | `img/tomes/tome_of_vigor.png` |
| All skill/talent tomes | `img/tomes/tome_of_skill.png` |

### Attribute Type GUIDs (used as p0.prototype on STAT_REQ_BASE)
| GUID | Attribute |
|------|-----------|
| `fe2f09265d25eb5488ecd81b076fcf63` | Strength |
| `a3f14410163b5bc42b72e51ad9a4bc8e` | Dexterity |
| `cf5c6725d0622e94a8d9869526914357` | Vitality |
| `cf6a5e41fac71de48b7fc87aa12ab252` | Magic |

---

## Attribute Calculation

```
final = base_stat + intrinsic_bonus + item_bonus
```

| Component | Source | Notes |
|-----------|--------|-------|
| `base_stat` | `*_BASE` stats on char unit | Baked-in; includes class starting value + all level-up allocations. **Dexterity Base absent for Witch** — use class config fallback (30). |
| `intrinsic_bonus` | `*_INTRINSIC` stats on char unit | Accumulated from attribute tome consumption. |
| `item_bonus` | `*_BONUS` on item affix sub-units | Active equipment only; alt-slots 11–14 excluded. |

### Class Base Attribute Fallbacks

| Class | Str | Dex | Vit | Magic | Attack | HP bonus | Mana bonus |
|-------|-----|-----|-----|-------|--------|----------|------------|
| Witch | 20 | 30 | 25 | 30 | 20 | 5 | 10 |
| Crusader | 30 | 20 | 25 | 15 | 30 | 20 | 0 |
| Hunter | 25 | 30 | 20 | 15 | 30 | 10 | 5 |
| Technomancer | 15 | 25 | 30 | 20 | 25 | 15 | 10 |

---

## Health and Mana Calculation

### Health
- **`HEALTH`** (`a12ff07e…`): HP at save time; may be below max.
- **`HEALTH_BASE`** (`d935659c…`): Base max HP before vitality.
- **Max HP formula**: `healthMax = HEALTH_BASE + finalVitality + healthFromItems`
  - `healthFromItems` = sum of `HEALTH_BONUS` affixes on active items
- **Display**: `stats.health / stats.healthMax` — always read `stats.health`, not raw `stats.healthCurrent`

### Mana
- **`MANA`** (`a1a41762…`): Current mana at save time; may be below max.
- **`MANA_MAX_BONUS`** (`7b8688df…`): Character's max-mana total. **May be absent** from some saves.
- **Max Mana formula**:
  ```
  manaMax = (MANA_MAX_BONUS ?? (MANA_BASE + finalMagic)) + manaFromItems
  ```
  - `finalMagic = magicBase + magicIntrinsic + magicFromItems`
  - `manaFromItems` = sum of `MANA_ITEM_BONUS` affixes on active (non-alt) items
- **Display**: `stats.mana / stats.manaMax`

---

## Attack Speed and Cast Speed

`fixed`-point multipliers on item affix sub-units. Summed across all active equipment; alt-slots excluded. Display: `Math.round(value * 100)` → `+20%`.

---

## Per-Element Stats: Penetration, Crit Chance, Resistance, Crit Resistance

`p0.prototype` identifies the element. If equal to **All** GUID (`99f2b799…`), value applies to all six elements. **Alt-slot exclusion applies to Penetration and Crit Chance only.**

---

## Skill Level Calculation

```
effectiveLevel = baseLevel + tomeBonus + globalItemBonus
```

| Component | GUID | Source |
|-----------|------|--------|
| `baseLevel` | `ce0f739f…` | `p0.blueprint` = skill BP; `long` = level |
| `tomeBonus` | `1638789f…` | `p0.blueprint` = skill BP; `long` = cumulative tomes consumed |
| `globalItemBonus` | `25b481d3…` | On item affix sub-units; `p0.prototype` = null for global +N |

---

## Skill Structure

Each skill has:
- **Branch assignment**: `58891c09…` — `p0.prototype` = branch, `p0.long` = slot
- **Slot assignment**: `cf616d68…` — `p0.prototype` = branch, `blueprint` = skill BP
- **Base level**: `ce0f739f…`
- **Tome bonus**: `1638789f…`
- **Option/upgrade levels**: `5779a972…` — matched to parent skill by prototype GUID then name-prefix fallback

### Known Witch Skill Blueprints
| Blueprint | Name |
|-----------|------|
| `c9c8b893dbebfa61ad880108743e97b2` | Blood Lash |
| `ffc8fbd3b912ac7e1bc0b4e884188648` | Feast for Crows |
| `2f79c6a6d2f4eb954526e35bf200009e` | Shadow Walk |

### Known Witch Branch Prototypes
| Prototype | Name |
|-----------|------|
| `98d71cb016bc09c4299218b103d51941` | Blood & Bone |
| `86f24eb25dd7cae44a2065e622727df5` | Glyph |
| `8adfe3bf7439a9341831c5fa90e81a67` | Shadow |

### Known Witch Upgrade Prototypes
| Prototype | Upgrade | Parent Skill |
|-----------|---------|--------------|
| `4790c83599850c24fb58bef8964894ed` | Blood Rage | Blood Lash |
| `6a52831d1e9610447a035afaa2e3801b` | Ichor | Blood Lash |
| `282ceefefe661bd4ab06b049da4f335f` | Leech | Blood Lash |
| `8f8b9de71cb09c54b92cb261689ab66f` | Blood Glyph | Blood Lash |
| `443b10d8d3ec1c248b3758eefddd557a` | Bone Glyph | Bone Storm |
| `3d215a015edeff4489a50df7975816e9` | Shadow Glyph | Spine Breaker |
| `4c8493e66ebc14a4caae68081feeac98` | Adept | Spine Breaker |
| `9d3ac0c038c58034f8f217c54f70cef9` | Murder | Feast for Crows |
| `ce04da600ddc71d45aa161b1619b08e6` | Scourge | Shadow Walk |

*Other upgrades (Impel, Echo, Flock, Expanse, Cypher, Reprise, Stun, Umbra, etc.) fall back to name-prefix matching.*

---

## Blueprint Name Parsing (`normalizeName()`)

```
"Chest02 Padded Armor Unit"            → "Padded Armor"
"Legendary Chest02 Padded Armor Unit"  → "Padded Armor"
"Belt07 Studded Leather Armor Unit"    → "Studded Leather Belt"
"Staff07 Spired Weapon Unit"           → "Spired Staff"
"Dagger01 Knife Weapon Unit"           → "Knife"
"Amulet Jade Item Unit"                → "Jade Amulet"
"Ring 02 Item Unit"                    → "Ring"
"Gem Amber 03 Item Unit"               → gem detection (Dull Amber)
"Rune 01 Item Unit"                    → rune item
"Core Unique Lightning Item Unit"      → core heart
"Tome of Vigor Item Unit"              → "Tome of Vigor"
"Tome of Skill Item Unit"              → "Tome of Skill"
```

`_CANONICAL_WT` (module-level const, shared by `normalizeName` and `getItemTypeDisplay`) holds final display name overrides. Examples:
- `'Cloth Armor'` → `'Tunic'`
- `'Poignard Dagger'` → `'Poignard'`, `'Bodkin Dagger'` → `'Bodkin'`
- `'Buckler Shield'` → `'Buckler'`, `'Targe Shield'` → `'Targe'`
- `'Studded Leather Bootss'` → `'Studded Leather Boots'` (double-s blueprint bug)

---

## Gems

Blueprint: `Gem {Type} {N:02d} Item Unit`

| Number | Display Prefix | Image |
|--------|----------------|-------|
| 01 | Cracked | `img/gems/gem_{type}_01.png` |
| 02 | Flawed | `img/gems/gem_{type}_02.png` |
| 03 | Dull | `img/gems/gem_{type}_03.png` |

Types: Amber, Jade, Lapis, Onyx, Opal, Ruby.

---

## Dyes

1×1 stash items. Identity resolved in priority order:
1. **Blueprint GUID** — distinct catalog GUID per dye type when present
2. **Appearance aspect color string** — from `Equipment Aspect Stat` (`4dccf3c1…`)

In observed saves, all dyes share blueprint `88e6dbd697aa3f54393c811176fb3e6f`, so the color string mapping is the primary lookup.

### Dye Color String → Display Name (verified 2026-03-10)

| Color String | Dye Name |
|-------------|----------|
| `Orange Brown Copper` | Achiote |
| `Green Blue Steel` | Cadet |
| `Red Black Steel` | Cardinal |
| `Red White Copper` | Cinnibar |
| `Black White Bronze` | Eventide |
| `Yellow Black Copper` | Hornet |
| `Blue Orange Bronze` | Kingfisher |
| `Brown Yellow Copper` | Lion |
| `DarkBrown Orange Brass` | Monarch |
| `DarkBlue Yellow Brass` | Myrmidon |
| `White Blue Steel` | Nimbus |
| `Black Red Silver` | Queen of Night |
| `Purple Orange Bronze` | Royal |
| `Tan Brown Brass` | Serengeti |
| `LightPurple Green Bronze` | Syringa |
| `Orange Black Steel` | Tigress |
| `LightBlue Yellow Steel` | Ursa Major |

Image path: `img/dyes/{name_lowercase_underscores}_dye.png`

### Dye Catalog Blueprint GUIDs (where known)

| Dye | Blueprint GUID |
|-----|----------------|
| Cadet | `d55d2c9357213b4ee89318df52b30bc4` |
| Cinnibar | `f33b0a9357213b4ee89318df52b30bc4` |
| Eventide | `c34d9a9357213b4ee89318df52b30bc4` |
| Hornet | `e22a9f9357213b4ee89318df52b30bc4` |
| Kingfisher | `b23c8f9357213b4ee89318df52b30bc4` |
| Lion | `f67a2d9357213b4ee89318df52b30bc4` |
| Monarch | `b13c8f8d227448e89318df52b30bc412` |
| Nimbus | `e89c4f9357213b4ee89318df52b30bc4` |
| Queen of Night | `f90d5f9357213b4ee89318df52b30bc4` |
| Royal | `e56f1c9357213b4ee89318df52b30bc4` |
| Serengeti | `a44c1b9357213b4ee89318df52b30bc4` |
| Syringa | `d94acd9357213b4ee89318df52b30bc4` |
| Tigress | `d45e0b9357213b4ee89318df52b30bc4` |
| Ursa Major | `a78b3e9357213b4ee89318df52b30bc4` |

Verify: Achiote, Cardinal, Myrmidon catalog GUID.

---

## Core Hearts

Blueprint encodes quality × element only. Monster identity comes from `Core Source Stat` (`67076e15…`) `unitblueprint`.

### Image Filename Convention

Non-unique: `core_{rarity}_{element}_heart.png` (rarity = common/elite/champion, element = cold/fire/lightning/nature/shadow).  
Unique: `core_u_{monster_slug}.png` where slug = `heartName.toLowerCase().replace(/\s+/g, '_')`.

Rarity is encoded in the blueprint name (`Core Unique Shadow Item Unit` etc.) — **no QUALITY stat on hearts**.

### Blueprint GUIDs (one per quality × element)

| Type | GUID |
|------|------|
| Core Common Cold | `71fdb6be700efe84488cd3c5ffd7b2d4` |
| Core Common Fire | `012e1b12dfb1e994dbfc591be30f1353` |
| Core Common Lightning | `0cf8ff29f162d0046b89c875cc85d8f4` |
| Core Common Nature | `41f7f2d5c6f0329469fadae20eb18ded` |
| Core Common Shadow | `dbaaf6c8a21c0894d96116355211a9d4` |
| Core Elite Cold | `043387fa123fb0348ac89bf25662f816` |
| Core Elite Fire | `309673cd638fd1f4089599a1d67d8a8a` |
| Core Elite Lightning | `062aca99edbcef84e955e9ecd31795d1` |
| Core Elite Nature | `4c34c2b2b8860d54aa7e362eb814f2c8` |
| Core Elite Shadow | `d704c53662068d1458b7cd23c6a5d6ad` |
| Core Champion Cold | `d0177a7ebe143794fa9891856ac2c066` |
| Core Champion Fire | `4c0060c54ec0ca74c9dbd1a100f0d291` |
| Core Champion Lightning | `e3829ef9ea545a44187e39db69180342` |
| Core Champion Nature | `8dd65f9b627a794459d4e29b54575e00` |
| Core Champion Shadow | `627f3f7545af67849b163020ffa48df2` |
| Core Unique Cold | `2dcb404d204628a469695ba30e990cd0` |
| Core Unique Fire | `46e40b6998e5b704b9c9532681781114` |
| Core Unique Lightning | `12ea3979ae409a84ead701646c893f13` |
| Core Unique Nature | `774c37b28f1f1e6469aaac38e5cd734d` |
| Core Unique Shadow | `45599bda3a56d0742bcc4e1f44d0f213` |

### Monster Source → Heart Display Name

| Source Unit (DH_GUIDS name) | Heart Display Name |
|-----------------------------|--------------------|
| `Barrow Knight 1H Slashing Unique Unit` | Disgraced Paladin Heart |
| `Blight Roach Unit` | Blight Roach Heart |
| `Bogie Chopper Unit` | Bogie Chopper Heart |
| `Bogie Feral Unit` | Bogie Feral Heart |
| `Bogie Feral Unique Unit` | Rokkudokin Heart |
| `Bogie Spearman Unit` | Bogie Spearman Heart |
| `Bogie Tyrant Unique Unit` | Warren Chief Heart |
| `Doomed Soldier 2H Spear Unit` | Doomed Soldier Heart |
| `Giant Blight Roach Unit` | Giant Blight Roach Heart |
| `Gloom Parasite Unit` | Gloom Parasite Heart |
| `Gulpjaw Unit` | Gulpjaw Heart |
| `Gulpjaw Unique Unit` | Blubberjaw Heart |
| `Mega Gazer Unit` | Goke the Intruder Heart |
| `Melee Swamp Husk Unique Unit` | Char Root Heart | ⚠ Drops **fire** heart as of patch 0.0.23609 (was nature) |
| `Necropolis Lich Boss Unit` | Narlathak Heart |
| `Skeleton Frost Mage Unit` | Skeleton Frost Mage Heart |
| `Skeleton Shadow Mage Unique Unit` | Council of Five Heart |
| `Tunnel Thug Unit` | Tunnel Thug Heart |
| `Unique Bramblehusk Unit` | Old Granddad Heart |
| `Unique Deep Ones Unit` | Riptide Horror Heart |
| `825fb672…` *(not in DH_GUIDS)* | Champion Gulpjaw Heart |

Unique heart monsters (use `core_u_` image prefix) are listed in `_UNIQUE_HEART_MONSTERS` in `maxparser.js`.

---

## Drop Source Info (Legendary Items)

**Legendaries do NOT store a drop source.** The only per-item origin data in the save is on Core Hearts via `Core Source Stat`.

---

## Character Data Summary

All fields produced by `processCharacterData()`:

- **Name**: Digest `Name` → `PROPERNAME` stat string fallback
- **Class**: Character unit blueprint vs `CLASS_CONFIG.blueprints`, then branch GUIDs
- **Level / Experience**: `LEVEL` stat; `EXPERIENCE` absent in offline saves
- **Attributes**: `base + intrinsic + fromItems` for Strength, Dexterity, Vitality, Magic
- **Health / Mana**: see formulas above
- **Stamina**: base + max from char unit
- **Attack / Armor**: base from char unit + accumulated from active item affixes
- **Attack Speed / Cast Speed**: summed from active item affixes (alt-slots excluded)
- **Penetration / Crit / Resistance / Crit Resistance**: per-element maps from active item affixes
- **Gold / Stone**: `long` from char unit
- **Flask charges / max**: `FLASK` + `FREE_FLASK`
- **Mana Regen**: `MANA_REGEN` from char unit + item affixes
- **Magic Find / Gold Find / Item Find**: from char unit and item affixes
- **Kills**: `KILL_COUNTER` per-mob entries with name + rarity resolution
- **Deaths**: `KILLED_BY` stat
- **Skills**: level entries + tome bonuses + global item bonus
- **Skill upgrades**: `SKILL_OPTION` entries matched to parent skills
- **Skill branches**: `SKILL_BRANCH` entries sorted by slot
- **Tattoos**: rune items in EQUIPMENT slots 15–27
- **Equipment**: items in EQUIPMENT container by slot index
- **Stash**: items in STASH container with grid positions

---

## Format Changes by Patch

### 0.0.23609 (2026-03-16)
Comparison: `xerxes.max` (pre-patch) vs `783aea6316f6c9ee.max` (post-patch).

#### Header (bytes 0–7)
| Byte(s) | Pre-patch | Post-patch | Notes |
|---------|-----------|------------|-------|
| 0–2 | `6d 61 76` | `6d 61 76` | Unchanged (`mav`) |
| 3 | `2a` (`*`) | `01` | Format version byte changed |
| 4–7 | `86 fa 9d c4` | `48 91 9a 12` | Unknown; not a timestamp; changes per save |

#### Digest
New field `Id` added — absent in pre-patch saves, present post-patch:
```json
{ "$version": 1, "Name": "Edith", "Level": 8, "World": "0x583aea...", "Id": "0x783aea6316f6c9ee" }
```
`Id` matches the character unit `dbid` and the save filename (without `.max`).

#### Character unit `dbid`
| Pre-patch | Post-patch |
|-----------|------------|
| Always `"0x0"` | Unique 64-bit hex ID — e.g. `"0x783aea6316f6c9ee"` |

The character is still identified by **absence of the `location` field**, not by `dbid`. The `dbid` now links the unit to `Digest.Id` and the filename.

#### Character unit stats
| | Pre-patch | Post-patch |
|-|-----------|------------|
| Raw `stats.data` array length | 142 | 212 |
| Unique stat GUIDs | 33 | 36 |

**New stat GUIDs** (post-patch only):

| GUID | Sample value | Notes |
|------|-------------|-------|
| `64d4a87359cf9b94c9a496f0fec0880e` | `long: 65`, params: `{p0:{unitblueprint:null}, p1:{prototype:null}}` | Unknown — parameterised, null refs |
| `79d671b40f7cc964ca7bbec1e300ddbf` | `long: 1695901`, params: `{p0:{blueprint:"c5bf2b07…"}}` | Unknown — references a blueprint |
| `8eed7330523b63e41adfad5d8cc11fd6` | `long: 10112009` | Unknown — large integer, no params |
| `e9edcc60999e67841af2a0a5c5891596` | `long: 1` | Unknown — likely a flag |

**Removed stat GUID** (pre-patch only):

| GUID | Last known value | Notes |
|------|-----------------|-------|
| `6fe46d231b86bbe4e9cd3459c27f49ba` | `long: 31` | Removed in 0.0.23609 |

#### Other unit-level keys
No changes — both versions use `blueprint`, `dbid`, `location`, `otherstats`, `stats`. `location` sub-keys (`owner`, `container`, `index`) also unchanged.

---

## Notes
- All GUID comparisons must be lowercase
- The character unit is the **unit with no `location` field** in the units array
- Character `dbid` is `"0x0"` in pre-0.0.23609 saves; unique ID in post-patch saves — do not rely on `dbid` to identify the character unit
- `DEXTERITY_BASE` is absent for the Witch — use class config fallback (30)
- Attribute base stats bake in class starting value + all level-up allocations
- `MANA_MAX_BONUS` is absent from some saves — fallback formula produces correct results in both cases
- `Experience` is absent from offline saves — display "Level Cap"
- Blueprint GUID dictionary: `DH_GUIDS` in `maxguids.js`
- All GUID keys in `DH_GUIDS` are quoted strings
- Skill/talent tome items all share one blueprint (`da490a9d…`) and are indistinguishable in the save
