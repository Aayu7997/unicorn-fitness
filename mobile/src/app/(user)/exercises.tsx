import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, TextInput, Image, Modal } from 'react-native';
import { Dumbbell, Search, ChevronRight, X, Flame, Award, Globe, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import * as Haptics from 'expo-haptics';

// Curated Exercise Database matching Web App
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
        'Slowly lift the weights out to the side until arms are parallel with the floor.',
        'Pause at the top, then slowly lower the weights back to starting position.'
      ],
      hi: [
        'प्रत्येक हाथ में एक डंबल लेकर सीधे खड़े हो जाएं।',
        'अपनी पीठ सीधी रखें और कोर को टाइट रखें।',
        'धीरे-धीरे वज़न को बगल की ओर उठाएं जब तक कि बाहें फर्श के समानांतर न हों।',
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
        'Keeping upper arms stationary, curl the weights while contracting biceps.',
        'Continue to raise the weights until biceps are fully contracted.',
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
        'Attach a straight or angled bar to a high pulley and grab with overhand grip.',
        'Standing upright with the torso straight, bring upper arms close to your body.',
        'Using the triceps, bring the bar down until it touches front of thighs.',
        'Slowly return the bar to the starting position.'
      ],
      hi: [
        'एक उच्च चरखी (पुली) में एक सीधा या कोणीय बार संलग्न करें और ओवरहैंड ग्रिप से पकड़ें।',
        'धड़ को सीधा रखते हुए सीधे खड़े हों, ऊपरी बाहों को अपने शरीर के करीब लाएं।',
        'ट्राइसेप्स का उपयोग करते हुए, बार को तब तक नीचे लाएं जब तक कि वह जांघों को न छू ले।',
        'धीरे-धीरे बार को प्रारंभिक स्थिति में लौटाएं।'
      ]
    },
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pushdown.gif'
  }
];

const CATEGORIES = ['All', 'Chest', 'Shoulder', 'Legs', 'Biceps', 'Triceps', 'Core'];

export default function UserExercises() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { insets, scrollInset } = useAppBottomInset();

  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);

  const filteredExercises = useMemo(() => {
    return EXERCISES.filter((ex) => {
      const matchesCategory = activeCategory === 'All' || ex.category === activeCategory;
      const exerciseName = ex.name[lang] || ex.name.en;
      const matchesSearch = exerciseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ex.target.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, lang]);

  const toggleLanguage = () => {
    Haptics.selectionAsync();
    setLang(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Exercise Library</Text>
            <Text style={[styles.headerSubtitle, isDark ? styles.textGray : styles.textSlate]}>
              {lang === 'en' ? 'Master movements & form' : 'सटीक तकनीक और व्यायाम सीखें'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={toggleLanguage}
            style={[styles.langToggle, isDark ? styles.toggleDark : styles.toggleLight]}
          >
            <Globe color="#d96638" size={16} />
            <Text style={[styles.langText, isDark ? styles.textWhite : styles.textBlack]}>
              {lang === 'en' ? 'English' : 'हिंदी'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={[styles.searchBox, isDark ? styles.searchDark : styles.searchLight]}>
          <Search color={isDark ? '#8E8E93' : '#64748B'} size={18} />
          <TextInput
            style={[styles.searchInput, isDark ? styles.textWhite : styles.textBlack]}
            placeholder={lang === 'en' ? 'Search exercise or muscle...' : 'व्यायाम या मांसपेशी खोजें...'}
            placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveCategory(cat);
                }}
                style={[
                  styles.categoryPill,
                  isActive 
                    ? styles.categoryPillActive 
                    : (isDark ? styles.categoryPillDark : styles.categoryPillLight)
                ]}
              >
                <Text style={[
                  styles.categoryPillText,
                  isActive ? styles.textWhite : (isDark ? styles.textGray : styles.textSlate)
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Exercises List */}
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollInset }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredExercises.map((exercise, index) => {
          return (
            <Animated.View
              key={exercise.id}
              entering={FadeInDown.delay(index * 60).duration(260)}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedExercise(exercise);
                }}
                style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconWrap}>
                    <Dumbbell color="#d96638" size={22} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.exerciseName, isDark ? styles.textWhite : styles.textBlack]}>
                      {exercise.name[lang] || exercise.name.en}
                    </Text>
                    <Text style={[styles.targetMuscle, isDark ? styles.textGray : styles.textSlate]}>
                      Target: {exercise.target}
                    </Text>
                  </View>
                  <View style={[
                    styles.difficultyBadge,
                    exercise.difficulty === 'Beginner' && { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
                    exercise.difficulty === 'Intermediate' && { backgroundColor: 'rgba(217, 102, 56, 0.15)' },
                    exercise.difficulty === 'Advanced' && { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
                  ]}>
                    <Text style={[
                      styles.difficultyText,
                      exercise.difficulty === 'Beginner' && { color: '#10B981' },
                      exercise.difficulty === 'Intermediate' && { color: '#d96638' },
                      exercise.difficulty === 'Advanced' && { color: '#EF4444' },
                    ]}>
                      {exercise.difficulty}
                    </Text>
                  </View>
                </View>

                {exercise.gifUrl ? (
                  <View style={styles.imagePreviewWrap}>
                    <Image 
                      source={{ uri: exercise.gifUrl }} 
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                  </View>
                ) : null}

                <View style={styles.cardFooter}>
                  <Text style={[styles.stepCount, isDark ? styles.textGray : styles.textSlate]}>
                    {exercise.instructions[lang]?.length || 0} {lang === 'en' ? 'step instructions' : 'चरण निर्देश'}
                  </Text>
                  <View style={styles.viewDetailsBtn}>
                    <Text style={styles.viewDetailsText}>{lang === 'en' ? 'View Guide' : 'विवरण देखें'}</Text>
                    <ChevronRight color="#d96638" size={16} />
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Exercise Modal Detail */}
      <Modal
        visible={!!selectedExercise}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedExercise(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, isDark ? styles.sheetDark : styles.sheetLight]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>
                  {selectedExercise?.name[lang] || selectedExercise?.name.en}
                </Text>
                <Text style={[styles.modalSubtitle, isDark ? styles.textGray : styles.textSlate]}>
                  {selectedExercise?.category} • {selectedExercise?.target}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setSelectedExercise(null)}
                style={styles.closeBtn}
              >
                <X color={isDark ? '#FFF' : '#000'} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
              {selectedExercise?.gifUrl ? (
                <View style={styles.modalImageWrap}>
                  <Image 
                    source={{ uri: selectedExercise.gifUrl }} 
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                </View>
              ) : null}

              <Text style={[styles.instructionsHeader, isDark ? styles.textWhite : styles.textBlack]}>
                {lang === 'en' ? 'How to Execute:' : 'व्यायाम करने का तरीका:'}
              </Text>

              <View style={{ gap: 12, marginTop: 12 }}>
                {selectedExercise?.instructions[lang]?.map((instruction: string, i: number) => (
                  <View key={i} style={styles.instructionStep}>
                    <View style={styles.stepNumberBadge}>
                      <Text style={styles.stepNumberText}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.instructionText, isDark ? styles.textWhite : styles.textBlack]}>
                      {instruction}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgDark: { backgroundColor: '#0D1117' },
  bgLight: { backgroundColor: '#F4F7F6' },
  
  header: { 
    paddingHorizontal: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(150,150,150,0.1)' 
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  
  langToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
  toggleDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  toggleLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  langText: { fontSize: 13, fontWeight: '700' },

  searchBox: { flexDirection: 'row', alignItems: 'center', height: 46, borderRadius: 16, paddingHorizontal: 14, borderWidth: 1, marginBottom: 14 },
  searchDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  searchLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '500' },

  categoryScroll: { gap: 8, paddingBottom: 14 },
  categoryPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  categoryPillActive: { backgroundColor: '#d96638' },
  categoryPillDark: { backgroundColor: '#161B22', borderWidth: 1, borderColor: '#30363D' },
  categoryPillLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  categoryPillText: { fontSize: 13, fontWeight: '700' },

  scrollContent: { padding: 20, gap: 16 },

  card: { padding: 18, borderRadius: 24, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },

  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  cardIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(217, 102, 56, 0.15)', alignItems: 'center', justifyContent: 'center' },
  exerciseName: { fontSize: 17, fontWeight: '800', marginBottom: 2 },
  targetMuscle: { fontSize: 13, fontWeight: '500' },
  difficultyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  difficultyText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

  imagePreviewWrap: { height: 180, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000', marginBottom: 14 },
  imagePreview: { width: '100%', height: '100%' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepCount: { fontSize: 13, fontWeight: '600' },
  viewDetailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewDetailsText: { fontSize: 13, fontWeight: '700', color: '#d96638' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '88%' },
  sheetDark: { backgroundColor: '#161B22' },
  sheetLight: { backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalSubtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  closeBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(150,150,150,0.1)' },

  modalImageWrap: { height: 220, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000', marginBottom: 20 },
  modalImage: { width: '100%', height: '100%' },

  instructionsHeader: { fontSize: 16, fontWeight: '800' },
  instructionStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNumberBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#d96638', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepNumberText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  instructionText: { flex: 1, fontSize: 14, lineHeight: 22, fontWeight: '500' },

  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
});
