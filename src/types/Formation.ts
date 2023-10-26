export class Formation {
  course: string
  college: string
  description: string
  status: 'incomplete' | 'complete'
  date: {
    start: Date
    end: Date
  }
}
