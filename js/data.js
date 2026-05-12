// ===== DATA.JS — Të dhënat e simuluara =====

const DB = {
  users: [
    { id: 1, email: 'kandidat@test.com', password: '1234', role: 'kandidat', name: 'Arben Krasniqi', code: 'K-1025' },
    { id: 2, email: 'admin@test.com',    password: 'admin123', role: 'admin',    name: 'Admin Sistemi', code: null },
    { id: 3, email: 'komision@test.com', password: 'kom123',  role: 'komision', name: 'Komisioni 01',  code: null },
  ],

  konkurset: [
    { id: 1, pozita: 'Zyrtar i Burimeve Njerëzore', institucioni: 'Ministria e Financave', afati: '2026-05-28', statusi: 'aktiv', kategoria: 'Sherbim Civil', vende: 2, aplikime: 34, paga: '600-900€', pershkrimi: 'Menaxhimi i proceseve të rekrutimit dhe burimeve njerëzore në ministri.' },
    { id: 2, pozita: 'Asistent Administrativ', institucioni: 'Komuna e Prishtinës', afati: '2026-06-05', statusi: 'aktiv', kategoria: 'Administrativ', vende: 3, aplikime: 58, paga: '500-700€', pershkrimi: 'Mbështetja administrative dhe koordinimi i korrespondencës zyrtare.' },
    { id: 3, pozita: 'Zyrtar Financiar', institucioni: 'Agjencia e Prokurimit', afati: '2026-06-12', statusi: 'aktiv', kategoria: 'Financa', vende: 1, aplikime: 21, paga: '700-1000€', pershkrimi: 'Menaxhimi i buxhetit dhe raporteve financiare të agjencisë.' },
    { id: 4, pozita: 'Inspektor i Punës', institucioni: 'Ministria e Punës', afati: '2026-04-30', statusi: 'mbyllur', kategoria: 'Inspektim', vende: 4, aplikime: 89, paga: '650-850€', pershkrimi: 'Inspektimi i kushteve të punës dhe zbatimi i legjislacionit.' },
    { id: 5, pozita: 'IT Specialist', institucioni: 'KRPP', afati: '2026-06-20', statusi: 'aktiv', kategoria: 'Teknologji', vende: 2, aplikime: 12, paga: '800-1200€', pershkrimi: 'Administrimi i sistemeve informatike dhe sigurisë kibernetike.' },
    { id: 6, pozita: 'Jurist', institucioni: 'Zyra e Kryeministrit', afati: '2026-05-15', statusi: 'shqyrtim', kategoria: 'Juridik', vende: 1, aplikime: 45, paga: '700-950€', pershkrimi: 'Hartimi dhe rishikimi i akteve juridike dhe kontratave.' },
  ],

  aplikimet: [
    { id: 1, kandidatId: 1, konkursId: 1, data: '2026-05-01', statusi: 'shqyrtim', hapi: 'Vlerësimi i dosjeve', pikaTesti: null, pikaIntervistes: null },
    { id: 2, kandidatId: 1, konkursId: 5, data: '2026-05-08', statusi: 'pranuar', hapi: 'Lista finale', pikaTesti: 72, pikaIntervistes: 31 },
  ],

  rezultatet: [
    { id: 1, kodi: 'K-1025', emri: 'Arben Krasniqi', konkurs: 'IT Specialist – KRPP', pikaTesti: 72, pikaIntervistes: 31, totali: 103, vendi: 1, statusi: 'kaloi' },
    { id: 2, kodi: 'K-1041', emri: 'Besarta Morina', konkurs: 'IT Specialist – KRPP', pikaTesti: 68, pikaIntervistes: 28, totali: 96, vendi: 2, statusi: 'pritje' },
    { id: 3, kodi: 'K-1033', emri: 'Drilon Hoxha', konkurs: 'IT Specialist – KRPP', pikaTesti: 55, pikaIntervistes: 22, totali: 77, vendi: 3, statusi: 'refuzuar' },
  ],

  ankesat: [
    { id: 1, kandidatId: 1, tema: 'Gabim në llogaritjen e pikëve', kategoria: 'Rezultate', data: '2026-05-10', statusi: 'shqyrtim', pershkrimi: 'Mendoj se pikët e testit janë llogaritur gabimisht.' },
  ],

  njoftimet: [
    { id: 1, tekst: 'Aplikimi juaj për IT Specialist është pranuar!', data: '2026-05-09', lexuar: false, tip: 'success' },
    { id: 2, tekst: 'Afati për Zyrtar BNJ është 28 Maj 2026', data: '2026-05-11', lexuar: false, tip: 'info' },
    { id: 3, tekst: 'Ankesa #1 është duke u shqyrtuar', data: '2026-05-10', lexuar: true, tip: 'warning' },
  ]
};

// Load/Save nga localStorage
function loadDB() {
  const saved = localStorage.getItem('eKonkursiDB');
  if (saved) {
    const parsed = JSON.parse(saved);
    // Merge me default data
    Object.assign(DB, parsed);
  }
}

function saveDB() {
  localStorage.setItem('eKonkursiDB', JSON.stringify(DB));
}

// CRUD helpers
const DataAPI = {
  getKonkurset: (filter = {}) => {
    let list = [...DB.konkurset];
    if (filter.statusi && filter.statusi !== 'te_gjitha') list = list.filter(k => k.statusi === filter.statusi);
    if (filter.kategoria && filter.kategoria !== 'te_gjitha') list = list.filter(k => k.kategoria === filter.kategoria);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(k => k.pozita.toLowerCase().includes(q) || k.institucioni.toLowerCase().includes(q));
    }
    if (filter.sort === 'afati') list.sort((a, b) => new Date(a.afati) - new Date(b.afati));
    if (filter.sort === 'aplikime') list.sort((a, b) => b.aplikime - a.aplikime);
    return list;
  },

  getKonkursiById: (id) => DB.konkurset.find(k => k.id === id),

  addKonkurs: (data) => {
    const id = Math.max(...DB.konkurset.map(k => k.id)) + 1;
    DB.konkurset.push({ id, aplikime: 0, ...data });
    saveDB();
    return id;
  },

  updateKonkurs: (id, data) => {
    const idx = DB.konkurset.findIndex(k => k.id === id);
    if (idx > -1) { DB.konkurset[idx] = { ...DB.konkurset[idx], ...data }; saveDB(); }
  },

  deleteKonkurs: (id) => {
    DB.konkurset = DB.konkurset.filter(k => k.id !== id);
    saveDB();
  },

  getAplikimet: (kandidatId) => DB.aplikimet.filter(a => a.kandidatId === kandidatId),

  addAplikim: (data) => {
    const id = DB.aplikimet.length + 1;
    const aplikim = { id, statusi: 'shqyrtim', hapi: 'Pranimi i dosjes', pikaTesti: null, pikaIntervistes: null, ...data };
    DB.aplikimet.push(aplikim);
    // Increment aplikime count
    const k = DB.konkurset.find(k => k.id === data.konkursId);
    if (k) k.aplikime++;
    saveDB();
    return id;
  },

  getRezultatet: (kodi = null) => {
    if (kodi) return DB.rezultatet.filter(r => r.kodi === kodi);
    return DB.rezultatet;
  },

  getAnkesat: (kandidatId) => DB.ankesat.filter(a => a.kandidatId === kandidatId),

  addAnkese: (data) => {
    const id = DB.ankesat.length + 1;
    DB.ankesat.push({ id, statusi: 'shqyrtim', data: new Date().toISOString().slice(0,10), ...data });
    saveDB();
    return id;
  },

  getNjoftimet: (kandidatId) => DB.njoftimet,

  markRead: (id) => {
    const n = DB.njoftimet.find(n => n.id === id);
    if (n) { n.lexuar = true; saveDB(); }
  },

  getStats: () => ({
    konkursAktive: DB.konkurset.filter(k => k.statusi === 'aktiv').length,
    totalAplikime: DB.aplikimet.length,
    kandidatPranuar: DB.rezultatet.filter(r => r.statusi === 'kaloi').length,
    ankesaAktive: DB.ankesat.filter(a => a.statusi === 'shqyrtim').length,
  }),
};

loadDB();
