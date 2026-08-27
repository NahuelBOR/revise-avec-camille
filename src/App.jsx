import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import HomeScreen from './components/HomeScreen'
import GameSelector from './components/GameSelector'
import FlashCardsApp from './games/flashcards/FlashCardsApp'
import QuizApp from './games/quiz/QuizApp'
import PlusApp from './games/prononciation/plus/PlusApp'

function App() {
  const [currentCategory, setCurrentCategory] = useState(null)
  const [currentGame, setCurrentGame] = useState(null)

  const goHome = () => {
    setCurrentCategory(null)
    setCurrentGame(null)
  }

  const goBackToCategory = () => {
    setCurrentGame(null)
  }

  return (
    <main className="app-shell">
      <div className="sun" />
      <div className="stripe stripe-blue" />
      <div className="stripe stripe-red" />
      <header>
        <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); goHome() }}>
          <span>✦</span> Apprenons le français
        </a>
        <p>Apprenons le français en jouant</p>
      </header>
      <AnimatePresence mode="wait">
        {!currentCategory && !currentGame && (
          <HomeScreen key="home" onSelect={setCurrentCategory} />
        )}
        {currentCategory === 'vocabulaire' && !currentGame && (
          <GameSelector
            key="games-vocabulaire"
            category="vocabulaire"
            onSelect={setCurrentGame}
            onBack={goHome}
          />
        )}
        {currentCategory === 'prononciation' && !currentGame && (
          <GameSelector
            key="games-prononciation"
            category="prononciation"
            onSelect={setCurrentGame}
            onBack={goHome}
          />
        )}
        {currentGame === 'flashcards' && (
          <FlashCardsApp key="flashcards" onBack={goBackToCategory} />
        )}
        {currentGame === 'quiz' && (
          <QuizApp key="quiz" onBack={goBackToCategory} />
        )}
        {currentGame === 'plus' && (
          <PlusApp key="plus" onBack={goBackToCategory} />
        )}
      </AnimatePresence>
      <footer>Francés por una francesa <span>-</span> el francés de la vida real</footer>
    </main>
  )
}

export default App
