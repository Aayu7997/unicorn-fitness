import { prisma } from '../lib/prisma'

async function main() {
  console.log('Seeding classes...')

  await prisma.classSchedule.deleteMany({})

  const classes = [
    { name: 'Morning Yoga', trainer: 'Sarah Jenkins', dayOfWeek: 'Monday', time: '07:00 -', room: 'Studio 1', capacity: 20, bookedCount: 5 },
    { name: 'HIIT Blast', trainer: 'Mike Torres', dayOfWeek: 'Monday', time: '06:00 PM', room: 'Main Floor', capacity: 15, bookedCount: 15 },
    { name: 'BJJ Fundamentals', trainer: 'Coach Silva', dayOfWeek: 'Tuesday', time: '05:30 PM', room: 'Mat - A', capacity: 12, bookedCount: 8 },
    { name: 'Muay Thai', trainer: 'Tony Jaa', dayOfWeek: 'Wednesday', time: '07:00 PM', room: 'Heavy Bag Room', capacity: 16, bookedCount: 10 },
    { name: 'Strength & Conditioning', trainer: '- Vance', dayOfWeek: 'Thursday', time: '06:30 -', room: 'Weight Room', capacity: 10, bookedCount: 9 },
    { name: 'Cardio Kickboxing', trainer: 'Elena Rust', dayOfWeek: 'Friday', time: '05:00 PM', room: 'Studio 2', capacity: 25, bookedCount: 20 },
    { name: 'Weekend Warrior (Circuit)', trainer: 'Mike Torres', dayOfWeek: 'Saturday', time: '10:00 -', room: 'Main Floor', capacity: 30, bookedCount: 12 }
  ]

  for (const c of classes) {
    await prisma.classSchedule.create({
      data: c
    })
  }

  console.log('Classes seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
