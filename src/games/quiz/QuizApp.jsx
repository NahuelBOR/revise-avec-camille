import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { categories, questions } from './data/questions'
import Teacher from '../../components/Teacher'

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5)

const correctReactions = [
  { message: 'OK !', file: 'OK !.png' },
  { message: 'Parfait !', file: 'Parfait !.png' },
  { message: 'Bravo !', file: 'Bravo !.png' },
]

const incorrectReactions = [
  { message: 'Mmh... tu es sûr(e)', file: 'Mmh... tu es sûr(e).png' },
  { message: 'Ouh là, non !', file: 'Ouh la non.png' },
  { message: 'Sans commentaire...', file: 'Sans commentaire....png' },
]

export default function QuizApp({ onBack }) {
  const [screen, setScreen] = useState('select')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(null)
  const [options, setOptions] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [reaction, setReaction] = useState(null)
  const [correctStreak, setCorrectStreak] = useState(0)
  const [incorrectStreak, setIncorrectStreak] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)

  const total = useMemo(() => queue.length + (current ? 1 : 0), [queue, current])
  const goHome = () => onBack()

  const loadQuestion = (nextQueue) => {
    const [next, ...rest] = nextQueue
    if (!next) { setCurrent(null); setScreen('done'); return }
    setCurrent(next); setQueue(rest); setOptions(shuffle(next.options)); setFeedback(null); setReaction(null)
  }

  const startGame = (subcategoryId) => {
    const picked = shuffle(questions.filter((q) => q.category === selectedCategory.id && q.subcategory === subcategoryId))
    setTotalQuestions(picked.length); setCorrectAnswers(0); setCorrectStreak(0); setIncorrectStreak(0); setScreen('game'); loadQuestion(picked)
  }

  const answer = (choice) => {
    if (feedback) return
    const correct = choice === current.correctAnswer
    setFeedback({ choice, correct })
    if (correct) {
      setReaction(correctReactions[correctStreak % correctReactions.length])
      setCorrectStreak((streak) => streak + 1); setIncorrectStreak(0); setCorrectAnswers((count) => count + 1)
    } else {
      setReaction(incorrectReactions[incorrectStreak % incorrectReactions.length])
      setIncorrectStreak((streak) => streak + 1); setCorrectStreak(0)
    }
    window.setTimeout(() => loadQuestion(correct ? queue : [...queue, current]), correct ? 1350 : 1650)
  }

  const speak = (word) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'fr-FR'; utterance.rate = 0.82
    window.speechSynthesis.speak(utterance)
  }

  const goToCategories = () => { setSelectedCategory(null); setScreen('select') }

  useEffect(() => { if (screen === 'game' && !current && queue.length === 0) setScreen('done') }, [screen, current, queue])

  return (
    <>
      <AnimatePresence mode="wait">
        {screen === 'select' && <motion.section key="select" className="panel selection" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
          <div className="eyebrow">UN PETIT JEU DE VOCABULAIRE</div><h1>Choisis une <em>catégorie</em></h1>
          <p className="intro">Chaque catégorie contient des petits thèmes. Choisis celui que tu veux explorer aujourd'hui.</p>
          <div className="category-grid">{categories.map((category) => <button key={category.id} className={`category ${category.color}`} onClick={() => { setSelectedCategory(category); setScreen('subcategories') }}>
            <span className="category-icon">{category.icon}</span><span>{category.label}</span><i>→</i>
          </button>)}</div>
        </motion.section>}
        {screen === 'subcategories' && selectedCategory && <motion.section key="subcategories" className="panel selection" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
          <button className="back" onClick={goToCategories}>← Toutes les catégories</button><div className="eyebrow">{selectedCategory.label.toUpperCase()}</div><h1>Choisis un <em>thème</em></h1>
          <p className="intro">Chaque thème démarre son propre jeu de vocabulaire.</p>
          <div className="category-grid subcategory-grid">{selectedCategory.subcategories.map((subcategory) => { const questionCount = questions.filter((question) => question.category === selectedCategory.id && question.subcategory === subcategory.id).length
            return <button key={subcategory.id} disabled={!questionCount} className={`category ${selectedCategory.color} ${!questionCount ? 'unavailable' : ''}`} onClick={() => startGame(subcategory.id)}>
            <span className="category-icon">{subcategory.icon}</span><span>{subcategory.label}</span><i>{questionCount ? '→' : '…'}</i><small>{questionCount ? `${questionCount} mots` : 'Bientôt disponible'}</small>
          </button> })}</div>
        </motion.section>}
        {screen === 'game' && current && <motion.section key={current.id} className="game-layout" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }}>
          <div className="game-top"><span>À toi de jouer</span><span>{total} carte{total > 1 ? 's' : ''} restante{total > 1 ? 's' : ''}</span></div>
          <div className="progress" aria-label={`${correctAnswers} de ${totalQuestions} respuestas correctas`}><motion.div initial={{ width: 0 }} animate={{ width: `${totalQuestions ? (correctAnswers / totalQuestions) * 100 : 0}%` }} /></div>
          <div className="question-card"><div className="prompt">Comment ça s'appelle?</div><motion.div className="image-card" animate={feedback?.correct ? { scale: [1, 1.04, 1] } : feedback ? { x: [0, -10, 10, -7, 0] } : {}}>
            <img src={current.image} alt={current.alt} /></motion.div>
            <button className="listen" onClick={() => speak(current.correctAnswer)} aria-label={`Écouter la prononciation de ${current.correctAnswer}`}>🔊 Écouter la prononciation</button>
            <div className="answers">{options.map((option, index) => { const state = feedback && (option === current.correctAnswer ? 'right' : option === feedback.choice ? 'wrong' : '')
              return <motion.button whileTap={{ scale: .98 }} key={option} className={`answer ${state || ''}`} onClick={() => answer(option)}><b>{String.fromCharCode(65 + index)}</b>{option}{state === 'right' && <strong>✓</strong>}{state === 'wrong' && <strong>×</strong>}</motion.button> })}</div>
            {feedback && <div className={`feedback ${feedback.correct ? 'good' : 'bad'}`}>{feedback.correct ? 'Très bien !' : <>La bonne réponse est : <b>{current.correctAnswer}</b></>}</div>}</div>
        </motion.section>}
        {screen === 'done' && <motion.section key="done" className="panel finish" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="confetti">✦　✦　✦</div><img src={`/avatar/${encodeURIComponent('Bravo !.png')}`} alt="Photo de la professeure : Bravo !" /><div className="eyebrow">FÉLICITATIONS</div><h1>Bravo ! <em>Tu as terminé</em></h1><p>Tu as revu tous les mots. À la prochaine aventure !</p><button className="primary" onClick={goHome}>Jouer encore <span>↻</span></button>
        </motion.section>}
      </AnimatePresence>
      <AnimatePresence>{screen === 'game' && reaction && <Teacher key={reaction.message} reaction={reaction} />}</AnimatePresence>
    </>
  )
}
