import { useState, useEffect } from "react"
import { Theme, getC } from "./theme"
import { Lang, useT } from "./i18n"
import {
  IconHome,
  IconMapPin,
  IconUser,
  IconWifi,
  IconBattery3,
  IconCalendarEvent,
  IconWallet,
} from "@tabler/icons-react"
import Auth from "./screens/Auth"
import Home from "./screens/Home"
import ShopDetail from "./screens/ShopDetail"
import BookingFlow from "./screens/BookingFlow"
import MyQueue from "./screens/MyQueue"
import Profile from "./screens/Profile"
import MapScreen from "./screens/MapScreen"
import Favorites from "./screens/Favorites"
import BookingsScreen from "./screens/BookingsScreen"
import WalletScreen from "./screens/WalletScreen"
import PointsScreen from "./screens/PointsScreen"
import CommunityUpdates from "./components/CommunityUpdates"
import { Snackbar, GlobalSnackbarHost } from "./components/ui"
import { SHOPS } from "./data"
import { PersonBooking, GroupBookingData } from "./types/booking"

type Screen = { name: "home" } | {
  name: "shop"
  shopId: string
  addingPersonName?: string
  initialTab?: string
  reopenClaimedSlot?: {
    staffId?: string
    fee?: number
    serviceId?: string
    addonIds?: string[]
  } | null
} | {
  name: "book"
  shopId: string
  serviceId?: string
  addonIds?: string[]
  addingPersonName?: string
  initialStep?: "barber" | "group_list" | "confirm"
  isClaimedSlot?: boolean
  claimedStaffId?: string
  depositPaid?: number
} | { name: "profile" } | { name: "favorites" } | { name: "points" } | {
  name: "community"
  shopId: string
}

type Tab = "home" | "bookings" | "map" | "wallet" | "profile"

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem("app_theme")
      if (saved === "dark" || saved === "light") return saved
    } catch {}
    return "light"
  })
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem("app_lang")
      if (saved === "ar" || saved === "en") return saved
    } catch {}
    return "ar"
  })

  useEffect(() => {
    try {
      localStorage.setItem("app_theme", theme)
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark")
      document.documentElement.setAttribute("data-theme", theme)
    }
  }, [theme])

  useEffect(() => {
    try {
      localStorage.setItem("app_lang", lang)
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", lang)
      document.documentElement.setAttribute(
        "dir",
        lang === "ar" ? "rtl" : "ltr",
      )
    }
  }, [lang])

  const [authed, setAuthed] = useState(false)
  const [screen, setScreen] = useState<Screen>({ name: "home" })
  const [groupBookingPersons, setGroupBookingPersons] =
    useState<PersonBooking[]>([])
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [userPoints, setUserPoints] = useState<number>(175)
  const [booked, setBooked] = useState(false)
  const [showBookingToast, setShowBookingToast] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [selectedQueueStaffId, setSelectedQueueStaffId] =
    useState<string | null>(() => {
      try {
        return localStorage.getItem("selected_queue_staff_id")
      } catch {}
      return null
    })
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("barber_favorites")
      return saved ? JSON.parse(saved) : ["s1"]
    } catch {
      return ["s1"]
    }
  })

  const toggleFavorite = (shopId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(shopId)
        ? prev.filter((id) => id !== shopId)
        : [...prev, shopId]
      try {
        localStorage.setItem("barber_favorites", JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const C = getC(theme)
  const T = useT(lang)
  const dir = lang === "ar" ? "rtl" : "ltr"

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"))
  const setLanguage = (newLang: Lang) => {
    if (newLang === lang) return
    if ("startViewTransition" in document) {
      ;(document as unknown as {
        startViewTransition: (cb: () => void) => void
      }).startViewTransition(() => {
        setLang(newLang)
      })
    } else {
      setLang(newLang)
    }
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    if (
      tab === "home" ||
      tab === "map" ||
      tab === "bookings" ||
      tab === "wallet"
    )
      setScreen({ name: "home" })
    else if (tab === "profile") setScreen({ name: "profile" })
  }

  const handleLogout = () => {
    setAuthed(false)
    setBooked(false)
    setShowBookingToast(false)
    setShowQueue(false)
    setScreen({ name: "home" })
    setActiveTab("home")
  }

  const renderScreen = () => {
    if (!authed)
      return <Auth theme={theme} lang={lang} onDone={() => setAuthed(true)} />

    if (showQueue)
      return (
        <MyQueue
          theme={theme}
          lang={lang}
          selectedStaffId={selectedQueueStaffId}
          onClose={() => {
            setShowQueue(false)
            setSelectedQueueStaffId(null)
            try {
              localStorage.removeItem("selected_queue_staff_id")
            } catch {}
          }}
        />
      )

    if (screen.name === "favorites")
      return (
        <Favorites
          theme={theme}
          lang={lang}
          onBack={() => setScreen({ name: "home" })}
          onShopSelect={(id) => setScreen({ name: "shop", shopId: id })}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      )

    if (activeTab === "bookings" && screen.name === "home")
      return (
        <BookingsScreen
          theme={theme}
          lang={lang}
          hasActiveBooking={booked}
          onViewQueue={(staffId) => {
            if (staffId) {
              setSelectedQueueStaffId(staffId)
              try {
                localStorage.setItem("selected_queue_staff_id", staffId)
              } catch {}
            }
            setShowQueue(true)
          }}
          onShopSelect={(id) => setScreen({ name: "shop", shopId: id })}
          onBookNew={() => {
            setActiveTab("home")
            setScreen({ name: "home" })
          }}
          onActivateBooking={() => {
            setBooked(true)
            setShowBookingToast(true)
          }}
        />
      )

    if (activeTab === "map" && screen.name === "home")
      return (
        <MapScreen
          theme={theme}
          lang={lang}
          onShopSelect={(id) => {
            setScreen({ name: "shop", shopId: id })
            setActiveTab("home")
          }}
          onOpenCommunity={(id) => {
            setScreen({ name: "community", shopId: id })
          }}
        />
      )

    if (activeTab === "wallet" && screen.name === "home")
      return <WalletScreen theme={theme} lang={lang} />

    if (screen.name === "home")
      return (
        <Home
          theme={theme}
          lang={lang}
          onToggleTheme={toggleTheme}
          onShopSelect={(id) => setScreen({ name: "shop", shopId: id })}
          hasActiveBooking={booked}
          bookingPosition={(() => {
            try {
              const saved = localStorage.getItem("active_group_booking")
              if (saved) {
                const parsed = JSON.parse(saved)
                return parsed.position || (parsed.isClaimedSlot ? 1 : 2)
              }
            } catch {}
            return 2
          })()}
          bookingShop={(() => {
            try {
              const saved = localStorage.getItem("active_group_booking")
              if (saved) {
                const parsed = JSON.parse(saved)
                return parsed.shopName || "Royal Cut"
              }
            } catch {}
            return "Royal Cut"
          })()}
          onViewQueue={() => setShowQueue(true)}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onViewFavorites={() => setScreen({ name: "favorites" })}
        />
      )

    if (screen.name === "shop")
      return (
        <ShopDetail
          theme={theme}
          lang={lang}
          shopId={screen.shopId}
          addingPersonName={screen.addingPersonName}
          onBackToGroup={() =>
            setScreen({
              name: "book",
              shopId: screen.shopId,
              initialStep: "group_list",
            })
          }
          initialTab={screen.initialTab}
          reopenClaimedSlot={screen.reopenClaimedSlot}
          onBack={() => {
            setScreen({ name: "home" })
          }}
          onBook={(shopId, serviceId, addonIds, resumeStep) =>
            setScreen({
              name: "book",
              shopId,
              serviceId,
              addonIds,
              addingPersonName: screen.addingPersonName,
              initialStep: resumeStep || "barber",
            })
          }
          onClaimSlot={(shopId, staffId, fee, serviceId, addonIds) =>
            setScreen({
              name: "book",
              shopId,
              isClaimedSlot: true,
              claimedStaffId: staffId,
              depositPaid: fee,
              serviceId,
              addonIds,
              initialStep: "confirm",
            })
          }
          isFavorite={favorites.includes(screen.shopId)}
          onToggleFavorite={() => toggleFavorite(screen.shopId)}
          onOpenCommunity={(shopId) => setScreen({ name: "community", shopId })}
        />
      )

    if (screen.name === "community") {
      const shop = SHOPS.find((s) => s.id === screen.shopId) || SHOPS[0]
      return (
        <CommunityUpdates
          theme={theme}
          lang={lang}
          shopId={screen.shopId}
          shopName={shop.name}
          shopNameAr={shop.nameAr}
          isVerified={shop.isVerified}
          onBack={() => {
            if (activeTab === "map") {
              setScreen({ name: "home" })
            } else {
              setScreen({ name: "shop", shopId: screen.shopId })
            }
          }}
        />
      )
    }

    if (screen.name === "book")
      return (
        <BookingFlow
          theme={theme}
          lang={lang}
          shopId={screen.shopId}
          serviceId={screen.serviceId}
          addonIds={screen.addonIds}
          addingPersonName={screen.addingPersonName}
          initialPersons={groupBookingPersons}
          initialStep={screen.initialStep}
          isClaimedSlot={screen.isClaimedSlot}
          claimedStaffId={screen.claimedStaffId}
          depositPaid={screen.depositPaid}
          onUpdatePersons={(updated) => setGroupBookingPersons(updated)}
          onClearAddingPersonName={() => {
            setScreen((prev) =>
              prev.name === "book"
                ? { ...prev, addingPersonName: undefined }
                : prev,
            )
          }}
          onAddPersonRequest={(name, currentPersons) => {
            setGroupBookingPersons(currentPersons)
            setScreen({
              name: "shop",
              shopId: screen.shopId,
              addingPersonName: name,
            })
          }}
          onBackToShopDetailForPerson={() => {
            setScreen({
              name: "shop",
              shopId: screen.shopId,
              addingPersonName: screen.addingPersonName,
            })
          }}
          onBack={(retServiceId, retAddonIds) => {
            if (screen.isClaimedSlot) {
              setScreen({
                name: "shop",
                shopId: screen.shopId,
                initialTab: "staff",
                reopenClaimedSlot: {
                  staffId: screen.claimedStaffId,
                  fee: screen.depositPaid,
                  serviceId: retServiceId || screen.serviceId,
                  addonIds: retAddonIds || screen.addonIds,
                },
              })
            } else {
              setScreen({
                name: "shop",
                shopId: screen.shopId,
                addingPersonName: undefined,
              })
            }
          }}
          onConfirm={(groupData) => {
            if (groupData) {
              try {
                localStorage.setItem(
                  "active_group_booking",
                  JSON.stringify(groupData),
                )
                localStorage.removeItem(`draft_booking_${screen.shopId}`)
              } catch {}
            }
            setBooked(true)
            setShowBookingToast(true)
            setGroupBookingPersons([])
            try {
              localStorage.removeItem(`draft_booking_${screen.shopId}`)
            } catch {}
            setScreen({ name: "home" })
            setActiveTab("home")
            setShowQueue(false)
          }}
        />
      )

    if (screen.name === "profile")
      return (
        <Profile
          theme={theme}
          lang={lang}
          points={userPoints}
          onToggleTheme={toggleTheme}
          onSelectLang={setLanguage}
          onLogout={handleLogout}
          onViewBookings={() => handleTabChange("bookings")}
          onViewWallet={() => handleTabChange("wallet")}
          onViewPoints={() => setScreen({ name: "points" })}
        />
      )

    if (screen.name === "points")
      return (
        <PointsScreen
          theme={theme}
          lang={lang}
          points={userPoints}
          onPointsChange={(newPoints) => setUserPoints(newPoints)}
          onBack={() => setScreen({ name: "profile" })}
        />
      )
  }

  // Only show bottom navigation on the 5 main tabs
  const isMainTab =
    (screen.name === "home" &&
      (activeTab === "home" ||
        activeTab === "bookings" ||
        activeTab === "map" ||
        activeTab === "wallet")) ||
    (screen.name === "profile" && activeTab === "profile")

  const showNav = authed && !showQueue && isMainTab

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          theme === "dark"
            ? "radial-gradient(ellipse at 50% 40%, #1a1714 0%, #080706 70%)"
            : "radial-gradient(ellipse at 50% 40%, #e8e0d4 0%, #c8bfb4 70%)",
        transition: "background 0.4s ease",
      }}
    >
      {/* Phone frame */}
      <div
        id="phone-frame"
        data-phone-frame="true"
        data-theme={theme}
        className={`relative flex flex-col overflow-hidden ${
          theme === "dark" ? "dark" : ""
        }`}
        style={{
          width: 390,
          height: 844,
          backgroundColor: C.bg,
          borderRadius: 50,
          boxShadow:
            theme === "dark"
              ? "0 0 0 10px #1a1916, 0 0 0 11px #2a2720, 0 40px 100px rgba(0,0,0,0.8)"
              : "0 0 0 10px #e8e0d4, 0 0 0 11px #d0c8bc, 0 40px 100px rgba(0,0,0,0.3)",
          transition: "background-color 0.3s ease",
        }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-0 right-0 flex justify-center pt-3 z-20 pointer-events-none">
          <div
            className="rounded-full"
            style={{
              backgroundColor: C.bg,
              width: 120,
              height: 34,
              transition: "background-color 0.3s",
            }}
          />
        </div>

        {/* Status bar */}
        <div className="absolute top-3 left-6 right-6 flex justify-between items-center z-10 pointer-events-none">
          <div className="flex items-center gap-1.5" style={{ color: C.text }}>
            <IconWifi size={14} stroke={2} />
            <IconBattery3 size={16} stroke={2} />
          </div>
          <div className="w-24" />
          <span className="text-xs font-semibold" style={{ color: C.text }}>
            9:41
          </span>
        </div>

        {/* Screen */}
        <div
          className="flex-1 overflow-hidden relative"
          style={{ transition: "background-color 0.3s" }}
        >
          <div
            key={`${lang}-${screen.name}-${activeTab}`}
            className={`w-full h-full ${
              lang === "ar" ? "motion-lang-ar" : "motion-lang-en"
            }`}
          >
            {renderScreen()}
          </div>
        </div>

        {/* Bottom navigation */}
        {showNav && (
          <div
            key={`nav-${lang}`}
            data-bottom-nav="true"
            className={`flex-shrink-0 flex items-center px-2 pb-8 pt-3 ${
              lang === "ar" ? "motion-lang-ar" : "motion-lang-en"
            }`}
            style={{
              backgroundColor: C.navBg,
              borderTop: `1px solid ${C.border}`,
              transition: "background-color 0.3s",
            }}
            dir={dir}
          >
            {[
              { tab: "home" as Tab, Icon: IconHome, label: T.home },
              {
                tab: "bookings" as Tab,
                Icon: IconCalendarEvent,
                label: T.myBookings,
                badge: booked,
              },
              { tab: "map" as Tab, Icon: IconMapPin, label: T.map },
              { tab: "wallet" as Tab, Icon: IconWallet, label: T.wallet },
              { tab: "profile" as Tab, Icon: IconUser, label: T.account },
            ].map(({ tab, Icon, label, badge }) => {
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className="flex-1 flex flex-col items-center gap-1 transition-all duration-150 active:scale-90 relative cursor-pointer"
                >
                  <div className="relative">
                    <Icon
                      size={22}
                      stroke={isActive ? 2.2 : 1.5}
                      style={{
                        color: isActive ? C.gold : C.muted,
                        opacity: isActive ? 1 : 0.45,
                      }}
                    />
                    {badge && (
                      <span className="absolute -top-0.5 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                  </div>
                  <span
                    className="text-xs font-medium whitespace-nowrap"
                    style={{ color: isActive ? C.gold : C.muted }}
                  >
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Global Floating Snackbar Host (persists across all screen transitions) */}
        <GlobalSnackbarHost dir={dir} theme={theme} />

        {/* Reusable Bottom Floating Snackbar */}
        <Snackbar
          open={showBookingToast}
          onClose={() => setShowBookingToast(false)}
          type="success"
          dir={dir}
          theme={theme}
          title={lang === "ar" ? "تم الحجز بنجاح!" : "Booking confirmed!"}
          description={
            lang === "ar"
              ? "اضغط على البانر لمتابعة دورك"
              : "Tap the banner to track your queue"
          }
          onClick={() => {
            setShowQueue(true)
          }}
        />
      </div>
    </div>
  )
}
