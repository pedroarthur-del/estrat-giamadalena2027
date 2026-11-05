(function () {
"use strict";
/* =====================================================================
   NÚCLEO · utilidades, configuração e formatação
   ===================================================================== */
const APP_VERSION = "3.2.0";
const CFG = (() => {
  const c = window.PLATAFORMA || {};
  return {
    cliente: { nome: "Cliente", curto: "Cliente", rede: "", cidade: "", monograma: "M", ...(c.cliente || {}) },
    cores: { primaria: "#093A72", secundaria: "#03B4D6", destaque: "#B5C628", ...(c.cores || {}) },
    abertura: { titulo: "Planejamento Estratégico", traducao: "", fonte: "", ...(c.abertura || {}) },
    desenvolvidoPor: c.desenvolvidoPor || "Desenvolvido por Gomes de Matos Consultoria",
    versiculos: Array.isArray(window.PLATAFORMA_VERSICULOS) ? window.PLATAFORMA_VERSICULOS.filter(v => v && v.t && v.r) : [],
    frases: Array.isArray(c.frases) ? c.frases : [],
    firebase: c.firebase || null,
    emulador: !!c.emulador,
    senhaEquipeSha256: c.senhaEquipeSha256 || "",
    urlPublica: c.urlPublica || "",
    adminsIniciais: (c.adminsIniciais || []).map(e => String(e).toLowerCase()),
  };
})();
const SEED = window.PLATAFORMA_SEED || {};
const KEY = "pe-" + (CFG.cliente.curto || "app").normalize("NFD").replace(/[^\w]/g, "").toLowerCase();

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad = n => String(n).padStart(2, "0");
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const toUTC = s => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); };
const daysBetween = (a, b) => Math.round((toUTC(b) - toUTC(a)) / 864e5);
const addDays = (s, n) => { const t = new Date(toUTC(s) + n * 864e5); return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`; };
const isDateStr = v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(toUTC(v));
const MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const fmtD = s => s ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}` : "—";
const fmtDs = s => s ? `${+s.slice(8, 10)} ${MES[+s.slice(5, 7) - 1]}` : "";
const fmtDT = iso => { if (!iso) return "—"; const d = new Date(iso); if (isNaN(d)) return "—"; return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const mesLabel = k => `${MES[+k.slice(5, 7) - 1]}/${k.slice(2, 4)}`;
const relTime = iso => {
  const d = new Date(iso); if (isNaN(d)) return ""; const s = Math.round((Date.now() - d) / 1000);
  if (s < 45) return "agora"; if (s < 3600) return `há ${Math.round(s / 60)} min`; if (s < 86400) return `há ${Math.round(s / 3600)} h`;
  const dd = Math.round(s / 86400); return dd === 1 ? "ontem" : dd < 30 ? `há ${dd} dias` : fmtDT(iso).slice(0, 10);
};
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clean = s => String(s ?? "").replace(/\s+/g, " ").trim();
const cleanML = s => String(s ?? "").replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").trim();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const pct = v => v == null || isNaN(v) ? "—" : Math.round(v * 100) + "%";
const byText = (a, b) => String(a ?? "").localeCompare(String(b ?? ""), "pt-BR", { numeric: true, sensitivity: "base" });
const norm = s => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const emailOk = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || ""));
const normEmail = e => String(e || "").trim().toLowerCase();
const initials = n => { const w = String(n || "?").replace(/^(Ir|Irmã|Pe|Dr|Dra)\.?\s+/i, "").trim().split(/\s+/).filter(Boolean); return ((w[0]?.[0] || "?") + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase(); };
const numOrNull = v => {
  if (v === "" || v == null) return null; if (typeof v === "number") return isFinite(v) ? v : NaN;
  let t = String(v).trim().replace(/\s|R\$|%|º|h$/gi, ""); if (t === "") return null;
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  const n = Number(t); return isNaN(n) ? NaN : n;
};
const fmtNum = (v, u) => {
  if (v == null || v === "" || isNaN(v)) return "—";
  if (u === "R$") return "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const n = Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  if (u === "%") return n + "%"; if (u === "º") return n + "º"; if (u === "h") return n + " h";
  return u ? `${n} ${u}` : n;
};
const AV_COLORS = ["#093A72", "#0287A3", "#6F7B0F", "#7A4FA0", "#B9791A", "#2F7D4F", "#C2410C", "#355C8C", "#8C3B6E"];
const avColor = n => { let h = 0; for (const c of norm(n)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return AV_COLORS[h % AV_COLORS.length]; };
const cssVar = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = () => matchMedia("(max-width: 719px)").matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
function alpha(hex, a) { const h = String(hex).replace("#", "").trim(); if (!/^[0-9a-f]{3,6}$/i.test(h)) return hex; const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
async function sha256(t) {
  if (window.crypto?.subtle) { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join(""); }
  throw new Error("Este navegador não suporta criptografia. Atualize o navegador.");
}
const lsGet = (k, d = null) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (_) { return false; } };
const ssGet = (k, d = null) => { try { const v = sessionStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } };
const ssSet = (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (_) { } };
const ssDel = k => { try { sessionStorage.removeItem(k); } catch (_) { } };
function linkify(t) { return esc(t).replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g, u => `<a href="${u}" target="_blank" rel="noopener noreferrer">${u.length > 64 ? u.slice(0, 61) + "…" : u}</a>`).replace(/@([A-ZÀ-Úa-zà-ú][\wÀ-ú]+(?: [A-ZÀ-Ú][\wÀ-ú]+)?)/g, '<b class="mention">@$1</b>'); }
function download(name, data, type) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], { type })); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}
async function saveFile(name, data, type) {
  try { const dl = window.claude?.use ? await window.claude.use("downloads") : null; if (dl) { await dl.save({ filename: name, data }); return true; } }
  catch (e) { if (/declin|cancel|denied/i.test(e?.code || e?.message || "")) return false; }
  download(name, data, type); return true;
}
function toCSV(rows) { return "﻿" + rows.map(r => r.map(v => { const s = String(v ?? ""); return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(";")).join("\r\n"); }
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.async = false; s.onload = res; s.onerror = () => rej(new Error("Falha ao carregar " + src)); document.head.appendChild(s); }); }

/* =====================================================================
   DADOS · adaptadores de armazenamento (mesma interface)
   FsStore   → Cloud Firestore (Firebase) ou banco do artifact do Claude
   LocalStore → navegador (modo demonstração)
   ===================================================================== */
async function withRetry(fn, n = 2) {
  for (let i = 0; ; i++) {
    try { return await fn(); }
    catch (e) { const c = String(e?.code || e?.message || ""); if (i >= n || !/unavailable|deadline|network|offline|aborted/i.test(c)) throw e; await sleep(400 * 2 ** i); }
  }
}
class FsStore {
  constructor(db, kind) { this.db = db; this.kind = kind; }
  subscribe(col, next, fail) { return this.db.collection(col).onSnapshot(s => next(s.docs.map(d => ({ id: d.id, ...d.data() }))), e => fail && fail(e)); }
  async get(col, id) { const d = await withRetry(() => this.db.doc(`${col}/${id}`).get()); return d.exists ? { id: d.id, ...d.data() } : null; }
  async create(col, data, id) { id = id || uid(); await withRetry(() => this.db.doc(`${col}/${id}`).set(data)); return id; }
  update(col, id, data) { return withRetry(() => this.db.doc(`${col}/${id}`).update(data)); }
  set(col, id, data) { return withRetry(() => this.db.doc(`${col}/${id}`).set(data)); }
  remove(col, id) { return withRetry(() => this.db.doc(`${col}/${id}`).delete()); }
  async isEmpty(col) { const s = await this.db.collection(col).limit(1).get(); return s.empty; }
}
class LocalStore {
  constructor(key, seed) {
    this.kind = "local"; this.key = key; this.subs = {};
    const saved = lsGet(key);
    const src = saved && saved.__v ? saved : (seed || {}); this.data = {};
    for (const [c, rows] of Object.entries(src)) if (Array.isArray(rows)) this.data[c] = new Map(rows.map(r => [r.id, { ...r }]));
    if (!saved || !saved.__v) this._save();
  }
  _save() { const o = { __v: 3 }; for (const [c, m] of Object.entries(this.data)) o[c] = [...m.values()]; this.persisted = lsSet(this.key, o); }
  _emit(col) { this._save(); const rows = [...(this.data[col] || new Map()).values()].map(r => structuredClone(r)); (this.subs[col] || []).forEach(f => f(rows)); }
  subscribe(col, next) { (this.subs[col] ??= []).push(next); queueMicrotask(() => this._emit(col)); return () => { this.subs[col] = (this.subs[col] || []).filter(f => f !== next); }; }
  async get(col, id) { const r = this.data[col]?.get(id); return r ? structuredClone(r) : null; }
  async create(col, data, id) { id = id || uid(); (this.data[col] ??= new Map()).set(id, { id, ...structuredClone(data) }); this._emit(col); return id; }
  async update(col, id, data) { const m = this.data[col]; if (!m?.has(id)) { const e = new Error("Este item não existe mais."); e.code = "not-found"; throw e; } m.set(id, { ...m.get(id), ...structuredClone(data) }); this._emit(col); }
  async set(col, id, data) { (this.data[col] ??= new Map()).set(id, { id, ...structuredClone(data) }); this._emit(col); }
  async remove(col, id) { this.data[col]?.delete(id); this._emit(col); }
  async isEmpty(col) { return !(this.data[col]?.size); }
  reset(seed) { this.data = {}; for (const [c, rows] of Object.entries(seed)) this.data[c] = new Map(rows.map(r => [r.id, { ...r }])); this._save(); Object.keys(this.subs).forEach(c => this._emit(c)); }
}

/* =====================================================================
   PAPÉIS E PERMISSÕES (espelhados nas regras do Firestore)
   ===================================================================== */
const ROLES = {
  admin: { l: "Administrador", d: "Tudo: pessoas, acessos, segurança, automações e todo o planejamento." },
  gestor: { l: "Gestor", d: "Cria e edita OKRs, KRs, colunas e qualquer projeto. Não gerencia pessoas nem segurança." },
  participante: { l: "Participante", d: "Vê tudo, comenta e edita os projetos em que é responsável (entregas, descrição, anexos)." },
  leitor: { l: "Leitor", d: "Só visualiza o painel, os OKRs e o quadro. Não edita nada." },
};
const ROLE_ORDER = ["admin", "gestor", "participante", "leitor"];
const PERMS = {
  admin: ["ver", "comentar", "editar_proprio", "editar_projetos", "editar_okrs", "editar_quadro", "config", "pessoas", "seguranca", "automacoes", "dados"],
  gestor: ["ver", "comentar", "editar_proprio", "editar_projetos", "editar_okrs", "editar_quadro", "automacoes"],
  participante: ["ver", "comentar", "editar_proprio"],
  leitor: ["ver"],
};
const can = p => (PERMS[S.me.papel] || []).includes(p);
const myEmail = () => normEmail(S.me.email);
function isMember(p) {
  if (!p) return false; const me = myEmail(), nome = norm(S.me.nome);
  return (p.membros || []).includes(me) || (!!nome && ((p.responsaveis || []).some(r => norm(r) === nome) || (p.entregas || []).some(e => norm(e.resp) === nome)));
}
const canEditProject = p => can("editar_projetos") || (can("editar_proprio") && isMember(p));

/* =====================================================================
   SEGURANÇA · bloqueio progressivo de acesso
   3 erros → espera 1 min · 6 erros → espera 5 min · 9 erros → bloqueado
   (no Firebase o contador fica no servidor e as regras recusam os dados
   de contas bloqueadas; só um administrador desbloqueia)
   ===================================================================== */
const LOCK = { espera1: 3, espera2: 6, bloqueio: 9, min1: 60, min2: 300 };
const Lockout = {
  key: e => KEY + "-tent-" + (e || "equipe"),
  async read(email) {
    let srv = null;
    if (S.fb && email) { try { const d = await S.fb.firestore().doc(`tentativas/${email}`).get(); srv = d.exists ? d.data() : null; } catch (_) { } }
    const loc = lsGet(this.key(email), null);
    const pick = [srv, loc].filter(Boolean).sort((a, b) => (b.n || 0) - (a.n || 0))[0] || { n: 0, ultima: null };
    return { n: pick.n || 0, ultima: pick.ultima || null, srv };
  },
  status(t) {
    const n = t.n || 0, since = t.ultima ? (Date.now() - new Date(t.ultima)) / 1000 : 1e9;
    if (n >= LOCK.bloqueio) return { blocked: true, n, left: 0 };
    const wait = n === LOCK.espera2 ? LOCK.min2 : n === LOCK.espera1 ? LOCK.min1 : 0;
    const left = Math.max(0, Math.ceil(wait - since));
    return { blocked: false, n, left, restantes: n < LOCK.espera1 ? LOCK.espera1 - n : n < LOCK.espera2 ? LOCK.espera2 - n : LOCK.bloqueio - n };
  },
  async fail(email, t) {
    const n = (t.n || 0) + 1, ultima = new Date().toISOString();
    lsSet(this.key(email), { n, ultima });
    if (S.fb && email) {
      const ref = S.fb.firestore().doc(`tentativas/${email}`);
      try { if (t.srv) await ref.update({ n: (t.srv.n || 0) + 1, ultima }); else await ref.set({ n: 1, ultima }); } catch (e) { console.warn("tentativas", e?.code); }
    }
    return { n, ultima };
  },
  async reset(email, t) {
    lsSet(this.key(email), { n: 0, ultima: null });
    if (S.fb && email && t?.srv && t.srv.n > 0) { try { await S.fb.firestore().doc(`tentativas/${email}`).update({ n: 0, ultima: new Date().toISOString() }); } catch (_) { } }
  },
};

/* =====================================================================
   SCHEMAS · validação por entidade
   ===================================================================== */
class ValidationError extends Error { constructor(fields) { super(Object.values(fields)[0] || "Revise os campos destacados"); this.fields = fields; } }
class PermissionError extends Error { constructor(m) { super(m || "Seu perfil de acesso não permite esta ação."); } }
const str = (v, max) => clean(v).slice(0, max);
const strML = (v, max) => cleanML(v).slice(0, max);
const dateOr = v => isDateStr(v) ? v : "";
const arr = v => Array.isArray(v) ? v : [];
const SCHEMAS = {
  colunas(i) { const o = { titulo: str(i.titulo, 240), objetivoId: str(i.objetivoId, 60), ordem: Number(i.ordem) || 0 }, e = {}; if (!o.titulo) e.titulo = "Dê um nome à coluna"; return [o, e]; },
  objetivos(i) { const o = { codigo: str(i.codigo, 12).toUpperCase(), titulo: str(i.titulo, 400), ordem: Number(i.ordem) || 0 }, e = {}; if (!o.codigo) e.codigo = "Informe um código, ex.: OKR4"; if (!o.titulo) e.titulo = "Descreva o objetivo"; return [o, e]; },
  krs(i) {
    const o = { objetivoId: str(i.objetivoId, 60), codigo: str(i.codigo, 12).toUpperCase(), titulo: str(i.titulo, 400), responsavel: str(i.responsavel, 80),
      meta: numOrNull(i.meta), atual: numOrNull(i.atual), unidade: str(i.unidade, 10), sentido: i.sentido === "menor" ? "menor" : "maior", observacoes: strML(i.observacoes, 1500), ordem: Number(i.ordem) || 0,
      medicoes: arr(i.medicoes).filter(m => isDateStr(m.data) && typeof m.valor === "number" && isFinite(m.valor)).slice(-120).map(m => ({ id: String(m.id || uid()), data: m.data, valor: m.valor, nota: str(m.nota, 300), por: str(m.por, 80) })) }, e = {};
    if (!o.objetivoId) e.objetivoId = "Escolha o objetivo"; if (!o.codigo) e.codigo = "Informe um código, ex.: KR1"; if (!o.titulo) e.titulo = "Descreva o resultado-chave";
    if (Number.isNaN(o.meta)) e.meta = "Use apenas números, ex.: 87,5"; if (Number.isNaN(o.atual)) e.atual = "Use apenas números, ex.: 87,5"; return [o, e];
  },
  projetos(i) {
    const o = {
      colunaId: str(i.colunaId, 60), titulo: str(i.titulo, 400), descricao: strML(i.descricao, 8000), ciclo: str(i.ciclo, 8) || String(new Date().getFullYear()),
      responsaveis: [...new Set(arr(i.responsaveis).map(x => str(x, 80)).filter(Boolean))].slice(0, 16), membros: [...new Set(arr(i.membros).map(normEmail).filter(emailOk))].slice(0, 40),
      etiquetas: [...new Set(arr(i.etiquetas).map(x => str(x, 40)).filter(Boolean))].slice(0, 12), prioridade: ["alta", "media", "baixa"].includes(i.prioridade) ? i.prioridade : "",
      inicio: dateOr(i.inicio), prazo: dateOr(i.prazo), ordem: Number(i.ordem) || 0, concluido: !!i.concluido, arquivado: !!i.arquivado,
      entregas: arr(i.entregas).filter(x => clean(x.texto)).slice(0, 250).map(x => ({ id: String(x.id || uid()), texto: str(x.texto, 600), feito: !!x.feito, prazo: dateOr(x.prazo), resp: str(x.resp, 80), feitoEm: x.feito ? String(x.feitoEm || "") : "", feitoPor: x.feito ? str(x.feitoPor, 80) : "" })),
      comentarios: arr(i.comentarios).filter(x => cleanML(x.texto)).slice(-300).map(x => ({ id: String(x.id || uid()), texto: strML(x.texto, 4000), autor: str(x.autor, 80) || "Equipe", email: normEmail(x.email), em: String(x.em || new Date().toISOString()) })),
      links: arr(i.links).filter(x => /^https?:\/\//i.test(clean(x.url))).slice(0, 60).map(x => ({ id: String(x.id || uid()), nome: str(x.nome, 160) || clean(x.url), url: clean(x.url).slice(0, 1500) })),
      notaAnexos: str(i.notaAnexos, 300),
    }, e = {};
    if (!o.titulo) e.titulo = "Dê um nome ao projeto"; if (!o.colunaId) e.colunaId = "Escolha a coluna";
    if (o.inicio && o.prazo && o.inicio > o.prazo) e.prazo = "O prazo final é anterior ao início"; return [o, e];
  },
  capas(i) { const o = { data: String(i.data || "") }, e = {}; if (!/^data:image\/(jpeg|png|webp);base64,/.test(o.data) || o.data.length > 400000) e.data = "Imagem inválida ou grande demais"; return [o, e]; },
  pessoas(i) {
    const o = { nome: str(i.nome, 80), email: normEmail(i.email), cargo: str(i.cargo, 80), area: str(i.area, 80), papel: ROLES[i.papel] ? i.papel : (i.papel === "sem_acesso" ? "sem_acesso" : "participante"), ativo: i.ativo !== false, convidadoEm: String(i.convidadoEm || "") }, e = {};
    if (!o.nome) e.nome = "Informe o nome"; if (o.email && !emailOk(o.email)) e.email = "E-mail inválido";
    if (o.papel !== "sem_acesso" && !o.email) e.email = "Para dar acesso, informe o e-mail"; return [o, e];
  },
};
const COLS = ["colunas", "objetivos", "krs", "projetos", "capas", "pessoas", "config"];
const EXTRA = ["historico"]; // carregado sob demanda (apenas os mais recentes)
const DEPENDENTS = {
  colunas: id => { const n = S.data.projetos.filter(p => p.colunaId === id).length; return n ? `Esta coluna tem ${n} projeto(s), inclusive arquivados. Mova ou exclua os projetos antes.` : null; },
  objetivos: id => { const n = S.data.krs.filter(k => k.objetivoId === id).length; return n ? `Este objetivo tem ${n} KR(s). Exclua ou mova os KRs antes.` : null; },
};
const PERM_FOR = { colunas: "editar_quadro", objetivos: "editar_okrs", krs: "editar_okrs", pessoas: "pessoas", config: "config" };

/* Calcula os e-mails dos membros a partir dos nomes dos responsáveis (usado pelas regras de acesso) */
function membrosDe(p) {
  const nomes = new Set([...(p.responsaveis || []), ...(p.entregas || []).map(e => e.resp)].filter(Boolean).map(norm));
  return S.data.pessoas.filter(x => x.email && nomes.has(norm(x.nome))).map(x => normEmail(x.email));
}

/* Recalcula os membros (e-mails) de todos os projetos, ex.: depois de cadastrar o e-mail de alguém */
async function syncMembros() {
  if (!can("editar_projetos") || S.mode === "local") return 0; let n = 0;
  for (const p of S.data.projetos) { const m = membrosDe(p); if (m.slice().sort().join() !== (p.membros || []).slice().sort().join()) { await S.store.update("projetos", p.id, { membros: m }).catch(e => console.warn("membros", p.id, e?.code)); n++; } }
  return n;
}

/* =====================================================================
   REPOSITÓRIO · CRUD com validação, permissão, integridade e histórico
   ===================================================================== */
const Repo = {
  store() { return S.store; },
  check(col, rec, partial) {
    if (S.readOnly) throw new PermissionError("Você está com acesso só de leitura.");
    const only = ks => partial && Object.keys(partial).length && Object.keys(partial).every(k => ks.includes(k));
    if (col === "projetos") {
      if (rec && only(["comentarios"]) && can("comentar")) return;
      if (rec ? !canEditProject(rec) : !can("editar_projetos")) throw new PermissionError(rec ? "Você só pode editar projetos em que é responsável." : "Só gestores criam projetos."); return;
    }
    if (col === "krs" && rec && only(["medicoes", "atual"]) && canMedir(rec)) return;
    if (col === "capas") { const p = S.data.projetos.find(x => x.id === rec?.id); if (!canEditProject(p)) throw new PermissionError(); return; }
    if (PERM_FOR[col] && !can(PERM_FOR[col])) throw new PermissionError();
  },
  async create(col, input, id) {
    this.check(col, null);
    let [o, e] = SCHEMAS[col](input); if (Object.keys(e).length) throw new ValidationError(e);
    if (col === "projetos") o.membros = [...new Set([...o.membros, ...membrosDe(o)])];
    const now = new Date().toISOString(); o = { ...o, criadoEm: now, atualizadoEm: now, por: myEmail() };
    const nid = await this.store().create(col, o, id);
    Audit.log("criou", col, nid, o.titulo || o.nome || o.codigo);
    return nid;
  },
  async patch(col, id, partial, opts = {}) {
    const cur = S.data[col].find(r => r.id === id); if (!cur) throw new Error("Este item não existe mais. Atualize a página.");
    this.check(col, cur, partial);
    if (col === "projetos" && !can("editar_projetos") && ("colunaId" in partial || "ciclo" in partial || "arquivado" in partial))
      throw new PermissionError("Só gestores movem, arquivam ou trocam o ciclo de projetos.");
    const merged = { ...cur, ...partial };
    const [o, e] = SCHEMAS[col](merged); if (Object.keys(e).length) throw new ValidationError(e);
    const out = {}; for (const k of Object.keys(partial)) if (k in o) out[k] = o[k];
    if (col === "projetos" && ("responsaveis" in partial || "entregas" in partial) && can("editar_projetos")) {
      const m = membrosDe(o); if (m.join() !== (cur.membros || []).join()) out.membros = m;
    }
    out.atualizadoEm = new Date().toISOString();
    await this.store().update(col, id, out);
    if (!opts.silent) Audit.log(opts.acao || "alterou", col, id, o.titulo || o.nome || o.codigo, opts.detalhe || Object.keys(partial).join(", "));
  },
  async setCapa(id, data) { const p = S.data.projetos.find(x => x.id === id); this.check("capas", { id }); const [o, e] = SCHEMAS.capas({ data }); if (e.data) throw new Error(e.data); await this.store().set("capas", id, { ...o, atualizadoEm: new Date().toISOString(), por: myEmail() }); Audit.log("alterou", "projetos", id, p?.titulo, "capa"); },
  async removeCapa(id) { this.check("capas", { id }); await this.store().remove("capas", id); },
  async remove(col, id) {
    const cur = S.data[col]?.find(r => r.id === id);
    if (col === "projetos") { if (!can("editar_projetos")) throw new PermissionError("Só gestores excluem projetos."); }
    else this.check(col, cur);
    const dep = DEPENDENTS[col]?.(id); if (dep) throw new Error(dep);
    await this.store().remove(col, id);
    if (col === "projetos" && S.data.capas.some(c => c.id === id)) await this.store().remove("capas", id).catch(() => { });
    Audit.log("excluiu", col, id, cur?.titulo || cur?.nome || cur?.codigo);
  },
  async setConfig(id, data) { if (!can(id === "automacoes" ? "automacoes" : id === "seguranca" ? "seguranca" : id === "etiquetas" ? "editar_quadro" : "config")) throw new PermissionError(); const { id: _x, ...rest } = data; Object.keys(rest).forEach(k => rest[k] === undefined && delete rest[k]); await this.store().set("config", id, { ...rest, atualizadoEm: new Date().toISOString(), por: myEmail() }); Audit.log("alterou", "config", id, id); },
};
const Audit = {
  log(acao, col, id, titulo, detalhe = "") {
    if (!S.store || S.store.kind === "local" && !S.auditLocal) return;
    const rec = { em: new Date().toISOString(), email: myEmail(), nome: S.me.nome || myEmail() || "Equipe", acao, col, ref: String(id || ""), titulo: str(titulo, 200), detalhe: str(detalhe, 300) };
    S.store.create("historico", rec).then(() => { if (S.historico) { S.historico.unshift({ id: "tmp", ...rec }); S.historico.length = Math.min(S.historico.length, 200); } }).catch(() => { });
  },
};
async function save(fn, okMsg, undo) {
  try { const r = await fn(); if (okMsg) toast(okMsg, undo); return r; }
  catch (e) {
    const m = e instanceof ValidationError ? e.message : e instanceof PermissionError ? e.message
      : /permission|insufficient/i.test(e?.code || e?.message || "") ? "Acesso negado pelo servidor. Seu perfil não permite esta ação ou sua sessão expirou."
      : /not-found/i.test(e?.code || "") ? "Este item não existe mais. A tela foi atualizada."
      : (e?.message || "Não foi possível salvar. Verifique a conexão e tente de novo.");
    toast(m, null, "erro"); throw e;
  }
}

/* =====================================================================
   SERVIÇO DE INDICADORES (regras de negócio)
   ===================================================================== */
const SIT = { concluida: "Concluída", emdia: "No prazo", atrasada: "Atrasada", semprazo: "Sem prazo" };
const SIT_ORDER = ["concluida", "emdia", "atrasada", "semprazo"];
const SIT_COLOR = () => ({ concluida: cssVar("--navy"), emdia: cssVar("--cyan"), atrasada: cssVar("--brick"), semprazo: cssVar("--idle") });
const PSTAT = { concluido: "Concluído", andamento: "Em andamento", atrasado: "Com atraso", ainiciar: "A iniciar", semplano: "Sem entregas" };
const PRIO = { alta: "Alta", media: "Média", baixa: "Baixa" };
const OKR_COLORS = ["--navy", "--cyan-d", "--lime-d", "--amber", "--plum", "--brick"];
const Plan = {
  get hoje() { return todayISO(); },
  idx() { return { col: new Map(S.data.colunas.map(c => [c.id, c])), obj: new Map(S.data.objetivos.map(o => [o.id, o])) }; },
  objs() { return [...S.data.objetivos].sort((a, b) => a.ordem - b.ordem || byText(a.codigo, b.codigo)); },
  cols() { return [...S.data.colunas].sort((a, b) => a.ordem - b.ordem); },
  objOf(p, ix = this.idx()) { const c = ix.col.get(p.colunaId); return c?.objetivoId ? ix.obj.get(c.objetivoId) || null : null; },
  okrColor(objId) { const i = this.objs().findIndex(o => o.id === objId); return i < 0 ? cssVar("--idle") : cssVar(OKR_COLORS[i % OKR_COLORS.length]); },
  sitE(e, hoje = this.hoje) { if (e.feito) return "concluida"; if (!e.prazo) return "semprazo"; return e.prazo < hoje ? "atrasada" : "emdia"; },
  statusP(p, hoje = this.hoje) {
    const es = p.entregas || [];
    if (p.concluido || (es.length && es.every(e => e.feito))) return "concluido";
    if (!es.length) return "semplano";
    if (es.some(e => !e.feito && e.prazo && e.prazo < hoje)) return "atrasado";
    return es.some(e => e.feito) ? "andamento" : "ainiciar";
  },
  progresso(p) { const es = p.entregas || []; if (p.concluido && !es.length) return 1; return es.length ? es.filter(e => e.feito).length / es.length : 0; },
  janela(p) { const ds = (p.entregas || []).map(e => e.prazo).filter(Boolean).sort(); const ini = p.inicio || ds[0] || "", fim = p.prazo || ds[ds.length - 1] || ""; return { ini: ini && fim && ini > fim ? fim : ini, fim }; },
  ativos() { return S.data.projetos.filter(p => !p.arquivado); },
  rows() {
    const ix = this.idx(), out = [], hoje = this.hoje;
    for (const p of this.ativos()) {
      const obj = this.objOf(p, ix), col = ix.col.get(p.colunaId);
      for (const e of p.entregas || []) out.push({ e, p, obj, col, objId: obj?.id || "", sit: this.sitE(e, hoje), mes: e.prazo ? e.prazo.slice(0, 7) : "", resp: e.resp || "Sem responsável" });
    }
    return out;
  },
  krAt(k) {
    if (k.meta == null || k.atual == null) return null;
    if (k.sentido === "menor") { if (k.atual <= k.meta) return 1; return k.atual === 0 ? 1 : Math.max(0, k.meta / k.atual); }
    return k.meta === 0 ? (k.atual >= 0 ? 1 : 0) : Math.max(0, k.atual / k.meta);
  },
  krClass(v) { return v == null ? "na" : v >= 1 ? "ok" : v >= .85 ? "mid" : "low"; },
};

/* =====================================================================
   ESTADO GLOBAL E FILTROS CRUZADOS (estilo Power BI)
   ===================================================================== */
const S = {
  mode: "local", store: null, fb: null, readOnly: false, started: false,
  me: { email: "", nome: "", papel: "leitor" },
  data: { colunas: [], objetivos: [], krs: [], projetos: [], capas: [], pessoas: [], config: [] },
  loaded: new Set(), unsub: [], historico: null,
  view: "painel", sub: { projetos: "quadro" },
  f: { ciclo: "", obj: "", resp: "", sit: "", mes: "", proj: "", etq: "" },
  board: { ciclo: "", q: "", resp: "", etq: "", prio: "", arquivados: false },
  meu: { pessoa: "", ver: "abertas" },
  charts: {}, anim: {}, modal: null, menu: null, qadd: null, editCol: null, drawer: null,
};
const DIMS = {
  ciclo: { l: "Ciclo", get: r => r.p.ciclo, label: v => v },
  obj: { l: "OKR", get: r => r.objId || "_none", label: v => v === "_none" ? "Sem OKR (backlog)" : (S.data.objetivos.find(o => o.id === v)?.codigo || v) },
  resp: { l: "Responsável", get: r => r.resp, label: v => v },
  sit: { l: "Situação", get: r => r.sit, label: v => SIT[v] || v },
  mes: { l: "Mês do prazo", get: r => r.mes || "_none", label: v => v === "_none" ? "Sem prazo" : mesLabel(v) },
  proj: { l: "Projeto", get: r => r.p.id, label: v => { const t = S.data.projetos.find(p => p.id === v)?.titulo || v; return t.length > 42 ? t.slice(0, 40) + "…" : t; } },
  etq: { l: "Etiqueta", get: r => r.p.etiquetas || [], label: v => etiquetas().find(e => e.id === v)?.nome || v, multi: true },
};
function filtered(rows, except) {
  return rows.filter(r => Object.entries(S.f).every(([k, v]) => {
    if (!v || k === except || (k === "ciclo" && v === "todos")) return true;
    const g = DIMS[k].get(r); return DIMS[k].multi ? g.includes(v) : g === v;
  }));
}
const defer = (fn, ...a) => setTimeout(() => fn(...a), 0);
function setF(k, v, toggle = true) { S.f[k] = toggle && S.f[k] === v ? "" : v; S.anim.painel = false; persistUI(); renderPainel(); }
function persistUI() { ssSet(KEY + "-ui", { f: S.f, board: S.board, view: S.view, sub: S.sub, meu: S.meu }); }
const cfgDoc = id => S.data.config.find(c => c.id === id) || {};
const geral = () => ({ cicloAtual: String(new Date().getFullYear()), ...cfgDoc("geral") });
const seguranca = () => ({ timeoutMin: 30, ...cfgDoc("seguranca") });
const automacoes = () => ({ ativo: false, diasAntes: 3, resumoSemanal: true, diaResumo: 1, destinatarios: [], copiaGestores: false, ...cfgDoc("automacoes") });
const ETQ_DEFAULT = [
  { id: "prioritario", nome: "Prioritário", cor: "#C2410C" }, { id: "pedagogico", nome: "Pedagógico", cor: "#093A72" },
  { id: "financeiro", nome: "Financeiro", cor: "#6F7B0F" }, { id: "marketing", nome: "Marketing", cor: "#0287A3" },
  { id: "infra", nome: "Infraestrutura", cor: "#B9791A" }, { id: "pastoral", nome: "Pastoral", cor: "#7A4FA0" },
];
const etiquetas = () => cfgDoc("etiquetas").lista || ETQ_DEFAULT;
function ciclos() { return [...new Set(S.data.projetos.map(p => p.ciclo).filter(Boolean))].sort(); }
function pessoasAtivas() { return S.data.pessoas.filter(p => p.ativo !== false).sort((a, b) => byText(a.nome, b.nome)); }
function people() {
  const s = new Set(pessoasAtivas().map(p => p.nome));
  Plan.ativos().forEach(p => { (p.responsaveis || []).forEach(x => s.add(x)); (p.entregas || []).forEach(e => e.resp && s.add(e.resp)); });
  S.data.krs.forEach(k => k.responsavel && s.add(k.responsavel)); return [...s].filter(Boolean).sort(byText);
}
function pessoaPorNome(n) { const k = norm(n); return S.data.pessoas.find(p => norm(p.nome) === k) || null; }
function ready() { return COLS.every(c => S.loaded.has(c)); }

/* =====================================================================
   INTERFACE · base (ícones, avisos, diálogos, painel lateral, roteador)
   ===================================================================== */
const ic = (p, f) => `<svg viewBox="0 0 20 20" ${f ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'} aria-hidden="true">${p}</svg>`;
const ICON = {
  x: ic('<path d="M5 5l10 10M15 5L5 15"/>'), plus: ic('<path d="M10 4v12M4 10h12"/>'), chk: ic('<rect x="3" y="3" width="14" height="14" rx="3"/><path d="M6.5 10l2.5 2.5 4.5-5"/>'),
  cmt: ic('<path d="M4 4h12v9H8l-4 3z"/>'), clock: ic('<circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/>'), txt: ic('<path d="M4 5h12M4 9h12M4 13h8"/>'),
  clip: ic('<path d="M13 7l-5 5a2 2 0 102.8 2.8l5.6-5.6a3.5 3.5 0 10-5-5L5.6 10a5 5 0 007 7l4-4"/>'), trash: ic('<path d="M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10"/>'),
  dots: ic('<circle cx="4.5" cy="10" r="1.6"/><circle cx="10" cy="10" r="1.6"/><circle cx="15.5" cy="10" r="1.6"/>', 1), search: ic('<circle cx="9" cy="9" r="5.5"/><path d="M13.2 13.2L17 17"/>'),
  bell: ic('<path d="M6 8a4 4 0 018 0c0 4 2 5 2 5H4s2-1 2-5M8.5 16a1.6 1.6 0 003 0"/>'), gear: ic('<circle cx="10" cy="10" r="2.6"/><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4"/>'),
  chart: ic('<path d="M3 17V9M8 17V4M13 17v-6M18 17V7"/>'), target: ic('<circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="3.5"/><circle cx="10" cy="10" r=".7" fill="currentColor"/>'),
  board: ic('<rect x="2.5" y="3" width="4.5" height="13" rx="1"/><rect x="8.5" y="3" width="4.5" height="9" rx="1"/><rect x="14.5" y="3" width="3.5" height="11" rx="1"/>'),
  me: ic('<circle cx="10" cy="7" r="3.2"/><path d="M3.5 17c1.2-3.2 3.6-4.6 6.5-4.6s5.3 1.4 6.5 4.6"/>'), list: ic('<path d="M7 5h10M7 10h10M7 15h10M3 5h.01M3 10h.01M3 15h.01"/>'),
  gantt: ic('<path d="M3 4v13M6 6h6M8 10h8M5 14h5"/>'), hand: ic('<path d="M7 11V4.5a1.5 1.5 0 013 0V10m0-1.5a1.5 1.5 0 013 0V10m0-.5a1.5 1.5 0 013 0V13a5 5 0 01-5 5h-1a5 5 0 01-4.3-2.5L4 12.6a1.4 1.4 0 012.3-1.6L7 12"/>'),
  out: ic('<path d="M12 4h4v12h-4M8 6l-4 4 4 4M4 10h9"/>'), lock: ic('<rect x="4" y="9" width="12" height="8" rx="2"/><path d="M7 9V6.5a3 3 0 016 0V9"/>'),
  mail: ic('<rect x="3" y="5" width="14" height="10" rx="2"/><path d="M3.5 6l6.5 5 6.5-5"/>'), down: ic('<path d="M10 3v10M6 9l4 4 4-4M4 16h12"/>'), up: ic('<path d="M10 16V6M6 10l4-4 4 4M4 3h12"/>'),
  archive: ic('<rect x="3" y="4" width="14" height="4" rx="1"/><path d="M4.5 8v8h11V8M8 11h4"/>'), copy: ic('<rect x="6" y="6" width="10" height="10" rx="2"/><path d="M4 13V5a1 1 0 011-1h8"/>'),
  tag: ic('<path d="M3 10V3h7l7 7-7 7z"/><circle cx="6.5" cy="6.5" r="1"/>'), flag: ic('<path d="M5 17V3M5 4h9l-2 3.5 2 3.5H5"/>'), cal: ic('<rect x="3" y="4.5" width="14" height="12" rx="2"/><path d="M3 8.5h14M7 3v3M13 3v3"/>'),
  user: ic('<circle cx="10" cy="7" r="3"/><path d="M4 16.5c1-2.8 3.2-4 6-4s5 1.2 6 4"/>'), users: ic('<circle cx="7.5" cy="7" r="2.6"/><path d="M2.5 16c.8-2.5 2.6-3.6 5-3.6s4.2 1.1 5 3.6M13 4.6a2.6 2.6 0 010 5M14.5 12.6c1.6.4 2.6 1.5 3 3.4"/>'),
  shield: ic('<path d="M10 2.5l6 2.5v4.5c0 4-2.6 6.8-6 8-3.4-1.2-6-4-6-8V5z"/><path d="M7.5 10l2 2 3.5-4"/>'), zap: ic('<path d="M11 2L4 11h5l-1 7 7-9h-5z"/>'),
  db: ic('<ellipse cx="10" cy="5" rx="6" ry="2.5"/><path d="M4 5v10c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V5M4 10c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5"/>'), info: ic('<circle cx="10" cy="10" r="7"/><path d="M10 9v5M10 6.5h.01"/>'),
  eye: ic('<path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z"/><circle cx="10" cy="10" r="2.4"/>'), back: ic('<path d="M12 4l-6 6 6 6"/>'), next: ic('<path d="M8 4l6 6-6 6"/>'),
  move: ic('<path d="M4 10h12M12 6l4 4-4 4"/>'), history: ic('<path d="M3.5 10a6.5 6.5 0 106.5-6.5c-2 0-3.8.9-5 2.4M3 3v3.5h3.5"/><path d="M10 6.5V10l2.5 1.5"/>'), filter: ic('<path d="M3 4h14l-5.5 6.5V16l-3-1.5v-4z"/>'),
  print: ic('<path d="M6 7V3h8v4M6 14H4V8h12v6h-2M6 11h8v6H6z"/>'), sparkle: ic('<path d="M10 2l1.6 5.4L17 9l-5.4 1.6L10 16l-1.6-5.4L3 9l5.4-1.6z"/>'),
};
const MONO = (s = 40) => `<svg class="mono" width="${s}" height="${s}" viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="3" fill="var(--navy)"/><path d="M19 82 31 20h4l15 40 15-40h4l12 62h-8l-8.6-44L52 70h-4L35.6 38 27 82z" fill="#fff"/></svg>`;
const LOGO = (cls = "") => CFG.cliente.logo ? `<img class="logo-of ${cls}" src="${esc(CFG.cliente.logo)}" alt="${esc(CFG.cliente.nome)}" width="500" height="146" decoding="async">` : `${MONO(42)}${WORDMARK()}`;
function versiculoDoDia(data = new Date()) {
  const v = CFG.versiculos; if (!v.length) return null;
  const dia = Math.floor(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()) / 864e5); // muda à meia-noite local, igual para todos
  return v[((dia * 7919) % v.length + v.length) % v.length];
}
const WORDMARK = () => { const p = CFG.cliente.nome.replace(/^Col[eé]gio\s+/i, ""); return `<span class="wm"><small>${/^Col[eé]gio/i.test(CFG.cliente.nome) ? "Colégio" : esc(CFG.cliente.rede)}</small>${p.split(" ").map(esc).join("<br>")}</span>`; };
function opt(v, l, cur) { return `<option value="${esc(v)}"${String(v) === String(cur ?? "") ? " selected" : ""}>${esc(l)}</option>`; }
function avatars(names, max = 3, size = "") {
  const n = [...new Set(names.filter(Boolean))];
  return `<span class="avs ${size}">${n.slice(0, max).map(x => `<span class="av" style="--ac:${avColor(x)}" title="${esc(x)}">${esc(initials(x))}</span>`).join("")}${n.length > max ? `<span class="av more" title="${esc(n.slice(max).join(", "))}">+${n.length - max}</span>` : ""}</span>`;
}
const okrTag = o => o ? `<span class="okr" style="--oc:${Plan.okrColor(o.id)}">${esc(o.codigo)}</span>` : `<span class="okr bk">Backlog</span>`;
const statusPill = s => `<span class="pill st-${s}">${PSTAT[s]}</span>`;
const etqChips = ids => (ids || []).map(id => etiquetas().find(e => e.id === id)).filter(Boolean).map(e => `<span class="etq" style="--ec:${e.cor}">${esc(e.nome)}</span>`).join("");

/* ---------- Avisos (com desfazer) ---------- */
let toastT;
function toast(m, undo, kind) {
  const t = $("#toast"); clearTimeout(toastT);
  t.className = "toast" + (kind === "erro" ? " erro" : ""); t.innerHTML = `<span>${esc(m)}</span>${undo ? `<button type="button" data-act="undo">Desfazer</button>` : ""}`;
  t.hidden = false; S.undo = undo || null; toastT = setTimeout(() => { t.hidden = true; S.undo = null; }, undo ? 6500 : kind === "erro" ? 5000 : 3000);
}
/* ---------- Diálogo de confirmação (sem confirm() do navegador) ---------- */
function confirmDlg({ titulo, texto, ok = "Confirmar", perigo = false }) {
  return new Promise(res => {
    const d = $("#dialog");
    d.innerHTML = `<div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t"><h3 id="dlg-t">${esc(titulo)}</h3><p>${esc(texto)}</p>
      <div class="row"><button class="btn ghost" data-r="0" type="button">Cancelar</button><button class="btn ${perigo ? "red" : ""}" data-r="1" type="button">${esc(ok)}</button></div></div>`;
    d.hidden = false; const prev = document.activeElement; setTimeout(() => $('[data-r="1"]', d).focus(), 30);
    const done = v => { d.hidden = true; d.innerHTML = ""; d.onclick = null; d.onkeydown = null; prev?.focus?.(); res(v); };
    d.onclick = e => { const b = e.target.closest("[data-r]"); if (b) done(b.dataset.r === "1"); else if (e.target === d) done(false); };
    d.onkeydown = e => { if (e.key === "Escape") { e.stopPropagation(); done(false); } };
  });
}

/* ---------- Painel lateral de formulários (genérico) ---------- */
function openDrawer({ titulo, campos, valores = {}, salvar, excluir, sub, larg }) {
  const d = $("#drawer"), v = valores;
  const fld = f => {
    if (f.secao) return `<div class="fsec">${esc(f.secao)}</div>`;
    const val = v[f.k] ?? f.def ?? ""; let input;
    if (f.type === "select") input = `<select id="f-${f.k}" name="${f.k}" ${f.dis ? "disabled" : ""}>${f.opts.map(([a, b]) => opt(a, b, val)).join("")}</select>`;
    else if (f.type === "textarea") input = `<textarea class="inp" id="f-${f.k}" name="${f.k}" rows="${f.rows || 3}" maxlength="${f.max || 2000}" ${f.dis ? "disabled" : ""}>${esc(val)}</textarea>`;
    else if (f.type === "check") input = `<label class="ck"><input type="checkbox" id="f-${f.k}" name="${f.k}" ${val ? "checked" : ""} ${f.dis ? "disabled" : ""}><span>${esc(f.cl || "")}</span></label>`;
    else input = `<input class="inp" id="f-${f.k}" name="${f.k}" type="${f.type || "text"}" ${f.im ? `inputmode="${f.im}"` : ""} ${f.list ? `list="${f.list}"` : ""} ${f.ac ? `autocomplete="${f.ac}"` : ""} maxlength="${f.max || 400}" placeholder="${esc(f.ph || "")}" value="${esc(val == null ? "" : f.num ? String(val).replace(".", ",") : val)}" ${f.dis ? "disabled" : ""}>`;
    return `<div class="fld${f.h ? " h" : ""}" data-fk="${f.k}">${f.type === "check" ? "" : `<label for="f-${f.k}">${esc(f.l)}</label>`}${input}${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ""}<span class="err" role="alert"></span></div>`;
  };
  d.innerHTML = `<div class="dw ${larg ? "wide" : ""}"><header><div><h2 id="dr-title">${esc(titulo)}</h2>${sub ? `<p class="sub">${esc(sub)}</p>` : ""}</div><button class="btn quiet ico" data-act="closeDrawer" aria-label="Fechar" type="button">${ICON.x}</button></header>
    <form id="dr-form" novalidate>${campos.map(fld).join("")}<datalist id="dl-ppl">${people().map(p => `<option value="${esc(p)}">`).join("")}</datalist></form>
    <footer>${excluir ? `<button class="btn danger sm" type="button" id="dr-del">${ICON.trash}Excluir</button>` : ""}<span class="sp"></span><button class="btn ghost" type="button" data-act="closeDrawer">Cancelar</button><button class="btn" type="submit" form="dr-form" id="dr-save">Salvar</button></footer></div>`;
  d.hidden = false; S.drawer = true; document.body.classList.add("noscroll");
  setTimeout(() => d.querySelector("input:not([disabled]),select:not([disabled]),textarea:not([disabled])")?.focus(), 60);
  $("#dr-form").onsubmit = async ev => {
    ev.preventDefault(); const fd = new FormData(ev.target), data = {};
    campos.filter(f => f.k).forEach(f => { data[f.k] = f.type === "check" ? fd.has(f.k) : fd.get(f.k) ?? v[f.k]; });
    $$(".fld", d).forEach(x => { x.classList.remove("bad"); x.querySelector(".err").textContent = ""; });
    const btn = $("#dr-save"); btn.disabled = true;
    try { await salvar(data); closeDrawer(); }
    catch (e) {
      if (e instanceof ValidationError) { for (const [k, m] of Object.entries(e.fields)) { const x = $(`[data-fk="${k}"]`, d); if (x) { x.classList.add("bad"); x.querySelector(".err").textContent = m; } } const first = $(".fld.bad input, .fld.bad select, .fld.bad textarea", d); first?.focus(); }
      else toast(e.message || "Não foi possível salvar.", null, "erro");
    } finally { btn.disabled = false; }
  };
  const del = $("#dr-del"); if (del) del.onclick = async () => { if (await confirmDlg({ titulo: "Excluir?", texto: excluir.texto || "Esta ação não pode ser desfeita.", ok: "Excluir", perigo: true })) { try { await excluir.fn(); closeDrawer(); } catch (e) { toast(e.message, null, "erro"); } } };
}
function closeDrawer() { $("#drawer").hidden = true; $("#drawer").innerHTML = ""; S.drawer = null; if (!S.modal) document.body.classList.remove("noscroll"); }

/* ---------- Gráficos (Chart.js) ---------- */
function chartDefaults() {
  if (!window.Chart || chartDefaults.done) return; chartDefaults.done = true;
  Chart.defaults.font.family = cssVar("--font"); Chart.defaults.font.size = 12; Chart.defaults.color = cssVar("--muted");
  Chart.defaults.plugins.legend.display = false; Chart.defaults.maintainAspectRatio = false;
  Object.assign(Chart.defaults.plugins.tooltip, { backgroundColor: "#17212F", padding: 10, cornerRadius: 8, titleFont: { weight: "900" }, boxPadding: 4 });
  if (window.ChartDataLabels) { Chart.register(ChartDataLabels); Chart.defaults.plugins.datalabels = { display: false }; }
}
function chart(id, cfg, animKey = "painel") {
  const el = document.getElementById(id); if (!el) return null;
  if (!window.Chart) { el.parentElement.innerHTML = `<div class="empty sm">Os gráficos não carregaram. Verifique a internet e recarregue.</div>`; return null; }
  if (S.charts[id]) { S.charts[id].destroy(); delete S.charts[id]; }
  cfg.options = cfg.options || {}; cfg.options.animation = S.anim[animKey] !== false && !reduceMotion() ? { duration: 950, easing: "easeOutQuart" } : { duration: 300 };
  cfg.options.onHover = cfg.options.onHover || ((e, els) => { e.native.target.style.cursor = els.length ? "pointer" : "default"; });
  try { S.charts[id] = new Chart(el, cfg); } catch (e) { console.error(e); }
  return S.charts[id];
}
function destroyCharts() { Object.values(S.charts).forEach(c => { try { c.destroy(); } catch (_) { } }); S.charts = {}; }
const gridColor = () => alpha(cssVar("--line"), .9);
function countUp(el, to, fmt = v => Math.round(v), dur = 900) {
  if (!el) return; if (reduceMotion() || S.anim.count === false) { el.textContent = fmt(to); return; }
  const t0 = performance.now(); const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function sparkline(vals, w = 92, h = 26, color = "var(--navy)") {
  if (!vals || vals.length < 2) return "";
  const mn = Math.min(...vals), mx = Math.max(...vals), r = mx - mn || 1;
  const pts = vals.map((v, i) => [i / (vals.length - 1) * (w - 4) + 2, h - 3 - (v - mn) / r * (h - 6)]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join("");
  const last = pts[pts.length - 1];
  return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${last[0]}" cy="${last[1]}" r="3" fill="${color}"/></svg>`;
}

/* ---------- Comemoração discreta ao concluir um projeto ---------- */
function celebrate(x = innerWidth / 2, y = innerHeight / 3) {
  if (reduceMotion()) return; const c = document.createElement("canvas"); c.className = "confetti"; c.width = innerWidth; c.height = innerHeight; document.body.appendChild(c);
  const g = c.getContext("2d"), cols = [cssVar("--navy"), cssVar("--cyan"), cssVar("--lime"), "#fff"], P = Array.from({ length: 70 }, () => ({ x, y, vx: (Math.random() - .5) * 9, vy: -Math.random() * 9 - 3, r: Math.random() * 4 + 2, c: cols[Math.random() * 4 | 0], a: 1, s: Math.random() * 6 }));
  let f = 0; const tick = () => { g.clearRect(0, 0, c.width, c.height); P.forEach(p => { p.vy += .32; p.x += p.vx; p.y += p.vy; p.a -= .012; g.globalAlpha = Math.max(0, p.a); g.fillStyle = p.c; g.fillRect(p.x, p.y, p.r, p.r * 1.6); }); if (++f < 90) requestAnimationFrame(tick); else c.remove(); };
  requestAnimationFrame(tick);
}

/* =====================================================================
   MOLDURA · cabeçalho, navegação, roteador, busca global, atividade
   ===================================================================== */
const VIEWS = {
  painel: { l: "Painel", i: "chart", render: () => renderPainel() },
  meu: { l: "Meu trabalho", i: "me", render: () => renderMeu() },
  okrs: { l: "OKRs", i: "target", render: () => renderOKRs() },
  projetos: { l: "Projetos", i: "board", render: () => renderProjetos() },
  config: { l: "Configurações", i: "gear", render: () => renderConfig(), hidden: true },
};
function renderFrame() {
  const navBtn = (k, v) => `<button class="tab" data-view="${k}" aria-current="${S.view === k ? "page" : "false"}">${ICON[v.i]}<span>${v.l}</span>${k === "meu" ? `<b class="cnt" id="cnt-meu" hidden></b>` : ""}</button>`;
  $("#app").innerHTML = `
  <header class="top">
    <div class="top-in">
      <button class="brand" data-view="painel" aria-label="${esc(CFG.cliente.nome)} · ir para o painel"><span class="brand-chip">${LOGO("hd-logo")}</span><i class="sep"></i><span class="ttl">Planejamento Estratégico<span>${esc(CFG.cliente.rede || "OKRs, projetos e entregas")}</span></span></button>
      <nav class="tabs" aria-label="Seções">${Object.entries(VIEWS).filter(([, v]) => !v.hidden).map(([k, v]) => navBtn(k, v)).join("")}</nav>
      <div class="hactions">
        <button class="hbtn search" data-act="palette" aria-label="Buscar (Ctrl+K)">${ICON.search}<span>Buscar</span><kbd>Ctrl K</kbd></button>
        <button class="hbtn ico" data-act="activity" aria-label="Atividade recente">${ICON.bell}</button>
        <div class="pmenu"><button class="avbtn" data-act="profile" aria-label="Minha conta" aria-expanded="false"><span class="av" style="--ac:${avColor(S.me.nome || S.me.email)}">${esc(initials(S.me.nome || S.me.email || "?"))}</span></button></div>
      </div>
    </div>
  </header>
  <div class="wrap">
    <div id="banner"></div>
    <main id="view" tabindex="-1"></main>
    <footer class="credit">
      <img alt="Gomes de Matos Consultoria, uma empresa GM Group" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAABCCAYAAACLtKgIAAAMUmlDQ1BJQ0MgUHJvZmlsZQAAeJyVVwdYU2cXPndkQghbQEbYSxCREUBGCCuA7C0qIQkQCCFmoOJGSytYt4jgRKsgilYrIMWFWrRSFLd1FAcqSi3W4lb+JySgtf94/vM8ud953vN+73fOuTe5OQD0Hq5EIkK1AQrFcmlCeDAjLT2DQXoCJBgLCNgDzuXJJKy4uGgAgJH17/byKiDK9ZKLUuuf8f9qOnyBjAeAxAFANl/GKwRAfgDA23gSqRyAKAEA65lyidJfCwD60rT0DABindLPVfltSj9b5V8Y5iQlsAGIDwDImlyuNBdAawAAGMW8XDkAXRsA3MR8oRiAHgQAAYWFRXwA+kIAcCjm5UoA6Ep9ZvZnOrl/08we1eRyc0d9VS3DRg4RyiQi7uz/sx3/2wpFipEz7AFAM08akaCsGQB5UFAUpfQ1AZDX4uyYWADQBUBxIX+Yr/QN8xQRySo+6sCTsTMAwBAAnSQTJXLUeAKfGxIFAKYAaI5YFBOt5pTmCMOUHG0AtEoo5yQBgBEAWieQhSaqOcelRQkj517NkbJZavwxVzqcg1L/o6IgmaXSx3TzBBy1PuZakpeUCgBUACykWJgSAwBaAFiMrCAxSs3JLMljx4xwpIoEZS02AJhUIA4PVuljlTnSsAQ1f3ehbKR27HiekBOj9i/K85IiVL3CHvC4w/kbAWADAjEreURHIEuLHqmFLwgJVdWOkwXi5EQVjhtJ5MEJqr24k0QUp+bjwQJRuBK3AsCTZMWJI3uL5dIk9f3CyyTyuCRVnnh1PjcyTpUPvh+igQ0hwAAFMCAbiiAfhF39zf3AUEfCgAtSyAUBuKiRkR2pwxExcCERSuB3EIMAZKP7goejAigGMXz4AlViwlFMdXWBHHVMqVIAD0EKhRAFIhCAYlhJPJpBCjwAKQj/kREXGMCDIhBB0XD83+Mj6CeEBWyIViOKkRMZ9BEmMZQYQowghhEdcRM8APfDo/EAPAgPwN1xJu4zUscnPuEhoZtwj3CF0EO4MV1YKv0iy8nQAwp1XwWQ/Xl/cDvcHffEg3F/PECpjBviJuCCe+BMnIUH4n64J+4DbHXeyq4wvtD+WwWf3SE1j+JGQSljKEEUhy93ajlpeY6qKHv9eX9UuWaP9ps9GvnyfPZn3edDEUR9ycS+wQ5iHdgJ7CzWhjUDAzuGtWCd2BGlP/rEPRh+4kZOSxjOpwBE/3hmPt1ZZSdlbg1ufW7vVTG5YJZc+WVkF0lmS4W5eXIGSyIRCRgcMc91HMPdzd0LQPn+Uf28vYgffq8ghp2fsMW/AfgfGxoa+vETFnkM4HtvAOrhT5gDE0BHA+DMYZ5CWqzCcOWFAFSggz4YgzlYgwO4gDt4gR8EQShEQiwkQTpMAx7kQSFIYSbMhUVQBhWwEtZBNWyB7VAHe+EANEMbnICf4BxcgCtwE3qgF57CALyEdwiCkBAaoocYIxaILeKMuCNMJAAJRaKRBCQdyUJyETGiQOYii5EKZDVSjWxD6pHvkcPICeQs0o3cQO4ifcifyFsUQzVRfdQMtUPHo0yUhUahSehUNBedgZagS9DlaBVai+5Bm9AT6Dn0CtqDPkUHMcA0MEPMEnPBmBgbi8UysBxMis3HyrFKrBZrxFqxDuwS1oP1Y29wIq6HM3AX3A+PwJNxHj4Dn48vw6vxOrwJP4Vfwu/iA/hHAo1gSnAm+BI4hDRCLmEmoYxQSdhJOEQ4TbhC6CW8JBKJhkR7ojcxgphOzCfOIS4jbiLuIx4ndhPvEwdJJJIxyZnkT4olcUlyUhlpA2kP6RjpIqmX9JqsQbYgu5PDyBlkMbmUXEneTT5Kvkh+RH5H0abYUnwpsRQ+ZTZlBWUHpZVyntJLeUfVodpT/alJ1HzqImoVtZF6mnqL+kJDQ8NKw0cjXkOosVCjSmO/xhmNuxpvNHU1nTTZmpmaCs3lmrs0j2ve0HxBo9HsaEG0DJqctpxWTztJu0N7raWn5arF0eJrLdCq0WrSuqj1jE6h29JZ9Gn0Enol/SD9PL1fm6Jtp83W5mrP167RPqx9TXtQR09ngk6sTqHOMp3dOmd1HuuSdO10Q3X5ukt0t+ue1L2vh+lZ67H1eHqL9Xbondbr1Sfq2+tz9PP1K/T36nfpDxjoGngYpBjMMqgxOGLQY4gZ2hlyDEWGKwwPGF41fDvGbAxrjGDM0jGNYy6OeWU01ijISGBUbrTP6IrRW2OGcahxgfEq42bj2ya4iZNJvMlMk80mp036x+qP9RvLG1s+9sDYX01RUyfTBNM5pttNO00HzczNws0kZhvMTpr1mxuaB5nnm681P2reZ6FnEWAhtFhrccziCcOAwWKIGFWMU4wBS1PLCEuF5TbLLst3VvZWyValVvusbltTrZnWOdZrrdutB2wsbCbbzLVpsPnVlmLLtM2zXW/bYfvKzt4u1e5ru2a7x/ZG9hz7EvsG+1sONIdAhxkOtQ6XHYmOTMcCx02OF5xQJ0+nPKcap/POqLOXs9B5k3P3OMI4n3HicbXjrrlourBcil0aXO66GrpGu5a6Nrs+G28zPmP8qvEd4z+6ebqJ3Ha43ZygOyFyQumE1gl/uju589xr3C9PpE0Mm7hgYsvE5x7OHgKPzR7XPfU8J3t+7dnu+cHL20vq1ejV523jneW90fsaU58Zx1zGPOND8An2WeDT5vPG18tX7nvA9w8/F78Cv91+jyfZTxJM2jHpvr+VP9d/m39PACMgK2BrQE+gZSA3sDbwXpB1ED9oZ9AjliMrn7WH9SzYLVgafCj4FduXPY99PAQLCQ8pD+kK1Q1NDq0OvRNmFZYb1hA2EO4ZPif8eAQhIipiVcQ1jhmHx6nnDER6R86LPBWlGZUYVR11L9opWhrdOhmdHDl5zeRbMbYx4pjmWIjlxK6JvR1nHzcj7sd4YnxcfE38w4QJCXMTOhL1Eqcn7k58mRSctCLpZrJDsiK5PYWekplSn/IqNSR1dWpP2vi0eWnn0k3ShektGaSMlIydGYNTQqesm9Kb6ZlZlnl1qv3UWVPPTjOZJpp2ZDp9Onf6wSxCVmrW7qz33FhuLXcwm5O9MXuAx+at5z3lB/HX8vsE/oLVgkc5/jmrcx7n+ueuye3LC8yrzOsXsoXVwuf5Eflb8l8VxBbsKhgSpYr2FZILswoPi3XFBeJTReZFs4q6Jc6SMknPDN8Z62YMSKOkO2WIbKqsRa4vl8g7FQ6KrxR3iwOKa4pfz0yZeXCWzizxrM7ZTrOXzn5UElby3Rx8Dm9O+1zLuYvm3p3HmrdtPjI/e377AusFSxb0LgxfWLeIuqhg0S+lbqWrS/9anLq4dYnZkoVL7n8V/lVDmVaZtOza135fb/kG/0b4TdfSiUs3LP1Yzi//ucKtorLi/TLesp+/nfBt1bdDy3OWd63wWrF5JXGleOXVVYGr6lbrrC5ZfX/N5DVNaxlry9f+tW76urOVHpVb1lPXK9b3VEVXtWyw2bByw/vqvOorNcE1+zaably68dUm/qaLm4M2N24x21Kx5e1W4dbr28K3NdXa1VZuJ24v3v5wR8qOju+Y39XvNNlZsfPDLvGunrqEulP13vX1u013r2hAGxQNfXsy91zYG7K3pdGlcds+w30V+2G/Yv+T77O+v3og6kD7QebBxh9sf9h4SO9QeRPSNLtpoDmvuaclvaX7cOTh9la/1kM/uv64q82yreaIwZEVR6lHlxwdOlZybPC45Hj/idwT99unt988mXby8qn4U12no06f+Snsp5MdrI5jZ/zPtJ31PXv4Z+bPzee8zjV1enYe+sXzl0NdXl1N573Pt1zwudDaPan76MXAiycuhVz66TLn8rkrMVe6ryZfvX4t81rPdf71xzdEN57/Wvzru5sLbxFuld/Wvl15x/RO7W+Ov+3r8eo5cjfkbue9xHs37/PuP30ge/C+d8lD2sPKRxaP6h+7P27rC+u78GTKk96nkqfv+st+1/l94zOHZz/8EfRH50DaQO9z6fOhP5e9MH6x6y+Pv9oH4wbvvCx8+e5V+Wvj13VvmG863qa+ffRu5nvS+6oPjh9aP0Z9vDVUODQk4Uq5w38FMFCONjkAf+4CoKUD6F0AoE5RzYfDhqhm2mEP/pOvmiGHzQugUR8gvh+AfQ1g/w4AuxwAeiZAHA0gyQfQiRNHPyOz3PDcqTSiNsDWxA/Zhdn/buZTzaSf5f3lCkpVD/hy/ReSD4MHGbTbCAAALlFJREFUeNrtnXe4VMX5xz8slyYQCyiKStPE3sBCLMQQjYlGgyIaOyJK1Igao6jRX0hILIktYkwgaDRWLAlixIKigt0QVEwUG/ZeQFHhell+f7zvPsydnTlnztndy16c7/Pso+zdPTtnZs7Md97yfdsMG7IPKwjHAAOALsBioD1QBOYD1wMvEBERERERERHRCtGwAn7zIv3dScBEx99XBY4ExgFjgefiMEVEREREREREguXGcGAoMBqxUvmwELhEX5cCqwAj41BFREREREREtBYUWuA3egNTERfg3inkysZo4DfAvyLJioiIiIiIiCBasACxQHUGKgn0eh34kRKsqcCJGUlaRERERGtBW2Bp7IaICKIFy4MDgbuBq4GjqnTNSUrU/k+JW0RERMTKhu6xCyIiIsFy4RuIlakvsAcwuwZtPlLJ1nTgoDiEERERKxGWxC6IiCC6CC2cr8SqJXQfngF2B04FpgGHAh/H4YyIiIiH3oiIiJXlYd4TuB9xCR7Qwu3/g/7+lcAFcTgjIiIimmGa5/0hiCcAh0zONNJja88OOHBPzdnmnYH7tB3T9XUXcCeSLGXj3JTrXZzQB6XfuRO4SX876Z7u1LZMA64BeiR8frp+3ryHu9Ug4GvnTcCtwOWBfbUacHOc5qx0Fqy2OhHmAd9dwfcxBBgMzFSiNTUObURERATf0014gfX+DkhWN46s712AKbqu2tgdCdO4P+V3T0PcnYOBGRnbfCKikTg54LN9kWzzsR736vnAScDJjr8dj+gtPqD/bg/coa9LHJ//PrArIiUEsC7wIHAI5eEwg4HPPX3owkxty3Sjn58FNk/53o1IOE4EK48FayxwO3AEMKaC398ZiaM6HtHJ2hNYI+e1ZgCDgG/r4tA+Dm9EC+AE4A3geX29AZweuyWijg7RX+HWG/zE8f5XSHWNvZFkJRv3INqEn6Y8E6/qHvG7HG1eL5BcAQwE/oskVNnYCzgasSK5sIpBrgAaldgc7fn8hwa5AngL2Bi4zPHZnYArAu9hMPCwQa7Q/79ICaQPmyBC3L8EtoxTvfUTrO8o035OydDCHL+5DXAdMAHoh0guzACeRqxiv1CC9LOc93SGEr8pSgQjImqJ9YCewEb66gn0it0SQX1JP9ho5/lsqXTZOLWOmPg3MEvX6yTX2FmIJ2GYEqBaYjf9nUW6t5TQE9FQ3Br4wPNdnxzGR54+XOz5/FceS+C8wHvo46lYcmWKJNGViGXuFuDwOM1bt4vwJiSQfFAFv1e6xiGev8/RUw+IZWumEq4nMv7OQiWAw/RkMAZ4KA53RA3QaB1UCsRMsIjWiyLQUQ+nOwEvARsitWO3UmI2CfhWwjXWAv5kPB8jlAyE4oMMn+0FvIboJP4X2Ezffx7Jau+ZQIx8v9PV8d52wP8c7w+g3P0KIrcRWk/3SuAdJbSNgd/ZHHhb//8FxJIW0QoJ1qmIufgwnch5MALRwzoceDnwOzfo6xr992E5fvdmfU1QojYkDnlEC1gHIiJaM8HCiANaBlyvB96f6Ps9Eg4R42juerwCODMDwWqPhI5MUKLXpG3o5DmYm3vYU0gW+y8QbwuISLWLGPWz7hUkPOURYF/H53dFXIQmtgJuQ6zYOKxS05QEtUOsXKsoOXXFpO2IxLV9igTD/zGlnyYg1jsMiaQkDFPyuThmqtbkmenssjg2pJS4mQb8BbFadTDioz4PPKV3QgLOH9bTUB4cpqeHfyPZIrfq+x30pkLaM0rvZ452wvgadHKpPUchvv8+uhB11L8v1oXnNSSTZKJxAqGG7ckyXsT2rDTt6Ylk2TYZC2ohwXrsa0/J1fKZfr+o68YhLdw/GyNxmk26icf5E96eNhVcdxeWZ9hNTnGtgcTTHmu059f671Bsr/vOqBwHnEOUyByiaz1InNJtjv7ZSInc1UjmJNpnO+AOfemJJHNtqSRwJ+BxD7kq9dGeGcZrvrFHjlRS+CPgFc+z8ATwpfHey0qyPk0xNvjQWQlgG8Td+sUKns8rRXsaEuQPfgFsYAzwKnqSKP1/2oJytp6A9tQGVYIngW2RNNaj9JpZ2/Ma4qOfi1jUtq1ySYo/pajWdwTW0ddA4Fd64tqmRhMia//UGrE9LduevYH9rWSPRiTraWKG9pyk12qwrnMVzYNya4Fv6HO1G7C2bp73xPmTqT1Fj9tpaaD19SEkE++3AZ9dG3GvnYRkGpYO2UUkpvaygGvswPIwEXIIs/a2Dq4bIYHsq1v9s7uu19MCf6cfsIW1v81PMCy8V8H8maSv2YgL0sYU3RP3QmLmPtO27Z/RFYtlOWwyyN+KJjQrRXsKnnTR0UhK6ivWKch8JZ00H0XMqYOqQK5MnIxkeJRSWkPaY2MLPdUs1oeGKlgK3s9YEqhJF51aTpo2OfsntmflaM+ajkza9oS7yUvt2MdxEGuPpKjXGqci2nprszwwu12cP5na0+DxHuwFvBh47d8Gfm6MWn/maBsadP2fp2MZgu10/wj9rB228rZD18vVPxsinoQsBBbLFXpWghXu6cDxGoBIabjgskZ9Sy1eU/UZb6f3eD/L3aJxPayT9tgL562IzMHLjtPp58Yk+xy/X3gdvUat8JYStz/r6ersjCee0sJ9CRIU2amCtmyC27+PEUT5IhLY3xFYH/im9nuR5TENtUDIeLUkYntatj1b4NdFCm3PDrqI++Z+rbHAQRILVT60rezz5wolEj0Nq8pIxIKfNzDaZ/n/mVqurtVT/ipGIPq/ETdLWl91A14nPCP9yZTPfOHpn64ZPRgub8/juHW+Ng1Iqiq1ZyHwDyQTECtj/33H9673WLVuQEJx4npYR+0xJ836wH741X+X4DeD7wGcw3J9rJbAsYhGyGTEV31khu/eiqgRd0RMsSPJZzJ8xvO3uxCL1tsJ7pudEc0kaljTrJ6y2VbW9rSp0/7ZMGHebo6IGKa1J8l9vVELjFE7z4bZGOdzcHtG6jr3tvZdF31/X9wurkLguHRyuPZQcmW35xPgXSRwO22t/SaS2PQe4sJcpr/3AuWxswM8avQ4JBTs/ulYhWf8GOAxx3PSR9f/na3faYt4h8z2PAn8AHEH3gq8qdfbGPgh5Zpfb5IchhLX5zpqT4OlnktgRgKWP/gzD6uuNeYj5thjEbP0KMIkHTpZKvAjc9ZDdJ1qjkOsa0m4vQWJaERt0VSn7Von4W8HI5ldaTggxQVZa3yJWxYjIhsO1VdJUiApk3t2wKFhH481p13Cd9YnXBNqVaMNy/T/F3iSlwgo5eZCFi/LMtzyRL5DyBjdYzoEXv8RHZtN9Lm913M4fyzFxT8gTnXqVqbhW9bCOjJAeuF4ZfGzV/B9/FlfU3QBTquJeArNTdJZcYTnBD8ct6JwpRiIpAn3QGLH5iGZPe9lvE4/JG5hA0SnpY3215uISXsO6WUpvqenzPa6AT6KWDzzJAxsj5jYe2g7XjRSm8mQRXQQIijYFjG5P1yjAOyeBnF5R9u5Kvmz4nY3lJpfR1w5z1WprUkVEfYLJFj9U/oiDavqKX4rY74t1DlzjxHk67IYLENcLSRoFLVNmXedEGvxNnq6zzs3vqF9tqW27QNEcHNWK1vvZ7eSdi6k9eNLzwEhCc9V8fmPqDOCNcuoTdUVkWf4qWfRuhuxFNUbYy7VJHwKcVne5PjMpjRPG86j7XWe471ZNSBXNyOZIT68oxvlVfhTgccisV59An/zdqRExpdWHMfBKSbo2YjWynzSXas3GO5oPErKY0nOOuqsZCxJ+PZpJKPpgQrG4BCkOsBmpOsGheBifa58fblYDws/p/K0fQwXzadIhhWB7r1NrDbOs763XkL5q9P0QNA15Tf+q+Nzb4Y+3cMgZkX9rQspLz1yecp93qsHpbdTDhS3pBDNWUjs0TNxO4mIiGh2Uhw2ZB/bFGpiIs3NsGP11L1fDutJS2OSbii70zxw8AHLvXN8YNo6RqzBY473NyM54J2M2jMzCRc5m4m74PayCtrwIyRe48aM39uf5VplLgL8zwz3NQcJxrWxZUCWTqVxUh309/MEc19CeXHZvkpCVw+8xrs6fxtzWtreMv79HyUUp1nje0cKETyJ5S6MJ4x/+/r1IqQOXUNGkb7raS4kvCxjLcjLrMPAcMLFFH+KJOdUMlc/QNTLqZLl8eO4NUVEsNIpuX8PuI/mAZKbIC61c5BU0J1ayb2V2v6obhbrWBXSi7qATsx43QM9lqRqkau+HnL1PyQwuRMiodHBCEodpN8JLWP0sl5vCRI3sQPLU+FL+JfnPp/QTX9dRH3Yxi16rfcccRuuDes2tY6sjaSOdzPuawCSfbStwzKFJ0ZhAeLC3EAJ9B9yjMFqumk2OGIu7kC01JYiVsF9A0jTGrgFAx9QEtdRDwIbWppC72tbsqKXwyp2lUWwDk8hWGaA7R1IyZTRFnHpaVmALnQQy9n6maL2w3aWZayAWFg/ILvVrskI2gaxWrnI1b1KWnpRXhvvcp0zZnHhHgnkahaSRbSFPgNNiGZgRERERCLBmqGb5iPG4reL/vvoBFdUveI5JJhxmUcYdHSOa7qCJu+rYpsfd7z3Y0T3BCu54MfGOO2kp/nxAXFPT3qIo89a9RkS52RvyD0Q14h9ep/mcB/fZv3bJ7L6F5pbTbdB4vxKRHiy4ztz9XNLraDaiYTFGtl41fFsXKb9a+M9xIVISkKEifd1o5/vyEqaYMUwTfaQ+iRs6ohpeU6JVkcHgcJhmdrIOoh080hBvG1JqMxWMvmbhEzFEWppMtehkw2C1UFJ/CTK9eXu8rR9e4di+DzE2tloHWCetIj8jda8muIhVoMcltQ/AH+PW0lERAQBKbmPWqfC0gJ4qeVuqxSDEZfjqWptOhHRtBpV5Xv8t+PU+385yRVqHbFxf5XaegLl2VlnOMgViAvjVWssLyDdHePTjZmMZEDiqVh/h4dcfDsgOHqawxK2TYLLZqZ1XxcmZLY16UZnBzu/kUIifLjOEbg+0UOuQnA65Rl9fTyxahOB31OeyZe13uFGnqK2D9A8WLy75/tHGnFQBSVnXzrmkutZ2Fbb/GxKcduTPfMfgxDNdXzm9YT5a8+LjR0u1vmedexmK6nEPmAM8hDnPeI2EhERQQbNk8vV4jDLWpDv0Q2jUlyum8ZYPQFOQjRSxiHxO5dXQay0LxLcO8By8YxXcpIntqaLp89eqNJ4/IrylPTzEj5/LuUB5MNzjDdGNqYr5ueVhO+8YhE9jDiykjXih44szCQMd/S7T3X/BapbuPlgygPuKyH9p1v9fmFKdtEYh97KqRl/szfl4rw4LC3DE+LoCobbFaQyQ8GaS5WouV+CO74Rj5wKHkVtlGD3sd77R8Jvz0EC7O17xsjqxKpu8XVAGyJi8fds99ohDjnBLsLtEXfXY8Ypr1RJ3dzU+wdIIeDJMDosZcP6UC0px+rpcGyO3xlKuTLuu3qiXYhkSz6rFp8xGa7bw/O+TzD0CiWKSxwP3le6gVyhm25vyt0wj6S05xrKA3RPpDJX7seUx2OlPURvODa49Qx1Z6x4oOkB+mafGVloTYiL+qwaL2hnO967jPwZfAMot4aNC/j+EwZBLW3+52X4/fUtS9NrHtIx1GP1HOwgKq97ZD8qwWdWpmEv8umO/dST5JKEW2ieGVpEkmDe0d9oyDD/WxvWQOLGvo9YO7vo/ReVOBcQ9+pVGeedjQsM5ff2iHfkJmoTb7uZHg7bIRmzY1ugHwfr3OuvxLxg9GODtmem7pkzcv5GP8Sy22isdW09+nAf6mH3YbJJ3ZDBw3IMIlTswiI1wlxMupJ92j57unHYb4/b4k2Ogs3nqDHnlZQEH7O/l1Ke2fyF7lOPJF3LXEQO0hPue5YJ/WDERfAb471hiPl+iww3N1YHfVQGbat1EemDozNkU53rsLLNpnmg9O1IAdNT9PT7wwwDhKekhwtbkWwpazL+fpBjYb87QGtlkeXS3boGD1Yl2Yj7OQp3h+B1YwNsQNw2Sz3usB5Vymod5njv6grER4dSHgsVovHzlEWwBuSw3pqWptcNC+7LSAIADlcYiOvWJBR/NeZA0bJibUh1ldpXI/9GZyONxD/ssdyd5jh47rySECtbvqJo/PcpxNL5hY7DlsDv9EDwD7LHAWLpDYJkod5UA6vbBGNeltbQWhKsc5RsdDF+s4C44p/Xw3wbJAlkMOJeLqrRIOvhd18lNasErDmNSkYa9Fm/S8nnhxWSnavV2NGo+/6BjnHsreN9ApKstEgJdh6C/gPrnpvUENJYhfl/mK6HF+IPATrWWgObPHtPW2OteEAPLbNdLqOeaqlqwO2OGKcDbWJzPSn0JV01/WpdqCfmqDt4hJKhYQGfn2qRqyKiueRK9S8FP39fGSsVmH8bE1yKTSkWxE+NwqUNDldGSB8R4FppSRSNPrHjgZ4lnGDhqK33tEdPaYMqtHtjjzWNnLXatnG0MwSvOU5MbStQcX8efwD3zg7dL4xYuQUJApBZpAkG6LM5RRehDynXAstrjdwoh9r7/xzu8/56aPmI8hIk81PEW+sdJYHVjaykpl213wcgmb4/0Q2up77/RyWey8jntcBh1a8m/mmR/gZqJ1S6l86PMwxyVUSs3Gvo8zBI+2kYknjUVg+9c9VoMDejK3ah9ZwUHYWH2+hhZaSh0t8BSYL6IMP+hqO28LuIusA7agzY1kOSX0PimtvonOmmxo5PchxQ7HtuqFIFhwXaTwtTalfaFus/KsHcU1+H6Xsmcd0V8TxMdxEss2zLTQklcfohLh6MuKxXEk43Byo5O8JDBEJxsk6sixNOMfNZLpRqWs0OJjljr6Anq5DFfTHpoo5YwcJH6qK1r54ofEKVG3jcpWl4x3G9depgQV/sUcqfS7Ji9i6IW3GAowgs+rei428v6RztTX6V9kIAec1CsNbxBJvjEWAdgMRFHWy1pUiY+4wElytGED8JcVhmKY47U+ZamsWpVOVhGZJscq5uUlsSrgdGDqvy+4RpV+GI5UJPok2OxISPlCCsRuvBdtr/Oxpz6iPdKHcnXY3+F0oePkJCEi6qsD0jqnx/P26hOKjL9QDf0cqMbqv70yckZ7Nvr/tMKfHimzkP9UlxtDfo9a9yFOG+LuP9vqTPL4i7uGeKWw0rjvRAY4140BEvTMYapFSptmkhZX40eBQHHtQDyQwkIWaMru9nWWOzG4Y3pYDEiPQPqJReWqg7ISVNTNzoiOW4FDFTVksj5la9qWssS8N2eqroQ7m5f1wAo8Uw++Yt4eA7yT+KFD+drJv/ZAc5WJpQsucTwuJYbKzLiseyhFpjfRH32TlK7v+rc2UhErMwPqFPH9L5VvQstq/qSWLLjO3t7smSrIRgdXOUjumhp6DTdU7P1jFcoiTkb44szKYMY5r2uTnWaXAPy/JpEn07KP5th4W2rSf2ZpmegPtblqVndJP+ZZVOpa55ElLtvtFjcUY3qOmeOTZCn8vpgeWCViS+46jN+rTO9dkZLQrdlWSdEJCtTEDsKFWqdFFsgX6cgoS2FKzs7iE5LEKlw9MLNZw/R1rEuUEP+aGWpE91HSjq2rR5jjbcZMjXFJQHTIBWG7Pow+8cYU9r6d5PwdHpIfEe30LE+4qWlWmqfv9iJUNTqnyjjWqeG6av4bqAdLAyBTdIUBM3sWNg3TXfBkNK2RAS6qjZFqy2nmKiBLjjCMi0amn4iPppehK6RR/APZUwt8dtnbtXH8wjae7GOiXl1P50xo1glZwbNSlWKSwz8ruI5MW5ukBv7ZBFKVkZZiGSBmdmCBrtG2B1nWHN3c5GHKCJBwPmfx/HZ05xaEjtqs/pAF0bzstTnT7QglUN4rZnyvzZDbFwnlSnm0J3yktEvVVhjOYmxlo/lPCKBP91FJ+uBvZX8jevhv14EeIZKVhxvudVQAov0EPT8zVs90EOy9cfAve4rlYiTF6cZ4x9gx5OTqf1IY3ET3SU+xoIDC44UsZDN6XddeMz9XL21lP4JTkKXWbBOEQv6AqHZEDHQFPmUMvCsDRD5hM5q5gXE6QTihlcj2km469oPenK76hVZSKSzLCrEo5SkOjuSKbOVZSn+bdBNM0+8lz7RCR+L+/YtKtCwVdSMmbnIvGPo5F4wDX1vroj8RxH4Q/IJIDwvEuyZlTRiLs6yFLFJ+Bava2xXMcRsDrIQdaqeehKI7Z5MUafr98nhAdcyHJXSj3h+YBYNXLExvxc58wtgd95Suc1Dr05KrSCLUEyf2+rkSVrB11DClbC1JlVmFcv6/peKwmQtxzP60DSLXU9rJjR6VQvcahByen6rHw40zEHTyo40kd3JTwD4zjE9Oh6uHeo4c08qhuJSU5uyxDo3JNy1fIsCwYezadKiMgix99Wz2kVe4f61dT5AAmaLJGo9ZB4kFFIav2DGS1H45SMHOWwiDQgFrPOOYnz2lSWHefKLh2l49pGF7OtleCM18Xswwr7fdMAUnSDRdBL83dQgnAnuPXONjIyxtZyrA9313ieue6vI9mti3hI1DLdEDvhDnco1KHr4xzH2nFxFSyy6Dydh7h4CXRZv+2YBwdX2I5D9Tn7UxUJtY07HQfY71Tp2j/UfjyshvPgrYyJIntbe+rvqE41lddY+XXlnnTMlR0LxsPXZAlehmYevImYxxZbC9xjlGsgUQVf6HsOJv6wh/jgsTa9ZQWzLQzQzcFT8gXPCS0rwXohMC6IlIyxQo00ULKio+HqwsrSmFGlxR5LHXxVj9vptwHff8NDxCshl+96zMkLatjvWwQEcy8xso1KpGxna6P6G+7AVzwWsyOtBWYRkjVVa3wa8Ey4sCbuGp1JuBAJj8Bh/RxB/WCMY7H/eRWvv3lgzKq5vrkO4jeSPxOx0TAEdM9Q3JsMLrZVHTUtq7VuzUfiRF+r4TzIQjyvdwgJT65SO66yrDu9KjRK1CvsQ3rXgvHwPUq5ZsltpAvJlbJR1qQ8e2d8FU93g3WzXsuRITEIkYG4KUWi4CDcpXOymM6vxe3KG1Lh/f3HYWIckMMlRA3TlMlQIaC9kYFCgsp4NbHEs6kPDPjuIsqtiO0di2yWTeUxj9huLbG+4wDkwu1WTOUlVnLFwkACsrqnhNS8Fpxvb+bYWLYKJJA2XnSsiwWPFMyKwAkpY93S+Mqw5t7pyDInZyZigTDR3rw410HaWlv80CYp0iQYyS39HckQ1cIVDvL2+5WQYNnepLfNmx7kWDj2wZ9t8rBafcYbG1QPyi1Jx1CeyUIOhW1XQeVBiIkYxCp1ABJEeKBH6PR6yrMI1yRbtth7HmvZxRVasCY7Hui9Ur67miNOax71VTLiRo/ycq0wxyP/EIJHHJaJgyuokPCPwA2QKgc3Y5noSYnD6mKR+X8S7nJYz0NqPmnBuXaP4719coiTTg38vdkVzLFaY7hD4uMa6qMc2wGebLMsmIRYr35V5aQGm6D3Dhz3esWxVt834XfrDnfIksytYlveyHnobU1wVXm5r+DQwJloWVL6q8upg7Gpl+ISnvcoQd9MeVbXh+RzuUymuYo8iCVrddwaLj9C0svPstwdv3IIWa6e010zymNJujhjaSJYHlz/nMOCsmPK9VwlQv5KfdW5HI87u6RW6BnoRsLjvrPv4TSyx5otMYoBf+Qo3tylhve/ZkCwM4h1bXGCSZ/ArNZ+nvilHlRPS42UuMS/5SDx++N2M5Oj1iNU3+WdF/0dc/j+OmnbIuBflAdBZ9GtOkr3n3Nq2M5hDsJRLwdXAkNpLrXiqWbhz+o/yNqbihlCbkLxUYCFjVZWs9nEbxzvnVTwkIdxjpiGhXrqew4xpSeljR9AubBYNz0Bn0143cI3Haeeko7LghQCdDaSKTgFOJxyd1wlrqonKE/LLLlVT88YL2Li9wn1vPCIAOKIE6kHfJVQeLcbtQt+dsX9PUO41tpHDuJ8auB94rG+FnMqulcj7uLNhM/6nuFZGRbKbxquMxJiwfKefJtSCkKX7sNO7Ng7IYZxT8fzf0+Gdh3gcfGvaPRNyFatFwytwIo1UUn+OdS+pFBDhoL39YS91CDSYJClGR6LLZ7EGEiPR8yKDx3egZ1aSZ9+QXoFkGMsa+EZwKJCQt3AIymPM7oPiYF6nLC0xf09TG8xEss0TBeFDroY7qrkbr4u8rZo4j8I03F5UDeaWxDxSfM+7yJ7bTc8MhUfeXz3M5Eiz1juvINT2PA4hxXrFNyaTw9bMhPFGluGKl1Ui47EgOcTHvzOiJn7ZZ0XGGb6qY7TT0k80SW0+X8ZN8+ig/iekiGLE6umpl32pxcSEDk8pc9mZ4wzWS0wy46EzNnZGRfKgiFKWsxYDzAN0xwb3dq4pTeO8BDrXo7N8/aUmpnzEdd2b4e17nnPmE+oE4JVDKw+saLQSHkoyn6BcXNHJ1gLqolegRm09UKk++rB/nnEQtjBOAwdYdUWJkFgt5akfHENisW3FJKqaAyx4tWKSBmd8/C4rDDcBK87Yp8KNK9Cn2YR2FRPdx0tsnYIYposZAg6DNUf+R7+TIlDqG68y4cOxe5dWB7Ps9gK+iZF8XxXygPxL0D858/q4r61JyvlDOpbVXqWIzX4Pl1039bTaRftT3O+/BIRTSwFY/ZXC0Uj8DGSrt3Nk901iWwxdjO0v39uPR8XIBbDmYgltqNab3YLXBA/sxayLohr629qfflUn4u1aC56uk4Gq+/mGasB/A34C34JBwJdYd21f8ZZ47abzsvTkQDnTxGXaj+dq11TrIFfIq7MgQ6x2uN0vvya5RIXt+hmXTD67jXEvfO+/u66jiSXs4372hKxWvZBYjmX6BxbBXfCQzGDZEGt0TmnWDGOw/RiT/JMk1H0+xpEdDQrhjjWvVtIjpuboPfSEofI1R1jnCeU5GLKhWgbdS0oGIWpNw4s75RkTTMLsT+iv/tklfXlqGJlj0KNShrVAnfpQXWm7sFtdQ/6vq5nDYYVe4RJuBoCNptN9SRofnZrnfCjCNPB6KQLbZ8cvk2M4PUQbI87DunCKpbtsTeXGcB3SZYr8E3ijg4Lwk8cweGre1Jbi0qEN6zSQ7MsRx80BSi5P4S4dx503HN7TzakuVGXxrDRIKvtE7SqimqpGEW+NPdFjpPy2gEFbxs9qvCrIVIcfRzzfh380gLdlHQ/ENDuzTJuro16Mu+TkiWL5bbr74i7nI7o0D1rbVB9AtPxmzwEZkdtZ4Pj1N3F6stheoL/ofX+RrgzhYuIhdHctC8zNr4S2VgnYY79qY4sx1/mFCt2kbLx+gy31TWhiyVFUcxY7BuHN2I/y6XbPmGNGqHjMpaWl/4opGSnk5Cp21b7sYP26wBrHS8G6vTZe8EC4zA/07H2PpkxnKODo6xXNdHJ8ex8QuvARCTUYjskvKCTzoknEA/LU/qZL/MEbz2HBKx+5MgOnJLRrPl3souU9clArg7A7b48qUbkCsPt8D1jUhcDNTOu0JM4jsD+fikPSdGo+diX6umidLPa3xSwSK9hkaxG3FlVT+jknJhBefklY+x+6xDGxRMndHSF0hnjdO7dm+E77yNyB6M8hHMDtXaEnoY/0A38AcIPF43G/AjZXKfrd4pKKt8L6NtGazPe2CizsYZhbcjSb1filk5YpuvP0x6C2OBIcjkuQKrkdd3UR1Oe5fkoYdIQ+zq+vyLxsmNN75jzWqPVOjUaUTM/ytoDChVaOYZ6lMTxFFpeWkGmNlXIetsgx3VmGP14nP53pGMPzqpCv8CKl7TDCL6tfUYFgqTrt4B19QlaB87TPt5H+3ZrxNI9CAml+qOvakebYUP2IWOF7Q0cwZ0DMur0nIPEZ3VMkIC4EH+6OJ64sV/hLgA8tQUHo4MOxLZICntHw1X4vpLGxwgPvO6pxHEbPUUu1QfiwQCCuw1hMgZYmkhdrRJIswNSVNfTk1Bb3fSeDCSm31Uy2VkX7CW6wM1WcuPbKPfQyb6+9vFi3WDuC4wRJKNw6P76e+vq/S3Vh2o+ktL8UEZX5AAkNmIzw+K1WK/xtJKq13IsYptqH7bTE2JIcO52Ot4vBmZcbm+489olLJQDkWSVjfVEXNpMPtUx/o/228eB99dPrXm9tK/mInUdSXBL76FrVoOO1zy1cs0JGPO99R5KY74YiXO5O8PzS44MsI+pbpH1bhVeEyMup5tl7TwspS1zEwqv/93x/VUcm9VXeoDrlKCzNMLKVuxKZSKjf7fI+zzjIFEJtnesT30SnvVRSpYKKZnL/7b24aKuryElqi4Fjrd+o9oenyWOA35Hz0FsGGL1LgRUBslqCLkdCf+YkJAh/Kr13rZ5JTqyEiz0h/o7SrOsn6GeH4bbpD9i8iwtXnmyF671xHNtX6EfOiIiIoIWTrGvhAy5NtqDyK431RIEy0UI70bqV2LEMR2LFF0+s4UIVltP2EM1NvkBjhjbahCsEhFtsLwP7XKSvnsDguMrIf4LPUk5INbNm2pIsE6mXJIniWD1DziQkVffwTVB7qI8huTzHGbUBYgZ9VY9ieYhV9ORwPWClbHQO5KriIiIrxn+YrmcCizPvqtHXEG5ZXoNmtezbFeFAstZsJRy2ZEita/CUCm+69BdnBsoO7QkwPuRF0McbtDLU0IGCMh0JKdG4Of1JKCFp1DlVZS7xl4iXX28mvgf5Vlc7yCm5NfjWhsREfE1wyRHNuZuddzekQlVBs6n9qKiPpzkIKp/qPOxfwiJAS1aGlchsWu/s77XDbfkDTmFuQsOGackwleoga7edxDr5GvUOcECCe461/H+v6h9OZBVEevXJg613Z5EREREfH1xssNicG0dt/evVnt3Q5KoRuuGePYKaNM0xyF9IOEJRSty7F+09vjRpFvfxlGetPDrKrXp+zS3BF4YEK+1qAoly3BY0jqkiKTXDcEqsdATPEFztcr42EHJlZ1GOpPqBCFGREREtGb8mXLX0CFIAks94hgHIZyABEVftALbtY0nM7DesTHNY8gKuGv54lCBN8fh0Cq05RxHLd+Q4PkpVqJVpW7u3oiL8D/1VmMHwwW4hr46WLoxP8ZtYq129t6hSAYeDr2R76zgSe3rn9ie2J7Yntielm7P1ogUDFYAfEu2p/TfDoFWLBxxT2NW4HgtUMtJ0QpIv47KAuipQd1OHOr4RUuiZ05K/zyFiA8Xjfeuq7Adp1g8o0/g9061vteByow2t+l9ndmSz3sWgrUK4g9f5hBSnEp5ZiFImnO1HuqxuKvCX4W7TEZLI6l/Yntie2J7Yntauj3foLmYY1cqK4FSCBAYNtvj+n8fjnOQqwvqYLxuQLIYTRxMeXA+OUVMISzTjxwip9db722J3yJY6p9TERHYonGvQ3O2Ya4lzbAB4dppSxB9qaJltNmbfIr6mygXubsl508hoxaQ+cKhr7Q25SUWBiAChJWc8q7BrXH1V2XIbepggUvrn9ie2J7Yntielm7PGkjplKIRvLyE7CK87a2NpYnykjI46mJ2ytA/l1h70xl1Ml4TkQy9JktZ/okc+5qr39eu0Zw4jObF3guIaOzAlP4ZRfPyT7eQPXntfpaX7voACel5JeN4/QbRxLSNOaMyJn0cpxxkp5aeP1kI1ucGg1vk+cx7+kC945BxWITET5EjM+JQT9HoMSntaUmE9E9sT2xPbE9sT0u3ZyfgZwZBaI+IOM8O3DhPN2pllvBUykZnVhRYlCFAu0lfvyebrEKtx+sBtTTdZgn0LkasWWsHiDFPoTwx7LYUq8oyTwWPUHzLseffH9A/5yHlpV7R35wSaLUbiFhJdzbI6VqBAsau9vwYuJpyKZLZJIcFDUdc5Ici8dl9Kyz7lmv+5BEaDcVTuEtfXKs3vzQgfXc8brX3XVoyEyAiIiKC1iE0GkKWjkcqLzQahGseUiuzZPFYD0mN7wN8gVivFiKupzFqESDF4rUE0TTKEmN0PhIEnaUQ8M1I9Yz2RtHjWloVuyMlrIYY9RMLuqfNUVLyPuKi7aeko2D19U1Ktr4kXS7ifMvVlvXeDldy1GCQiDczkI4hSCbnlnofT+k8eFLb3wspFbe/tq2D7vPHBNxflj6/geWSI02G1terSBmnNkgw++o6D15GguNnZfidfki1lfbGQWEXcpb1qSXBQpnyrvgV4e/Rz7yJxAcMQIop7uYhVksQX+r8uA5nRg/t128g6cd3VHCtfkgdpg6IFtmsFXxvnRG1ahBz9oIM310bqZReKdrnrM02WBfmznqNTnqdWzNepyeivNwRSdPOm+20s7GgtdWF5Y34+Kw0BAsjPusIxLr1TbUydDIUwRfruD+F1GackmOz3EqtCK+QPRB8aY4NuFSkuzGHxYQKMg2HIuVU+ujm3tbYnD9V4vo4ksn3WE5y0WSUmlpAPmmjdvr9UhzRWzmucwJS73Nj3bML2rZ3EXfeFS1QY3AEIv3QS5+XbxjxbS8hKvTjc8whu79LBC533GKtCRaIaNwBVbjOR0g5ni/jGkwe8cF3kFi2t4AdldlPzrGRX4cEL16DmE13R1LAz1DmH4ob9cRxoONvEwj3sw9GCtGepgvHWUgq7iTCAyBPxl9k9rgM8/zAHGOzuy6YJWHDS5H4lekZrnG1Hjqu1udkF12ExhNeKLpk3eiuFoHOukAdjgS9hhLyLH2GlZZdUEtEJFgRERGtHg0t8BsH6qZ+YgW6W88hirQR2XGjkp/5Vnmh6boBv0h44dppiLm40TLP34yYvE/OcCp6DCnquTnwrPW3LBvMTy0Cf1xGodtPCKtaH3IAIGepJxDtoiVkL+90K1K81FQnvkNfVysJDr3mIiWcZtmMB5VM35EhtT0PHtO25rUERkRERNQVCi30Oz/PKRRWRHy9kVzlw+6IC3Z+grk3lFydiIjG+Ta/AzLqlHRFMnNOqnBeumI1xlfpGWhbYTuyWi665zi8/DOh9MMRNM8GCrmHnh4Stx3h2TZZcTwSuDpB14qIiIiISLAy4ErE73t74OdfRTQv9onDlBt76qZVDfQnPbHgf4SnLXdRsjaS/JoyIFk4E1aCsVpGsq4QHvdoWgmUhzOWj3IVWv0RtS2cPhCxfDUCG8bHNiIiIhKs7PhSCVNJa+M2JDZoEeKqmYWk5/ZDMhymxSGiGmrK1Rq7NMxDAmbJmFo9h+y6PCX8HamZdQFiBdktDnvZmPQjPEV5BJIQ0RuJBRtbY3K1Ac2DYh8jn5xLRERExNeaYGGJtw3R03VXxEUyCEkBjlmC1cHSKl4rRG14PcIz8pZa5ZYOq0DZ+G0ktfunSL2pa6p0z8WVYA6si+jThRKsrfU53AHJxnmP2loIj6G5S3cSUuYjIiIiIhKsiLrF44ibsBp4QzfrJGxH/pTWoUgGGpRXAyBjaYvpGSxiSysklSsSz+BWZTbxXSSRIQQdgdEsT1rYFtFCqiWGIuU7zjdeQ+OjGxEREQlWRD3jWt0wSQhc35XwWpBXJfy95KKjAmJzJ5L1GKphsxpulf8PCHePPo0I39rYh/LsxlpaC5fmuMafdFx8OBsJgieDxa4b5XF1e2aMJctCrs5EAtvHWK+DvqbPbJGIiIhIsCJaBX6AaAyZFp1OainoTjadpKF6rV1oLnA5QcnIjIxChzgKlPYkPGNtAaLpNcJ4bxMkvm9y4DWm6v3sbWVf7p9CKHEIffaoIJuusyH0mGd8zZInqyMZnQsQi16WNtjZkJchbrxQZLmHnyCWMhxZiwd+TZ/XVeKSFRGxcqAlhEYj6gPDge1ZXuvrr2QTBsWSd9jEIDnnkV05eRskuB1PdlwWsnYIokjdhCRMnFnBPRUQl9qFGb9/EFJKYolBNK7K0Med1XqRV0h3JJLp2YToSY0nvZwJDoX+VzzkcSlhsVwDkCoNBKrG+zJTv40oiEdERES0Svw/bMPX8GnnqAAAAAAASUVORK5CYII=" width="300" height="60">
      <p>Criado pela metodologia <b>Gomes de Matos</b> pelo Consultor <b>Pedro Marques</b> · Time Comercial &amp; Marketing</p>
      <p class="ver"><span class="sync" id="sync"><i></i><span>Conectando…</span></span> · versão ${APP_VERSION} · <button class="linkbtn" data-act="privacy">Aviso de privacidade</button></p>
    </footer>
  </div>
  <nav class="bottom" aria-label="Seções">${Object.entries(VIEWS).filter(([, v]) => !v.hidden).map(([k, v]) => navBtn(k, v)).join("")}</nav>`;
  setSync(S.syncState?.[0], S.syncState?.[1] || "Conectando…");
}
function setSync(on, txt) { S.syncState = [on, txt]; const s = $("#sync"); if (!s) return; s.classList.toggle("on", !!on); s.querySelector("span").textContent = txt; }
function go(view, sub) {
  if (!VIEWS[view] || (view === "config" && !S.me.email && S.mode === "cloud")) view = "painel";
  if (S.view !== view) { destroyCharts(); S.anim[view] = true; S.anim.count = true; }
  S.view = view; if (sub) S.sub[view] = sub; persistUI(); closeMenus();
  $$(".tab").forEach(t => t.setAttribute("aria-current", t.dataset.view === view ? "page" : "false"));
  try { const h = "#" + view + (S.sub[view] && view === "projetos" ? "-" + S.sub[view] : ""); if (location.hash !== h) history.replaceState(null, "", h); } catch (_) { }
  document.title = `${VIEWS[view].l} · ${CFG.cliente.curto} · Planejamento`;
  render(true); window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}
let rq = 0;
function render(now) {
  const run = () => {
    if (!$("#view")) return; renderBanner();
    const v = $("#view"); v.dataset.v = S.view;
    if (!ready()) { v.innerHTML = skeleton(); return; }
    const a = document.activeElement, busy = (a && v.contains(a) && (a.tagName === "TEXTAREA" || (a.tagName === "INPUT" && !/^(checkbox|radio|file|button|submit)$/.test(a.type))) && a.id !== "b-q") || (typeof drag !== "undefined" && drag);
    if (busy && !now) { S.pendingRender = true; if (S.modal) renderModal(); return; }
    S.pendingRender = false; VIEWS[S.view].render(); updateCounters();
    if (S.modal) renderModal();
  };
  cancelAnimationFrame(rq); if (now) run(); else rq = requestAnimationFrame(run);
}
function skeleton() { return `<div class="skel"><div class="sk h1"></div><div class="sk card"></div><div class="grid g2"><div class="sk card"></div><div class="sk card"></div></div></div>`; }
function renderBanner() {
  const b = $("#banner"); if (!b) return; let h = "";
  if (S.mode === "local") h = `<div class="banner warn">${ICON.info}<span><b>Modo demonstração.</b> Os dados ficam só neste navegador e não são compartilhados com a equipe. Para usar de verdade, conecte o Firebase (veja o guia de implantação).</span></div>`;
  else if (S.readOnly || S.me.papel === "leitor") h = `<div class="banner info">${ICON.eye}<span>Você está com acesso de <b>leitura</b>. Para editar, peça a um administrador.</span></div>`;
  if (S.offline) h += `<div class="banner warn">${ICON.info}<span>Sem conexão. As alterações serão enviadas quando a internet voltar.</span></div>`;
  if (b.innerHTML !== h) b.innerHTML = h;
}
function updateCounters() {
  const c = $$("#cnt-meu, .bottom #cnt-meu"); const n = minhasEntregas().filter(r => r.sit === "atrasada").length;
  c.forEach(x => { x.hidden = !n; x.textContent = n > 99 ? "99+" : n; });
}
function closeMenus() { const p = $("#pop"); if (p && !p.hidden) { p.hidden = true; p.innerHTML = ""; } $$("[aria-expanded=true]").forEach(b => b.setAttribute("aria-expanded", "false")); }
function popMenu(anchor, html, cls = "") {
  const p = $("#pop"); p.className = "pop " + cls; p.innerHTML = html; p.hidden = false;
  const r = anchor.getBoundingClientRect(), w = p.offsetWidth, h = p.offsetHeight;
  let left = Math.min(Math.max(8, r.right - w), innerWidth - w - 8), top = r.bottom + 6;
  if (top + h > innerHeight - 8) top = Math.max(8, r.top - h - 6);
  p.style.left = left + "px"; p.style.top = top + "px"; anchor.setAttribute("aria-expanded", "true");
  setTimeout(() => p.querySelector("button, a, input")?.focus({ preventScroll: true }), 20);
}
function profileMenu(btn) {
  popMenu(btn, `<div class="pm-h"><span class="av lg" style="--ac:${avColor(S.me.nome || S.me.email)}">${esc(initials(S.me.nome || S.me.email || "?"))}</span><div><b>${esc(S.me.nome || "Equipe")}</b><span>${esc(S.me.email || (S.mode === "artifact" ? "Acesso pelo Claude" : "Modo demonstração"))}</span><span class="role r-${S.me.papel}">${ROLES[S.me.papel]?.l || ""}</span></div></div>
    <button data-act="go" data-to="meu">${ICON.me}Meu trabalho</button>
    ${can("config") || can("automacoes") ? `<button data-act="go" data-to="config">${ICON.gear}Configurações</button>` : `<button data-act="go" data-to="config">${ICON.user}Minha conta</button>`}
    <button data-act="shortcuts">${ICON.info}Atalhos de teclado</button>
    <button data-act="logout" class="dz">${ICON.out}Sair</button>`, "w260");
}

/* ---------- Busca global (Ctrl+K) ---------- */
function openPalette() {
  const p = $("#palette"); p.hidden = false; document.body.classList.add("noscroll");
  p.innerHTML = `<div class="pal" role="dialog" aria-modal="true" aria-label="Buscar"><div class="pal-in">${ICON.search}<input id="pal-q" placeholder="Buscar projeto, entrega, KR ou pessoa…" autocomplete="off"><kbd>Esc</kbd></div><div class="pal-r" id="pal-r" role="listbox"></div></div>`;
  const q = $("#pal-q"); q.focus(); paletteResults(""); q.oninput = () => paletteResults(q.value);
  q.onkeydown = e => {
    const items = $$(".pal-r [data-pi]"), cur = items.findIndex(x => x.classList.contains("act"));
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); const n = items.length ? (cur + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length : -1; items.forEach((x, i) => x.classList.toggle("act", i === n)); items[n]?.scrollIntoView({ block: "nearest" }); }
    if (e.key === "Enter") { e.preventDefault(); (items[cur] || items[0])?.click(); }
  };
}
function closePalette() { const p = $("#palette"); p.hidden = true; p.innerHTML = ""; if (!S.modal && !S.drawer) document.body.classList.remove("noscroll"); }
function paletteResults(q) {
  const k = norm(q.trim()), out = [];
  const nav = [["painel", "Ir para o painel"], ["meu", "Ir para Meu trabalho"], ["okrs", "Ir para os OKRs"], ["projetos", "Ir para os projetos"], ["config", "Abrir configurações"]];
  if (!k) nav.forEach(([v, l]) => out.push({ g: "Navegar", t: l, ic: ICON[VIEWS[v].i], act: `data-act="go" data-to="${v}"` }));
  if (k) {
    Plan.ativos().forEach(p => { if (norm(p.titulo).includes(k)) out.push({ g: "Projetos", t: p.titulo, s: Plan.objOf(p)?.codigo || "Backlog", ic: ICON.board, act: `data-act="openCard" data-id="${p.id}"` });
      (p.entregas || []).forEach(e => { if (norm(e.texto).includes(k)) out.push({ g: "Entregas", t: e.texto, s: p.titulo, ic: ICON.chk, act: `data-act="openCard" data-id="${p.id}"` }); }); });
    S.data.krs.forEach(x => { if (norm(x.titulo).includes(k) || norm(x.codigo).includes(k)) out.push({ g: "KRs", t: x.titulo, s: (S.data.objetivos.find(o => o.id === x.objetivoId)?.codigo || "") + " " + x.codigo, ic: ICON.target, act: `data-act="editKR" data-id="${x.id}"` }); });
    people().forEach(n => { if (norm(n).includes(k)) out.push({ g: "Pessoas", t: n, s: "ver entregas", ic: ICON.user, act: `data-act="meuDe" data-nome="${esc(n)}"` }); });
  }
  const groups = {}; out.slice(0, 60).forEach(o => (groups[o.g] ??= []).push(o));
  $("#pal-r").innerHTML = Object.keys(groups).length ? Object.entries(groups).map(([g, it]) => `<div class="pal-g">${esc(g)}</div>` + it.map(o => `<button class="pal-i" data-pi ${o.act}>${o.ic}<span><b>${esc(o.t.length > 90 ? o.t.slice(0, 88) + "…" : o.t)}</b>${o.s ? `<small>${esc(o.s)}</small>` : ""}</span></button>`).join("")).join("")
    : `<div class="empty sm">Nada encontrado para “${esc(q)}”.</div>`;
  $(".pal-r [data-pi]")?.classList.add("act");
}

/* ---------- Atividade recente ---------- */
async function loadHistorico() {
  if (!S.store || S.store.kind === "local") return (S.historico = []);
  try {
    if (S.store.kind === "cloud") { const s = await S.fb.firestore().collection("historico").orderBy("em", "desc").limit(150).get(); S.historico = s.docs.map(d => ({ id: d.id, ...d.data() })); }
    else { const s = await S.store.db.collection("historico").orderBy("em", "desc").limit(150).get(); S.historico = s.docs.map(d => ({ id: d.id, ...d.data() })); }
  } catch (e) { console.warn("historico", e); S.historico = S.historico || []; }
  return S.historico;
}
const ACAO = { criou: "criou", alterou: "alterou", excluiu: "excluiu", concluiu: "concluiu uma entrega em", reabriu: "reabriu uma entrega em", comentou: "comentou em", arquivou: "arquivou", moveu: "moveu", convidou: "convidou", bloqueou: "bloqueou", desbloqueou: "desbloqueou", mediu: "registrou medição em" };
const COLN = { projetos: "projeto", krs: "KR", objetivos: "objetivo", colunas: "coluna", pessoas: "pessoa", config: "configuração", capas: "capa" };
async function openActivity(btn) {
  popMenu(btn, `<div class="act-h"><b>Atividade recente</b><span class="hint">alterações da equipe</span></div><div class="act-l" id="act-l"><div class="empty sm">Carregando…</div></div>`, "w360 act");
  if (S.mode === "local") { $("#act-l").innerHTML = `<div class="empty sm">O histórico de atividade fica disponível quando a plataforma está conectada à nuvem.</div>`; return; }
  const h = await loadHistorico(); const box = $("#act-l"); if (!box) return;
  box.innerHTML = h.length ? h.slice(0, 60).map(a => `<button class="act-i" ${a.col === "projetos" && S.data.projetos.some(p => p.id === a.ref) ? `data-act="openCard" data-id="${a.ref}"` : "disabled"}><span class="av" style="--ac:${avColor(a.nome)}">${esc(initials(a.nome))}</span><span><b>${esc(a.nome)}</b> ${esc(ACAO[a.acao] || a.acao)} ${/ em$/.test(ACAO[a.acao] || "") ? "" : esc(COLN[a.col] || "")} <i>${esc(a.titulo)}</i>${a.detalhe ? `<small>${a.acao === "alterou" ? "" : "“"}${esc(a.detalhe)}${a.acao === "alterou" ? "" : "”"}</small>` : ""}<small>${relTime(a.em)}</small></span></button>`).join("")
    : `<div class="empty sm">Nenhuma atividade registrada ainda.</div>`;
}

/* ---------- Sessão: expira por inatividade ---------- */
const Idle = {
  last: Date.now(), timer: null,
  start() {
    this.stop(); this.last = Date.now();
    const bump = () => { this.last = Date.now(); };
    ["pointerdown", "keydown", "wheel", "touchstart"].forEach(ev => addEventListener(ev, bump, { passive: true })); this.bump = bump;
    this.timer = setInterval(() => { const min = Number(seguranca().timeoutMin) || 30; if (min > 0 && Date.now() - this.last > min * 60000) { this.stop(); logout("Sessão encerrada por inatividade. Entre de novo."); } }, 20000);
  },
  stop() { clearInterval(this.timer); if (this.bump) ["pointerdown", "keydown", "wheel", "touchstart"].forEach(ev => removeEventListener(ev, this.bump)); },
};

/* =====================================================================
   PAINEL · indicadores com filtros cruzados
   ===================================================================== */
function fraseDoDia() { const f = CFG.frases; if (!f.length) return null; const d = Math.floor(Date.now() / 864e5); return f[d % f.length]; }
function renderFilterBar() {
  const all = Plan.rows(), meses = [...new Set(all.map(r => r.mes).filter(Boolean))].sort(), ppl = [...new Set(all.map(r => r.resp))].sort(byText);
  const active = Object.entries(S.f).filter(([k, v]) => v && k !== "ciclo");
  return `<div class="card filterbar" role="region" aria-label="Filtros">
    <label class="fl">Ciclo <select data-f="ciclo">${opt("todos", "Todos", S.f.ciclo)}${ciclos().map(c => opt(c, c, S.f.ciclo)).join("")}</select></label>
    <label class="fl">OKR <select data-f="obj">${opt("", "Todos", S.f.obj)}${Plan.objs().map(o => opt(o.id, o.codigo, S.f.obj)).join("")}${opt("_none", "Backlog", S.f.obj)}</select></label>
    <label class="fl">Responsável <select data-f="resp">${opt("", "Todos", S.f.resp)}${ppl.map(p => opt(p, p, S.f.resp)).join("")}</select></label>
    <label class="fl">Situação <select data-f="sit">${opt("", "Todas", S.f.sit)}${SIT_ORDER.map(s => opt(s, SIT[s], S.f.sit)).join("")}</select></label>
    <label class="fl">Mês <select data-f="mes">${opt("", "Todos", S.f.mes)}${meses.map(m => opt(m, mesLabel(m), S.f.mes)).join("")}${opt("_none", "Sem prazo", S.f.mes)}</select></label>
    <label class="fl">Etiqueta <select data-f="etq">${opt("", "Todas", S.f.etq)}${etiquetas().map(e => opt(e.id, e.nome, S.f.etq)).join("")}</select></label>
    <div class="fb-end"><span class="hint">${ICON.hand}Clique nos gráficos para filtrar</span><button class="btn ghost sm" data-act="exportCSV" title="Baixar as entregas filtradas em planilha">${ICON.down}Planilha</button></div>
    ${active.length ? `<div class="chips">${active.map(([k, v]) => `<button class="chip" data-act="unf" data-k="${k}" title="Remover filtro">${esc(DIMS[k].l)}: <b>${esc(DIMS[k].label(v))}</b><i aria-hidden="true">×</i></button>`).join("")}<button class="chip clear" data-act="unf" data-k="*">Limpar filtros</button></div>` : ""}
  </div>`;
}
function renderPainel() {
  chartDefaults();
  if (!S.f.ciclo) S.f.ciclo = ciclos().includes(geral().cicloAtual) ? geral().cicloAtual : (ciclos().slice(-1)[0] || "todos");
  const all = Plan.rows(), rows = filtered(all), hoje = Plan.hoje, box = $("#view");
  const tot = rows.length, done = rows.filter(r => r.sit === "concluida").length, late = rows.filter(r => r.sit === "atrasada");
  const devidas = rows.filter(r => r.e.prazo && r.e.prazo <= hoje).length, esperado = tot ? devidas / tot : 0, real = tot ? done / tot : 0;
  const lim = addDays(hoje, 30), proximas = rows.filter(r => !r.e.feito && r.e.prazo && r.e.prazo >= hoje && r.e.prazo <= lim).length;
  const projIds = new Set(rows.map(r => r.p.id)), projs = Plan.ativos().filter(p => projIds.has(p.id)), projDone = projs.filter(p => Plan.statusP(p) === "concluido").length;
  const atrasoMedio = late.length ? Math.round(late.reduce((s, r) => s + daysBetween(r.e.prazo, hoje), 0) / late.length) : 0;
  const gap = Math.round((real - esperado) * 100), cicloTxt = S.f.ciclo === "todos" ? "todos os ciclos" : "ciclo " + S.f.ciclo, fr = fraseDoDia();
  const anim = S.anim.painel !== false;
  box.innerHTML = `
  <div class="page-h">
    <div><h1>Painel do planejamento</h1><p class="sub">${esc(DIAS[new Date().getDay()])}, ${new Date().getDate()} de ${MESES[new Date().getMonth()]} · ${esc(cicloTxt)}</p></div>
    ${fr ? `<figure class="frase"><blockquote>${esc(fr.texto)}</blockquote><figcaption>${esc(fr.autor)}</figcaption></figure>` : ""}
  </div>
  ${renderFilterBar()}
  <div class="${anim ? "rise-in anim" : ""}">
    <section class="card hero" aria-label="Execução das entregas">
      <div class="hero-top">
        <div><div class="cap">Execução das entregas · ${esc(cicloTxt)}</div>
          <div class="big"><span id="k-real">${anim ? "0%" : pct(real)}</span><small>${done} de ${tot} entregas concluídas</small></div></div>
        <div class="goal"><span>Esperado até hoje (${fmtD(hoje)})</span>${pct(esperado)}</div>
      </div>
      <div class="meter" role="img" aria-label="Realizado ${pct(real)}, esperado ${pct(esperado)}">
        <div class="track"><div class="fill" style="width:${(real * 100).toFixed(1)}%"></div></div>
        <div class="mk ${esperado > .82 ? "end" : esperado < .15 ? "start" : ""}" style="left:${(esperado * 100).toFixed(1)}%"><span>esperado ${pct(esperado)}</span></div>
      </div>
      ${tot ? `<div class="delta ${gap >= 0 ? "up" : gap > -10 ? "flat" : "down"}"><i></i><span>${gap >= 0 ? `${gap} p.p. acima do esperado para a data` : `${-gap} p.p. abaixo do esperado para a data`} · ${late.length} entrega${late.length === 1 ? "" : "s"} atrasada${late.length === 1 ? "" : "s"}</span></div>` : ""}
      <div class="tiles">
        <button class="tile t-ok" data-act="tile" data-s="concluida" aria-pressed="${S.f.sit === "concluida"}"><span class="cap">Concluídas</span><span class="v" data-count="${done}">${done}</span><span class="s">${pct(real)} do plano</span></button>
        <button class="tile t-late" data-act="tile" data-s="atrasada" aria-pressed="${S.f.sit === "atrasada"}"><span class="cap">Atrasadas</span><span class="v" data-count="${late.length}">${late.length}</span><span class="s">${late.length ? `atraso médio de ${atrasoMedio} dias` : "nenhuma em atraso"}</span></button>
        <button class="tile t-due" data-act="tile" data-s="emdia" aria-pressed="${S.f.sit === "emdia"}"><span class="cap">Vencem em 30 dias</span><span class="v" data-count="${proximas}">${proximas}</span><span class="s">até ${fmtD(lim)}</span></button>
        <div class="tile"><span class="cap">Projetos concluídos</span><span class="v"><span data-count="${projDone}">${projDone}</span><small> / ${projs.length}</small></span><span class="s">com entregas no recorte</span></div>
      </div>
    </section>
    ${!all.length ? `<div class="card empty"><b>Ainda não há entregas cadastradas</b>Abra um projeto na aba Projetos e monte o grupo de entregas. O painel se preenche sozinho.</div>` : `
    <div class="grid g2">
      <section class="card"><div class="card-h"><div><h3>Execução por OKR</h3><p class="sub">Entregas por situação em cada objetivo. Toque numa barra para filtrar.</p></div></div>
        <div class="chartbox short"><canvas id="ch-okr" role="img" aria-label="Entregas por OKR"></canvas></div><div class="legend" id="lg-okr"></div></section>
      <section class="card"><div class="card-h"><div><h3>Situação das entregas</h3><p class="sub">Toque numa fatia ou linha para filtrar.</p></div></div>
        <div class="donut-wrap"><div class="donut-c"><canvas id="ch-sit" role="img" aria-label="Situação das entregas"></canvas><div class="donut-mid"><div><b>${tot}</b><span>entregas</span></div></div></div><div class="dlist" id="dl-sit"></div></div></section>
    </div>
    <section class="card mb"><div class="card-h"><div><h3>Entregas por mês · previsto x realizado</h3><p class="sub">Barras: entregas pelo mês do prazo. Linhas: acumulado previsto e concluído. Toque num mês para filtrar.</p></div></div>
      <div class="chartbox tall"><canvas id="ch-mes" role="img" aria-label="Entregas por mês"></canvas></div><div class="legend" id="lg-mes"></div></section>
    <div class="grid g2e">
      <section class="card"><div class="card-h"><div><h3>Carga por responsável</h3><p class="sub">Entregas de cada pessoa por situação. Toque para filtrar.</p></div></div><div class="chartbox" id="cb-resp"><canvas id="ch-resp" role="img" aria-label="Entregas por responsável"></canvas></div></section>
      <section class="card"><div class="card-h"><div><h3>Atingimento dos KRs</h3><p class="sub">Resultado atual sobre a meta. Linha escura: 100%.</p></div><button class="btn ghost sm" data-act="go" data-to="okrs">Ver OKRs</button></div><div class="chartbox" id="cb-kr"><canvas id="ch-kr" role="img" aria-label="Atingimento dos KRs"></canvas></div></section>
    </div>
    <section class="card mb"><div class="card-h"><div><h3>Projetos estratégicos</h3><p class="sub">Do menos para o mais avançado. Toque numa linha para filtrar; use Abrir para ver o cartão.</p></div></div>
      <div class="tablewrap"><table class="rtable cmp"><thead><tr><th>Projeto</th><th>OKR</th><th>Situação</th><th>Entregas</th><th>Progresso</th><th>Próximo prazo</th><th><span class="vh">Ações</span></th></tr></thead><tbody id="tb-proj"></tbody></table></div></section>
    <section class="card"><div class="card-h"><div><h3>Entregas atrasadas</h3><p class="sub">Ordenadas pelo maior atraso.</p></div>${can("automacoes") ? `<button class="btn ghost sm" data-act="lembrarAtrasados">${ICON.mail}Lembrar responsáveis</button>` : ""}</div>
      <div class="tablewrap"><table class="rtable cmp"><thead><tr><th>Entrega</th><th>Responsável</th><th>Prazo</th><th>Atraso</th></tr></thead><tbody id="tb-late"></tbody></table></div></section>`}
  </div>`;
  if (anim) { countUp($("#k-real"), real * 100, v => Math.round(v) + "%"); $$("[data-count]", box).forEach(el => countUp(el, +el.dataset.count)); }
  if (all.length) { drawOKR(all); drawSit(all); drawMes(all); drawResp(all); drawKR(); tableProj(all); tableLate(rows); }
  S.anim.painel = false;
}
function sitDatasets(labels, keyOf, rows, selVal) {
  const C = SIT_COLOR();
  return SIT_ORDER.map(s => ({ label: SIT[s], key: s, borderRadius: 4, borderSkipped: false, maxBarThickness: 34,
    data: labels.map(l => rows.filter(r => keyOf(r) === l && r.sit === s).length),
    backgroundColor: labels.map(l => alpha(C[s], (selVal && l !== selVal) || (S.f.sit && S.f.sit !== s) ? .22 : 1)) }));
}
function legendSit(id, n = 4) { const C = SIT_COLOR(); $("#" + id).innerHTML = SIT_ORDER.slice(0, n).map(s => `<button data-act="sitf" data-s="${s}" aria-pressed="${!S.f.sit || S.f.sit === s}"><span class="sw" style="background:${C[s]}"></span>${SIT[s]}</button>`).join(""); }
function drawOKR(all) {
  const rows = filtered(all, "obj"), objs = Plan.objs(), keys = objs.map(o => o.id); if (rows.some(r => !r.objId)) keys.push("_none");
  const labels = keys.map(k => k === "_none" ? "Backlog" : objs.find(o => o.id === k).codigo);
  chart("ch-okr", { type: "bar", data: { labels, datasets: sitDatasets(keys, r => r.objId || "_none", rows, S.f.obj) },
    options: { indexAxis: "y", scales: { x: { stacked: true, grid: { color: gridColor() }, ticks: { precision: 0 } }, y: { stacked: true, grid: { display: false }, ticks: { font: { weight: "900" }, color: cssVar("--ink") } } },
      onClick: (e, el) => { if (el.length) defer(setF, "obj", keys[el[0].index]); },
      plugins: { tooltip: { callbacks: { title: it => { const k = keys[it[0].dataIndex]; const o = objs.find(x => x.id === k); return o ? `${o.codigo} · ${o.titulo}` : "Backlog (sem OKR)"; } } },
        datalabels: { display: c => c.dataset.data[c.dataIndex] > 0 && c.chart.width > 300, color: "#fff", font: { weight: "900", size: 11 } } } } });
  legendSit("lg-okr");
}
function drawSit(all) {
  const rows = filtered(all, "sit"), C = SIT_COLOR(), tot = rows.length || 1, counts = SIT_ORDER.map(s => rows.filter(r => r.sit === s).length);
  chart("ch-sit", { type: "doughnut", data: { labels: SIT_ORDER.map(s => SIT[s]), datasets: [{ data: counts, backgroundColor: SIT_ORDER.map(s => alpha(C[s], S.f.sit && S.f.sit !== s ? .2 : 1)), borderColor: cssVar("--card"), borderWidth: 3, hoverOffset: 8 }] },
    options: { cutout: "68%", onClick: (e, el) => { if (el.length) defer(setF, "sit", SIT_ORDER[el[0].index]); } } });
  $("#dl-sit").innerHTML = SIT_ORDER.map((s, i) => `<button class="drow" data-act="sitf" data-s="${s}" aria-pressed="${S.f.sit === s}"><span class="sw" style="background:${C[s]}"></span><span>${SIT[s]}</span><span class="n">${counts[i]}</span><span class="p">${pct(counts[i] / tot)}</span></button>`).join("");
}
function drawMes(all) {
  const rows = filtered(all, "mes"), C = SIT_COLOR(), meses = [...new Set(rows.map(r => r.mes).filter(Boolean))].sort();
  if (!meses.length) { $("#ch-mes").parentElement.innerHTML = `<div class="empty sm">Nenhuma entrega com prazo neste recorte.</div>`; $("#lg-mes").innerHTML = ""; return; }
  const ds = sitDatasets(meses, r => r.mes, rows.filter(r => r.mes), S.f.mes).filter(d => d.key !== "semprazo").map(d => ({ ...d, type: "bar", yAxisID: "y", order: 2 }));
  let ap = 0, ar = 0; const prev = [], realz = [], hojeM = Plan.hoje.slice(0, 7);
  meses.forEach(m => { ap += rows.filter(r => r.mes === m).length; ar += rows.filter(r => r.mes === m && r.sit === "concluida").length; prev.push(ap); realz.push(ar); });
  ds.push({ type: "line", label: "Previsto acumulado", data: prev, yAxisID: "y2", borderColor: cssVar("--idle"), borderDash: [6, 5], borderWidth: 2, pointRadius: 0, tension: .25, order: 1, fill: { target: "origin", above: alpha(cssVar("--idle"), .08) } });
  ds.push({ type: "line", label: "Concluído acumulado", data: realz, yAxisID: "y2", borderColor: cssVar("--lime-d"), backgroundColor: cssVar("--lime-d"), borderWidth: 3, pointRadius: meses.map(m => m === hojeM ? 5 : 2.5), tension: .25, order: 0,
    datalabels: { display: c => c.dataIndex === meses.length - 1 || meses[c.dataIndex] === hojeM, align: "top", color: cssVar("--lime-d"), font: { weight: "900" } } });
  chart("ch-mes", { data: { labels: meses.map(mesLabel), datasets: ds },
    options: { interaction: { mode: "index", intersect: false },
      scales: { x: { stacked: true, grid: { display: false }, ticks: { color: c => meses[c.index] === hojeM ? cssVar("--navy") : cssVar("--muted"), font: c => ({ weight: meses[c.index] === hojeM ? "900" : "400" }), maxRotation: 0, autoSkip: true } },
        y: { stacked: true, grid: { color: gridColor() }, ticks: { precision: 0 }, title: { display: !isMobile(), text: "entregas no mês" } },
        y2: { position: "right", grid: { display: false }, ticks: { precision: 0 }, min: 0, title: { display: !isMobile(), text: "acumulado" } } },
      onHover: (e) => { e.native.target.style.cursor = "pointer"; },
      onClick: e => { const x = S.charts["ch-mes"]?.scales.x.getValueForPixel(e.x); if (x != null && meses[x]) defer(setF, "mes", meses[x]); } } });
  const sw = (c, dash) => `<span class="sw" style="background:${dash ? `repeating-linear-gradient(90deg,${c} 0 4px,transparent 4px 7px)` : c};height:${dash ? 3 : 11}px"></span>`;
  $("#lg-mes").innerHTML = SIT_ORDER.slice(0, 3).map(s => `<button data-act="sitf" data-s="${s}" aria-pressed="${!S.f.sit || S.f.sit === s}">${sw(C[s])}${SIT[s]}</button>`).join("") +
    `<span class="li">${sw(cssVar("--idle"), 1)}Previsto acumulado</span><span class="li">${sw(cssVar("--lime-d"))}Concluído acumulado</span>`;
}
function drawResp(all) {
  const rows = filtered(all, "resp"), cnt = {}; rows.forEach(r => cnt[r.resp] = (cnt[r.resp] || 0) + 1);
  const ppl = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a] || byText(a, b));
  const box = $("#cb-resp"); box.style.height = Math.max(220, 30 * ppl.length + 50) + "px";
  if (!ppl.length) { box.innerHTML = `<div class="empty sm">Sem entregas neste recorte.</div>`; return; }
  chart("ch-resp", { type: "bar", data: { labels: ppl, datasets: sitDatasets(ppl, r => r.resp, rows, S.f.resp).map(d => ({ ...d, maxBarThickness: 20 })) },
    options: { indexAxis: "y", scales: { x: { stacked: true, grid: { color: gridColor() }, ticks: { precision: 0 } }, y: { stacked: true, grid: { display: false }, ticks: { color: cssVar("--ink"), callback: function (v) { const l = this.getLabelForValue(v); return isMobile() && l.length > 16 ? l.slice(0, 15) + "…" : l; } } } },
      onClick: (e, el) => { if (el.length) defer(setF, "resp", ppl[el[0].index]); },
      plugins: { datalabels: { display: c => c.dataset.data[c.dataIndex] > 1, color: "#fff", font: { weight: "900", size: 10.5 } } } } });
}
function drawKR() {
  const objs = Plan.objs(), krs = S.data.krs.filter(k => !S.f.obj || S.f.obj === "_none" || k.objetivoId === S.f.obj).sort((a, b) => objs.findIndex(o => o.id === a.objetivoId) - objs.findIndex(o => o.id === b.objetivoId) || a.ordem - b.ordem);
  const items = krs.map(k => ({ k, v: Plan.krAt(k), o: objs.find(o => o.id === k.objetivoId) })), box = $("#cb-kr");
  box.style.height = Math.max(220, 24 * items.length + 50) + "px";
  if (!items.length) { box.innerHTML = `<div class="empty sm">Nenhum KR neste recorte.</div>`; return; }
  const col = v => v == null ? cssVar("--idle") : v >= 1 ? cssVar("--ok") : v >= .85 ? cssVar("--amber") : cssVar("--brick");
  chart("ch-kr", { type: "bar", data: { labels: items.map(i => `${i.o?.codigo || ""} ${i.k.codigo}`), datasets: [{ data: items.map(i => i.v == null ? 0 : Math.min(i.v, 1.5) * 100), backgroundColor: items.map(i => col(i.v)), borderRadius: 4, maxBarThickness: 16 }] },
    options: { indexAxis: "y",
      scales: { x: { min: 0, max: 150, grid: { color: c => c.tick.value === 100 ? cssVar("--ink") : gridColor(), lineWidth: c => c.tick.value === 100 ? 1.5 : 1 }, ticks: { stepSize: 25, callback: v => v + "%" } }, y: { grid: { display: false }, ticks: { font: { size: 11 } } } },
      onClick: (e, el) => { if (el.length) defer(openKR, items[el[0].index].k.id); },
      plugins: { tooltip: { callbacks: { title: it => items[it[0].dataIndex].k.titulo, label: it => { const i = items[it.dataIndex]; return i.v == null ? "Sem medição" : `Atual ${fmtNum(i.k.atual, i.k.unidade)} · meta ${fmtNum(i.k.meta, i.k.unidade)} · ${pct(i.v)}`; } } },
        datalabels: { display: true, anchor: "end", align: "end", color: cssVar("--ink"), font: { size: 10.5, weight: "700" }, formatter: (v, c) => items[c.dataIndex].v == null ? "sem dado" : pct(items[c.dataIndex].v) } } } });
}
function tableProj(all) {
  const rows = filtered(all, "proj"), ix = Plan.idx(), by = new Map();
  rows.forEach(r => { const x = by.get(r.p.id) || { p: r.p, n: 0, d: 0, late: 0, nxt: "" }; x.n++; if (r.sit === "concluida") x.d++; if (r.sit === "atrasada") x.late++; if (!r.e.feito && r.e.prazo && (!x.nxt || r.e.prazo < x.nxt)) x.nxt = r.e.prazo; by.set(r.p.id, x); });
  const list = [...by.values()].map(x => ({ ...x, prog: x.n ? x.d / x.n : 0, obj: Plan.objOf(x.p, ix) })).sort((a, b) => a.prog - b.prog || b.late - a.late);
  $("#tb-proj").innerHTML = list.length ? list.map(x => `<tr class="click ${S.f.proj === x.p.id ? "sel" : S.f.proj ? "dim" : ""}" data-act="projf" data-id="${x.p.id}" tabindex="0">
    <td data-l="Projeto" class="tcell-main"><div class="t1">${esc(x.p.titulo)}</div>${x.late ? `<div class="t2 late">${x.late} entrega(s) atrasada(s)</div>` : ""}</td>
    <td data-l="OKR">${okrTag(x.obj)}</td><td data-l="Situação">${statusPill(Plan.statusP(x.p))}</td><td data-l="Entregas" class="n mh">${x.d}/${x.n}</td>
    <td data-l="Progresso"><div class="bar"><div class="tr"><span style="width:${(x.prog * 100).toFixed(0)}%;background:${x.late ? cssVar("--brick") : x.prog >= 1 ? cssVar("--ok") : cssVar("--navy")}"></span></div><span class="v">${pct(x.prog)}</span></div></td>
    <td data-l="Próximo prazo" class="mh">${x.nxt ? fmtD(x.nxt) : "—"}</td><td class="tact"><button class="btn ghost sm" data-act="openCard" data-id="${x.p.id}">Abrir</button></td></tr>`).join("")
    : `<tr><td colspan="7"><div class="empty sm">Nenhum projeto com entregas neste recorte.</div></td></tr>`;
}
function tableLate(rows) {
  const late = rows.filter(r => r.sit === "atrasada").map(r => ({ ...r, d: daysBetween(r.e.prazo, Plan.hoje) })).sort((a, b) => b.d - a.d);
  const lim = isMobile() && !S.lateAll ? 8 : 40;
  $("#tb-late").innerHTML = late.length ? late.slice(0, lim).map(r => `<tr class="click" data-act="openCard" data-id="${r.p.id}" tabindex="0">
    <td data-l="Entrega" class="tcell-main"><div class="t1">${esc(r.e.texto)}</div><div class="t2">${esc(r.p.titulo)}</div></td>
    <td data-l="Responsável"><span class="who">${avatars([r.resp], 1)}${esc(r.resp)}</span></td><td data-l="Prazo" class="mh">${fmtD(r.e.prazo)}</td><td data-l="Atraso" class="days">${r.d} dias</td></tr>`).join("") + (late.length > lim ? `<tr><td colspan="4"><div class="more-row">${lim < 40 ? `<button class="btn ghost sm" data-act="lateAll">Ver mais ${Math.min(late.length, 40) - lim} entregas</button>` : `<span class="hint">Mostrando as 40 maiores de ${late.length}. Use os filtros para ver as demais.</span>`}</div></td></tr>` : "")
    : `<tr><td colspan="4"><div class="empty sm"><b>Nenhuma entrega atrasada</b>Tudo o que venceu neste recorte foi concluído.</div></td></tr>`;
}
function exportCSV() {
  const rows = filtered(Plan.rows()), head = ["Ciclo", "OKR", "Coluna", "Projeto", "Situação do projeto", "Entrega", "Responsável", "Prazo", "Situação", "Dias de atraso"];
  const data = rows.map(r => [r.p.ciclo, r.obj?.codigo || "Backlog", r.col?.titulo || "", r.p.titulo, PSTAT[Plan.statusP(r.p)], r.e.texto, r.resp, r.e.prazo ? fmtD(r.e.prazo) : "", SIT[r.sit], r.sit === "atrasada" ? daysBetween(r.e.prazo, Plan.hoje) : ""]);
  saveFile(`entregas-${KEY.slice(3)}-${Plan.hoje}.csv`, toCSV([head, ...data]), "text/csv;charset=utf-8").then(ok => ok && toast(`${data.length} entregas exportadas`));
}

/* =====================================================================
   MEU TRABALHO · entregas da pessoa, agrupadas por urgência
   ===================================================================== */
function entregasDe(nome) {
  const k = norm(nome); if (!k) return [];
  return Plan.rows().filter(r => norm(r.e.resp) === k || (!r.e.resp && (r.p.responsaveis || []).some(x => norm(x) === k)));
}
function minhasEntregas() { return entregasDe(S.me.nome); }
function renderMeu() {
  const podeVerOutros = can("editar_projetos"), lista = people();
  if (!S.meu.pessoa || (!podeVerOutros && S.meu.pessoa !== S.me.nome)) S.meu.pessoa = S.me.nome || (podeVerOutros ? lista[0] || "" : "");
  const quem = S.meu.pessoa, rows = entregasDe(quem), hoje = Plan.hoje, sem = addDays(hoje, 7), mes = addDays(hoje, 30);
  const abertas = rows.filter(r => !r.e.feito);
  const G = [
    ["Atrasadas", "late", abertas.filter(r => r.sit === "atrasada").sort((a, b) => byText(a.e.prazo, b.e.prazo))],
    ["Nos próximos 7 dias", "soon", abertas.filter(r => r.e.prazo && r.e.prazo >= hoje && r.e.prazo <= sem).sort((a, b) => byText(a.e.prazo, b.e.prazo))],
    ["Próximos 30 dias", "next", abertas.filter(r => r.e.prazo > sem && r.e.prazo <= mes).sort((a, b) => byText(a.e.prazo, b.e.prazo))],
    ["Mais adiante", "later", abertas.filter(r => r.e.prazo > mes).sort((a, b) => byText(a.e.prazo, b.e.prazo))],
    ["Sem prazo definido", "none", abertas.filter(r => !r.e.prazo)],
  ];
  if (S.meu.ver === "todas") G.push(["Concluídas", "done", rows.filter(r => r.e.feito).sort((a, b) => byText(b.e.feitoEm || b.e.prazo, a.e.feitoEm || a.e.prazo))]);
  const projs = [...new Set(rows.map(r => r.p.id))].length, done = rows.filter(r => r.e.feito).length;
  const anim = S.anim.meu !== false;
  $("#view").innerHTML = `
  <div class="page-h"><div><h1>${quem && norm(quem) === norm(S.me.nome) ? "Meu trabalho" : "Trabalho de " + esc(quem || "…")}</h1><p class="sub">Entregas em que ${quem && norm(quem) === norm(S.me.nome) ? "você é" : "a pessoa é"} responsável, das mais urgentes para as mais distantes.</p></div>
    <div class="ph-act">${podeVerOutros ? `<label class="fl">Pessoa <select data-act="meuPessoa">${lista.map(p => opt(p, p, quem)).join("")}</select></label>` : ""}
    <div class="seg" role="group" aria-label="Mostrar"><button data-act="meuVer" data-v="abertas" aria-pressed="${S.meu.ver !== "todas"}">Abertas</button><button data-act="meuVer" data-v="todas" aria-pressed="${S.meu.ver === "todas"}">Todas</button></div></div></div>
  ${!quem ? `<div class="card empty"><b>Seu nome ainda não está ligado a uma pessoa da equipe</b>Peça a um administrador para cadastrar você em Configurações › Pessoas com este e-mail.</div>` : `
  <div class="tiles four ${anim ? "rise-in" : ""}">
    <div class="tile t-late"><span class="cap">Atrasadas</span><span class="v">${G[0][2].length}</span><span class="s">precisam de atenção</span></div>
    <div class="tile t-due"><span class="cap">Nesta semana</span><span class="v">${G[1][2].length}</span><span class="s">até ${fmtD(sem)}</span></div>
    <div class="tile t-ok"><span class="cap">Concluídas</span><span class="v">${done}</span><span class="s">de ${rows.length} entregas</span></div>
    <div class="tile"><span class="cap">Projetos</span><span class="v">${projs}</span><span class="s">com entregas suas</span></div>
  </div>
  <div class="meu ${anim ? "rise-in" : ""}">${G.map(([t, k, list]) => list.length ? `<section class="card mgroup g-${k}"><h3>${t}<span class="n">${list.length}</span></h3>
    <ul class="mlist">${list.map(r => { const ed = canEditProject(r.p); const d = r.e.prazo ? daysBetween(hoje, r.e.prazo) : null;
      return `<li class="mitem ${r.e.feito ? "feito" : ""}"><input type="checkbox" ${r.e.feito ? "checked" : ""} ${ed ? "" : "disabled"} data-act="meuToggle" data-p="${r.p.id}" data-e="${r.e.id}" aria-label="Marcar como concluída">
        <button class="mt" data-act="openCard" data-id="${r.p.id}"><b>${esc(r.e.texto)}</b><small>${okrTag(r.obj)} ${esc(r.p.titulo)}</small></button>
        <span class="md ${r.sit}">${r.e.feito ? (r.e.feitoEm ? "feita " + relTime(r.e.feitoEm) : "concluída") : r.e.prazo ? (d < 0 ? `${-d} dia${d === -1 ? "" : "s"} de atraso` : d === 0 ? "vence hoje" : d === 1 ? "vence amanhã" : fmtD(r.e.prazo)) : "sem prazo"}</span></li>`; }).join("")}</ul></section>` : "").join("") || `<div class="card empty"><b>Nada pendente por aqui</b>Nenhuma entrega aberta com este responsável.</div>`}</div>`}`;
  S.anim.meu = false;
}

/* =====================================================================
   OKRs · objetivos, KRs, medições (check-ins)
   ===================================================================== */
const canMedir = k => can("editar_okrs") || (can("editar_proprio") && !!S.me.nome && norm(k.responsavel) === norm(S.me.nome));
function renderOKRs() {
  const objs = Plan.objs(), all = Plan.rows(), ciclo = S.f.ciclo || geral().cicloAtual, anim = S.anim.okrs !== false;
  $("#view").innerHTML = `
  <div class="page-h"><div><h1>Objetivos e resultados-chave</h1><p class="sub">Metas, resultado atual e execução dos projetos de cada OKR. Toque num KR para ver o histórico ou registrar uma medição.</p></div>
    ${can("editar_okrs") ? `<div class="ph-act"><button class="btn ghost" data-act="newObj">${ICON.plus}Novo objetivo</button><button class="btn" data-act="newKR">${ICON.plus}Novo KR</button></div>` : ""}</div>
  <div class="${anim ? "rise-in anim" : ""}">${objs.map(o => {
    const krs = S.data.krs.filter(k => k.objetivoId === o.id).sort((a, b) => a.ordem - b.ordem || byText(a.codigo, b.codigo));
    const vals = krs.map(k => Plan.krAt(k)).filter(v => v != null).map(v => Math.min(v, 1)), at = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
    const rs = all.filter(r => r.objId === o.id && (ciclo === "todos" || r.p.ciclo === ciclo)), ex = rs.length ? rs.filter(r => r.sit === "concluida").length / rs.length : null;
    const nProj = new Set(rs.map(r => r.p.id)).size, batidos = krs.filter(k => (Plan.krAt(k) ?? 0) >= 1).length;
    return `<section class="card okrcard" style="--oc:${Plan.okrColor(o.id)}">
      <div class="okr-h"><div class="okr-badge">${esc(o.codigo)}</div>
        <div class="tt"><h2>${esc(o.titulo)}</h2><p class="meta">${krs.length} KR(s) · ${batidos} na meta · ${nProj} projeto(s) com entregas no ${ciclo === "todos" ? "total" : "ciclo " + esc(ciclo)}</p></div>
        <div class="okr-scores"><div class="okr-score"><b>${pct(at)}</b><span>atingimento dos KRs</span></div><div class="okr-score c2"><b>${pct(ex)}</b><span>execução das entregas</span></div></div>
        ${can("editar_okrs") ? `<div class="okr-act"><button class="btn quiet sm" data-act="editObj" data-id="${o.id}">Editar</button><button class="btn quiet sm" data-act="newKR" data-obj="${o.id}">${ICON.plus}KR</button></div>` : ""}
      </div>
      ${krs.length ? krs.map(k => { const v = Plan.krAt(k), c = Plan.krClass(v), hist = (k.medicoes || []).slice().sort((a, b) => byText(a.data, b.data)).map(m => m.valor);
        return `<button class="krrow" data-act="openKR" data-id="${k.id}"><span class="code">${esc(k.codigo)}</span>
          <span class="krt"><span class="t1">${esc(k.titulo)}</span><span class="obs">${esc(k.responsavel || "Sem responsável")}${k.medicoes?.length ? ` · última medição ${fmtD(k.medicoes.slice().sort((a, b) => byText(b.data, a.data))[0].data)}` : ""}</span></span>
          <span class="krspark">${sparkline(hist, 84, 26, cssVar(c === "ok" ? "--ok" : c === "mid" ? "--amber" : c === "low" ? "--brick" : "--idle"))}</span>
          <span class="krv"><span class="krm"><span>Atual <b>${fmtNum(k.atual, k.unidade)}</b></span><span>Meta ${k.sentido === "menor" ? "≤" : "≥"} <b>${fmtNum(k.meta, k.unidade)}</b></span></span>
            <span class="krbar"><span class="${c}-c" style="width:${v == null ? 0 : Math.min(100, v * 100)}%"></span></span><span class="krpct ${c}">${v == null ? "Sem medição" : pct(v)}</span></span></button>`; }).join("")
        : `<div class="pad"><div class="empty sm">Nenhum KR neste objetivo.</div></div>`}
    </section>`; }).join("") || `<div class="card empty"><b>Nenhum objetivo cadastrado</b>${can("editar_okrs") ? "Crie o primeiro objetivo estratégico." : ""}</div>`}</div>`;
  S.anim.okrs = false;
}
const UNIDADES = [["%", "%"], ["pts", "pontos (NPS)"], ["un", "quantidade"], ["R$", "reais (R$)"], ["h", "horas"], ["º", "colocação"], ["", "sem unidade"]];
function objForm(id) {
  const o = id ? S.data.objetivos.find(x => x.id === id) : { codigo: "OKR" + (S.data.objetivos.length + 1), ordem: S.data.objetivos.length + 1 };
  openDrawer({ titulo: id ? "Editar objetivo" : "Novo objetivo", valores: o,
    campos: [{ k: "codigo", l: "Código", ph: "OKR4", h: 1, max: 12 }, { k: "ordem", l: "Ordem", type: "number", h: 1 }, { k: "titulo", l: "Objetivo", type: "textarea", max: 400 }],
    salvar: d => id ? save(() => Repo.patch("objetivos", id, d), "Objetivo salvo") : save(() => Repo.create("objetivos", d), "Objetivo criado"),
    excluir: id && { texto: "O objetivo será excluído. Ele precisa estar sem KRs.", fn: () => save(() => Repo.remove("objetivos", id), "Objetivo excluído") } });
}
function krForm(id, preset = {}) {
  const k = id ? S.data.krs.find(x => x.id === id) : { objetivoId: preset.objetivoId || Plan.objs()[0]?.id, sentido: "maior", unidade: "%", ordem: S.data.krs.filter(x => x.objetivoId === preset.objetivoId).length + 1, codigo: "KR" + (S.data.krs.filter(x => x.objetivoId === preset.objetivoId).length + 1) };
  openDrawer({ titulo: id ? "Editar resultado-chave" : "Novo resultado-chave", valores: k,
    campos: [{ k: "objetivoId", l: "Objetivo", type: "select", opts: Plan.objs().map(o => [o.id, `${o.codigo} · ${o.titulo.slice(0, 70)}`]) },
      { k: "codigo", l: "Código", ph: "KR1", h: 1, max: 12 }, { k: "ordem", l: "Ordem", type: "number", h: 1 }, { k: "titulo", l: "Resultado-chave", type: "textarea", max: 400 },
      { k: "meta", l: "Meta", h: 1, im: "decimal", num: 1, hint: "Ex.: 87,5" }, { k: "unidade", l: "Unidade", type: "select", h: 1, opts: UNIDADES },
      { k: "sentido", l: "Direção da meta", type: "select", opts: [["maior", "Quanto maior, melhor"], ["menor", "Quanto menor, melhor"]] },
      { k: "responsavel", l: "Responsável", list: "dl-ppl", max: 80 }, { k: "observacoes", l: "Observações", type: "textarea", max: 1500 },
      ...(id ? [] : [{ k: "atual", l: "Resultado atual (opcional)", im: "decimal", num: 1 }])],
    salvar: d => id ? save(() => Repo.patch("krs", id, d), "KR salvo") : save(() => Repo.create("krs", { ...d, medicoes: [] }), "KR criado"),
    excluir: id && { texto: "O KR e todo o histórico de medições serão excluídos.", fn: () => save(() => Repo.remove("krs", id), "KR excluído") } });
}
function openKR(id) {
  const k = S.data.krs.find(x => x.id === id); if (!k) return;
  const o = S.data.objetivos.find(x => x.id === k.objetivoId), v = Plan.krAt(k), med = (k.medicoes || []).slice().sort((a, b) => byText(b.data, a.data));
  const d = $("#drawer"); S.drawer = true; document.body.classList.add("noscroll");
  d.innerHTML = `<div class="dw"><header><div><span class="okr" style="--oc:${Plan.okrColor(k.objetivoId)}">${esc(o?.codigo || "")} · ${esc(k.codigo)}</span><h2 id="dr-title" style="margin-top:8px">${esc(k.titulo)}</h2></div><button class="btn quiet ico" data-act="closeDrawer" aria-label="Fechar">${ICON.x}</button></header>
    <div class="dw-b">
      <div class="krhero"><div><span class="cap">Atual</span><b>${fmtNum(k.atual, k.unidade)}</b></div><div><span class="cap">Meta</span><b>${k.sentido === "menor" ? "≤ " : "≥ "}${fmtNum(k.meta, k.unidade)}</b></div><div><span class="cap">Atingimento</span><b class="${Plan.krClass(v)}">${v == null ? "—" : pct(v)}</b></div></div>
      <p class="hint">${esc(k.responsavel || "Sem responsável")}${k.observacoes ? " · " + esc(k.observacoes) : ""}</p>
      ${med.length > 1 ? `<div class="chartbox short"><canvas id="ch-krh" aria-label="Evolução do KR"></canvas></div>` : ""}
      ${canMedir(k) ? `<form class="medir" id="kr-medir" novalidate><h4>Registrar medição</h4><div class="row"><label>Valor<input class="inp" id="km-v" inputmode="decimal" placeholder="Ex.: 87,5" required></label><label>Data<input class="inp" id="km-d" type="date" value="${Plan.hoje}" max="${Plan.hoje}"></label></div><label>Comentário (opcional)<input class="inp" id="km-n" maxlength="300" placeholder="O que explica este resultado?"></label><button class="btn" type="submit">Salvar medição</button></form>` : ""}
      <h4 class="mt">Histórico de medições</h4>
      ${med.length ? `<ul class="medl">${med.map(m => `<li><b>${fmtNum(m.valor, k.unidade)}</b><span>${fmtD(m.data)}${m.por ? " · " + esc(m.por) : ""}${m.nota ? `<em>${esc(m.nota)}</em>` : ""}</span>${canMedir(k) ? `<button class="btn quiet ico sm" data-act="delMed" data-k="${k.id}" data-m="${m.id}" aria-label="Excluir medição">${ICON.trash}</button>` : ""}</li>`).join("")}</ul>` : `<div class="empty sm">Nenhuma medição registrada. O valor atual veio do cadastro do KR.</div>`}
    </div>
    <footer><span class="sp"></span>${can("editar_okrs") ? `<button class="btn ghost" data-act="editKR" data-id="${k.id}">Editar KR</button>` : ""}<button class="btn ghost" data-act="closeDrawer">Fechar</button></footer></div>`;
  d.hidden = false;
  if (med.length > 1 && window.Chart) { chartDefaults(); const asc = med.slice().reverse(); chart("ch-krh", { type: "line", data: { labels: asc.map(m => fmtDs(m.data)), datasets: [{ data: asc.map(m => m.valor), borderColor: cssVar("--navy"), backgroundColor: alpha(cssVar("--navy"), .1), fill: true, tension: .3, pointRadius: 3 }, ...(k.meta != null ? [{ data: asc.map(() => k.meta), borderColor: cssVar("--lime-d"), borderDash: [6, 4], pointRadius: 0, borderWidth: 2 }] : [])] }, options: { scales: { x: { grid: { display: false } }, y: { grid: { color: gridColor() } } } } }, "kr"); }
  const f = $("#kr-medir"); if (f) f.onsubmit = async e => {
    e.preventDefault(); const val = numOrNull($("#km-v").value), data = $("#km-d").value;
    if (val == null || Number.isNaN(val)) { toast("Informe um valor numérico, ex.: 87,5", null, "erro"); $("#km-v").focus(); return; }
    if (!isDateStr(data) || data > Plan.hoje) { toast("Escolha uma data até hoje.", null, "erro"); return; }
    const m = { id: uid(), data, valor: val, nota: clean($("#km-n").value), por: S.me.nome || S.me.email || "Equipe" };
    const meds = [...(k.medicoes || []), m]; const latest = meds.slice().sort((a, b) => byText(b.data, a.data))[0];
    const ok = await save(() => Repo.patch("krs", k.id, { medicoes: meds, atual: latest.valor }, { acao: "mediu", detalhe: fmtNum(val, k.unidade) }), "Medição registrada").then(() => true).catch(() => false);
    if (ok) { const loc = S.data.krs.find(x => x.id === k.id); if (loc) Object.assign(loc, { medicoes: meds, atual: latest.valor }); openKR(k.id); }
  };
}

/* =====================================================================
   PROJETOS · quadro (estilo Trello), lista e cronograma
   ===================================================================== */
function boardFilter(p) {
  const b = S.board, q = norm(b.q);
  if (!!p.arquivado !== !!b.arquivados) return false;
  if (b.ciclo && b.ciclo !== "todos" && p.ciclo !== b.ciclo) return false;
  if (q && !norm(p.titulo).includes(q) && !(p.entregas || []).some(e => norm(e.texto).includes(q)) && !norm(p.descricao).includes(q)) return false;
  if (b.resp && !(p.responsaveis || []).includes(b.resp) && !(p.entregas || []).some(e => e.resp === b.resp)) return false;
  if (b.etq && !(p.etiquetas || []).includes(b.etq)) return false;
  if (b.prio && p.prioridade !== b.prio) return false;
  return true;
}
const boardProjects = colId => S.data.projetos.filter(p => p.colunaId === colId && boardFilter(p)).sort((a, b) => a.ordem - b.ordem);
function renderProjetos() {
  if (!S.board.ciclo) S.board.ciclo = ciclos().includes(geral().cicloAtual) ? geral().cicloAtual : (ciclos().slice(-1)[0] || "todos");
  const modo = S.sub.projetos || "quadro", focusQ = document.activeElement?.id === "b-q";
  const total = S.data.projetos.filter(boardFilter).length, nArq = S.data.projetos.filter(p => p.arquivado).length;
  $("#view").innerHTML = `
  <div class="page-h"><div><h1>Projetos estratégicos</h1><p class="sub">${total} projeto(s) ${S.board.arquivados ? "arquivados" : "no recorte"} · ${modo === "quadro" ? "arraste os cartões entre as colunas" : modo === "lista" ? "toque num cabeçalho para ordenar" : "linha do tempo do primeiro ao último prazo"}</p></div>
    <div class="ph-act"><div class="seg" role="group" aria-label="Visualização">
      <button data-act="sub" data-v="quadro" aria-pressed="${modo === "quadro"}">${ICON.board}<span>Quadro</span></button><button data-act="sub" data-v="lista" aria-pressed="${modo === "lista"}">${ICON.list}<span>Lista</span></button><button data-act="sub" data-v="cronograma" aria-pressed="${modo === "cronograma"}">${ICON.gantt}<span>Cronograma</span></button></div></div></div>
  <div class="card boardbar">
    <div class="seg" role="group" aria-label="Ciclo">${[...ciclos(), "todos"].map(c => `<button data-act="bciclo" data-v="${c}" aria-pressed="${S.board.ciclo === c}">${c === "todos" ? "Todos" : c}</button>`).join("")}</div>
    <label class="srch">${ICON.search}<input class="inp" id="b-q" type="search" placeholder="Buscar projeto ou entrega" value="${esc(S.board.q)}" aria-label="Buscar projeto ou entrega"></label>
    <label class="fl">Responsável <select data-act="bfilter" data-k="resp">${opt("", "Todos", S.board.resp)}${people().map(p => opt(p, p, S.board.resp)).join("")}</select></label>
    <label class="fl">Etiqueta <select data-act="bfilter" data-k="etq">${opt("", "Todas", S.board.etq)}${etiquetas().map(e => opt(e.id, e.nome, S.board.etq)).join("")}</select></label>
    <label class="fl">Prioridade <select data-act="bfilter" data-k="prio">${opt("", "Todas", S.board.prio)}${Object.entries(PRIO).map(([k, v]) => opt(k, v, S.board.prio)).join("")}</select></label>
    <button class="btn quiet sm ${S.board.arquivados ? "on" : ""}" data-act="toggleArq" aria-pressed="${S.board.arquivados}">${ICON.archive}Arquivados${nArq ? ` (${nArq})` : ""}</button>
  </div>
  <div id="pv"></div>`;
  if (focusQ) { const i = $("#b-q"); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
  if (modo === "lista") renderLista(); else if (modo === "cronograma") renderCrono(); else renderBoard();
}

/* ---------- Quadro ---------- */
function renderBoard() {
  if (S.view !== "projetos" || !$("#pv")) return;
  if ((S.sub.projetos || "quadro") !== "quadro") return renderProjetos();
  const pv = $("#pv"), prev = $("#board"), sx = prev?.scrollLeft || 0, sy = new Map($$(".col-b", prev || document.createElement("i")).map(b => [b.dataset.col, b.scrollTop]));
  const cols = Plan.cols(), capas = new Map(S.data.capas.map(c => [c.id, c.data])), edQ = can("editar_quadro"), edP = can("editar_projetos");
  pv.innerHTML = `${isMobile() && cols.length > 1 ? `<div class="coltabs" role="tablist">${cols.map(c => `<button data-act="scrollCol" data-id="${c.id}">${esc(c.objetivoId && S.data.objetivos.find(x => x.id === c.objetivoId)?.codigo || c.titulo.split(/\s[-–]\s/)[0].split(" ")[0].slice(0, 14))}<b>${boardProjects(c.id).length}</b></button>`).join("")}</div>` : ""}
  <div class="board" id="board">${cols.map((c, ci) => {
    const ps = boardProjects(c.id), o = c.objetivoId ? S.data.objetivos.find(x => x.id === c.objetivoId) : null;
    return `<section class="col" data-col="${c.id}" id="col-${c.id}" style="--oc:${o ? Plan.okrColor(o.id) : cssVar("--idle")}" aria-label="${esc(c.titulo)}">
      <div class="col-h">
        ${S.editCol === c.id ? `<textarea class="col-t" id="col-edit" rows="2" maxlength="240" aria-label="Nome da coluna">${esc(c.titulo)}</textarea>` : `<button class="col-t" ${edQ ? `data-act="renameCol" data-id="${c.id}" title="Clique para renomear"` : "disabled"}>${esc(c.titulo)}</button>`}
        <span class="col-n">${ps.length}</span>
        ${edQ ? `<button class="btn quiet ico sm" data-act="colMenu" data-id="${c.id}" data-i="${ci}" aria-label="Opções da coluna" aria-expanded="false">${ICON.dots}</button>` : ""}
      </div>
      <div class="col-b" data-col="${c.id}">${ps.map(p => kcard(p, capas.get(p.id))).join("") || `<div class="col-empty">${S.board.q || S.board.resp || S.board.etq || S.board.prio ? "Nenhum cartão com estes filtros" : "Nenhum cartão"}</div>`}</div>
      ${edP && !S.board.arquivados ? (S.qadd === c.id ? `<form class="qform" data-act="qform" data-col="${c.id}"><textarea id="qa-text" placeholder="Nome do projeto" maxlength="400" aria-label="Nome do novo projeto"></textarea><div class="row"><button class="btn sm" type="submit">Adicionar cartão</button><button class="btn quiet sm" type="button" data-act="qcancel">Cancelar</button></div></form>`
        : `<button class="qadd" data-act="qadd" data-id="${c.id}">${ICON.plus}Adicionar um cartão</button>`) : ""}
    </section>`; }).join("")}${edQ && !S.board.arquivados ? `<button class="addcol" data-act="addCol">${ICON.plus}Adicionar outra coluna</button>` : ""}</div>`;
  const board = $("#board"); board.scrollLeft = sx; $$(".col-b", board).forEach(b => { if (sy.has(b.dataset.col)) b.scrollTop = sy.get(b.dataset.col); });
  if (S.qadd) $("#qa-text")?.focus();
  const ce = $("#col-edit"); if (ce) { ce.focus(); ce.select(); }
}
function kcard(p, capa) {
  const es = p.entregas || [], d = es.filter(e => e.feito).length, st = Plan.statusP(p), nxt = es.filter(e => !e.feito && e.prazo).map(e => e.prazo).sort()[0] || (st !== "concluido" ? p.prazo : "");
  const cls = !es.length ? "c-none" : st === "concluido" ? "c-done" : st === "atrasado" ? "c-late" : "c-run", ppl = [...(p.responsaveis || []), ...es.map(e => e.resp)];
  const drag = can("editar_projetos") && !S.board.arquivados;
  return `<div class="kcard ${p.prioridade === "alta" ? "pri" : ""}" role="button" tabindex="0" ${drag ? 'draggable="true"' : ""} data-card="${p.id}" aria-label="${esc(p.titulo)}">
    ${capa ? `<div class="cover" style="background-image:url('${capa}')"></div>` : ""}
    <div class="kb">${(p.etiquetas || []).length ? `<div class="etqs">${etqChips(p.etiquetas)}</div>` : ""}
      ${S.board.ciclo === "todos" ? `<span class="kc">Ciclo ${esc(p.ciclo)}</span>` : ""}
      <div class="kt">${p.prioridade === "alta" ? `<span class="prio" title="Prioridade alta">${ICON.flag}</span>` : ""}${esc(p.titulo)}</div>
      <div class="badges">
        ${p.descricao ? `<span class="b" title="Tem descrição">${ICON.txt}</span>` : ""}
        ${(p.comentarios || []).length ? `<span class="b" title="${p.comentarios.length} comentário(s)">${ICON.cmt}${p.comentarios.length}</span>` : ""}
        ${(p.links || []).length || p.notaAnexos ? `<span class="b" title="Anexos e links">${ICON.clip}${(p.links || []).length || ""}</span>` : ""}
        ${es.length || p.concluido ? `<span class="b chk ${cls}" title="Entregas concluídas">${ICON.chk}${es.length ? `${d}/${es.length}` : "Concluído"}</span>` : ""}
        ${nxt ? `<span class="b ${nxt < Plan.hoje ? "late" : ""}" title="Próximo prazo">${ICON.clock}${fmtDs(nxt)}</span>` : ""}
        ${avatars(ppl)}
      </div></div></div>`;
}
const orderBetween = (list, idx) => { const a = list[idx - 1]?.ordem, b = list[idx]?.ordem; if (a == null && b == null) return 1000; if (a == null) return b - 1000; if (b == null) return a + 1000; return (a + b) / 2; };
function colMenu(btn) {
  const c = S.data.colunas.find(x => x.id === btn.dataset.id), cols = Plan.cols(), i = cols.findIndex(x => x.id === c.id);
  popMenu(btn, `<div class="mh">Coluna</div><button data-act="renameCol" data-id="${c.id}">Renomear</button>
    <div class="mh">Vincular ao OKR</div><div class="mpad"><select data-act="colObj" data-id="${c.id}" aria-label="OKR da coluna">${opt("", "Nenhum (backlog)", c.objetivoId)}${Plan.objs().map(o => opt(o.id, o.codigo + " · " + o.titulo.slice(0, 38), c.objetivoId)).join("")}</select></div>
    <div class="mh">Posição</div><button data-act="colMove" data-id="${c.id}" data-d="-1" ${i === 0 ? "disabled" : ""}>${ICON.back}Mover para a esquerda</button><button data-act="colMove" data-id="${c.id}" data-d="1" ${i === cols.length - 1 ? "disabled" : ""}>${ICON.next}Mover para a direita</button>
    <button class="dz" data-act="colDel" data-id="${c.id}">${ICON.trash}Excluir coluna</button>`, "w260");
}
let drag = null;
function bindBoardDnD() {
  document.addEventListener("dragstart", e => { const c = e.target.closest?.(".kcard[draggable]"); if (!c) return; drag = c.dataset.card; c.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", drag); } catch (_) { } });
  document.addEventListener("dragend", e => { e.target.closest?.(".kcard")?.classList.remove("dragging"); $$(".col-b.over").forEach(x => x.classList.remove("over")); $$(".drop-mark").forEach(x => x.remove()); drag = null; if (S.pendingRender) setTimeout(render, 50); });
  document.addEventListener("dragover", e => {
    if (!drag) return; const col = e.target.closest?.(".col"); if (!col) return; e.preventDefault();
    const body = $(".col-b", col); $$(".col-b.over").forEach(x => x !== body && x.classList.remove("over")); body.classList.add("over");
    const cards = $$(".kcard:not(.dragging)", body); let ref = cards.find(c => { const r = c.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; });
    let mk = $(".drop-mark"); if (!mk) { mk = document.createElement("div"); mk.className = "drop-mark"; }
    if (ref) body.insertBefore(mk, ref); else body.appendChild(mk);
    const r = body.getBoundingClientRect(); if (e.clientY < r.top + 40) body.scrollTop -= 12; else if (e.clientY > r.bottom - 40) body.scrollTop += 12;
  });
  document.addEventListener("drop", e => {
    if (!drag) return; const col = e.target.closest?.(".col"); if (!col) return; e.preventDefault();
    const body = $(".col-b", col), colId = body.dataset.col, id = drag; drag = null;
    const kids = [...body.children].filter(x => x.classList.contains("kcard") && x.dataset.card !== id || x.classList.contains("drop-mark")), idx = kids.findIndex(x => x.classList.contains("drop-mark"));
    $$(".drop-mark").forEach(x => x.remove()); body.classList.remove("over");
    const list = boardProjects(colId).filter(p => p.id !== id), ordem = orderBetween(list, idx < 0 ? list.length : idx), p = S.data.projetos.find(x => x.id === id); if (!p) return;
    if (p.colunaId === colId && Math.abs(p.ordem - ordem) < 1e-9) return;
    const before = { colunaId: p.colunaId, ordem: p.ordem }, moved = p.colunaId !== colId; p.colunaId = colId; p.ordem = ordem; render(true);
    save(() => Repo.patch("projetos", id, { colunaId: colId, ordem }, { acao: moved ? "moveu" : "alterou", detalhe: moved ? "para " + (S.data.colunas.find(c => c.id === colId)?.titulo.slice(0, 40) || "") : "ordem" }), moved ? "Cartão movido" : null,
      moved ? () => save(() => Repo.patch("projetos", id, before, { silent: true }), "Movimento desfeito") : null).catch(() => { Object.assign(p, before); render(); });
  });
}

/* ---------- Lista ---------- */
const LSORT = { titulo: p => norm(p.titulo), okr: p => Plan.objOf(p)?.codigo || "~", coluna: p => Plan.cols().findIndex(c => c.id === p.colunaId), prog: p => Plan.progresso(p), prazo: p => Plan.janela(p).fim || "9999", status: p => ["atrasado", "ainiciar", "andamento", "semplano", "concluido"].indexOf(Plan.statusP(p)), prio: p => ({ alta: 0, media: 1, baixa: 2 }[p.prioridade] ?? 3) };
function renderLista() {
  if (!$("#pv")) return;
  const s = S.board.sort || { k: "status", d: 1 }, ps = S.data.projetos.filter(boardFilter).sort((a, b) => { const x = LSORT[s.k](a), y = LSORT[s.k](b); return (x < y ? -1 : x > y ? 1 : byText(a.titulo, b.titulo)) * s.d; });
  const th = (k, l) => `<th><button class="sortb ${s.k === k ? "on" : ""}" data-act="lsort" data-k="${k}">${l}${s.k === k ? (s.d > 0 ? " ↑" : " ↓") : ""}</button></th>`;
  $("#pv").innerHTML = `<section class="card"><div class="tablewrap"><table class="rtable"><thead><tr>${th("titulo", "Projeto")}${th("okr", "OKR")}${th("status", "Situação")}${th("prio", "Prioridade")}<th>Responsáveis</th>${th("prog", "Progresso")}${th("prazo", "Prazo")}</tr></thead>
    <tbody>${ps.map(p => { const pr = Plan.progresso(p), st = Plan.statusP(p), j = Plan.janela(p); return `<tr class="click" data-act="openCard" data-id="${p.id}" tabindex="0">
      <td data-l="Projeto" class="tcell-main"><div class="t1">${esc(p.titulo)}</div><div class="t2">${esc(S.data.colunas.find(c => c.id === p.colunaId)?.titulo.slice(0, 50) || "")}${(p.etiquetas || []).length ? " · " : ""}</div>${(p.etiquetas || []).length ? `<div class="etqs">${etqChips(p.etiquetas)}</div>` : ""}</td>
      <td data-l="OKR">${okrTag(Plan.objOf(p))}</td><td data-l="Situação">${statusPill(st)}</td><td data-l="Prioridade">${p.prioridade ? `<span class="prio-t p-${p.prioridade}">${PRIO[p.prioridade]}</span>` : "—"}</td>
      <td data-l="Responsáveis">${avatars([...(p.responsaveis || []), ...(p.entregas || []).map(e => e.resp)], 4)}</td>
      <td data-l="Progresso"><div class="bar"><div class="tr"><span style="width:${(pr * 100).toFixed(0)}%;background:${st === "atrasado" ? cssVar("--brick") : pr >= 1 ? cssVar("--ok") : cssVar("--navy")}"></span></div><span class="v">${(p.entregas || []).length ? pct(pr) : "—"}</span></div></td>
      <td data-l="Prazo">${j.fim ? fmtD(j.fim) : "—"}</td></tr>`; }).join("") || `<tr><td colspan="7"><div class="empty sm">Nenhum projeto com estes filtros.</div></td></tr>`}</tbody></table></div></section>`;
}

/* ---------- Cronograma (Gantt) ---------- */
function renderCrono() {
  const ps = S.data.projetos.filter(boardFilter).map(p => ({ p, j: Plan.janela(p), o: Plan.objOf(p) })).filter(x => x.j.ini || x.j.fim);
  const sem = S.data.projetos.filter(boardFilter).length - ps.length;
  if (!ps.length) { $("#pv").innerHTML = `<div class="card empty"><b>Nenhum projeto com datas neste recorte</b>Defina o início, o prazo ou os prazos das entregas para o projeto aparecer no cronograma.</div>`; return; }
  const all = ps.flatMap(x => [x.j.ini || x.j.fim, x.j.fim || x.j.ini]).concat([Plan.hoje]).sort();
  let a = all[0].slice(0, 7) + "-01", z = all[all.length - 1]; const months = []; let m = a;
  while (m <= z && months.length < 36) { months.push(m.slice(0, 7)); const [y, mo] = m.split("-").map(Number); m = `${mo === 12 ? y + 1 : y}-${pad(mo === 12 ? 1 : mo + 1)}-01`; }
  const start = toUTC(months[0] + "-01"), endM = months[months.length - 1], [ey, em] = endM.split("-").map(Number), end = Date.UTC(em === 12 ? ey + 1 : ey, em === 12 ? 0 : em, 1);
  const X = d => ((toUTC(d) - start) / (end - start) * 100).toFixed(3) + "%", W = (d1, d2) => (Math.max(toUTC(d2) - toUTC(d1) + 864e5, 864e5) / (end - start) * 100).toFixed(3) + "%";
  const groups = []; Plan.objs().forEach(o => groups.push({ o, it: ps.filter(x => x.o?.id === o.id) })); groups.push({ o: null, it: ps.filter(x => !x.o) });
  const C = SIT_COLOR();
  $("#pv").innerHTML = `<section class="card crono"><div class="cr-scroll"><div class="cr" style="--n:${months.length}">
    <div class="cr-head"><div class="cr-l">Projeto</div><div class="cr-t">${months.map(k => `<span class="${k === Plan.hoje.slice(0, 7) ? "now" : ""}">${mesLabel(k)}</span>`).join("")}</div></div>
    ${groups.filter(g => g.it.length).map(g => `<div class="cr-g"><div class="cr-gl">${okrTag(g.o)} ${esc(g.o?.titulo.slice(0, 70) || "Backlog")}</div></div>` + g.it.sort((a, b) => byText(a.j.ini || a.j.fim, b.j.ini || b.j.fim)).map(x => {
      const ini = x.j.ini || x.j.fim, fim = x.j.fim || x.j.ini, st = Plan.statusP(x.p), pr = Plan.progresso(x.p);
      return `<div class="cr-r"><button class="cr-l" data-act="openCard" data-id="${x.p.id}" title="${esc(x.p.titulo)}">${esc(x.p.titulo)}</button><div class="cr-t">
        <button class="cr-bar st-${st}" style="left:${X(ini)};width:${W(ini, fim)}" data-act="openCard" data-id="${x.p.id}" aria-label="${esc(x.p.titulo)}: ${fmtD(ini)} a ${fmtD(fim)}, ${pct(pr)}"><span class="cr-fill" style="width:${(pr * 100).toFixed(0)}%"></span><span class="cr-lb">${pct(pr)}</span></button>
        ${(x.p.entregas || []).filter(e => e.prazo).map(e => `<i class="cr-dot" style="left:${X(e.prazo)};background:${C[Plan.sitE(e)]}" title="${esc(e.texto)} · ${fmtD(e.prazo)}"></i>`).join("")}</div></div>`; }).join("")).join("")}
    <div class="cr-today" style="left:calc(var(--lw) + (100% - var(--lw)) * ${((toUTC(Plan.hoje) - start) / (end - start)).toFixed(4)})"><span>hoje</span></div>
  </div></div><div class="legend"><span class="li"><span class="sw" style="background:var(--navy-l);border:1px solid var(--navy)"></span>Período do projeto (parte escura = % concluído)</span>${SIT_ORDER.slice(0, 3).map(s => `<span class="li"><span class="sw round" style="background:${C[s]}"></span>Entrega ${SIT[s].toLowerCase()}</span>`).join("")}${sem ? `<span class="li">· ${sem} projeto(s) sem datas não aparecem</span>` : ""}</div></section>`;
}

/* =====================================================================
   CARTÃO DO PROJETO (modal)
   ===================================================================== */
function openModal(id) { const p = S.data.projetos.find(x => x.id === id); if (!p) { toast("Este projeto não existe mais.", null, "erro"); return; } closeMenus(); closePalette(); S.modal = { id, tab: "detalhes" }; $("#scrim").hidden = false; document.body.classList.add("noscroll"); renderModal({ first: true }); try { history.pushState({ card: id }, "", location.hash.split("?")[0] + "?card=" + id); } catch (_) { } }
function closeModal(fromPop) { if (!S.modal) return; S.modal = null; $("#scrim").hidden = true; $("#modal").innerHTML = ""; if (!S.drawer) document.body.classList.remove("noscroll"); if (!fromPop) { try { history.replaceState(null, "", location.hash.split("?")[0]); } catch (_) { } } }
function myName() { return S.me.nome || lsGet(KEY + "-nome", "") || ""; }
function autoGrow(el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }
function renderModal(o = {}) {
  const m = $("#modal"), p = S.data.projetos.find(x => x.id === S.modal?.id);
  if (!p) { if (!o.first) { closeModal(); toast("Este projeto foi excluído por outra pessoa."); } return; }
  const a = document.activeElement, typing = a && m.contains(a) && (a.tagName === "TEXTAREA" || (a.tagName === "INPUT" && /^(text|search|url|email|)$/.test(a.type)));
  if (!o.force && !o.first && typing) return;
  const keep = (o.force && a && m.contains(a) && a.id) || "", scr = $("#scrim").scrollTop;
  const capa = S.data.capas.find(c => c.id === p.id)?.data, cols = Plan.cols(), col = cols.find(c => c.id === p.colunaId), obj = Plan.objOf(p);
  const es = p.entregas || [], d = es.filter(e => e.feito).length, prog = es.length ? d / es.length : 0, st = Plan.statusP(p);
  const ed = canEditProject(p), edG = can("editar_projetos"), cm = can("comentar"), dis = ed ? "" : "disabled";
  const ppl = people(), hist = (S.historico || []).filter(h => h.ref === p.id).slice(0, 30);
  m.innerHTML = `
    <button class="m-x" data-act="closeModal" aria-label="Fechar">${ICON.x}</button>
    ${capa ? `<div class="m-cover" style="background-image:url('${capa}')"></div>` : ""}
    <div class="m-body">
      <div class="m-main">
        ${ed ? `<textarea class="m-title" id="m-title" rows="1" maxlength="400" aria-label="Nome do projeto">${esc(p.titulo)}</textarea>` : `<h2 class="m-title ro" id="m-title-ro">${esc(p.titulo)}</h2>`}
        <div class="m-where">na coluna <b>${esc((col?.titulo || "—").slice(0, 60))}${(col?.titulo.length || 0) > 60 ? "…" : ""}</b> ${okrTag(obj)} ${statusPill(st)} <span class="muted">Ciclo ${esc(p.ciclo)}</span>${p.arquivado ? `<span class="pill st-semplano">Arquivado</span>` : ""}</div>
        ${(p.etiquetas || []).length ? `<div class="etqs mt8">${etqChips(p.etiquetas)}</div>` : ""}
        <div class="m-sec"><h4>${ICON.txt}Descrição</h4>${ed ? `<textarea class="m-desc" id="m-desc" placeholder="Objetivo do projeto, escopo, equipe, indicadores…" maxlength="8000">${esc(p.descricao)}</textarea>` : `<div class="m-desc ro">${p.descricao ? linkify(p.descricao) : '<span class="muted">Sem descrição.</span>'}</div>`}</div>
        <div class="m-sec"><h4>${ICON.chk}Grupo de entregas<span class="r">${d} de ${es.length} concluídas</span></h4>
          <div class="cl-prog ${prog >= 1 && es.length ? "done" : ""}"><span>${pct(es.length ? prog : 0)}</span><div class="tr"><span style="width:${(prog * 100).toFixed(0)}%"></span></div></div>
          ${es.length > 1 ? `<div class="cl-tools"><button class="btn quiet sm" data-act="clHide" aria-pressed="${!!S.modal.hideDone}">${S.modal.hideDone ? "Mostrar concluídas" : "Ocultar concluídas"}</button></div>` : ""}
          <div id="m-cl">${es.filter(e => !(S.modal.hideDone && e.feito)).map(e => { const late = !e.feito && e.prazo && e.prazo < Plan.hoje;
            return `<div class="cl-item ${e.feito ? "feito" : ""}" data-eid="${e.id}">
              <input type="checkbox" ${e.feito ? "checked" : ""} data-act="eTog" aria-label="Concluída: ${esc(e.texto)}" ${dis}>
              <div class="cl-c">${ed ? `<textarea class="cl-text" rows="1" data-act="eTxt" maxlength="600" aria-label="Texto da entrega">${esc(e.texto)}</textarea>` : `<span class="cl-text ro">${esc(e.texto)}</span>`}
                <div class="cl-meta">${ed ? `<input type="date" value="${esc(e.prazo)}" data-act="ePrazo" class="${late ? "late" : ""}" aria-label="Prazo"><input list="dl-ppl-m" value="${esc(e.resp)}" placeholder="Responsável" data-act="eResp" aria-label="Responsável" maxlength="80">`
                  : `<span class="mini ${late ? "late" : ""}">${ICON.cal}${e.prazo ? fmtD(e.prazo) : "sem prazo"}</span><span class="mini">${ICON.user}${esc(e.resp || "sem responsável")}</span>`}
                  ${late ? `<span class="pill st-atrasado">${daysBetween(e.prazo, Plan.hoje)} dias de atraso</span>` : ""}${e.feito && e.feitoPor ? `<span class="mini">concluída por ${esc(e.feitoPor)}${e.feitoEm ? " · " + fmtD(e.feitoEm.slice(0, 10)) : ""}</span>` : ""}</div></div>
              ${ed ? `<div class="cl-acts"><button class="cl-btn" data-act="eUp" aria-label="Subir">${ICON.up}</button><button class="cl-btn" data-act="eDel" aria-label="Excluir entrega">${ICON.trash}</button></div>` : ""}</div>`; }).join("") || `<div class="empty sm">Nenhuma entrega ainda.${ed ? " Adicione as etapas do projeto abaixo." : ""}</div>`}</div>
          ${ed ? `<form class="cl-add" data-act="eAdd"><input class="inp" id="m-newe" placeholder="Adicionar uma entrega" maxlength="600" aria-label="Nova entrega"><input class="inp" type="date" id="m-newd" aria-label="Prazo da nova entrega"><button class="btn sm" type="submit">Adicionar</button></form>` : ""}
        </div>
        <div class="m-sec"><h4>${ICON.cmt}Comentários</h4>
          ${cm ? `<form class="cmt-new" data-act="cAdd"><textarea id="m-cmtt" placeholder="Escrever um comentário… use @Nome para mencionar alguém" maxlength="4000" aria-label="Novo comentário"></textarea>
            <div class="row">${S.me.nome ? `<span class="hint">como <b>${esc(S.me.nome)}</b></span>` : `<input class="inp" id="m-autor" placeholder="Seu nome" value="${esc(myName())}" list="dl-ppl-m" maxlength="80" aria-label="Seu nome">`}<button class="btn sm" type="submit">Comentar</button></div></form>` : ""}
          ${[...(p.comentarios || [])].sort((x, y) => byText(y.em, x.em)).map(c => `<div class="cmt"><span class="av" style="--ac:${avColor(c.autor)}">${esc(initials(c.autor))}</span>
            <div class="cmt-c"><div class="who"><b>${esc(c.autor)}</b><span title="${fmtDT(c.em)}">${relTime(c.em)}</span></div><div class="txt">${linkify(c.texto)}</div>
            ${(can("editar_projetos") || (c.email && c.email === myEmail())) ? `<button class="linkbtn sm" data-act="cDel" data-id="${c.id}">Excluir</button>` : ""}</div></div>`).join("") || (cm ? "" : `<div class="empty sm">Sem comentários.</div>`)}
        </div>
        ${hist.length ? `<div class="m-sec"><h4>${ICON.history}Histórico do cartão</h4><ul class="hist">${hist.map(h => `<li><b>${esc(h.nome)}</b> ${esc(ACAO[h.acao] || h.acao)}${h.detalhe ? ` · <span>${esc(h.detalhe)}</span>` : ""}<small>${relTime(h.em)}</small></li>`).join("")}</ul></div>` : ""}
      </div>
      <aside class="side">
        <div class="blk"><h5>Coluna</h5><select data-act="mCol" ${edG ? "" : "disabled"} aria-label="Coluna">${cols.map(c => opt(c.id, c.titulo.length > 46 ? c.titulo.slice(0, 44) + "…" : c.titulo, p.colunaId)).join("")}</select></div>
        <div class="blk two"><div><h5>Ciclo</h5><select data-act="mCiclo" ${edG ? "" : "disabled"} aria-label="Ciclo">${[...new Set([...ciclos(), String(new Date().getFullYear()), String(new Date().getFullYear() + 1)])].sort().map(c => opt(c, c, p.ciclo)).join("")}</select></div>
          <div><h5>Prioridade</h5><select data-act="mPrio" ${dis} aria-label="Prioridade">${opt("", "—", p.prioridade)}${Object.entries(PRIO).map(([k, v]) => opt(k, v, p.prioridade)).join("")}</select></div></div>
        <div class="blk two"><div><h5>Início</h5><input class="inp" type="date" data-act="mIni" value="${esc(p.inicio)}" ${dis} aria-label="Data de início"></div><div><h5>Prazo final</h5><input class="inp" type="date" data-act="mPrazo" value="${esc(p.prazo)}" ${dis} aria-label="Prazo final"></div></div>
        <div class="blk"><h5>Responsáveis</h5><div class="ppl">${(p.responsaveis || []).map(r => `<span class="chip"><span class="av xs" style="--ac:${avColor(r)}">${esc(initials(r))}</span>${esc(r)}${ed ? `<button data-act="rDel" data-v="${esc(r)}" aria-label="Remover ${esc(r)}">×</button>` : ""}</span>`).join("") || `<span class="hint">Ninguém atribuído</span>`}</div>
          ${ed ? `<form data-act="rAdd" class="inl"><input class="inp" id="m-rnew" list="dl-ppl-m" placeholder="Adicionar pessoa" maxlength="80" aria-label="Adicionar responsável"><button class="btn ghost sm" type="submit">${ICON.plus}</button></form>` : ""}</div>
        <div class="blk"><h5>Etiquetas</h5><div class="etq-pick">${etiquetas().map(e => `<button class="etq ${(p.etiquetas || []).includes(e.id) ? "on" : ""}" style="--ec:${e.cor}" data-act="etqTog" data-id="${e.id}" aria-pressed="${(p.etiquetas || []).includes(e.id)}" ${dis}>${esc(e.nome)}</button>`).join("")}</div></div>
        <div class="blk"><label class="ck"><input type="checkbox" data-act="mDone" ${p.concluido ? "checked" : ""} ${dis}><span>Marcar projeto como concluído</span></label></div>
        <div class="blk"><h5>Capa</h5>${ed ? `${capa ? `<button class="btn ghost sm" data-act="capaDel">Remover capa</button>` : ""}<label class="btn ghost sm">${capa ? "Trocar imagem" : "Adicionar imagem"}<input type="file" data-act="capaUp" accept="image/png,image/jpeg,image/webp" hidden></label><p class="hint">Ex.: o Project Model Canvas.</p>` : `<p class="hint">${capa ? "Imagem do projeto acima." : "Sem capa."}</p>`}</div>
        <div class="blk"><h5>Anexos e links</h5><div class="links">${(p.links || []).map(l => `<div class="lrow"><a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${ICON.clip}<span>${esc(l.nome)}</span></a>${ed ? `<button class="cl-btn" data-act="lDel" data-id="${l.id}" aria-label="Remover link">${ICON.x}</button>` : ""}</div>`).join("") || (p.notaAnexos ? "" : `<p class="hint">Nenhum link.</p>`)}</div>
          ${p.notaAnexos ? `<div class="note">${esc(p.notaAnexos)}</div>` : ""}
          ${ed ? `<form data-act="lAdd" class="lform"><input class="inp" id="m-lurl" type="url" placeholder="Cole o link (Drive, Docs…)" aria-label="Link"><input class="inp" id="m-lnome" placeholder="Nome (opcional)" maxlength="160" aria-label="Nome do link"><button class="btn ghost sm" type="submit">Adicionar link</button></form>` : ""}</div>
        <div class="blk acts">
          ${can("automacoes") && S.mode === "cloud" ? `<button class="btn ghost sm" data-act="notificar">${ICON.mail}Avisar responsáveis por e-mail</button>` : ""}
          ${edG ? `<button class="btn ghost sm" data-act="dupCard">${ICON.copy}Duplicar</button><button class="btn ghost sm" data-act="arqCard">${ICON.archive}${p.arquivado ? "Restaurar" : "Arquivar"}</button><button class="btn danger sm" data-act="delCard">${ICON.trash}Excluir</button>` : ""}
        </div>
      </aside>
    </div><datalist id="dl-ppl-m">${ppl.map(x => `<option value="${esc(x)}">`).join("")}</datalist>`;
  $$("textarea.m-title, textarea.cl-text", m).forEach(autoGrow);
  $("#scrim").scrollTop = scr;
  if (keep) document.getElementById(keep)?.focus(); else if (o.first) m.querySelector(".m-x").focus({ preventScroll: true });
  if (o.first && !S.historico && S.mode !== "local") loadHistorico().then(() => { if (S.modal?.id === p.id) renderModal(); });
}
async function patchP(partial, msg, rerender = true, opts) {
  const id = S.modal?.id, p = S.data.projetos.find(x => x.id === id); if (!p) return false;
  const before = {}; Object.keys(partial).forEach(k => before[k] = structuredClone(p[k]));
  Object.assign(p, structuredClone(partial)); if (rerender) renderModal({ force: true }); if (S.view !== "painel") render();
  return save(() => Repo.patch("projetos", id, partial, opts), msg).then(() => true).catch(() => { Object.assign(p, before); renderModal({ force: true }); render(); return false; });
}
const curP = () => S.data.projetos.find(x => x.id === S.modal?.id);
const entregasCopy = () => (curP()?.entregas || []).map(e => ({ ...e }));
function uploadCapa(file) {
  const id = S.modal.id; if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) { toast("Use uma imagem PNG, JPG ou WEBP.", null, "erro"); return; }
  if (file.size > 15e6) { toast("Imagem grande demais (máximo 15 MB).", null, "erro"); return; }
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => {
    const s = Math.min(1, 1200 / img.width), c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
    const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
    let q = .85, data = c.toDataURL("image/jpeg", q); while (data.length > 380000 && q > .35) { q -= .1; data = c.toDataURL("image/jpeg", q); }
    if (data.length > 380000) { toast("Não consegui reduzir a imagem o suficiente. Tente outra.", null, "erro"); return; }
    save(() => Repo.setCapa(id, data), "Capa atualizada").catch(() => { });
  };
  img.onerror = () => { URL.revokeObjectURL(url); toast("Não consegui ler essa imagem.", null, "erro"); };
  img.src = url;
}

/* =====================================================================
   CONFIGURAÇÕES · geral, pessoas e acessos, segurança, automações,
   etiquetas, dados, minha conta e sobre
   ===================================================================== */
const CTABS = [
  ["conta", "Minha conta", "user", () => true], ["geral", "Geral", "gear", () => can("config")], ["pessoas", "Pessoas e acessos", "users", () => can("pessoas")],
  ["seguranca", "Segurança", "shield", () => can("seguranca")], ["automacoes", "Automações", "zap", () => can("automacoes")],
  ["etiquetas", "Etiquetas", "tag", () => can("editar_quadro")], ["dados", "Dados", "db", () => can("dados")], ["sobre", "Sobre", "info", () => true],
];
function renderConfig() {
  const tabs = CTABS.filter(t => t[3]()); if (!tabs.some(t => t[0] === S.sub.config)) S.sub.config = tabs.length > 1 ? tabs[1][0] : "conta";
  const t = S.sub.config;
  $("#view").innerHTML = `<div class="page-h"><div><h1>Configurações</h1><p class="sub">${esc(CFG.cliente.nome)} · ${ROLES[S.me.papel]?.l || ""}</p></div></div>
  <div class="cfg"><nav class="cfg-nav" aria-label="Seções das configurações">${tabs.map(([k, l, i]) => `<button data-act="ctab" data-v="${k}" aria-current="${k === t ? "page" : "false"}">${ICON[i]}<span>${l}</span></button>`).join("")}</nav>
  <div class="cfg-b" id="cfg-b"></div></div>`;
  ({ conta: cfgConta, geral: cfgGeral, pessoas: cfgPessoas, seguranca: cfgSeguranca, automacoes: cfgAutomacoes, etiquetas: cfgEtiquetas, dados: cfgDados, sobre: cfgSobre })[t]();
}
const cbox = (titulo, sub, body, act = "") => `<section class="card cfg-card"><div class="card-h"><div><h3>${titulo}</h3>${sub ? `<p class="sub">${sub}</p>` : ""}</div>${act}</div>${body}</section>`;
function modeLabel() { return S.mode === "cloud" ? "Nuvem (Firebase) · dados compartilhados em tempo real" : S.mode === "artifact" ? "Claude · dados compartilhados com quem tem o link" : "Demonstração · dados só neste navegador"; }

function cfgConta() {
  if (!$("#cfg-b")) return;
  const p = pessoaPorNome(S.me.nome);
  $("#cfg-b").innerHTML = cbox("Minha conta", "Seus dados de acesso.", `<dl class="kv"><dt>Nome</dt><dd>${esc(S.me.nome || "—")}</dd><dt>E-mail</dt><dd>${esc(S.me.email || "—")}</dd><dt>Perfil</dt><dd><span class="role r-${S.me.papel}">${ROLES[S.me.papel]?.l}</span> ${esc(ROLES[S.me.papel]?.d || "")}</dd>${p?.cargo ? `<dt>Cargo</dt><dd>${esc(p.cargo)}</dd>` : ""}</dl>`) +
  (S.mode === "cloud" ? cbox("Trocar senha", "Use pelo menos 8 caracteres, com letras e números.", `<form class="form2" data-act="trocarSenha" novalidate>
      <label>Senha atual<input class="inp" type="password" id="pw0" autocomplete="current-password" required></label>
      <label>Nova senha<input class="inp" type="password" id="pw1" autocomplete="new-password" minlength="8" required></label>
      <label>Repita a nova senha<input class="inp" type="password" id="pw2" autocomplete="new-password" minlength="8" required></label>
      <div class="pwm" id="pwm" aria-live="polite"></div><button class="btn" type="submit">Trocar senha</button></form>`)
   : cbox("Seu nome nos comentários", "Aparece quando você comenta ou conclui uma entrega.", `<form class="form2" data-act="meuNome"><label>Nome<input class="inp" id="mnome" value="${esc(myName())}" list="dl-ppl-c" maxlength="80"></label><datalist id="dl-ppl-c">${people().map(x => `<option value="${esc(x)}">`).join("")}</datalist><button class="btn" type="submit">Salvar</button></form>`));
}
function cfgGeral() {
  if (!$("#cfg-b")) return;
  const g = geral();
  $("#cfg-b").innerHTML = cbox("Geral", "Preferências do planejamento.", `<form class="form2" data-act="salvarGeral">
    <label>Ciclo atual<select id="g-ciclo">${[...new Set([...ciclos(), String(new Date().getFullYear()), String(new Date().getFullYear() + 1)])].sort().map(c => opt(c, c, g.cicloAtual)).join("")}</select><span class="hint">Abre por padrão no painel e no quadro.</span></label>
    <button class="btn" type="submit">Salvar</button></form>`) +
    cbox("Identidade do cliente", "Nome, cores, frases e logo vêm do arquivo de configuração (config.js), o que permite usar a plataforma em outros clientes.", `<dl class="kv"><dt>Cliente</dt><dd>${esc(CFG.cliente.nome)}</dd><dt>Rede</dt><dd>${esc(CFG.cliente.rede || "—")}</dd><dt>Frase de abertura</dt><dd><i>${esc(CFG.abertura.titulo)}</i> · ${esc(CFG.abertura.traducao)}</dd><dt>Frases do painel</dt><dd>${CFG.frases.length}</dd></dl>`);
}
function cfgPessoas() {
  if (!$("#cfg-b")) return;
  const ps = [...S.data.pessoas].sort((a, b) => (a.ativo === false) - (b.ativo === false) || byText(a.nome, b.nome)), sem = people().filter(n => !pessoaPorNome(n));
  $("#cfg-b").innerHTML = cbox("Pessoas e acessos", S.mode === "cloud" ? "Quem acessa a plataforma e com qual perfil. Ao dar acesso, a pessoa recebe um e-mail para criar a própria senha." : S.mode === "artifact" ? "No Claude, quem abre a plataforma é definido pelo compartilhamento do link. Aqui você cadastra os e-mails usados nos lembretes." : "No modo demonstração não há contas individuais. Cadastre as pessoas para usar nos lembretes quando a nuvem estiver ligada.",
    `<div class="roles">${ROLE_ORDER.map(r => `<div><span class="role r-${r}">${ROLES[r].l}</span><span>${ROLES[r].d}</span></div>`).join("")}</div>
    <div class="tablewrap"><table class="rtable"><thead><tr><th>Pessoa</th><th>E-mail</th><th>Perfil</th><th>Situação</th><th><span class="vh">Ações</span></th></tr></thead><tbody>
    ${ps.map(p => `<tr class="${p.ativo === false ? "dim" : ""}"><td data-l="Pessoa" class="tcell-main"><span class="who">${avatars([p.nome], 1)}<span><b>${esc(p.nome)}</b>${p.cargo ? `<small>${esc(p.cargo)}${p.area ? " · " + esc(p.area) : ""}</small>` : ""}</span></span></td>
      <td data-l="E-mail">${esc(p.email || "—")}</td><td data-l="Perfil">${p.papel === "sem_acesso" ? `<span class="muted">Sem acesso</span>` : `<span class="role r-${p.papel}">${ROLES[p.papel]?.l}</span>`}</td>
      <td data-l="Situação">${p.ativo === false ? "Desativada" : p.papel === "sem_acesso" ? "Recebe lembretes" : S.mode !== "cloud" ? "Ativa" : p.convidadoEm ? `Convite enviado ${relTime(p.convidadoEm)}` : "Ativa"}</td>
      <td class="tact"><div class="rowact">${S.mode === "cloud" && p.email && p.papel !== "sem_acesso" && p.ativo !== false ? `<button class="btn quiet sm" data-act="convidar" data-id="${p.id}">${ICON.mail}Reenviar convite</button>` : ""}<button class="btn ghost sm" data-act="editPessoa" data-id="${p.id}">Editar</button></div></td></tr>`).join("") || `<tr><td colspan="5"><div class="empty sm">Nenhuma pessoa cadastrada.</div></td></tr>`}
    </tbody></table></div>
    ${sem.length ? `<div class="note mt"><b>${sem.length} nome(s) aparecem nos projetos sem cadastro:</b> ${sem.map(n => `<button class="linkbtn" data-act="novaPessoa" data-nome="${esc(n)}">${esc(n)}</button>`).join(", ")}. Cadastre com e-mail para que recebam lembretes.</div>` : ""}`,
    `<button class="btn" data-act="novaPessoa">${ICON.plus}Adicionar pessoa</button>`);
}
function pessoaForm(id, preset = {}) {
  const p = id ? S.data.pessoas.find(x => x.id === id) : { papel: "participante", ativo: true, ...preset };
  const papeis = [...ROLE_ORDER.map(r => [r, ROLES[r].l + " · " + ROLES[r].d.split(".")[0]]), ["sem_acesso", "Sem acesso · só recebe lembretes por e-mail"]];
  openDrawer({ titulo: id ? "Editar pessoa" : "Adicionar pessoa", sub: S.mode === "cloud" ? "Ao salvar com um perfil de acesso, a pessoa recebe um convite por e-mail." : "", valores: p,
    campos: [{ k: "nome", l: "Nome (como aparece nos projetos)", max: 80, list: "dl-ppl" }, { k: "email", l: "E-mail", type: "email", max: 120, ac: "off", dis: !!(id && p.email && S.mode === "cloud") , hint: id && p.email && S.mode === "cloud" ? "O e-mail de acesso não pode ser trocado. Desative e cadastre de novo, se preciso." : "" },
      { k: "cargo", l: "Cargo", h: 1, max: 80 }, { k: "area", l: "Área", h: 1, max: 80 }, { k: "papel", l: "Perfil de acesso", type: "select", opts: papeis },
      { k: "ativo", type: "check", cl: "Pessoa ativa (desmarque para bloquear o acesso)" }],
    salvar: d => salvarPessoa(id, { ...p, ...d, email: d.email ?? p.email }),
    excluir: id && can("pessoas") && { texto: "A pessoa será removida da lista e perderá o acesso. Os nomes nos projetos continuam.", fn: () => removerPessoa(id) } });
}
async function salvarPessoa(id, d) {
  const [o, e] = SCHEMAS.pessoas(d); if (Object.keys(e).length) throw new ValidationError(e);
  const dup = S.data.pessoas.find(x => x.id !== id && o.email && normEmail(x.email) === o.email); if (dup) throw new ValidationError({ email: `Este e-mail já é de ${dup.nome}` });
  if (o.email === myEmail() && (o.papel !== "admin" || !o.ativo) && S.me.papel === "admin") throw new ValidationError({ papel: "Você não pode tirar o seu próprio acesso de administrador." });
  const prev = id ? S.data.pessoas.find(x => x.id === id) : null;
  const precisaConvite = S.mode === "cloud" && o.email && o.papel !== "sem_acesso" && o.ativo && (!prev || !prev.email || prev.papel === "sem_acesso" || prev.ativo === false);
  const pid = id ? (await save(() => Repo.patch("pessoas", id, o), "Pessoa salva"), id) : await save(() => Repo.create("pessoas", o), "Pessoa adicionada");
  if (S.mode === "cloud" && o.email) await Access.sync(o, pid);
  if (precisaConvite) await convidar(pid, true);
  setTimeout(() => syncMembros(), 600);
}
async function removerPessoa(id) { const p = S.data.pessoas.find(x => x.id === id); if (p?.email === myEmail()) throw new Error("Você não pode remover a si mesmo."); if (S.mode === "cloud" && p?.email) await Access.revoke(p.email); await save(() => Repo.remove("pessoas", id), "Pessoa removida"); }
async function convidar(id, silent) {
  const p = S.data.pessoas.find(x => x.id === id); if (!p?.email) return;
  try { await Access.invite(p.email); await Repo.patch("pessoas", id, { convidadoEm: new Date().toISOString() }, { acao: "convidou", detalhe: p.email }); toast(`Convite enviado para ${p.email}`); }
  catch (e) { toast(e.message || "Não foi possível enviar o convite.", null, "erro"); if (!silent) throw e; }
}
async function cfgSeguranca() {
  if (!$("#cfg-b")) return;
  const sg = seguranca();
  $("#cfg-b").innerHTML = cbox("Política de acesso", "Proteção contra tentativas de adivinhar senhas.", `<ol class="steps"><li><b>3 senhas erradas</b> · a pessoa espera 1 minuto para tentar de novo</li><li><b>6 senhas erradas</b> · espera 5 minutos</li><li><b>9 senhas erradas</b> · o acesso é bloqueado até um administrador liberar</li></ol>
    <p class="hint">${S.mode === "cloud" ? "O contador fica no servidor, por e-mail, e as regras do banco recusam os dados de contas bloqueadas mesmo fora da plataforma. Ao entrar com a senha certa antes do bloqueio, o contador volta a zero." : "Neste modo o contador fica no navegador. A proteção completa, no servidor, funciona com a nuvem (Firebase)."}</p>`) +
    cbox("Sessão", "Encerra o acesso de quem deixar a plataforma aberta e parada.", `<form class="form2" data-act="salvarSeg"><label>Sair automaticamente após<select id="sg-to">${[[15, "15 minutos"], [30, "30 minutos"], [60, "1 hora"], [120, "2 horas"], [480, "8 horas"], [0, "Nunca"]].map(([v, l]) => opt(v, l, sg.timeoutMin)).join("")}</select></label><button class="btn" type="submit">Salvar</button></form>`) +
    cbox("Acessos bloqueados e tentativas recentes", "Contas com senhas erradas registradas.", `<div id="tent">${S.mode === "cloud" ? '<div class="empty sm">Carregando…</div>' : '<div class="empty sm">Disponível com a nuvem (Firebase).</div>'}</div>`) +
    cbox("Boas práticas já ativas", "", `<ul class="good"><li>${ICON.shield}Cada pessoa tem login próprio e perfil de acesso definido pelo administrador.</li><li>${ICON.shield}As regras do banco conferem o perfil a cada leitura e gravação, inclusive fora da plataforma.</li><li>${ICON.shield}Senhas ficam com o Google (Firebase Authentication); a plataforma não guarda senhas.</li><li>${ICON.shield}Histórico de alterações com autor e horário.</li><li>${ICON.shield}Conexão sempre criptografada (HTTPS).</li></ul>`);
  if (S.mode === "cloud") {
    try { const s = await S.fb.firestore().collection("tentativas").where("n", ">", 0).get(); const rows = s.docs.map(d => ({ email: d.id, ...d.data() })).sort((a, b) => b.n - a.n);
      const box = $("#tent"); if (!box) return;
      box.innerHTML = rows.length ? `<div class="tablewrap"><table class="rtable"><thead><tr><th>E-mail</th><th>Erros</th><th>Situação</th><th>Última tentativa</th><th><span class="vh">Ações</span></th></tr></thead><tbody>${rows.map(r => { const st = Lockout.status(r); return `<tr><td data-l="E-mail">${esc(r.email)}</td><td data-l="Erros">${r.n}</td><td data-l="Situação">${st.blocked ? '<span class="pill st-atrasado">Bloqueado</span>' : st.left ? `<span class="pill st-andamento">Aguardando ${Math.ceil(st.left / 60)} min</span>` : "Pode tentar"}</td><td data-l="Última">${fmtDT(r.ultima)}</td><td class="tact"><button class="btn ghost sm" data-act="desbloquear" data-email="${esc(r.email)}">Liberar</button></td></tr>`; }).join("")}</tbody></table></div>` : `<div class="empty sm">Nenhuma tentativa errada registrada.</div>`;
    } catch (e) { const box = $("#tent"); if (box) box.innerHTML = `<div class="empty sm">Não foi possível ler as tentativas (${esc(e.code || e.message)}).</div>`; }
  }
}
function cfgAutomacoes() {
  if (!$("#cfg-b")) return;
  const a = automacoes(), last = a.ultimaExecucao ? `Última execução: ${fmtDT(a.ultimaExecucao)}${a.ultimoResultado ? " · " + esc(a.ultimoResultado) : ""}` : "A automação ainda não rodou.";
  $("#cfg-b").innerHTML = (S.mode !== "cloud" ? `<div class="banner info">${ICON.info}<span>Os e-mails automáticos funcionam com a nuvem (Firebase) e o robô de e-mails (Google Apps Script). Veja o guia de implantação.</span></div>` : "") +
    cbox("Lembretes e resumos por e-mail", "Enviados pelo robô de e-mails uma vez por dia, de manhã.", `<form class="form2" data-act="salvarAuto">
      <label class="ck"><input type="checkbox" id="au-on" ${a.ativo ? "checked" : ""}><span>Enviar lembretes automáticos</span></label>
      <label>Avisar entregas que vencem em até<select id="au-dias">${[1, 2, 3, 5, 7].map(v => opt(v, v + (v === 1 ? " dia" : " dias"), a.diasAntes)).join("")}</select></label>
      <label class="ck"><input type="checkbox" id="au-late" ${a.atrasadas !== false ? "checked" : ""}><span>Avisar entregas atrasadas (uma vez por semana para cada pessoa)</span></label>
      <label class="ck"><input type="checkbox" id="au-sem" ${a.resumoSemanal ? "checked" : ""}><span>Resumo semanal para a diretoria</span></label>
      <label>Dia do resumo<select id="au-dia">${DIAS.map((d, i) => opt(i, d[0].toUpperCase() + d.slice(1), a.diaResumo)).join("")}</select></label>
      <label>Quem recebe o resumo (e-mails separados por vírgula)<input class="inp" id="au-dest" value="${esc((a.destinatarios || []).join(", "))}" placeholder="diretoria@colegio.com.br, …"></label>
      <button class="btn" type="submit">Salvar</button></form><p class="hint mt">${ICON.clock}${last}</p>`) +
    (S.mode === "cloud" && can("pessoas") ? cbox("Conta do robô de e-mails", "O robô (Google Apps Script) entra com uma conta própria, que só lê o planejamento e envia os e-mails da fila.", `<form class="form2" data-act="roboSave"><label>E-mail da conta do robô<input class="inp" id="robo-email" type="email" value="${esc(cfgDoc("automacoes").roboEmail || "")}" placeholder="robo@colegio.com.br"></label><button class="btn" type="submit">${ICON.shield}Autorizar robô</button></form>`) : "") +
    (S.mode === "cloud" ? cbox("Teste", "Confere se o robô está entregando os e-mails.", `<button class="btn ghost" data-act="emailTeste">${ICON.mail}Enviar e-mail de teste para mim</button><p class="hint mt">O e-mail chega na próxima rodada do robô (a cada 15 minutos).</p>`) : "");
}
function cfgEtiquetas() {
  if (!$("#cfg-b")) return;
  const l = etiquetas();
  $("#cfg-b").innerHTML = cbox("Etiquetas dos cartões", "Use para agrupar projetos por área ou tema. Toque numa cor para trocar.", `<form data-act="salvarEtq" class="etq-ed">${l.map((e, i) => `<div class="er"><input type="color" value="${esc(e.cor)}" name="c${i}" aria-label="Cor"><input class="inp" name="n${i}" value="${esc(e.nome)}" maxlength="40" aria-label="Nome da etiqueta"><input type="hidden" name="i${i}" value="${esc(e.id)}"><button type="button" class="btn quiet ico sm" data-act="etqDel" data-i="${i}" aria-label="Remover">${ICON.trash}</button></div>`).join("")}
    <div class="row"><button type="button" class="btn ghost sm" data-act="etqAdd">${ICON.plus}Nova etiqueta</button><span class="sp"></span><button class="btn" type="submit">Salvar etiquetas</button></div></form>`);
}
function cfgDados() {
  if (!$("#cfg-b")) return;
  $("#cfg-b").innerHTML = cbox("Exportar", "Cópias para guardar ou analisar em planilha.", `<div class="row wrap"><button class="btn ghost" data-act="backup">${ICON.down}Backup completo (JSON)</button><button class="btn ghost" data-act="exportCSVall">${ICON.down}Todas as entregas (planilha)</button></div>`) +
    cbox("Restaurar backup", "Grava de volta os registros de um arquivo de backup. Itens com o mesmo código são substituídos.", `<label class="btn ghost">${ICON.up}Escolher arquivo de backup<input type="file" accept="application/json,.json" data-act="restore" hidden></label>`) +
    (S.mode === "local" ? cbox("Dados de demonstração", "Volta este navegador aos dados iniciais (quadro do Trello e OKRs).", `<button class="btn danger" data-act="resetDemo">Restaurar dados iniciais</button>`) : "");
}
function cfgSobre() {
  if (!$("#cfg-b")) return;
  $("#cfg-b").innerHTML = cbox("Sobre a plataforma", "", `<dl class="kv"><dt>Versão</dt><dd>${APP_VERSION}</dd><dt>Modo</dt><dd>${modeLabel()}</dd><dt>Cliente</dt><dd>${esc(CFG.cliente.nome)}</dd><dt>Metodologia</dt><dd>Gomes de Matos Consultoria</dd></dl>
    <p class="hint mt">Se a versão acima não for a que você acabou de publicar, o navegador está usando uma cópia antiga: aguarde alguns minutos e recarregue com Ctrl+Shift+R (no celular, feche e abra a aba).</p>`) +
    cbox("Atalhos de teclado", "", shortcutsHTML());
}
const shortcutsHTML = () => `<ul class="kbd-l"><li><kbd>Ctrl</kbd>+<kbd>K</kbd> ou <kbd>/</kbd><span>Buscar</span></li><li><kbd>G</kbd> <kbd>P</kbd><span>Painel</span></li><li><kbd>G</kbd> <kbd>M</kbd><span>Meu trabalho</span></li><li><kbd>G</kbd> <kbd>O</kbd><span>OKRs</span></li><li><kbd>G</kbd> <kbd>Q</kbd><span>Projetos</span></li><li><kbd>Esc</kbd><span>Fechar janelas</span></li></ul>`;
const PRIVACY = () => `Esta plataforma reúne o planejamento estratégico do ${CFG.cliente.nome}: objetivos, resultados-chave, projetos, entregas, comentários e anexos.\n\nDados pessoais tratados: nome, e-mail, cargo e área das pessoas cadastradas, e o registro de quem criou ou alterou cada informação.\n\nFinalidade: organizar e acompanhar a execução do planejamento e enviar lembretes das entregas. Os dados não são usados para outros fins nem vendidos ou compartilhados com terceiros.\n\nArmazenamento: ${S.mode === "cloud" ? "Google Firebase (Cloud Firestore), com acesso restrito por perfil." : S.mode === "artifact" ? "banco de dados do Claude, acessível a quem recebeu o link." : "somente neste navegador."}\n\nDireitos do titular (LGPD): para consultar, corrigir ou excluir seus dados, fale com um administrador da plataforma.`;

/* =====================================================================
   ACESSO · entrada, convites, sessão e conexão com o banco
   ===================================================================== */
const Access = {
  async sync(p, pessoaId) {
    if (S.mode !== "cloud" || !p.email) return; const ref = S.fb.firestore().doc(`acessos/${normEmail(p.email)}`);
    if (p.papel === "sem_acesso") { await ref.delete().catch(() => { }); return; }
    await ref.set({ papel: p.papel, ativo: p.ativo !== false, nome: p.nome, pessoaId, atualizadoEm: new Date().toISOString(), por: myEmail() });
  },
  async revoke(email) { if (S.mode === "cloud") await S.fb.firestore().doc(`acessos/${normEmail(email)}`).delete().catch(() => { }); },
  async invite(email) {
    if (S.mode !== "cloud") throw new Error("Convites por e-mail funcionam com a nuvem (Firebase).");
    const sec = firebase.apps.find(a => a.name === "convites") || firebase.initializeApp(CFG.firebase, "convites");
    if (CFG.emulador && !sec.__emu) { sec.auth().useEmulator(CFG.emulador.auth || "http://127.0.0.1:9099"); sec.__emu = true; }
    const tmp = Array.from(crypto.getRandomValues(new Uint8Array(18)), b => b.toString(36)).join("") + "Aa1!";
    try { await sec.auth().createUserWithEmailAndPassword(email, tmp); } catch (e) { if (e.code !== "auth/email-already-in-use") throw authError(e); }
    finally { try { await sec.auth().signOut(); } catch (_) { } }
    await S.fb.auth().sendPasswordResetEmail(email, { url: CFG.urlPublica || location.origin + location.pathname }).catch(e => { throw authError(e); });
  },
};
const AUTH_MSG = {
  "auth/invalid-email": "E-mail inválido.", "auth/user-disabled": "Esta conta foi desativada.", "auth/too-many-requests": "Muitas tentativas seguidas. O Google bloqueou temporariamente: aguarde alguns minutos.",
  "auth/network-request-failed": "Sem conexão com a internet.", "auth/weak-password": "Senha fraca. Use pelo menos 8 caracteres, com letras e números.",
  "auth/requires-recent-login": "Por segurança, saia e entre de novo antes de trocar a senha.", "auth/unauthorized-continue-uri": "O endereço da plataforma não está autorizado no Firebase (Authentication › Domínios autorizados).",
};
const authError = e => new Error(AUTH_MSG[e?.code] || (/invalid-credential|wrong-password|user-not-found|invalid-login/.test(e?.code || "") ? "E-mail ou senha incorretos." : e?.message || "Não foi possível concluir."));

/* ---------- Tela de entrada: "Duc in altum" com mar em movimento ---------- */
function renderLogin(msg) {
  const L = $("#login"), cloud = S.mode === "cloud", t = CFG.abertura;
  L.innerHTML = `<canvas id="waves" aria-hidden="true"></canvas>
  <div class="lg-in">
    <div class="lg-quote">
      <div class="lg-brand">${LOGO("lg-logo")}</div>
      <h1 class="duc" aria-label="${esc(t.titulo)}">${(() => { let i = 0; return t.titulo.split(" ").map(w => `<span class="w" aria-hidden="true">${[...w].map(ch => `<span style="--i:${i++}">${esc(ch)}</span>`).join("")}</span>`).join(" "); })()}</h1>
      <p class="duc-t">${esc(t.traducao)}</p>${t.fonte ? `<p class="duc-f">${esc(t.fonte)}</p>` : ""}${(v => v ? `<figure class="vers"><figcaption>Versículo do dia</figcaption><blockquote>${esc(v.t)}</blockquote><cite>${esc(v.r)}</cite></figure>` : "")(versiculoDoDia())}
    </div>
    <form class="lg-card" id="lg-form" novalidate>
      <h2>Planejamento Estratégico</h2><p class="lg-sub">${cloud ? "Entre com seu e-mail e senha." : S.mode === "artifact" ? "Digite a senha da equipe." : "Modo demonstração · digite a senha da equipe."}</p>
      ${cloud ? `<label for="lg-email">E-mail</label><input class="inp" id="lg-email" type="email" autocomplete="username" placeholder="nome@colegio.com.br" value="${esc(lsGet(KEY + "-last", ""))}" required>` : ""}
      <label for="lg-pass">Senha</label><div class="pw"><input class="inp" id="lg-pass" type="password" autocomplete="current-password" placeholder="Digite a senha" required><button type="button" class="pw-eye" data-act="peek" aria-label="Mostrar senha" aria-pressed="false">${ICON.eye}</button></div>
      <div class="lg-msg" id="lg-msg" role="alert" aria-live="assertive">${msg ? esc(msg) : ""}</div>
      <button class="btn lg-btn" type="submit" id="lg-btn">Entrar</button>
      ${cloud ? `<button type="button" class="linkbtn" data-act="forgot">Esqueci minha senha</button>` : ""}
      <div class="lg-foot">${ICON.lock}<span>Acesso protegido</span></div>
      <div class="lg-gm">${esc(CFG.desenvolvidoPor)}</div>
    </form>
  </div>`;
  L.hidden = false; $("#app").hidden = true; document.title = `${CFG.cliente.curto} · Planejamento Estratégico`;
  startSea();
  $("#lg-form").onsubmit = onLogin;
  setTimeout(() => { const e = $("#lg-email"), p = $("#lg-pass"); (cloud && e && !e.value ? e : p)?.focus(); }, 400);
  if (cloud) $("#lg-email").addEventListener("change", () => lockUI());
  lockUI();
}
function startSea() {
  const cv = $("#waves"); if (!cv) return;
  let ok = false; try { ok = Mar.start(cv); } catch (e) { console.warn("mar", e); }
  if (!ok) { const c2 = cv.cloneNode(); cv.replaceWith(c2); Waves.start(c2); }
}
let lockTimer;
async function lockUI() {
  clearInterval(lockTimer); const email = S.mode === "cloud" ? normEmail($("#lg-email")?.value) : null; if (S.mode === "cloud" && !emailOk(email)) return;
  const t = await Lockout.read(email), st = Lockout.status(t), btn = $("#lg-btn"), msg = $("#lg-msg"); if (!btn) return;
  if (st.blocked) { btn.disabled = true; msg.textContent = "Acesso bloqueado após 9 tentativas erradas. Peça a um administrador para liberar."; return; }
  if (st.left > 0) {
    btn.disabled = true; let left = st.left;
    const tick = () => { msg.textContent = `Muitas tentativas erradas. Aguarde ${Math.floor(left / 60)}:${pad(left % 60)} para tentar de novo.`; if (--left < 0) { clearInterval(lockTimer); btn.disabled = false; msg.textContent = ""; } };
    tick(); lockTimer = setInterval(tick, 1000); return;
  }
  btn.disabled = false;
}
async function onLogin(e) {
  e.preventDefault(); const btn = $("#lg-btn"), msg = $("#lg-msg"), card = $("#lg-form"); if (btn.disabled) return;
  const pass = $("#lg-pass").value, email = S.mode === "cloud" ? normEmail($("#lg-email").value) : null;
  const fail = m => { msg.textContent = m; card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake"); btn.disabled = false; btn.textContent = "Entrar"; };
  if (S.mode === "cloud" && !emailOk(email)) return fail("Digite um e-mail válido.");
  if (!pass) return fail("Digite a senha.");
  btn.disabled = true; btn.textContent = "Entrando…";
  const t = await Lockout.read(email), st = Lockout.status(t);
  if (st.blocked) return lockUI(); if (st.left > 0) return lockUI();
  let ok = false, errMsg = "";
  if (S.mode === "cloud") {
    lsSet(KEY + "-last", email);
    try { S.loginPending = { email, t }; await S.fb.auth().signInWithEmailAndPassword(email, pass); ok = true; }
    catch (er) { S.loginPending = null; if (/too-many-requests|network|user-disabled|invalid-email/.test(er.code || "")) return fail(authError(er).message); errMsg = "E-mail ou senha incorretos."; }
  } else {
    try { ok = (await sha256(pass.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]/g, "").toUpperCase())) === CFG.senhaEquipeSha256; } catch (er) { return fail(er.message); }
    errMsg = "Senha incorreta.";
  }
  if (!ok) {
    const nt = await Lockout.fail(email, t), ns = Lockout.status(nt);
    $("#lg-pass").value = "";
    if (ns.blocked) { fail("Acesso bloqueado após 9 tentativas erradas. Peça a um administrador para liberar."); return lockUI(); }
    if (ns.left > 0) { fail(""); return lockUI(); }
    return fail(`${errMsg} ${ns.restantes === 1 ? "Mais 1 erro e o acesso será pausado." : `Restam ${ns.restantes} tentativas antes da pausa.`}`);
  }
  if (S.mode !== "cloud") { await Lockout.reset(null, t); ssSet(KEY + "-ok", Date.now()); startApp(); }
  // no modo nuvem, onAuthStateChanged continua o fluxo
}
async function forgot() {
  const email = normEmail($("#lg-email")?.value), msg = $("#lg-msg");
  if (!emailOk(email)) { msg.textContent = "Digite seu e-mail acima e toque de novo em Esqueci minha senha."; $("#lg-email").focus(); return; }
  try { await S.fb.auth().sendPasswordResetEmail(email, { url: CFG.urlPublica || location.origin + location.pathname }); msg.textContent = `Se ${email} tiver acesso, você vai receber um e-mail com o link para criar uma nova senha.`; }
  catch (e) { msg.textContent = e.code === "auth/user-not-found" ? `Se ${email} tiver acesso, você vai receber um e-mail com o link para criar uma nova senha.` : authError(e).message; }
}
const Waves = {
  raf: 0,
  start(cv) {
    this.stop(); if (!cv) return; const g = cv.getContext("2d"); let w, h, dpr;
    const size = () => { dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); this.onr = size; addEventListener("resize", size);
    const bub = Array.from({ length: 34 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 2.2 + .6, v: Math.random() * .25 + .08 }));
    const layers = [{ a: .10, amp: 18, len: .0042, sp: .00022, y: .58 }, { a: .14, amp: 24, len: .0031, sp: -.00016, y: .66 }, { a: .2, amp: 16, len: .0055, sp: .0003, y: .75 }, { a: .32, amp: 12, len: .0047, sp: -.00026, y: .84 }];
    const draw = t => {
      g.clearRect(0, 0, w, h);
      const lg = g.createRadialGradient(w * .5, -h * .1, 10, w * .5, -h * .1, h * 1.1); lg.addColorStop(0, "rgba(120,200,240,.20)"); lg.addColorStop(1, "rgba(120,200,240,0)"); g.fillStyle = lg; g.fillRect(0, 0, w, h);
      layers.forEach((L, i) => { g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w + 10; x += 10) { const y = h * L.y + Math.sin(x * L.len + t * L.sp * 6) * L.amp + Math.sin(x * L.len * 2.3 + t * L.sp * 3.1 + i) * L.amp * .35; g.lineTo(x, y); } g.lineTo(w, h); g.closePath(); g.fillStyle = `rgba(3,180,214,${L.a})`; g.fill(); });
      g.fillStyle = "rgba(255,255,255,.35)"; bub.forEach(b => { b.y -= b.v / h * 2; if (b.y < .45) { b.y = 1.02; b.x = Math.random(); } g.beginPath(); g.arc(b.x * w + Math.sin(t / 900 + b.x * 9) * 6, b.y * h, b.r, 0, 7); g.fill(); });
    };
    if (reduceMotion()) { draw(0); return; }
    const loop = t => { if (!cv.isConnected) return this.stop(); if (!document.hidden) draw(t); this.raf = requestAnimationFrame(loop); }; this.raf = requestAnimationFrame(loop);
  },
  stop() { cancelAnimationFrame(this.raf); if (this.onr) removeEventListener("resize", this.onr); this.onr = null; },
};

/* ---------- Sessão ---------- */
async function afterCloudLogin(u) {
  const email = normEmail(u.email), boot = CFG.adminsIniciais.includes(email), db = S.fb.firestore();
  const t = S.loginPending?.email === email ? S.loginPending.t : await Lockout.read(email); S.loginPending = null;
  const st = Lockout.status(t);
  if (st.blocked) { await S.fb.auth().signOut(); return renderLogin("Acesso bloqueado após 9 tentativas erradas. Peça a um administrador para liberar."); }
  let acc = null; try { const d = await db.doc(`acessos/${email}`).get(); acc = d.exists ? d.data() : null; } catch (e) { console.warn("acesso", e.code); }
  if (!boot && (!acc || acc.ativo === false)) { await S.fb.auth().signOut(); return renderLogin(acc ? "Seu acesso está desativado. Fale com um administrador." : "Este e-mail ainda não tem acesso à plataforma. Peça um convite a um administrador."); }
  if (t.n > 0) await Lockout.reset(email, t);
  S.me = { email, nome: acc?.nome || u.displayName || email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()), papel: acc?.papel && ROLES[acc.papel] ? acc.papel : (boot ? "admin" : "leitor") };
  if (boot && acc?.papel !== "admin") S.me.papel = "admin";
  db.doc(`acessos/${email}`).set({ ultimoAcesso: new Date().toISOString() }, { merge: true }).catch(() => { });
  S.store = new FsStore(db, "cloud");
  if (S.me.papel === "admin") await seedIfEmpty(email).catch(e => console.warn("seed", e));
  startApp();
}
async function seedIfEmpty(email) {
  if (!(await S.store.isEmpty("colunas"))) return;
  const db = S.fb.firestore(); let b = db.batch(), n = 0;
  const put = async (c, id, d) => { b.set(db.doc(`${c}/${id}`), d); if (++n % 400 === 0) { await b.commit(); b = db.batch(); } };
  for (const [c, rows] of Object.entries(SEED)) for (const r of rows) { const { id, ...d } = r; await put(c, id, d); }
  if (!SEED.pessoas?.some(p => normEmail(p.email) === email)) {
    const pid = "adm-" + email.replace(/[^a-z0-9]/g, "").slice(0, 20);
    await put("pessoas", pid, { nome: S.me.nome, email, cargo: "Administrador da plataforma", area: "", papel: "admin", ativo: true, convidadoEm: "", criadoEm: new Date().toISOString() });
    await put("acessos", email, { papel: "admin", ativo: true, nome: S.me.nome, pessoaId: pid, atualizadoEm: new Date().toISOString() });
  }
  await b.commit(); toast("Planejamento inicial carregado");
}
function startApp() {
  $("#login").hidden = true; Waves.stop(); Mar.stop(); $("#login").innerHTML = ""; $("#app").hidden = false;
  document.body.classList.toggle("ro", S.readOnly || S.me.papel === "leitor");
  renderFrame(); connect(S.store); Idle.start(); S.started = true;
  const h = location.hash.slice(1).split("?")[0], [v, sub] = h.split("-");
  go(VIEWS[v] ? v : S.view, sub);
  const card = new URLSearchParams(location.hash.split("?")[1] || location.search).get("card"); if (card) S.pendingCard = card;
}
function connect(store) {
  S.unsub.forEach(f => { try { f(); } catch (_) { } }); S.unsub = []; S.loaded.clear(); clearTimeout(S.connTimer);
  S.connTimer = setTimeout(() => { if (!ready()) setSync(false, "O banco não respondeu. Verifique a internet e recarregue."); }, 12000);
  for (const c of COLS) S.unsub.push(store.subscribe(c, rows => {
    S.data[c] = rows; const was = ready(); S.loaded.add(c);
    if (ready()) { clearTimeout(S.connTimer); setSync(true, store.kind === "local" ? "Salvo neste navegador" : "Sincronizado em tempo real"); if (!was && S.pendingCard) { const id = S.pendingCard; S.pendingCard = null; defer(openModal, id); } }
    render();
  }, err => {
    console.error(c, err); const perm = /permission/i.test(err?.code || err?.message || "");
    if (c === "config" && perm) { S.loaded.add(c); render(); return; }
    setSync(false, perm ? "Acesso negado pelo servidor" : "Sem conexão com o banco");
    if (perm && S.mode === "cloud") logout("Seu acesso foi alterado ou bloqueado. Entre de novo ou fale com um administrador.");
  }));
}
async function logout(msg) {
  Idle.stop(); closeModal(); closeDrawer(); closePalette(); closeMenus(); destroyCharts();
  S.unsub.forEach(f => { try { f(); } catch (_) { } }); S.unsub = []; S.loaded.clear(); S.historico = null; S.started = false;
  ssDel(KEY + "-ok"); Object.keys(S.data).forEach(k => S.data[k] = []);
  if (S.mode === "cloud") { try { await S.fb.auth().signOut(); } catch (_) { } }
  $("#app").innerHTML = ""; renderLogin(msg || "");
}
function applyBrand() {
  const r = document.documentElement.style, c = CFG.cores;
  if (c.primaria) r.setProperty("--navy", c.primaria); if (c.secundaria) r.setProperty("--cyan", c.secundaria); if (c.destaque) r.setProperty("--lime", c.destaque);
  document.documentElement.lang = "pt-BR";
}
async function loadFirebase() {
  try { for (const m of ["app", "auth", "firestore"]) await loadScript(`https://cdn.jsdelivr.net/npm/firebase@10.12.2/firebase-${m}-compat.js`); return !!window.firebase; }
  catch (e) { console.error(e); return false; }
}
async function boot() {
  applyBrand();
  const u = ssGet(KEY + "-ui"); if (u) { Object.assign(S.f, u.f || {}); Object.assign(S.board, u.board || {}); Object.assign(S.sub, u.sub || {}); Object.assign(S.meu, u.meu || {}); if (VIEWS[u.view]) S.view = u.view; }
  bindGlobal(); bindBoardDnD();
  addEventListener("online", () => { S.offline = false; renderBanner(); }); addEventListener("offline", () => { S.offline = true; renderBanner(); });
  const db = window.claude?.use ? await window.claude.use("db").catch(() => null) : null;
  if (db) {
    S.mode = "artifact"; S.store = new FsStore(db, "artifact"); S.auditLocal = true;
    try { const usr = await window.claude.use("user"); if (usr) { const ed = await usr.canEdit?.(), w = await usr.can?.("data.write"); S.me = { email: "", nome: lsGet(KEY + "-nome", "") || "", papel: ed ? "admin" : w === false ? "leitor" : "gestor" }; S.readOnly = w === false; } else S.me = { email: "", nome: lsGet(KEY + "-nome", ""), papel: "gestor" }; } catch (_) { S.me = { email: "", nome: lsGet(KEY + "-nome", ""), papel: "gestor" }; }
    if (ssGet(KEY + "-ok")) startApp(); else renderLogin();
  } else if (CFG.firebase && (window.firebase || await loadFirebase())) {
    S.mode = "cloud"; S.fb = firebase.initializeApp(CFG.firebase); S.fb.auth().languageCode = "pt";
    if (CFG.emulador) { S.fb.auth().useEmulator(CFG.emulador.auth || "http://127.0.0.1:9099"); const [h, p] = (CFG.emulador.firestore || "127.0.0.1:8080").split(":"); S.fb.firestore().useEmulator(h, Number(p)); }
    renderLogin();
    S.fb.auth().onAuthStateChanged(async usr => { if (usr && !S.started) { try { await afterCloudLogin(usr); } catch (e) { console.error(e); renderLogin("Não foi possível entrar: " + (e.message || e.code)); } } else if (!usr && S.started) logout(); });
  } else {
    if (CFG.firebase && !window.firebase) console.error("Firebase configurado, mas as bibliotecas não carregaram.");
    S.mode = "local"; S.store = new LocalStore(KEY + "-dados-v3", SEED); S.me = { email: "", nome: lsGet(KEY + "-nome", "") || "", papel: "admin" };
    if (ssGet(KEY + "-ok")) startApp(); else renderLogin(CFG.firebase ? "As bibliotecas da nuvem não carregaram. Verifique a internet e recarregue a página." : "");
  }
}

/* =====================================================================
   MAR NOTURNO · céu estrelado, lua, Via Láctea, estrelas cadentes e
   oceano em WebGL (renderizado na placa de vídeo, em tempo real).
   Se o aparelho não tiver WebGL, cai para as ondas simples (Waves).
   ===================================================================== */
const MAR_FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec3 uMoon; uniform float uPitch; uniform float uDetail;
#define PI 3.14159265
float h11(float p){ p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
float h21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec3 h33(vec3 p){ p = fract(p * vec3(.1031, .1030, .0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }
float vnoise(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  float n = mix(mix(mix(h21(i.xy+i.z*17.), h21(i.xy+vec2(1,0)+i.z*17.), f.x), mix(h21(i.xy+vec2(0,1)+i.z*17.), h21(i.xy+vec2(1,1)+i.z*17.), f.x), f.y),
                mix(mix(h21(i.xy+(i.z+1.)*17.), h21(i.xy+vec2(1,0)+(i.z+1.)*17.), f.x), mix(h21(i.xy+vec2(0,1)+(i.z+1.)*17.), h21(i.xy+vec2(1,1)+(i.z+1.)*17.), f.x), f.y), f.z);
  return n; }
float fbm(vec3 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++){ s += a * vnoise(p); p = p * 2.03 + 1.7; a *= .5; } return s; }

/* ---------- céu ---------- */
vec3 starLayer(vec3 d, float scale, float density, float size){
  vec3 p = d * scale, c = floor(p), col = vec3(0.);
  vec3 r = h33(c); if (r.x > density) return col;
  vec3 sp = c + .2 + .6 * h33(c + 7.1); float dist = length(p - sp);
  float b = pow(h11(r.y * 91.7), 3.) * 1.6 + .15;
  float tw = .62 + .38 * sin(uTime * (1.2 + 3.5 * r.z) + r.y * 40.);
  vec3 tint = mix(vec3(.75, .85, 1.), vec3(1., .9, .75), r.z);
  col += tint * b * tw * (smoothstep(size, 0., dist) + .25 * smoothstep(size * 4., 0., dist));
  return col;
}
vec3 rotY(vec3 v, float a){ float c = cos(a), s = sin(a); return vec3(c*v.x + s*v.z, v.y, -s*v.x + c*v.z); }
vec3 sky(vec3 d, float starAmt){
  float y = max(d.y, 0.);
  vec3 zen = vec3(.006, .018, .052), mid = vec3(.018, .07, .17), hor = vec3(.06, .19, .33);
  vec3 c = mix(hor, mid, smoothstep(0., .18, y)); c = mix(c, zen, smoothstep(.12, .75, y));
  c += vec3(.02, .17, .24) * exp(-y * 22.) * .55;                 /* brilho do horizonte */
  float md = max(dot(d, uMoon), 0.);
  c += vec3(.55, .65, .8) * (pow(md, 30.) * .07 + pow(md, 350.) * .16 + pow(md, 3000.) * .55); /* halo da lua */
  if (starAmt > 0.) {
    vec3 sd = rotY(d, uTime * .0035);                               /* céu girando devagar */
    vec3 s = starLayer(sd, 150., .12, .085) + starLayer(sd, 300., .09, .09) + starLayer(sd, 520., .07, .1) * .7;
    vec3 band = normalize(vec3(.35, .55, -.75));
    float mw = exp(-pow(dot(sd, band) * 3.2, 2.)) * (fbm(sd * 5.) * .9 + fbm(sd * 13.) * .35);
    vec3 milky = vec3(.30, .38, .55) * mw * .16 + vec3(.9, .95, 1.) * starLayer(sd, 900., .25 * mw, .12) * mw;
    float ext = smoothstep(0., .12, d.y) * (1. - smoothstep(.9993, .9998, md));
    c += (s + milky) * ext * starAmt;
  }
  /* lua: disco com manchas e borda suave */
  float disk = smoothstep(.99983, .99987, md);
  if (disk > 0.) { vec3 t = normalize(cross(uMoon, vec3(0., 1., 0.))), b2 = cross(t, uMoon); vec2 mp = vec2(dot(d - uMoon, t), dot(d - uMoon, b2)) * 120.;
    float mar = fbm(vec3(mp * 1.6, 3.)); float limb = sqrt(max(0., 1. - dot(mp, mp) * .2)); c = mix(c, vec3(1.4, 1.36, 1.26) * (.78 + .34 * mar) * (.75 + .25 * limb) - vec3(.12, .12, .08) * smoothstep(.5, .66, mar), disk); }
  return c;
}
float meteor(vec2 uv, float t){
  float P = 7.3, id = floor(t / P), lt = t - id * P; float r1 = h11(id * 1.37 + 3.1), r2 = h11(id * 7.91 + .3), r3 = h11(id * 3.17 + 9.);
  if (r3 < .28) return 0.;
  float dur = .75 + r1 * .55; if (lt > dur) return 0.;
  float k = lt / dur;
  vec2 dir = normalize(vec2(mix(-1., 1., step(.5, r2)) * (.8 + r1 * .5), -.35 - r2 * .35));
  vec2 st = vec2(mix(-.6, .6, r1), .28 + .2 * r2);
  vec2 head = st + dir * k * .55; float len = .22 + .12 * r1;
  vec2 pa = uv - head; float along = dot(pa, -dir); float across = length(pa + dir * along);
  if (along < 0. || along > len) return 0.;
  float tail = pow(1. - along / len, 1.8), w = .0018 + .0032 * (1. - along / len);
  float fade = smoothstep(0., .12, k) * (1. - smoothstep(.7, 1., k));
  return tail * (smoothstep(w, 0., across) * 3. + smoothstep(w * 5., 0., across) * .35) * fade + smoothstep(.008, 0., length(pa)) * fade * 2.;
}

/* ---------- oceano: soma de ondas de seno exponencial com arrasto ---------- */
float waves(vec2 p, int it){
  float a = 0., w = 1., s = 0., f = 1., spd = 2.;
  float res = 0.;
  for (int i = 0; i < 40; i++){ if (i >= it) break;
    vec2 d = vec2(sin(a), cos(a)); float x = dot(d, p) * f + uTime * spd;
    float wave = exp(sin(x) - 1.), dx = wave * cos(x);
    res += wave * w; s += w; p -= d * dx * w * .28;
    a += 12.2; w = mix(w, 0., .2); f *= 1.18; spd *= 1.07; }
  return res / s;
}
const float DEPTH = 1.1;
float hgt(vec2 p, int it){ return (waves(p * .1, it) - 1.) * DEPTH; }
vec3 nrm(vec2 p, float e, float dist){
  int it = int(uDetail);
  float H = hgt(p, it);
  vec3 a = vec3(p.x, H, p.y), b = vec3(p.x - e, hgt(p - vec2(e, 0.), it), p.y), c = vec3(p.x, hgt(p + vec2(0., e), it), p.y + e);
  vec3 n = normalize(cross(a - b, a - c));
  return normalize(mix(n, vec3(0., 1., 0.), .7 * min(1., sqrt(dist * .01) * 1.1)));
}
float march(vec3 ro, vec3 rd, out vec3 hit){
  float t0 = -ro.y / rd.y, t1 = (-DEPTH - ro.y) / rd.y; float t = t0; vec3 p;
  for (int i = 0; i < 64; i++){ p = ro + rd * t; float h = hgt(p.xz, 12); if (h + .01 > p.y) break; t += (p.y - h) * .9 + .001; if (t > t1) break; }
  hit = ro + rd * t; return t;
}
void main(){
  vec2 uv = (gl_FragCoord.xy - .5 * uRes) / uRes.y;
  vec3 rd = normalize(vec3(uv.x, uv.y + uPitch, 1.55));
  vec3 col;
  if (rd.y > 0.) {
    col = sky(rd, 1.);
    col += vec3(.9, .95, 1.) * meteor(vec2(uv.x, uv.y + uPitch), uTime);
  } else {
    vec3 ro = vec3(uTime * .25, 2.2, uTime * .9), hit;
    float t = march(ro, rd, hit), dist = length(hit - ro);
    vec3 n = nrm(hit.xz, .012, dist);
    vec3 r = reflect(rd, n); r.y = abs(r.y);
    float fres = .04 + .96 * pow(1. - max(0., dot(-rd, n)), 5.);
    vec3 refl = sky(r, .35);
    float rm = max(dot(r, uMoon), 0.); float glint = pow(rm, 1400.) * 7. + pow(rm, 160.) * .35 + pow(rm, 22.) * .035;
    float crest = clamp((hit.y + DEPTH) / DEPTH, 0., 1.);
    vec3 deep = vec3(.004, .025, .06) + vec3(.01, .07, .1) * pow(crest, 3.) * .6;
    col = fres * refl + (1. - fres) * deep + vec3(.85, .9, 1.) * glint * fres * 3.;
    col = mix(col, sky(vec3(rd.x, .001, rd.z), 0.), 1. - exp(-dist * .0035));
  }
  /* exposição, contraste e vinheta */
  col = 1. - exp(-col * 1.35); col = pow(col, vec3(.95));
  vec2 q = gl_FragCoord.xy / uRes; col *= .8 + .2 * pow(16. * q.x * q.y * (1. - q.x) * (1. - q.y), .18);
  col += (h21(gl_FragCoord.xy + fract(uTime)) - .5) / 255.;   /* evita faixas no degradê */
  gl_FragColor = vec4(col, 1.);
}`;
const Mar = {
  raf: 0, gl: null,
  start(cv) {
    this.stop(); if (!cv) return false;
    let gl = null; try { gl = cv.getContext("webgl", { antialias: false, alpha: false, depth: false, powerPreference: "high-performance", preserveDrawingBuffer: false }); } catch (_) { }
    if (!gl) return false;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
    const vs = sh(gl.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"), fs = sh(gl.FRAGMENT_SHADER, MAR_FRAG);
    if (!vs || !fs) return false;
    const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(pr)); return false; }
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(pr, n), uRes = U("uRes"), uTime = U("uTime"), uMoon = U("uMoon"), uPitch = U("uPitch"), uDetail = U("uDetail");
    const mobile = matchMedia("(max-width: 719px)").matches || /Mobi|Android/i.test(navigator.userAgent);
    let scale = mobile ? .55 : .8, detail = mobile ? 22 : 34, w = 0, h = 0;
    const size = () => {
      const dpr = Math.min(2, devicePixelRatio || 1), cw = cv.clientWidth, ch = cv.clientHeight, budget = mobile ? 4.5e5 : 1.1e6;
      const s = Math.min(scale * dpr, Math.sqrt(budget / Math.max(1, cw * ch)));
      w = Math.max(2, Math.round(cw * s)); h = Math.max(2, Math.round(ch * s)); cv.width = w; cv.height = h; gl.viewport(0, 0, w, h);
      /* horizonte a ~38% da altura; lua acima do cartão de login (canto superior direito) */
      const aspect = cw / ch, pitch = .12, fx = aspect > 1 ? .8 : .78, fy = aspect > 1 ? .16 : .2, fx2 = aspect > 1 ? fx : .84;
      const ux = (fx2 - .5) * aspect, uy = .5 - fy, m = [ux, uy + pitch, 1.55], l = Math.hypot(...m);
      gl.uniform3f(uMoon, m[0] / l, m[1] / l, m[2] / l); gl.uniform1f(uPitch, pitch); gl.uniform2f(uRes, w, h);
    };
    size(); this.onr = () => size(); addEventListener("resize", this.onr);
    const t0 = performance.now() - 40000 * Math.random(); let frames = 0, acc = 0, last = performance.now();
    const draw = now => { gl.uniform1f(uTime, (now - t0) / 1000); gl.uniform1f(uDetail, detail); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    this.drawAt = sec => draw(t0 + sec * 1000);
    if (reduceMotion()) { draw(performance.now()); return true; }
    const loop = now => {
      if (!cv.isConnected) return this.stop();
      if (!document.hidden) {
        draw(now); const dt = now - last; last = now;
        if (frames < 90) { acc += dt; frames++; if (frames === 90 && acc / 90 > 26 && scale > .35) { scale *= .72; detail = Math.max(14, detail - 8); size(); frames = 0; acc = 0; } }  /* ajusta a qualidade ao aparelho */
      } else last = now;
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop); this.gl = gl;
    cv.addEventListener("webglcontextlost", e => { e.preventDefault(); this.stop(); const c2 = cv.cloneNode(); cv.replaceWith(c2); Waves.start(c2); }, { once: true });
    return true;
  },
  stop() { cancelAnimationFrame(this.raf); this.raf = 0; if (this.onr) removeEventListener("resize", this.onr); this.onr = null; },
};

/* =====================================================================
   AÇÕES · delegação de eventos (cliques, mudanças, envios, teclado)
   ===================================================================== */
const Mail = {
  async enqueue(list) {
    if (S.mode !== "cloud") { toast("E-mails funcionam com a nuvem (Firebase) e o robô de e-mails.", null, "erro"); return 0; }
    const col = S.fb.firestore().collection("fila_emails"); let n = 0;
    for (const m of list) { if (!m.para?.length) continue; await col.add({ para: m.para.slice(0, 20), assunto: str(m.assunto, 200), texto: strML(m.texto, 20000), tipo: m.tipo || "manual", status: "pendente", criadoEm: new Date().toISOString(), por: myEmail(), porNome: S.me.nome || "" }); n++; }
    return n;
  },
  link: id => (CFG.urlPublica || location.origin + location.pathname) + (id ? `#projetos?card=${id}` : ""),
  emailsDe(nomes) { const out = [], sem = []; [...new Set(nomes)].forEach(n => { const p = pessoaPorNome(n); if (p?.email && p.ativo !== false) out.push(p.email); else sem.push(n); }); return { out: [...new Set(out)], sem }; },
};
async function notificarProjeto() {
  const p = curP(); if (!p) return; const abertas = (p.entregas || []).filter(e => !e.feito), nomes = [...(p.responsaveis || []), ...abertas.map(e => e.resp)].filter(Boolean);
  const { out, sem } = Mail.emailsDe(nomes);
  if (!out.length) { toast(sem.length ? `Cadastre o e-mail de ${sem.join(", ")} em Configurações › Pessoas.` : "Este projeto não tem responsáveis.", null, "erro"); return; }
  if (!(await confirmDlg({ titulo: "Avisar responsáveis por e-mail?", texto: `Será enviado um resumo das ${abertas.length} entrega(s) abertas para: ${out.join(", ")}.${sem.length ? ` Sem e-mail cadastrado: ${sem.join(", ")}.` : ""}`, ok: "Enviar" }))) return;
  const texto = `Olá!\n\n${S.me.nome || "A coordenação"} pediu atenção às entregas abertas do projeto "${p.titulo}":\n\n${abertas.map(e => `• ${e.texto}${e.prazo ? ` — prazo ${fmtD(e.prazo)}${e.prazo < Plan.hoje ? ` (${daysBetween(e.prazo, Plan.hoje)} dias de atraso)` : ""}` : ""}${e.resp ? ` — ${e.resp}` : ""}`).join("\n")}\n\nAbrir o projeto: ${Mail.link(p.id)}\n\n${CFG.cliente.nome} · Planejamento Estratégico`;
  await save(() => Mail.enqueue([{ para: out, assunto: `[Planejamento] ${p.titulo}`, texto, tipo: "projeto" }]), "E-mail colocado na fila de envio");
}
async function lembrarAtrasados() {
  const rows = filtered(Plan.rows()).filter(r => r.sit === "atrasada"), by = {};
  rows.forEach(r => (by[r.resp] ??= []).push(r));
  const envios = [], sem = [];
  for (const [nome, list] of Object.entries(by)) { const p = pessoaPorNome(nome); if (!p?.email) { sem.push(nome); continue; }
    envios.push({ para: [p.email], tipo: "atrasadas", assunto: `[Planejamento] Você tem ${list.length} entrega(s) atrasada(s)`, texto: `Olá, ${nome.split(" ")[0]}!\n\nEstas entregas do planejamento estratégico estão com o prazo vencido:\n\n${list.sort((a, b) => byText(a.e.prazo, b.e.prazo)).map(r => `• ${r.e.texto} — ${r.p.titulo} — prazo ${fmtD(r.e.prazo)} (${daysBetween(r.e.prazo, Plan.hoje)} dias)`).join("\n")}\n\nAtualize na plataforma assim que concluir: ${Mail.link()}\n\n${CFG.cliente.nome} · Planejamento Estratégico` }); }
  if (!envios.length) { toast(sem.length ? `Ninguém com e-mail cadastrado. Cadastre: ${sem.slice(0, 4).join(", ")}${sem.length > 4 ? "…" : ""}` : "Nenhuma entrega atrasada neste recorte.", null, "erro"); return; }
  if (!(await confirmDlg({ titulo: `Enviar ${envios.length} lembrete(s)?`, texto: `Cada pessoa recebe a lista das próprias entregas atrasadas (recorte atual do painel).${sem.length ? ` Sem e-mail cadastrado: ${sem.join(", ")}.` : ""}`, ok: "Enviar lembretes" }))) return;
  await save(() => Mail.enqueue(envios), `${envios.length} lembrete(s) na fila de envio`);
}
async function restoreBackup(file) {
  let data; try { data = JSON.parse(await file.text()); } catch (_) { toast("Arquivo inválido. Use um backup exportado pela plataforma.", null, "erro"); return; }
  const cols = ["colunas", "objetivos", "krs", "projetos", "pessoas"].filter(c => Array.isArray(data[c]));
  if (!cols.length) { toast("Este arquivo não tem dados da plataforma.", null, "erro"); return; }
  const total = cols.reduce((s, c) => s + data[c].length, 0);
  if (!(await confirmDlg({ titulo: "Restaurar backup?", texto: `${total} registro(s) serão gravados (${cols.join(", ")}). Itens com o mesmo código serão substituídos.`, ok: "Restaurar", perigo: true }))) return;
  let ok = 0, bad = 0; const now = new Date().toISOString();
  for (const c of cols) for (const r of data[c]) { if (!r.id) { bad++; continue; } const [o, e] = SCHEMAS[c](r); if (Object.keys(e).length) { bad++; continue; } try { await S.store.set(c, String(r.id), { ...o, criadoEm: r.criadoEm || now, atualizadoEm: now }); ok++; } catch (_) { bad++; } }
  Audit.log("alterou", "config", "backup", "restauração de backup", `${ok} registros`); toast(`${ok} registro(s) restaurados${bad ? `, ${bad} ignorados` : ""}`);
}
function backup() {
  const out = { plataforma: "planejamento-estrategico", cliente: CFG.cliente.nome, versao: APP_VERSION, exportadoEm: new Date().toISOString() };
  ["colunas", "objetivos", "krs", "projetos", "pessoas", "config"].forEach(c => out[c] = S.data[c]);
  saveFile(`backup-${KEY.slice(3)}-${Plan.hoje}.json`, JSON.stringify(out, null, 1), "application/json").then(ok => ok && toast("Backup baixado"));
}

const ACT = {
  /* moldura */
  palette: () => openPalette(), activity: b => openActivity(b), profile: b => profileMenu(b), shortcuts: () => { closeMenus(); confirmDlg({ titulo: "Atalhos de teclado", texto: "Ctrl+K ou / para buscar · G e depois P, M, O ou Q para ir ao Painel, Meu trabalho, OKRs ou Projetos · Esc fecha janelas.", ok: "Entendi" }); },
  go: b => { closePalette(); closeDrawer(); closeModal(); go(b.dataset.to); }, logout: () => logout(), undo: () => { const u = S.undo; S.undo = null; $("#toast").hidden = true; u?.(); },
  privacy: () => confirmDlg({ titulo: "Aviso de privacidade", texto: PRIVACY(), ok: "Fechar" }), closeDrawer: () => closeDrawer(), closeModal: () => closeModal(),
  peek: b => { const i = $("#lg-pass"); const on = i.type === "password"; i.type = on ? "text" : "password"; b.setAttribute("aria-pressed", on); b.setAttribute("aria-label", on ? "Ocultar senha" : "Mostrar senha"); },
  forgot: () => forgot(),
  /* painel */
  unf: b => { if (b.dataset.k === "*") Object.keys(S.f).forEach(k => k !== "ciclo" && (S.f[k] = "")); else S.f[b.dataset.k] = ""; S.anim.painel = false; persistUI(); renderPainel(); },
  tile: b => setF("sit", b.dataset.s), sitf: b => setF("sit", b.dataset.s), projf: b => setF("proj", b.dataset.id),
  openCard: b => { closePalette(); closeMenus(); closeDrawer(); openModal(b.dataset.id); }, lateAll: () => { S.lateAll = true; S.anim.painel = false; renderPainel(); }, exportCSV: () => exportCSV(), lembrarAtrasados: () => lembrarAtrasados(),
  /* meu trabalho */
  meuVer: b => { S.meu.ver = b.dataset.v; persistUI(); renderMeu(); }, meuDe: b => { closePalette(); S.meu.pessoa = b.dataset.nome; go("meu"); },
  /* OKRs */
  newObj: () => objForm(), editObj: b => objForm(b.dataset.id), newKR: b => krForm(null, { objetivoId: b.dataset.obj || Plan.objs()[0]?.id }), editKR: b => { closePalette(); krForm(b.dataset.id); }, openKR: b => openKR(b.dataset.id),
  delMed: async b => { const k = S.data.krs.find(x => x.id === b.dataset.k); if (!k) return; if (!(await confirmDlg({ titulo: "Excluir medição?", texto: "A medição sai do histórico. O valor atual passa a ser o da medição mais recente que restar.", ok: "Excluir", perigo: true }))) return;
    const meds = (k.medicoes || []).filter(m => m.id !== b.dataset.m), latest = meds.slice().sort((a, c) => byText(c.data, a.data))[0];
    const ok = await save(() => Repo.patch("krs", k.id, { medicoes: meds, ...(latest ? { atual: latest.valor } : {}) }), "Medição excluída").then(() => true).catch(() => false); if (ok) { Object.assign(k, { medicoes: meds, ...(latest ? { atual: latest.valor } : {}) }); openKR(k.id); } },
  /* projetos */
  sub: b => { S.sub.projetos = b.dataset.v; persistUI(); go("projetos", b.dataset.v); }, bciclo: b => { S.board.ciclo = b.dataset.v; persistUI(); renderProjetos(); },
  toggleArq: () => { S.board.arquivados = !S.board.arquivados; persistUI(); renderProjetos(); }, scrollCol: b => $("#col-" + b.dataset.id)?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", inline: "start", block: "nearest" }),
  renameCol: b => { closeMenus(); S.editCol = b.dataset.id; renderBoard(); }, colMenu: b => colMenu(b),
  colMove: async b => { closeMenus(); const cols = Plan.cols(), i = cols.findIndex(c => c.id === b.dataset.id), j = i + Number(b.dataset.d); if (j < 0 || j >= cols.length) return; const a = cols[i], c = cols[j];
    [a.ordem, c.ordem] = [c.ordem, a.ordem]; if (a.ordem === c.ordem) { a.ordem = j + 1; c.ordem = i + 1; } renderBoard(); await save(async () => { await Repo.patch("colunas", a.id, { ordem: a.ordem }, { silent: true }); await Repo.patch("colunas", c.id, { ordem: c.ordem }, { silent: true }); }).catch(() => { }); },
  colDel: async b => { closeMenus(); const c = S.data.colunas.find(x => x.id === b.dataset.id); if (!c) return; const dep = DEPENDENTS.colunas(c.id); if (dep) { toast(dep, null, "erro"); return; }
    if (await confirmDlg({ titulo: "Excluir coluna?", texto: `A coluna “${c.titulo.slice(0, 60)}” será excluída.`, ok: "Excluir", perigo: true })) save(() => Repo.remove("colunas", c.id), "Coluna excluída").catch(() => { }); },
  addCol: async () => { const ordem = Math.max(0, ...S.data.colunas.map(c => c.ordem)) + 1; const id = await save(() => Repo.create("colunas", { titulo: "Nova coluna", objetivoId: "", ordem })).catch(() => null); if (id) { S.editCol = id; setTimeout(() => { renderBoard(); $("#col-" + id)?.scrollIntoView({ inline: "end", block: "nearest" }); }, 80); } },
  qadd: b => { S.qadd = b.dataset.id; renderBoard(); }, qcancel: () => { S.qadd = null; renderBoard(); },
  lsort: b => { const s = S.board.sort || { k: "status", d: 1 }; S.board.sort = { k: b.dataset.k, d: s.k === b.dataset.k ? -s.d : 1 }; persistUI(); renderLista(); },
  /* cartão */
  clHide: () => { S.modal.hideDone = !S.modal.hideDone; renderModal({ force: true }); },
  eUp: b => { const id = b.closest("[data-eid]").dataset.eid, es = entregasCopy(), i = es.findIndex(e => e.id === id); if (i > 0) { [es[i - 1], es[i]] = [es[i], es[i - 1]]; patchP({ entregas: es }, null, true, { silent: true }); } },
  eDel: b => { const id = b.closest("[data-eid]").dataset.eid, es = entregasCopy(), old = entregasCopy(), x = es.find(e => e.id === id); patchP({ entregas: es.filter(e => e.id !== id) }, null, true, { detalhe: "excluiu entrega: " + (x?.texto || "").slice(0, 80) }).then(ok => ok && toast("Entrega excluída", () => patchP({ entregas: old }, "Entrega restaurada"))); },
  cDel: async b => { const p = curP(); if (!(await confirmDlg({ titulo: "Excluir comentário?", texto: "O comentário será removido para todos.", ok: "Excluir", perigo: true }))) return; patchP({ comentarios: p.comentarios.filter(c => c.id !== b.dataset.id) }, "Comentário excluído", true, { silent: true }); },
  rDel: b => { const p = curP(); patchP({ responsaveis: (p.responsaveis || []).filter(r => r !== b.dataset.v) }); },
  etqTog: b => { const p = curP(), s = new Set(p.etiquetas || []); s.has(b.dataset.id) ? s.delete(b.dataset.id) : s.add(b.dataset.id); patchP({ etiquetas: [...s] }, null, true, { silent: true }); },
  capaDel: () => { const id = S.modal.id; save(() => Repo.removeCapa(id), "Capa removida").catch(() => { }); },
  lDel: b => { const p = curP(); patchP({ links: (p.links || []).filter(l => l.id !== b.dataset.id) }); },
  notificar: () => notificarProjeto(),
  dupCard: async () => { const p = curP(); const copy = { ...structuredClone(p), titulo: p.titulo + " (cópia)", ordem: p.ordem + .5, comentarios: [], concluido: false, arquivado: false, entregas: (p.entregas || []).map(e => ({ ...e, id: uid(), feito: false, feitoEm: "", feitoPor: "" })) }; delete copy.id;
    const id = await save(() => Repo.create("projetos", copy), "Projeto duplicado").catch(() => null); if (id) setTimeout(() => openModal(id), 120); },
  arqCard: async () => { const p = curP(), v = !p.arquivado; closeModal(); save(() => Repo.patch("projetos", p.id, { arquivado: v }, { acao: v ? "arquivou" : "alterou", detalhe: v ? "" : "restaurou do arquivo" }), v ? "Projeto arquivado" : "Projeto restaurado", v ? () => save(() => Repo.patch("projetos", p.id, { arquivado: false }, { silent: true }), "Projeto restaurado") : null).catch(() => { }); },
  delCard: async () => { const p = curP(); if (!(await confirmDlg({ titulo: "Excluir projeto?", texto: `“${p.titulo.slice(0, 80)}” será excluído com entregas e comentários. Prefira Arquivar se quiser guardar o histórico.`, ok: "Excluir", perigo: true }))) return; closeModal(); save(() => Repo.remove("projetos", p.id), "Projeto excluído").catch(() => { }); },
  /* configurações */
  ctab: b => { S.sub.config = b.dataset.v; persistUI(); renderConfig(); }, novaPessoa: b => pessoaForm(null, b.dataset.nome ? { nome: b.dataset.nome } : {}), editPessoa: b => pessoaForm(b.dataset.id),
  convidar: b => convidar(b.dataset.id), desbloquear: async b => { const e = b.dataset.email; if (!(await confirmDlg({ titulo: "Liberar acesso?", texto: `O contador de senhas erradas de ${e} volta a zero.`, ok: "Liberar" }))) return;
    await save(() => S.fb.firestore().doc(`tentativas/${e}`).delete(), "Acesso liberado").then(() => Audit.log("desbloqueou", "config", e, e)).catch(() => { }); cfgSeguranca(); },
  emailTeste: () => save(() => Mail.enqueue([{ para: [myEmail()], tipo: "teste", assunto: "[Planejamento] E-mail de teste", texto: `Olá!\n\nEste é um teste do robô de e-mails da plataforma de planejamento do ${CFG.cliente.nome}. Se chegou, está tudo certo.\n\n${Mail.link()}` }]), "Teste na fila. Chega em até 15 minutos.").catch(() => { }),
  etqAdd: () => { const l = [...readEtqForm(), { id: uid(), nome: "Nova etiqueta", cor: "#355C8C" }]; renderEtqDraft(l); $$(".etq-ed .er input.inp").pop()?.select(); },
  etqDel: b => { const l = readEtqForm().filter((_, i) => i !== Number(b.dataset.i)); renderEtqDraft(l); },
  backup: () => backup(), exportCSVall: () => { const k = { ...S.f }; Object.keys(S.f).forEach(x => S.f[x] = ""); S.f.ciclo = "todos"; exportCSV(); Object.assign(S.f, k); },
  resetDemo: async () => { if (await confirmDlg({ titulo: "Restaurar dados iniciais?", texto: "Tudo o que foi alterado neste navegador será perdido.", ok: "Restaurar", perigo: true })) { S.store.reset(SEED); toast("Dados iniciais restaurados"); } },
};
function readEtqForm() { const f = $(".etq-ed"); if (!f) return etiquetas(); const fd = new FormData(f), out = []; for (let i = 0; fd.has("n" + i); i++) out.push({ id: fd.get("i" + i), nome: clean(fd.get("n" + i)).slice(0, 40), cor: fd.get("c" + i) }); return out; }
function renderEtqDraft(l) { const keep = S.data.config.find(c => c.id === "etiquetas"); const tmp = { id: "etiquetas", lista: l }; S.data.config = [...S.data.config.filter(c => c.id !== "etiquetas"), tmp]; cfgEtiquetas(); S.data.config = [...S.data.config.filter(c => c.id !== "etiquetas"), ...(keep ? [keep] : [])]; }
const CHANGE = {
  f: el => { S.f[el.dataset.f] = el.value; S.anim.painel = false; persistUI(); renderPainel(); },
  meuPessoa: el => { S.meu.pessoa = el.value; persistUI(); renderMeu(); },
  bfilter: el => { S.board[el.dataset.k] = el.value; persistUI(); renderProjetos(); },
  colObj: el => { closeMenus(); save(() => Repo.patch("colunas", el.dataset.id, { objetivoId: el.value }), "Coluna vinculada").catch(() => { }); },
  meuToggle: el => { const p = S.data.projetos.find(x => x.id === el.dataset.p); if (!p) return; const es = p.entregas.map(e => e.id === el.dataset.e ? { ...e, feito: el.checked, feitoEm: el.checked ? new Date().toISOString() : "", feitoPor: el.checked ? (S.me.nome || "Equipe") : "" } : e);
    const was = Plan.statusP(p); p.entregas = es; renderMeu(); save(() => Repo.patch("projetos", p.id, { entregas: es }, { acao: el.checked ? "concluiu" : "reabriu", detalhe: es.find(e => e.id === el.dataset.e)?.texto.slice(0, 80) }), el.checked ? "Entrega concluída" : "Entrega reaberta").then(() => { if (el.checked && was !== "concluido" && Plan.statusP(p) === "concluido") { celebrate(); toast("Projeto concluído! Todas as entregas feitas."); } }).catch(() => { }); },
  eTog: el => { const id = el.closest("[data-eid]").dataset.eid, es = entregasCopy(), x = es.find(e => e.id === id), p = curP(), was = Plan.statusP(p);
    Object.assign(x, { feito: el.checked, feitoEm: el.checked ? new Date().toISOString() : "", feitoPor: el.checked ? (S.me.nome || myName() || "Equipe") : "" });
    patchP({ entregas: es }, null, true, { acao: el.checked ? "concluiu" : "reabriu", detalhe: x.texto.slice(0, 80) }).then(ok => { if (ok && el.checked && was !== "concluido" && Plan.statusP(curP() || p) === "concluido") { celebrate(); toast("Projeto concluído! Todas as entregas feitas."); } }); },
  ePrazo: el => { const id = el.closest("[data-eid]").dataset.eid, es = entregasCopy(); es.find(e => e.id === id).prazo = el.value; patchP({ entregas: es }, null, true, { detalhe: "prazo de entrega" }); },
  eResp: el => { const id = el.closest("[data-eid]").dataset.eid, es = entregasCopy(); es.find(e => e.id === id).resp = clean(el.value); patchP({ entregas: es }, null, true, { detalhe: "responsável de entrega" }); },
  mCol: el => patchP({ colunaId: el.value, ordem: Math.max(0, ...S.data.projetos.filter(p => p.colunaId === el.value).map(p => p.ordem)) + 1000 }, "Projeto movido", true, { acao: "moveu", detalhe: "para " + (S.data.colunas.find(c => c.id === el.value)?.titulo.slice(0, 40) || "") }),
  mCiclo: el => patchP({ ciclo: el.value }), mPrio: el => patchP({ prioridade: el.value }),
  mIni: el => { const p = curP(); if (el.value && p.prazo && el.value > p.prazo) { toast("O início não pode ser depois do prazo final.", null, "erro"); el.value = p.inicio || ""; return; } patchP({ inicio: el.value }); },
  mPrazo: el => { const p = curP(); if (el.value && p.inicio && el.value < p.inicio) { toast("O prazo final não pode ser antes do início.", null, "erro"); el.value = p.prazo || ""; return; } patchP({ prazo: el.value }); },
  mDone: el => { patchP({ concluido: el.checked }, el.checked ? "Projeto concluído" : null, true, { acao: el.checked ? "concluiu" : "reabriu" }).then(ok => ok && el.checked && celebrate()); },
  capaUp: el => { if (el.files[0]) uploadCapa(el.files[0]); el.value = ""; },
  restore: el => { if (el.files[0]) restoreBackup(el.files[0]); el.value = ""; },
};
const SUBMIT = {
  qform: async f => { const colId = f.dataset.col, titulo = clean($("#qa-text").value); if (!titulo) return; const list = S.data.projetos.filter(p => p.colunaId === colId), ordem = Math.max(0, ...list.map(p => p.ordem)) + 1000;
    const ciclo = S.board.ciclo && S.board.ciclo !== "todos" ? S.board.ciclo : geral().cicloAtual; $("#qa-text").value = "";
    await save(() => Repo.create("projetos", { colunaId: colId, titulo, ciclo, ordem, responsaveis: S.me.nome && !can("editar_projetos") ? [S.me.nome] : [], entregas: [], comentarios: [], links: [] }), "Cartão adicionado").catch(() => { }); },
  eAdd: () => { const v = clean($("#m-newe").value), d = $("#m-newd").value; if (!v) return; const es = entregasCopy(); es.push({ id: uid(), texto: v, feito: false, prazo: isDateStr(d) ? d : "", resp: "" }); $("#m-newe").value = ""; $("#m-newd").value = ""; patchP({ entregas: es }, null, true, { detalhe: "nova entrega: " + v.slice(0, 80) }).then(() => $("#m-newe")?.focus()); },
  cAdd: () => { const v = cleanML($("#m-cmtt").value), autor = S.me.nome || clean($("#m-autor")?.value); if (!v) return; if (!autor) { toast("Escreva seu nome para comentar.", null, "erro"); $("#m-autor")?.focus(); return; }
    if (!S.me.nome) lsSet(KEY + "-nome", autor); const p = curP(); $("#m-cmtt").value = "";
    patchP({ comentarios: [...(p.comentarios || []), { id: uid(), texto: v, autor, email: myEmail(), em: new Date().toISOString() }] }, "Comentário publicado", true, { acao: "comentou", detalhe: v.slice(0, 80) }); },
  rAdd: () => { const v = clean($("#m-rnew").value); if (!v) return; const p = curP(); if (!(p.responsaveis || []).some(r => norm(r) === norm(v))) patchP({ responsaveis: [...(p.responsaveis || []), v] }); else toast(`${v} já é responsável.`); },
  lAdd: () => { const url = clean($("#m-lurl").value); if (!/^https?:\/\/\S+\.\S+/i.test(url)) { toast("Cole um link completo, começando com https://", null, "erro"); $("#m-lurl").focus(); return; } const p = curP(); patchP({ links: [...(p.links || []), { id: uid(), url, nome: clean($("#m-lnome").value) || url.replace(/^https?:\/\//, "").slice(0, 60) }] }, "Link adicionado"); },
  trocarSenha: async () => { const a = $("#pw0").value, b = $("#pw1").value, c = $("#pw2").value, m = $("#pwm");
    if (b.length < 8 || !/[A-Za-z]/.test(b) || !/\d/.test(b)) { m.textContent = "A nova senha precisa de pelo menos 8 caracteres, com letras e números."; return; }
    if (b !== c) { m.textContent = "As duas senhas novas não são iguais."; return; } if (a === b) { m.textContent = "A nova senha precisa ser diferente da atual."; return; }
    try { const u = S.fb.auth().currentUser; await u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email, a)); await u.updatePassword(b); m.textContent = ""; $$("#pw0,#pw1,#pw2").forEach(x => x.value = ""); toast("Senha alterada"); }
    catch (e) { m.textContent = /wrong-password|invalid-credential|invalid-login/.test(e.code || "") ? "A senha atual está incorreta." : authError(e).message; } },
  meuNome: () => { const v = clean($("#mnome").value); lsSet(KEY + "-nome", v); S.me.nome = v; toast("Nome salvo"); renderFrame(); go("config"); },
  salvarGeral: () => save(() => Repo.setConfig("geral", { ...cfgDoc("geral"), cicloAtual: $("#g-ciclo").value }), "Preferências salvas").then(() => { S.f.ciclo = ""; S.board.ciclo = ""; }).catch(() => { }),
  salvarSeg: () => save(() => Repo.setConfig("seguranca", { ...cfgDoc("seguranca"), timeoutMin: Number($("#sg-to").value) }), "Sessão atualizada").catch(() => { }),
  salvarAuto: () => { const dest = $("#au-dest").value.split(/[,;\s]+/).map(normEmail).filter(Boolean), bad = dest.filter(e => !emailOk(e)); if (bad.length) { toast(`E-mail inválido: ${bad[0]}`, null, "erro"); return; }
    const c = cfgDoc("automacoes"); save(() => Repo.setConfig("automacoes", { ...c, ativo: $("#au-on").checked, diasAntes: Number($("#au-dias").value), atrasadas: $("#au-late").checked, resumoSemanal: $("#au-sem").checked, diaResumo: Number($("#au-dia").value), destinatarios: dest }), "Automações salvas").catch(() => { }); },
  roboSave: async () => { const e = normEmail($("#robo-email").value); if (!emailOk(e)) { toast("Digite o e-mail da conta do robô.", null, "erro"); return; }
    try { await S.fb.firestore().doc(`acessos/${e}`).set({ papel: "robo", ativo: true, nome: "Robô de e-mails", atualizadoEm: new Date().toISOString(), por: myEmail() }); await Repo.setConfig("automacoes", { ...cfgDoc("automacoes"), roboEmail: e }); toast("Robô autorizado"); }
    catch (er) { toast("Não foi possível autorizar: " + (er.code || er.message), null, "erro"); } },
  salvarEtq: () => { const l = readEtqForm().filter(e => e.nome); if (new Set(l.map(e => norm(e.nome))).size !== l.length) { toast("Há etiquetas com o mesmo nome.", null, "erro"); return; } save(() => Repo.setConfig("etiquetas", { lista: l }), "Etiquetas salvas").catch(() => { }); },
};
function bindGlobal() {
  document.addEventListener("click", e => {
    const el = e.target.closest("[data-act], [data-card], [data-view]");
    if (!e.target.closest("#pop") && !e.target.closest("[aria-expanded=true]")) closeMenus();
    if (!el) return;
    if (el.dataset.view && !el.dataset.act) { closeModal(); return go(el.dataset.view); }
    if (el.dataset.card && !el.dataset.act) { if (S.editCol) return; return openModal(el.dataset.card); }
    if (/INPUT|SELECT|TEXTAREA|FORM/.test(el.tagName)) return;
    const fn = ACT[el.dataset.act]; if (!fn) return; e.preventDefault();
    if (el.getAttribute("aria-expanded") === "true") { closeMenus(); return; }
    try { fn(el, e); } catch (er) { console.error(er); toast("Algo deu errado. Recarregue a página e tente de novo.", null, "erro"); }
  });
  document.addEventListener("change", e => { const el = e.target; const k = el.dataset.f ? "f" : el.dataset.act; if (CHANGE[k]) { try { CHANGE[k](el, e); } catch (er) { console.error(er); } } });
  document.addEventListener("submit", e => { const f = e.target; if (!SUBMIT[f.dataset.act]) return; e.preventDefault(); try { SUBMIT[f.dataset.act](f, e); } catch (er) { console.error(er); } });
  document.addEventListener("input", debounce(e => { if (e.target.id === "b-q") { S.board.q = e.target.value; persistUI(); renderProjetos(); } }, 180));
  document.addEventListener("input", e => { if (e.target.matches?.("textarea.m-title, textarea.cl-text")) autoGrow(e.target); });
  document.addEventListener("focusout", e => {
    const t = e.target, p = curP();
    if (S.pendingRender) setTimeout(() => { const a = document.activeElement; if (S.pendingRender && !(a && $("#view")?.contains(a) && /INPUT|TEXTAREA/.test(a.tagName))) render(); }, 120);
    if (t.id === "col-edit") { const id = S.editCol, v = clean(t.value); S.editCol = null; const c = S.data.colunas.find(x => x.id === id); if (c && v && v !== c.titulo) { c.titulo = v; save(() => Repo.patch("colunas", id, { titulo: v }), "Coluna renomeada").catch(() => { }); } setTimeout(renderBoard, 0); return; }
    if (!p) return;
    if (t.id === "m-title") { const v = clean(t.value); if (!v) { t.value = p.titulo; toast("O projeto precisa de um nome.", null, "erro"); } else if (v !== p.titulo) patchP({ titulo: v }, null, false, { detalhe: "nome" }); }
    if (t.id === "m-desc" && cleanML(t.value) !== cleanML(p.descricao)) patchP({ descricao: t.value }, "Descrição salva", false, { detalhe: "descrição" });
    if (t.dataset?.act === "eTxt") { const id = t.closest("[data-eid]").dataset.eid, es = entregasCopy(), x = es.find(y => y.id === id); const v = clean(t.value); if (x && !v) { t.value = x.texto; toast("Para apagar a entrega, use a lixeira.", null, "erro"); } else if (x && v !== x.texto) { x.texto = v; patchP({ entregas: es }, null, false, { detalhe: "texto de entrega" }); } }
  });
  let gKey = 0;
  document.addEventListener("keydown", e => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k" && S.started) { e.preventDefault(); $("#palette").hidden ? openPalette() : closePalette(); return; }
    if (e.key === "Escape") {
      if (!$("#dialog").hidden) return; if (!$("#palette").hidden) return closePalette(); if (!$("#pop").hidden) return closeMenus();
      if (S.editCol && e.target.id === "col-edit") { S.editCol = null; return renderBoard(); }
      if (S.drawer) return closeDrawer(); if (S.modal) return closeModal(); if (S.qadd) { S.qadd = null; return renderBoard(); } return;
    }
    if (e.target.id === "col-edit" && e.key === "Enter") { e.preventDefault(); e.target.blur(); return; }
    if (e.target.id === "qa-text" && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.target.form.requestSubmit(); return; }
    if ((e.target.id === "m-title" || e.target.dataset?.act === "eTxt") && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.target.blur(); return; }
    if ((e.key === "Enter" || e.key === " ") && !typing && e.target.matches?.(".kcard, tr.click")) { e.preventDefault(); e.target.click(); return; }
    if (typing || !S.started || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "/") { e.preventDefault(); openPalette(); return; }
    if (e.key.toLowerCase() === "g") { gKey = Date.now(); return; }
    if (Date.now() - gKey < 1200) { const to = { p: "painel", m: "meu", o: "okrs", q: "projetos", c: "config" }[e.key.toLowerCase()]; if (to) { gKey = 0; closeModal(); go(to); } }
  });
  addEventListener("popstate", () => { if (S.modal) closeModal(true); });
  addEventListener("hashchange", () => { const [v, sub] = location.hash.slice(1).split("?")[0].split("-"); if (S.started && VIEWS[v] && (v !== S.view || (sub && sub !== S.sub[v]))) go(v, sub); });
  S.wasMobile = isMobile(); addEventListener("resize", debounce(() => { const m = isMobile(); if (m !== S.wasMobile) { S.wasMobile = m; if (S.started) render(); } }, 250));
  $("#scrim").addEventListener("mousedown", e => { if (e.target.id === "scrim") closeModal(); });
  $("#drawer").addEventListener("mousedown", e => { if (e.target.id === "drawer") closeDrawer(); });
  $("#palette").addEventListener("mousedown", e => { if (e.target.id === "palette") closePalette(); });
}
boot();

window.__APP = { S, Plan, Repo, Lockout, SCHEMAS, can, render, go, openModal, Mar };
})();
