import { motion } from 'framer-motion'

const gamesByCategory = {
  vocabulaire: {
    eyebrow: 'VOCABULAIRE',
    title: 'Choisis ton jeu',
    intro: 'Sélectionne un mode de jeu pour réviser ton vocabulaire.',
    games: [
      {
        id: 'flashcards',
        icon: '🃏',
        title: 'Flashcards',
        subtitle: 'Cartes de vocabulaire',
        description: 'Retourne les cartes pour apprendre le français ↔ espagnol',
        color: 'sky',
      },
      {
        id: 'quiz',
        icon: '🧠',
        title: 'Quiz Vocabulaire',
        subtitle: "Jeu d'images",
        description: 'Identifie les objets en français à partir de photos',
        color: 'peach',
      },
    ]
  },
  prononciation: {
    eyebrow: 'PRONONCIATION',
    title: 'Choisis ton entraînement',
    intro: 'Perfectionne ta prononciation avec nos entraînements ciblés.',
    games: [
      {
        id: 'plus',
        icon: '➕',
        title: 'La règle du PLUS',
        subtitle: 'Prononciation du S',
        description: 'Apprends quand prononcer le S de PLUS : [PLU], [PLUS] ou [PLUZ]',
        color: 'lilas',
      },
    ]
  }
}

export default function GameSelector({ category = 'vocabulaire', onSelect, onBack }) {
  const currentCategoryData = gamesByCategory[category] || gamesByCategory.vocabulaire

  return (
    <motion.section className="panel selection home-panel" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
      <button className="back" onClick={onBack} aria-label="Retour aux catégories">←</button>
      <div className="eyebrow">{currentCategoryData.eyebrow}</div>
      <h1>{currentCategoryData.title.split(' ')[0]} ton <em>{currentCategoryData.title.split(' ').slice(1).join(' ')}</em></h1>
      <p className="intro">{currentCategoryData.intro}</p>
      <div className="home-grid">
        {currentCategoryData.games.map((game, i) => (
          <motion.button
            key={game.id}
            className={`home-card ${game.color}`}
            onClick={() => onSelect(game.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.1 }}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="home-card-icon">{game.icon}</span>
            <span className="home-card-title">{game.title}</span>
            <span className="home-card-subtitle">{game.subtitle}</span>
            <span className="home-card-desc">{game.description}</span>
            <span className="home-card-cta">Jouer →</span>
          </motion.button>
        ))}
      </div>
    </motion.section>
  )
}
