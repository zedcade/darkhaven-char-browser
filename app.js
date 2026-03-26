// app.js
document.addEventListener('DOMContentLoaded', () => {

  // ── DOM refs ──────────────────────────────────────────────────────────────
  // folderInput replaced by showDirectoryPicker()
  const openFolderBtn  = document.getElementById('open-folder-btn');
  const fileListEl     = document.getElementById('file-list');
  // Feature-detect the Chrome/Edge File System Access API.
  // Firefox uses <input webkitdirectory> as fallback (see scanFromFileList below).
  const HAS_DIR_PICKER = typeof window.showDirectoryPicker === 'function';
  const limitToggle    = document.getElementById('limit-toggle');
  const limitSpinner   = document.getElementById('limit-count');
  const resetFolderBtn = document.getElementById('reset-folder-btn');
  if (resetFolderBtn) {
    resetFolderBtn.addEventListener('click', () => window._resetSaveFolder && window._resetSaveFolder());
  }

  // ── Persist limit settings across reloads ─────────────────────────────────
  // Default: ON, 20 saves/char — written on first load if no key exists
  if (localStorage.getItem('dh_limitEnabled') === null) localStorage.setItem('dh_limitEnabled', '1');
  if (localStorage.getItem('dh_limitCount')   === null) localStorage.setItem('dh_limitCount', '20');
  let limitEnabled = localStorage.getItem('dh_limitEnabled') === '1';
  let limitCount   = parseInt(localStorage.getItem('dh_limitCount') || '20', 10) || 20;

  // ── Persist panel collapse states ────────────────────────────────────────
  // Keys: dh_collapsed_skills | dh_collapsed_tattoos | dh_collapsed_kill | dh_collapsed_legendary
  // Value: '1' = collapsed, '0' = expanded (default expanded = false)
  const LS_COLLAPSED = {
    skills:    'dh_collapsed_skills',
    tattoos:   'dh_collapsed_tattoos',
    kill:      'dh_collapsed_kill',
    legendary:     'dh_collapsed_legendary',
    achievements:   'dh_collapsed_achievements',
    stashView: 'dh_stash_view',
  };
  function getPanelCollapsed(key) { return localStorage.getItem(LS_COLLAPSED[key]) === '1'; }
  function setPanelCollapsed(key, val) { localStorage.setItem(LS_COLLAPSED[key], val ? '1' : '0'); }
  function getStashView()  { return localStorage.getItem(LS_COLLAPSED.stashView) || 'list'; }
  function setStashView(v) { localStorage.setItem(LS_COLLAPSED.stashView, v); }

  // Helper: build a collapse toggle button for any panel header
  function makePanelToggle(collapsed) {
    const btn = document.createElement('button');
    btn.className = 'dh-panel-toggle' + (collapsed ? ' dh-panel-toggle--collapsed' : '');
    btn.title = 'Expand / Collapse';
    btn.innerHTML = '▾';
    return btn;
  }

  if (limitToggle) {
    limitToggle.checked = limitEnabled;
    if (limitSpinner) { limitSpinner.disabled = !limitEnabled; limitSpinner.classList.toggle('limit-spinner--dim', !limitEnabled); }
    limitToggle.addEventListener('change', () => {
      limitEnabled = limitToggle.checked;
      localStorage.setItem('dh_limitEnabled', limitEnabled ? '1' : '0');
      if (limitSpinner) {
        limitSpinner.disabled = !limitEnabled;
        limitSpinner.classList.toggle('limit-spinner--dim', !limitEnabled);
      }
      // Limit is applied at load time — rescan needed to take effect
      if (loadedFiles.length) {
        openFolderBtn.classList.add('btn--rescan-pending');
      }
    });
    // Tooltip on the toggle wrap
    const _toggleTipHtml =
      '<div class="scan-tip-title">Save File Limit</div>' +
      '<div class="scan-tip-body"><em>All files in the Save folder are always scanned.</em><br><br>' +
      'When <strong class="tip-highlight">ON</strong>: only the N most recent saves per character are <em>parsed</em> — fast.<br>' +
      '<span class="dh-warn-hint">When <strong>OFF</strong>: every save file is fully parsed — can be slow with large folders.</span></div>';
    const _toggleWrap = limitToggle.closest('.dh-toggle-wrap') || limitToggle.parentElement;
    if (_toggleWrap) {
      _toggleWrap.addEventListener('mouseenter', e => showStatTip(_toggleTipHtml, e.clientX, e.clientY));
      _toggleWrap.addEventListener('mousemove',  e => moveStatTip(e.clientX, e.clientY));
      _toggleWrap.addEventListener('mouseleave', () => hideStatTip());
    }
  }
  if (limitSpinner) {
    limitSpinner.value = limitCount;
    limitSpinner.addEventListener('change', () => {
      limitCount = Math.max(1, Math.min(50, parseInt(limitSpinner.value) || 20));
      limitSpinner.value = limitCount;
      localStorage.setItem('dh_limitCount', String(limitCount));
      // Limit is applied at load time — rescan needed
      if (limitEnabled && loadedFiles.length) {
        openFolderBtn.textContent = '↺ Rescan to apply limit';
        openFolderBtn.classList.add('btn--rescan-pending');
      }
    });
    // Custom tooltip for limit count spinner
    const _limTipHtml =
      '<div class="scan-tip-title">Save File Limit</div>' +
      '<div class="scan-tip-body">Loads only the <strong class="tip-highlight">most recent N saves</strong> per character. ' +
      'Keeps scanning fast when you have many saves. Range: 1–50.</div>';
    limitSpinner.addEventListener('mouseenter', e => showStatTip(_limTipHtml, e.clientX, e.clientY));
    limitSpinner.addEventListener('mousemove',  e => moveStatTip(e.clientX, e.clientY));
    limitSpinner.addEventListener('mouseleave', () => hideStatTip());
  }

  // ── Scan button custom tooltip ────────────────────────────────────────────
  const _scanTipHtml =
    '<div class="scan-tip-title">Scan Save Folder</div>' +
    '<div class="scan-tip-body">' +
      'Select your Darkhaven <strong class="tip-highlight">Save</strong> folder to load character files. ' +
      'Scanning may take a few seconds depending on file count.' +
    '</div>' +
    '<div class="scan-tip-privacy">' +
      '<span>🔒</span>' +
      '<span>Everything runs locally — no data is sent anywhere.</span>' +
    '</div>';
  openFolderBtn.addEventListener('mouseenter', e => showStatTip(_scanTipHtml, e.clientX, e.clientY));
  openFolderBtn.addEventListener('mousemove',  e => moveStatTip(e.clientX, e.clientY));
  openFolderBtn.addEventListener('mouseleave', () => hideStatTip());

  // ── Reset button custom tooltip ───────────────────────────────────────────
  const _resetTipHtml =
    '<div class="scan-tip-title">Reset Folder</div>' +
    '<div class="scan-tip-body">' +
      'Clears the remembered save folder and resets all settings. ' +
      'Your save files are <strong class="tip-highlight">not deleted</strong>.' +
    '</div>';
  const resetFolderBtnEl = document.getElementById('reset-folder-btn');
  if (resetFolderBtnEl) {
    resetFolderBtnEl.addEventListener('mouseenter', e => showStatTip(_resetTipHtml, e.clientX, e.clientY));
    resetFolderBtnEl.addEventListener('mousemove',  e => moveStatTip(e.clientX, e.clientY));
    resetFolderBtnEl.addEventListener('mouseleave', () => hideStatTip());
  }
  const IDB_NAME = 'darkhaven-browser', IDB_STORE = 'settings', IDB_KEY = 'folderHandle';
  function idbOpen() {
    return new Promise((res, rej) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE);
      req.onsuccess = e => res(e.target.result);
      req.onerror   = e => rej(e.target.error);
    });
  }
  async function idbGet(key) {
    try {
      const db = await idbOpen();
      return new Promise((res, rej) => {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const req = tx.objectStore(IDB_STORE).get(key);
        req.onsuccess = e => res(e.target.result);
        req.onerror   = e => rej(e.target.error);
      });
    } catch(e) { return null; }
  }
  async function idbSet(key, value) {
    try {
      const db = await idbOpen();
      return new Promise((res, rej) => {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        const req = tx.objectStore(IDB_STORE).put(value, key);
        req.onsuccess = () => res();
        req.onerror   = e => rej(e.target.error);
      });
    } catch(e) { /* ignore */ }
  }

  async function idbDel(key) {
    try {
      const db = await idbOpen();
      return new Promise((res, rej) => {
        const tx = db.transaction('settings', 'readwrite');
        tx.objectStore('settings').delete(key);
        tx.oncomplete = () => { db.close(); res(); };
        tx.onerror    = e => { db.close(); rej(e); };
      });
    } catch(e) { /* ignore */ }
  }

  let _activeFolderHandle = null;

  window._resetSaveFolder = async function() {
    try { await idbDel(IDB_KEY); } catch(e) {}
    _activeFolderHandle = null;
    loadedFiles = [];
    charCache = {};
    openFolderBtn.innerHTML = '<span class="btn-label">Scan Save Folder</span>';
    openFolderBtn.classList.remove('btn--rescan-pending');
    openFolderBtn.disabled = false;
    fileListEl.innerHTML = '<li class="file-list-empty">No files loaded.<br>Select your Darkhaven Save folder.</li>';
    setFolderPathDisplay(true);
    localStorage.setItem('dh_limitEnabled', '1');
    localStorage.setItem('dh_limitCount', '20');
    if (limitToggle)  { limitToggle.checked = true; limitEnabled = true; }
    if (limitSpinner) { limitSpinner.value = 20; limitSpinner.disabled = false; limitSpinner.classList.remove('limit-spinner--dim'); limitCount = 20; }
    const dv = document.getElementById('detail-view');
    if (dv) dv.classList.remove('active');
  };

  // ── Folder path display ───────────────────────────────────────────────────
  const DEFAULT_SAVE_PATH = '%APPDATA%\\LocalLow\\MoonBeast Production\\Darkhaven Demo\\Save';
  const LS_FOLDER_PATH    = 'dh_folderPath';
  const _folderHintSpan   = document.querySelector('.dh-folder-hint > span');

  /**
   * Update the folder-hint text below the scan button.
   * Reads stored path from localStorage; falls back to default.
   * Pass clearStored=true to revert to default and clear localStorage.
   */
  function setFolderPathDisplay(clearStored) {
    if (!_folderHintSpan) return;
    if (clearStored) {
      localStorage.removeItem(LS_FOLDER_PATH);
      _folderHintSpan.textContent = '\uD83D\uDCC1 ' + DEFAULT_SAVE_PATH;
      _folderHintSpan.removeAttribute('title');
    } else {
      const stored = localStorage.getItem(LS_FOLDER_PATH);
      if (stored) {
        _folderHintSpan.textContent = '\uD83D\uDCC1 ' + stored;
        _folderHintSpan.title = DEFAULT_SAVE_PATH;
      } else {
        _folderHintSpan.textContent = '\uD83D\uDCC1 ' + DEFAULT_SAVE_PATH;
        _folderHintSpan.removeAttribute('title');
      }
    }
  }

  /**
   * Show a one-time inline path confirm prompt below the scan button.
   * Pre-fills with DEFAULT_SAVE_PATH. On confirm, stores in localStorage
   * and updates the hint. Skipped if a path is already stored.
   */
  function promptFolderPath() {
    if (localStorage.getItem(LS_FOLDER_PATH)) {
      setFolderPathDisplay(false);
      return;
    }
    const _folderHint = document.querySelector('.dh-folder-hint');
    if (!_folderHint) { setFolderPathDisplay(false); return; }

    // Remove any existing prompt
    const _existing = document.getElementById('dh-path-prompt');
    if (_existing) _existing.remove();

    const _prompt = document.createElement('div');
    _prompt.id = 'dh-path-prompt';
    _prompt.className = 'dh-path-prompt';
    _prompt.innerHTML =
      '<div class="dh-path-prompt-label">Confirm your Save folder path:</div>' +
      '<div class="dh-path-prompt-row">' +
        '<input type="text" class="dh-path-prompt-input" id="dh-path-input" spellcheck="false">' +
        '<button class="dh-path-prompt-ok" id="dh-path-ok">✓</button>' +
      '</div>';
    _folderHint.insertAdjacentElement('afterend', _prompt);

    const _input = document.getElementById('dh-path-input');
    const _ok    = document.getElementById('dh-path-ok');
    _input.value = DEFAULT_SAVE_PATH;
    _input.select();

    const _confirm = () => {
      const val = _input.value.trim();
      if (val) {
        localStorage.setItem(LS_FOLDER_PATH, val);
        setFolderPathDisplay(false);
      }
      _prompt.remove();
    };

    _ok.addEventListener('click', _confirm);
    _input.addEventListener('keydown', e => { if (e.key === 'Enter') _confirm(); });
  }

  // ── On load: try to restore the last folder handle (Chrome/Edge only) ──────
  // Firefox doesn't support the File System Access API so there is nothing to restore.
  (async function tryRestoreFolder() {
    if (!HAS_DIR_PICKER) return;
    try {
      const handle = await idbGet(IDB_KEY);
      if (!handle) return;

      // Query permission state without triggering a prompt
      const state = await handle.queryPermission({ mode: 'read' });

      if (state === 'granted') {
        // Permission still active — scan immediately
        _activeFolderHandle = handle;
        openFolderBtn.disabled = true;
        openFolderBtn.innerHTML = '<span class="btn-label">↻ Rescanning…</span>';
        await scanSaveFolder(handle);
      } else {
        // 'prompt' or 'denied' — browser restart revoked permission.
        // Can't call requestPermission() without a user gesture, so surface a button.
        _activeFolderHandle = handle;
        const folderName = handle.name || 'saved folder';
        openFolderBtn.innerHTML = '<span class="btn-label">🔓 Re-grant Access: ' + folderName + '</span>';
        setFolderPathDisplay(false);  // show stored path or default
      }
    } catch(e) {
        console.warn('[restore folder]', e);

        // Folder no longer exists, handle is invalid, or permission was revoked –
        // treat any error here as unrecoverable and clear the saved handle.
        try { await idbDel(IDB_KEY); } catch (_) {}

        _activeFolderHandle = null;
        loadedFiles = [];
        charCache = {};

        setFolderPathDisplay(true);  // clear stored path, revert to default

        // Reset scan button label and state
        openFolderBtn.innerHTML = `<span class="btn-label">Scan Save Folder</span>`;
        openFolderBtn.classList.remove("btn--rescan-pending");
        openFolderBtn.disabled = false;

        // Reset file list
        fileListEl.innerHTML =
          `<li class="file-list-empty">No files loaded.<br>Select your Darkhaven Save folder.</li>`;
      }
  })();

  const detailView    = document.getElementById('detail-view');
  const elName        = document.getElementById('char-name');
  const elLevel       = document.getElementById('char-level');
  const elClass       = document.getElementById('char-class');
  const elStats       = document.getElementById('stats-container');
  const elEquip       = document.getElementById('equip-container');

  let loadedFiles = [];
  let charCache   = {};          // filename → parsed data
  let _currentCharData = null;  // currently displayed character data (for tooltip requirement checks)
  let _currentItem     = null;  // item currently being rendered in tooltip (for merge exceptions)
  let legCatalogue = {};         // canonical id → { found, items[] }
  let stashViewMode = getStashView();   // 'list' | 'grid' — persisted in LS

  // ── Static legendary catalogue ────────────────────────────────────────────
  // 31 items, ordered by category. Stats populated at runtime from saves.
  const LEGENDARY_CATALOGUE = [
    // Amulets
    {id:'Legendary Amulet01', name:'Heart of White Mountain', cat:'Amulets', slot:'Amulet'},
    {id:'Legendary Amulet02', name:'Key of Silver Flame',     cat:'Amulets', slot:'Amulet'},
    {id:'Legendary Amulet03', name:'Mouth of Madness',        cat:'Amulets', slot:'Amulet'},
    // Belts
    {id:'Legendary Belt01',   name:'Misery Cord',             cat:'Belts',   slot:'Belt'},
    {id:'Legendary Belt03',   name:"War Goddess's Girdle",    cat:'Belts',   slot:'Belt'},
    // Boots
    {id:'Legendary Boots01',  name:'Hushpaws',                cat:'Boots',   slot:'Boots'},
    {id:'Legendary Boots02',  name:'Twin Hurricanes',         cat:'Boots',   slot:'Boots'},
    {id:'Legendary Boots04',  name:'Voidstalkers',            cat:'Boots',   slot:'Boots'},
    // Chest
    {id:'Legendary Chest01',  name:"Night's Embrace",         cat:'Chest',   slot:'Chest'},
    {id:'Legendary Chest02',  name:"Johann's Mystic Dreamcoat",cat:'Chest',  slot:'Chest'},
    {id:'Legendary Chest07',  name:'Bloody Bones',            cat:'Chest',   slot:'Chest'},
    // Daggers
    {id:'Legendary Dagger01', name:'Grimalkin',               cat:'Daggers', slot:'Main Hand'},
    {id:'Legendary Dagger02', name:'Flickerfang',             cat:'Daggers', slot:'Main Hand'},
    {id:'Legendary Dagger03', name:'Shiver',                  cat:'Daggers', slot:'Main Hand'},
    {id:'Legendary Dagger04', name:'Emberthorn',              cat:'Daggers', slot:'Main Hand'},
    {id:'Legendary Dagger06', name:'Sorcere',                 cat:'Daggers', slot:'Main Hand'},
    // Flasks
    {id:'Legendary Flask01',  name:'Holy Flask',              cat:'Flasks',  slot:'Flask'},
    {id:'Legendary Flask03',  name:'Legendary Flask 3',       cat:'Flasks',  slot:'Flask'},
    // Gloves
    {id:'Legendary Gloves01', name:'Fenix Fingers',           cat:'Gloves',  slot:'Gloves'},
    {id:'Legendary Gloves03', name:"Johann's Bedazzlers",     cat:'Gloves',  slot:'Gloves'},
    {id:'Legendary Gloves06', name:'Gloom Talon',             cat:'Gloves',  slot:'Gloves'},
    // Helms
    {id:'Legendary Helm01',   name:"Executioner's Hood",      cat:'Helms',   slot:'Helm'},
    {id:'Legendary Helm02',   name:"Midnight's Veil",         cat:'Helms',   slot:'Helm'},
    {id:'Legendary Helm06',   name:'Visage of the Undying',   cat:'Helms',   slot:'Helm'},
    // Rings
    {id:'Legendary Ring01',   name:'Bastion',                 cat:'Rings',   slot:'Ring'},
    {id:'Legendary Ring02',   name:"Johann's Glory",          cat:'Rings',   slot:'Ring'},
    // Shields
    {id:'Legendary Shield01', name:'Falce di Luna',           cat:'Shields', slot:'Off Hand'},
    {id:'Legendary Shield02', name:'Spearbreaker',            cat:'Shields', slot:'Off Hand'},
    // Staves
    {id:'Legendary Staff01',  name:'Wormwood Crook',          cat:'Staves',  slot:'Main Hand'},
    {id:'Legendary Staff02',  name:'The Golden Bough',        cat:'Staves',  slot:'Main Hand'},
    {id:'Legendary Staff05',  name:'The Arvinrod',            cat:'Staves',  slot:'Main Hand'},
  ];

  // Build empty catalogue slots — keyed by BOTH id and display name for reliable lookup
  LEGENDARY_CATALOGUE.forEach(entry => {
    const slot = { def: entry, instances: [] };
    legCatalogue[entry.id]   = slot;
    legCatalogue[entry.name] = slot;   // item.legendaryName uses display name
  });

  // Proper name resolver (catalogue name IS the proper name already)
  function resolveItemDisplayName(item) {
    if (item.displayName) return item.displayName;
    if (item.legendaryName) {
      const cat = legCatalogue[item.legendaryName];
      return cat ? cat.def.name : item.legendaryName;
    }
    return item.name;
  }

  // Get item type for display using pre-computed typeDisplay (falls back to slot name)
  function getDisplayType(item) {
    if (item.typeDisplay) return item.typeDisplay;
    return item.slotDisplay || '';
  }

  // ── Rarity / UI constants ─────────────────────────────────────────────────
  // Gem socket circle colors
  const GEM_COLOR = {
    amber: '#e8a040', lapis: '#4488dd', jade: '#44aa66',
    ruby:  '#cc3344', opal:  '#e8e4d4', onyx: '#7a7d85',
  };
  function gemColor(name) {
    if (!name) return null;
    const ln = name.toLowerCase();
    for (const [k, v] of Object.entries(GEM_COLOR)) if (ln.includes(k)) return v;
    return null;
  }

  // Map internal color string → dye display name (mirrors maxparser _DYE_NAMES, must stay in sync)
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
  // Approximate CSS colors for each channel token (used in tooltip color chips)
  const DYE_TOKEN_COLORS = {
    'Achiote':'#c85c00','Cadet':'#4a7a9b','Cardinal':'#9b1c1c','Cinnibar':'#e34234',
    'Eventide':'#4b3f72','Hornet':'#c9a227','Kingfisher':'#1d7d8c','Lion':'#c8922a',
    'Monarch':'#5a189a','Myrmidon':'#1e6b4a','Nimbus':'#7ec8e3','Queen of Night':'#1a0a2e',
    'Royal':'#2d4b8e','Serengeti':'#c68b17','Syringa':'#8a5a9e','Tigress':'#c05a00',
    'Ursa Major':'#2e4a7a',
    // channel tokens → CSS
    'Black':'#1a1a1a','White':'#f0f0f0','Red':'#c0392b','Green':'#1d7a3a',
    'Blue':'#2060c8','DarkBlue':'#0d2a6e','DarkBrown':'#4a2c17','LightBlue':'#6ab4e8',
    'LightPurple':'#9b72c8','Orange':'#e07020','Yellow':'#d4b800','Purple':'#6a2ab0',
    'Tan':'#c4a46e','Brown':'#7a4a22','Silver':'#a8a8b8','Gold':'#c9a84c',
    'Brass':'#b5a020','Bronze':'#8b5e20','Copper':'#b87333','Steel':'#5a7898',
  };
  // Helper: resolve dye display name from an item (works for both stash dye items and dyed equipment)
  function resolveDyeName(item) {
    if (item.dyeName) return item.dyeName;
    if (item.dyeColor) return DYE_COLOR_NAMES[item.dyeColor] || item.dyeColor;
    return null;
  }

  const RARITY_COLOR = {
    Legendary:'#c9784c', Extraordinary:'#e07b39', Rare:'#c9a84c',
    Magic:'#4c8fc9', Common:'#aaaaaa', Inferior:'#666666', Runeword:'#5bc4a8',
  };
  const SLOT_GRID = {
    // Row 0: Amulet / Helm / Flask
    neck:{col:0,row:0},  head:{col:1,row:0},  flask:{col:2,row:0},
    // Row 1: Ring 1 / Chest / Ring 2
    finger_1:{col:0,row:1}, chest:{col:1,row:1}, finger_2:{col:2,row:1},
    // Row 2: Main Hand / Belt / Off Hand
    hand_right:{col:0,row:2}, waist:{col:1,row:2}, hand_left:{col:2,row:2},
    // Row 3: Alt Main Hand 1 / Gloves / Alt Off Hand 1
    hand_right_alt:{col:0,row:3}, hands:{col:1,row:3}, hand_left_alt:{col:2,row:3},
    // Row 4: Alt Main Hand 2 / Boots / Alt Off Hand 2
    hand_extra_alt:{col:0,row:4}, feet:{col:1,row:4}, hand_extra_off:{col:2,row:4},
  };
  const SLOT_ICON = {
    head:'🪖', chest:'🧥', hands:'🧤', waist:'🔰', feet:'👟',
    hand_right:'⚔️', hand_left:'🛡️',
    hand_right_alt:'⚔️', hand_left_alt:'🛡️',
    hand_extra_alt:'⚔️', hand_extra_off:'🛡️',
    neck:'📿', finger_1:'💍', finger_2:'💍', flask:'🧪',
  };
  const SLOT_DISPLAY = {
    hand_right:'Main Hand', hand_left:'Off Hand', chest:'Chest', feet:'Boots',
    head:'Helm', neck:'Amulet', finger_1:'Ring 1', finger_2:'Ring 2',
    hands:'Gloves', waist:'Belt', flask:'Flask',
    hand_right_alt:'Alt Main Hand 1', hand_left_alt:'Alt Off Hand 1',
    hand_extra_alt:'Alt Main Hand 2', hand_extra_off:'Alt Off Hand 2',
  };
  const CAT_ICON = {
    Amulets:'📿', Belts:'🔰', Boots:'👟', Chest:'🧥', Daggers:'🗡️',
    Flasks:'🧪', Gloves:'🧤', Helms:'🪖', Rings:'💍', Shields:'🛡️', Staves:'🪄',
  };

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

  // ── Stash grid helpers ────────────────────────────────────────────────────
  // Returns {w, h} in grid cells. Priority: (1) item.slot, (2) legendary catalogue, (3) regex.
  function itemGridSize(item) {
    const SLOT_SIZE = {
      chest:{w:2,h:3}, hands:{w:2,h:2}, feet:{w:2,h:2}, head:{w:2,h:2},
      waist:{w:2,h:1}, flask:{w:1,h:1},
      neck:{w:1,h:1}, finger_1:{w:1,h:1}, finger_2:{w:1,h:1},
      hand_right:{w:1,h:2}, hand_left:{w:2,h:2},
      hand_right_alt:{w:1,h:2}, hand_left_alt:{w:2,h:2},
      hand_extra_alt:{w:1,h:2}, hand_extra_off:{w:2,h:2},
      gloves:{w:2,h:2}, boots:{w:2,h:2},
      mainhand:{w:1,h:2}, offhand:{w:2,h:2}, twohand:{w:1,h:4},
      belt:{w:2,h:1}, rune:{w:1,h:1}, gem:{w:1,h:1}, dye:{w:1,h:1}, core:{w:1,h:1},
      ring:{w:1,h:1}, tome:{w:2,h:2},
    };
    // For offhand (shield) slot, check sub-type before falling back to generic 2×2.
    // Heater and Carapace are taller shields (2×3); all others are 2×2.
    if (item.slot === 'offhand') {
      const _shieldFull = (item.name + ' ' + (item.typeDisplay||'')).toLowerCase();
      if (/\bheater\b|\bcarapace\b/.test(_shieldFull)) return {w:2,h:3};
      return {w:2,h:2};
    }
    if (item.slot && SLOT_SIZE[item.slot]) return SLOT_SIZE[item.slot];
    // Quick exits for stackable consumables
    if (item.gemType)  return {w:1,h:1};
    if (item.dyeName)  return {w:1,h:1};

    // Legendary catalogue slot definition
    if (item.legendaryName && legCatalogue[item.legendaryName]) {
      const cs = (legCatalogue[item.legendaryName].def.slot || '').toLowerCase();
      const LEG_SLOT = {
        'chest':{w:2,h:3},'boots':{w:2,h:2},'gloves':{w:2,h:2},'helm':{w:2,h:2},
        'shield':{w:2,h:2},'off hand':{w:2,h:2},'heater':{w:2,h:3},'carapace':{w:2,h:3},
        'main hand':{w:1,h:2},'ring':{w:1,h:1},'amulet':{w:1,h:1},
        'belt':{w:2,h:1},'flask':{w:1,h:1},
      };
      if (LEG_SLOT[cs]) return LEG_SLOT[cs];
    }

    // Regex fallback — strip digits first so "Legendary Boots01" matches \bboots\b
    const full = (item.name + ' ' + (item.typeDisplay||'')).toLowerCase().replace(/\d+/g, ' ');
    if (/\bchest\b|\brobe\b|\bvest\b|\btunic\b|\bharness\b|\barmor\b/.test(full)) return {w:2,h:3};
    if (/\bstaff\b|\bbow\b|\bpolearm\b|\bpike\b/.test(full))                       return {w:1,h:4};
    if (/\bheater\b|\bcarapace\b/.test(full))                                       return {w:2,h:3};
    if (/\btome\b|\bbook\b/.test(full))                                             return {w:2,h:2};
    if (/\bgloves?\b|\bboots?\b|\bhelm\b|\bcap\b|\bhood\b|\bveil\b|\bmask\b|\bshield\b|\bbuckler\b|\btarge\b/.test(full)) return {w:2,h:2};
    if (/\bdagger\b|\bsword\b|\bmace\b|\baxe\b|\bwand\b|\bknife\b|\bbodkin\b|\bpoignard\b|\bclaw\b/.test(full)) return {w:1,h:2};
    if (/\bbelt\b|\bcord\b|\bsash\b/.test(full))                                   return {w:2,h:1};
    return {w:1,h:1};
  }

  // Inline SVG icons for grid/list toggle (14×14 display)
  // ── SVG icon helpers ──────────────────────────────────────────────────────
  // Bookmark: self-contained inline SVG with gradient (url() refs don't survive <use> cloning)
  const _BKMK_D = 'M6 6C6 5.44772 6.44772 5 7 5H17C17.5523 5 18 5.44772 18 6V18C18 18.3603 17.8062 18.6927 17.4927 18.8702C17.1792 19.0477 16.7944 19.0429 16.4855 18.8575L12 16.1662L7.5145 18.8575C7.20556 19.0429 6.82081 19.0477 6.5073 18.8702C6.19379 18.6927 6 18.3603 6 18V6Z';
  const _BKMK_SVG = (cls) =>
    '<svg viewBox="0 0 24 24" class="' + cls + '" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="bkg" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#B89269"/><stop offset="100%" stop-color="#5A4731"/>' +
      '</linearGradient></defs>' +
      '<path fill-rule="evenodd" clip-rule="evenodd" d="' + _BKMK_D + '" fill="url(#bkg)"/>' +
    '</svg>';
  const _BOOKMARK_SVG    = _BKMK_SVG('dh-bookmark-pd');
  const _BOOKMARK_SVG_ST = _BKMK_SVG('dh-bookmark-stash');
  const _BOOKMARK_SVG_SM = _BKMK_SVG('dh-bookmark-list');
  // Grid / list toggle icons — currentColor works reliably via <use>
  const SVG_GRID = '<svg width="13" height="13" fill="currentColor"><use href="#icon-grid"/></svg>';
  const SVG_LIST = '<svg width="13" height="13" fill="currentColor"><use href="#icon-list"/></svg>';

  // Recursively collect .max File objects, stopping per-group once limitCount reached
  async function collectMaxFiles(dirHandle, fileList = []) {
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === 'file' && name.endsWith('.max')) {
        fileList.push(await handle.getFile());
      } else if (handle.kind === 'directory') {
        await collectMaxFiles(handle, fileList);
      }
    }
    return fileList;
  }

  // After collection, prune per-group to limitCount using lastModified sort
  function applyFileLimit(allFiles) {
    if (!limitEnabled) return allFiles;
    // Group by character key
    const preGroups = {};
    for (const f of allFiles) {
      const k = fileGroupKey(f);
      if (!preGroups[k]) preGroups[k] = [];
      preGroups[k].push(f);
    }
    const result = [];
    for (const g of Object.values(preGroups)) {
      g.sort((a,b) => b.lastModified - a.lastModified);
      result.push(...g.slice(0, limitCount));
    }
    return result;
  }

  // Extracted so restore-on-load can call it too
  async function scanSaveFolder(dirHandle) {

    // Phase 1: collecting files — show spinner immediately
    openFolderBtn.disabled = true;

    // Remove sublabel during rescan so button is clean
    const _existingSub = openFolderBtn.querySelector('.btn-sublabel');
    if (_existingSub) _existingSub.remove();

    // Label span in button — always target by class
    const _btnLabelEl = openFolderBtn.querySelector('.btn-label');
    const setLabel = txt => {
      if (_btnLabelEl) _btnLabelEl.textContent = txt;
      else openFolderBtn.childNodes[0].textContent = txt;
    };

    // Progress bar — always shown so user sees scan progress
    let bar = document.createElement('div');
    bar.className = 'scan-progress-bar scan-progress-bar--pulse';
    openFolderBtn.appendChild(bar);

    // Spinner span injected during collection phase
    const _spinEl = document.createElement('span');
    _spinEl.className = 'btn-spinner';
    openFolderBtn.appendChild(_spinEl);
    setLabel('Collecting files');

    // Yield so the browser paints before heavy recursion
    await new Promise(r => setTimeout(r, 0));

    const allFiles = await collectMaxFiles(dirHandle);
    await _processScanFiles(allFiles, dirHandle, bar, _spinEl, setLabel);
  }

  // Firefox / fallback path: files already collected via <input webkitdirectory>
  async function scanFromFileList(fileList) {
    const allFiles = Array.from(fileList).filter(f => f.name.endsWith('.max'));

    openFolderBtn.disabled = true;
    const _existingSub = openFolderBtn.querySelector('.btn-sublabel');
    if (_existingSub) _existingSub.remove();
    const _btnLabelEl = openFolderBtn.querySelector('.btn-label');
    const setLabel = txt => {
      if (_btnLabelEl) _btnLabelEl.textContent = txt;
      else openFolderBtn.childNodes[0].textContent = txt;
    };
    let bar = document.createElement('div');
    bar.className = 'scan-progress-bar scan-progress-bar--pulse';
    openFolderBtn.appendChild(bar);
    const _spinEl = document.createElement('span');
    _spinEl.className = 'btn-spinner';
    openFolderBtn.appendChild(_spinEl);
    setLabel('Reading files…');
    await new Promise(r => setTimeout(r, 0));

    await _processScanFiles(allFiles, null, bar, _spinEl, setLabel);
    promptFolderPath();
  }

  // Shared processing phase — called after files are in hand from either path
  async function _processScanFiles(allFiles, dirHandle, bar, _spinEl, setLabel) {
    if (!allFiles.length) {
      if (bar) bar.remove();
      if (_spinEl) _spinEl.remove();
      openFolderBtn.disabled = false;
      setLabel('Scan Save Folder');
      fileListEl.innerHTML = '<li class="file-list-empty">No .max files found.</li>';
      return;
    }

    // Group by char and slice to limitCount BEFORE reading any file contents.
    const filesToScan = applyFileLimit(allFiles);

    loadedFiles = filesToScan;
    charCache   = {};
    const _lockedFiles = new Set(); // files unreadable due to game lock
    LEGENDARY_CATALOGUE.forEach(e => {
      const fresh = { def: e, instances: [] };
      legCatalogue[e.id]   = fresh;
      legCatalogue[e.name] = fresh;
    });
    _resetAchievements();

    // Phase 2: scanning legendaries with progress bar
    if (_spinEl) _spinEl.remove();
    if (bar) {
      bar.classList.remove('scan-progress-bar--pulse');
      bar.style.transition = 'none';   // prevent snap-back to width:0 (CSS base)
      bar.style.width = '2%';
      bar.getBoundingClientRect();     // force reflow — commit 2% before re-enabling transition
      bar.style.transition = '';       // restore CSS transition for smooth progress fill
    }
    const total = loadedFiles.length;
    let done = 0;
    for (const file of loadedFiles) {
      done++;
      const pct = Math.round(done / total * 100);
      setLabel(`Scanning ${done} / ${total}`);
      if (bar) bar.style.width = pct + '%';
      try {
        let data = charCache[file.name];
        if (!data) {
          data = parseMaxFile(await file.arrayBuffer());
          charCache[file.name] = data;
        }
        for (const item of [...data.equipment, ...(data.stash||[])]) {
          if (!item.legendaryName) continue;
          const slot = legCatalogue[item.legendaryName];
          if (!slot) continue;
          const src = data.equipment.includes(item) ? 'equip' : 'stash';
          const hasDbid = item.dbid && item.dbid !== '0x0';
          const charKey = hasDbid
            ? item.dbid
            : data.name + '|' + src + '|' + item.legendaryName + '|' + (item.slot ?? item.stashIndex ?? '');
          if (!slot.instances.find(i => i._key === charKey))
            slot.instances.push({ _key: charKey, charName: data.name, charLevel: data.level,
                                   charClass: data.class, fileName: file.name, item, source: src });
        }
        _aggregateAchievements(data);
      } catch(e) {
        if (e.name === 'NotReadableError') {
          _lockedFiles.add(file.name);
        }
        console.warn('[scan]', file.name, e.message);
      }
      if (done % 15 === 0) await new Promise(r => setTimeout(r, 0));
    }

    if (bar) bar.remove();
    if (_spinEl) _spinEl.remove();
    openFolderBtn.classList.remove('btn--rescan-pending');
    openFolderBtn.disabled = false;
    _activeFolderHandle = dirHandle; // null for Firefox — no persistent handle

    // Remove locked files so they don't appear as broken cards
    if (_lockedFiles.size > 0) {
      loadedFiles = loadedFiles.filter(f => !_lockedFiles.has(f.name));
    }

    renderFileList(loadedFiles);
    _finalizeAchievements();
    renderAchievementsPanel();

    // Show warning banner if any files were locked by the game
    const _existingBanner = document.getElementById('dh-locked-banner');
    if (_existingBanner) _existingBanner.remove();
    if (_lockedFiles.size > 0) {
      const _banner = document.createElement('div');
      _banner.id = 'dh-locked-banner';
      _banner.className = 'dh-locked-banner';
      _banner.innerHTML =
        '⚠ ' + _lockedFiles.size + ' save file' + (_lockedFiles.size > 1 ? 's were' : ' was') +
        ' locked by the game and skipped. Close Darkhaven and rescan to load ' +
        (_lockedFiles.size > 1 ? 'them.' : 'it.') +
        ' <button class="dh-locked-banner-close" title="Dismiss">✕</button>';
      _banner.querySelector('.dh-locked-banner-close').addEventListener('click', () => _banner.remove());
      fileListEl.parentElement.insertBefore(_banner, fileListEl);
    }
    // Update button: show char count + rescan label
    {
      const _nChars = groupFiles(loadedFiles).length;
      const _nFiles = loadedFiles.length;
      openFolderBtn.innerHTML =
        '<span class="btn-label">↺ Rescan Save Folder</span>' +
        `<div class="btn-sublabel">${_nChars} character${_nChars!==1?'s':''} · ${_nFiles} file${_nFiles!==1?'s':''} scanned</div>`;
    }

    // Update path display — prompt for path on first pick, else show stored
    setFolderPathDisplay(false);
  }  // end _processScanFiles

  // ── Firefox fallback: hidden <input webkitdirectory> ─────────────────────
  // Created once; reused on every click. Value is cleared after use so the
  // same folder can be re-selected (Chrome caches the handle via IDB instead).
  let _ffInput = null;
  if (!HAS_DIR_PICKER) {
    _ffInput = document.createElement('input');
    _ffInput.type = 'file';
    _ffInput.setAttribute('webkitdirectory', '');
    _ffInput.multiple = true;
    _ffInput.style.display = 'none';
    document.body.appendChild(_ffInput);
    _ffInput.addEventListener('change', async () => {
      const files = _ffInput.files;
      _ffInput.value = ''; // reset so same folder triggers 'change' again next time
      if (files && files.length) await scanFromFileList(files);
    });
  }

  openFolderBtn.addEventListener('click', async () => {
    // ── Firefox / no File System Access API ──────────────────────────────────
    if (!HAS_DIR_PICKER) {
      _ffInput.click();
      return;
    }

    // ── Chrome / Edge: rescan remembered handle ───────────────────────────────
    if (_activeFolderHandle) {
      try {
        // requestPermission() requires a user gesture — safe to call from click
        const perm = await _activeFolderHandle.requestPermission({ mode: 'read' });
        if (perm !== 'granted') return;
        openFolderBtn.disabled = true;
        openFolderBtn.innerHTML = '<span class="btn-label">↻ Rescanning…</span>';
        await scanSaveFolder(_activeFolderHandle);
      } catch(e) { console.error('[rescan]', e); }
      return;
    }

    // ── Chrome / Edge: first pick ─────────────────────────────────────────────
    let dirHandle;
    try {
      dirHandle = await window.showDirectoryPicker({ mode: 'read', id: 'darkhaven-saves', startIn: 'downloads' });
    } catch (err) {
      if (err.name !== 'AbortError') console.error('[folder picker]', err);
      return;
    }
    await idbSet(IDB_KEY, dirHandle);
    await scanSaveFolder(dirHandle);
    // Prompt for path confirmation on first-ever pick
    promptFolderPath();
  });



  // ── Achievement tracking state ────────────────────────────────────────────
  let achieveKills      = {};  // "blueprint|rarity" → total kills across all chars
  let achieveTattoos    = 0;   // max tattoo slots filled on any single char
  let achieveSkillMax   = 0;   // max branches fully-maxed on any single char
  let achieveDeathsMax  = 0;   // max deaths on any single char (Deathwish)
  let achieveDeathFree  = false; // any char level 20+ with 0 deaths
  let achieveHoarder    = false; // any legendary found 3+ times
  let achieveFullArsenal= false; // any char with all 3 branches assigned
  let achieveRunes      = new Set(); // all rune nums seen in tattoos across all chars
  let achieveGems       = new Set(); // all gem types seen in stash across all chars
  let achieveRuneTypes  = new Set(); // all rune types seen in stash
  let achieveHearts     = new Set(); // all heart elements seen in stash/sockets across all chars
  let achieveHeartsFound= {};        // "sourceName|Rarity" → true
  let achieveMFMax      = 0;         // highest magic find % on any single char
  let achieveUsedTomes  = new Set(); // 'vigor_1','vigor_2','might_1','might_2','agility_1','agility_2','power_1','power_2'

  function _resetAchievements() {
    achieveKills       = {};
    achieveTattoos     = 0;
    achieveSkillMax    = 0;
    achieveDeathsMax   = 0;
    achieveDeathFree   = false;
    achieveHoarder     = false;
    achieveFullArsenal = false;
    achieveRunes       = new Set();
    achieveGems        = new Set();
    achieveRuneTypes   = new Set();
    achieveHearts      = new Set();
    achieveHeartsFound = {};
    achieveMFMax       = 0;
    achieveUsedTomes   = new Set();
  }

  function _aggregateAchievements(data) {
    // Kill log
    for (const entry of data.killLog || []) {
      const key = entry.blueprint + '|' + entry.rarity;
      achieveKills[key] = (achieveKills[key] || 0) + entry.count;
    }
    // Tattoos
    const tSlots = (data.tattoos || []).filter(t => t.runeName).length;
    if (tSlots > achieveTattoos) achieveTattoos = tSlots;
    // Tattoo rune types (Ash=1, Bat=2, Ka=3, Deb=4, Elm=5)
    for (const t of data.tattoos || []) {
      if (t.runeNum) achieveRunes.add(t.runeNum);
    }
    // Deaths
    const deaths = data.deaths || 0;
    if (deaths > achieveDeathsMax) achieveDeathsMax = deaths;
    if (!achieveDeathFree && deaths === 0 && (data.level || 0) >= 20) achieveDeathFree = true;
    // Full Arsenal: all 3 skill branches assigned
    if (!achieveFullArsenal && (data.skillBranches || []).length >= 3) achieveFullArsenal = true;
    // Stash: gems + runes
    for (const item of data.stash || []) {
      if (item.gemType) achieveGems.add(item.gemType);
      if (item.runeNum) achieveRuneTypes.add(item.runeNum);
      if (item.heartElement) achieveHearts.add(item.heartElement);
    }
    // Also check equipped items for gems
    for (const item of data.equipment || []) {
      if (item.gemType) achieveGems.add(item.gemType);
      for (const sock of item.socketed || []) {
        if (sock.type === 'heart' && sock.heartElement) achieveHearts.add(sock.heartElement);
      }
    }
    // Hearts found by source × rarity (stash items + equipped hearts + socketed hearts)
    for (const item of [...(data.stash||[]), ...(data.equipment||[])]) {
      if (item.heartSourceName && item.heartRarity)
        achieveHeartsFound[item.heartSourceName+'|'+item.heartRarity] = true;
    }
    for (const item of data.equipment || []) {
      for (const sock of item.socketed || []) {
        if (sock.type === 'heart' && sock.heartSourceName && sock.heartRarity)
          achieveHeartsFound[sock.heartSourceName+'|'+sock.heartRarity] = true;
      }
    }
    // Magic Find max
    if ((data.stats?.magicFind || 0) > achieveMFMax) achieveMFMax = data.stats.magicFind || 0;
    // Attribute tomes used — intrinsic count ≥ tier means that tier was consumed
    const _si = data.stats || {};
    if ((_si.vitalityIntrinsic  ||0) >= 1) achieveUsedTomes.add('vigor_1');
    if ((_si.vitalityIntrinsic  ||0) >= 2) achieveUsedTomes.add('vigor_2');
    if ((_si.strengthIntrinsic  ||0) >= 1) achieveUsedTomes.add('might_1');
    if ((_si.strengthIntrinsic  ||0) >= 2) achieveUsedTomes.add('might_2');
    if ((_si.dexterityIntrinsic ||0) >= 1) achieveUsedTomes.add('agility_1');
    if ((_si.dexterityIntrinsic ||0) >= 2) achieveUsedTomes.add('agility_2');
    if ((_si.magicIntrinsic     ||0) >= 1) achieveUsedTomes.add('power_1');
    if ((_si.magicIntrinsic     ||0) >= 2) achieveUsedTomes.add('power_2');
    // Skills maxed
    if (typeof SKILLS_DEF !== 'undefined' && (data.skillLevels||[]).length) {
      const skByRaw = {};
      for (const sk of data.skillLevels) skByRaw[sk.skill] = sk;
      const branchSkills = {};
      for (const sl of data.skillSlots || []) {
        if (!sl.group) continue;
        if (!branchSkills[sl.group]) branchSkills[sl.group] = [];
        let maxLv = 5;
        for (const br of SKILLS_DEF) {
          const found = br.skills.find(s => s.raw === sl.skill);
          if (found) { maxLv = found.max || 5; break; }
        }
        const skd = skByRaw[sl.skill];
        branchSkills[sl.group].push({ level: skd ? skd.level : 0, maxLv });
      }
      let maxedCount = 0;
      for (const skills of Object.values(branchSkills)) {
        if (skills.length > 0 && skills.every(s => s.maxLv > 0 && s.level >= s.maxLv)) maxedCount++;
      }
      if (maxedCount > achieveSkillMax) achieveSkillMax = maxedCount;
    }
  }

  // Called after all chars loaded — hoarder needs legCatalogue which is only complete post-scan
  function _finalizeAchievements() {
    achieveHoarder = LEGENDARY_CATALOGUE.some(e => (legCatalogue[e.id]?.instances.length||0) >= 3);
  }


  function renderAchievementsPanel() {
    const existing = document.getElementById('achievements-panel');
    if (existing) existing.remove();
    const panel = document.createElement('div');
    panel.id = 'achievements-panel';
    panel.className = 'dh-leg-panel dh-last-panel';

    // ── Build state object for ACHIEVEMENT_DEFS evaluate() functions ─────────
    const beastKilled = {};
    for (const sp of BEAST_CATALOGUE)
      for (const e of sp.entries)
        beastKilled[e.bp+'|'+e.rarity] = (achieveKills[e.bp+'|'+e.rarity]||0) > 0;

    const nBp = ACHIEVEMENT_BP.narlathak, lBp = ACHIEVEMENT_BP.leviathan;
    let nKills = 0, lKills = 0;
    for (const [k,v] of Object.entries(achieveKills)) {
      if (k.startsWith(nBp)) nKills += v;
      if (k.startsWith(lBp)) lKills += v;
    }
    const legFound = LEGENDARY_CATALOGUE.filter(e => legCatalogue[e.id]?.instances.length > 0).length;

    const state = {
      beastKilled,
      beastDone:      Object.values(beastKilled).filter(Boolean).length,
      beastTotal:     BEAST_TOTAL,
      narlathakKills: nKills,
      leviathanKills: lKills,
      totalKills:     Object.values(achieveKills).reduce((s,v)=>s+v, 0),
      legFound,
      legTotal:       LEGENDARY_CATALOGUE.length,
      tattooMax:      achieveTattoos,
      runesInTattoos: achieveRunes,
      skillBranchMax: achieveSkillMax,
      fullArsenal:    achieveFullArsenal,
      deathsMax:      achieveDeathsMax,
      deathFree:      achieveDeathFree,
      hoarder:        achieveHoarder,
      gemsInStash:    achieveGems,
      heartsInStash:  achieveHearts,
      heartsFound:    achieveHeartsFound,
      heartsDone:     Object.values(achieveHeartsFound).filter(Boolean).length,
      heartTotal:     typeof HEART_TOTAL !== 'undefined' ? HEART_TOTAL : 0,
      mfMax:          achieveMFMax,
      usedTomes:      achieveUsedTomes,
    };

    // ── Evaluate all achievements ─────────────────────────────────────────────
    const catResults = ACHIEVEMENT_DEFS.map(cat => {
      const achResults = cat.achievements.map(ach => {
        const r = ach.evaluate(state);
        return { ach, earned: r.earned, progress: r.progress, progressMax: r.progressMax };
      });
      const catEarned = achResults.filter(r => r.earned).length;
      return { cat, achResults, catEarned, catTotal: cat.achievements.length };
    });
    const totalAch    = catResults.reduce((s,c) => s + c.catTotal, 0);
    const totalEarned = catResults.reduce((s,c) => s + c.catEarned, 0);

    // ── Panel header ──────────────────────────────────────────────────────────
    const _collapsed = getPanelCollapsed('achievements');
    const achHdr = document.createElement('div');
    achHdr.className = 'dh-leg-hdr';
    achHdr.style.cursor = 'pointer';
    achHdr.innerHTML =
      '<span class="dh-leg-icon">\uD83C\uDFC6</span>' +
      '<h2 class="dh-leg-hdr-title">Achievements</h2>' +
      '<span class="dh-leg-hdr-sep">\xB7</span>' +
      '<span class="dh-leg-hdr-count">' + totalEarned + '\u202F/\u202F' + totalAch +
        ' earned \xB7 across all saves</span>' +
      '<span class="dh-leg-hdr-spacer"></span>';
    const _achTgl = makePanelToggle(_collapsed);
    achHdr.appendChild(_achTgl);
    panel.appendChild(achHdr);

    const achBody = document.createElement('div');
    achBody.className = 'dh-leg-body';
    if (_collapsed) achBody.style.display = 'none';
    panel.appendChild(achBody);
    achHdr.addEventListener('click', () => {
      const nc = achBody.style.display === 'none';
      achBody.style.display = nc ? '' : 'none';
      setPanelCollapsed('achievements', !nc);
      _achTgl.classList.toggle('dh-panel-toggle--collapsed', !nc);
    });

    const container = document.createElement('div');
    container.style.cssText = 'padding:8px 12px 4px;';
    achBody.appendChild(container);

    // ── Collapsible category section ──────────────────────────────────────────
    function makeSection(catKey, label, icon, earnedCount, totalCount) {
      const lsKey = 'dh_ach_cat_' + catKey;
      let catCollapsed = localStorage.getItem(lsKey) !== '0'; // default: collapsed
      const wrap = document.createElement('div');
      wrap.style.cssText = 'margin-bottom:8px;border:1px solid rgba(255,255,255,0.07);border-radius:8px;overflow:hidden;';

      const hdr = document.createElement('div');
      hdr.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;background:rgba(255,255,255,0.03);user-select:none;';
      const allDone = earnedCount === totalCount;
      if (allDone) wrap.classList.add('dh-ach-cat--mastered');
      hdr.innerHTML =
        '<span style="font-size:.9rem;">' + icon + '</span>' +
        '<span style="font-size:.8rem;font-weight:600;color:' + (allDone?'#d4a84b':'#ccc') + ';flex:1;">' +
          (allDone?'\u2756 ':'') + esc(label) + '</span>' +
        '<span style="font-size:.72rem;color:rgba(255,255,255,0.35);">' + earnedCount + '\u202F/\u202F' + totalCount + '</span>';

      const tgl = document.createElement('span');
      tgl.style.cssText = 'font-size:.75rem;color:rgba(255,255,255,0.35);margin-left:8px;transition:transform .15s;display:inline-block;';
      tgl.textContent = '\u25BE';
      if (catCollapsed) tgl.style.transform = 'rotate(-90deg)';
      hdr.appendChild(tgl);
      wrap.appendChild(hdr);

      const body = document.createElement('div');
      body.style.cssText = 'padding:8px 10px 4px;display:' + (catCollapsed?'none':'block') + ';';
      wrap.appendChild(body);

      hdr.addEventListener('click', () => {
        catCollapsed = !catCollapsed;
        localStorage.setItem(lsKey, catCollapsed?'1':'0');
        body.style.display = catCollapsed ? 'none' : 'block';
        tgl.style.transform = catCollapsed ? 'rotate(-90deg)' : '';
      });

      return { wrap, body };
    }

    // ── Plain achievement card ────────────────────────────────────────────────
    function makeAchCard(name, desc, isEarned, progress, progressMax) {
      const card = document.createElement('div');
      card.style.cssText =
        'background:' + (isEarned?'rgba(212,168,75,0.08)':'rgba(255,255,255,0.02)') + ';' +
        'border:1px solid ' + (isEarned?'rgba(212,168,75,0.3)':'rgba(255,255,255,0.06)') + ';' +
        'border-radius:6px;padding:8px 10px;margin-bottom:6px;';
      const tr = document.createElement('div');
      tr.style.cssText = 'display:flex;align-items:baseline;gap:8px;margin-bottom:2px;';
      tr.innerHTML =
        '<span style="font-size:.82rem;font-weight:600;color:' + (isEarned?'#d4a84b':'#aaa') + ';">' +
          (isEarned?'\u2756 ':'') + esc(name) + '</span>' +
        (progressMax > 0
          ? '<span style="font-size:.7rem;color:rgba(255,255,255,0.3);margin-left:auto;white-space:nowrap;">' +
              Math.min(progress,progressMax).toLocaleString() + '\u202F/\u202F' + progressMax.toLocaleString() + '</span>'
          : '');
      card.appendChild(tr);
      const de = document.createElement('div');
      de.style.cssText = 'font-size:.72rem;color:rgba(255,255,255,0.38);' + (progressMax>0?'margin-bottom:6px;':'');
      de.textContent = desc;
      card.appendChild(de);
      if (progressMax > 0) {
        const bw = document.createElement('div');
        bw.style.cssText = 'height:2px;background:rgba(255,255,255,0.07);border-radius:1px;overflow:hidden;';
        const bf = document.createElement('div');
        const pct = Math.round(Math.min(progress,progressMax)/progressMax*100);
        bf.style.cssText = 'height:100%;width:'+pct+'%;border-radius:1px;background:'+(isEarned?'#d4a84b':'#4a7fb5')+';';
        bw.appendChild(bf);
        card.appendChild(bw);
      }
      return card;
    }

    // ── Expandable achievement card (for achievements with expandable:true) ───
    function makeExpandableCard(achId, name, desc, isEarned, progress, progressMax, makeSubFn) {
      const lsKey = 'dh_ach_expand_' + achId;
      let expanded = localStorage.getItem(lsKey) === '1'; // default: collapsed

      const card = document.createElement('div');
      card.style.cssText =
        'background:' + (isEarned?'rgba(212,168,75,0.08)':'rgba(255,255,255,0.02)') + ';' +
        'border:1px solid ' + (isEarned?'rgba(212,168,75,0.3)':'rgba(255,255,255,0.06)') + ';' +
        'border-radius:6px;margin-bottom:6px;overflow:hidden;';

      const hdr = document.createElement('div');
      hdr.style.cssText = 'padding:8px 10px;cursor:pointer;';

      const tr = document.createElement('div');
      tr.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:2px;';
      tr.innerHTML =
        '<span style="font-size:.82rem;font-weight:600;color:' + (isEarned?'#d4a84b':'#aaa') + ';flex:1;">' +
          (isEarned?'\u2756 ':'') + esc(name) + '</span>' +
        (progressMax > 0
          ? '<span style="font-size:.7rem;color:rgba(255,255,255,0.3);white-space:nowrap;">' +
              Math.min(progress,progressMax).toLocaleString() + '\u202F/\u202F' + progressMax.toLocaleString() + '</span>'
          : '');
      const tgl = document.createElement('span');
      tgl.style.cssText = 'font-size:.7rem;color:rgba(255,255,255,0.3);transition:transform .15s;display:inline-block;flex-shrink:0;';
      tgl.textContent = '\u25BE';
      if (!expanded) tgl.style.transform = 'rotate(-90deg)';
      tr.appendChild(tgl);
      hdr.appendChild(tr);

      const de = document.createElement('div');
      de.style.cssText = 'font-size:.72rem;color:rgba(255,255,255,0.38);' + (progressMax>0?'margin-bottom:6px;':'');
      de.textContent = desc;
      hdr.appendChild(de);

      if (progressMax > 0) {
        const bw = document.createElement('div');
        bw.style.cssText = 'height:2px;background:rgba(255,255,255,0.07);border-radius:1px;overflow:hidden;';
        const bf = document.createElement('div');
        const pct = Math.round(Math.min(progress,progressMax)/progressMax*100);
        bf.style.cssText = 'height:100%;width:'+pct+'%;border-radius:1px;background:'+(isEarned?'#d4a84b':'#4a7fb5')+';';
        bw.appendChild(bf);
        hdr.appendChild(bw);
      }
      card.appendChild(hdr);

      const subWrap = document.createElement('div');
      subWrap.style.cssText = 'padding:0 8px 8px;display:' + (expanded?'block':'none') + ';';
      subWrap.appendChild(makeSubFn());
      card.appendChild(subWrap);

      hdr.addEventListener('click', () => {
        expanded = !expanded;
        localStorage.setItem(lsKey, expanded?'1':'0');
        subWrap.style.display = expanded ? 'block' : 'none';
        tgl.style.transform = expanded ? '' : 'rotate(-90deg)';
      });
      return card;
    }

    // ── Beast grid (sub-content for Hunter Extraordinaire) ────────────────────
    function makeBeastGrid() {
      const g = document.createElement('div');
      g.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:4px;margin-top:8px;';
      const SHORT = {Normal:'N',Elite:'E',Champion:'C','Champion Minion':'M',Unique:'U',Boss:'B',Named:'\u2605'};
      for (const sp of BEAST_CATALOGUE) {
        const allK = sp.entries.every(e => state.beastKilled[e.bp+'|'+e.rarity]);
        const anyK = sp.entries.some(e => state.beastKilled[e.bp+'|'+e.rarity]);
        const cell = document.createElement('div');
        cell.style.cssText =
          'background:rgba(255,255,255,0.03);border:1px solid ' +
          (allK?'rgba(212,168,75,0.3)':anyK?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.05)') +
          ';border-radius:4px;padding:5px 7px;';
        const nm = document.createElement('div');
        nm.style.cssText = 'font-size:.68rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;' +
          'color:'+(allK?'#d4a84b':anyK?'#ccc':'rgba(255,255,255,0.25)')+';margin-bottom:4px;';
        nm.textContent = (allK?'\u2756 ':'')+sp.species;
        cell.appendChild(nm);
        const dots = document.createElement('div');
        dots.style.cssText = 'display:flex;gap:3px;flex-wrap:wrap;';
        for (const e of sp.entries) {
          const k = state.beastKilled[e.bp+'|'+e.rarity];
          const d = document.createElement('span');
          d.title = e.rarity + (k?' \u2713':' \u2014 not yet killed');
          d.style.cssText =
            'display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;' +
            'border-radius:3px;font-size:.58rem;font-weight:700;background:' +
            (k?(RARITY_DOT_COLOR[e.rarity]||'#888'):'rgba(255,255,255,0.06)') +
            ';color:'+(k?'#111':'rgba(255,255,255,0.2)')+';';
          d.textContent = SHORT[e.rarity]||e.rarity[0];
          dots.appendChild(d);
        }
        cell.appendChild(dots);
        g.appendChild(cell);
      }
      return g;
    }

    // ── Heart grid (sub-content for Owner of All the Hearts) ─────────────────
    function makeHeartGrid() {
      const HEART_RC = { Common:'#9ca3af', Elite:'#60a5fa', Champion:'#c084fc', Unique:'#d4a84b' };
      const SHORT_H  = { Common:'N', Elite:'E', Champion:'C', Unique:'U' };
      const g = document.createElement('div');
      g.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:4px;margin-top:8px;';
      const catalogue = (typeof HEART_CATALOGUE !== 'undefined') ? HEART_CATALOGUE : [];
      for (const entry of catalogue) {
        const allK = entry.rarities.every(r => state.heartsFound[entry.source+'|'+r]);
        const anyK = entry.rarities.some(r  => state.heartsFound[entry.source+'|'+r]);
        const cell = document.createElement('div');
        cell.style.cssText =
          'background:rgba(255,255,255,0.03);border:1px solid '+
          (allK?'rgba(212,168,75,0.3)':anyK?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.05)')+
          ';border-radius:4px;padding:5px 7px;';
        const nm = document.createElement('div');
        nm.style.cssText = 'font-size:.68rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'+
          'color:'+(allK?'#d4a84b':anyK?'#ccc':'rgba(255,255,255,0.25)')+';margin-bottom:4px;';
        nm.textContent = (allK?'\u2756 ':'')+entry.source;
        cell.appendChild(nm);
        const dots = document.createElement('div');
        dots.style.cssText = 'display:flex;gap:3px;flex-wrap:wrap;';
        for (const rar of entry.rarities) {
          const found = !!state.heartsFound[entry.source+'|'+rar];
          const d = document.createElement('span');
          d.title = rar + (found?' \u2713':' \u2014 not yet found');
          d.style.cssText =
            'display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;'+
            'border-radius:3px;font-size:.58rem;font-weight:700;background:'+
            (found?(HEART_RC[rar]||'#888'):'rgba(255,255,255,0.06)')+
            ';color:'+(found?'#111':'rgba(255,255,255,0.2)')+';';
          d.textContent = SHORT_H[rar]||rar[0];
          dots.appendChild(d);
        }
        cell.appendChild(dots);
        g.appendChild(cell);
      }
      return g;
    }

    // ── Legendary grid (sub-content for Keeper of the Legendaries) ────────────
    function makeLegGrid() {
      const slotIconMap = {
        Amulet:'📿', Belt:'🔰', Boots:'👟', Chest:'🧥', 'Main Hand':'⚔️',
        Flask:'🧪', Gloves:'🧤', Helm:'🪖', Ring:'💍', 'Off Hand':'🛡️',
      };
      const wrap = document.createElement('div');
      wrap.style.cssText = 'margin-top:8px;';
      const cats = [...new Set(LEGENDARY_CATALOGUE.map(e => e.cat))];
      for (const cat of cats) {
        const items = LEGENDARY_CATALOGUE.filter(e => e.cat === cat);
        const sec = document.createElement('div');
        sec.className = 'dh-leg-section';
        sec.innerHTML =
          '<div class="dh-leg-cat-label"><span>'+(CAT_ICON[cat]||'📦')+'</span> '+esc(cat)+'</div>'+
          '<div class="dh-leg-items-grid"></div>';
        wrap.appendChild(sec);
        const grid = sec.querySelector('.dh-leg-items-grid');
        for (const entry of items) {
          const slot  = legCatalogue[entry.id];
          const found = slot.instances.length > 0;
          const best  = found ? slot.instances[0].item : null;
          const imgFile = LEG_IMAGES[entry.id];
          const card = document.createElement('div');
          card.className = 'dh-leg-card '+(found?'dh-leg-card--found':'dh-leg-card--missing');
          card.innerHTML =
            '<div class="dh-leg-card-name">'+esc(entry.name)+'</div>'+
            '<div class="dh-leg-card-img-wrap">'+
              (imgFile
                ? '<img src="img/items/'+imgFile+'" alt="'+esc(entry.name)+'" class="dh-leg-card-img" onerror="this.style.display=\'none\'">'
                : '<span style="font-size:1.8rem;opacity:'+(found?'1':'0.3')+';">'+(slotIconMap[entry.slot]||'⚙️')+'</span>')+
            '</div>'+
            '<div class="dh-leg-card-meta">'+
              (found
                ? 'iLv '+(best.level||'?')+' \xB7 '+esc(slot.instances[0].charName)+
                  (slot.instances.length>1?'<span class="dh-leg-card-count"> \xD7'+slot.instances.length+'</span>':'')
                : 'Not found')+
            '</div>';
          if (found) {
            card.addEventListener('mouseenter', e => {
              const inst = slot.instances[0];
              const _legItem = Object.assign({}, inst.item, {
                _tipDividerClass: 'tip-divider--gold',
                _tipFooterHtml:
                  '<div class="tip-leg-footer">Found <span class="tip-leg-found">'+slot.instances.length+'\xD7</span> across your characters'+
                  (slot.instances.some(i=>i.source==='stash')?' \xA0<span class="tip-leg-stash">(some in stash)</span>':'')+
                  '</div>',
              });
              showItemTip(_legItem, e.clientX, e.clientY);
            });
            card.addEventListener('mouseleave', () => hideTip());
          }
          grid.appendChild(card);
        }
      }
      return wrap;
    }

    // ── Render all categories from ACHIEVEMENT_DEFS ───────────────────────────
    for (const { cat, achResults, catEarned, catTotal } of catResults) {
      const { wrap, body } = makeSection(cat.category, cat.label, cat.icon, catEarned, catTotal);
      for (const { ach, earned, progress, progressMax } of achResults) {
        if (ach.expandable) {
          const subFn = ach.id === 'hunter_extraordinaire'    ? makeBeastGrid
                      : ach.id === 'owner_of_all_hearts'       ? makeHeartGrid
                      : ach.id === 'keeper_of_the_legendaries' ? makeLegGrid
                      : () => document.createElement('div');
          body.appendChild(makeExpandableCard(ach.id, ach.name, ach.desc, earned, progress, progressMax, subFn));
        } else {
          body.appendChild(makeAchCard(ach.name, ach.desc, earned, progress, progressMax));
        }
      }
      container.appendChild(wrap);
    }

    const ow = document.querySelector('#equip-container .dh-outer-wrap');
    if (ow) ow.appendChild(panel);
    else document.getElementById('equip-container').appendChild(panel);
  }


  // ── Tooltip ───────────────────────────────────────────────────────────────
  let tipEl = null;
  function ensureTip() {
    if (tipEl) return tipEl;
    tipEl = document.createElement('div');
    tipEl.className = 'dh-tooltip';
    document.body.appendChild(tipEl);
    document.addEventListener('mousemove', e => {
      if (tipEl && tipEl.style.display !== 'none') posTip(e.clientX, e.clientY);
    });
    return tipEl;
  }
  function posTip(x, y) {
    const t = ensureTip();
    t.style.left = '0'; t.style.top = '0';
    const tw = t.offsetWidth, th = t.offsetHeight;
    let lx = x+16, ly = y+16;
    if (lx+tw > window.innerWidth-8)  lx = x-tw-10;
    if (ly+th > window.innerHeight-8) ly = y-th-10;
    t.style.left = lx+'px'; t.style.top = ly+'px';
  }
  function hideTip() { if (tipEl) tipEl.style.display = 'none'; }

  // Generic stat tooltip (used for attribute rows in the stats panel)
  function showStatTip(html, x, y) {
    const t = ensureTip();
    t.innerHTML = html;
    t.style.display = 'block';
    posTip(x, y);
  }
  function moveStatTip(x, y) { posTip(x, y); }
  function hideStatTip()     { hideTip(); }

  // ── Shared helper: resolve image src for a socketed item (gem/heart/rune) ──
  // Returns a URL string or null. Used in both tooltip socket rows and paperdoll dot overlays.
  const _SOCK_GEM_LEVEL = {'cracked':'01','flawed':'02','dull':'03'};
  const _SOCK_GEM_TYPES = ['amber','lapis','jade','ruby','opal','onyx'];
  function socketImgSrc(si) {
    if (!si) return null;
    if (si.type === 'rune') {
      const runeNum = RUNE_DATA.name_to_num[(si.name||'').toLowerCase()];
      return runeNum ? './img/runes/' + RUNE_DATA.img[runeNum] : null;
    }
    if (si.type === 'gem') {
      const ln = (si.name||'').toLowerCase();
      const gemType = _SOCK_GEM_TYPES.find(t => ln.includes(t));
      if (!gemType) return null;
      let lvl = '01';
      for (const [k, v] of Object.entries(_SOCK_GEM_LEVEL)) if (ln.includes(k)) { lvl = v; break; }
      return './img/gems/gem_' + gemType + '_' + lvl + '.png';
    }
    if (si.type === 'heart') {
      const rar = (si.heartRarity || si.rarity || 'common').toLowerCase();
      const el  = (si.heartElement || 'fire').toLowerCase();
      return './img/cores/core_' + rar + '_' + el + '_heart.png';
    }
    return null;
  }

  // Shared heart rarity colours — used by buildSockRow, showItemTip, and anywhere else that colours hearts
  const HEART_RARITY_COLORS_TIP = { Common:'#90ee90', Elite:'#22c55e', Champion:'#84cc16', Unique:'#c9a84c' };

  // ── Shared affix / tooltip helpers ───────────────────────────────────────
  // ELEM_COLORS and colorElements are used by buildAffixRows and anywhere else
  // that needs element-coloured text. Defined once here in outer scope.
  const ELEM_COLORS = {
    Fire:'#fa8072', Shadow:'#c084fc', Cold:'#93c5fd',
    Lightning:'#fde047', Nature:'#86efac', Burn:'#fa8072',
    Bleed:'#e07070',    // lighter red than Burn — for Bleed/Slashing status
    Slashing:'#d4b8a0', Blunt:'#c9a87c',
    Shock:'#fde047', Stun:'#c9a87c',  // Stun = Blunt color
    Freeze:'#93c5fd', Entangle:'#86efac',
    Acid:'#b5e853', Poison:'#8bc34a',
  };
  // Element keyword → inline icon (matches resistance panel)
  const ELEM_ICONS = {
    Fire:'🔥', Shadow:'🌑', Cold:'❄️', Lightning:'⚡',
    Nature:'🌿', Burn:'🔥', Shock:'⚡',
    Bleed:'🩸', Slashing:'⚔️',
    Blunt:'🔨', Stun:'🔨',   // Stun shares Blunt icon
    Freeze:'❄️', Entangle:'🌿',
  };
  // Attribute / resource keywords → light-blue color
  const ATTR_BLUE = '#93c5fd';
  const ATTR_KEYWORDS = new Set(['Mana','Strength','Dexterity','Vitality','Magic','Life','Glyph','Blood']);
  // Helper: for ALL-CAPS skill names, wrap first letter of each word in a slightly larger span
  // so "FLAME LASH" renders with F and L visually dominant (like small-caps)
  function capsSkillHtml(text, color) {
    const isAllCaps = /^[A-Z][A-Z\s]+$/.test(text.trim());
    if (!isAllCaps) return '<span style="color:' + color + ';">' + text + '</span>';
    const styled = text.replace(/\b([A-Z])([A-Z]+)/g,
      (_, first, rest) =>
        '<span style="font-size:1.08em;letter-spacing:0.03em;">' + first + '</span>' +
        '<span style="font-size:0.85em;letter-spacing:0.06em;">' + rest + '</span>');
    return '<span style="color:' + color + ';">' + styled + '</span>';
  }

  function colorElements(str) {
    // Pass 1: multi-word skill names — MUST run first so single-word passes don't split them
    const _SKILL_CASE = {
      'flame lash': 'FLAME LASH',
      'blood lash': 'Blood Lash',
      'glyph lunge': 'Glyph Lunge',
      'feast for crows': 'Feast For Crows',
      'bone spirit': 'Bone Spirit',
      'shadow walk': 'Shadow Walk',
      'spine breaker': 'Spine Breaker',
      'bone storm': 'Bone Storm',
    };
    // Protect skills with placeholders so later element regex can't recolor "Shadow" in "Shadow Walk".
    const _skillTokens = [];
    let out = str.replace(/\b(FLAME LASH|Blood Lash|Glyph Lunge|Feast For Crows|Bone Spirit|Shadow Walk|Spine Breaker|Bone Storm)\b/gi,
      (match) => {
        const _canon = _SKILL_CASE[match.toLowerCase()] || match;
        const _tok = '\u0000SK' + _skillTokens.length + '\u0000';
        _skillTokens.push(capsSkillHtml(_canon, ATTR_BLUE));
        return _tok;
      });

    // Pass 2: element/status keywords with icons (word-boundary + HTML-skip lookahead)
    out = out.replace(/\b(Fire|Shadow|Cold|Lightning|Nature|Burn|Bleed|Slashing|Blunt|Shock|Stun|Freeze|Entangle)\b(?![^<>]*>)/g,
      (match, key) => {
        const col  = ELEM_COLORS[key];
        const icon = ELEM_ICONS[key] || '';
        if (!col) return match;
        return '<span style="color:' + col + ';">' + key + '</span>' +
               (icon ? ' <span style="color:#e2e8f0;">(</span><span style="color:' + col + ';">' + icon + '</span><span style="color:#e2e8f0;">)</span>' : '');
      });

    // Pass 3: single attribute/resource/skill keywords (skip already-wrapped HTML)
    out = out.replace(/\bBlood\b(?![^<>]*>)/g,
      () => '<span style="color:' + ATTR_BLUE + ';">Blood</span>');
    out = out.replace(/\b(Mana|Strength|Dexterity|Vitality|Life|Glyph|Witch)\b(?![^<>]*>)/g,
      (match, key) => '<span style="color:' + ATTR_BLUE + ';">' + key + '</span>');
    // Magic: only standalone, not in 'Magic Find/Stat/Bonus/Steal/Resistance'
    out = out.replace(/\bMagic\b(?!\s+(?:Find|Stat|Bonus|Steal|Resistance))(?![^<>]*>)/g,
      () => '<span style="color:' + ATTR_BLUE + ';">Magic</span>');
    // Restore protected skill fragments
    out = out.replace(/\u0000SK(\d+)\u0000/g, (_, i) => _skillTokens[parseInt(i, 10)] || '');
    return out;
  }

  // Shared key map for requirement stat types → charData.stats key
  const STAT_KEY_MAP = { Magic:'magic', Strength:'strength', Dexterity:'dexterity', Vitality:'vitality' };

  /**
   * Returns true if the current character meets all requirements on this item.
   * Checks class + stat requirements derived from affixLines by buildAffixLines.
   */
  function itemReqsMet(item, data) {
    if (!data) return true;
    const { reqLines } = filterAffixLines(item.affixLines || []);
    const _cs = data.stats || {};
    const _cl = data.level || 0;
    for (const req of reqLines) {
      if (req.name === 'Class') {
        if (data.class !== String(req.value || '')) return false;
        continue;
      }
      const reqNum  = parseInt(req.value) || 0;
      const statKey = STAT_KEY_MAP[req.name];
      const charVal = statKey ? (_cs[statKey] || 0) : _cl;
      if (charVal < reqNum) return false;
    }
    return true;
  }

  /**
   * Split raw affixLines into display lines and requirement lines,
   * and strip Item Set membership lines.
   * Returns { displayLines, reqLines }.
   */
  function filterAffixLines(affixLines) {
    const reqLines = [], displayLines = [];
    for (const ln of affixLines) {
      if (ln.isRequirement)                          { reqLines.push(ln); continue; }
      if (ln.name && /\bItem Set\b/i.test(ln.name))  { continue; }
      displayLines.push(ln);
    }
    return { displayLines: sortAffixLines(displayLines), reqLines };
  }

  /**
   * Sort affix display lines into canonical order matching in-game display.
   * Bucket reference:
   *   0  — Imbue (_html or text containing 'imbued')
   *   1  — Attack Speed, Cast Speed
   *   2  — Flat Weapon Damage
   *   3  — % Weapon Damage
   *   4  — Elemental additive damage (Fire Damage %, etc.)
   *  10  — Penetration
   *  15  — All/per-element Crit Chance
   *  17  — Crit Resistance
   *  20  — Elemental status Chance (Burn/Shock/Freeze/Bleed/Curse/Stun/Entangle Chance)
   *  22  — Elemental status Duration
   *  25  — Armor, Enhanced Armor
   *  28  — Life, Mana (flat bonuses — excludes regen, steal, cost, find)
   *  32  — Core attributes: Strength, Dexterity, Vitality, Magic, Stamina
   *  36  — Regen (Mana Regen, Life Regen, Stamina Regen)
   *  40  — Resistances, Damage Reduction
   *  45  — Skill bonuses, Mana Cost reductions
   *  50  — Structural (headers, flask props)
   *  52  — Glyph chance and other generic utility chances
   *  55  — Boolean trait text lines (Water Walking, Feather Falling, Flame Lash)
   *  58  — Find stats, Life/Mana Steal, Knockback, Orb Drop
   *  62  — On-hit proc effects (chance to Stun attacker on getting hit)
   *  65  — Fallback
   *  99  — Vow of Poverty
   */
  function sortAffixLines(lines) {
    function affixOrder(ln) {
      // Imbued lines always first
      if (ln._html != null) return 0;
      if (ln.text != null && typeof ln.text === 'string' && ln.text.toLowerCase().includes('imbued')) return 0;
      // Vow of Poverty always last
      if (ln.text != null && typeof ln.text === 'string' && ln.text === 'Vow of Poverty') return 99;
      // Structural text (headers, flask props) — fixed position, preserve relative order
      if (ln._header || ln.isFlaskProp) return 50;
      // Boolean trait text lines (Water Walking, Feather Falling, Flame Lash, etc.)
      // Come after attributes/find but before on-hit procs
      if (ln.text != null) return 55;

      const n = (ln.name || '').toLowerCase();
      const v = String(ln.value || '');
      const isPct = v.endsWith('%');

      // 1 — Speed
      if (n === 'attack speed' || n === 'cast speed') return 1;
      if (n === 'movement speed') return 1;
      // 2-3 — Weapon damage
      if (n === 'weapon damage' && !isPct) return 2;
      if (n === 'weapon damage' && isPct) return 3;
      // 4 — Elemental additive damage (Fire Damage %, Cold Damage %, etc.)
      if (/\bdamage\b/.test(n) && !/weapon/.test(n)) return 4;
      // 10 — Penetration
      if (/\bpenetrat/.test(n)) return 10;
      // 15 — Crit Chance (all types and per-element)
      if (/\bcrit(ical)?\s+(chance|chances)\b/.test(n) || /\ball\s+crit/.test(n)) return 15;
      // 17 — Crit Resistance
      if (/\bcrit(ical)?\s+resist/.test(n)) return 17;
      // 20 — Elemental status Chance (Burn/Shock/Freeze/Bleed/Curse/Stun/Entangle + "Chance")
      //      Exclude on-hit procs (contain "attacker" or "on getting hit")
      if (/\b(burn|shock|freeze|bleed|curse|stun|entangle|acid|poison)\b/.test(n) &&
          /\bchance\b/.test(n) && !/attacker/.test(n) && !/on getting hit/.test(n)) return 20;
      // 22 — Elemental status Duration
      if (/\b(burn|shock|freeze|bleed|curse|stun|entangle|acid|poison)\b/.test(n) &&
          /\bduration\b/.test(n)) return 22;
      // 25 — Armor (flat and %)
      if (/\barmor\b/.test(n)) return 25;
      // +Attack
      if (/\battack\b/.test(n)) return 9;
      // 34 — Life / Mana flat bonuses (exclude regen, steal, cost, find variants)
      if (/\b(life|mana)\b/.test(n) && !/regen/.test(n) && !/steal/.test(n) && !/cost/.test(n) && !/find/.test(n)) return 34;
      // 32 — Core attributes (Strength, Dexterity, Vitality, Stamina)
      //if (/\b(strength|dexterity|vitality|stamina)\b/.test(n)) return 32;
      if (/\b(strength)\b/.test(n)) return 30;
      if (/\b(dexterity)\b/.test(n)) return 31;
      if (/\b(vitality)\b/.test(n)) return 32;
      if (/\b(stamina)\b/.test(n)) return 33;  
      // 34 — Magic attribute — must exclude "magic find" and "magic steal" compound names
      if (/\bmagic\b/.test(n) && !/find/.test(n) && !/steal/.test(n)) return 34;
      // 36 — Regen stats
      if (/\bregen\b/.test(n)) return 36;
      // 40 — Resistance / Damage Reduction
      if (/\bresist/.test(n) || /\bdamage reduction\b/.test(n)) return 40;
      // Skill bonuses that don't include the word "skill" (e.g. "Shadow Walk",
      // "Blood Lash") need explicit ordering.
      if (n === 'shadow walk') return 45;
      if (n === 'blood lash') return 45;
      if (n === 'blood lash range') return 46;
      if (n === 'blood lash critical duration') return 47;
      // dash/stealth utility (before 58 find/steal/knockback)
      if (/\bstealth\b/.test(n)) return 49;
      if (/\bdash distance\b/.test(n) || /\bmovement\b/.test(n) && /\bdistance\b/.test(n)) return 50;
      // 52 — Glyph chance and other generic utility chances
      //      Elemental chances already caught at 20; on-hit procs caught at 62
      if (/\bchance\b/.test(n) && !/attacker/.test(n) && !/on getting hit/.test(n)) return 52;
      // 58 — Find stats, Life/Mana Steal, Knockback, Orb Drop
      if (/\bfind\b/.test(n) || /\bstealing\b/.test(n) || /\bknockback\b/.test(n) || /\borb drop\b/.test(n)) return 58;
      // 59 — Skill bonuses and Mana Cost reductions  
      if (/\ball skills\b/.test(n) || /\bskills?\b/.test(n) || /\bmana cost\b/.test(n)) return 59;
      // 62 — On-hit proc effects
      if (/chance to.*attacker/.test(n) || /on getting hit/.test(n)) return 62;
      // 65 — Fallback
      return 65;
    }
    // Stable sort: preserve original insertion order within same bucket
    return lines
      .map((ln, i) => ({ ln, i, ord: affixOrder(ln) }))
      .sort((a, b) => a.ord - b.ord || a.i - b.i)
      .map(x => x.ln);
  }

  /**
   * Build the affix section HTML (divider + all affix rows).
   * @param {Array}  displayLines   — pre-filtered display lines from filterAffixLines()
   * @param {string} [dividerClass] — extra CSS class on the divider (e.g. 'tip-divider--gold')
   * @returns {string} HTML or '' if no lines
   */
  function buildAffixRows(displayLines, dividerClass) {
    if (!displayLines.length) return '';

    // ── Merge same-name affix lines (inherent + socketed → one line) ─────────
    // Exception: Attack Speed on daggers stays separate (inherent vs socketed are
    // shown individually). On staves they combine.
    // Rule: merge lines sharing the same normalised name, accumulating numeric values.
    // "Normalised name" strips 'Equipment ' prefix and ' Bonus' suffix for matching.
    // Non-numeric lines (text, _html, _header, flask, req) are never merged.
    const _isDaggerCtx = (typeof _currentItem !== 'undefined') &&
      /(dagger|knife|bodkin|poignard|stabber|claw|shiver|grimalkin|flickerfang|emberthorn|sorcere|duskshear)/i
        .test((_currentItem && _currentItem.name) || '');
    // Build display context name from the first non-socketed weapon-damage line or item name
    // (We don't have direct access to item here — use a closure var set just before call)

    function _normName(n) {
      return (n || '').replace(/^Equipment\s+/i,'').replace(/\s+Bonus$/i,'').trim().toLowerCase();
    }
    const _merged = [];
    for (const ln of displayLines) {
      // Never merge structural/text lines
      if (ln._header || ln.isFlaskProp || ln.text != null || ln._html != null || ln.isRequirement) {
        _merged.push(ln); continue;
      }
      
      const _rawStr = String(ln.value ?? '');
      const _isPct  = _rawStr.includes('%');   // <- look at the original value
      const _isRate = _rawStr.includes('/s');  // <- look at the original value
      const _valStr = _rawStr.replace('%','').replace('/s','');
      const _numVal = parseFloat(_valStr);
      if (isNaN(_numVal)) { _merged.push(ln); continue; }

      const _nname = _normName(ln.name);

      // Dagger attack speed exception: inherent (non-socketed) and socketed stay separate
      const _isAtkSpd = _nname === 'attack speed';
      if (_isAtkSpd && _isDaggerCtx) { _merged.push(ln); continue; }

      // Find existing mergeable line with same normalised name
      const _existIdx = _merged.findIndex(x => {
        if (x._header || x.isFlaskProp || x.text != null || x._html != null || x.isRequirement) return false;
        // Dagger atk speed: never merge regardless of socketed flag (already handled above)
        if (_isAtkSpd && _isDaggerCtx) return false;
        if (_normName(x.name) !== _nname) return false;
        
        const _xRaw  = String(x.value ?? '');
        const _xPct   = _xRaw.includes('%');
        const _xRate  = _xRaw.includes('/s');
        const _xStr  = _xRaw.replace('%','').replace('/s','');
        const _xVal   = parseFloat(_xStr);
        if (isNaN(_xVal)) return false;
        return _xPct === _isPct && _xRate === _isRate; // flat+flat, pct+pct, rate+rate
      });

      if (_existIdx >= 0) {
        const _exStr   = String(_merged[_existIdx].value ?? '');
        const _exVal   = parseFloat(_exStr.replace('%','').replace('/s',''));
        const _hasPct  = _exStr.includes('%');
        const _hasRate = _exStr.includes('/s');
        if (!isNaN(_exVal)) {
          const _sum = Math.round((_exVal + _numVal) * 100) / 100;
          // Keep the non-socketed entry's metadata (name, bullet style) — prefer inherent
          const _base = _merged[_existIdx].socketed && !ln.socketed ? ln : _merged[_existIdx];
          _merged[_existIdx] = {
            ..._base,
            value: _sum + (_hasPct ? '%' : _hasRate ? '/s' : ''),
            // If merged from different sources, mark as non-socketed so bullet is white
            socketed: _merged[_existIdx].socketed && ln.socketed,
          };
          continue;
        }
      }
      _merged.push(ln);
    }
    let h = '<div class="tip-divider' + (dividerClass ? ' ' + dividerClass : '') + '"></div>';
    // Stats that display as bare percentages without a leading '+' (multiplicative modifiers)
    const _NO_PLUS_STATS = new Set(['Enhanced Armor']);
    for (const ln of _merged) {
      if (ln._header) {
        h += '<div class="tip-affix-header" style="color:' + (ln.color || 'rgba(255,255,255,0.35)') + ';">' + esc(String(ln.text)) + '</div>';
        continue;
      }
      const isSockLine = ln.socketed;

      // ── Bullet character + CSS class ──────────────────────────────────
      // Characters and base colors are defined in CSS (::before content).
      // Inline bulletStyle is used only for dynamic colors (gem, heart rarity).
      let bulletClass, bulletStyle = '';
      if (isSockLine) {
        if (ln.sockType === 'gem') {
          const _gc   = gemColor(ln.gemName || ln.name || '');
          bulletClass = 'tip-bullet tip-bullet--gem';
          bulletStyle = _gc ? 'color:' + _gc + ';' : '';
        } else if (ln.sockType === 'heart') {
          const _hc   = HEART_RARITY_COLORS_TIP[ln.heartRarity || 'Common'] || '#f87171';
          bulletClass = 'tip-bullet tip-bullet--heart';
          bulletStyle = 'color:' + _hc + ';';
        } else {
          bulletClass = 'tip-bullet tip-bullet--rune';
        }
      } else {
        bulletClass = 'tip-bullet tip-bullet--regular';
      }

      // ── Line text HTML ──
      let lineHtml;
      if (ln._html != null) {
        // Pre-rendered HTML (e.g. imbue line) — bypass colorElements to avoid double icons
        lineHtml = '<span class="tip-affix-line">' + ln._html + '</span>';
      } else if (ln.text != null) {
        lineHtml = '<span class="tip-affix-line" style="color:' + (ln.color || '#e2e8f0') + ';">' + colorElements(esc(String(ln.text))) + '</span>';
      } else if (ln.isFlaskProp) {
        lineHtml = '<span class="tip-affix-line tip-affix-flask">' + esc(ln.name) + '</span>';
      } else if (isSockLine) {
        // Text stays white — only the bullet is coloured. Element keywords in value/name still get coloured.
        const _sv = String(ln.value ?? '');
        const _svPfx = (_NO_PLUS_STATS.has(ln.name || '') || _sv.startsWith('+') || _sv.startsWith('-') || _sv.startsWith('0')) ? '' : '+';
        lineHtml = '<span class="tip-affix-line">' +
          '<span class="tip-affix-val" style="color:#E8C342;">' + colorElements(esc(_svPfx + _sv)) + '</span>' +
          '<span class="tip-affix-name">' + colorElements(esc(ln.name ? ' ' + ln.name : '')) + '</span>' +
          '</span>';
      } else {
        const _rv = String(ln.value ?? '');
        const _rPfx = (_NO_PLUS_STATS.has(ln.name || '') || _rv.startsWith('+') || _rv.startsWith('-')) ? '' : '+';
        lineHtml = '<span class="tip-affix-line">' +
          '<span class="tip-affix-val" style="color:#E8C342;">' + colorElements(esc(_rPfx + _rv)) + '</span>' +
          '<span class="tip-affix-name">' + colorElements(esc(ln.name ? ' ' + ln.name : '')) + '</span>' +
          '</span>';
      }

      h += '<div class="tip-affix-row">' +
           '<span class="' + bulletClass + '"' + (bulletStyle ? ' style="' + bulletStyle + '"' : '') + '></span>' +
           lineHtml +
           '</div>';
    }
    return h;
  }

  /**
   * Build the requirements block HTML.
   * @param {Array}  reqLines  — requirement lines from filterAffixLines()
   * @param {object} [item]    — item object (for heartIsUniqueSocket, tome fields)
   * @returns {string} HTML or ''
   */
  function buildReqBlock(reqLines, item) {
    const _isTome = item && item.slot === 'tome';
    const _TOME_ATTR_PROTO = {
      'cf5c6725d0622e94a8d9869526914357': 'Vitality',
      'fe2f09265d25eb5488ecd81b076fcf63': 'Strength',
      'a3f14410163b5bc42b72e51ad9a4bc8e': 'Dexterity',
      'cf6a5e41fac71de48b7fc87aa12ab252': 'Magic',
    };
    let _tomeAttr = item && item.tomeReqAttrProto ? (_TOME_ATTR_PROTO[item.tomeReqAttrProto] || null) : null;
    // Fallback: some saves use different GUIDs for the same attribute requirement.
    if (!_tomeAttr && item && item.tomeReqAttrProto) {
      const raw = (DH_GUIDS[item.tomeReqAttrProto] || '');
      if (/magic/i.test(raw)) _tomeAttr = 'Magic';
      else if (/vitality/i.test(raw)) _tomeAttr = 'Vitality';
      else if (/strength/i.test(raw)) _tomeAttr = 'Strength';
      else if (/dexterity/i.test(raw)) _tomeAttr = 'Dexterity';
    }
    const hasAny = reqLines.length > 0 || (item && item.heartIsUniqueSocket) || _isTome || (item && item.tomeReqValue);
    if (!hasAny) return '';

    const _cStats = _currentCharData?.stats || {};
    const _cLevel = _currentCharData?.level || 0;
    let h = '<div class="tip-req-block"><div class="tip-req-label">Requires:</div>';
    for (const req of reqLines) {
      // Class requirement: name='Class', value='Witch'
      if (req.name === 'Class') {
        const _reqClass = String(req.value || '');
        const _charClass = _currentCharData?.class || '';
        const _classMet = !_reqClass || _charClass === _reqClass;
        h += '<div class="tip-req-row"><span style="color:' + (_classMet ? '#eee' : '#ef4444') + ';">' + esc(_reqClass) + '</span></div>';
        continue;
      }
      const valStr   = String(req.value || '');
      const _qMatch  = valStr.match(/^(\d+)\s*\((.+?)\)$/);
      // req.name is the attribute type (e.g. 'Magic', 'Level', 'Strength') emitted by the parser.
      // Fall back to parsing the value string for legacy "(N Type)" format.
      let reqType = req.name || 'Level', reqNum = parseInt(valStr) || 0;
      if (_qMatch) { reqNum = parseInt(_qMatch[1]); reqType = _qMatch[2]; }
      const _statKey = STAT_KEY_MAP[reqType];
      const _charVal = _statKey ? (_cStats[_statKey] || 0) : _cLevel;
      const isMet    = _charVal >= reqNum;
      h += '<div class="tip-req-row"><span style="color:' + (isMet ? '#eee' : '#ef4444') + ';">' + esc(reqType) + ' ' + reqNum + '</span></div>';
    }
    if (item && item.heartIsUniqueSocket)
      h += '<div class="tip-req-row"><span style="color:#d4a847;">Unique Socket</span></div>';
    // Attribute requirement from STAT_REQ_BASE — applies to equipment AND tomes
    if (_tomeAttr && item.tomeReqValue) {
      const _charAttrVal = _cStats[STAT_KEY_MAP[_tomeAttr] || ''] || 0;
      const _reqMet = _charAttrVal >= item.tomeReqValue;
      h += '<div class="tip-req-row"><span style="color:' + (_reqMet ? '#eee' : '#ef4444') + ';">' + esc(_tomeAttr) + ' ' + item.tomeReqValue + '</span></div>';
    }
    // "Usable once" notice only applies to tomes
    if (_isTome)
      h += '<div class="tip-req-row"><span style="color:#ef4444;">Usable once per character</span></div>';
    h += '</div>';
    return h;
  }

  // Tooltip for equipment cards (paperdoll)
  function showItemTip(item, x, y) {
    const t = ensureTip();
    const isLeg = !!item.legendaryName;
    const rc = RARITY_COLOR[item.rarity] || '#aaa';
    const dn = resolveItemDisplayName(item);

    // ── Resolve top-right image src ────────────────────────────────────
    let _tipImgSrc = null;
    const _isJewelrySlot = ['neck','finger_1','finger_2','flask','ring'].includes(item.slot);
    if (item.runeNum && RUNE_DATA.img[item.runeNum])
      _tipImgSrc = './img/runes/' + RUNE_DATA.img[item.runeNum];
    else if (isLeg && LEG_IMAGES[item.legendaryName])
      _tipImgSrc = 'img/items/' + LEG_IMAGES[item.legendaryName];
    else if (item.gemType && item.gemLevel != null)
      _tipImgSrc = './img/gems/gem_' + item.gemType + '_0' + item.gemLevel + '.png';
    else if (item.dyeName)
      _tipImgSrc = './img/dyes/' + item.dyeName.toLowerCase().replace(/\s+/g, '_') + '_dye.png';
    else if (item.heartName) {
      const _hRarSlug = (item.heartRarity || 'common').toLowerCase();
      const _hElSlug  = (item.heartElement || 'fire').toLowerCase();
      _tipImgSrc = './img/cores/core_' + _hRarSlug + '_' + _hElSlug + '_heart.png';
    }
    else _tipImgSrc = nonLegImgPath(item) || null;

    // Image size tier: rune/gem = sm(36px), jewelry/heart/dye = md(48px), others = lg(88px)
    const _tipImgClass = (item.runeNum || (item.gemType != null))
      ? 'tip-img--sm'
      : (_isJewelrySlot || item.heartName || item.dyeName)
      ? 'tip-img--md'
      : 'tip-img--lg';

    // ── Header: name + subtitle rarity/type/level ──────────────────────
    const _tipSC = Math.max(item.socketCount || 0, (item.socketed||[]).length);
    const _tipHasUniq = (item.socketSlots||[]).some(s => s === 'unique');
    const _tipBadgeCol = _tipHasUniq ? '#d4a847' : '#d1d5db';
    const _tipSockBadge = _tipSC > 0
      ? ' <span class="tip-sock-badge' + (_tipHasUniq ? ' tip-sock-badge--gold' : '') + '">' +
        _tipSC + '</span>'
      : '';
    const _heartTipColor = item.heartName ? (HEART_RARITY_COLORS_TIP[item.heartRarity] || '#90ee90') : null;
    const _nameColor = _heartTipColor || (isLeg ? '#c9a84c'
      : item.rarity === 'Rare'   ? '#fde047'
      : item.rarity === 'Magic'  ? '#93c5fd'
      : '#eeeeee');
    // Subtitle rarity color: hearts use their heart rarity color
    const _subtitleColor = _heartTipColor || rc;
    let _headerHtml =
      '<div class="tip-name" style="color:' + _nameColor + ';">' +
      esc(dn) +
      ((item.quantity && item.quantity > 1) ? ' <span class="tip-qty">x' + item.quantity + '</span>' : '') +
      _tipSockBadge + '</div>';
    const subtitleParts = [];
    if (item.rarity) subtitleParts.push(esc(item.rarity));
    const _dispType = getDisplayType(item);
    if (_dispType) subtitleParts.push(esc(_dispType));
    if (item.level) subtitleParts.push('iLv ' + item.level);
    _headerHtml += '<div class="tip-subtitle" style="color:' + _subtitleColor + ';">' + subtitleParts.join(' · ') + '</div>';

    // ── Dye info directly under subtitle — no dividers ────────────────
    if (item.dyeColor) {
      const _dyeDisplayName = resolveDyeName(item);
      const _dyeTokens = (item.dyeColors || item.dyeColor.split(/(?=[A-Z])/).map(s=>s.trim()).filter(Boolean));
      const _chips = _dyeTokens.map(tok => {
        const css = DYE_TOKEN_COLORS[tok] || '#888';
        return '<span class="tip-dye-chip" style="background:' + css + ';" title="' + esc(tok) + '"></span>';
      }).join('');
      const _isDyeItem = !!item.dyeName;
      _headerHtml +=
        '<div class="tip-dye-row">' +
        '<span class="tip-dye-icon">🎨</span>' +
        (!_isDyeItem ? '<span class="tip-dye-name">' + esc(_dyeDisplayName) + '</span>' : '') +
        '<span class="tip-dye-chips">' + _chips + '</span>' +
        '</div>';
    }

    // ── Primary stat: armor / damage ────────────────────────────────────────────
    if (item.damageMin != null) {
      const ELEM_COLORS_TIP = { Fire:'#f87171', Shadow:'#c084fc', Cold:'#93c5fd', Lightning:'#fde047', Nature:'#86efac', Slashing:'#d4b8a0', Blunt:'#c9a87c' };
      const ELEM_ICONS_TIP  = { Fire:'🔥', Shadow:'🌑', Cold:'❄️', Lightning:'⚡', Nature:'🌿', Slashing:'⚔️', Blunt:'🔨' };

      // ── Base attack speeds (attacks/second) ────────────────────────────────
      // Sourced from items.js BASE_ITEMS[].baseSpeed where available; fallback table here.
      const WEAPON_BASE_SPEEDS = {
        // User-confirmed Attacks/s values. Attack speed affixes do NOT modify these.
        // Legendaries use their base weapon type speed.
        // 'the golden bough':1.159,
        // Common types
        'sword':1.3, 'axe':1.1, 'mace':0.9, 'tyrant':0.9, 
        'wand':1.3, 'crystal shard':1.111111111,
        // Staves (longest key matched first by sort)
        'staff':1.111111111,
        // pickaxes
        'pick axe':0.77,
      };
      // Look up base speed: longest matching key wins (more specific before generic)
      const _dispName = resolveItemDisplayName(item);    
      const _nameKey = (item.name || '').toLowerCase();

      // 1. BASE_ITEMS override by display name (includes The Golden Bough baseSpeed: 1.159)
      let _baseSpd = null;
      if (window.BASE_ITEMS) {
        const _bi = window.BASE_ITEMS.find(
          _b => _b.name === _dispName && typeof _b.baseSpeed === 'number'
        );
        if (_bi) _baseSpd = _bi.baseSpeed;
      }

      // 2. Parser baseSpeed (material type, e.g. Bramble Staff → 1.03)
      if (_baseSpd === null) {
        _baseSpd = (typeof item.baseSpeed === 'number') ? item.baseSpeed : null;
      }

      // 3. WEAPON_BASE_SPEEDS fallback (name-based, longest key first)
      if (_baseSpd === null) {
        const _wbsKeys = Object.keys(WEAPON_BASE_SPEEDS).sort((_a, _b) => _b.length - _a.length);
        for (const _k of _wbsKeys) {
          if (_nameKey === _k || _nameKey.includes(_k)) {
            _baseSpd = WEAPON_BASE_SPEEDS[_k];
            break;
          }
        }
      }

      // 4. Slot fallback
      if (_baseSpd === null) {
        const _slt = (item.slot || '').toLowerCase();
        if (/twohand/.test(_slt))               _baseSpd = 1.11;
        else if (/hand_right|mainhand/.test(_slt)) _baseSpd = 1.2;
      }

      /*
      // First try items.js baseSpeed if present on item (populated by parser from BASE_ITEMS)
      let _baseSpd = (typeof item.baseSpeed === 'number') ? item.baseSpeed : null;
      if (_baseSpd === null) {
        // Sort keys longest-first so 'crystal shard staff' beats 'crystal shard' and 'staff'
        const _keys = Object.keys(WEAPON_BASE_SPEEDS).sort((a,b) => b.length - a.length);
        for (const k of _keys) {
          if (_nameKey === k || _nameKey.includes(k)) { _baseSpd = WEAPON_BASE_SPEEDS[k]; break; }
        }
      }
      // Slot fallback
      if (_baseSpd === null) {
        const _slt = (item.slot || '').toLowerCase();
        if (/twohand/.test(_slt))              _baseSpd = 1.11;
        else if (/hand_right|mainhand/.test(_slt)) _baseSpd = 1.2;
      }
      */
      // ── Primary damage: (base + flat) * (1 + pct%) ───────────────────────
      let _dmgFlat = 0, _dmgPct = 0;
      for (const _al of (item.affixLines || [])) {
        if (!_al.name || _al.isRequirement || _al._html != null) continue;
        const _alName = (_al.name || '').toLowerCase();
        const _alVal  = parseFloat(String(_al.value || '').replace('%','')) || 0;
        if (_alName === 'weapon damage') {
          if (String(_al.value||'').includes('%')) _dmgPct += _alVal;
          else _dmgFlat += _alVal;
        }
      }
      const _calcMinExact = (item.damageMin + _dmgFlat) * (1 + _dmgPct / 100);
      const _calcMaxExact = (item.damageMax + _dmgFlat) * (1 + _dmgPct / 100);
      // Round half-up (standard game rounding) using Math.round for reliable integer results
      const _calcMin = Math.round(_calcMinExact);
      const _calcMax = Math.round(_calcMaxExact);
      const _dmgElem = item.damageType;
      const _dmgCol  = (_dmgElem && ELEM_COLORS_TIP[_dmgElem]) ? ELEM_COLORS_TIP[_dmgElem] : '#f8d08a';
      const _dmgIcon = (_dmgElem && ELEM_ICONS_TIP[_dmgElem])  ? ELEM_ICONS_TIP[_dmgElem]  : '';


      // ── Secondary elemental damage lines ─────────────────────────────────
      const ELEM_NAMES = new Set(['Fire Damage','Cold Damage','Lightning Damage','Shadow Damage','Nature Damage','Slashing Damage','Blunt Damage']);
      const _elemDmgLines = [];
      for (const ln of (item.affixLines || [])) {
        if (!ln.name || !ELEM_NAMES.has(ln.name)) continue;
        const _pct = parseFloat(String(ln.value || '').replace('%',''));
        if (isNaN(_pct) || _pct <= 0) continue;
        const _elem = ln.name.replace(' Damage','');
        const _eMinExact = item.damageMin * _pct / 100;
        const _eMaxExact = item.damageMax * _pct / 100;
        _elemDmgLines.push({
          elem: _elem,
          minExact: _eMinExact,
          maxExact: _eMaxExact,
          min: Math.round(_eMinExact),
          max: Math.round(_eMaxExact),
        });
      }

// ── Attack speed: base + affix bonuses ───────────────────────────────
// Daggers: only SOCKETED attack speed affects effective speed.
// Staves/others: all attack speed (inherent + socketed) affects effective speed.

const _isDagger = /(dagger|knife|bodkin|poignard|stabber|claw|shiver|grimalkin|flickerfang|emberthorn|sorcere|duskshear)/i
  .test(item.name || '');

const _isStaff = item.slot === 'twohand' || /staff|pike/i.test(item.name);

// Staves: gate — true only if at least one socketed line contributes attack speed
const _staffHasSocketAtkSpd = _isStaff && item.affixLines.some(_al =>
  _al.name && _al.socketed && _al.name.toLowerCase() === 'attack speed'
);

let _atkSpdTotalEff = 0;
for (const _al of item.affixLines) {
  if (!_al.name || _al.isRequirement || _al._html != null) continue;
  if (_al.name.toLowerCase() !== 'attack speed') continue;
  const _av = parseFloat(String(_al.value).replace(',', '.')) || 0;
  if (_isDagger) {
    // Daggers: ONLY socketed attack speed counts, always
    if (_al.socketed) _atkSpdTotalEff += _av;
  } else if (_isStaff) {
  if (_av < 0 && !_al.socketed) {
    // Negative inherent penalty (e.g. Golden Bough): always subtract
    _atkSpdTotalEff += _av;
  } else if (_staffHasSocketAtkSpd) {
    // Positive inherent + socketed: only if a socket with attack speed is present
    _atkSpdTotalEff += _av;
  }
  } else {
    // Everything else: all attack speed counts
    _atkSpdTotalEff += _av;
  }
}

// _baseSpd is already computed above from item.baseSpeed / WEAPON_BASE_SPEEDS.
const _effSpd = (_baseSpd !== null)
  ? _baseSpd * (1 + _atkSpdTotalEff / 100)
  : null;
const _effSpdDisp = _effSpd !== null ? parseFloat(_effSpd.toFixed(1)) : null;

// ── DPS: average across all damage types × effective attack speed ─────
// Use rounded min/max (primary + elemental), not the exact decimals.
const _primaryAvg = (_calcMin + _calcMax) / 2;

let _elemAvg = 0;
for (const e of _elemDmgLines) {
  _elemAvg += (e.min + e.max) / 2;
}

const _dpsAvgTotal = _primaryAvg + _elemAvg;

// Final DPS rounded to 1 decimal internally, shown with 0/1 decimals in UI
const _dps = (_effSpd !== null)
  ? Math.round(_dpsAvgTotal * _effSpd * 10) / 10
  : null;

      // ── Render ────────────────────────────────────────────────────────────
      if (_dps !== null) {
        // DPS header row — sword icon white, value dark orange (#d4820a), larger font
        _headerHtml +=
          '<div class="tip-dmg-row tip-dps-row">' +
          '<span class="tip-dmg-icon" style="color:#ffffff;">\u2694</span>' +
          '<span class="tip-dmg-val tip-dps-val">' +
          '<span style="color:#d4820a;">' + (_dps % 1 === 0 ? _dps.toFixed(0) : _dps.toFixed(1)) + '</span>' +
          ' <span style="color:#d4820a;">Damage/s</span>' +
          '</span></div>';

        // Helper: build one sub-line (└ + range + element + Damage)
        function _subRow(rangeHtml, elemHtml) {
          return '<div class="tip-dmg-row tip-dmg-subrow">' +
            '<span class="tip-dmg-indent" style="color:#ffffff;">\u2514</span>' +
            '<span class="tip-dmg-subval">' + rangeHtml + elemHtml +
            ' <span style="color:#e2e8f0;">Damage</span></span>' +
            '</div>';
        }

        // Primary damage sub-line
        const _pRange = '<span style="color:' + (_dmgElem ? _dmgCol : '#93c5fd') + ';">' + _calcMin + '\u2013' + _calcMax + '</span>';
        const _pElem  = _dmgElem
          ? ' <span style="color:' + _dmgCol + ';">' + esc(_dmgElem) + '</span>' +
            (_dmgIcon ? ' <span style="color:#e2e8f0;">(</span><span style="color:' + _dmgCol + ';">' + _dmgIcon + '</span><span style="color:#e2e8f0;">)</span>' : '')
          : '';
        _headerHtml += _subRow(_pRange, _pElem);

        // Elemental bonus damage sub-lines
        for (const e of _elemDmgLines) {
          const _ec = ELEM_COLORS_TIP[e.elem] || '#f8d08a';
          const _ei = ELEM_ICONS_TIP[e.elem]  || '';
          const _eRange = '<span style="color:' + _ec + ';">' + e.min + '\u2013' + e.max + '</span>';
          const _eElem  = ' <span style="color:' + _ec + ';">' + esc(e.elem) + '</span>' +
            (_ei ? ' <span style="color:#e2e8f0;">(</span><span style="color:' + _ec + ';">' + _ei + '</span><span style="color:#e2e8f0;">)</span>' : '');
          _headerHtml += _subRow(_eRange, _eElem);
        }

        // Attacks/s sub-line: yellow number, white label
        _headerHtml +=
          '<div class="tip-dmg-row tip-dmg-subrow">' +
          '<span class="tip-dmg-indent" style="color:#ffffff;">\u2514</span>' +
          '<span class="tip-dmg-subval">' +
          '<span style="color:#E8C342;">' + _effSpdDisp.toFixed(1) + '</span>' +
          ' <span style="color:#e2e8f0;">Attacks/s</span>' +
          '</span></div>';

      } else {
        // No speed data — single damage row (no DPS)
        _headerHtml +=
          '<div class="tip-dmg-row">' +
          '<span class="tip-dmg-icon" style="color:#ffffff;">\u2694</span>' +
          '<span class="tip-dmg-val tip-dps-val">' +
          '<span style="color:' + (_dmgElem ? _dmgCol : '#93c5fd') + ';">' + _calcMin + '\u2013' + _calcMax + '</span>' +
          (_dmgElem
            ? ' <span style="color:' + _dmgCol + ';">' + esc(_dmgElem) + '</span>' +
              (_dmgIcon ? ' <span style="color:#e2e8f0;">(</span><span style="color:' + _dmgCol + ';">' + _dmgIcon + '</span><span style="color:#e2e8f0;">)</span>' : '')
            : '') +
          ' <span style="color:#e2e8f0;">Damage</span>' +
          '</span></div>';
      }
    }
    if (item.armor) {
      // Derive total armor from affixLines — include socketed armor bonuses in total.
      // Enhanced Armor (%) applies only to base+flat affix armor, not to socketed flat.
      let _armorFlat = 0, _armorPct = 0, _armorSockFlat = 0;
      for (const _al of (item.affixLines || [])) {
        if (!_al.name || _al.isRequirement || _al._html != null) continue;
        const _aln = (_al.name || '').toLowerCase();
        const _alv = parseFloat(String(_al.value || '').replace('%','')) || 0;
        if (_aln === 'armor') {
          if (_al.socketed) _armorSockFlat += _alv;
          else _armorFlat += _alv;
        } else if (_aln === 'enhanced armor' && !_al.socketed) {
          _armorPct += _alv;
        }
      }
      const _totalArmor = Math.round((item.armor + _armorFlat) * (1 + _armorPct / 100)) + _armorSockFlat;
      _headerHtml += '<div class="tip-armor-row"><span class="tip-armor-icon">🛡</span><span class="tip-armor-val">' + _totalArmor + ' Armor</span></div>';
    }

    // Image spans name + subtitle + dye + armor/damage — all pre-divider content
    let h = buildTipImg(_tipImgSrc, _headerHtml, _tipImgClass);
    // ── Affixes ────────────────────────────────────────────────────────
    const _affixLines = [...(item.affixLines||[])];
    // Item-specific tooltip normalization (fixes label + units + ordering)
    if (item.legendaryName === 'Legendary Belt03') { // War Goddess's Girdle
      for (const ln of _affixLines) {
        // Parser emits "Slashing Damage Percent" with value lacking "%".
        if (ln.name === 'Slashing Damage Percent') {
          ln.name = 'Slashing Damage';
          const v = String(ln.value ?? '').trim();
          if (!v.endsWith('%')) ln.value = v + '%';
        }
        // Parser emits range as raw integer; UI expects meters.
        if (ln.name === 'Blood Lash Range') {
          ln.name = 'Blood Lash range';
          ln.value = String(ln.value ?? '').trim() + 'm';
        }
        // Parser currently treats this as generic Burn Duration; War Goddess expects
        // it to be labeled as Blood Lash Critical Duration.
        if (ln.name === 'Burn Duration') {
          ln.name = 'Blood Lash Critical Duration';
        }
      }
    }
    // Elemental imbue — first affix line when weapon has non-physical damage type
    const _PHYSICAL_TYPES = new Set(['Blunt','Slashing']);
    if (item.damageType && !_PHYSICAL_TYPES.has(item.damageType)) {
      const _imbueIcons  = { Fire:'🔥', Shadow:'🌑', Cold:'❄️', Lightning:'⚡', Nature:'🌿' };
      const _imbueColors = { Fire:'#fa8072', Shadow:'#c084fc', Cold:'#93c5fd', Lightning:'#fde047', Nature:'#86efac' };
      const _iIcon  = _imbueIcons[item.damageType]  || '';
      const _iColor = _imbueColors[item.damageType] || '#e2e8f0';
      // Use _html to bypass colorElements (which would add a second icon to the element word)
      const _imbueHtml =
        '<span style="color:' + _iColor + ';">' + esc(item.damageType) + '</span>' +
        (_iIcon ? ' <span style="color:#e2e8f0;">(</span><span style="color:' + _iColor + ';">' + _iIcon + '</span><span style="color:#e2e8f0;">)</span>' : '') +
        ' <span style="color:#e2e8f0;">Imbued</span>';
      _affixLines.unshift({ _html: _imbueHtml });
    }
    if (item.runeNum && !_affixLines.length) {
      // Stash rune tooltip: built from RUNE_DATA in rune_recipes.js
      const _tattooEffect = RUNE_DATA.tattoo_effect[item.runeNum];
      const _sockEffects  = RUNE_DATA.socket_effects[item.runeNum];
      if (_sockEffects) {
        _affixLines.push({ text:'Socket in item for effect:', color:'rgba(255,255,255,0.35)', _header:true });
        for (const e of _sockEffects) _affixLines.push({ text: e.slots + ': ' + e.effect, color:'#94a3b8' });
      }
      if (_tattooEffect) {
        _affixLines.push({ text:'Tattoo effect:', color:'rgba(255,255,255,0.35)', _header:true });
        _affixLines.push({ text: _tattooEffect, color:'#a78bfa' });
      }
    }
    const { displayLines: _displayLines, reqLines: _reqLines } = filterAffixLines(_affixLines);
    // Expose item to buildAffixRows for dagger attack-speed merge exception
    _currentItem = item;
    h += buildAffixRows(_displayLines, item._tipDividerClass || '');
    h += buildSockRow(item);
    h += buildReqBlock(_reqLines, item);

    // ── Optional footer (e.g. legendary found-count) ─────────────────
    if (item._tipFooterHtml) h += item._tipFooterHtml;

    // ── Flavour text for legendaries ─────────────────────────────────
    if (isLeg && item.legendaryName) {
      const cat = typeof legCatalogue !== 'undefined' ? legCatalogue[item.legendaryName] : null;
      const flavour = cat && cat.def?.flavour;
      if (flavour) {
        h += '<div class="tip-divider"></div>';
        h += '<div class="tip-flavour">' + esc(flavour) + '</div>';
      }
    }

    t.innerHTML = h;
    t.style.display = 'block';
    posTip(x, y);
  }

  // ── Shared socket row builder ─────────────────────────────────────────────
  // Returns an HTML string for the socket row, or '' if the item has no sockets.
  // Used by showItemTip (which handles all item types including legendaries).
  function buildSockRow(item) {
    const sockCount = Math.max(item.socketCount || 0, (item.socketed||[]).length);
    if (!sockCount) return '';
    const socketed = item.socketed || [];
    const slots = [...(item.socketSlots || [])].sort((a,b) => a==='unique'?-1:b==='unique'?1:0);
    let row = '';
    for (let s = 0; s < sockCount; s++) {
      const si = socketed[s];
      const isUniq = slots[s] === 'unique';
      const _gemC    = (si && si.type==='gem')   ? gemColor(si.name)                                             : null;
      const _heartC  = (si && si.type==='heart') ? (HEART_RARITY_COLORS_TIP[si.heartRarity||si.rarity]||'#90ee90') : null;
      const circleCol  = isUniq ? '#d4a847' : '#d1d5db';
      const contentCol = _heartC || _gemC || circleCol;
      const _sockImg   = si ? socketImgSrc(si) : null;
      const _border    = isUniq
        ? 'border:2px solid #d4a847;box-shadow:0 0 5px #c9a84c88;background:rgba(201,168,76,0.10);'
        : 'border:1.5px solid ' + circleCol + ';background:rgba(0,0,0,0.4);';
      const _circle = 'display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;overflow:hidden;flex-shrink:0;' + _border + (si?'':'opacity:'+(isUniq?'0.5':'0.3')+';');
      const _inner  = _sockImg
        ? '<img src="' + _sockImg + '" class="dh-sock-dot-img" onerror="this.style.display=\'none\'">'
        : (si ? '<span style="font-size:0.55rem;color:'+contentCol+';">'+(si.type==='heart'?'♥':si.type==='rune'?'ᚱ':'◆')+'</span>' : '');
      const _name = si ? '<span style="font-size:0.65rem;color:'+contentCol+';margin-left:3px;">'+esc(si.name||si.type)+'</span>' : '';
      row += '<span style="display:inline-flex;align-items:center;white-space:nowrap;margin-right:5px;"><span style="'+_circle+'">'+_inner+'</span>'+_name+'</span>';
    }
    return '<div class="tip-sock-row">' + row + '</div>';
  }

  // ── File grouping helpers ─────────────────────────────────────────────────
  // Groups .max files by character name (parsed quickly from filename heuristic,
  // then confirmed by parsing). We use a two-phase approach:
  // 1. Group by file name prefix (the hex id before the underscore)
  // 2. After parsing the latest file per group, use real char name/level

  // Quick group key: files sharing the same account-hex prefix (e.g. "5cec22830c67e0a6")
  function fileGroupKey(file) {
    // e.g. "5cec22830c67e0a6_11973061.max" → "5cec22830c67e0a6"
    const m = file.name.match(/^([^_]+)_/);
    return m ? m[1] : file.name;
  }

  function groupFiles(files) {
    const groups = {};
    for (const f of files) {
      const key = fileGroupKey(f);
      if (!groups[key]) groups[key] = [];
      groups[key].push(f);
    }
    // Sort each group by lastModified descending
    for (const key of Object.keys(groups))
      groups[key].sort((a,b) => b.lastModified - a.lastModified);
    return Object.values(groups);
  }

  // ── File list — character cards ───────────────────────────────────────────
  async function renderFileList(files) {
    fileListEl.innerHTML = '';  // clear including any "no files loaded" message
    let allGroups = groupFiles(files);
    // Sort groups alphabetically by character name (using cached parse data where available)
    allGroups.sort((a, b) => {
      const nameA = (charCache[a[0].name]?.name || '').toLowerCase();
      const nameB = (charCache[b[0].name]?.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
    // Apply last-N limit if enabled
    const groups = allGroups.map(g => limitEnabled ? g.slice(0, limitCount) : g);
    let firstLoad = true;

    for (const group of groups) {
      const latest = group[0];

      // Parse the latest file to get char info (cache it)
      let data = charCache[latest.name];
      if (!data) {
        try {
          data = parseMaxFile(await latest.arrayBuffer());
          charCache[latest.name] = data;
        } catch(e) {
          if (e.name === 'NotReadableError') {
            console.warn('[parse] skipped locked file:', latest.name);
            continue; // skip this group entirely — game still holds the file
          }
          console.warn('[parse]', latest.name, e);
        }
      }

      const charName  = data?.name  || '???';
      const charLevel = data?.level || '?';
      const charClass = data?.class || '';
      const ts        = new Date(latest.lastModified);
      const tsStr     = ts.toLocaleDateString() + ' ' + ts.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});

      const classColors = { Witch:'#a855f7', Crusader:'#f59e0b', Hunter:'#22c55e', Technomancer:'#3b82f6' };
      const cc = classColors[charClass] || '#aaa';

      // Character card (collapsed by default, first one expanded)
      const wrapper = document.createElement('li');
      wrapper.className = 'dh-char-wrapper';

      const card = document.createElement('div');
      card.className = 'dh-char-card';
      card.dataset.expanded = 'false';
      card.innerHTML =
        '<div class="dh-char-info">' +
          '<div class="dh-char-name-txt">' + esc(charName) + '</div>' +
          '<div class="dh-char-level-txt">' +
            'Lv ' + charLevel +
            (charClass ? ' <span class="dh-char-cls-dot">·</span><span class="dh-char-cls" style="color:' + cc + ';">' + esc(charClass) + '</span>' : '') +
          '</div>' +
          '<div class="dh-char-ts">' + tsStr + '</div>' +
        '</div>' +
        '<div class="dh-char-arrow">▼</div>';

      // File sub-list (hidden by default)
      const subList = document.createElement('ul');
      subList.className = 'dh-char-sublist';

      for (const f of group) {
        const fTs    = new Date(f.lastModified);
        const fTsStr = fTs.toLocaleDateString() + ' ' + fTs.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
        const isLatest = f === latest;

        const fi = document.createElement('li');
        fi.className = 'dh-file-sub-item' + (isLatest ? ' dh-file-sub-item--latest' : '');
        fi.dataset.filename = f.name;
        fi.innerHTML =
          '<div class="dh-file-sub-name">' +
            '<div class="dh-file-sub-filename">' + esc(f.name) + '</div>' +
            '<div class="dh-file-sub-ts">' + fTsStr +
              (isLatest ? ' <span class="dh-file-latest-badge">latest</span>' : '') +
            '</div>' +
          '</div>';

        fi.addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelectorAll('.dh-file-sub-item').forEach(i => {
            i.classList.remove('dh-file-sub-item--latest');
            if (!i.dataset._isLatest) i.style.borderLeftColor = '';
          });
          fi.style.borderLeftColor = '#8257e6';
          loadChar(f);
        });

        subList.appendChild(fi);
      }

      // ── Helpers ────────────────────────────────────────────────────
      const arrow = card.querySelector('.dh-char-arrow');

      function collapseCard(c) {
        c.dataset.expanded = 'false';
        const a = c.querySelector('.dh-char-arrow');
        const sl = c.parentElement.querySelector('ul');
        if (a)  a.style.transform = '';
        if (sl) sl.style.display  = 'none';
      }
      function collapseAllOthers() {
        fileListEl.querySelectorAll('.dh-char-card').forEach(c => {
          if (c !== card) { c.classList.remove('dh-char-card--active'); collapseCard(c); }
        });
      }
      function expandThisCard() {
        card.dataset.expanded = 'true';
        subList.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
      }
      function setActive() {
        card.classList.add('dh-char-card--active');
      }

      // Card body click:
      //   - already active → toggle file list expand/collapse (no re-load)
      //   - different char  → load latest, mark active, collapse all file lists
      card.querySelector('.dh-char-info').addEventListener('click', () => {
        const isActive = card.classList.contains('dh-char-card--active');
        if (isActive) {
          // Toggle this card's file list
          if (card.dataset.expanded === 'true') { collapseCard(card); }
          else { collapseAllOthers(); expandThisCard(); }
        } else {
          collapseAllOthers();
          collapseCard(card);
          setActive();
          loadChar(latest);
        }
      });

      // Triangle click → expand/collapse; if different char → also load + mark active
      arrow.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = card.dataset.expanded === 'true';
        const isActive   = card.classList.contains('dh-char-card--active');

        if (isExpanded) {
          // Collapse this card's file list only — keep char loaded
          collapseCard(card);
        } else {
          // Expand: collapse all others first
          collapseAllOthers();
          expandThisCard();
          // If this wasn't the active char, load it now
          if (!isActive) {
            setActive();
            loadChar(latest);
          }
        }
      });

      wrapper.appendChild(card);
      wrapper.appendChild(subList);
      fileListEl.appendChild(wrapper);

      // Auto-load first character — collapsed, just mark active
      if (firstLoad) {
        firstLoad = false;
        setActive();
        loadChar(latest);
      }
    }
  }

  async function loadChar(file) {
    elName.textContent = 'Parsing…';
    detailView.classList.add('active');
    // Show footer once a character is loaded
    const _footer = document.getElementById('page-footer');
    if (_footer) { _footer.classList.remove('dh-hidden'); _footer.style.display = 'flex'; }
    try {
      let data = charCache[file.name];
      if (!data) {
        data = parseMaxFile(await file.arrayBuffer());
        charCache[file.name] = data;
        // Update catalogue with this character's legendaries
        for (const item of data.equipment) {
          if (!item.legendaryName) continue;
          const slot = legCatalogue[item.legendaryName];
          if (!slot) continue;
          const hasDbid2 = item.dbid && item.dbid !== '0x0';
          const charKey = hasDbid2
            ? item.dbid
            : data.name + '|' + item.legendaryName + '|' + (item.slot ?? '');
          if (!slot.instances.find(i => i._key === charKey))
            slot.instances.push({ _key: charKey, charName:data.name, charLevel:data.level,
                                   charClass:data.class, fileName:file.name, item });
        }
      }
      renderChar(data);
      _aggregateAchievements(data);
      _finalizeAchievements();
      renderAchievementsPanel();
    } catch(err) {
      console.error(err);
      if (err.name === 'NotReadableError') {
        elName.textContent = 'File locked by game';
        detailView.innerHTML = '<div style="padding:2rem;color:rgba(255,255,255,0.4);font-size:.85rem;">' +
          '⚠ This save file is currently locked by Darkhaven.<br><br>' +
          'Close the game and click Rescan to load this character.' +
          '</div>';
      } else {
        elName.textContent = 'Error: ' + err.message;
      }
    }
  }


  // ── Character render ──────────────────────────────────────────────────────
  function renderChar(data) {
    _currentCharData = data;
    elName.textContent  = data.name;
    elLevel.textContent = 'Level ' + data.level;
    elClass.textContent = data.class;

    elStats.innerHTML = '';
    elEquip.innerHTML = '';

    const classColors = { Witch:'#a855f7', Crusader:'#f59e0b', Hunter:'#22c55e', Technomancer:'#3b82f6' };
    const classColor  = classColors[data.class] || '#aaa';

    // #stats-container reset handled by CSS

    // ── Outer container (flex column: spanning header + panels row) ──────────
    const outerWrap = document.createElement('div');
    outerWrap.className = 'dh-outer-wrap';

    // ── Spanning header: identity + XP bar ──────────────────────────────────
    const header = document.createElement('div');
    header.className = 'dh-char-hdr';

    // XP: not stored in offline saves – experience GUID not present
    const xpCur  = data.experience || 0;
    const xpNext = data.experienceNext || 0;
    // If no XP data at all, show bar as indeterminate (level cap assumed in demo)
    const xpKnown = xpCur > 0 || xpNext > 0;
    const xpPct   = xpKnown ? Math.min(100, Math.round(xpCur / (xpNext||1) * 100)) : 100;

    header.innerHTML =
      '<div class="dh-char-hdr-icon">' +
        '<img src="./img/' + data.class.toLowerCase() + '.png" ' +
        'onerror="this.outerHTML=\'<span style=&quot;font-size:2.2rem;opacity:0.5;&quot;>&#x1F6E1;&#xFE0F;</span>\'">' +
      '</div>' +
      '<div class="dh-char-hdr-body">' +
        '<div class="dh-char-hdr-name-row">' +
          '<span class="dh-char-hdr-name">' + esc(data.name) + '</span>' +
          '<span class="dh-char-hdr-level">Level <span class="dh-char-hdr-level-num">' + data.level + '</span></span>' +
          '<span class="dh-char-hdr-dot">·</span>' +
          '<span class="dh-char-hdr-class" style="color:' + classColor + ';">' + esc(data.class) + '</span>' +
        '</div>' +
        '<div class="dh-xp-wrap">' +
          '<div class="dh-xp-labels">' +
            (xpKnown
              ? '<span>XP: ' + xpCur.toLocaleString() + '</span><span>Next: ' + xpNext.toLocaleString() + '</span>'
              : '<span class="dh-xp-level-cap">Level Cap</span>') +
          '</div>' +
          '<div class="dh-xp-track"><div class="dh-xp-fill" style="width:' + xpPct + '%;"></div></div>' +
        '</div>' +
      '</div>';

    outerWrap.appendChild(header);

    // ── Panels row ──────────────────────────────────────────────────────────
    const panelsRow = document.createElement('div');
    panelsRow.className = 'dh-panels-row';

    // ── Column 1: Paperdoll ────────────────────────────────────────────────
    const GRID_W = 320;
    const GRID_H = 530; // 5×96 + 4×8 gap + 2×8 pad + 2 border
    const grid = document.createElement('div');
    grid.className = 'dh-paperdoll';

    const slotMap = {};
    for (const item of data.equipment) slotMap[item.slot] = item;

    for (const [slotKey, pos] of Object.entries(SLOT_GRID)) {
      const item = slotMap[slotKey];
      const cell = document.createElement('div');
      const isAltSlot = slotKey === 'hand_right_alt' || slotKey === 'hand_left_alt' || slotKey === 'hand_extra_alt' || slotKey === 'hand_extra_off';
      cell.className = 'dh-pd-cell' + (isAltSlot ? ' dh-pd-cell--alt' : '');
      cell.style.cssText = 'grid-column:' + (pos.col+1) + ';grid-row:' + (pos.row+1) + ';';

      if (!item) {
        cell.classList.add('dh-pd-cell--empty');
        // Map slot key → empty placeholder image filename
        const _EMPTY_IMG = {
          head:'helm', chest:'chest', hands:'gloves', feet:'boots', waist:'belt',
          neck:'amulet', finger_1:'ring', finger_2:'ring', flask:'flask',
          hand_right:'mainhand', hand_left:'offhand',
          hand_right_alt:'mainhand', hand_left_alt:'offhand',
          hand_extra_alt:'mainhand', hand_extra_off:'offhand',
        };
        const _emptySlug = _EMPTY_IMG[slotKey];
        const _emptyImgSrc = _emptySlug ? 'img/paperdoll_' + _emptySlug + '_empty.png' : null;
        cell.innerHTML = _emptyImgSrc
          ? '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">' +
              '<img src="' + _emptyImgSrc + '" alt="" class="dh-pd-empty-img"' +
              ' onerror="this.parentNode.parentNode.innerHTML=\'<div class=&quot;dh-pd-cell-empty-inner&quot;><span class=&quot;dh-pd-cell-empty-icon&quot;>' + (SLOT_ICON[slotKey]||'⬜').replace(/'/g,"\\'") + '</span><span class=&quot;dh-pd-cell-empty-lbl&quot;>' + esc(SLOT_DISPLAY[slotKey]||slotKey) + '</span></div>\'">' +
            '</div>'
          : '<div class="dh-pd-cell-empty-inner">' +
              '<span class="dh-pd-cell-empty-icon">' + (SLOT_ICON[slotKey]||'⬜') + '</span>' +
              '<span class="dh-pd-cell-empty-lbl">' + esc(SLOT_DISPLAY[slotKey]||slotKey) + '</span>' +
            '</div>';
      } else {
        const isLeg = !!item.legendaryName;
        const rc    = RARITY_COLOR[item.rarity] || RARITY_COLOR['Common'];
        const cellBg = (item.tomeUsed || !itemReqsMet(item, _currentCharData)) ? 'rgb(180,30,30)' : isLeg ? 'rgb(201,120,76)' : rc;
        const bord   = (item.tomeUsed || !itemReqsMet(item, _currentCharData)) ? '#b01010' : isLeg ? '#c9784c' : rc;
        cell.classList.add('dh-pd-cell--item', 'dh-item-hover');
        if (isLeg) cell.classList.add('dh-pd-cell--leg');
        cell.style.cssText += '--cell-bg:' + cellBg + ';background:transparent;border:1px solid ' + bord + ';';

        const dn = resolveItemDisplayName(item);
        // Socket overlay — individual circles, positioned top-right (vertical) or bottom-left (horizontal for belt)
        const totalSocks = Math.max(item.socketCount || 0, (item.socketed||[]).length);
        const _isBeltSlot = slotKey === 'waist';
        const HEART_RARITY_COLORS_PD = { Common:'#90ee90', Elite:'#22c55e', Champion:'#84cc16', Unique:'#c9a84c' };
        let sockOverlayHtml = '';
        if (totalSocks > 0) {
          const _pdSlots = [...(item.socketSlots || [])].sort((a,b) => a==='unique'?-1:b==='unique'?1:0);
          let dotHtml = '';
          for (let _sd = 0; _sd < totalSocks; _sd++) {
            const _si = (item.socketed || [])[_sd];
            const _isUSlot = _pdSlots[_sd] === 'unique';
            let dotClass = 'dh-pd-sock-dot' + (_isUSlot ? ' dh-pd-sock-dot--uniq' : '');
            let dotInner = '';
            if (_si) {
              dotClass += ' dh-pd-sock-dot--filled';
              const _siImg = socketImgSrc(_si);
              if (_siImg) {
                dotInner = '<img src="' + _siImg + '" class="dh-sock-dot-img" onerror="this.style.display=\'none\'">';
              } else {
                // fallback emoji if image missing
                let _dotColor = _isUSlot ? '#d4a847' : '#d1d5db';
                if (_si.type === 'gem')        _dotColor = gemColor(_si.name) || _dotColor;
                else if (_si.type === 'heart') _dotColor = HEART_RARITY_COLORS_PD[_si.heartRarity || _si.rarity] || '#90ee90';
                else if (_si.type === 'rune')  _dotColor = '#a78bfa';
                dotInner = '<span style="font-size:0.44rem;color:' + _dotColor + ';">' + (_si.type==='heart'?'♥':_si.type==='rune'?'ᚱ':'◆') + '</span>';
              }
            }
            dotHtml += '<span class="' + dotClass + '">' + dotInner + '</span>';
          }
          sockOverlayHtml = '<div class="dh-pd-sockets' + (_isBeltSlot ? ' dh-pd-sockets--belt' : '') + '">' + dotHtml + '</div>';
        }

        const _isJewelry = ['neck','finger_1','finger_2','flask'].includes(slotKey);
        const _imgClass = _isJewelry ? 'dh-pd-cell-img--jewelry' : 'dh-pd-cell-img';
        const _pdImgSrc = isLeg && LEG_IMAGES[item.id || item.legendaryName]
          ? 'img/items/' + LEG_IMAGES[item.id || item.legendaryName]
          : nonLegImgPath(item) || '';
        // Fallback icon: prefer item's typeDisplay over slot key so a dagger in an alt offhand slot
        // shows ⚔️ not 🛡️. Map item slot type to an appropriate icon.
        const _fbIconMap = { w:'⚔️', s:'🛡️', a:'🛡️', j:'💍' };
        const _fbT = (/\bshield\b|\bbuckler\b|\btarge\b/i.test(item.name||'') ? 's' : /\bdagger\b|\bsword\b|\bmace\b|\baxe\b|\bwand\b|\bstaff\b|\bbow\b|\bknife\b/i.test(item.name||'') ? 'w' : null);
        const _fbIcon = _fbT ? _fbIconMap[_fbT] : (SLOT_ICON[slotKey]||'&#x2699;&#xFE0F;');
        cell.innerHTML =
          (_pdImgSrc
            ? '<img src="' + _pdImgSrc + '" alt="' + esc(dn) + '" class="' + _imgClass + '" onerror="this.style.display=\'none\';this.parentNode.innerHTML=\'<div style=&quot;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:2px;&quot;><span style=&quot;font-size:1.0rem;line-height:1;&quot;>' + _fbIcon + '</span><span style=&quot;font-size:0.38rem;text-transform:uppercase;letter-spacing:0.06em;opacity:0.3;&quot;>' + esc(item.slotDisplay) + '</span></div>\'">'
            : '<div class="dh-pd-cell-empty-inner"><span class="dh-pd-cell-empty-icon">' + _fbIcon + '</span><span class="dh-pd-cell-empty-lbl">' + esc(item.slotDisplay) + '</span></div>'
          ) + sockOverlayHtml;

        if (item.favourite) cell.insertAdjacentHTML('beforeend', _BOOKMARK_SVG);

        cell.addEventListener('mouseenter', function(e) { showItemTip(item, e.clientX, e.clientY); });
        cell.addEventListener('mouseleave', function() { hideTip(); });
      }
      grid.appendChild(cell);
    }

    panelsRow.appendChild(grid);

    // ── Column 2: Attributes + Combat + Resources ──────────────────────────
    const statsPanel = document.createElement('div');
    statsPanel.className = 'dh-panel-stats';
    statsPanel.style.maxHeight = GRID_H + 'px';

    function makeGroupLabel(text) {
      const d = document.createElement('div');
      d.className = 'dh-group-label';
      d.textContent = text;
      return d;
    }

    function makeStatRow(label, val, color, suffix) {
      const r = document.createElement('div');
      r.className = 'dh-stat-row';
      const display = typeof val === 'number' ? fmtNum(Math.round(val)) + (suffix||'') : (val||'–');
      r.innerHTML =
        '<span class="dh-stat-label">' + label + '</span>' +
        '<span class="dh-stat-val" style="color:' + color + ';">' + display + '</span>';
      return r;
    }

    function makeSep() {
      const d = document.createElement('div');
      d.className = 'dh-sep';
      return d;
    }

    const ATTR_ROWS = [
      ['strength','Strength','#ef4444'],['dexterity','Dexterity','#eab308'],
      ['vitality','Vitality','#f59e0b'],['magic','Magic','#a855f7'],
    ];
    const COMBAT_ROWS = [
      ['attack','Attack','#f97316'],['armor','Armor','#60a5fa'],
    ];

    statsPanel.appendChild(makeGroupLabel('Attributes'));
    for (const [k,label,color] of ATTR_ROWS) {
      const v = data.stats[k] || 0;
      const base = data.stats[k+'Base'] || data.stats.classDexBase || 0;
      const row = makeStatRow(label, v || null, color);
      if (v) {
        const intrinsic = data.stats[k+'Intrinsic'] || 0;
        const fromItems = data.stats[k+'FromItems'] || 0;
        const baseVal   = data.stats[k+'Base'];        // may be undefined for Witch DEX
        const tipParts  = [];
        if (baseVal !== undefined) tipParts.push(`Base ${baseVal}`);
        else                       tipParts.push(`Base ${v - intrinsic - fromItems} (class)`);
        if (intrinsic) tipParts.push(`+${intrinsic} tomes`);
        if (fromItems) tipParts.push(`+${fromItems} items`);
        const computed = (baseVal !== undefined ? baseVal : (v - intrinsic - fromItems)) + intrinsic + fromItems;
        if (Math.abs(computed - v) > 0.5) tipParts.push(`+${Math.round(v - computed)} other`);
        const tipHtml = '<div class="dh-stat-tip-body">' +
          tipParts.map(p => `<div>${p}</div>`).join('') +
          `<div class="dh-stat-tip-total">= ${Math.round(v)} total</div>` +
          '</div>';
        row.style.cursor = 'help';
        row.addEventListener('mouseenter', e => showStatTip(tipHtml, e.clientX, e.clientY));
        row.addEventListener('mousemove',  e => moveStatTip(e.clientX, e.clientY));
        row.addEventListener('mouseleave', () => hideStatTip());
      }
      if (v) statsPanel.appendChild(row);
    }
    statsPanel.appendChild(makeGroupLabel('Combat'));
    for (const [k,label,color] of COMBAT_ROWS) { const v=data.stats[k]; if(v) statsPanel.appendChild(makeStatRow(label,v,color)); }
    if (data.stats.attackSpeed) statsPanel.appendChild(makeStatRow('Atk Speed', '+' + Math.round(data.stats.attackSpeed*100)+'%', '#f97316'));
    if (data.stats.castSpeed)   statsPanel.appendChild(makeStatRow('Cast Speed', '+' + Math.round(data.stats.castSpeed*100)+'%', '#f97316'));
    statsPanel.appendChild(makeGroupLabel('Resources'));
    // Life bar
    // ── Resources: Life bar (compact) ──────────────────────────────────
    if (data.stats.healthMax) {
      // stats.health = parser-resolved current HP (healthCurrent ?? healthMax)
      const hpCur = data.stats.health || data.stats.healthMax || 0;
      const hpMax = data.stats.healthMax || 0;
      // Display as (current/max) — always show lower first
      const _hp0 = Math.min(hpCur, hpMax), _hp1 = Math.max(hpCur, hpMax);
      const hpPct = _hp1 ? Math.min(100, Math.round(_hp0 / _hp1 * 100)) : 100;
      const hpRow = document.createElement('div');
      hpRow.className = 'dh-res-bar-wrap';
      hpRow.innerHTML =
        '<div class="dh-res-bar-labels">' +
'<span class="dh-res-bar-label-l dh-res-bar-label--life">❤ Life</span>' +
          '<span class="dh-res-bar-label-r">' + Math.round(_hp0) + ' / ' + Math.round(_hp1) + '</span>' +
        '</div>' +
'<div class="dh-res-bar-track dh-res-bar-track--life">' +
          '<div class="dh-res-bar-fill" style="width:' + hpPct + '%;background:linear-gradient(90deg,#b91c1c,#ef4444);"></div>' +
        '</div>';
      statsPanel.appendChild(hpRow);
    }
    // Mana bar (compact)
    if (data.stats.manaMax) {
      // stats.mana = parser-resolved current mana (manaCurrent ?? manaMax)
      const mpCur = data.stats.mana || data.stats.manaMax || 0;
      const mpMax = data.stats.manaMax || 0;
      const _mp0 = Math.min(mpCur, mpMax), _mp1 = Math.max(mpCur, mpMax);
      const mpPct = _mp1 ? Math.min(100, Math.round(_mp0 / _mp1 * 100)) : 100;
      const mpRow = document.createElement('div');
      mpRow.className = 'dh-res-bar-wrap';
      mpRow.innerHTML =
        '<div class="dh-res-bar-labels">' +
'<span class="dh-res-bar-label-l dh-res-bar-label--mana">✦ Mana</span>' +
          '<span class="dh-res-bar-label-r">' + Math.round(_mp0) + ' / ' + Math.round(_mp1) + '</span>' +
        '</div>' +
'<div class="dh-res-bar-track dh-res-bar-track--mana">' +
          '<div class="dh-res-bar-fill" style="width:' + mpPct + '%;background:linear-gradient(90deg,#4338ca,#818cf8);"></div>' +
        '</div>';
      statsPanel.appendChild(mpRow);
    }
    statsPanel.appendChild(makeStatRow('Mana Regen', data.stats.manaRegen > 0 ? (Math.round(data.stats.manaRegen*10)/10)+'/s' : '—', '#818cf8'));
    statsPanel.appendChild(makeStatRow('Stamina Regen', data.stats.staminaRegen > 0 ? (Math.round(data.stats.staminaRegen*10)/10)+'/s' : '—', '#84cc16'));
    {
      // Flask – stored as potionCharges (current) / potionMax (max); max = stamina stat if not explicit
      const flaskCur = data.potionCharges ?? 0;
      const flaskMax = data.potionMax || data.stats.dashMax || flaskCur;
      statsPanel.appendChild(makeStatRow('Flask', flaskCur + ' / ' + flaskMax, '#22d3ee'));
    }
    {
      const stam = data.stats.dashMax || data.stats.stamina || 0;
      const stamMax = stam;
      statsPanel.appendChild(makeStatRow('Dash', stam + ' / ' + stamMax, '#84cc16'));
    }
    if (data.gold > 0)   statsPanel.appendChild(makeStatRow('Gold',  data.gold,  '#f59e0b'));
    if (data.stone > 0)  statsPanel.appendChild(makeStatRow('Stone', data.stone, '#94a3b8'));
    if (data.kills > 0)  statsPanel.appendChild(makeStatRow('Kills', data.kills, '#f87171'));

    panelsRow.appendChild(statsPanel);

    // ── Column 3: Detailed stats ───────────────────────────────────────────
    const detailPanel = document.createElement('div');
    detailPanel.className = 'dh-panel-detail';
    detailPanel.style.maxHeight = GRID_H + 'px';

    const s = data.stats;
    const EL_KEYS   = ['blunt','cold','fire','lightning','shadow','slashing'];
    const EL_LABELS = { blunt:'Blunt', cold:'Cold', fire:'Fire', lightning:'Lightning', shadow:'Shadow', slashing:'Slashing' };
    const EL_ICONS  = { blunt:'🔨', cold:'❄️', fire:'🔥', lightning:'⚡', shadow:'🌑', slashing:'⚔️' };
    const EL_COLORS = { blunt:'#94a3b8', cold:'#67e8f9', fire:'#f97316', lightning:'#fbbf24', shadow:'#a855f7', slashing:'#f87171' };

    function makeElementGrid(label, byMap, suffix) {
      const wrap = document.createElement('div');
      wrap.className = 'dh-elem-grid-wrap';
      const lbl = document.createElement('div');
      lbl.className = 'dh-elem-group-label';
      lbl.textContent = label;
      wrap.appendChild(lbl);
      const iconRow = document.createElement('div');
      iconRow.className = 'dh-elem-icon-row';
      EL_KEYS.forEach(k => {
        const cell = document.createElement('div');
        cell.className = 'dh-elem-cell';
        cell.textContent = EL_ICONS[k];
        cell.addEventListener('mouseenter', e => {
          const v = Math.round(byMap[k] || 0);
          showStatTip(label + ' · ' + EL_LABELS[k] + ': ' + v + (suffix||''), e.clientX, e.clientY);
        });
        cell.addEventListener('mousemove', e => moveStatTip(e.clientX, e.clientY));
        cell.addEventListener('mouseleave', hideStatTip);
        iconRow.appendChild(cell);
      });
      wrap.appendChild(iconRow);
      const valRow = document.createElement('div');
      valRow.className = 'dh-elem-val-row';
      EL_KEYS.forEach(k => {
        const v = Math.round(byMap[k] || 0);
        const cell = document.createElement('div');
        cell.className = 'dh-elem-val';
        cell.style.color = v !== 0 ? EL_COLORS[k] : '#3a3a3a';
        cell.textContent = v !== 0 ? String(v) : '0';
        cell.addEventListener('mouseenter', e => {
          showStatTip(label + ' · ' + EL_LABELS[k] + ': ' + v + (suffix||''), e.clientX, e.clientY);
        });
        cell.addEventListener('mousemove', e => moveStatTip(e.clientX, e.clientY));
        cell.addEventListener('mouseleave', hideStatTip);
        valRow.appendChild(cell);
      });
      wrap.appendChild(valRow);
      return wrap;
    }

    function makeDashRow(label, value, color, suffix, showZero) {
      const r = document.createElement('div');
      r.className = 'dh-dash-row';
      const v = Math.round(value * 10) / 10;
      const hasVal = v !== 0;
      const display = hasVal ? (v + (suffix||'')) : (showZero ? '0' : '–');
      r.innerHTML =
        '<span class="dh-dash-label">' + label + '</span>' +
        '<span class="dh-dash-val" style="color:' + (hasVal ? color : '#3a3a3a') + ';">' + display + '</span>';
      return r;
    }

    function makeSectionLabel(text) {
      const d = document.createElement('div');
      d.className = 'dh-section-label';
      d.textContent = text;
      return d;
    }

    detailPanel.appendChild(makeElementGrid('Resistances',         s.resistanceBy,  ''));
    detailPanel.appendChild(makeElementGrid('Penetration',         s.penetrationBy, ''));
    detailPanel.appendChild(makeElementGrid('Critical Chance',     s.critChanceBy,  '%'));
    detailPanel.appendChild(makeElementGrid('Critical Resistance', s.critResistBy,  '%'));

    detailPanel.appendChild(makeSectionLabel('Movement'));
    detailPanel.appendChild(makeDashRow('Stamina',        s.stamina      || 0, '#84cc16', '',   true));
      // Stamina Regen shown in Resources panel
    detailPanel.appendChild(makeDashRow('Movement Speed', s.moveSpeed    || 0, '#67e8f9', '%',  false));
    {
      const wwRow = document.createElement('div');
      wwRow.className = 'dh-dash-row';
      const hasWW = s.waterWalking > 0;
      wwRow.innerHTML =
        '<span class="dh-dash-label">Water Walking</span>' +
        '<span class="dh-dash-val" style="color:' + (hasWW ? '#67e8f9' : '#3a3a3a') + ';">' + (hasWW ? '✓' : '–') + '</span>';
      detailPanel.appendChild(wwRow);
    }
    {
      const ffRow = document.createElement('div');
      ffRow.className = 'dh-dash-row';
      const hasFF = !!s.featherFalling;
      ffRow.innerHTML =
        '<span class="dh-dash-label">Feather Falling</span>' +
        '<span class="dh-dash-val" style="color:' + (hasFF ? '#67e8f9' : '#3a3a3a') + ';">' + (hasFF ? '✓' : '–') + '</span>';
      detailPanel.appendChild(ffRow);
    }

    detailPanel.appendChild(makeSectionLabel('Treasure Hunting'));
    detailPanel.appendChild(makeDashRow('Magic Find',       s.magicFind      || 0, '#c084fc', '%', false));
    detailPanel.appendChild(makeDashRow('Gold Find',        s.goldFind       || 0, '#f59e0b', '%', false));
    detailPanel.appendChild(makeDashRow('Gem Find',         s.gemFind        || 0, '#34d399', '%', false));
    detailPanel.appendChild(makeDashRow('Find Health Orbs', s.findHealthOrbs || 0, '#22c55e', '%', false));
    detailPanel.appendChild(makeDashRow('Find Mana Orbs',   s.findManaOrbs   || 0, '#818cf8', '%', false));

    panelsRow.appendChild(detailPanel);

    // ── Column 4: Stash + Inventory ─────────────────────────────────────────
    const stashItems   = data.stash      || [];
    // data.inventory removed — no confirmed player inventory
    const CELL         = 30;
    const STASH_COLS   = 15;
    const STASH_ROWS   = 16;
    // INV_COLS/INV_ROWS removed — no confirmed player inventory data

    // Single stash view — no tab switching needed

    const stashPanel = document.createElement('div');
    stashPanel.id = 'stash-panel';

    function stashPanelWidth() {
      return stashViewMode === 'grid' ? STASH_COLS * CELL + 18 : 200;
    }

    function applyStashPanelStyle() {
      const w = stashPanelWidth();
      stashPanel.className = 'dh-panel-stash';
      if (stashViewMode === 'grid') {
        stashPanel.style.minWidth = w + 'px';
        stashPanel.style.maxWidth = w + 'px';
        stashPanel.style.width    = w + 'px';
        stashPanel.style.flex     = '0 0 ' + w + 'px';
      } else {
        stashPanel.style.removeProperty('min-width');
        stashPanel.style.removeProperty('max-width');
        stashPanel.style.removeProperty('width');
        stashPanel.style.flex = '1';
      }
      stashPanel.style.height = stashViewMode === 'list' ? GRID_H + 'px' : 'auto';
    }
    applyStashPanelStyle();

    // ── Header ──
    const stashHdr = document.createElement('div');
    stashHdr.className = 'dh-stash-hdr';
    const stashCountEl = document.createElement('span');
    stashCountEl.className = 'dh-stash-count';
    stashCountEl.textContent = stashItems.length + ' items';
    const toggleBtn = document.createElement('button');
    toggleBtn.title = stashViewMode === 'list' ? 'Switch to grid view' : 'Switch to list view';
    toggleBtn.className = 'dh-stash-toggle';
    toggleBtn.innerHTML = stashViewMode === 'list' ? SVG_GRID : SVG_LIST;
    const stashTitleEl = document.createElement('span');
    stashTitleEl.textContent = 'Stash';
    stashHdr.appendChild(stashTitleEl);
    stashHdr.appendChild(stashCountEl);
    stashHdr.appendChild(toggleBtn);
    stashPanel.appendChild(stashHdr);

    // Tab bar removed — stash-only panel

    // ── Content body ──
    const stashBody = document.createElement('div');
    stashBody.className = 'dh-stash-body';
    stashPanel.appendChild(stashBody);

    // ── Draw grid background canvas ──
    function buildGridCanvas(cols, rows) {
      const canvas = document.createElement('canvas');
      canvas.width = cols * CELL; canvas.height = rows * CELL;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(255,255,255,0.015)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 0.5;
      for (let c = 0; c <= cols; c++) { ctx.beginPath(); ctx.moveTo(c*CELL,0); ctx.lineTo(c*CELL,canvas.height); ctx.stroke(); }
      for (let r = 0; r <= rows; r++) { ctx.beginPath(); ctx.moveTo(0,r*CELL); ctx.lineTo(canvas.width,r*CELL); ctx.stroke(); }
      return canvas;
    }

    // ── Render a single item cell into a grid area ──
    function renderItemCell(item, col, row, gridArea) {
      const {w, h} = itemGridSize(item);
      const isLeg = !!item.legendaryName;
      // Null-rarity items (equipment-pass Common) fall back to Common grey so border/bg are visible.
      const rc = RARITY_COLOR[item.rarity] || RARITY_COLOR['Common'];
      const dn = resolveItemDisplayName(item);
      const cell = document.createElement('div');
      cell.className = 'dh-stash-cell dh-item-hover';
      cell.style.left   = (col * CELL + 1) + 'px';
      cell.style.top    = (row * CELL + 1)  + 'px';
      cell.style.width  = (w * CELL - 2) + 'px';
      cell.style.height = (h * CELL - 2) + 'px';
      // Hearts get rarity-specific BG tints: common=light green, elite=green, champion=lime, unique=gold
      const HEART_BG_FULL = { Common:'rgb(144,238,144)', Elite:'rgb(34,197,94)', Champion:'rgb(132,204,22)', Unique:'rgb(201,168,76)' };
      const HEART_BD = { Common:'rgba(144,238,144,0.7)', Elite:'rgba(34,197,94,0.75)', Champion:'rgba(132,204,22,0.75)', Unique:'#c9a84c' };
      const isHeart = !!item.heartName;
      if (isHeart) {
        const _hBgFull = HEART_BG_FULL[item.heartRarity] || HEART_BG_FULL.Common;
        cell.style.setProperty('--cell-bg', _hBgFull);
        cell.style.background = 'transparent';
        cell.style.border     = '1px solid ' + (HEART_BD[item.heartRarity] || HEART_BD.Common);
      } else {
        const _reqsMet = itemReqsMet(item, _currentCharData);
        const _cellBg = (item.tomeUsed || !_reqsMet) ? 'rgb(180,30,30)' : isLeg ? 'rgb(201,120,76)' : rc;
        cell.style.setProperty('--cell-bg', _cellBg);
        cell.style.background = 'transparent';
        cell.style.border = (item.tomeUsed || !_reqsMet) ? '1px solid #b01010' : isLeg ? '1px solid #c9784c' : '1px solid ' + rc;
      }

      // Helper: add stack-count badge (bottom-right corner) for qty >= 2
      function addStackBadge(qty) {
        if (!qty || qty < 2) return;
        const badge = document.createElement('div');
        badge.className = 'dh-stash-cell-badge';
        badge.textContent = qty;
        cell.appendChild(badge);
      }

      // Helper: render centered image filling the cell
      function addCenteredImg(src, fallbacks) {
        cell.style.alignItems = 'center'; cell.style.justifyContent = 'center'; cell.style.padding = '2px';
        const img = document.createElement('img');
        img.className = 'dh-stash-cell-img';
        let fi = 0;
        img.onerror = () => {
          if (fi < fallbacks.length) { img.src = fallbacks[fi++]; } else { img.style.display='none'; }
        };
        img.src = src;
        cell.appendChild(img);
        return img;
      }

      // Rune: show image + name
      if (item.runeNum) {
        cell.style.alignItems = 'center'; cell.style.justifyContent = 'center';
        cell.style.background = 'rgba(103,65,180,0.2)'; cell.style.borderColor = 'rgba(147,112,219,0.5)';
        const rImg = document.createElement('img');
        rImg.src = './img/runes/' + RUNE_DATA.img[item.runeNum];
        rImg.alt = item.runeName || '';
        rImg.style.cssText = 'width:' + (w*CELL-10) + 'px;height:' + (w*CELL-10) + 'px;object-fit:contain;filter:drop-shadow(0 0 4px rgba(167,139,250,0.7));';
        rImg.onerror = () => { rImg.src = './img/runes/' + RUNE_DATA.img_legacy[item.runeNum]; rImg.onerror = () => { rImg.style.display='none'; }; };
        cell.appendChild(rImg);

      } else if (item.gemType && item.gemLevel != null) {
        // Gem: gem_{type}_{level}.png — "Cracked"=1, "Flawed"=2, "Dull"=3
        const gemFile = 'gem_' + item.gemType + '_0' + item.gemLevel + '.png';
        cell.style.alignItems = 'center'; cell.style.justifyContent = 'center'; cell.style.padding = '2px';
        const gImg = document.createElement('img');
        gImg.src = './img/gems/' + gemFile;
        gImg.alt = dn;
        gImg.style.cssText = 'width:' + (w*CELL-8) + 'px;height:' + (w*CELL-8) + 'px;object-fit:contain;display:block;filter:drop-shadow(0 0 3px rgba(255,255,255,0.2));';
        gImg.onerror = () => { gImg.style.display='none'; };
        cell.appendChild(gImg);
        addStackBadge(item.quantity);

      } else if (item.dyeName) {
        // Dye: ./img/dyes/{dyename}_dye.png — name lowercased, spaces → underscores
        const dyeFile = 'dyes/' + item.dyeName.toLowerCase().replace(/\s+/g, '_') + '_dye.png';
        cell.style.alignItems = 'center'; cell.style.justifyContent = 'center'; cell.style.padding = '2px';
        const dImg = document.createElement('img');
        dImg.src = './img/' + dyeFile;
        dImg.alt = dn;
        dImg.style.cssText = 'width:' + (w*CELL-8) + 'px;height:' + (w*CELL-8) + 'px;object-fit:contain;display:block;';
        dImg.onerror = () => { dImg.style.display='none'; };
        cell.appendChild(dImg);
        addStackBadge(item.quantity);

      } else if (item.heartName) {
        // Core heart image convention: core_{rarity}_{element}_heart.png for all rarities
        // rarity: common, elite, champion, unique — element: cold, fire, lightning, nature, shadow
        const _hRarSlug = (item.heartRarity || 'common').toLowerCase();
        const _hElSlug  = (item.heartElement || 'fire').toLowerCase();
        const _hFile = 'cores/core_' + _hRarSlug + '_' + _hElSlug + '_heart.png';
        cell.style.alignItems = 'center'; cell.style.justifyContent = 'center'; cell.style.padding = '2px';
        const hImg = document.createElement('img');
        hImg.src = './img/' + _hFile;
        hImg.alt = dn;
        hImg.style.cssText = 'width:' + (w*CELL-8) + 'px;height:' + (w*CELL-8) + 'px;object-fit:contain;display:block;filter:drop-shadow(0 0 3px rgba(255,255,255,0.15));';
        hImg.onerror = () => { hImg.style.display='none'; };
        cell.appendChild(hImg);

      } else if (isLeg && LEG_IMAGES[item.legendaryName]) {
        // Legendary: fill entire cell with webp image (no placeholder entries in map)
        cell.style.alignItems = 'center'; cell.style.justifyContent = 'center'; cell.style.padding = '2px';
        const imgEl = document.createElement('img');
        // 2H weapons (h=4): use vertical _v.png variant for better display in tall stash cell
        // Derive slug from LEG_IMAGES filename: 'l_staff01_wormwood_crook.webp' → 'wormwood_crook'
        if (h === 4) {
          const _legFile = LEG_IMAGES[item.legendaryName] || '';
          const _legSlug = _legFile.replace(/^l_[a-z]+\d+_/, '').replace(/\.\w+$/, '');
          const _vSrc = 'img/items/w_l_' + _legSlug + '_v.png';
          imgEl.src = _vSrc;
          imgEl.onerror = () => { imgEl.src = 'img/items/' + _legFile; imgEl.onerror = () => { imgEl.style.display='none'; }; };
        } else {
          imgEl.src = 'img/items/' + LEG_IMAGES[item.legendaryName];
          imgEl.onerror = () => { imgEl.style.display='none'; };
        }
        imgEl.alt = dn;
        imgEl.className = 'dh-stash-cell-img';
        cell.appendChild(imgEl);

      } else {
        // Non-legendary: try convention image first, fall back to text
        const _nlPath = nonLegImgPath(item);
        if (_nlPath) {
          cell.style.alignItems = 'center'; cell.style.justifyContent = 'center'; cell.style.padding = '2px';
          const nlImg = document.createElement('img');
          // 2H weapons (h=4) use a vertical _v.png variant for better display in the tall stash cell.
          // Try the vertical version first; fall back to the standard path on error.
          if (h === 4) {
            const _vPath = _nlPath.replace(/\.png$/, '_v.png');
            nlImg.src = _vPath;
            nlImg.onerror = () => {
              nlImg.src = _nlPath;
              nlImg.onerror = () => {
                nlImg.style.display = 'none';
                const nameEl = document.createElement('div');
                nameEl.className = 'dh-stash-cell-name';
                nameEl.style.webkitLineClamp = Math.max(h*2-1,1);
                nameEl.style.color = rc;
                nameEl.textContent = dn;
                cell.appendChild(nameEl);
              };
            };
          } else {
            nlImg.src = _nlPath;
            // On error: hide img and fall back to name text
            nlImg.onerror = () => {
              nlImg.style.display = 'none';
              const nameEl = document.createElement('div');
              nameEl.className = 'dh-stash-cell-name';
              nameEl.style.webkitLineClamp = Math.max(h*2-1,1);
              nameEl.style.color = rc;
              nameEl.textContent = dn;
              cell.appendChild(nameEl);
            };
          }
          nlImg.alt = dn;
          nlImg.className = 'dh-stash-cell-img';
          cell.appendChild(nlImg);
        } else {
          const nameEl = document.createElement('div');
          nameEl.className = 'dh-stash-cell-name';
          nameEl.style.webkitLineClamp = Math.max(h*2-1,1);
          nameEl.style.color = isLeg ? '#e8b87a' : rc;
          nameEl.textContent = dn;
          cell.appendChild(nameEl);
          if (item.level) {
            const lvEl = document.createElement('div');
            lvEl.className = 'dh-stash-cell-lv';
            lvEl.textContent = 'iL' + item.level;
            cell.appendChild(lvEl);
          }
        }
      }
      // Socket overlay — same logic as paperdoll but with smaller dots (dh-stash-sock-dot)
      const _stashSockCount = Math.max(item.socketCount || 0, (item.socketed||[]).length);
      if (_stashSockCount > 0) {
        const HEART_RARITY_COLORS_ST = { Common:'#90ee90', Elite:'#22c55e', Champion:'#84cc16', Unique:'#c9a84c' };
        const _stSlots = [...(item.socketSlots || [])].sort((a,b) => a==='unique'?-1:b==='unique'?1:0);
        let _stDotHtml = '';
        for (let _sd = 0; _sd < _stashSockCount; _sd++) {
          const _si = (item.socketed || [])[_sd];
          const _isUSlot = _stSlots[_sd] === 'unique';
          let _dotCls = 'dh-stash-sock-dot' + (_isUSlot ? ' dh-stash-sock-dot--uniq' : '');
          let _dotInner = '';
          if (_si) {
            _dotCls += ' dh-stash-sock-dot--filled';
            const _siImg = socketImgSrc(_si);
            if (_siImg) {
              _dotInner = '<img src="' + _siImg + '" class="dh-sock-dot-img" onerror="this.style.display=\'none\'">';
            } else {
              let _dc = _isUSlot ? '#d4a847' : '#d1d5db';
              if (_si.type === 'gem')        _dc = gemColor(_si.name) || _dc;
              else if (_si.type === 'heart') _dc = HEART_RARITY_COLORS_ST[_si.heartRarity || _si.rarity] || '#90ee90';
              else if (_si.type === 'rune')  _dc = '#a78bfa';
              _dotInner = '<span style="font-size:0.32rem;color:' + _dc + ';">' + (_si.type==='heart'?'♥':_si.type==='rune'?'ᚱ':'◆') + '</span>';
            }
          }
          _stDotHtml += '<span class="' + _dotCls + '">' + _dotInner + '</span>';
        }
        const _stSockOverlay = document.createElement('div');
        const _isBeltCell = item.slot === 'waist' || item.slot === 'belt';
        _stSockOverlay.className = 'dh-pd-sockets dh-pd-sockets--stash' + (_isBeltCell ? ' dh-pd-sockets--belt' : '');
        _stSockOverlay.innerHTML = _stDotHtml;
        cell.appendChild(_stSockOverlay);
      }

      if (item.favourite) cell.insertAdjacentHTML('beforeend', _BOOKMARK_SVG_ST);

      cell.addEventListener('mouseenter', e => { showItemTip(item, e.clientX, e.clientY); });
      cell.addEventListener('mouseleave', () => { hideTip(); });
      gridArea.appendChild(cell);
    }

    // ── Grid view (stash only: 15 cols × 16 rows) ──
    function buildGridView() {
      stashBody.innerHTML = '';
      const gridWrap = document.createElement('div');
      gridWrap.className = 'dh-grid-wrap';
      const gridArea = document.createElement('div');
      gridArea.style.cssText = 'position:relative;width:' + (STASH_COLS*CELL) + 'px;height:' + (STASH_ROWS*CELL) + 'px;flex-shrink:0;';
      gridArea.appendChild(buildGridCanvas(STASH_COLS, STASH_ROWS));
      stashItems.forEach(item => {
        // bagNum IS the row (0-15), bagCol IS the col (0-14) — direct, no multiplication
        const row = item.bagNum  ?? (item.stashIndex >> 16);
        const col = item.bagCol  ?? (item.stashIndex & 0xFFFF);
        if (row >= 0 && row < STASH_ROWS && col >= 0 && col < STASH_COLS)
          renderItemCell(item, col, row, gridArea);
      });
      gridWrap.appendChild(gridArea);
      stashBody.appendChild(gridWrap);
    }

    // ── List view ──
    function buildListView() {
      stashBody.innerHTML = '';
      const items = stashItems;
      const list = document.createElement('div');
      list.className = 'dh-list-view';
      const rarityOrder = ['Legendary','Extraordinary','Rare','Magic','Common','Inferior'];
      const sorted = [...items].sort((a,b) => rarityOrder.indexOf(a.rarity||'Common') - rarityOrder.indexOf(b.rarity||'Common'));
      for (const item of sorted) {
        const isLeg = !!item.legendaryName;
        const rc    = RARITY_COLOR[item.rarity] || '#aaa';
        const dn    = resolveItemDisplayName(item);
        const row = document.createElement('div');
        const _listReqsMet = itemReqsMet(item, _currentCharData);
        row.className = 'dh-list-row' + (isLeg ? ' dh-list-row--leg' : '') + (!_listReqsMet || item.tomeUsed ? ' dh-list-row--req-unmet' : '');
        const _dispType = getDisplayType(item);
        let _listImgSrc = null;
        let _listImgExtraStyle = '';
        if (item.runeNum) {
          _listImgSrc = './img/runes/' + (RUNE_DATA.img[item.runeNum] || RUNE_DATA.img_legacy[item.runeNum]);
          _listImgExtraStyle = 'filter:drop-shadow(0 0 3px rgba(167,139,250,0.6));';
        } else if (item.gemType && item.gemLevel != null) {
          _listImgSrc = './img/gems/gem_' + item.gemType + '_0' + item.gemLevel + '.png';
        } else if (item.dyeName) {
          _listImgSrc = './img/dyes/' + item.dyeName.toLowerCase().replace(/\s+/g,'_') + '_dye.png';
        } else if (item.heartName) {
          _listImgSrc = './img/cores/core_' + (item.heartRarity||'common').toLowerCase() + '_' + (item.heartElement||'fire').toLowerCase() + '_heart.png';
        } else if (isLeg && LEG_IMAGES[item.legendaryName]) {
          _listImgSrc = 'img/items/' + LEG_IMAGES[item.legendaryName];
        } else {
          _listImgSrc = nonLegImgPath(item);
        }
        if (_listImgSrc) {
          const lImg = document.createElement('img');
          lImg.src = _listImgSrc;
          lImg.alt = dn;
          lImg.className = 'dh-list-img';
          if (_listImgExtraStyle) lImg.style.cssText = _listImgExtraStyle;
          lImg.onerror = () => { lImg.style.display='none'; };
          row.appendChild(lImg);
        }
        const rowText = document.createElement('div');
        rowText.className = 'dh-list-text';
        const _listSC = Math.max(item.socketCount || 0, (item.socketed||[]).length);
        const _listHasUniq = (item.socketSlots||[]).some(s => s === 'unique');
        const _listSockBadge = _listSC > 0
          ? ' <span class="tip-sock-badge' + (_listHasUniq ? ' tip-sock-badge--gold' : '') + '">' + _listSC + '</span>'
          : '';
        rowText.innerHTML =
          '<div class="dh-list-name" style="font-weight:' + (isLeg?'700':'500') + ';color:' + (item.runeNum?'#a78bfa':isLeg?'#d4906a':rc) + ';">' + esc(dn) + _listSockBadge + '</div>' +
          '<div class="dh-list-meta">' +
            (item.rarity||'') + (_dispType ? (item.rarity ? ' · ' : '') + esc(_dispType) : '') +
            (item.level ? ' · iLv '+item.level : '') +
          '</div>';
        row.appendChild(rowText);
        row.addEventListener('mouseenter', e => showItemTip(item, e.clientX, e.clientY));
        row.addEventListener('mouseleave', () => hideTip());
        if (item.favourite) row.insertAdjacentHTML('beforeend', _BOOKMARK_SVG_SM);
        list.appendChild(row);
      }
      if (!items.length) {
        const empty = document.createElement('div');
        empty.className = 'dh-stash-empty';
        empty.textContent = 'Empty';
        list.appendChild(empty);
      }
      stashBody.appendChild(list);
    }

    function rebuild() {
      if (stashViewMode === 'list') buildListView(); else buildGridView();
    }

    toggleBtn.removeAttribute('title');
    const _toggleTip = () => stashViewMode === 'list' ? 'Switch to grid view' : 'Switch to list view';
    toggleBtn.addEventListener('mouseenter', e => showStatTip(_toggleTip(), e.clientX, e.clientY));
    toggleBtn.addEventListener('mousemove',  e => moveStatTip(e.clientX, e.clientY));
    toggleBtn.addEventListener('mouseleave', () => hideStatTip());

    // ── Toggle handler ──
    toggleBtn.addEventListener('click', () => {
      stashViewMode = stashViewMode === 'list' ? 'grid' : 'list';
      setStashView(stashViewMode);
      toggleBtn.innerHTML = stashViewMode === 'list' ? SVG_GRID : SVG_LIST;
      applyStashPanelStyle();
      rebuild();
    });

    rebuild();

    panelsRow.appendChild(stashPanel);

    outerWrap.appendChild(panelsRow);


    // ── Bottom row: Skills (full width) then Kill Log below ─────────────────
    const skillBranches = data.skillBranches || [];
    const skillLevels   = data.skillLevels   || [];
    const skillOptions  = data.skillOptions  || [];
    const killLog       = data.killLog       || [];
    const hasSkills     = skillLevels.length > 0 || skillOptions.length > 0 || skillBranches.length > 0;
    const hasKillLog    = killLog.length > 0 || data.kills > 0;

    if (hasSkills || hasKillLog) {
      const bottomCol = document.createElement('div');
      bottomCol.className = 'dh-bottom-col';

      // ── Skills panel (full width) ──────────────────────────────────────────
      if (hasSkills) {
        const skillsWrap = document.createElement('div');
        skillsWrap.className = 'dh-panel-skills';

        // ─────────────────────────────────────────────────────────────────────
        // Skills panel — 3-column branch layout, ALL skills/upgrades with tooltips
        // ─────────────────────────────────────────────────────────────────────
        const globalSkBonus    = (data.stats && data.stats.skillLevelBonus)  || 0;
        const glyphChanceBonus = (data.stats && data.stats.glyphChanceBonus) || 0;

        // ── Skill branch / upgrade definitions — edit skills.js, not here ────
        const BRANCH_DEF = SKILLS_DEF;

        // Build quick lookup from raw skill name → save data
        const skByRaw = {};
        for (const sk of skillLevels) skByRaw[sk.skill] = sk;

        // Build option lookup: prefix-match options to their parent skill
        function stripSkPrefix(optName, skillRaw) {
          let n = optName.replace(/^Witch\s+/, '');
          const skShort = skillRaw.replace(/^Witch\s+/, '');
          n = n.replace(new RegExp('^' + skShort.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\s*'), '');
          return n.trim() || optName;
        }
        // Build proto→upgrade map for GUID-based matching (Issue 5 fix)
        const protoToUpg = {};  // proto GUID → { skillRaw, upgName }
        for (const br of BRANCH_DEF) for (const sk of br.skills) {
          for (const upg of sk.upgrades) {
            if (upg.proto) protoToUpg[upg.proto] = { skillRaw: sk.raw, upgName: upg.name };
          }
        }

        const optsBySkill = {};
        for (const opt of skillOptions) {
          let bestSkill = null, resolvedName = null;

          // Try proto-based match first (most reliable)
          if (opt.proto && protoToUpg[opt.proto]) {
            bestSkill    = protoToUpg[opt.proto].skillRaw;
            resolvedName = protoToUpg[opt.proto].upgName;
          }

          // Fallback: name-prefix match
          if (!bestSkill) {
            let bestLen = 0;
            for (const br of BRANCH_DEF) for (const sk of br.skills) {
              if (opt.option.startsWith(sk.raw) && sk.raw.length > bestLen) { bestSkill = sk.raw; bestLen = sk.raw.length; }
            }
            if (!bestSkill) {
              const optShort = opt.option.replace(/^Witch\s+/,'');
              for (const br of BRANCH_DEF) for (const sk of br.skills) {
                const skShort = sk.raw.replace(/^Witch\s+/,'');
                if (optShort.startsWith(skShort) && skShort.length > bestLen) { bestSkill = sk.raw; bestLen = skShort.length; }
              }
            }
          }

          if (bestSkill) {
            if (!optsBySkill[bestSkill]) optsBySkill[bestSkill] = {};
            const dn = resolvedName || stripSkPrefix(opt.option, bestSkill);
            optsBySkill[bestSkill][dn] = opt.level;
          }
        }

        const activeBranchNames = new Set(skillBranches.map(b => b.name));

        // ── Tooltip system ────────────────────────────────────────────────────
        let _skTip = null;
        function ensureSkTip() {
          if (_skTip) return _skTip;
          _skTip = document.createElement('div');
          _skTip.className = 'dh-sk-tip';
          document.body.appendChild(_skTip);
          document.addEventListener('mousemove', e => {
            if (!_skTip || _skTip.style.display==='none') return;
            const x = e.clientX + 18, y = e.clientY - 10;
            const right = x + 310 > window.innerWidth;
            _skTip.style.left = (right ? e.clientX - 320 : x) + 'px';
            _skTip.style.top  = Math.max(4, y) + 'px';
          });
          return _skTip;
        }
        function showSkTip(html, x, y) {
          const tip = ensureSkTip();
          tip.innerHTML = html;
          tip.style.display = 'block';
          tip.style.left = (x+18)+'px';
          tip.style.top  = Math.max(4, y-10)+'px';
        }
        function hideSkTip() { if (_skTip) _skTip.style.display='none'; }

        const DMG_COL = {Shadow:'#9d6aff',Physical:'#e0c060',Fire:'#ff7d44',Lightning:'#55aaff'};

        // ── Header ────────────────────────────────────────────────────────────
        const skillsHdr = document.createElement('div');
        skillsHdr.className = 'dh-skills-hdr';
        skillsHdr.style.cursor = 'pointer';
        skillsHdr.innerHTML =
          '<span class="dh-skills-hdr-label">Skills</span>' +
          '<span class="dh-skills-hdr-count">' + skillLevels.length + ' active</span>' +
          '<span class="dh-skills-hdr-right">' +
            (globalSkBonus > 0
              ? '<span class="dh-sk-global-bonus">✦ +' + globalSkBonus + ' to all skills from items</span>'
              : '') +
          '</span>';

        const _skillsToggle = makePanelToggle(getPanelCollapsed('skills'));
        skillsHdr.querySelector('.dh-skills-hdr-right').appendChild(_skillsToggle);
        skillsWrap.appendChild(skillsHdr);

        const skillsBody = document.createElement('div');
        skillsBody.className = 'dh-skills-body';
        if (getPanelCollapsed('skills')) skillsBody.style.display = 'none';

        skillsHdr.addEventListener('click', () => {
          const now = skillsBody.style.display === 'none';
          skillsBody.style.display = now ? '' : 'none';
          setPanelCollapsed('skills', !now);
          _skillsToggle.classList.toggle('dh-panel-toggle--collapsed', !now);
        });

        // ── Skills: flat 3-column grid so all cards in same row share equal height ─
        // Layout: row0=branch headers, row1=first skill, row2=second skill
        const branchGrid = document.createElement('div');
        branchGrid.className = 'dh-branch-grid';

        // Branch header color config
        const BRANCH_STYLES = {
          'Blood & Bone': { active: 'linear-gradient(135deg,rgba(180,20,20,0.7),rgba(100,10,10,0.5))',
                            inactive: 'linear-gradient(135deg,rgba(60,10,10,0.4),rgba(40,5,5,0.3))',
                            border: 'rgba(180,30,30,0.4)', borderI: 'rgba(100,20,20,0.2)' },
          'Glyph':        { active: 'linear-gradient(135deg,rgba(20,60,180,0.7),rgba(10,30,100,0.5))',
                            inactive: 'linear-gradient(135deg,rgba(10,25,65,0.4),rgba(5,15,45,0.3))',
                            border: 'rgba(40,80,200,0.45)', borderI: 'rgba(15,40,100,0.2)' },
          'Shadow':       { active: 'linear-gradient(135deg,rgba(80,20,160,0.7),rgba(40,10,90,0.5))',
                            inactive: 'linear-gradient(135deg,rgba(30,10,60,0.4),rgba(15,5,35,0.3))',
                            border: 'rgba(120,40,200,0.45)', borderI: 'rgba(50,15,90,0.2)' },
        };

        // Pass 1: headers row
        for (const branch of BRANCH_DEF) {
          const isBranchActive = [...activeBranchNames].some(n => n.includes(branch.match));
          const bStyle = BRANCH_STYLES[branch.key] || BRANCH_STYLES['Shadow'];
          const bHdr = document.createElement('div');
          bHdr.className = 'dh-branch-hdr';
          bHdr.style.cssText =
            'background:' + (isBranchActive ? bStyle.active : bStyle.inactive) + ';' +
            'border:1px solid ' + (isBranchActive ? bStyle.border : bStyle.borderI) + ';' +
            (isBranchActive ? 'color:#ffffff;text-shadow:0 1px 4px rgba(0,0,0,0.8);' : 'color:rgba(255,255,255,0.2);');
          bHdr.textContent = branch.key;
          branchGrid.appendChild(bHdr);
        }

        // Pass 2: card rows — emit all row-0 cards, then all row-1 cards
        // so grid auto-places them correctly across columns row by row
        for (let row = 0; row < 2; row++) {
          for (const branch of BRANCH_DEF) {
            const isBranchActive = [...activeBranchNames].some(n => n.includes(branch.match));
            const skDef = branch.skills[row];
            if (!skDef) {
              // empty placeholder to keep grid alignment
              branchGrid.appendChild(document.createElement('div'));
              continue;
            }

            const skData    = skByRaw[skDef.raw];
            const isActive  = !!skData;
            const opts      = optsBySkill[skDef.raw] || {};
            const tomeBonus = isActive ? (skData.tomeBonus || 0) : 0;
            const totalLv   = isActive ? skData.level + tomeBonus + globalSkBonus : 0;
            const bonusParts = [];
            if (tomeBonus > 0)     bonusParts.push(`+${tomeBonus} tome`);
            if (globalSkBonus > 0) bonusParts.push(`+${globalSkBonus} ring`);

            const card = document.createElement('div');
            card.className = 'dh-sk-card' +
              (row === 0 ? ' dh-sk-card--row0' : '') +
              (isActive ? ' dh-sk-card--active' : ' dh-sk-card--inactive');

            // ── Icon + name row ───────────────────────────────────────────
            const topRow = document.createElement('div');
            topRow.className = 'dh-sk-top-row';

            const iconWrap = document.createElement('div');
            iconWrap.className = 'dh-sk-icon-wrap';
            const iconBox = document.createElement('div');
            iconBox.className = 'dh-sk-icon-box ' + (isActive ? 'dh-sk-icon-box--active' : 'dh-sk-icon-box--inactive');
            const img = document.createElement('img');
            img.src = skDef.icon; img.alt = skDef.display;
            if (!isActive) img.className = 'dh-sk-icon-inactive';
            img.onerror = function(){ this.style.display='none'; iconBox.style.background='rgba(0,0,0,0.3)'; };
            iconBox.appendChild(img);
            iconWrap.appendChild(iconBox);
            topRow.appendChild(iconWrap);

            const info = document.createElement('div');
            info.className = 'dh-sk-info';
            const nameRow = document.createElement('div');
            nameRow.className = 'dh-sk-name-row';
            nameRow.innerHTML =
              '<span class="dh-sk-name-txt" style="color:' + (isActive?'#ddd':'#555') + ';">' + esc(skDef.display) + '</span>' +
              (isActive
                ? '<span class="dh-sk-lv-badge" title="' + esc('Base '+skData.level+(bonusParts.length?' · '+bonusParts.join(' · '):'')) + '">Lv&nbsp;' + totalLv + (bonusParts.length?' ★':'') + '</span>'
                : '<span class="dh-sk-locked">Locked</span>');
            info.appendChild(nameRow);
            const tagRow = document.createElement('div');
            tagRow.className = 'dh-sk-tag-row';
            tagRow.innerHTML =
              '<span class="dh-sk-tag-dmg" style="color:' + (isActive?(DMG_COL[skDef.dmg]||'#888'):'#444') + ';">' + skDef.dmg + '</span>' +
              (skDef.cost !== '—' ? '<span class="dh-sk-tag-cost" style="color:' + (isActive?'#5599cc':'#3a3a3a') + ';">· ' + skDef.cost + '</span>' : '') +
              '<span class="dh-sk-tag-type" style="color:' + (isActive?'#666':'#333') + ';">· ' + skDef.tag + '</span>';
            info.appendChild(tagRow);
            topRow.appendChild(info);
            card.appendChild(topRow);

            // ── Skill tooltip ──────────────────────────────────────────────
            const skTipHtml =
              '<div class="sk-tip-name" style="color:' + (isActive?'#e8d48a':'#888') + ';">' + esc(skDef.display) + '</div>' +
              '<div class="sk-tip-desc">' + esc(skDef.desc) + '</div>' +
              '<div class="sk-tip-tags">' +
                (skDef.dmg && skDef.dmg !== '—' ? '<span class="sk-tip-tag-dmg" style="color:' + (DMG_COL[skDef.dmg]||'#888') + ';">' + skDef.dmg + '</span>' : '') +
                (skDef.scaling && skDef.scaling !== '—' ? '<span class="sk-tip-tag-cost" style="color:#8899aa;">' + esc(skDef.scaling) + '</span>' : '') +
                (skDef.cost !== '—' ? '<span class="sk-tip-tag-cost">' + skDef.cost + '</span>' : '') +
                (skDef.requires ? '<span class="sk-tip-tag-cost" style="color:#c9a84c;">Requires: ' + esc(skDef.requires) + '</span>' : '') +
              '</div>' +
              (isActive
                ? '<div class="sk-tip-level">Level ' + skData.level +
                  (tomeBonus>0?' <span class="sk-tip-bonus">+' + tomeBonus + ' tome</span>':'') +
                  (globalSkBonus>0?' <span class="sk-tip-bonus">+' + globalSkBonus + ' ring</span>':'') +
                  ' <span class="sk-tip-total">= Total Lv ' + totalLv + '</span></div>'
                : '<div class="sk-tip-inactive">Not unlocked</div>');
            card.addEventListener('mouseleave', hideSkTip);
            topRow.addEventListener('mouseenter', e => showSkTip(skTipHtml, e.clientX, e.clientY));

            // ── Upgrades: 2-column pill grid ──────────────────────────────
            const optsDiv = document.createElement('div');
            optsDiv.className = 'dh-sk-opts';

            for (const upg of skDef.upgrades) {
              const upgLv    = opts[upg.name] || 0;
              const isUActive= upgLv > 0;
              const isFull   = isUActive && upgLv >= upg.max;

              const nameColor = isFull ? '#c9a84c' : isUActive ? '#ccc' : '#444';
              const lvColor   = isFull ? '#c9a84c' : isUActive ? '#6688ee' : '#333';

              const optRow = document.createElement('div');
              optRow.className = 'dh-upg-pill ' + (isFull ? 'dh-upg-pill--full' : isUActive ? 'dh-upg-pill--active' : 'dh-upg-pill--inactive');
              const _upgImgSlug = upg.name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
              const _upgImgSrc = `./img/skills/skill_option_${_upgImgSlug}.png`;
              const _imgTint   = isUActive ? 'filter:none;opacity:0.9' : 'filter:grayscale(1);opacity:0.3';
              optRow.innerHTML =
                `<img src="${_upgImgSrc}" width="14" height="14" style="flex-shrink:0;${_imgTint};object-fit:contain;image-rendering:crisp-edges;" onerror="this.style.display='none'">` +
                `<span class="dh-upg-name" style="color:${nameColor};font-weight:${isUActive?600:400};">${esc(upg.name)}</span>` +
                `<span class="dh-upg-lv" style="color:${lvColor};font-weight:${isFull?700:400};">${isUActive?upgLv+'/'+upg.max:'—/'+upg.max}</span>`;

              // Upgrade tooltip
              const _upgDesc = upg.levels
                ? (upgLv > 0 ? (upg.levels[upgLv-1] || upg.levels[upg.levels.length-1]) : upg.levels[0])
                : (upg.desc || '');
              // Conditional glyph bonus: only shown when an equipped item grants glyph chance %
              let _glyphBonusHtml = '';
              if (upg.glyphBonus && glyphChanceBonus > 0 && upg.glyphBases) {
                const _baseIdx  = Math.max(0, (upgLv > 0 ? upgLv : 1) - 1);
                const _basePct  = upg.glyphBases[Math.min(_baseIdx, upg.glyphBases.length - 1)];
                const _bonus    = Math.round(glyphChanceBonus * _basePct) / 100;
                _glyphBonusHtml = `<div class="upg-tip-glyph-bonus">+${_bonus.toFixed(1)}% from equipped items</div>`;
              }
              // Upgrade tooltip — image top-right via buildTipImg
              const _upgImgSrcFull = `./img/skills/skill_option_${_upgImgSlug}.png`;
              const _upgTipContent =
                `<div class="upg-tip-name" style="color:${isUActive?'#e8d48a':'#666'};">${esc(upg.name)}</div>` +
                `<div class="upg-tip-desc">${esc(_upgDesc)}</div>` +
                _glyphBonusHtml +
                (isUActive
                  ? `<div class="upg-tip-level" style="color:#c44a30;">Level ${upgLv} / ${upg.max}${isFull?' <span class="sk-tip-bonus">★ MAX</span>':''}</div>`
                  : `<div class="upg-tip-level" style="color:#555;">Not unlocked · Max: ${upg.max}</div>`);
              const upgTipHtml = buildTipImg(
                _upgImgSrcFull,
                _upgTipContent,
                'tip-img--sm',
                isUActive ? '' : 'filter:grayscale(1);opacity:0.35;'
              );
              optRow.addEventListener('mouseenter', e => { e.stopPropagation(); showSkTip(upgTipHtml, e.clientX, e.clientY); });
              optRow.addEventListener('mouseleave', () => { hideSkTip(); });

              optsDiv.appendChild(optRow);
            }
            card.appendChild(optsDiv);
            branchGrid.appendChild(card);
          }
        }

        skillsBody.appendChild(branchGrid);
        skillsWrap.appendChild(skillsBody);
        bottomCol.appendChild(skillsWrap);
      }
      // ── Tattoo panel (rune garment slots) ─────────────────────────────────
      const tattoos = data.tattoos || [];
      if (tattoos.length > 0) {
        // Rune image filenames and effect text sourced from RUNE_DATA in rune_recipes.js
        // Ash=1, Bat=2, Ka=3, Deb=4, Elm=5

        const tattooBySlot = {};
        for (const t of tattoos) tattooBySlot[t.slot] = t;
        const filledCount = Object.values(tattooBySlot).filter(t => t.runeName || t.runeTypeName).length;

        const tattooWrap = document.createElement('div');
        tattooWrap.className = 'dh-panel-tattoo';

        // Header
        const tattooHdr = document.createElement('div');
        tattooHdr.className = 'dh-tattoo-hdr';
        tattooHdr.style.cursor = 'pointer';
        tattooHdr.innerHTML =
          '<span class="dh-tattoo-hdr-label">Tattoos</span>' +
          '<span class="dh-tattoo-hdr-count">' + filledCount + ' / 13</span>';

        const _tattooToggle = makePanelToggle(getPanelCollapsed('tattoos'));
        tattooHdr.appendChild(_tattooToggle);
        tattooWrap.appendChild(tattooHdr);

        const tattooBodyWrap = document.createElement('div');
        tattooBodyWrap.className = 'dh-tattoo-body-wrap';
        if (getPanelCollapsed('tattoos')) tattooBodyWrap.style.display = 'none';

        tattooHdr.addEventListener('click', () => {
          const now = tattooBodyWrap.style.display === 'none';
          tattooBodyWrap.style.display = now ? '' : 'none';
          setPanelCollapsed('tattoos', !now);
          _tattooToggle.classList.toggle('dh-panel-toggle--collapsed', !now);
        });

        // ── 3-column flex layout ─────────────────────────────────────────────
        // Paperdoll is mirrored: visual LEFT col = character's RIGHT side, visual RIGHT col = character's LEFT
        // Left col (visual left, character's right): Right Shoulder/Arm/Thigh/Calf
        // Centre col: Crown, Heart, Core, Back, Sacra
        // Right col (visual right, character's left): Left Shoulder/Arm/Thigh/Calf
        const COL_SLOTS = [
          ['Right Shoulder', 'Right Arm', 'Right Thigh', 'Right Calf'],
          ['Crown', 'Heart', 'Core', 'Back', 'Sacra'],
          ['Left Shoulder', 'Left Arm', 'Left Thigh', 'Left Calf'],
        ];
        // Abbreviated labels shown in the pill
        const SLOT_SHORT = {
          'Crown':'Crown', 'Heart':'Heart', 'Core':'Core', 'Back':'Back', 'Sacra':'Sacra',
          'Left Shoulder':'L Shoulder', 'Left Arm':'L Arm', 'Left Thigh':'L Thigh', 'Left Calf':'L Calf',
          'Right Shoulder':'R Shoulder','Right Arm':'R Arm', 'Right Thigh':'R Thigh','Right Calf':'R Calf',
        };

        // Helper: build one slot pill
        function makeTattooPill(slotName) {
          const rune     = tattooBySlot[slotName];
          const runeNum  = rune?.runeNum;
          const runeName = rune?.runeName;
          const imgFileNew = runeNum ? RUNE_DATA.img[runeNum]        : null;
          const imgFileOld = runeNum ? RUNE_DATA.img_legacy[runeNum] : null;
          const filled   = !!(runeName || rune?.runeTypeName);

          const pill = document.createElement('div');
          pill.className = 'dh-tattoo-pill ' + (filled ? 'dh-tattoo-pill--filled' : 'dh-tattoo-pill--empty');

          // ── Rune image slot ──
          const slot = document.createElement('div');
          slot.className = 'dh-tattoo-slot-box ' + (filled ? 'dh-tattoo-slot-box--filled' : 'dh-tattoo-slot-box--empty');
          if (imgFileNew || imgFileOld) {
            const img = document.createElement('img');
            img.alt = runeName || '';
            img.className = 'dh-tattoo-slot-img';
            img.src = './img/runes/' + (imgFileNew || imgFileOld);
            if (imgFileNew && imgFileOld) {
              img.onerror = () => { img.src = './img/runes/' + imgFileOld; img.onerror = () => { img.style.display='none'; }; };
            } else {
              img.onerror = () => { img.style.display = 'none'; };
            }
            slot.appendChild(img);
          }
          pill.appendChild(slot);

          // ── Text ──
          const txt = document.createElement('div');
          txt.className = 'dh-tattoo-txt';

          // Slot label (always shown)
          const slotSpan = document.createElement('div');
          slotSpan.className = 'dh-tattoo-slot-lbl';
          slotSpan.textContent = SLOT_SHORT[slotName] || slotName;
          txt.appendChild(slotSpan);

          if (filled) {
            // Rune name ("Ka Rune", "Elm Rune", etc.)
            if (runeName) {
              const runeNameEl = document.createElement('div');
              runeNameEl.className = 'dh-tattoo-rune-name';
              runeNameEl.textContent = runeName;
              txt.appendChild(runeNameEl);
            }
            // Skill effect name
            if (rune?.runeTypeName) {
              const nameEl = document.createElement('div');
              nameEl.className = 'dh-tattoo-rune-type';
              nameEl.textContent = rune.runeTypeName;
              txt.appendChild(nameEl);
            }
            if (rune?.level != null) {
              const lvEl = document.createElement('div');
              lvEl.className = 'dh-tattoo-rune-lv';
              lvEl.textContent = 'iLv ' + rune.level;
              txt.appendChild(lvEl);
            }
          } else {
            const emEl = document.createElement('div');
            emEl.className = 'dh-tattoo-empty-dash';
            emEl.textContent = '—';
            txt.appendChild(emEl);
          }
          pill.appendChild(txt);

          if (filled) {
            pill.addEventListener('mouseenter', e => {
              pill.style.filter = 'brightness(1.18)';
              pill.style.boxShadow = '0 2px 12px rgba(147,112,219,0.25)';
              const tipTattooLine = runeNum && RUNE_DATA.tattoo_effect[runeNum]
                ? [{ text:'Tattoo effect:', color:'rgba(255,255,255,0.35)', _header:true },
                   { text: RUNE_DATA.tattoo_effect[runeNum], color:'#a78bfa' }]
                : [];
              const tipData = Object.assign({}, rune, {
                rarity: null,
                displayName: runeName || slotName,
                typeDisplay: rune?.runeTypeName || null,
                affixLines: [...tipTattooLine],
              });
              showItemTip(tipData, e.clientX, e.clientY);
            });
            pill.addEventListener('mouseleave', () => { pill.style.filter=''; pill.style.boxShadow=''; hideTip(); });
          }
          return pill;
        }

        // Body columns
        const bodyRow = document.createElement('div');
        bodyRow.className = 'dh-tattoo-body';

        COL_SLOTS.forEach((slots, ci) => {
          const col = document.createElement('div');
          col.className = 'dh-tattoo-col';

          const pillsWrap = document.createElement('div');
          pillsWrap.className = 'dh-tattoo-pills ' + (ci === 1 ? 'dh-tattoo-pills--center' : 'dh-tattoo-pills--side');

          for (const slotName of slots) {
            pillsWrap.appendChild(makeTattooPill(slotName));
          }
          col.appendChild(pillsWrap);
          bodyRow.appendChild(col);
        });

        tattooBodyWrap.appendChild(bodyRow);
        tattooWrap.appendChild(tattooBodyWrap);
        bottomCol.appendChild(tattooWrap);
      }

      // ── Kill Log panel (below skills, 10 entries max, scrollable) ──────────
      if (hasKillLog) {
        const RARITY_KILL_COLORS = {
          'Named':            '#fbbf24',
          'Unique':           '#d4a84b',
          'Boss':             '#f87171',
          'Champion':         '#c084fc',
          'Champion Minion':  '#a855f7',
          'Elite':            '#60a5fa',
          'Normal':           '#9ca3af',
        };

        const killWrap = document.createElement('div');
        killWrap.className = 'dh-panel-kill';

        // Collapse state — persisted in localStorage
        let _killCollapsed = getPanelCollapsed('kill');

        const killHdr = document.createElement('div');
        killHdr.className = 'dh-kill-hdr';
        const _killToggleBtn = makePanelToggle(_killCollapsed);
        _killToggleBtn.id = 'kill-toggle';
        killHdr.innerHTML =
          '<span>Kill Log</span>' +
          '<span class="dh-kill-hdr-kills">' + (data.kills || 0).toLocaleString() + ' kills</span>' +
          '<span class="dh-kill-hdr-dot">&#xB7;</span>' +
          '<span class="dh-kill-hdr-deaths">' + (data.deaths || 0) + ' deaths</span>';
        killHdr.appendChild(_killToggleBtn);
        killWrap.appendChild(killHdr);

        // Collapsible body wrapper
        const killBody = document.createElement('div');
        killBody.className = 'dh-kill-body';
        if (_killCollapsed) killBody.style.display = 'none';

        if (killLog.length > 0) {
          // ── Sort state ──
          let _killSortCol = 'count'; // 'name' | 'rarity' | 'count'
          let _killSortDir = -1;      // -1 = desc, 1 = asc

          const RARITY_ORDER = { Named:0, Unique:1, Boss:2, Champion:3, 'Champion Minion':4, Elite:5, Normal:6 };

          function sortedKillLog() {
            return [...killLog].sort((a, b) => {
              let cmp = 0;
              if (_killSortCol === 'name') {
                cmp = (a.name||'').localeCompare(b.name||'');
              } else if (_killSortCol === 'rarity') {
                cmp = (RARITY_ORDER[a.rarity]??99) - (RARITY_ORDER[b.rarity]??99);
              } else {
                cmp = (a.count||0) - (b.count||0);
              }
              return cmp * _killSortDir;
            });
          }

          // Column header row
          const tblHdr = document.createElement('div');
          tblHdr.className = 'dh-kill-tbl-hdr';

          function makeSortHdr(label, col, align) {
            const span = document.createElement('span');
            span.className = 'dh-kill-sort-hdr' + (align === 'right' ? ' dh-kill-sort-hdr--right' : '');
            span.style.color = 'rgba(255,255,255,0.25)';
            const updateHdr = () => {
              const active = _killSortCol === col;
              span.style.color = active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)';
              span.innerHTML = esc(label) +
                '<span class="dh-kill-sort-arrow">' +
                (active ? (_killSortDir === -1 ? '↓' : '↑') : '⇅') +
                '</span>';
            };
            updateHdr();
            span.addEventListener('mouseenter', () => { if (_killSortCol !== col) span.style.color = 'rgba(255,255,255,0.5)'; });
            span.addEventListener('mouseleave', () => { if (_killSortCol !== col) span.style.color = 'rgba(255,255,255,0.25)'; });
            span.addEventListener('click', () => {
              if (_killSortCol === col) _killSortDir *= -1;
              else { _killSortCol = col; _killSortDir = col === 'name' ? 1 : -1; }
              tblHdr.querySelectorAll('[data-kill-hdr]').forEach(s => s._updateHdr && s._updateHdr());
              rebuildRows();
            });
            span.dataset.killHdr = col;
            span._updateHdr = updateHdr;
            return span;
          }

          tblHdr.style.cssText = 'display:grid;grid-template-columns:1fr 130px 56px;width:100%;box-sizing:border-box;';
          tblHdr.appendChild(makeSortHdr('Monster', 'name', 'left'));
          tblHdr.appendChild(makeSortHdr('Rarity',  'rarity', 'left'));
          tblHdr.appendChild(makeSortHdr('Count',   'count', 'right'));
          killBody.appendChild(tblHdr);

          // Scrollable body — no row cap, scrollable container
          const ROW_H = 26;
          const MAX_VISIBLE = 12;
          const tblBody = document.createElement('div');
          tblBody.className = 'dh-kill-tbl-body';
          tblBody.style.maxHeight = (ROW_H * MAX_VISIBLE) + 'px';
          tblBody.style.overflowY = 'auto';

          function rebuildRows() {
            tblBody.innerHTML = '';
            const entries = sortedKillLog();
            entries.forEach((entry, idx) => {
              const rc = RARITY_KILL_COLORS[entry.rarity] || RARITY_KILL_COLORS['Normal'];
              const row = document.createElement('div');
              const isLast = idx === entries.length - 1;
              row.className = 'dh-kill-row' + (isLast ? ' dh-kill-row--last' : '');
              row.style.cssText = 'display:grid;grid-template-columns:1fr 130px 56px;width:100%;box-sizing:border-box;';
              row.innerHTML =
                '<span class="dh-kill-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;">' + esc(entry.name) + '</span>' +
                '<span class="dh-kill-rarity" style="color:' + rc + ';white-space:nowrap;">' + esc(entry.rarity || '–') + '</span>' +
                '<span class="dh-kill-count" style="white-space:nowrap;">' + entry.count.toLocaleString() + '</span>';
              row.addEventListener('mouseenter', () => row.style.background = 'rgba(255,255,255,0.035)');
              row.addEventListener('mouseleave', () => row.style.background = '');
              tblBody.appendChild(row);
            });
          }
          rebuildRows();
          killBody.appendChild(tblBody);
        } else {
          const noKills = document.createElement('div');
          noKills.className = 'dh-kill-empty';
          noKills.textContent = 'No per-enemy kill data available.';
          killBody.appendChild(noKills);
        }

        killWrap.appendChild(killBody);

        // Toggle click handler
        killHdr.addEventListener('click', () => {
          _killCollapsed = !_killCollapsed;
          setPanelCollapsed('kill', _killCollapsed);
          killBody.style.display = _killCollapsed ? 'none' : 'flex';
          _killToggleBtn.classList.toggle('dh-panel-toggle--collapsed', _killCollapsed);
        });

        bottomCol.appendChild(killWrap);
      }


         outerWrap.appendChild(bottomCol);
    }

    elEquip.appendChild(outerWrap);
  }
  // ── Utility ───────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s??'')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  // Format numbers ≥1000 with comma separators: 97331 → "97,331"
  function fmtNum(n) {
    const v = typeof n === 'number' ? Math.round(n) : parseInt(n, 10);
    if (isNaN(v)) return String(n ?? '');
    return v.toLocaleString('en-US');
  }
  // ── Non-legendary item image path helper ──────────────────────────────────
  // Convention: img/items/{r}_{t}_{slug}.png
  //   r = c(ommon) | m(agic) | r(are)   — Legendary handled separately via LEG_IMAGES
  //   t = a(rmor) | w(eapon) | s(hield) | t(ool)
  //   slug = name lowercased, non-alphanum → underscore
  function nonLegImgPath(item) {
    if (!item || item.legendaryName) return null;

    const name    = (item.name    || '').trim();
    const nameLow = name.toLowerCase();

    // ── Tomes ────────────────────────────────────────────────────────────────
    // Attribute tomes each have their own png (I and II share the same image)
    // All skill/talent tomes share a single "tome_of_skill.png"
    if (item.slot === 'tome' || nameLow.startsWith('tome ') || nameLow.includes(' tome')) {
      // Strip level suffix " I" / " II" for image lookup
      const ATTR_TOMES = {
        'tome of agility': 'tome_of_agility',
        'tome of might':   'tome_of_might',
        'tome of power':   'tome_of_power',
        'tome of vigor':   'tome_of_vigor',
      };
      const nameNoLvl = nameLow.replace(/\s+(i|ii)\s*$/, '').trim();
      if (ATTR_TOMES[nameNoLvl]) return 'img/tomes/' + ATTR_TOMES[nameNoLvl] + '.png';
      // All other tomes (skill / talent tomes) share one image
      return 'img/tomes/tome_of_skill.png';
    }

    // ── Build slug: lowercase, strip apostrophes, spaces/punctuation → underscore ──
    function toSlug(s) {
      return s.toLowerCase()
              .replace(/'/g, '')         // remove apostrophes (Tyrant's → tyrants)
              .replace(/[^a-z0-9]+/g, '_')
              .replace(/^_|_$/g, '');
    }

    // ── Determine type prefix (armor / weapon / shield / jewelry) ───────────
    const TYPE_CHAR = {
      chest:'a', head:'a', hands:'a', feet:'a', waist:'a', belt:'a', gloves:'a', boots:'a',
      mainhand:'w', hand_right:'w', twohand:'w',
      offhand:'s', hand_left:'s',
      tool:'t',
      // Jewelry (including flask, rings, tomes) — use item name slug
      neck:'j', finger_1:'j', finger_2:'j', flask:'j', ring:'j', tome:'j',
    };
    // Alt weapon slots (rows 3+4 of paperdoll) can hold any weapon type (dual-wield, swap sets).
    // Reuse inferSlotFromName so poignard/bodkin/claw/etc. all resolve correctly without
    // duplicating the weapon-name regex here.
    let t = TYPE_CHAR[item.slot];
    if (t === undefined) {
      const _inferred = inferSlotFromName(name) || inferSlotFromName(item.typeDisplay || '');
      t = TYPE_CHAR[_inferred] ?? 'a';
    }

    // ── Jewelry: use item name slug (Rotgut → j_rotgut, Amulet Jade → j_amulet_jade) ──
    // No slot-based override — the old "flask" fallback was wrong for named flasks
    const slug = toSlug(name);
    if (!slug) return null;

    // Drop rarity prefix — all rarities share the same image file.
    // Legendary keeps its own l_ path (handled before this call).
    return 'img/items/' + t + '_' + slug + '.png';
  }

    
  // Wrap contentHtml with a top-right floating image (used in all item + upgrade tooltips).
  // Returns the original contentHtml unchanged if imgSrc is falsy.
  function buildTipImg(imgSrc, contentHtml, imgClass, imgStyle) {
    if (!imgSrc) return contentHtml;
    const cls = imgClass || 'tip-img--lg';
    const styleAttr = imgStyle ? ` style="${imgStyle}"` : '';
    return `<div class="tip-img-wrap">` +
           `<div class="tip-img-content">${contentHtml}</div>` +
           `<img src="${imgSrc}" class="${cls}"${styleAttr} onerror="this.style.display='none'">` +
           `</div>`;
  }
});
