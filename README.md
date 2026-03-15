# Darkhaven (Demo) Character Browser

An unofficial fan-made save file inspector for [Darkhaven](https://moonbeastgame.com). Point it at your save folder and browse all your characters — stats, equipment, stash, skills, kill log — without launching the game.

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
- Grid view: 15×16 stash grid with accurate item sizes and positions, item art, rarity borders
- List view: sorted/filterable item list with thumbnails
- Core/Heart cells coloured by rarity (Common, Elite, Champion, Unique)
- Full item tooltips on hover

**Skills**
- All three skill branches with current levels, tome bonuses, and global skill bonuses from rings
- Skill upgrade cards showing unlocked options
- Tooltips with descriptions and upgrade effects

**Tattoos (Rune Garments)**
- All rune garment slots with equipped runes and their socket effects

**Kill Log**
- Top killed monsters with counts, sortable by kills

**Legendary Catalogue**
- Summary panel listing all legendary items found across the loaded saves

**Multi-save support**
- Loads all `.max` save files from a folder (and subfolders) at once
- Groups saves by character, shows most recent per character by default
- Configurable limit (default: 20 saves per character) to keep loading fast

Tip: Use the [HavenForge](https://havenforge.gg) app to manage multiple Single Player Save files in the Darkhaven pre-alpha Demo.

---

## How to use

1. Open `index.html` directly in **Chrome or Edge** (requires the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) — Firefox is not supported)
2. Click **Open Save Folder** and select your Darkhaven save directory
3. Your characters load automatically — click any character card to view details

Your save folder is typically at:
```
%APPDATA%\LocalLow\MoonBeast Production\Darkhaven Demo\Save
```

No installation, no server, no internet connection required. Everything runs locally in the browser.

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | App shell and all CSS |
| `app.js` | UI rendering, tooltip system, stash grid |
| `app.css` | main style defnitions for page appeareance |
| `maxparser.js` | `.max` save file parser — decompression, stat extraction, item resolution |
| `maxguids.js` | DH_GUIDS container for all known guids from the .max save files (Demo only) |
| `skills.md`| details the skills and skill ugrade information, will need to be updated as the game advances
| `darkhaven_save_format.md` | analysis of the .max save format and its GUIDs (Demo version)

## Folder structure
| Root | Purprose |
|------|---------|
- img
    - cores | heart images: core_{mob_rarity_{element}_heart.png}
    - dyes | dye images: {name}_dye.png
    - gems | gem images: gem_{gem_type}_{rarity_number 01-03}.png (Demo ends at Dulled = 03)
    - items | item images: {a/l/j/s/w}_{item_name}.png (.webp if {l})
    - runes | rune images: rune{rarity_nr 01-05}_{rune_name}.png
    - skills | skill and skill upgrade images: skill_{option}_{name}.png
    - tomes | tome images: tome_of_{name}.png (all {skill} tomes have the same image in the demo) 

Note: If you notice any missing images for items, you can easily add them yourself in the e.g. "img/items/" folder, following the naming conventions (a_= armor, j_=jewelry, s=shield, w_=weapon, etc.) for each item category (see file names in folder). Once they are placed in the appropriate subfolder, the page will load them, provided that the filenames follow the same syntax.

---

## Limitations

- **Chrome / Edge only** — the File System Access API used to read your save folder is not available in Firefox
- Save format is reverse-engineered and may break after game updates
- Some item names and stats may be missing or approximate for newer content

---

## Notice

See [NOTICE.md](NOTICE.md) for attribution and IP information. Game content belongs to Moon Beast Productions. No affiliation implied.
