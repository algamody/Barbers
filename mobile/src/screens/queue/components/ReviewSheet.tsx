import React, { useState } from "react"
import { View, Text, TouchableOpacity, TextInput } from "react-native"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { BottomSheet } from "@/components/feedback/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  IconStar,
  IconStarFilled,
  IconAward,
  IconCheck,
  IconSparkles,
} from "@tabler/icons-react-native"

interface ReviewSheetProps {
  visible: boolean
  shopName: string
  barberName: string
  onClose: () => void
  onSubmit: (rating: number, comment: string) => Promise<void>
  loading?: boolean
}

const QUICK_TAGS = [
  "Professional Grooming",
  "Punctual",
  "Clean & Hygienic",
  "Polite Staff",
  "Comfortable Atmosphere",
]

export function ReviewSheet({
  visible,
  shopName,
  barberName,
  onClose,
  onSubmit,
  loading = false,
}: ReviewSheetProps) {
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()

  const [rating, setRating] = useState(5)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [comment, setComment] = useState("")

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag))
    } else {
      setSelectedTags((prev) => [...prev, tag])
    }
  }

  const handleSend = async () => {
    const finalComment = [
      selectedTags.length > 0 ? selectedTags.map((tag) => t(tag)).join(" • ") : "",
      comment.trim(),
    ]
      .filter(Boolean)
      .join("\n")

    await onSubmit(rating, finalComment)
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("Rate Grooming Experience")}>
      <View className="gap-4 pb-4">
        {/* Loyalty Reward Banner */}
        <View
          style={{
            backgroundColor: "rgba(232, 114, 42, 0.08)",
            borderColor: colors.gold,
          }}
          className="p-3.5 rounded-2xl border flex-row items-center gap-3"
        >
          <View
            style={{ backgroundColor: colors.gold }}
            className="w-9 h-9 rounded-full items-center justify-center"
          >
            <IconAward size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text style={{ color: colors.text }} className="text-xs font-bold">
              {t("Earn +50 loyalty points instantly!")}
            </Text>
            <Text style={{ color: colors.muted }} className="text-2xs">
              {t("Share your feedback for")} {barberName} {t("at salon")} {shopName}
            </Text>
          </View>
        </View>

        {/* 5-Star Interactive Rating Selector */}
        <View className="items-center py-2">
          <Text style={{ color: colors.muted }} className="text-xs mb-2">
            {t("Tap to rate")}
          </Text>
          <View className="flex-row items-center gap-2">
            {[1, 2, 3, 4, 5].map((starVal) => {
              const isFilled = starVal <= rating
              return (
                <TouchableOpacity
                  key={starVal}
                  onPress={() => setRating(starVal)}
                  activeOpacity={0.7}
                  className="p-1"
                >
                  {isFilled ? (
                    <IconStarFilled size={34} color={colors.gold} />
                  ) : (
                    <IconStar size={34} color={colors.muted} strokeWidth={1.5} />
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
          <Text style={{ color: colors.gold }} className="text-xs font-bold mt-1">
            {rating === 5
              ? t("Excellent 🌟")
              : rating === 4
              ? t("Very Good 👍")
              : rating === 3
              ? t("Average 👌")
              : t("Needs Improvement")}
          </Text>
        </View>

        {/* Quick Tag Pills */}
        <View>
          <Text style={{ color: colors.text }} className="text-xs font-bold mb-2">
            {t("Key Highlights")}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag)
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={{
                    backgroundColor: isSelected ? colors.gold : colors.cardAlt,
                    borderColor: isSelected ? colors.gold : colors.border,
                  }}
                  className="px-3 py-1.5 rounded-full border flex-row items-center gap-1"
                >
                  {isSelected && <IconCheck size={12} color="#ffffff" />}
                  <Text
                    style={{ color: isSelected ? "#ffffff" : colors.text }}
                    className="text-2xs font-semibold"
                  >
                    {t(tag)}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Comment Input */}
        <View>
          <Text style={{ color: colors.text }} className="text-xs font-bold mb-1.5">
            {t("Additional Comments (Optional)")}
          </Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder={t("Write your notes for the barber or salon...")}
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: colors.inputBg,
              color: colors.text,
              borderColor: colors.border,
              height: 70,
              textAlignVertical: "top",
            }}
            className="p-3 rounded-xl border text-xs text-start"
          />
        </View>

        {/* Submit Action */}
        <View className="gap-2 pt-2">
          <Button
            variant="default"
            size="lg"
            label={t("Submit Review & Claim Points (+50)")}
            loading={loading}
            onPress={handleSend}
            fullWidth
          />
          <Button
            variant="ghost"
            size="sm"
            label={t("Skip for now")}
            disabled={loading}
            onPress={onClose}
            fullWidth
          />
        </View>
      </View>
    </BottomSheet>
  )
}
