import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { plusRules, plusQuestions } from './data/plusQuestions'
import Teacher from '../../../components/Teacher'

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

// Reusable table component matching the reference design
function PlusRulesTable() {
  return (
    <div className="plus-rules-table-wrapper">
      <table className="plus-rules-table">
        <thead>
          <tr>
            <th>PLUS signifie…</th>
            <th>Prononciation</th>
            <th>Exemple</th>
          </tr>
        </thead>
        <tbody>
          {plusRules.rows.map((row) => (
            <tr key={row.id}>
              {/* Column 1: PLUS signifie… */}
              <td className="rule-meaning-cell">
                <div className="meaning-main">{row.meaningHeader}</div>
                {row.subcases.map((sub, idx) => (
                  <div
                    key={idx}
                    className={`meaning-subcase ${sub.isSubHeader ? 'subcase-header' : ''}`}
                  >
                    {sub.text}
                  </div>
                ))}
              </td>

              {/* Column 2: Prononciation */}
              <td className="rule-pron-cell">
                {row.pronType === 'silent' && (
                  <div className="pron-stack">
                    <span className="pron-word">
                      PLU<span className="letter-s-red">S</span>
                    </span>
                    <span className="pron-desc pron-silent">
                      ❌ ne se prononce pas.
                    </span>
                  </div>
                )}
                {row.pronType === 'sounded' && (
                  <div className="pron-stack">
                    <span className="pron-word">
                      PLU<span className="letter-s-green">S</span>
                    </span>
                    <span className="pron-desc pron-sounded">
                      ✅ se prononce.
                    </span>
                  </div>
                )}
                {row.pronType === 'liaison' && (
                  <div className="pron-stack">
                    <span className="pron-liaison-top">⚠️ se prononce Z</span>
                    <span className="pron-liaison-sub">S → Z</span>
                  </div>
                )}
              </td>

              {/* Column 3: Exemple */}
              <td className="rule-example-cell">
                {row.examples.map((ex, idx) => (
                  <div key={idx} className={`example-line ${ex.isItalic ? 'italic' : ''}`}>
                    {ex.text}
                    {ex.sColor === 'red' && <span className="letter-s-red">s</span>}
                    {ex.sColor === 'green' && <span className="letter-s-green">s</span>}
                    {ex.sLiaison && <strong>{ex.sLiaison}</strong>}
                    {ex.afterText}
                    {ex.note && <span className="example-note">{ex.note}</span>}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PlusApp({ onBack }) {
  const [screen, setScreen] = useState('reminder') // 'reminder' | 'game' | 'done'
  const [showRappelModal, setShowRappelModal] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedback, setFeedback] = useState(null) // { choice, isCorrect }
  const [reaction, setReaction] = useState(null)
  const [correctStreak, setCorrectStreak] = useState(0)
  const [incorrectStreak, setIncorrectStreak] = useState(0)
  const [score, setScore] = useState(0)

  const currentQuestion = plusQuestions[currentIndex]
  const total = plusQuestions.length

  const startGame = () => {
    setCurrentIndex(0)
    setFeedback(null)
    setReaction(null)
    setScore(0)
    setCorrectStreak(0)
    setIncorrectStreak(0)
    setScreen('game')
  }

  const handleAnswer = (choiceKey) => {
    if (feedback) return
    const isCorrect = choiceKey === currentQuestion.correctAnswer
    setFeedback({ choice: choiceKey, isCorrect })

    if (isCorrect) {
      setScore((s) => s + 1)
      setReaction(correctReactions[correctStreak % correctReactions.length])
      setCorrectStreak((s) => s + 1)
      setIncorrectStreak(0)
      setTimeout(() => {
        advanceQuestion()
      }, 1400)
    } else {
      setReaction(incorrectReactions[incorrectStreak % incorrectReactions.length])
      setIncorrectStreak((s) => s + 1)
      setCorrectStreak(0)
    }
  }

  const advanceQuestion = () => {
    if (currentIndex + 1 < total) {
      setCurrentIndex((i) => i + 1)
      setFeedback(null)
      setReaction(null)
    } else {
      setScreen('done')
    }
  }

  // Highlight the word "plus" in the question sentence
  const renderSentence = (sentence) => {
    const parts = sentence.split(/(plus)/i)
    return parts.map((part, idx) =>
      part.toLowerCase() === 'plus' ? (
        <span key={idx} className="plus-highlight">
          {part}
        </span>
      ) : (
        part
      )
    )
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {/* ─── 1. RAPPEL SCREEN (shown first time) ─────────────────────────── */}
        {screen === 'reminder' && (
          <motion.section
            key="reminder"
            className="panel selection plus-reminder-panel"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
          >
            <button className="back" onClick={onBack} aria-label="Retour au menu">
              ←
            </button>
            <div className="eyebrow">RAPPEL</div>
            <h1>
              Prononciation de <em>PLUS</em>
            </h1>
            <div className="plus-intro-notice">
              <p className="intro-line-title">Ce n’est pas seulement :</p>
              <div className="intro-rules-preview">
                <div>
                  PLU<span className="letter-s-green">S</span> (« más ») = le S se prononce
                </div>
                <div>
                  PLU<span className="letter-s-red">S</span> (« no más ») = le S ne se prononce pas
                </div>
              </div>
              <p className="intro-line-foot">
                Ça serait trop simple sinon ! Évidemment, il y a des exceptions. 😉
              </p>
            </div>

            <PlusRulesTable />

            <div className="plus-reminder-actions">
              <motion.button
                className="primary plus-start-btn"
                onClick={startGame}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Jouer !
              </motion.button>
            </div>
          </motion.section>
        )}

        {/* ─── 2. GAME SCREEN (10 Questions) ────────────────────────────── */}
        {screen === 'game' && currentQuestion && (
          <motion.section
            key={`game-${currentQuestion.id}`}
            className="game-layout plus-game-layout"
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -22 }}
          >
            <div className="game-top">
              <button className="back" onClick={onBack}>
                ← Menu
              </button>
              <button className="plus-help-btn" onClick={() => setShowRappelModal(true)}>
                💡 Rappel de règle
              </button>
              <span>
                Question {currentIndex + 1} / {total}
              </span>
            </div>

            <div className="progress" aria-label={`Question ${currentIndex + 1} sur ${total}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + (feedback?.isCorrect ? 1 : 0)) / total) * 100}%` }}
              />
            </div>

            <div className="plus-question-card">
              <div className="eyebrow">PRONONCIATION DE « PLUS »</div>
              <p className="plus-instruction">
                Choisis l’option correcte par rapport à la prononciation de <strong>PLUS</strong> :
                <br />
                <span className="sub-instruction">Elegí la opción correcta según la pronunciación en la frase</span>
              </p>

              <div className="plus-sentence-box">
                <p className="plus-sentence">
                  « {renderSentence(currentQuestion.sentence)} »
                </p>
              </div>

              <div className="plus-options-grid">
                {currentQuestion.options.map((opt) => {
                  let stateClass = ''
                  if (feedback) {
                    if (opt.key === currentQuestion.correctAnswer) {
                      stateClass = 'right'
                    } else if (opt.key === feedback.choice) {
                      stateClass = 'wrong'
                    }
                  }
                  return (
                    <motion.button
                      key={opt.key}
                      className={`plus-option-btn ${stateClass}`}
                      onClick={() => handleAnswer(opt.key)}
                      whileHover={!feedback ? { scale: 1.01, translateY: -2 } : {}}
                      whileTap={!feedback ? { scale: 0.98 } : {}}
                    >
                      <b className="option-letter">{opt.key.toUpperCase()}</b>
                      <span className="option-label">{opt.label}</span>
                      <span className="option-symbol">{opt.symbol}</span>
                      {stateClass === 'right' && <strong className="status-icon">✓</strong>}
                      {stateClass === 'wrong' && <strong className="status-icon">×</strong>}
                    </motion.button>
                  )
                })}
              </div>

              {/* Feedback and Explanation Box */}
              {feedback && (
                <motion.div
                  className={`plus-feedback-box ${feedback.isCorrect ? 'good' : 'bad'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {feedback.isCorrect ? (
                    <div className="feedback-content">
                      <span className="feedback-badge-good">✓ Très bien !</span>
                      <p className="explanation-text">{currentQuestion.explanation}</p>
                    </div>
                  ) : (
                    <div className="feedback-content">
                      <span className="feedback-badge-bad">✗ Pas tout à fait !</span>
                      <p className="explanation-text">
                        <strong>Explication :</strong> {currentQuestion.explanation}
                      </p>
                      <button className="primary next-question-btn" onClick={advanceQuestion}>
                        Continuer →
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.section>
        )}

        {/* ─── 3. FINISH SCREEN ─────────────────────────────────────────── */}
        {screen === 'done' && (
          <motion.section
            key="done"
            className="panel finish plus-finish-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="confetti">✦ ✦ ✦</div>
            <img
              src={`/avatar/${encodeURIComponent('Bravo !.png')}`}
              alt="Photo de la professeure : Bravo !"
            />
            <div className="eyebrow">FÉLICITATIONS</div>
            <h1>
              Bravo ! <em>Tu as terminé</em>
            </h1>
            <p>
              Tu as obtenu <strong>{score} / {total}</strong> réponses correctes sur la prononciation du mot <em>PLUS</em>.
            </p>
            <div className="finish-actions">
              <button className="secondary" onClick={onBack}>
                Retour au menu <span>♦</span>
              </button>
              <button className="primary" onClick={startGame}>
                Rejouer <span>↻</span>
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Teacher Avatar Reaction during quiz */}
      <AnimatePresence>
        {screen === 'game' && reaction && <Teacher key={reaction.message} reaction={reaction} />}
      </AnimatePresence>

      {/* Modal for viewing the Rappel during the game */}
      <AnimatePresence>
        {showRappelModal && (
          <motion.div
            className="plus-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRappelModal(false)}
          >
            <motion.div
              className="plus-modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Rappel : Prononciation de PLUS</h2>
                <button className="modal-close" onClick={() => setShowRappelModal(false)}>
                  ✕
                </button>
              </div>
              <div className="plus-intro-notice">
                <p className="intro-line-title">Ce n’est pas seulement :</p>
                <div className="intro-rules-preview">
                  <div>
                    PLU<span className="letter-s-green">S</span> (« más ») = le S se prononce
                  </div>
                  <div>
                    PLU<span className="letter-s-red">S</span> (« no más ») = le S ne se prononce pas
                  </div>
                </div>
                <p className="intro-line-foot">
                  Ça serait trop simple sinon ! Évidemment, il y a des exceptions. 😉
                </p>
              </div>
              <PlusRulesTable />
              <button className="primary modal-done-btn" onClick={() => setShowRappelModal(false)}>
                Fermer et reprendre
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
