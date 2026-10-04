import React, { useState } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { BottomSheet } from "@/components/feedback/bottom-sheet"
import { Button } from "@/components/ui/button"
import type { TGroupBookingPerson } from "@/typings"
import {
  IconQrcode,
  IconScan,
  IconCheck,
  IconScissors,
  IconUserCheck,
} from "@tabler/icons-react-native"

interface QrScanModalProps {
  visible: boolean
  onClose: () => void
  barberName: string
  persons?: TGroupBookingPerson[]
  onScanSuccess: (confirmedPersonIds: string[]) => void
}

export function QrScanModal({
  visible,
  onClose,
  barberName,
  persons = [],
  onScanSuccess,
}: QrScanModalProps) {
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)

  // Track which companions are selected as present
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    persons.map((p) => p.id)
  )

  const togglePerson = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((i) => i !== id))
    } else {
      setSelectedIds((prev) => [...prev, id])
    }
  }

  const handleSimulateScan = () => {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setScanned(true)
      setTimeout(() => {
        setScanned(false)
        onScanSuccess(selectedIds)
      }, 700)
    }, 1200)
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("Scan Mirror QR")}>
      <View className="items-center py-2 gap-4">
        {/* Mirror QR Frame Simulation */}
        <View
          style={{
            backgroundColor: colors.cardAlt,
            borderColor: scanned ? "#10b981" : colors.gold,
          }}
          className="w-52 h-52 rounded-3xl border-2 border-dashed items-center justify-center p-4 relative"
        >
          {scanned ? (
            <View className="items-center gap-2">
              <View className="w-16 h-16 rounded-full bg-emerald-500/20 items-center justify-center">
                <IconCheck size={36} color="#10b981" strokeWidth={3} />
              </View>
              <Text style={{ color: "#10b981" }} className="font-extrabold text-sm">
                {t("Chair verified successfully!")}
              </Text>
            </View>
          ) : (
            <View className="items-center gap-2">
              <IconQrcode size={76} color={colors.gold} strokeWidth={1.5} />
              <View className="flex-row items-center gap-1.5 mt-2">
                <IconScissors size={14} color={colors.muted} />
                <Text style={{ color: colors.text }} className="font-bold text-xs">
                  {t("Barber Chair:")} {barberName}
                </Text>
              </View>
            </View>
          )}

          {scanning && (
            <View className="absolute inset-0 bg-gold/10 rounded-3xl items-center justify-center">
              <IconScan size={44} color={colors.gold} />
            </View>
          )}
        </View>

        {/* Companions Attendance Selection for this Barber */}
        {persons.length > 1 && (
          <View className="w-full gap-2 px-1">
            <Text style={{ color: colors.text }} className="text-xs font-bold">
              {t("Select Attendees for this Barber:")}
            </Text>
            {persons.map((person) => {
              const isSelected = selectedIds.includes(person.id)
              return (
                <TouchableOpacity
                  key={person.id}
                  onPress={() => togglePerson(person.id)}
                  style={{
                    backgroundColor: isSelected ? colors.cardAlt : "transparent",
                    borderColor: isSelected ? colors.gold : colors.border,
                  }}
                  className="p-2.5 rounded-xl border flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-2">
                    <IconUserCheck
                      size={16}
                      color={isSelected ? colors.gold : colors.muted}
                    />
                    <Text
                      style={{ color: isSelected ? colors.text : colors.muted }}
                      className="text-xs font-semibold"
                    >
                      {person.name} ({person.serviceName})
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: isSelected ? colors.gold : "transparent",
                      borderColor: isSelected ? colors.gold : colors.muted,
                    }}
                    className="w-5 h-5 rounded-full border items-center justify-center"
                  >
                    {isSelected && <IconCheck size={12} color="#ffffff" />}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        <Text style={{ color: colors.muted }} className="text-xs text-center leading-relaxed px-4">
          {t("Point your camera at the QR code displayed on the barber mirror to confirm your attendance and begin service.")}
        </Text>

        <Button
          label={
            scanned
              ? t("Verified...")
              : scanning
              ? t("Scanning...")
              : `${t("Confirm Attendance & Scan Mirror QR")} (${selectedIds.length})`
          }
          loading={scanning}
          disabled={scanned || selectedIds.length === 0}
          onPress={handleSimulateScan}
          fullWidth
          className="mt-2"
        />
      </View>
    </BottomSheet>
  )
}
