# Darkhaven (Demo) Character Browser

An unofficial fan-made save file inspector for [Darkhaven](https://moonbeastgame.com).

![Character Panel](img/screenshots/character_panel.png)


## How to use

1. Open `index.html` directly in **Chrome, Edge, Opera or Brave** (requires the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) — Firefox is not supported)
2. Click **Open Save Folder** and select your Darkhaven save directory
3. Your characters load automatically — click any character card to view details

Your save folder is typically at:
```
%APPDATA%\LocalLow\MoonBeast Production\Darkhaven Demo\Save
```

No installation, no server, no internet connection required. Everything runs locally in the browser.

> **Unofficial fan tool** — not affiliated with or endorsed by Moon Beast Productions.

---

## Features

**Character overview**
- Class, level, and XP progress bar
- Attributes: Strength, Dexterity, Vitality, Magic (base + intrinsic + item bonuses)
- Combat stats: Attack, Armor, Crit Chance, Crit Resistance, Penetration, Resistances
- Resources: Life and Mana bars with current/max values, Mana Regen, Stamina, Flask charges
- Detailed stats: Attack Speed, Cast Speed, Move Speed, Magic Find, Gold Find, Item Find

**Paperdoll**
- Full equipment layout with item art
- Socket overlays showing socketed gems, hearts, and runes using their actual in-game images
- Hover any item for a full tooltip — affixes, sockets, requirements, legendary text

**Stash**

![Stash Grid View](img/screenshots/stash_gridview.png)
- Grid view: 15×16 stash grid with accurate item sizes and positions, item art, rarity borders
- List view: sorted/filterable item list with thumbnails
- Core/Heart cells coloured by rarity (Common, Elite, Champion, Unique)
- Item socket support, including socketed items
- Favourite item tag support
- Full item tooltips on hover

**Skills**
![Skills Panel](img/screenshots/skills.png)
- All three skill branches with current levels, tome bonuses, and global skill bonuses from rings
- Skill upgrade cards showing unlocked options
- Tooltips with descriptions and upgrade effects
- Panel can be collapsed/expanded, state saved between sessions

**Tattoos (Rune Garments)**
![Tattoos Panel](img/screenshots/tattoos.png)
- All rune garment slots with equipped runes and their socket effects
- Panel can be collapsed/expanded, state saved between sessions

**Kill Log**
![Kill Log Panel](img/screenshots/kill_log.png)
- Top killed monsters with counts, sortable by kills, Rarity, and Monsters
- Panel can be collapsed/expanded, state saved between sessions

**Legendary Catalogue**
![Legendary Catalogue Panel](img/screenshots/legendaries.png)
- Summary panel listing all legendary items found across the loaded saves
- Panel can be collapsed/expanded, state saved between sessions

**Multi-save support**
- Loads all `.max` save files from a folder (and subfolders) at once
- Groups saves by character, shows most recent per character by default
- Configurable limit (default: 20 saves per character) to keep loading fast

Tip: Use the [HavenForge](https://havenforge.gg) app to manage multiple Single Player Save files in the Darkhaven pre-alpha Demo.

---

## Files

| File | Purpose | Required |
|------|---------|----------|
| `index.html` | App shell and layout | Yes |
| `app.js` | UI rendering, tooltip system, stash grid | Yes |
| `app.css` | Main style definitions for page appearance | Yes |
| `maxparser.js` | `.max` save file parser — decompression, stat extraction, item resolution | Yes |
| `maxguids.js` | DH_GUIDS container for all known guids from the .max save files (Demo only) | Yes |
| `skills.md`| Details the skills and skill upgrade information, will need to be updated as the game advances. Not needed for the tool to run, documentation only. | No |
| `darkhaven_save_format.md` | Analysis of the .max save format and its GUIDs (Demo version). Not needed for the tool to run, documentation only. | No |

## Folder structure
| Folder | Contents | File pattern |
|--------|----------|--------------|
| `img/cores` | Heart images | `core_{rarity}_{element}_heart.png` |
| `img/dyes` | Dye images | `{name}_dye.png` |
| `img/gems` | Gem images | `gem_{type}_{nr}.png` — `01` Cracked · `02` Flawed · `03` Dull |
| `img/items` | Item images | `{a/l/j/s/w}_{name}.png` — legendary items use `.webp` |
| `img/runes` | Rune images | `rune{nr}_{name}.png` — `01`–`05` |
| `img/skills` | Skill & upgrade images | `skill_{option}_{name}.png` |
| `img/tomes` | Tome images | `tome_of_{name}.png` |


> **Adding or replacing images:** Place images in the appropriate `img/` subfolder following the naming convention, e.g. for `items`
> (`a_` = armor, `j_` = jewelry, `s_` = shield, `w_` = weapon, `l_` = legendary `.webp`).
> The app will load them automatically on the next scan.

---

## Limitations

- **Chromium-based browsers only** — the File System Access API is not supported in Firefox or Safari
- Save format is reverse-engineered and may break after game updates
- Some item names and stats may be missing or approximate for newer content

---

## Notice

See [NOTICE.md](NOTICE.md) for attribution and IP information. Game content belongs to Moon Beast Productions. No affiliation implied.
