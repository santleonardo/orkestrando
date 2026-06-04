import { db } from '@/lib/db'
import { checkHoliday } from '@/lib/conflicts'

interface ScheduleData {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export async function generateLessons(classId: string): Promise<number> {
  const classData = await db.class.findUnique({
    where: { id: classId },
    include: {
      semester: true,
      discipline: true,
    },
  })

  if (!classData) {
    throw new Error('Class not found')
  }

  const schedule: ScheduleData = JSON.parse(classData.schedule)
  const { dayOfWeek, startTime, endTime } = schedule

  const semesterStart = new Date(classData.semester.startDate)
  const semesterEnd = new Date(classData.semester.endDate)

  const lessons: Array<{
    classId: string
    teacherId: string
    date: Date
    startTime: string
    endTime: string
    roomCode?: string
    topic?: string
  }> = []

  const currentDate = new Date(semesterStart)

  while (currentDate <= semesterEnd) {
    const currentDay = currentDate.getDay()

    if (currentDay === dayOfWeek) {
      const isHoliday = await checkHoliday(new Date(currentDate))
      if (!isHoliday) {
        lessons.push({
          classId,
          teacherId: classData.teacherId,
          date: new Date(currentDate),
          startTime,
          endTime,
          roomCode: classData.room || undefined,
          topic: `${classData.discipline.name} - Aula`,
        })
      }
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  if (lessons.length > 0) {
    await db.lesson.createMany({
      data: lessons,
    })
  }

  return lessons.length
}
