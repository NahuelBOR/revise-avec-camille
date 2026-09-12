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
  const [selected, setSelected] = useState(new Set())
  const [activeReminder, setActiveReminder] = useState(null)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [pendingStart, setPendingStart] = useState(null)
  const [currentSubcategoryId, setCurrentSubcategoryId] = useState(null)

  const total = useMemo(() => queue.length + (current ? 1 : 0), [queue, current])
  const goHome = () => onBack()

  const isMulti = current && Array.isArray(current.correctAnswer) && current.correctAnswer.length > 1
  const isCorrectOption = (choice, q) => Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(choice) : choice === q.correctAnswer
  const firstCorrect = (q) => Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer

  const loadQuestion = (nextQueue) => {
    const [next, ...rest] = nextQueue
    if (!next) { setCurrent(null); setScreen('done'); return }
    setCurrent(next); setQueue(rest); setOptions(shuffle(next.options)); setFeedback(null); setReaction(null); setSelected(new Set())
  }

  const startGame = (subcategoryId = null, targetCategory = selectedCategory) => {
    const cat = targetCategory || selectedCategory
    if (!cat) return
    setCurrentSubcategoryId(subcategoryId)
    const list = questions.filter((q) => q.category === cat.id && (!subcategoryId || q.subcategory === subcategoryId))
    const hasMultiplePrompts = list.some((q, idx, arr) => idx > 0 && q.prompt !== arr[idx - 1].prompt)
    let picked
    if (hasMultiplePrompts) {
      const groups = []
      let currentGroup = []
      let currentPrompt = list[0]?.prompt
      list.forEach((q) => {
        if (q.prompt !== currentPrompt) {
          groups.push(currentGroup)
          currentGroup = []
          currentPrompt = q.prompt
        }
        currentGroup.push(q)
      })
      if (currentGroup.length) groups.push(currentGroup)
      picked = groups.flatMap((grp) => shuffle(grp))
    } else {
      picked = shuffle(list)
    }
    setTotalQuestions(picked.length); setCorrectAnswers(0); setCorrectStreak(0); setIncorrectStreak(0); setScreen('game'); loadQuestion(picked)
  }

  const selectCategory = (category) => {
    setSelectedCategory(category)
    if (!category.subcategories || category.subcategories.length === 0) {
      if (category.reminder) {
        setActiveReminder(category.reminder)
        setPendingStart({ subcategoryId: null, category })
        setShowReminderModal(true)
      } else {
        setActiveReminder(null)
        startGame(null, category)
      }
    } else {
      setScreen('subcategories')
    }
  }

  const selectSubcategory = (subcategory) => {
    if (subcategory.reminder) {
      setActiveReminder(subcategory.reminder)
      setPendingStart({ subcategoryId: subcategory.id, category: selectedCategory })
      setShowReminderModal(true)
    } else {
      setActiveReminder(null)
      startGame(subcategory.id, selectedCategory)
    }
  }

  const closeReminderModal = () => {
    setShowReminderModal(false)
    if (pendingStart) {
      const { subcategoryId, category } = pendingStart
      setPendingStart(null)
      startGame(subcategoryId, category)
    }
  }

  // Single-answer mode
  const answer = (choice) => {
    if (feedback) return
    const correct = isCorrectOption(choice, current)
    setFeedback({ choice, correct })
    if (correct) {
      setReaction(correctReactions[correctStreak % correctReactions.length])
      setCorrectStreak((streak) => streak + 1); setIncorrectStreak(0); setCorrectAnswers((count) => count + 1)
    } else {
      setReaction(incorrectReactions[incorrectStreak % incorrectReactions.length])
      setIncorrectStreak((streak) => streak + 1); setCorrectStreak(0)
    }
    const delay = current?.explanation ? (correct ? 2800 : 3800) : (correct ? 1350 : 1650)
    window.setTimeout(() => loadQuestion(correct ? queue : [...queue, current]), delay)
  }

  // Multi-select mode
  const toggleSelect = (option) => {
    if (feedback) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(option)) next.delete(option)
      else next.add(option)
      return next
    })
  }

  const validateMulti = () => {
    if (feedback || selected.size === 0) return
    const correctSet = new Set(current.correctAnswer)
    const allCorrectSelected = [...correctSet].every((c) => selected.has(c))
    const noIncorrectSelected = [...selected].every((s) => correctSet.has(s))
    const correct = allCorrectSelected && noIncorrectSelected
    setFeedback({ selected: [...selected], correct, isMulti: true })
    if (correct) {
      setReaction(correctReactions[correctStreak % correctReactions.length])
      setCorrectStreak((s) => s + 1); setIncorrectStreak(0); setCorrectAnswers((c) => c + 1)
    } else {
      setReaction(incorrectReactions[incorrectStreak % incorrectReactions.length])
      setIncorrectStreak((s) => s + 1); setCorrectStreak(0)
    }
    const delay = current?.explanation ? (correct ? 2800 : 3800) : (correct ? 1350 : 1650)
    window.setTimeout(() => loadQuestion(correct ? queue : [...queue, current]), delay)
  }

  const handleOptionClick = (option) => {
    if (isMulti) toggleSelect(option)
    else answer(option)
  }

  const speak = (text) => {
    if (!('speechSynthesis' in window) || !text) return
    window.speechSynthesis.cancel()
    const cleanText = text.replace(/\([^)]*\)/g, '').replace(/\//g, ' ou ').trim()
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'fr-FR'; utterance.rate = 0.82
    window.speechSynthesis.speak(utterance)
  }

  const goToCategories = () => {
    setSelectedCategory(null)
    setActiveReminder(null)
    setPendingStart(null)
    setScreen('select')
  }

  useEffect(() => { if (screen === 'game' && !current && queue.length === 0) setScreen('done') }, [screen, current, queue])

  // Compute option state for rendering
  const getOptionState = (option) => {
    if (!feedback) {
      if (isMulti && selected.has(option)) return 'selected'
      return ''
    }
    if (feedback.isMulti) {
      if (isCorrectOption(option, current)) return 'right'
      if (selected.has(option)) return 'wrong'
      return ''
    }
    // Single-answer feedback
    if (isCorrectOption(option, current)) return 'right'
    if (option === feedback.choice) return 'wrong'
    return ''
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {screen === 'select' && <motion.section key="select" className="panel selection" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
          <button className="back" onClick={onBack} aria-label="Retour aux jeux">←</button>
          <div className="eyebrow">UN PETIT JEU DE VOCABULAIRE</div><h1>Choisis une <em>catégorie</em></h1>
          <p className="intro">Chaque catégorie contient des petits thèmes. Choisis celui que tu veux explorer aujourd'hui.</p>
          <div className="category-grid">{categories.map((category) => <button key={category.id} className={`category ${category.color}`} onClick={() => selectCategory(category)}>
            <span className="category-icon">{category.icon}</span><span>{category.label}</span><i>→</i>
          </button>)}</div>
        </motion.section>}
        {screen === 'subcategories' && selectedCategory && <motion.section key="subcategories" className="panel selection" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
          <button className="back" onClick={goToCategories}>← Toutes les catégories</button><div className="eyebrow">{selectedCategory.label.toUpperCase()}</div><h1>Choisis un <em>thème</em></h1>
          <p className="intro">Chaque thème démarre son propre jeu de vocabulaire.</p>
          <div className="category-grid subcategory-grid">{(selectedCategory.subcategories || []).map((subcategory) => { const questionCount = questions.filter((question) => question.category === selectedCategory.id && question.subcategory === subcategory.id).length
            return <button key={subcategory.id} disabled={!questionCount} className={`category ${selectedCategory.color} ${!questionCount ? 'unavailable' : ''}`} onClick={() => selectSubcategory(subcategory)}>
            <span className="category-icon">{subcategory.icon}</span><span>{subcategory.label}</span><i>{questionCount ? '→' : '…'}</i><small>{questionCount ? `${questionCount} mots` : 'Bientôt disponible'}</small>
          </button> })}</div>
        </motion.section>}
        {screen === 'game' && current && <motion.section key={current.id} className="game-layout" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }}>
          <div className="game-top">
            <button className="back" onClick={goToCategories} aria-label="Retour aux catégories">←</button>
            <span>À toi de jouer</span>
            <span>{total} carte{total > 1 ? 's' : ''} restante{total > 1 ? 's' : ''}</span>
            {activeReminder && (
              <button className="reminder-pill" onClick={() => setShowReminderModal(true)}>
                💡 Rappel
              </button>
            )}
          </div>
          <div className="progress" aria-label={`${correctAnswers} de ${totalQuestions} respuestas correctas`}><motion.div initial={{ width: 0 }} animate={{ width: `${totalQuestions ? (correctAnswers / totalQuestions) * 100 : 0}%` }} /></div>
          <div className="question-card"><div className="prompt">{current.prompt || "Comment ça s'appelle?"}</div><motion.div className="image-card" animate={feedback?.correct ? { scale: [1, 1.04, 1] } : feedback ? { x: [0, -10, 10, -7, 0] } : {}}>
            {(current.displayNumber !== undefined || current.displayWord) ? (
              <div className="number-card-display">
                <span className={`number-val ${String(current.displayNumber || current.displayWord || '').length > 9 ? 'compact-num' : ''} ${current.displayWord ? 'word-val' : ''}`}>{current.displayNumber ?? current.displayWord}</span>
                {current.subtitle && <span className="word-subtitle">{current.subtitle}</span>}
              </div>
            ) : (
              <img src={current.image} alt={current.alt} />
            )}
          </motion.div>
            {isMulti && !feedback && <div className="multi-notice">⚠️ Plusieurs réponses possibles — sélectionne <strong>toutes</strong> les bonnes réponses</div>}
            <button className="listen" onClick={() => speak(current.displayWord || firstCorrect(current))} aria-label={`Écouter la prononciation`}>🔊 Écouter la prononciation</button>
            <div className="answers">{options.map((option, index) => { const state = getOptionState(option)
              return <motion.button whileTap={{ scale: .98 }} key={option} className={`answer ${state}`} onClick={() => handleOptionClick(option)}><b>{String.fromCharCode(65 + index)}</b>{option}{state === 'right' && <strong>✓</strong>}{state === 'wrong' && <strong>×</strong>}{state === 'selected' && <strong>●</strong>}</motion.button> })}</div>
            {isMulti && !feedback && <motion.button className="validate-btn" whileTap={{ scale: .96 }} disabled={selected.size === 0} onClick={validateMulti} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>Valider ✓</motion.button>}
            {feedback && (
              <div className={`feedback ${feedback.correct ? 'good' : 'bad'}`}>
                {feedback.correct ? (
                  'Très bien !'
                ) : feedback.isMulti ? (
                  <>Les bonnes réponses sont : <b>{current.correctAnswer.join(', ')}</b></>
                ) : (
                  <>La bonne réponse est : <b>{firstCorrect(current)}</b></>
                )}
                {current.explanation && (
                  <div className="feedback-explanation">
                    💡 {current.explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.section>}
        {screen === 'done' && <motion.section key="done" className="panel finish" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="confetti">✦　✦　✦</div><img src={`/avatar/${encodeURIComponent('Bravo !.png')}`} alt="Photo de la professeure : Bravo !" /><div className="eyebrow">FÉLICITATIONS</div><h1>Bravo ! <em>Tu as terminé</em></h1><p>Tu as revu tous les mots. À la prochaine aventure !</p>
          <div className="finish-actions">
            <button className="secondary" onClick={goToCategories}>Catégories <span>←</span></button>
            <button className="primary" onClick={() => {
              if (selectedCategory) {
                startGame(currentSubcategoryId, selectedCategory)
              } else {
                goToCategories()
              }
            }}>Rejouer <span>↻</span></button>
          </div>
        </motion.section>}
      </AnimatePresence>
      <AnimatePresence>{screen === 'game' && reaction && <Teacher key={reaction.message} reaction={reaction} />}</AnimatePresence>

      <AnimatePresence>
        {showReminderModal && activeReminder && (
          <motion.div
            className="plus-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeReminderModal}
          >
            <motion.div
              className="plus-modal-content flashcard-reminder-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{activeReminder.icon || '💡'} {activeReminder.title}</h2>
                <button
                  className="modal-close"
                  onClick={closeReminderModal}
                >
                  ✕
                </button>
              </div>

              <div className="reminder-modal-body">
                <p className="reminder-modal-subtitle">
                  À retenir avant de commencer / <em>A tener en cuenta antes de empezar:</em>
                </p>
                <ul className="reminder-points-list">
                  {activeReminder.points.map((pt, i) => (
                    <li key={i}>
                      <span className="point-bullet">📌</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className="primary modal-done-btn"
                onClick={closeReminderModal}
              >
                {pendingStart ? "C'est parti ! →" : "Fermer"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
