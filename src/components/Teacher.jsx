import { motion } from 'framer-motion'

export default function Teacher({ reaction }) {
  return (
    <motion.div className="teacher" initial={{ opacity: 0, y: 160 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 160 }} transition={{ type: 'spring', stiffness: 240, damping: 20 }}>
      <img src={`/avatar/${encodeURIComponent(reaction.file)}`} alt={`Réaction de la professeure : ${reaction.message}`} />
      <span>{reaction.message}</span>
    </motion.div>
  )
}
