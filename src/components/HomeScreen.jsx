import { motion } from 'framer-motion'

const categories = [
  { id: 'vocabulaire', icon: '📚', title: 'Vocabulaire', desc: 'Flashcards, quiz d\'images et plus', color: 'sky', available: true },
  { id: 'verbes', icon: '✏️', title: 'Verbes', desc: 'Conjugaison et pratique', color: 'peach', available: false },
  { id: 'grammaire', icon: '📐', title: 'Grammaire', desc: 'Règles et exercices', color: 'mint', available: false },
  { id: 'prononciation', icon: '🗣️', title: 'Prononciation', desc: 'Règle du PLUS et sons du français', color: 'lilas', available: true },
  { id: 'expressions', icon: '💬', title: 'Expressions', desc: 'Expressions du quotidien', color: 'peach', available: false },
  { id: 'comprehension-ecrite', icon: '📖', title: 'Compréhension écrite', desc: 'Lis et comprends des textes', color: 'sky', available: false },
  { id: 'comprehension-orale', icon: '🎧', title: 'Compréhension orale', desc: 'Écoute et comprends', color: 'mint', available: false },
]

export default function HomeScreen({ onSelect }) {
  return (
    <motion.section className="panel selection home-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
      <div className="eyebrow">BIENVENUE</div>
      <h1>Révise avec <em>Camille</em></h1>
      <p className="intro">Choisis une matière pour commencer ton apprentissage du français.</p>
      <div className="home-grid home-grid-categories">
        {categories.map((cat, i) => (
          <motion.button
            key={cat.id}
            className={`home-card ${cat.color}`}
            onClick={() => cat.available && onSelect(cat.id)}
            disabled={!cat.available}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 + i * 0.04 }}
            whileHover={cat.available ? { y: -5 } : {}}
            whileTap={cat.available ? { scale: 0.97 } : {}}
          >
            <span className="home-card-icon">{cat.icon}</span>
            <span className="home-card-title">{cat.title}</span>
            <span className="home-card-desc">{cat.desc}</span>
            {cat.available
              ? <span className="home-card-cta">Commencer →</span>
              : <span className="home-card-soon">Bientôt disponible</span>
            }
          </motion.button>
        ))}
      </div>
    </motion.section>
  )
}
