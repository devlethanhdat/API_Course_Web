export interface Order {
  id: number
  userId: string
  paymentIntentId: string
  status: string
  total: number
  createdAt: string
  // Add other fields as needed
}
