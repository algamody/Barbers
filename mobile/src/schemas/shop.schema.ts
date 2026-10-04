import { z } from "zod"

export const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameEn: z.string(),
  price: z.number().positive(),
  duration: z.number().positive(), // in minutes
  target: z.enum(["adult", "child"]),
})

export const AddonSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
})

export const StaffAltBookingSchema = z.object({
  fee: z.number().default(5),
  openWindowDeadline: z.string(), // ISO string for fixed deadline
  originalCustomer: z.string(),
}).nullable().optional()

export const StaffMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  photo: z.string().url().or(z.string()),
  rating: z.number().min(0).max(5),
  queue: z.number().int().nonnegative(),
  avgWait: z.number().int().nonnegative(), // in minutes
  isActive: z.boolean().default(true),
  inactiveReason: z.object({
    ar: z.string(),
    en: z.string(),
  }).optional(),
  altBooking: StaffAltBookingSchema,
})

export const GalleryPhotoSchema = z.object({
  id: z.string(),
  url: z.string(),
  title: z.string(),
  category: z.string(),
  categoryAr: z.string(),
})

export const ReviewSchema = z.object({
  id: z.string(),
  name: z.string(),
  rating: z.number().min(1).max(5),
  text: z.string(),
  time: z.string(),
  serviceUsed: z.string(),
  photos: z.array(z.string()).default([]),
})

export const ShopSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameAr: z.string(),
  address: z.string(),
  distance: z.string(),
  coordinates: z.tuple([z.number(), z.number()]).optional(),
  isOpen: z.boolean(),
  isVerified: z.boolean(),
  waitingCount: z.number().int().nonnegative(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  workingHours: z.object({
    ar: z.string(),
    en: z.string(),
  }),
  photo: z.string(),
  gallery: z.array(z.string()).default([]),
  galleryPhotos: z.array(GalleryPhotoSchema).default([]),
  services: z.array(ServiceSchema).default([]),
  addons: z.array(AddonSchema).default([]),
  staff: z.array(StaffMemberSchema).default([]),
  reviews: z.array(ReviewSchema).default([]),
})
