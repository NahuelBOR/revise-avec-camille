export const plusRules = {
  title: 'RAPPEL : La prononciation de PLUS',
  intro: 'Ce n’est pas seulement : PLUS (« más ») = le S se prononce / PLUS (« no más ») = le S ne se prononce pas. Ça serait trop simple sinon ! Évidemment, il y a des exceptions.',
  rows: [
    {
      id: 'no-mas',
      meaningHeader: '“No más”',
      subcases: [],
      pronType: 'silent', // PLU[S red], ❌ ne se prononce pas.
      examples: [
        { text: "Je n’ai plu", sColor: 'red', afterText: " de batterie." }
      ]
    },
    {
      id: 'mas-comp',
      meaningHeader: '“más” :',
      subcases: [
        { text: '.plus + de + número' },
        { text: 'dans une comparaison', isSubHeader: true },
        { text: '. plus + adjectif/adverbe' }
      ],
      pronType: 'silent', // PLU[S red], ❌ ne se prononce pas.
      examples: [
        { text: "Il fait plu", sColor: 'red', afterText: " de 20 degrés.", isItalic: true },
        { text: "Il est plu", sColor: 'red', afterText: " fort que toi.", isItalic: true },
        { text: "Elle travaille plu", sColor: 'red', afterText: " souvent.", isItalic: true }
      ]
    },
    {
      id: 'mas-autres',
      meaningHeader: '“más”',
      subcases: [
        { text: 'dans tous les autres cas' }
      ],
      pronType: 'sounded', // PLU[S green], ✅ se prononce.
      examples: [
        { text: "Il a plu", sColor: 'green', afterText: " de chance que toi.", isItalic: true },
        { text: "J’en veux plu", sColor: 'green', afterText: ".", note: " → Quiero más.", isItalic: true },
        { text: "En plu", sColor: 'green', afterText: "", note: " → además", isItalic: true }
      ]
    },
    {
      id: 'voyelle',
      meaningHeader: 'Devant une voyelle',
      subcases: [
        { text: '→ liaison' }
      ],
      pronType: 'liaison', // ⚠️ se prononce Z, S → Z
      examples: [
        { text: "plu", sLiaison: "s‿ou", afterText: " moins", isItalic: true }
      ]
    }
  ]
}

export const plusQuestions = [
  {
    id: 1,
    sentence: "C’est plus intéressant que ce que je pensais.",
    options: [
      { key: 'a', label: 'S ne se prononce pas', symbol: '' },
      { key: 'b', label: 'S se prononce [S]', symbol: '' },
      { key: 'c', label: 'S se prononce [Z]', symbol: '' }
    ],
    correctAnswer: 'c',
    explanation: "«Il y a une liaison : « intéressant » commence par une voyelle → plus‿intéressant."
  },
  {
    id: 2,
    sentence: "Je ne veux plus de café, merci.",
    options: [
      { key: 'a', label: 'S ne se prononce pas', symbol: '' },
      { key: 'b', label: 'S se prononce [S]', symbol: '' },
      { key: 'c', label: 'S se prononce [Z]', symbol: '' }
    ],
    correctAnswer: 'a',
    explanation: "« plus » signifie « no más »."
  },
  {
    id: 3,
    sentence: "Il court plus vite que moi.",
    options: [
      { key: 'a', label: 'S ne se prononce pas', symbol: '' },
      { key: 'b', label: 'S se prononce [S]', symbol: '' },
      { key: 'c', label: 'S se prononce [Z]', symbol: '' }
    ],
    correctAnswer: 'a',
    explanation: "« plus » est suivi d’un adverbe dans une comparaison."
  },
  {
    id: 4,
    sentence: "J'ai plus de chance que Zoé.",
    options: [
      { key: 'a', label: 'S ne se prononce pas', symbol: '' },
      { key: 'b', label: 'S se prononce [S]', symbol: '' },
      { key: 'c', label: 'S se prononce [Z]', symbol: '' }
    ],
    correctAnswer: 'b',
    explanation: "« plus » signifie « más » et est suivi d’un nom (« chance »)."
  },
  {
    id: 5,
    sentence: "Elle est plus intelligente que lui.",
    options: [
      { key: 'a', label: 'S ne se prononce pas', symbol: '' },
      { key: 'b', label: 'S se prononce [S]', symbol: '' },
      { key: 'c', label: 'S se prononce [Z]', symbol: '' }
    ],
    correctAnswer: 'c',
    explanation: "Il y a une liaison : «intelligente » commence par une voyelle → plus‿intelligente."
  },
  {
    id: 6,
    sentence: "Il n’habite plus en France.",
    options: [
      { key: 'a', label: 'S ne se prononce pas', symbol: '' },
      { key: 'b', label: 'S se prononce [S]', symbol: '' },
      { key: 'c', label: 'S se prononce [Z]', symbol: '' }
    ],
    correctAnswer: 'a',
    explanation: "« plus » signifie « no más »."
  },
  {
    id: 7,
    sentence: "C’est plus agréable en été.",
    options: [
      { key: 'a', label: 'S ne se prononce pas', symbol: '' },
      { key: 'b', label: 'S se prononce [S]', symbol: '' },
      { key: 'c', label: 'S se prononce [Z]', symbol: '' }
    ],
    correctAnswer: 'c',
    explanation: "Il y a une liaison : «agréable » commence par une voyelle → plus‿agréable."
  },
  {
    id: 8,
    sentence: "J’en veux plus, s’il te plaît !",
    options: [
      { key: 'a', label: 'S ne se prononce pas', symbol: '' },
      { key: 'b', label: 'S se prononce [S]', symbol: '' },
      { key: 'c', label: 'S se prononce [Z]', symbol: '' }
    ],
    correctAnswer: 'b',
    explanation: "« plus » signifie « más », sans exception de « plus de + nombre » ni de comparaison avec un adjectif ou un adverbe."
  },
  {
    id: 9,
    sentence: "Elle parle plus ou moins bien français.",
    options: [
      { key: 'a', label: 'S ne se prononce pas', symbol: '' },
      { key: 'b', label: 'S se prononce [S]', symbol: '' },
      { key: 'c', label: 'S se prononce [Z]', symbol: '' }
    ],
    correctAnswer: 'c',
    explanation: "Il y a une liaison : « ou » commence par une voyelle → plus‿ou."
  },
  {
    id: 10,
    sentence: "Tu ne travailles plus avec lui ?",
    options: [
      { key: 'a', label: 'S ne se prononce pas', symbol: '' },
      { key: 'b', label: 'S se prononce [S]', symbol: '' },
      { key: 'c', label: 'S se prononce [Z]', symbol: '' }
    ],
    correctAnswer: 'a',
    explanation: "« plus » signifie « no más »."
  }
]
