import React, { useState } from 'react';
import { FaExternalLinkAlt, FaFilePdf, FaTimes, FaSearchPlus } from 'react-icons/fa';
import Modal from './common/Modal';
import Tabs from './common/Tabs';
import './style/references-modal.css';
import UAIAsteroidiLogo from '../assets/img/uai asteroidi.png';
import TabellaDimensioneAsteroidi from '../assets/img/tabella dimensioni.png';
import pdfNeocp from '../assets/pdf/tabella_grafica_punteggio_neocp.pdf';
import pdfNeocpCandidati from '../assets/pdf/tabella_grafica_punteggio_neocp_candidati_aggiornati.pdf';

/* ── Score range bar ─────────────────────────────────────────── */
const SCORE_RANGES = [
  { label: '0–20',    desc: 'Bassa compatibilità NEO', bg: '#90ee90', fg: '#0f5132', flex: 20 },
  { label: '20–65',   desc: 'Zona intermedia',         bg: '#ffeb3b', fg: '#5f370e', flex: 45 },
  { label: '65–90',   desc: 'Priorità NEOCP',          bg: '#ff9800', fg: '#4e2600', flex: 25 },
  { label: '90–100',  desc: 'Molto NEO-like',          bg: '#f44336', fg: '#ffffff', flex: 10 },
];

function ScoreBar() {
  return (
    <div className="score-bar-wrapper">
      <div className="score-bar">
        {SCORE_RANGES.map(r => (
          <div
            key={r.label}
            className="score-bar-segment"
            style={{ flex: r.flex, backgroundColor: r.bg, color: r.fg }}
          >
            <span className="score-bar-label">{r.label}</span>
          </div>
        ))}
      </div>
      <div className="score-bar-legend">
        {SCORE_RANGES.map(r => (
          <div key={r.label} className="score-legend-item">
            <span className="score-legend-dot" style={{ backgroundColor: r.bg }} />
            <span><strong>{r.label}</strong> — {r.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Lightbox ────────────────────────────────────────────────── */
function Lightbox({ src, alt, onClose }) {
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Chiudi">
        <FaTimes />
      </button>
      <img
        src={src}
        alt={alt}
        className="lightbox-img"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

/* ── Candidate rows ──────────────────────────────────────────── */
const HIGH_PRIORITY = [
  { desig: 'CELOFM2', score: 98,  note: 'Miglior candidato attuale. Arco di quasi 1 giorno (0.91), aggiornamento recentissimo (non visto da soli 0.054 d). V = 20.9 — profilo più robusto.' },
  { desig: 'S00005Z', score: 100, note: 'Score massimo, molto luminoso (V = 18.8). Il candidato più comodo da recuperare rapidamente.' },
];
const LOW_PRIORITY = [
  { desig: 'X89698',  score: 78,  note: 'Score buono e luminoso (V = 18.8), ma pochissime osservazioni e non visto da oltre 9 giorni. Recupero incerto / "stale".' },
  { desig: 'C1ENAF5', score: 16,  note: 'Score basso (16). Profilo poco compatibile con un NEO, molto debole (V = 22.4) nonostante un arco lungo di 4 giorni.' },
  { desig: 'S00005a', score: 100, note: 'Score 100, ma molto debole (V = 21.1). Il follow-up è importante ma tecnicamente più difficile.' },
];

function getScoreBg(s) {
  if (s < 20) return '#90ee90';
  if (s < 65) return '#ffeb3b';
  if (s < 90) return '#ff9800';
  return '#f44336';
}
function getScoreFg(s) {
  return s >= 90 ? '#fff' : (s >= 65 ? '#4e2600' : (s >= 20 ? '#5f370e' : '#0f5132'));
}

function CandidateRow({ desig, score, note }) {
  return (
    <div className="candidate-row">
      <span className="candidate-desig">{desig}</span>
      <span
        className="candidate-score"
        style={{ backgroundColor: getScoreBg(score), color: getScoreFg(score) }}
      >
        {score}
      </span>
      <span className="candidate-note">{note}</span>
    </div>
  );
}

/* ── Tab contents ─────────────────────────────────────────────── */
function TabNeocp() {
  return (
    <div className="ref-tab-content">
      <h3>1. Scala del Punteggio</h3>
      <p className="section-description">
        Il punteggio NEOCP (0–100) indica quanto un tracklet assomiglia a un NEO e serve a orientare
        il follow-up osservativo. <strong>Non misura pericolosità, rischio d'impatto o conferma definitiva.</strong>
      </p>
      <ScoreBar />

      <h3>2. Definizione e Uso Corretto</h3>
      <p className="section-description">
        È fondamentale distinguere la natura tecnica del punteggio dal rischio reale.
      </p>
      <ul className="ref-list">
        <li><strong>Natura:</strong> È uno score quasi-probabilistico che confronta le orbite possibili compatibili con le osservazioni. Non è una conferma definitiva dell'oggetto.</li>
        <li><strong>Uso:</strong> Serve esclusivamente a dare priorità al follow-up osservativo.</li>
        <li><strong>Cosa NON è:</strong> Non misura il pericolo d'impatto, la scala di rischio o la dimensione dell'oggetto.</li>
        <li><strong>Regola chiave:</strong> Uno score di 100 significa "osservatemi presto", non "sono pericoloso".</li>
      </ul>

      <h3>3. Analisi dei Candidati — Esempi Pratici</h3>
      <p className="section-description">
        Per decidere cosa osservare bisogna valutare lo score insieme alla magnitudine (<em>V</em>),
        al numero di osservazioni (<em>NObs</em>), all'arco osservativo e ai giorni dall'ultima visione.
      </p>

      <p className="candidate-group-label">🟢 Candidati ad Alta Priorità</p>
      {HIGH_PRIORITY.map(c => <CandidateRow key={c.desig} {...c} />)}

      <p className="candidate-group-label" style={{ marginTop: '1rem' }}>🔴 Candidati Problematici o a Bassa Priorità</p>
      {LOW_PRIORITY.map(c => <CandidateRow key={c.desig} {...c} />)}

      <p className="ref-note">
        <strong>Nota metodologica:</strong> La conferma definitiva della natura di un oggetto arriva solo
        con l'allungamento dell'arco osservativo attraverso nuove misurazioni.
      </p>

      <div className="ref-pdf-links">
        <a href={pdfNeocp} target="_blank" rel="noopener noreferrer" className="reference-link pdf-link">
          <FaFilePdf className="icon" /> Scala rapida di lettura (PDF)
        </a>
        <a href={pdfNeocpCandidati} target="_blank" rel="noopener noreferrer" className="reference-link pdf-link">
          <FaFilePdf className="icon" /> Candidati aggiornati (PDF)
        </a>
      </div>
    </div>
  );
}

function TabDimensioni() {
  const [lightbox, setLightbox] = useState(false);
  return (
    <div className="ref-tab-content">
      <h3>Tabella Dimensioni Asteroidali</h3>
      <p className="section-description">
        Diametro stimato (km) in funzione della magnitudine assoluta <em>H</em> e dell'albedo geometrica <em>a</em>.
        Formula: <code>d = 10^(3.1236 − 0.5·log₁₀(a) − 0.2·H)</code>
      </p>
      <p className="section-description img-hint">
        <FaSearchPlus style={{ marginRight: 4 }} /> Clicca sull'immagine per ingrandirla.
      </p>
      <div className="table-preview clickable" onClick={() => setLightbox(true)}>
        <img src={TabellaDimensioneAsteroidi} alt="Tabella Dimensioni Asteroidi" className="table-image" />
      </div>
      {lightbox && (
        <Lightbox
          src={TabellaDimensioneAsteroidi}
          alt="Tabella Dimensioni Asteroidi"
          onClose={() => setLightbox(false)}
        />
      )}
    </div>
  );
}

function TabRisorse() {
  return (
    <div className="ref-tab-content">
      <div className="references-section">
        <h3>🌐 Minor Planet Center</h3>
        <p className="section-description">
          Accedi ai recenti MPEC (Minor Planet Electronic Circulars) dal Minor Planet Center.
        </p>
        <a
          href="https://www.minorplanetcenter.net/mpec/RecentMPECs.html"
          target="_blank"
          rel="noopener noreferrer"
          className="reference-link external-link"
        >
          <FaExternalLinkAlt className="icon" /> Recent MPEC — Minor Planet Center
        </a>
      </div>

      <div className="references-section">
        <h3>🔭 Curve di Luce — Unione Astrofili Italiani</h3>
        <p className="section-description">
          Cartella condivisa con le curve di luce degli asteroidi curate dall'Unione Astrofili Italiani.
        </p>
        <div className="uai-link-container">
          <img src={UAIAsteroidiLogo} alt="UAI Asteroidi" className="uai-logo" />

        </div>
      </div>

      <div className="references-section references-footer">
        <h3>🔗 Link Utili</h3>
        <ul className="references-list">
          <li>
            <a href="https://www.minorplanetcenter.net/" target="_blank" rel="noopener noreferrer">
              Minor Planet Center (MPC)
            </a>
          </li>
          <li>
            <a href="https://asteroidi.uai.it/it" target="_blank" rel="noopener noreferrer">
              UAI — Sezione Asteroidi
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
const ReferencesModal = ({ open, onClose }) => {
  const tabs = [
    { label: 'Punteggio NEOCP',         content: <TabNeocp /> },
    { label: 'Dimensioni degli Asteroidi', content: <TabDimensioni /> },
    { label: 'Link e Risorse',           content: <TabRisorse /> },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="references-modal-content">
        <h2>Risorse e Riferimenti</h2>
        <Tabs tabs={tabs} />
      </div>
    </Modal>
  );
};

export default ReferencesModal;
