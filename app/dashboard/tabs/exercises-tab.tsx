'use client'

import { useState } from 'react'

import { Search, Filter, Info, Dumbbell } from 'lucide-react'

// Real Database of Premium Exercises
const EXERCISES = [
  {
    id: 'e1',
    category: 'Chest',
    difficulty: 'Intermediate',
    target: 'Pectoralis Major',
    name: { en: 'Barbell Bench Press', hi: 'बारबेल बेंच प्रेस' },
    instructions: {
      en: [
        'Lie on a flat bench with your eyes under the bar.',
        'Grasp the bar with a medium width grip.',
        'Unrack the bar by straightening your arms.',
        'Lower the bar to your mid-chest.',
        'Press the bar back up until your arms are straight.'
      ],
      hi: [
        'फ्लैट बेंच पर लेट जाएं, आंखें बार के ठीक नीचे हों।',
        'मध्यम चौड़ाई वाली ग्रिप के साथ बार को पकड़ें।',
        'बाहों को सीधा करके बार को अनरैक करें।',
        'बार को धीरे-धीरे अपनी मध्य-छाती तक नीचे लाएं।',
        'बाहें सीधी होने तक बार को वापस ऊपर की ओर धकेलें।'
      ]
    },
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif'
  },
  {
    id: 'e2',
    category: 'Shoulder',
    difficulty: 'Beginner',
    target: 'Lateral Deltoid',
    name: { en: 'Dumbbell Lateral Raise', hi: 'डंबल लेटरल रेज़' },
    instructions: {
      en: [
        'Stand tall with a dumbbell in each hand at your sides.',
        'Keep your back straight and core engaged.',
        'Slowly lift the weights out to the side until your arms are parallel with the floor.',
        'Pause at the top, then slowly lower the weights back to the starting position.'
      ],
      hi: [
        'प्रत्येक हाथ में एक डंबल लेकर सीधे खड़े हो जाएं।',
        'अपनी पीठ सीधी रखें और कोर को टाइट रखें।',
        'धीरे-धीरे वज़न को बगल की ओर उठाएं जब तक कि आपकी बाहें फर्श के समानांतर न हो जाएं।',
        'शीर्ष पर रुकें, फिर धीरे-धीरे वज़न को वापस प्रारंभिक स्थिति में लाएं।'
      ]
    },
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif'
  },
  {
    id: 'e3',
    category: 'Legs',
    difficulty: 'Advanced',
    target: 'Quadriceps, Glutes',
    name: { en: 'Barbell Squat', hi: 'बारबेल स्क्वाट' },
    instructions: {
      en: [
        'Stand with feet shoulder-width apart, resting the bar on your upper back.',
        'Brace your core and push your hips back as you bend your knees.',
        'Lower until your thighs are parallel to the floor.',
        'Push through your heels to return to the starting position.'
      ],
      hi: [
        'पैरों को कंधे की चौड़ाई के बराबर खोलकर खड़े हों, बार को ऊपरी पीठ पर रखें।',
        'कोर को कस लें और घुटनों को मोड़ते हुए कूल्हों को पीछे धकेलें।',
        'तब तक नीचे जाएं जब तक आपकी जांघें फर्श के समानांतर न हो जाएं।',
        'प्रारंभिक स्थिति में लौटने के लिए अपनी एड़ियों से जोर लगाएं।'
      ]
    },
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif'
  },
  {
    id: 'e4',
    category: 'Biceps',
    difficulty: 'Beginner',
    target: 'Biceps Brachii',
    name: { en: 'Dumbbell Curl', hi: 'डंबल कर्ल' },
    instructions: {
      en: [
        'Stand holding a dumbbell in each hand, arms fully extended.',
        'Keeping your upper arms stationary, curl the weights while contracting your biceps.',
        'Continue to raise the weights until your biceps are fully contracted.',
        'Slowly bring the dumbbells back to starting position.'
      ],
      hi: [
        'प्रत्येक हाथ में डंबल पकड़कर खड़े रहें, बाहें पूरी तरह से फैली हुई हों।',
        'अपनी ऊपरी बाहों को स्थिर रखते हुए, बाइसेप्स को सिकोड़ते हुए वज़न को कर्ल करें।',
        'बाइसेप्स के पूरी तरह सिकुड़ने तक वज़न को उठाना जारी रखें।',
        'धीरे-धीरे डंबल्स को प्रारंभिक स्थिति में वापस लाना शुरू करें।'
      ]
    },
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif'
  },
  {
    id: 'e5',
    category: 'Core',
    difficulty: 'Beginner',
    target: 'Rectus Abdominis',
    name: { en: 'Crunch', hi: 'क्रंच' },
    instructions: {
      en: [
        'Lie on your back with your knees bent and feet flat on the floor.',
        'Place your hands behind your head or across your chest.',
        'Contract your abs and lift your shoulder blades off the floor.',
        'Slowly lower back down to the starting position.'
      ],
      hi: [
        'अपने घुटनों को मोड़कर और पैरों को फर्श पर सपाट रखकर अपनी पीठ के बल लेट जाएं।',
        'अपने हाथों को अपने सिर के पीछे या अपनी छाती पर रखें।',
        'अपने एब्स को सिकोड़ें और अपने कंधे के ब्लेड को फर्श से ऊपर उठाएं।',
        'धीरे-धीरे वापस प्रारंभिक स्थिति में नीचे आएं।'
      ]
    },
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Crunch.gif'
  },
  {
    id: 'e6',
    category: 'Triceps',
    difficulty: 'Beginner',
    target: 'Triceps Brachii',
    name: { en: 'Triceps Pushdown', hi: 'ट्राइसेप्स पुशडाउन' },
    instructions: {
      en: [
        'Attach a straight or angled bar to a high pulley and grab with an overhand grip.',
        'Standing upright with the torso straight, bring the upper arms close to your body.',
        'Using the triceps, bring the bar down until it touches the front of your thighs.',
        'Slowly return the bar to the starting position.'
      ],
      hi: [
        'एक उच्च चरखी (पुली) में एक सीधा या कोणीय बार संलग्न करें और ओवरहैंड ग्रिप से पकड़ें।',
        'धड़ को सीधा रखते हुए सीधे खड़े हों, ऊपरी बाहों को अपने शरीर के करीब लाएं।',
        'ट्राइसेप्स का उपयोग करते हुए, बार को तब तक नीचे लाएं जब तक कि वह आपकी जांघों के सामने न छू जाए।',
        'धीरे-धीरे बार को प्रारंभिक स्थिति में लौटाएं।'
      ]
    },
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pushdown.gif'
  }
]

const CATEGORIES = ['All', 'Chest', 'Shoulder', 'Legs', 'Biceps', 'Triceps', 'Core']

export function ExercisesTab() {
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)

  const filteredExercises = EXERCISES.filter(ex => {
    const matchesCategory = activeCategory === 'All' || ex.category === activeCategory
    const matchesSearch = ex.name[lang].toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-border/50 pb-6">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
            <Dumbbell className="w-6 h-6 text-primary" />
            Exercise Library
          </h2>
          <p className="text-sm text-muted-foreground">Master your form with our expert-curated movement database.</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          {/* Language Toggle */}
          <div className="bg-muted/50 p-1 rounded-lg flex items-center border border-border/50 w-full sm:w-auto justify-center">
            <button
              onClick={() => setLang('en')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-sm font-medium transition-all ${lang === 'en' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              English
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-sm font-medium transition-all ${lang === 'hi' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              हिंदी (Hindi)
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search exercises...' : 'व्यायाम खोजें...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-card border border-border/50 rounded-xl pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 w-full transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${activeCategory === cat ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-card text-muted-foreground border border-border/50 hover:border-primary/30 hover:text-foreground'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
          {filteredExercises.map(ex => (
            <div
              key={ex.id}
              className={`bg-card/50 backdrop-blur-xs border border-border/50 rounded-3xl overflow-hidden cursor-pointer group hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 ${selectedExercise === ex.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background bg-card' : ''}`}
              onClick={() => setSelectedExercise(selectedExercise === ex.id ? null : ex.id)}
            >
              {/* Media (GIF/Video) */}
              <div className={`h-48 w-full relative bg-white flex items-center justify-center overflow-hidden border-b border-border/50`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ex.gifUrl} alt={ex.name[lang]} className="absolute inset-0 w-full h-full object-contain p-2 mix-blend-multiply opacity-90 group-hover:opacity-100 transition-all z-0 scale-110 group-hover:scale-125" />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10" />
                <div className="absolute bottom-3 left-3 z-20">
                  <span className="px-2.5 py-1 rounded bg-background/80 backdrop-blur border border-border text-[10px] font-bold text-foreground uppercase tracking-wider shadow-sm">
                    {ex.target}
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-foreground leading-tight pr-4">
                    {ex.name[lang]}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    ex.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-500' :
                    ex.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-destructive/10 text-destructive'
                  }`}>
                    {ex.difficulty}
                  </span>
                </div>

                
                  {selectedExercise === ex.id ? (
                    <div
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-border/50 space-y-3">
                        {ex.instructions[lang].map((step, idx) => (
                          <div key={idx} className="flex gap-3 text-sm text-muted-foreground">
                            <span className="font-mono text-primary font-medium shrink-0">{idx + 1}.</span>
                            <p>{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-4 py-2.5 rounded-xl border border-border/30 group-hover:bg-muted/50 group-hover:text-foreground transition-colors"
                    >
                      <Info className="w-4 h-4 text-primary" />
                      <span className="font-medium">{lang === 'en' ? 'Click to view instructions' : 'निर्देश देखने के लिए क्लिक करें'}</span>
                    </div>
                  )}
                
              </div>
            </div>
          ))}
        
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>{lang === 'en' ? 'No exercises found for your search.' : 'आपकी खोज के लिए कोई व्यायाम नहीं मिला।'}</p>
        </div>
      )}
    </div>
  )
}
