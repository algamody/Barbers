export interface PersonBooking {
  id: string
  name: string
  isMe: boolean
  serviceId: string
  addonIds: string[]
  staffId: string | null
}

export interface GroupBookingPerson {
  id: string
  name: string
  isMe: boolean
  serviceId: string
  serviceName: string
  addonIds: string[]
  addonNames: string[]
  staffId: string | null
  staffName: string
  price: number
  confirmed: boolean
}

export interface GroupBookingData {
  bookingId: string
  shopId: string
  shopName: string
  staffName: string
  service: string
  addons: string
  position: number
  totalAhead: number
  estimatedWait: number
  status: "in_queue" | "next_up" | "in_progress" | "completed"
  paymentMethod: "wallet" | "cash"
  totalPrice: number
  persons: GroupBookingPerson[]
  attendanceConfirmed?: boolean
  isClaimedSlot?: boolean
}
