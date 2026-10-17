export const EXERCISE_CATEGORIES = [
  'Chest', 'Shoulders', 'Legs', 'Biceps', 'Triceps', 'Abs', 'Back'
]

export const EXERCISE_DATA = [
  // Chest
  { id: 'c1', name: 'Barbell Bench Press', muscle: 'Chest', difficulty: 'Intermediate', gifUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80', instructions: 'Lie on a flat bench. Grip the barbell slightly wider than shoulder-width. Lower the bar to your mid-chest, then press it back up explosively.' },
  { id: 'c2', name: 'Incline Dumbbell Press', muscle: 'Chest', difficulty: 'Intermediate', gifUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80', instructions: 'Set an incline bench to 30-45 degrees. Press dumbbells up from chest level until arms are fully extended, focusing on the upper chest.' },
  { id: 'c3', name: 'Cable Crossovers', muscle: 'Chest', difficulty: 'Beginner', gifUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80', instructions: 'Stand in the center of a cable machine. Pull the handles forward and together in a hugging motion. Squeeze the chest at the peak contraction.' },
  
  // Shoulders
  { id: 's1', name: 'Overhead Press', muscle: 'Shoulders', difficulty: 'Advanced', gifUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80', instructions: 'Stand with feet shoulder-width apart. Press the barbell overhead from your front shoulders until your arms are locked out.' },
  { id: 's2', name: 'Lateral Raises', muscle: 'Shoulders', difficulty: 'Beginner', gifUrl: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?auto=format&fit=crop&w=800&q=80', instructions: 'Hold dumbbells at your sides. Raise them outward until your arms are parallel to the floor. Lower slowly and repeat.' },
  
  // Legs
  { id: 'l1', name: 'Barbell Squat', muscle: 'Legs', difficulty: 'Advanced', gifUrl: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=800&q=80', instructions: 'Rest the barbell on your upper back. Squat down by pushing your hips back and bending your knees. Keep your chest up and drive back to standing.' },
  { id: 'l2', name: 'Leg Press', muscle: 'Legs', difficulty: 'Beginner', gifUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80', instructions: 'Sit on the machine. Push the platform away with your feet until your legs are extended. Lower the weight slowly until knees are at 90 degrees.' },
  
  // Biceps
  { id: 'b1', name: 'Barbell Curl', muscle: 'Biceps', difficulty: 'Beginner', gifUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80', instructions: 'Hold a barbell with an underhand grip. Keep your elbows close to your torso and curl the weight up towards your chest.' },
  { id: 'b2', name: 'Hammer Curls', muscle: 'Biceps', difficulty: 'Beginner', gifUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80', instructions: 'Hold dumbbells with a neutral grip (palms facing each other). Curl the weights up while keeping elbows stationary.' },
  
  // Triceps
  { id: 't1', name: 'Triceps Pushdown', muscle: 'Triceps', difficulty: 'Beginner', gifUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80', instructions: 'Use a cable machine with a rope attachment. Push the rope down until your arms are fully extended. Squeeze the triceps at the bottom.' },
  { id: 't2', name: 'Overhead Triceps Extension', muscle: 'Triceps', difficulty: 'Intermediate', gifUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80', instructions: 'Hold a dumbbell overhead with both hands. Lower the weight behind your head by bending your elbows. Extend arms back up.' },
  
  // -
  { id: 'a1', name: 'Cable Crunches', muscle: 'Abs', difficulty: 'Intermediate', gifUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80', instructions: 'Kneel in front of a cable machine holding a rope behind your neck. Crunch downwards using your abs, bringing your elbows towards your knees.' },
  { id: 'a2', name: 'Hanging Leg Raises', muscle: 'Abs', difficulty: 'Advanced', gifUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80', instructions: 'Hang from a pull-up bar. Keep your legs straight and raise them until they are parallel to the floor. Lower them slowly.' },
  
  // Back
  { id: 'bk1', name: 'Deadlift', muscle: 'Back', difficulty: 'Advanced', gifUrl: 'https://images.unsplash.com/photo-1517838503506-3b561768809d?auto=format&fit=crop&w=800&q=80', instructions: 'Stand with the bar over your mid-foot. Hinge at the hips to grab the bar. Keep your back straight, chest up, and stand up by extending hips and knees.' },
  { id: 'bk2', name: 'Lat Pulldown', muscle: 'Back', difficulty: 'Beginner', gifUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80', instructions: 'Sit at a lat pulldown machine. Grab the bar wide. Pull the bar down to your upper chest while squeezing your shoulder blades together.' }
]