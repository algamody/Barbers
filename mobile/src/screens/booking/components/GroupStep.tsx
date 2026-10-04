import React, { useState } from "react"
import { View, Text, Pressable, ScrollView } from "react-native"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BottomSheet } from "@/components/feedback/bottom-sheet"
import type { TPersonBooking, TService, TStaffMember, TAddon } from "@/typings"
import { BookingDomainService } from "@/services/domain/booking.domain"
import { IconUsers, IconUserPlus, IconTrash, IconScissors, IconCheck } from "@tabler/icons-react-native"
import { cn } from "@/components/ui/button"

interface GroupStepProps {
  services: TService[]
  staff: TStaffMember[]
  addons: TAddon[]
  persons: TPersonBooking[]
  onUpdatePersons: (persons: TPersonBooking[]) => void
}

export function GroupStep({
  services,
  staff,
  addons,
  persons,
  onUpdatePersons,
}: GroupStepProps) {
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [newCompanionName, setNewCompanionName] = useState("")
  const [newServiceId, setNewServiceId] = useState<string>(services[0]?.id || "")
  const [newStaffId, setNewStaffId] = useState<string | null>(null)
  const [newAddonIds, setNewAddonIds] = useState<string[]>([])

  const handleAddCompanion = () => {
    if (!newCompanionName.trim()) return

    const newPerson: TPersonBooking = {
      id: `p-${Date.now()}`,
      name: newCompanionName.trim(),
      isMe: false,
      serviceId: newServiceId,
      addonIds: newAddonIds,
      staffId: newStaffId,
    }

    onUpdatePersons([...persons, newPerson])
    setNewCompanionName("")
    setNewAddonIds([])
    setIsAddSheetOpen(false)
  }

  const handleRemovePerson = (id: string) => {
    onUpdatePersons(persons.filter((p) => p.id !== id))
  }

  return (
    <View className="gap-5">
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-2">
          <IconUsers size={18} color={colors.gold} strokeWidth={2.2} />
          <Text style={{ color: colors.text }} className="font-bold text-sm">
            {t("Companions")} ({t("Individual or group booking")})
          </Text>
        </View>

        <Button
          variant="outline"
          size="sm"
          label={t("Add Companion")}
          onPress={() => setIsAddSheetOpen(true)}
        />
      </View>

      <Text style={{ color: colors.muted }} className="text-xs leading-relaxed">
        {t("Book an appointment for you and your companions. You can assign different barbers for parallel service.")}
      </Text>

      {/* Persons List */}
      <View className="gap-3">
        {persons.map((person) => {
          const service = services.find((s) => s.id === person.serviceId) || services[0]
          const chosenAddons = addons.filter((a) => person.addonIds.includes(a.id))
          const personPrice = BookingDomainService.calculatePersonPrice(service, chosenAddons)
          const assignedStaff = staff.find((st) => st.id === person.staffId)

          return (
            <Card key={person.id} className="p-4 border border-border-light dark:border-border-dark">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <Text style={{ color: colors.text }} className="font-bold text-sm">
                    {person.name}
                  </Text>
                  <Badge
                    variant={person.isMe ? "gold" : "outline"}
                    label={person.isMe ? t("For Me") : t("For Companion")}
                  />
                </View>

                <View className="flex-row items-center gap-2">
                  <Text style={{ color: colors.gold }} className="font-extrabold text-sm">
                    {personPrice} {t("LYD")}
                  </Text>
                  {!person.isMe && (
                    <Pressable
                      onPress={() => handleRemovePerson(person.id)}
                      className="w-7 h-7 rounded-lg items-center justify-center bg-red-500/10 active:opacity-70"
                    >
                      <IconTrash size={14} color="#ef4444" />
                    </Pressable>
                  )}
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-2 border-t border-border-light dark:border-border-dark">
                <Text style={{ color: colors.muted }} className="text-xs">
                  {t("Service")}: {service.name}
                  {chosenAddons.length > 0 && ` (+${chosenAddons.length} ${t("Addons")})`}
                </Text>
                <Text style={{ color: colors.muted }} className="text-xs font-semibold">
                  {t("Barber")}: {assignedStaff ? assignedStaff.name : t("Any Available Barber")}
                </Text>
              </View>
            </Card>
          )
        })}
      </View>

      {/* Add Companion Sheet */}
      <BottomSheet
        visible={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        title={t("Add Companion")}
      >
        <ScrollView className="max-h-[80vh]">
          <View className="gap-4 pb-6">
            <Input
              label={t("Companion Name")}
              placeholder={t("e.g. Ahmed")}
              value={newCompanionName}
              onChangeText={setNewCompanionName}
            />

            {/* Select Service for Companion */}
            <Text style={{ color: colors.text }} className="font-bold text-xs">
              {t("Choose service for companion")}:
            </Text>
            <View className="gap-2">
              {services.map((svc) => (
                <Pressable
                  key={svc.id}
                  onPress={() => setNewServiceId(svc.id)}
                  className="active:opacity-80"
                >
                  <Card
                    variant={newServiceId === svc.id ? "elevated" : "default"}
                    className={cn(
                      "p-3 border flex-row items-center justify-between",
                      newServiceId === svc.id ? "border-gold" : "border-border-light dark:border-border-dark"
                    )}
                  >
                    <Text style={{ color: colors.text }} className="text-xs font-semibold">
                      {svc.name}
                    </Text>
                    <Text style={{ color: colors.gold }} className="text-xs font-bold">
                      {svc.price} {t("LYD")}
                    </Text>
                  </Card>
                </Pressable>
              ))}
            </View>

            {/* Select Barber for Companion */}
            <Text style={{ color: colors.text }} className="font-bold text-xs mt-2">
              {t("Choose barber for companion")}:
            </Text>
            <View className="gap-2">
              <Pressable onPress={() => setNewStaffId(null)} className="active:opacity-80">
                <Card
                  variant={newStaffId === null ? "elevated" : "default"}
                  className={cn(
                    "p-3 border flex-row items-center justify-between",
                    newStaffId === null ? "border-gold" : "border-border-light dark:border-border-dark"
                  )}
                >
                  <Text style={{ color: colors.text }} className="text-xs font-semibold">
                    {t("Any Available Barber")}
                  </Text>
                  {newStaffId === null && <IconCheck size={14} color={colors.gold} />}
                </Card>
              </Pressable>

              {staff.filter((s) => s.isActive !== false).map((st) => (
                <Pressable
                  key={st.id}
                  onPress={() => setNewStaffId(st.id)}
                  className="active:opacity-80"
                >
                  <Card
                    variant={newStaffId === st.id ? "elevated" : "default"}
                    className={cn(
                      "p-3 border flex-row items-center justify-between",
                      newStaffId === st.id ? "border-gold" : "border-border-light dark:border-border-dark"
                    )}
                  >
                    <Text style={{ color: colors.text }} className="text-xs font-semibold">
                      {st.name}
                    </Text>
                    {newStaffId === st.id && <IconCheck size={14} color={colors.gold} />}
                  </Card>
                </Pressable>
              ))}
            </View>

            <Button
              label={t("Add Companion to Booking")}
              onPress={handleAddCompanion}
              fullWidth
              className="mt-3"
            />
          </View>
        </ScrollView>
      </BottomSheet>
    </View>
  )
}
