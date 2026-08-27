import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { categories, words, groups } from './data/words'
import Teacher from '../../components/Teacher'

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5)

const modes = [
  { id: 'fr-es', from: 'fr', to: 'es', hint: 'Tu vois le mot en français' },
  { id: 'es-fr', from: 'es', to: 'fr', hint: 'Tu vois le mot en espagnol' },
  { id: 'mixte', from: null, to: null, icon: '🔀', hint: 'Sens aléatoire' },
]

const suits = ['♠', '♥', '♦', '♣']
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const isRedSuit = (suit) => suit === '♥' || suit === '♦'

const FLAG_FILES = { fr: 'francia.svg', ar: 'argentina.svg', es: 'españa.svg' }

const drawSound = new Audio(encodeURI('/sound/Card  Sound.mp3'))
const playDrawSound = () => { try { drawSound.currentTime = 0; drawSound.play() } catch {} }

const flipSound = new Audio(encodeURI('/sound/whoosh sound effect.mp3'))
const playFlipSound = () => { try { flipSound.currentTime = 0; flipSound.play() } catch {} }

const correctSound = new Audio(encodeURI('/sound/Correct answer.mp3'))
const playCorrectSound = () => { try { correctSound.currentTime = 0; correctSound.play() } catch {} }

function Flag({ code, className = '' }) {
  return <img className={`flag-img ${className}`} src={`/banderas/${encodeURIComponent(FLAG_FILES[code])}`} alt="" draggable="false" />
}

const correctReactions = [
  { message: 'OK !', file: 'OK !.png' },
  { message: 'Parfait !', file: 'Parfait !.png' },
  { message: 'Bravo !', file: 'Bravo !.png' },
]

const almostReactions = [
  { message: 'Dommage… La prochaine sera la bonne !', file: 'Mmh... tu es sûr(e).png' },
]

const incorrectReactions = [
  { message: 'Comment ça, tu ne savais pas ?!', file: 'Ouh la non.png' },
  { message: 'Je ne peux même plus te regarder...', file: 'Sans commentaire....png' },
]

function BackSkin() {
  return <span className="back-skin" />
}

function Deck({ count, disabled, onClick }) {
  return (
    <button className="deck" onClick={(event) => { event.stopPropagation(); onClick() }} disabled={disabled}>
      <span className="deck-stack"><i /><i /><i /><span className="deck-top"><BackSkin /></span></span>
      <strong>{count > 0 ? `Tirer une carte` : 'Paquet vide'}</strong>
      <small>{count} carte{count > 1 ? 's' : ''} restante{count > 1 ? 's' : ''}</small>
    </button>
  )
}

function Corner({ rank, suit, br }) {
  return <span className={`corner ${br ? 'corner-br' : ''} ${isRedSuit(suit) ? 'red' : ''}`}><b>{rank}</b><i>{suit}</i></span>
}

function FaceRows({ rows, big }) {
  return <>{rows.map((row, index) => {
    const flags = <span className="flag">{row.codes.map((code) => <Flag key={code} code={code} />)}</span>
    return big
      ? <p key={index} className="face-term">{flags}{row.text}</p>
      : <p key={index} className="trad-row">{flags}<span>{row.text}</span></p>
  })}</>
}

function variantRows(ar, es) {
  const a = ar.join(' / ')
  const e = es.join(' / ')
  if (a && a === e) return [{ codes: ['ar', 'es'], text: a }]
  return [...(a ? [{ codes: ['ar'], text: a }] : []), ...(e ? [{ codes: ['es'], text: e }] : [])]
}

function PokerCard({ card, revealed, onSpeak }) {
  const origin = card.dir === 'fr-es'
    ? [{ codes: ['fr'], text: card.word.fr.join(' / ') }]
    : variantRows(card.word.ar, card.word.es)
  const target = card.dir === 'fr-es'
    ? variantRows(card.word.ar, card.word.es)
    : [{ codes: ['fr'], text: card.word.fr.join(' / ') }]
  const originLang = card.dir === 'fr-es' ? { lang: 'fr-FR' } : { lang: 'es-AR' }
  return (
    <div className="poker-scene">
      <motion.div className="poker-card" animate={{ rotateY: revealed ? 180 : 0 }} transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}>
        <div className="card-side card-origin">
          <Corner rank={card.rank} suit={card.suit} /><Corner rank={card.rank} suit={card.suit} br />
          <div className="face-body">
            <FaceRows rows={origin} big />
          </div>
          <button className="listen on-card" onClick={(event) => { event.stopPropagation(); onSpeak(origin.map((row) => row.text).join(', '), originLang.lang) }}>🔊 Écouter</button>
        </div>
        <div className="card-side card-target">
          <Corner rank={card.rank} suit={card.suit} /><Corner rank={card.rank} suit={card.suit} br />
          <div className="face-body">
            <FaceRows rows={target} />
          </div>
          {card.dir === 'es-fr' && <button className="listen on-card" onClick={(event) => { event.stopPropagation(); onSpeak(card.word.fr.join(', '), 'fr-FR') }}>🔊 Écouter</button>}
        </div>
      </motion.div>
    </div>
  )
}

export default function FlashCardsApp({ onBack }) {
  const [screen, setScreen] = useState('group')
  const [mode, setMode] = useState(null)
  const [groupId, setGroupId] = useState(null)
  const [categoryId, setCategoryId] = useState(null)
  const [deck, setDeck] = useState([])
  const [current, setCurrent] = useState(null)
  const [phase, setPhase] = useState('ready')
  const [reaction, setReaction] = useState(null)
  const [known, setKnown] = useState(0)
  const [correctStreak, setCorrectStreak] = useState(0)
  const [incorrectStreak, setIncorrectStreak] = useState(0)
  const [almostStreak, setAlmostStreak] = useState(0)

  const total = deck.length + (current ? 1 : 0)

  const startGame = (id, modeId) => {
    const picked = shuffle(words.filter((word) => word.category === id)).map((word, index) => ({
      key: `${word.category}-${word.fr.join('|')}-${index}`,
      word,
      dir: modeId === 'mixte' ? (Math.random() < 0.5 ? 'fr-es' : 'es-fr') : modeId,
      rank: ranks[index % ranks.length],
      suit: suits[index % suits.length],
    }))
    setCategoryId(id); setDeck(picked); setCurrent(null); setPhase('ready'); setKnown(0); setCorrectStreak(0); setIncorrectStreak(0); setReaction(null); setScreen('game')
  }

  const goHome = () => onBack()

  const replay = () => { setMode(null); setCategoryId(null); setDeck([]); setCurrent(null); setPhase('ready'); setReaction(null); setKnown(0); setCorrectStreak(0); setIncorrectStreak(0); setAlmostStreak(0); setScreen('category') }

  const pickGroup = (id) => { setGroupId(id); setScreen('category') }

  const pickCategory = (id) => { setCategoryId(id); setScreen('select') }

  const pickMode = (id) => { setMode(id); startGame(categoryId, id) }

  const advance = () => {
    if (!current) {
      const [next, ...rest] = deck
      if (!next) return
      setCurrent(next); setDeck(rest); setPhase('drawn'); setReaction(null)
      playDrawSound()
    } else if (phase === 'drawn') {
      setPhase('revealed')
      playFlipSound()
    }
  }

  const answer = (type) => {
    if (phase !== 'revealed') return
    const wasLastCard = deck.length === 0
    if (type === 'known') {
      playCorrectSound()
      setKnown((k) => k + 1); setCorrectStreak((s) => s + 1); setIncorrectStreak(0)
      setReaction(correctReactions[correctStreak % correctReactions.length])
    } else {
      setDeck((d) => [...d, current]); setCorrectStreak(0); setIncorrectStreak((s) => s + 1); setAlmostStreak((s) => s + 1)
      setReaction(type === 'almost' ? almostReactions[almostStreak % almostReactions.length] : incorrectReactions[incorrectStreak % incorrectReactions.length])
    }
    setCurrent(null); setPhase('ready')
    if (wasLastCard && type === 'known') window.setTimeout(() => setScreen('done'), 1400)
  }

  const speak = (text, lang = 'fr-FR') => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang; utterance.rate = 0.82
    window.speechSynthesis.speak(utterance)
  }

  const category = categories.find((c) => c.id === categoryId)
  const progress = total > 0 ? Math.round((known / (total + known)) * 100) : 0

  return (
    <>
      <AnimatePresence mode="wait">
        {screen === 'select' && <motion.section key="select" className="panel selection" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
          <button className="back" aria-label="Retour aux catégories" title="Retour aux catégories" onClick={() => setScreen('category')}>←</button>
          <div className="eyebrow">ÉTAPE 3 SUR 3</div><h1>Choisis ton <em>mode</em></h1>
          <p className="intro">Dans quel sens veux-tu réviser? <em>¿En qué sentido quieres repasar?</em></p>
          <div className="mode-grid">{modes.map((m) => <button key={m.id} className={`mode ${mode === m.id ? 'selected' : ''}`} onClick={() => pickMode(m.id)}>
            <span className="mode-icons">{m.icon
              ? <span className="mode-icon">{m.icon}</span>
              : <><Flag code={m.from} className="mode-flag" /><i className="mode-arrow">→</i><Flag code={m.to} className="mode-flag" /></>}</span>
            <small>{m.hint}</small>
          </button>)}</div>
        </motion.section>}
        {screen === 'group' && <motion.section key="group" className="panel selection" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
          <div className="eyebrow">ÉTAPE 1 SUR 3</div><h1>Choisis un <em>thème</em></h1>
          <p className="intro">Chaque thème regroupe ses propres catégories de cartes.</p>
          <div className="category-grid">{groups.map((g) => {
            const count = g.subcategories.reduce((sum, subId) => sum + words.filter((word) => word.category === subId).length, 0)
            return <button key={g.id} className={`category ${g.color} ${count === 0 ? 'unavailable' : ''}`} disabled={count === 0} onClick={() => pickGroup(g.id)}>
              <span className="category-icon">{g.icon}</span><span>{g.label}</span>{count > 0 && <i>→</i>}<small>{count > 0 ? `${count} mots` : 'Bientôt !'}</small>
            </button>
          })}</div>
        </motion.section>}
        {screen === 'category' && groupId && <motion.section key="category" className="panel selection" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
          <button className="back" aria-label="Retour aux thèmes" title="Retour aux thèmes" onClick={() => setScreen('group')}>←</button>
          <div className="eyebrow">ÉTAPE 2 SUR 3</div><h1>Choisis une <em>catégorie</em></h1>
          <p className="intro"></p>
          <div className="category-grid">{groups.find((g) => g.id === groupId).subcategories.map((subId) => {
            const c = categories.find((cat) => cat.id === subId)
            if (!c) return null
            const count = words.filter((word) => word.category === c.id).length
            return <button key={c.id} className={`category ${c.color}`} onClick={() => pickCategory(c.id)}>
              <span className="category-icon">{c.icon}</span><span>{c.label}</span><i>→</i><small>{count} mots</small>
            </button>
          })}</div>
        </motion.section>}
        {screen === 'game' && category && <motion.section key="game" className="game-layout" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }}>
          <div className="game-top"><button className="back" onClick={goHome}>← Menu</button><span>{category.icon} {category.label} · {known}/{words.filter((word) => word.category === categoryId).length}</span></div>
          <div className="progress"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} /></div>
          <div className="table-zone" onClick={advance}>
            <Deck count={total} disabled={!current && phase !== 'ready'} onClick={advance} />
            <div className="stage">
              <AnimatePresence mode="wait">
                {current ? <motion.div key={current.key} className="stage-card" initial={{ x: -460, y: -30, rotate: -16, opacity: 0, scale: 0.85 }} animate={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }} exit={{ x: 420, rotate: 14, opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 210, damping: 24 }}>
                  <PokerCard card={current} revealed={phase === 'revealed'} onSpeak={speak} />
                  <AnimatePresence>{phase === 'revealed' && <motion.div key="actions" className="actions" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} onClick={(event) => event.stopPropagation()}>
                    <button className="action known" onClick={() => answer('known')}>✓ Je le savais !</button>
                    <button className="action almost" onClick={() => answer('almost')}>≈ Presque…</button>
                    <button className="action unknown" onClick={() => answer('unknown')}>✗ Je ne savais pas</button>
                  </motion.div>}</AnimatePresence>
                </motion.div> : <motion.p key="hint" className="empty-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Clique pour tirer une carte / Tocá para sacar una carta</motion.p>}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>}
        {screen === 'done' && <motion.section key="done" className="panel finish" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="confetti">✦　✦　✦</div><img src={`/avatar/${encodeURIComponent('Bravo !.png')}`} alt="Photo de la professeure : Bravo !" /><div className="eyebrow">FÉLICITATIONS</div><h1>Bravo ! <em>Tu as terminé</em></h1><p>{known} carte{known > 1 ? 's' : ''} maîtrisée{known > 1 ? 's' : ''}. À la prochaine !</p><div className="finish-actions"><button className="secondary" onClick={goHome}>Home <span>♦</span></button><button className="primary" onClick={replay}>Rejouer <span>↻</span></button></div>
        </motion.section>}
      </AnimatePresence>
      <AnimatePresence>{screen === 'game' && reaction && <Teacher key={reaction.message} reaction={reaction} />}</AnimatePresence>
    </>
  )
}
