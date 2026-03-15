// app.js
document.addEventListener('DOMContentLoaded', () => {

  // ── DOM refs ──────────────────────────────────────────────────────────────
  // folderInput replaced by showDirectoryPicker()
  const openFolderBtn  = document.getElementById('open-folder-btn');
  const fileListEl     = document.getElementById('file-list');
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
    legendary: 'dh_collapsed_legendary',
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
    localStorage.setItem('dh_limitEnabled', '1');
    localStorage.setItem('dh_limitCount', '20');
    if (limitToggle)  { limitToggle.checked = true; limitEnabled = true; }
    if (limitSpinner) { limitSpinner.value = 20; limitSpinner.disabled = false; limitSpinner.classList.remove('limit-spinner--dim'); limitCount = 20; }
    const dv = document.getElementById('detail-view');
    if (dv) dv.classList.remove('active');
  };

  // ── On load: try to restore the last folder handle ────────────────────────
  (async function tryRestoreFolder() {
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
        // Store folder name for display
        openFolderBtn.title = '';
      }
    } catch(e) { console.warn('[restore folder]', e); }
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
    _activeFolderHandle = dirHandle;

    // Remove locked files so they don't appear as broken cards
    if (_lockedFiles.size > 0) {
      loadedFiles = loadedFiles.filter(f => !_lockedFiles.has(f.name));
    }

    renderFileList(loadedFiles);

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
  }  // end scanSaveFolder

  openFolderBtn.addEventListener('click', async () => {
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
    let dirHandle;
    try {
      dirHandle = await window.showDirectoryPicker({ mode: 'read', id: 'darkhaven-saves', startIn: 'downloads' });
    } catch (err) {
      if (err.name !== 'AbortError') console.error('[folder picker]', err);
      return;
    }
    await idbSet(IDB_KEY, dirHandle);
    await scanSaveFolder(dirHandle);
  });

  // ── Legendary panel render ────────────────────────────────────────────────
  function renderLegendaryPanel() {
    const existing = document.getElementById('legendary-panel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = 'legendary-panel';
    panel.className = 'dh-leg-panel';

    const _legCollapsed = getPanelCollapsed('legendary');

    // Header
    const totalFound = LEGENDARY_CATALOGUE.filter(e => legCatalogue[e.id].instances.length > 0).length;
    const legHdr = document.createElement('div');
    legHdr.className = 'dh-leg-hdr';
    legHdr.style.cursor = 'pointer';
    legHdr.innerHTML =
      '<span class="dh-leg-icon">⭐</span>' +
      '<h2 class="dh-leg-hdr-title">Legendary Items</h2>' +
      '<span class="dh-leg-hdr-sep">·</span>' +
      '<span class="dh-leg-hdr-count">' + totalFound + ' / ' + LEGENDARY_CATALOGUE.length + ' found in loaded saves</span>' +
      '<span class="dh-leg-hdr-spacer"></span>';
    const _legToggle = makePanelToggle(_legCollapsed);
    legHdr.appendChild(_legToggle);
    panel.appendChild(legHdr);

    const cats = [...new Set(LEGENDARY_CATALOGUE.map(e => e.cat))];

    const legBody = document.createElement('div');
    legBody.className = 'dh-leg-body';
    if (_legCollapsed) legBody.style.display = 'none';
    panel.appendChild(legBody);

    legHdr.addEventListener('click', () => {
      const nowCollapsed = legBody.style.display === 'none';
      legBody.style.display = nowCollapsed ? '' : 'none';
      setPanelCollapsed('legendary', !nowCollapsed);
      _legToggle.classList.toggle('dh-panel-toggle--collapsed', !nowCollapsed);
    });

    const legCatGrid = document.createElement('div');
    legCatGrid.className = 'dh-leg-cat-grid';
    legBody.appendChild(legCatGrid);

    const slotIconMap = {
      Amulet:'📿', Belt:'🔰', Boots:'👟', Chest:'🧥', 'Main Hand':'⚔️',
      Flask:'🧪', Gloves:'🧤', Helm:'🪖', Ring:'💍', 'Off Hand':'🛡️',
    };

    for (const cat of cats) {
      const items = LEGENDARY_CATALOGUE.filter(e => e.cat === cat);
      const section = document.createElement('div');
      section.className = 'dh-leg-section';
      section.innerHTML =
        '<div class="dh-leg-cat-label"><span>' + (CAT_ICON[cat]||'📦') + '</span> ' + cat + '</div>' +
        '<div class="dh-leg-items-grid" id="leg-cat-' + cat + '"></div>';
      legCatGrid.appendChild(section);

      const grid = section.querySelector('#leg-cat-' + cat);
      for (const entry of items) {
        const slot = legCatalogue[entry.id];
        const found = slot.instances.length > 0;
        const best  = found ? slot.instances[0].item : null;
        const imgFile = LEG_IMAGES[entry.id];

        const card = document.createElement('div');
        card.className = 'dh-leg-card ' + (found ? 'dh-leg-card--found' : 'dh-leg-card--missing');

        card.innerHTML =
          '<div class="dh-leg-card-name">' + esc(entry.name) + '</div>' +
          '<div class="dh-leg-card-img-wrap">' +
            (imgFile
              ? '<img src="img/items/' + imgFile + '" alt="' + esc(entry.name) + '" class="dh-leg-card-img" onerror="this.style.display=\'none\'">'
              : '<span style="font-size:1.8rem;opacity:' + (found?'1':'0.3') + ';">' + (slotIconMap[entry.slot]||'⚙️') + '</span>') +
          '</div>' +
          '<div class="dh-leg-card-meta">' +
            (found
              ? 'iLv ' + (best.level||'?') + ' · ' + esc(slot.instances[0].charName) +
                (slot.instances.length > 1 ? '<span class="dh-leg-card-count"> ×' + slot.instances.length + '</span>' : '')
              : 'Not found') +
          '</div>';

        if (found) {
          card.addEventListener('mouseenter', e => showLegTip(entry, slot, e.clientX, e.clientY));
          card.addEventListener('mouseleave', () => hideTip());
        }

        grid.appendChild(card);
      }
    }

    // Append into the outerWrap so it participates in gap:8px like all other panels
    const outerWrapEl = document.querySelector('#equip-container .dh-outer-wrap');
    if (outerWrapEl) {
      outerWrapEl.appendChild(panel);
    } else {
      // Fallback: insert after equip-container
      const equipEl = document.getElementById('equip-container');
      equipEl.parentNode.insertBefore(panel, equipEl.nextSibling);
    }
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
  const _SOCK_RUNE_IMG = {'1':'rune01_ash.png','2':'rune02_bat.png','3':'rune03_ka.png','4':'rune04_deb.png','5':'rune05_elm.png'};
  const _SOCK_RUNE_NAME_TO_NUM = {'ash rune':'1','bat rune':'2','ka rune':'3','deb rune':'4','elm rune':'5'};
  const _SOCK_GEM_LEVEL = {'cracked':'01','flawed':'02','dull':'03'};
  const _SOCK_GEM_TYPES = ['amber','lapis','jade','ruby','opal','onyx'];
  function socketImgSrc(si) {
    if (!si) return null;
    if (si.type === 'rune') {
      const runeNum = _SOCK_RUNE_NAME_TO_NUM[(si.name||'').toLowerCase()];
      return runeNum ? './img/runes/' + _SOCK_RUNE_IMG[runeNum] : null;
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

  // Tooltip for equipment cards (paperdoll)
  function showItemTip(item, x, y) {
    const t = ensureTip();
    const isLeg = !!item.legendaryName;
    const rc = RARITY_COLOR[item.rarity] || '#aaa';
    const dn = resolveItemDisplayName(item);

    // ── Resolve top-right image src ────────────────────────────────────
    let _tipImgSrc = null;
    const _RUNE_IMG = {'1':'rune01_ash.png','2':'rune02_bat.png','3':'rune03_ka.png','4':'rune04_deb.png','5':'rune05_elm.png'};
    const _isJewelrySlot = ['neck','finger_1','finger_2','flask','ring'].includes(item.slot);
    if (item.runeNum && _RUNE_IMG[item.runeNum])
      _tipImgSrc = './img/runes/' + _RUNE_IMG[item.runeNum];
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
    const HEART_RARITY_COLORS_TIP = { Common:'#90ee90', Elite:'#22c55e', Champion:'#84cc16', Unique:'#c9a84c' };
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

    // Wrap header with top-right image via buildTipImg
    let h = buildTipImg(_tipImgSrc, _headerHtml, _tipImgClass);
    // ── Primary stat: armor / damage ───────────────────────────────────
    if (item.damageMin != null) {
      const _dmgElem = item.damageType;
      const ELEM_COLORS_TIP = { Fire:'#f87171', Shadow:'#c084fc', Cold:'#93c5fd', Lightning:'#fde047', Nature:'#86efac' };
      const _dmgCol = (_dmgElem && ELEM_COLORS_TIP[_dmgElem]) ? ELEM_COLORS_TIP[_dmgElem] : '#f8d08a';
      h += '<div class="tip-dmg-row">' +
           '<span class="tip-dmg-icon">⚔</span>' +
           '<span class="tip-dmg-val" style="color:' + _dmgCol + ';">' +
           item.damageMin + '–' + item.damageMax +
           (_dmgElem ? ' <span class="tip-dmg-elem" style="color:' + _dmgCol + ';">(' + esc(_dmgElem) + ')</span>' : '') +
           '</span></div>';
    }
    if (item.armor)
      h += '<div class="tip-armor-row"><span class="tip-armor-icon">🛡</span><span class="tip-armor-val">' + item.armor + ' Armor</span></div>';
    // ── Dye info: palette icon + name + chips ──────────────────────────
    // When the item itself is a dye, name is already the tooltip header — skip it.
    // When an item has a dye applied, show the dye name so the user knows what palette it is.
    if (item.dyeColor) {
      const _dyeDisplayName = resolveDyeName(item);
      const _dyeTokens = (item.dyeColors || item.dyeColor.split(/(?=[A-Z])/).map(s=>s.trim()).filter(Boolean));
      const _chips = _dyeTokens.map(tok => {
        const css = DYE_TOKEN_COLORS[tok] || '#888';
        return '<span class="tip-dye-chip" style="background:' + css + ';" title="' + esc(tok) + '"></span>';
      }).join('');
      const _isDyeItem = !!item.dyeName;
      h += '<div class="tip-dye-row">' +
           '<span class="tip-dye-icon">🎨</span>' +
           (!_isDyeItem ? '<span class="tip-dye-name">' + esc(_dyeDisplayName) + '</span>' : '') +
           '<span class="tip-dye-chips">' + _chips + '</span>' +
           '</div>';
    }
    // ── Affixes with ♦ bullets (like in-game) ──────────────────────────
    // For unslotted runes in stash: inject tattoo effect + socket effects
    const _affixLines = [...(item.affixLines||[])];
    if (item.runeNum && !_affixLines.length) {
      // Stash rune tooltip: build inline from the rune maps
      const _RUNE_EFFECT_HINT = {
        '1':'Lightning shocks nearby enemies during your Glyph Lunge.',
        '2':'Blood Lash has a 50% chance to entangle enemies.',
        '3':'You are limited to 2 Crows, but they are eternal.',
        '4':'Your Spine Breaker follows an arcing path.',
        '5':'Your Bone Storm fires multiple missiles of blood rather than bone.',
      };
      const _RUNE_SOCKET_EFFECTS = {
        '1':[{slots:'Weapon, Helm, Gloves',effect:'+11 Attack'},{slots:'Chest, Belt, Boots, Shield',effect:'+11 Armor'}],
        '2':[{slots:'Weapon',effect:'25% chance to Bleed on hit'},{slots:'Helm, Gloves',effect:'+20% Bleed Duration'},{slots:'Chest, Shield',effect:'+25% Reduced Bleed Duration'},{slots:'Belt, Boots',effect:'+0.2/s Life Regen'}],
        '3':[{slots:'Weapon',effect:'+13% Shadow Penetration'},{slots:'Any armor piece',effect:'+3% Magic Find'}],
        '4':[{slots:'Weapon',effect:'+13% Blunt Penetration'},{slots:'Helm, Gloves',effect:'+20% Stun Duration'},{slots:'Chest, Shield',effect:'+20% Reduced Stun Duration'},{slots:'Belt, Boots',effect:'+5% Gold Find'}],
        '5':[{slots:'Weapon',effect:'+13% Slashing Penetration'},{slots:'Helm, Gloves',effect:'+20% Bleed Duration'},{slots:'Chest, Shield',effect:'+20% Reduced Bleed Duration'},{slots:'Belt, Boots',effect:'+1 Stamina'}],
      };
      const _tattooEffect = _RUNE_EFFECT_HINT[item.runeNum];
      const _sockEffects  = _RUNE_SOCKET_EFFECTS[item.runeNum];
      if (_sockEffects) {
        _affixLines.push({ text:'Socket in item for effect:', color:'rgba(255,255,255,0.35)', _header:true });
        for (const e of _sockEffects) _affixLines.push({ text: e.slots + ': ' + e.effect, color:'#94a3b8' });
      }
      if (_tattooEffect) {
        _affixLines.push({ text:'Tattoo effect:', color:'rgba(255,255,255,0.35)', _header:true });
        _affixLines.push({ text: _tattooEffect, color:'#a78bfa' });
      }
    }
    // Separate requirement lines from regular affix display
    const _reqLines      = [];
    const _displayLines  = _affixLines.filter(ln => {
      if (ln.isRequirement)                        { _reqLines.push(ln); return false; }
      if (ln.name && /\bItem Set\b/i.test(ln.name)) return false; // skip item set membership lines
      return true;
    });
    if (_displayLines.length) {
      h += '<div class="tip-divider"></div>';
      for (const ln of _displayLines) {
        if (ln._header) {
          h += '<div class="tip-affix-header" style="color:' + (ln.color||'rgba(255,255,255,0.35)') + ';">' + esc(String(ln.text)) + '</div>';
          continue;
        }
        const isLegLine  = isLeg;
        const isSockLine = ln.socketed;
        const _affGemC   = (isSockLine && ln.sockType === 'gem') ? gemColor(ln.name || '') : null;
        const bulletCol  = _affGemC || '#ffffff';
        const bullet     = isSockLine ? (ln.sockType==='heart'?'♥':ln.sockType==='rune'?'ᚱ':'◆') : '♦';

        const ELEM_COLORS = { Fire:'#fa8072', Shadow:'#c084fc', Cold:'#93c5fd', Lightning:'#fde047', Nature:'#86efac', Burn:'#fa8072', Bleed:'#e05050', Slashing:'#d4b8a0' };
        function colorElements(str) {
          return str.replace(/\b(Fire|Shadow|Cold|Lightning|Nature|Burn|Bleed)\b/g,
            m => '<span style="color:' + (ELEM_COLORS[m]||'#eee') + ';">' + m + '</span>');
        }

        let lineHtml;
        if (ln.text != null) {
          lineHtml = '<span class="tip-affix-line" style="color:' + (ln.color||'#e2e8f0') + ';">' + colorElements(esc(String(ln.text))) + '</span>';
        } else if (ln.isFlaskProp) {
          lineHtml = '<span class="tip-affix-line tip-affix-flask">' + esc(ln.name) + '</span>';
        } else if (isSockLine) {
          const textCol = _affGemC || '#e2e8f0';
          lineHtml = '<span class="tip-affix-line" style="color:' + (ln.color || textCol) + ';">' +
            colorElements(esc(String(ln.value ?? '')) + (ln.name ? ' ' + ln.name : '')) + '</span>';
        } else {
          const valStr  = '+' + String(ln.value ?? '');
          const nameStr = ln.name ? ' ' + ln.name : '';
          lineHtml = '<span class="tip-affix-line">' +
                     '<span class="tip-affix-val">' + esc(valStr) + '</span>' +
                     '<span class="tip-affix-name">' + colorElements(esc(nameStr)) + '</span>' +
                     '</span>';
        }
        h += '<div class="tip-affix-row">' +
             '<span class="tip-bullet" style="color:' + bulletCol + ';">' + bullet + '</span>' +
             lineHtml +
             '</div>';
      }
    }

    // ── Sockets ──────────────────────────────────────────────────────
    const tipSockCount = Math.max(item.socketCount || 0, (item.socketed||[]).length);
    if (tipSockCount > 0) {
      const tipSocketed = item.socketed || [];
      const tipSlots = [...(item.socketSlots || [])].sort((a,b) => a==='unique'?-1:b==='unique'?1:0);
      let sockRow = '';
      for (let s = 0; s < tipSockCount; s++) {
        const si = tipSocketed[s];
        const isUniq = tipSlots[s] === 'unique';
        const _tipGemC = (si && si.type==='gem') ? gemColor(si.name) : null;
        const _heartCol = (si && si.type==='heart') ? (HEART_RARITY_COLORS_TIP[si.heartRarity || si.rarity] || '#90ee90') : null;
        const circleCol = isUniq ? '#d4a847' : '#d1d5db';
        const contentCol = _heartCol || _tipGemC || circleCol;
        const _sockImg = si ? socketImgSrc(si) : null;
        const _borderStyle = isUniq
          ? 'border:2px solid #d4a847;box-shadow:0 0 5px #c9a84c88;background:rgba(201,168,76,0.10);'
          : 'border:1.5px solid ' + circleCol + ';background:rgba(0,0,0,0.4);';
        const _baseCircle = 'display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;overflow:hidden;margin-right:3px;flex-shrink:0;' + _borderStyle + (si?'':'opacity:' + (isUniq?'0.5':'0.3') + ';');
        const _innerHtml = _sockImg
          ? '<img src="' + _sockImg + '" class="dh-sock-dot-img" onerror="this.style.display=\'none\'">'
          : (si ? '<span style="font-size:0.55rem;color:' + contentCol + ';">' + (si.type==='heart'?'♥':si.type==='rune'?'ᚱ':'◆') + '</span>' : '');
        sockRow += '<span style="' + _baseCircle + '">' + _innerHtml + '</span>';
        if (si) sockRow += '<span style="font-size:0.65rem;color:' + contentCol + ';margin-right:8px;">' + esc(si.name||si.type) + '</span>';
      }
      h += '<div class="tip-sock-row">' + sockRow + '</div>';
    }

    // ── Requirements section ─────────────────────────────────────────
    // Attribute proto → display name (from DH_GUIDS)
    const _TOME_ATTR_PROTO = {
      'cf5c6725d0622e94a8d9869526914357': 'Vitality',
      'fe2f09265d25eb5488ecd81b076fcf63': 'Strength',
      'a3f14410163b5bc42b72e51ad9a4bc8e': 'Dexterity',
      'cf6a5e41fac71de48b7fc87aa12ab252': 'Magic',
    };
    const _isTome = item.slot === 'tome';
    const _tomeAttr = _isTome && item.tomeReqAttrProto ? (_TOME_ATTR_PROTO[item.tomeReqAttrProto] || null) : null;
    const _hasReqs  = _reqLines.length > 0 || item.heartIsUniqueSocket || _isTome;
    if (_hasReqs) {
      h += '<div class="tip-req-block">';
      h += '<div class="tip-req-label">Requires:</div>';
      const _cStats = _currentCharData?.stats || {};
      const _cLevel = _currentCharData?.level || 0;
      const STAT_KEY_MAP = { Magic:'magic', Strength:'strength', Dexterity:'dexterity', Vitality:'vitality' };
      // Standard affix requirement lines (non-tome items)
      for (const req of _reqLines) {
        const valStr = String(req.value || '');
        const _qMatch = valStr.match(/^(\d+)\s*\((.+?)\)$/);
        let reqType = 'Level', reqNum = parseInt(valStr) || 0;
        if (_qMatch) { reqNum = parseInt(_qMatch[1]); reqType = _qMatch[2]; }
        const _statKey = STAT_KEY_MAP[reqType];
        const _charVal = _statKey ? (_cStats[_statKey] || 0) : _cLevel;
        const isMet = _charVal >= reqNum;
        h += '<div class="tip-req-row"><span style="color:' + (isMet ? '#eee' : '#ef4444') + ';">' +
             esc(reqType) + ' ' + reqNum + '</span></div>';
      }
      if (item.heartIsUniqueSocket) {
        h += '<div class="tip-req-row"><span style="color:#d4a847;">Unique Socket</span></div>';
      }
      // Tome-specific requirements: attribute + "Usable once per character"
      if (_isTome && _tomeAttr && item.tomeReqValue) {
        const _charAttrVal = _cStats[STAT_KEY_MAP[_tomeAttr] || ''] || 0;
        const _reqMet = _charAttrVal >= item.tomeReqValue;
        h += '<div class="tip-req-row"><span style="color:' + (_reqMet ? '#eee' : '#ef4444') + ';">' +
             esc(_tomeAttr) + ' ' + item.tomeReqValue + '</span></div>';
      }
      if (_isTome) {
        h += '<div class="tip-req-row"><span style="color:#ef4444;">Usable once per character</span></div>';
      }
      h += '</div>';
    }

    // ── Flavour text for legendaries ─────────────────────────────────
    if (isLeg && item.legendaryName) {
      const cat = typeof legCatalogue !== 'undefined' ? legCatalogue[item.legendaryName] : null;
      const flavour = cat && cat.flavour;
      if (flavour) {
        h += '<div class="tip-divider"></div>';
        h += '<div class="tip-flavour">' + esc(flavour) + '</div>';
      }
    }

    t.innerHTML = h;
    t.style.display = 'block';
    posTip(x, y);
  }

  // Tooltip for legendary catalogue cards
  function showLegTip(entry, slot, x, y) {
    const t = ensureTip();
    const inst = slot.instances[0];
    const item = inst.item;
    const imgFile = LEG_IMAGES[entry.id];

    let _legHeader =
      `<div class="tip-leg-name">${esc(entry.name)}</div>` +
      `<div class="tip-leg-slot">Legendary ${esc(entry.slot)}</div>`;
    let h = buildTipImg(imgFile ? 'img/items/' + imgFile : null, _legHeader);

    if (item.damageMin != null)
      h += `<div class="tip-leg-dmg">⚔ ${item.damageMin}–${item.damageMax}${item.damageType?' ('+esc(item.damageType)+')':''}</div>`;
    if (item.armor)
      h += `<div class="tip-leg-armor">🛡 ${item.armor} Armor</div>`;

    if (item.affixLines.length) {
      h += '<div class="tip-divider tip-divider--gold"></div>';
      const _legReqLines = [];
      const _legDisplayLines = item.affixLines.filter(ln => {
        if (ln.isRequirement) { _legReqLines.push(ln); return false; }
        if (ln.name && /\bItem Set\b/i.test(ln.name)) return false;
        return true;
      });
      for (const ln of _legDisplayLines)
        h += `<div class="tip-leg-affix">+${esc(String(ln.value))} ${esc(ln.name)}</div>`;
      // Requirements block (right-aligned, same as showItemTip)
      if (_legReqLines.length > 0) {
        h += '<div class="tip-req-block">';
        h += '<div class="tip-req-label">Requires:</div>';
        const _cStats = _currentCharData?.stats || {};
        const _cLevel = _currentCharData?.level || 0;
        const STAT_KEY_MAP2 = { Magic:'magic', Strength:'strength', Dexterity:'dexterity', Vitality:'vitality' };
        for (const req of _legReqLines) {
          const valStr = String(req.value || '');
          const _qMatch = valStr.match(/^(\d+)\s*\((.+?)\)$/);
          let reqType = 'Level', reqNum = parseInt(valStr) || 0;
          if (_qMatch) { reqNum = parseInt(_qMatch[1]); reqType = _qMatch[2]; }
          const _statKey = STAT_KEY_MAP2[reqType];
          const _charVal = _statKey ? (_cStats[_statKey] || 0) : _cLevel;
          const isMet = _charVal >= reqNum;
          h += '<div class="tip-req-row"><span style="color:' + (isMet ? '#eee' : '#ef4444') + ';">' +
               esc(reqType) + ' ' + reqNum + '</span></div>';
        }
        h += '</div>';
      }
    }

    const hasStash = slot.instances.some(i => i.source === 'stash');
    const cnt = slot.instances.length;
    h += '<div class="tip-leg-footer">' +
      'Found <span class="tip-leg-found">' + cnt + '×</span> across your characters' +
      (hasStash ? ' &nbsp;<span class="tip-leg-stash">(some in stash)</span>' : '') +
      '</div>';

    t.innerHTML = h;
    t.style.display = 'block';
    posTip(x, y);
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

      // Click: if already expanded → toggle collapse; otherwise collapse others, expand this, load latest
      card.addEventListener('click', () => {
        const isExpanded = card.dataset.expanded === 'true';

        if (isExpanded) {
          // Collapse this card
          card.dataset.expanded = 'false';
          subList.style.display = 'none';
          card.querySelector('.dh-char-arrow').style.transform = '';
          return;
        }

        // Collapse every other card + clear active state
        fileListEl.querySelectorAll('.dh-char-card').forEach(otherCard => {
          if (otherCard === card) return;
          otherCard.dataset.expanded = 'false';
          otherCard.classList.remove('dh-char-card--active');
          const otherArrow   = otherCard.querySelector('.dh-char-arrow');
          const otherSubList = otherCard.parentElement.querySelector('ul');
          if (otherArrow)   otherArrow.style.transform = '';
          if (otherSubList) otherSubList.style.display  = 'none';
        });

        // Expand this card, mark as active, and load latest
        card.dataset.expanded = 'true';
        card.classList.add('dh-char-card--active');
        subList.style.display = 'block';
        card.querySelector('.dh-char-arrow').style.transform = 'rotate(180deg)';
        loadChar(latest);
      });

      wrapper.appendChild(card);
      wrapper.appendChild(subList);
      fileListEl.appendChild(wrapper);

      // Auto-load first character's latest file
      if (firstLoad) {
        firstLoad = false;
        card.dataset.expanded = 'true';
        card.classList.add('dh-char-card--active');
        subList.style.display = 'block';
        card.querySelector('.dh-char-arrow').style.transform = 'rotate(180deg)';
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
      renderLegendaryPanel();
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
        const cellBg = item.tomeUsed ? 'rgb(180,30,30)' : isLeg ? 'rgb(201,120,76)' : rc;
        const bord   = item.tomeUsed ? '#b01010' : isLeg ? '#c9784c' : rc;
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
        const _cellBg = item.tomeUsed ? 'rgb(180,30,30)' : isLeg ? 'rgb(201,120,76)' : rc;
        cell.style.setProperty('--cell-bg', _cellBg);
        cell.style.background = 'transparent';
        cell.style.border = item.tomeUsed ? '1px solid #b01010' : isLeg ? '1px solid #c9784c' : '1px solid ' + rc;
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
        const RUNE_IMG_NEW = {'1':'rune01_ash.png','2':'rune02_bat.png','3':'rune03_ka.png','4':'rune04_deb.png','5':'rune05_elm.png'};
        const RUNE_IMG_OLD = {'1':'rune_ash.png','2':'rune_bat.png','3':'rune_ka.png','4':'rune_deb.png','5':'rune_elm.png'};
        cell.style.alignItems = 'center'; cell.style.justifyContent = 'center';
        cell.style.background = 'rgba(103,65,180,0.2)'; cell.style.borderColor = 'rgba(147,112,219,0.5)';
        const rImg = document.createElement('img');
        rImg.src = './img/runes/' + RUNE_IMG_NEW[item.runeNum];
        rImg.alt = item.runeName || '';
        rImg.style.cssText = 'width:' + (w*CELL-10) + 'px;height:' + (w*CELL-10) + 'px;object-fit:contain;filter:drop-shadow(0 0 4px rgba(167,139,250,0.7));';
        rImg.onerror = () => { rImg.src = './img/runes/' + RUNE_IMG_OLD[item.runeNum]; rImg.onerror = () => { rImg.style.display='none'; }; };
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
        row.className = 'dh-list-row' + (isLeg ? ' dh-list-row--leg' : '');
        const RUNE_IMG_LIST = {'1':'rune01_ash.png','2':'rune02_bat.png','3':'rune03_ka.png','4':'rune04_deb.png','5':'rune05_elm.png'};
        const RUNE_IMG_LIST_OLD = {'1':'rune_ash.png','2':'rune_bat.png','3':'rune_ka.png','4':'rune_deb.png','5':'rune_elm.png'};
        const _dispType = getDisplayType(item);
        let _listImgSrc = null;
        let _listImgExtraStyle = '';
        if (item.runeNum) {
          _listImgSrc = './img/runes/' + (RUNE_IMG_LIST[item.runeNum] || RUNE_IMG_LIST_OLD[item.runeNum]);
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

        // ── Static game data from skills.md ──────────────────────────────────
        const BRANCH_DEF = [
          {
            key: 'Blood & Bone',
            match: 'Blood and Bone',
            skills: [
              {
                raw: 'Witch Blood Lash', display: 'Blood Lash',
                icon: 'img/skills/skill_blood_lash.png',
                dmg:'Shadow', cost:'12 mana', scaling:'Magic · Vitality', tag:'Tether · Drain · Blood',
                desc: 'Lash distant target and reel it in. Consecutive swings boost attack speed. Gain 4.9% MANA on hit.',
                upgrades: [
                  { name:'Blood Rage',  proto:'4790c83599850c24fb58bef8964894ed', max:4, levels:['Attack Speed boost lasts 5 seconds','Attack Speed boost lasts 10 seconds','Attack Speed boost lasts 15 seconds','Attack Speed boost lasts 20 seconds'] },
                  { name:'Ichor',       proto:'6a52831d1e9610447a035afaa2e3801b', max:3, levels:['Wield 2 grappling tethers','Wield 3 grappling tethers','Wield 5 grappling tethers'] },
                  { name:'Leech',       proto:'282ceefefe661bd4ab06b049da4f335f', max:3, levels:['Gain 1% Life from target on hit','Gain 2% Life from target on hit','Gain 3% Life from target on hit'] },
                  { name:'Blood Glyph', proto:'8f8b9de71cb09c54b92cb261689ab66f', max:4, requires:'Evocation', glyphBonus:true, glyphBases:[12,20,28,36], levels:['12% chance of Blood Glyph on kill — Blood Glyphs apply a bleed when evoked','20% chance of Blood Glyph on kill — Blood Glyphs apply a bleed when evoked','28% chance of Blood Glyph on kill — Blood Glyphs apply a bleed when evoked','36% chance of Blood Glyph on kill — Blood Glyphs apply a bleed when evoked'] },
                ],
              },
              {
                raw: 'Witch Bone Storm', display: 'Bone Storm',
                icon: 'img/skills/skill_bone_storm.png',
                dmg:'Physical', cost:'25 mana', scaling:'Magic', tag:'AoE · Bone',
                desc: 'Fire a rapid blast of bone shard missiles.',
                upgrades: [
                  { name:'Bone Glyph', proto:'443b10d8d3ec1c248b3758eefddd557a', max:4, glyphBonus:true, glyphBases:[20,33,40,45], levels:['20% chance of Bone Glyph on kill — Bone Glyphs apply a stun when evoked','33% chance of Bone Glyph on kill — Bone Glyphs apply a stun when evoked','40% chance of Bone Glyph on kill — Bone Glyphs apply a stun when evoked','45% chance of Bone Glyph on kill — Bone Glyphs apply a stun when evoked'] },
                  { name:'Impel',  max:3, levels:['Applies a 200 strength knockback','Applies a 300 strength knockback','Applies a 400 strength knockback'] },
                  { name:'Echo',   max:3, levels:['Reflecting shots ×2','Reflecting shots ×3','Reflecting shots ×4'] },
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
                dmg:'—', cost:'—', scaling:'150% weapon damage', tag:'Basic Attack · Evocation · Focusing · Melee',
                requires:'Weapon',
                desc: 'Lunges at a nearby target dealing 150% weapon damage and a 14% (+4.62%) chance of generating a random Glyph. Three glyphs form a Spell — trigger Spells with Evocation skills.',
                upgrades: [
                  { name:'Reprise', max:3, levels:['40% chance an evoked Spell remains to be used again','60% chance an evoked Spell remains to be used again','80% chance an evoked Spell remains to be used again'] },
                ],
              },
              {
                raw: 'Witch Spine Breaker', display: 'Spine Breaker',
                icon: 'img/skills/skill_spine_breaker.png',
                dmg:'Physical', cost:'10 mana', scaling:'Magic', tag:'Projectile · Bone',
                desc: 'Launches bone projectiles that shatter on impact, dealing physical damage.',
                upgrades: [
                  { name:'Shadow Glyph', proto:'3d215a015edeff4489a50df7975816e9', max:4, requires:'Evocation', levels:['30% chance of Shadow Glyph on kill — Shadow Glyphs return mana when evoked','50% chance of Shadow Glyph on kill — Shadow Glyphs return mana when evoked','70% chance of Shadow Glyph on kill — Shadow Glyphs return mana when evoked','80% chance of Shadow Glyph on kill — Shadow Glyphs return mana when evoked'] },
                  { name:'Adept',        proto:'4c8493e66ebc14a4caae68081feeac98', max:3, levels:['Decrease Mana cost by 15%','Decrease Mana cost by 30%','Decrease Mana cost by 45%'] },
                  { name:'Stun',         max:5, levels:['40% chance to Stun for 3 seconds','45% chance to Stun for 4.5 seconds','50% chance to Stun for 6 seconds','55% chance to Stun for 7.5 seconds','60% chance to Stun for 9 seconds'] },
                  { name:'Umbra',        max:3, levels:['Trail of shadow lasting 3 seconds, dealing shadow damage to targets within','Trail of shadow lasting 6 seconds, dealing shadow damage to targets within','Trail of shadow lasting 9 seconds, dealing shadow damage to targets within'] },
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
                dmg:'Shadow', cost:'—', scaling:'—', tag:'Basic Attack · Melee · Shadow',
                desc: 'On hit summons a Crow to your flock [Limit 5] for 20 seconds with a 5% chance of leaving a MANA ORB on release. Divebomb crows with STAND (Shift) or other FOCUSING skills.',
                upgrades: [
                  { name:'Flock',  max:2, levels:['Gather a flock up to 8 Crows','Gather a flock up to 11 Crows'] },
                  { name:'Murder', proto:'9d3ac0c038c58034f8f217c54f70cef9', max:3, levels:['2% chance on hit to release a spiraling murder of Vicious Crow ×12','3% chance on hit to release a spiraling murder of Vicious Crow ×14','4% chance on hit to release a spiraling murder of Vicious Crow ×16'] },
                ],
              },
              {
                raw: 'Witch Shadow Walk', display: 'Shadow Walk',
                icon: 'img/skills/skill_shadow_walk.png',
                dmg:'Shadow', cost:'18 mana', scaling:'Magic', tag:'Teleport · Invulnerability · Shadow',
                desc: 'Teleport to location where enemies within 2 meters are knocked back and Cursed. The curse lowers their defenses and returns health to the Witch when killed.',
                upgrades: [
                  { name:'Cypher',  max:3, requires:'Evocation', levels:['20% (+6.6%) chance of a glyph on cursed kills','26.6% (+6.6%) chance of a glyph on cursed kills','33.2% (+6.6%) chance of a glyph on cursed kills'] },
                  { name:'Expanse', max:2, levels:['Extend the area of effect to 5 meters','Extend the area of effect to 8 meters'] },
                  { name:'Scourge', proto:'ce04da600ddc71d45aa161b1619b08e6', max:3, levels:['1× Scourge lasting 5 seconds — each stack lowers target\'s resistances','2× Scourge lasting 7 seconds — each stack lowers target\'s resistances','3× Scourge lasting 10 seconds — each stack lowers target\'s resistances'] },
                ],
              },
            ],
          },
        ];

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
        // Rune number → image filename (supports both old rune_{name}.png and new rune0N_{name}.png)
        // Ash=1, Bat=2, Ka=3, Deb=4, Elm=5
        const RUNE_NUM_IMAGE = { '1':'rune01_ash.png', '2':'rune02_bat.png', '3':'rune03_ka.png', '4':'rune04_deb.png', '5':'rune05_elm.png' };
        const RUNE_NUM_IMAGE_OLD = { '1':'rune_ash.png', '2':'rune_bat.png', '3':'rune_ka.png', '4':'rune_deb.png', '5':'rune_elm.png' };
        const RUNE_EFFECT_HINT = {
          '1': 'Lightning shocks nearby enemies during your Glyph Lunge.',
          '2': 'Blood Lash has a 50% chance to entangle enemies.',
          '3': 'You are limited to 2 Crows, but they are eternal.',
          '4': 'Your Spine Breaker follows an arcing path.',
          '5': 'Your Bone Storm fires multiple missiles of blood rather than bone.',
        };
        // Rune socket-in-item effects, keyed by runeNum then slot-group label
        const RUNE_SOCKET_EFFECTS = {
          '1': [
            { slots:'Weapon, Helm, Gloves',           effect:'+11 Attack' },
            { slots:'Chest, Belt, Boots, Shield',     effect:'+11 Armor' },
          ],
          '2': [
            { slots:'Weapon',                         effect:'25% chance to Bleed on hit' },
            { slots:'Helm, Gloves',                   effect:'+20% Bleed Duration' },
            { slots:'Chest, Shield',                  effect:'+25% Reduced Bleed Duration' },
            { slots:'Belt, Boots',                    effect:'+0.2/s Life Regen' },
          ],
          '3': [
            { slots:'Weapon',                         effect:'+13% Shadow Penetration' },
            { slots:'Any armor piece',                effect:'+3% Magic Find' },
          ],
          '4': [
            { slots:'Weapon',                         effect:'+13% Blunt Penetration' },
            { slots:'Helm, Gloves',                   effect:'+20% Stun Duration' },
            { slots:'Chest, Shield',                  effect:'+20% Reduced Stun Duration' },
            { slots:'Belt, Boots',                    effect:'+5% Gold Find' },
          ],
          '5': [
            { slots:'Weapon',                         effect:'+13% Slashing Penetration' },
            { slots:'Helm, Gloves',                   effect:'+20% Bleed Duration' },
            { slots:'Chest, Shield',                  effect:'+20% Reduced Bleed Duration' },
            { slots:'Belt, Boots',                    effect:'+1 Stamina' },
          ],
        };

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
          const imgFileNew = runeNum ? RUNE_NUM_IMAGE[runeNum] : null;
          const imgFileOld = runeNum ? RUNE_NUM_IMAGE_OLD[runeNum] : null;
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
              const tipTattooLine = runeNum && RUNE_EFFECT_HINT[runeNum]
                ? [{ text:'Tattoo effect:', color:'rgba(255,255,255,0.35)', _header:true },
                   { text: RUNE_EFFECT_HINT[runeNum], color:'#a78bfa' }]
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
          'Unique':    '#d4a84b',
          'Champion':  '#c084fc',
          'Boss':      '#f87171',
          'Elite':     '#60a5fa',
          'Normal':    '#9ca3af',
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

          const RARITY_ORDER = { Unique:0, Boss:1, Champion:2, Elite:3, Normal:4 };

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
            }).slice(0, 50);
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

          tblHdr.appendChild(makeSortHdr('Monster', 'name', 'left'));
          tblHdr.appendChild(makeSortHdr('Rarity',  'rarity', 'left'));
          tblHdr.appendChild(makeSortHdr('Count',   'count', 'right'));
          killBody.appendChild(tblHdr);

          // Scrollable body
          const ROW_H = 26;
          const MAX_VISIBLE = 10;
          const tblBody = document.createElement('div');
          tblBody.className = 'dh-kill-tbl-body';
          tblBody.style.maxHeight = (ROW_H * MAX_VISIBLE) + 'px';

          function rebuildRows() {
            tblBody.innerHTML = '';
            const entries = sortedKillLog();
            entries.forEach((entry, idx) => {
              const rc = RARITY_KILL_COLORS[entry.rarity] || RARITY_KILL_COLORS['Normal'];
              const row = document.createElement('div');
              const isLast = idx === entries.length - 1;
              row.className = 'dh-kill-row' + (isLast ? ' dh-kill-row--last' : '');
              row.innerHTML =
                '<span class="dh-kill-name">' + esc(entry.name) + '</span>' +
                '<span class="dh-kill-rarity" style="color:' + rc + ';">' + esc(entry.rarity || '–') + '</span>' +
                '<span class="dh-kill-count">' + entry.count.toLocaleString() + '</span>';
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
