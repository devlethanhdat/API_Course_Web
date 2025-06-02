export interface Basket {
  clientId: string
  items: CourseItem[]
  paymentIntentId?: string
  clientSecret?: string
  discount?: number
}

export interface CourseItem {
  courseId: string
  title: string
  instructor: string
  image: string
  price: number
}
