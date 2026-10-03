// Total window: 10 min. First 5 min protected (only original booker).
// Last 5 min (openWindowSeconds) open to everyone — chip appears then.
export const ALT_OPEN_WINDOW_SECONDS = 300 // 5 min open phase

export interface CommunityReport {
  id: string
  userName: string
  userAvatar?: string
  isOpen: boolean
  waitingCount: number
  time: string
  note?: string
  photo?: string
  confirmedCount?: number
  unconfirmedCount?: number
}

export interface CommunityUpdateData {
  updatedAt: string
  isOpen: boolean
  waitingCount: number
  openCount: number
  closedCount: number
  reports: CommunityReport[]
}

export interface StaffMember {
  id: string
  name: string
  photo: string
  rating: number
  queue: number
  avgWait: number
  isActive?: boolean
  inactiveReason?: {
    ar: string
    en: string
  }
  altBooking?: {
    fee: number
    openWindowSeconds: number
    originalCustomer: string
  } | null
}

export function isToday(
  dateInput: Date | string | number | null | undefined,
): boolean {
  if (!dateInput) return false
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return false
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export function formatTimeHM(
  dateInput: Date | string | number | null | undefined,
  lang: "ar" | "en" = "ar",
): string {
  if (!dateInput) return ""
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return ""
  let hours = d.getHours()
  const minutes = d.getMinutes().toString().padStart(2, "0")
  if (lang === "ar") {
    const period = hours >= 12 ? "م" : "ص"
    hours = hours % 12 || 12
    const hoursStr = hours.toString().padStart(2, "0")
    return `${hoursStr}:${minutes} ${period}`
  } else {
    const period = hours >= 12 ? "PM" : "AM"
    hours = hours % 12 || 12
    const hoursStr = hours.toString().padStart(2, "0")
    return `${hoursStr}:${minutes} ${period}`
  }
}

export function getStoredCommunityData(shopId: string): CommunityUpdateData | null {
  if (typeof window === "undefined") return null
  try {
    const saved = localStorage.getItem(`community_data_${shopId}`)
    if (saved) return JSON.parse(saved)
  } catch {}
  return null
}

export function notifyCommunitySync(shopId?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("barbers_community_sync", { detail: { shopId } }),
    )
  }
}

export function isCommunityStatusActive(shop: {
  id?: string
  isVerified?: boolean
  communityUpdate?: { updatedAt?: string } | null
}): boolean {
  if (shop.isVerified) return false
  let updatedAt = shop.communityUpdate?.updatedAt
  if (shop.id && typeof window !== "undefined") {
    const stored = getStoredCommunityData(shop.id)
    if (stored?.updatedAt) updatedAt = stored.updatedAt
  }
  if (!updatedAt) return false
  return isToday(updatedAt)
}

export const SHOPS = [
  {
    id: "s1",
    name: "Royal Cut",
    nameAr: "رويال كت",
    address: "شارع الجمهورية، طرابلس",
    distance: "0.4 كم",
    isOpen: true,
    isVerified: true,
    waitingCount: 3,
    rating: 4.8,
    reviewCount: 124,
    workingHours: {
      ar: "10:00ص - 12:00م",
      en: "10:00 AM - 12:00 AM",
    },
    communityUpdate: null as CommunityUpdateData | null,
    photo:
      "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnGEMeOWPllR5WkwkHrASDXPmbeAVi2SVVLKFGWygooJwtkye4e104jQP8sZzMdFkKot9OxJM50vju5EAMac2VRlcacI3yMWqZ7vcRRBivanAyYmRMmt8Y8-p1j0SJkNU8JodRTpg=s1360-w1360-h1020-rw",
    gallery: [
      "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=300&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop&auto=format",
    ],
    galleryPhotos: [
      {
        id: "gp1",
        url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=800&fit=crop&auto=format",
        title: "تحديد لحية واحترافية التدرج",
        category: "beard",
        categoryAr: "لحية ودقن",
      },
      {
        id: "gp2",
        url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format",
        title: "قصة شعر عصرية لأحد زبائننا",
        category: "haircuts",
        categoryAr: "قصات شعر",
      },
      {
        id: "gp3",
        url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=800&fit=crop&auto=format",
        title: "كراسي صالون رويال كت وتجهيزات VIP",
        category: "interior",
        categoryAr: "داخل الصالون",
      },
      {
        id: "gp4",
        url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&h=800&fit=crop&auto=format",
        title: "جلسة حلاقة وتصفيف مع الحلاق محمد",
        category: "customers",
        categoryAr: "زبائن أثناء الحلاقة",
      },
      {
        id: "gp5",
        url: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&h=800&fit=crop&auto=format",
        title: "عناية متكاملة ومنتجات أصلية معقمة",
        category: "interior",
        categoryAr: "داخل الصالون",
      },
      {
        id: "gp6",
        url: "https://images.unsplash.com/photo-1517832606589-7157be569300?w=800&h=800&fit=crop&auto=format",
        title: "حلاقة وتحديد فيد لأحد زبائن المركز",
        category: "customers",
        categoryAr: "زبائن أثناء الحلاقة",
      },
    ],
    reviews: [
      {
        id: "rv1",
        name: "عمر الجهاني",
        rating: 5,
        text: "أفضل حلاق جربته في طرابلس، دقيق ومحترف وهذي النتيجة بعد الحلاقة والتحديد.",
        time: "منذ يومين",
        serviceUsed: "شعر + لحية",
        photos: [
          "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop&auto=format",
        ],
      },
      {
        id: "rv2",
        name: "سالم المنتصر",
        rating: 5,
        text: "التطبيق سهّل معرفة وقت الانتظار بدقة، والمحل غاية في النظافة والترتيب واستقبال الزبائن ممتاز.",
        time: "منذ أسبوع",
        serviceUsed: "حلاقة شعر",
        photos: [
          "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop&auto=format",
        ],
      },
      {
        id: "rv3",
        name: "فراس القيسي",
        rating: 4,
        text: "خدمة جيدة وسريعة، الحلاق طارق محترف جداً وتعامل راقي.",
        time: "منذ أسبوعين",
        serviceUsed: "حلاقة لحية",
        photos: [],
      },
      {
        id: "rv4",
        name: "مهند الورفلي",
        rating: 5,
        text: "صوّرت شغلي بعد التحديد مباشرة، شغل متقن وسعر ممتاز مقابل الخدمة المقدمة.",
        time: "منذ 3 أسابيع",
        serviceUsed: "شعر + لحية",
        photos: [
          "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop&auto=format",
        ],
      },
    ],
    services: [
      {
        id: "sv1",
        name: "حلاقة شعر",
        nameEn: "Haircut",
        price: 15,
        duration: 30,
        target: "adult",
      },
      {
        id: "sv2",
        name: "حلاقة لحية",
        nameEn: "Beard Trim",
        price: 10,
        duration: 20,
        target: "adult",
      },
      {
        id: "sv3",
        name: "شعر + لحية",
        nameEn: "Hair & Beard",
        price: 22,
        duration: 45,
        target: "adult",
      },
      {
        id: "sv4",
        name: "حلاقة أطفال",
        nameEn: "Kids Cut",
        price: 10,
        duration: 20,
        target: "child",
      },
      {
        id: "sv5",
        name: "استشوار",
        nameEn: "Style Consult",
        price: 5,
        duration: 15,
        target: "adult",
      },
    ],
    addons: [
      { id: "a1", name: "كريم شعر", price: 3 },
      { id: "a2", name: "ماسك وجه", price: 5 },
      { id: "a3", name: "زيت لحية", price: 4 },
    ],
    staff: [
      {
        id: "st1",
        name: "محمد الزروق",
        photo:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&auto=format",
        rating: 4.9,
        queue: 2,
        avgWait: 28,
        altBooking: null,
      },
      {
        id: "st2",
        name: "علي الورفلي",
        photo:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&auto=format",
        rating: 4.7,
        queue: 1,
        avgWait: 32,
        // Demo: a customer didn't confirm — open window active (< 5 min left)
        altBooking: {
          fee: 5,
          openWindowSeconds: 270,
          originalCustomer: "م. السيد",
        },
      },
      {
        id: "st3",
        name: "خالد المنتصر",
        photo:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&auto=format",
        rating: 4.8,
        queue: 3,
        avgWait: 25,
        altBooking: null,
      },
      {
        id: "st6",
        name: "طارق الشريف",
        photo:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&auto=format",
        rating: 4.9,
        queue: 1,
        avgWait: 20,
        // Demo 4th barber: customer hasn't confirmed reservation, 5 mins remaining (300s)
        altBooking: {
          fee: 5,
          openWindowSeconds: 300,
          originalCustomer: "ع. محمود",
        },
      },
      {
        id: "st7",
        name: "عمر الساحلي",
        photo:
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&auto=format",
        rating: 4.8,
        queue: 0,
        avgWait: 0,
        isActive: false,
        inactiveReason: {
          ar: "غير نشط",
          en: "Inactive",
        },
        altBooking: null,
      },
    ],
  },
  {
    id: "s2",
    name: "Classic Barber",
    nameAr: "كلاسيك باربر",
    address: "حي الأندلس، طرابلس",
    distance: "1.2 كم",
    isOpen: true,
    isVerified: false,
    waitingCount: 5,
    rating: 4.5,
    reviewCount: 89,
    workingHours: {
      ar: "09:30ص - 11:30م",
      en: "09:30 AM - 11:30 PM",
    },
    communityUpdate: {
      updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      isOpen: true,
      waitingCount: 5,
      openCount: 14,
      closedCount: 2,
      reports: [
        {
          id: "rep-1",
          userName: "أحمد الترهوني",
          userAvatar:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&auto=format",
          isOpen: true,
          waitingCount: 5,
          time: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
          note: "الصالون مفتوح حالياً، طاقم الحلاقين كامل والانتظار تقريباً 5 زبائن فقط.",
          photo:
            "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop&auto=format",
          confirmedCount: 6,
          unconfirmedCount: 1,
        },
        {
          id: "rep-2",
          userName: "سالم الورفلي",
          userAvatar:
            "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&auto=format",
          isOpen: true,
          waitingCount: 4,
          time: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
          note: "زرت المحل لتوي، الاستقبال ممتاز والخدمة سريعة.",
          photo:
            "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=400&fit=crop&auto=format",
          confirmedCount: 4,
          unconfirmedCount: 0,
        },
        {
          id: "rep-3",
          userName: "طارق الشريف",
          userAvatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&auto=format",
          isOpen: false,
          waitingCount: 0,
          time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          note: "كان مقفل فترة الظهيرة لصلاة الظهر والغداء ثم عاد للعمل.",
          photo: "",
          confirmedCount: 1,
          unconfirmedCount: 2,
        },
      ],
    },
    photo:
      "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkt6RKden1DmI4wF6DmD4Pdy8krFgVq0rm27TT9wciNL4S2xTPN1Kvm3ZCjYTQ1cldaojJqh1TDMO_QedpMkhHVDJEb--SP8fYJl87IywzF8_b_7gtgpD2tNEEVwpME32Tl435l=s1360-w1360-h1020-rw",
    gallery: [],
    services: [
      {
        id: "sv6",
        name: "حلاقة شعر",
        nameEn: "Haircut",
        price: 12,
        duration: 25,
        target: "adult",
      },
      {
        id: "sv7",
        name: "حلاقة لحية",
        nameEn: "Beard Trim",
        price: 8,
        duration: 15,
        target: "adult",
      },
    ],
    addons: [],
    staff: [
      {
        id: "st4",
        name: "يوسف الفارسي",
        photo:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&auto=format",
        rating: 4.5,
        queue: 5,
        avgWait: 30,
        altBooking: null,
      },
      {
        id: "st8",
        name: "معتز القمودي",
        photo:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&auto=format",
        rating: 4.7,
        queue: 0,
        avgWait: 0,
        isActive: false,
        inactiveReason: {
          ar: "لم يحضر اليوم",
          en: "Not present today (personal circumstance)",
        },
        altBooking: null,
      },
    ],
  },
  {
    id: "s3",
    name: "Fade Studio",
    nameAr: "فيد ستوديو",
    address: "طريق المطار، طرابلس",
    distance: "2.0 كم",
    isOpen: false,
    isVerified: true,
    waitingCount: 0,
    rating: 4.9,
    reviewCount: 211,
    workingHours: {
      ar: "02:00م - 12:00ص",
      en: "02:00 PM - 12:00 AM",
    },
    communityUpdate: null as CommunityUpdateData | null,
    photo:
      "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWk_McHNFpobLwArPK940700lNwN8JB_vUkkU21gupzlRX7Y6lSBVDaNtFnpdIJWwn4G-ktboigVaN4bWWSiFVyjpn86K_T_F_iCfclPExxWFrOzCaqdFo4bLS9-N5AE0qoSSaPB=s1360-w1360-h1020-rw",
    gallery: [],
    services: [
      {
        id: "sv8",
        name: "فيد + تشكيل",
        nameEn: "Fade + Shape",
        price: 20,
        duration: 40,
        target: "adult",
      },
    ],
    addons: [],
    staff: [
      {
        id: "st5",
        name: "إبراهيم القذافي",
        photo:
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&auto=format",
        rating: 4.9,
        queue: 0,
        avgWait: 35,
        altBooking: null,
      },
      {
        id: "st9",
        name: "حمزة المغربي",
        photo:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&auto=format",
        rating: 4.6,
        queue: 0,
        avgWait: 0,
        isActive: false,
        inactiveReason: {
          ar: "غير متاح اليوم (خارج المركز لظرف)",
          en: "Unavailable today (away for personal errand)",
        },
        altBooking: null,
      },
    ],
  },
]

export type Shop = typeof SHOPS[number]

export const MY_BOOKING = {
  shopName: "Royal Cut",
  staffName: "محمد الزروق",
  service: "شعر + لحية",
  addons: "غسيل شعر",
  position: 2,
  totalAhead: 3,
  estimatedWait: 24,
  status: "in_queue" as "in_queue" | "next_up" | "in_progress" | "completed",
  paymentMethod: "wallet",
  bookingId: "BK-2941",
}
