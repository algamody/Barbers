import { useState } from "react"
import { Theme, getC } from "./theme"
import { Lang, useT } from "./i18n"
import {
  IconHome,
  IconMapPin,
  IconUser,
  IconWifi,
  IconBattery3,
  IconCircleCheck,
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
import ExportPage from "./export/ExportPage"
import CommunityUpdates from "./components/CommunityUpdates"
import { SHOPS } from "./data"

type Screen =
  | { name: "home" }
  | { name: "shop"; shopId: string }
  | {
      name: "book"
      shopId: string
      serviceId: string
    }
  | { name: "profile" }
  | { name: "favorites" }
  | { name: "points" }
  | { name: "community"; shopId: string }

type Tab = "home" | "bookings" | "map" | "wallet" | "profile"

export default function App() {
  const [exportMode, setExportMode] = useState(false)
  const [theme, setTheme] = useState<Theme>("light")
  const [lang, setLang] = useState<Lang>("ar")
  const [authed, setAuthed] = useState(false)
  const [screen, setScreen] = useState<Screen>({ name: "home" })
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [userPoints, setUserPoints] = useState<number>(175)
  const [booked, setBooked] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
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
          onClose={() => setShowQueue(false)}
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
          onViewQueue={() => setShowQueue(true)}
          onShopSelect={(id) => setScreen({ name: "shop", shopId: id })}
          onBookNew={() => {
            setActiveTab("home")
            setScreen({ name: "home" })
          }}
          onActivateBooking={() => {
            setBooked(true)
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
          bookingPosition={2}
          bookingShop="Royal Cut"
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
          onBack={() => setScreen({ name: "home" })}
          onBook={(shopId, serviceId) =>
            setScreen({ name: "book", shopId, serviceId })
          }
          isFavorite={favorites.includes(screen.shopId)}
          onToggleFavorite={() => toggleFavorite(screen.shopId)}
          onOpenCommunity={(shopId) =>
            setScreen({ name: "community", shopId })
          }
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
          onBack={() => setScreen({ name: "shop", shopId: screen.shopId })}
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
          onBack={() => setScreen({ name: "shop", shopId: screen.shopId })}
          onConfirm={() => {
            setBooked(true)
            setScreen({ name: "home" })
            setActiveTab("home")
            setShowQueue(true)
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
          onExport={() => setExportMode(true)}
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

  const showNav = authed && !showQueue && screen.name !== "book"

  if (exportMode) {
    return <ExportPage onBack={() => setExportMode(false)} />
  }

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

          {/* Booking toast (only on home, non-queue view) */}
          {booked &&
            !showQueue &&
            screen.name === "home" &&
            activeTab === "home" && (
              <div
                className="absolute top-28 left-4 right-4 px-4 py-3 rounded-2xl flex items-center gap-3 z-50 shadow-lg"
                style={{
                  backgroundColor: C.greenBg,
                  border: `1px solid ${C.green}40`,
                  animation: "slideDown 0.3s ease",
                }}
                dir={dir}
              >
                <IconCircleCheck
                  size={24}
                  stroke={2}
                  style={{ color: C.green }}
                  className="flex-shrink-0"
                />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: C.green }}
                  >
                    {lang === "ar" ? "تم الحجز بنجاح!" : "Booking confirmed!"}
                  </p>
                  <p className="text-xs" style={{ color: C.muted }}>
                    {lang === "ar"
                      ? "اضغط على البانر أعلاه لمتابعة دورك"
                      : "Tap the banner above to track your queue"}
                  </p>
                </div>
              </div>
            )}
        </div>

        {/* Bottom navigation */}
        {showNav && (
          <div
            key={`nav-${lang}`}
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
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
