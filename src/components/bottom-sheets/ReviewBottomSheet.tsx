import { useState } from "react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Button, Textarea, Rating } from "@/components/ui"
import { IconCheck, IconCamera, IconX } from "@tabler/icons-react"
import { Lang } from "@/i18n"

export interface ReviewBottomSheetProps {
  open: boolean
  onClose: () => void
  lang?: Lang
  shopName?: string
  defaultService?: string
  reviewerName?: string
  onSubmitSuccess?: (reviewData: {
    rating: number
    reviewerName: string
    service: string
    comment: string
    photos: string[]
  }) => void
}

export function ReviewBottomSheet({
  open,
  onClose,
  lang = "ar",
  shopName,
  defaultService = "شعر + لحية",
  reviewerName = "محمد القمودي",
  onSubmitSuccess,
}: ReviewBottomSheetProps) {
  const dir = lang === "ar" ? "rtl" : "ltr"
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState("")
  const [newAttachedPhotos, setNewAttachedPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop&auto=format",
  ])

  const handleSubmit = () => {
    if (!newComment.trim()) return
    setReviewSubmitted(true)
    if (onSubmitSuccess) {
      onSubmitSuccess({
        rating: newRating,
        reviewerName,
        service: defaultService,
        comment: newComment,
        photos: newAttachedPhotos,
      })
    }
    setTimeout(() => {
      onClose()
      setReviewSubmitted(false)
      setNewComment("")
    }, 1800)
  }

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        if (!reviewSubmitted) onClose()
      }}
      title={
        lang === "ar"
          ? `تقييم تجربة الحلاقة${shopName ? ` في ${shopName}` : ""}`
          : `Review Your Cut${shopName ? ` at ${shopName}` : ""}`
      }
      dir={dir}
    >
      <div className="space-y-4" dir={dir}>
        {reviewSubmitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
              <IconCheck size={30} stroke={3} />
            </div>
            <h4 className="text-base font-bold text-[var(--foreground)]">
              {lang === "ar"
                ? "تم نشر تقييمك بنجاح!"
                : "Review posted successfully!"}
            </h4>
            <p className="text-xs text-[var(--muted-foreground)]">
              {lang === "ar"
                ? "شكراً لمشاركة تجربتك وصورك مع زبائن المركز"
                : "Thank you for sharing your photos & review"}
            </p>
          </div>
        ) : (
          <>
            {/* Star Rating Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">
                {lang === "ar" ? "التقييم العام" : "Overall Rating"}
              </label>
              <div className="flex items-center gap-2">
                <Rating
                  value={newRating}
                  variant="interactive"
                  size={28}
                  onChange={(val) => setNewRating(val)}
                  showScore
                />
              </div>
            </div>

            {/* Registered Service Tag */}
            {defaultService && (
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] text-xs">
                <span className="text-[var(--muted-foreground)]">
                  {lang === "ar" ? "الخدمة المسجلة:" : "Registered Service:"}
                </span>
                <span className="font-semibold text-[var(--foreground)]">
                  {defaultService}
                </span>
              </div>
            )}

            {/* Review Comment */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--foreground)]">
                {lang === "ar" ? "تفاصيل رأيك وتجربتك" : "Your Review"}
              </label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  lang === "ar"
                    ? "اكتب تفاصيل تجربتك، نظافة المركز، أسلوب الحلاق..."
                    : "Describe your experience, haircut quality, cleanliness..."
                }
                rows={3}
              />
            </div>

            {/* Photo Attachments (Camera / Upload simulation) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <IconCamera size={14} className="text-[var(--primary)]" />
                  <span>
                    {lang === "ar"
                      ? "تصوير المركز أو القصة (صور الزبون)"
                      : "Attach Photos"}
                  </span>
                </label>
                <span className="text-[11px] text-[var(--muted-foreground)]">
                  {newAttachedPhotos.length}{" "}
                  {lang === "ar" ? "مرفقة" : "attached"}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {newAttachedPhotos.map((p, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 rounded-xl overflow-hidden border border-[var(--border)] group"
                  >
                    <img
                      src={p}
                      alt="Attached"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setNewAttachedPhotos((prev) =>
                          prev.filter((_, i) => i !== idx),
                        )
                      }
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-500 transition-colors cursor-pointer"
                    >
                      <IconX size={11} stroke={3} />
                    </button>
                  </div>
                ))}

                {/* Add sample photo simulating camera capture */}
                <button
                  type="button"
                  onClick={() => {
                    const samples = [
                      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=600&fit=crop&auto=format",
                      "https://images.unsplash.com/photo-1517832606589-7157be569300?w=600&h=600&fit=crop&auto=format",
                      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop&auto=format",
                      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop&auto=format",
                    ]
                    const randomSample =
                      samples[newAttachedPhotos.length % samples.length]
                    setNewAttachedPhotos((prev) => [...prev, randomSample])
                  }}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] flex flex-col items-center justify-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors cursor-pointer"
                >
                  <IconCamera size={18} />
                  <span className="text-[10px] font-medium">
                    {lang === "ar" ? "التقاط" : "Snap"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                fullWidth
                size="lg"
                onClick={handleSubmit}
                disabled={!newComment.trim()}
                className="font-semibold"
              >
                {lang === "ar" ? "نشر التقييم والصور" : "Post Review & Photos"}
              </Button>
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  )
}

export default ReviewBottomSheet
