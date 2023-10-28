export class User {
  id: string
  picture: string
  name: string
  nickname: string
  email: string
  phone: string
  birth: Date
  title: string
  presentation: string
  description: string
  hobbies: string[]
  address: {
    code: string
    country: string
    state: string
    city: string
  }
}
