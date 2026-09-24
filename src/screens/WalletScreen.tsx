import { useState, useRef } from "react"
import { Theme, getC } from "@/theme"
import { Lang, useT } from "@/i18n"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { showSnackbar } from "@/components/ui/snackbar"
import { CopyButton } from "@/components/ui/copy-button"
import {
  IconWallet,
  IconArrowDownLeft,
  IconArrowUpRight,
  IconPlus,
  IconCheck,
  IconSparkles,
  IconReceipt2,
  IconCircleCheck,
  IconChevronLeft,
  IconChevronRight,
  IconArrowsExchange,
  IconUser,
  IconAlertCircle,
  IconX,
} from "@tabler/icons-react"

import lypayLogo from "@/public/lypay.svg"
import onepayLogo from "@/public/onepay.png"

const ARABIC_CUSTOMER_NAMES = [
  "أحمد الشريف",
  "محمد الورفلي",
  "أسامة بن علي",
  "طارق القماطي",
  "سالم الترهوني",
  "عمر الكيلاني",
  "عبدالرحمن الزليتني",
  "خالد المنتصر",
  "أيمن المصراتي",
  "معتز الغرياني",
  "حمزة التاجوري",
  "فيصل العبيدي",
  "رمزي القمودي",
]

const CUSTOMER_AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&h=120&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&auto=format",
]

const CUSTOMER_DIRECTORY: Record<string, {
  name: string
  phone: string
  avatar: string
}> = {
  "1231": {
    name: "أحمد الشريف",
    phone: "091-***-1231",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&auto=format",
  },
  "92451": {
    name: "محمد الورفلي",
    phone: "091-***-4521",
    avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop&auto=format",
  },
  "71032": {
    name: "أسامة بن علي",
    phone: "092-***-8810",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format",
  },
  "45819": {
    name: "طارق القماطي",
    phone: "094-***-3209",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&auto=format",
  },
  "63290": {
    name: "سالم الترهوني",
    phone: "091-***-1194",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&auto=format",
  },
  "11048": {
    name: "عمر الكيلاني",
    phone: "092-***-7731",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&auto=format",
  },
  "55420": {
    name: "عبدالرحمن الزليتني",
    phone: "091-***-9876",
    avatar:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&h=120&fit=crop&auto=format",
  },
  "38910": {
    name: "خالد المنتصر",
    phone: "092-***-4433",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&auto=format",
  },
}

export interface Transaction {
  id: string
  type: "credit" | "debit" // دائن (أخضر) أو مدين (أحمر)
  amount: number
  description: string
  date: string
  time: string
  provider?: "onepay" | "lypay" | "service" | "cashback"
}

interface Props {
  theme: Theme
  lang: Lang
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    type: "credit",
    amount: 50,
    description: "شحن رصيد عبر وان باي (ONEPAY)",
    date: "اليوم",
    time: "02:30 م",
    provider: "onepay",
  },
  {
    id: "tx-2",
    type: "debit",
    amount: 35,
    description: "دفع حجز - صالون الأناقة الملكية (حلاقة شعر ولحية)",
    date: "أمس",
    time: "06:15 م",
    provider: "service",
  },
  {
    id: "tx-3",
    type: "credit",
    amount: 100,
    description: "شحن رصيد عبر لي باي (LYPAY)",
    date: "14 سبتمبر 2026",
    time: "11:20 ص",
    provider: "lypay",
  },
  {
    id: "tx-4",
    type: "debit",
    amount: 25,
    description: "دفع حجز - باربر شوب VIP (قص وتصفيف)",
    date: "10 سبتمبر 2026",
    time: "05:40 م",
    provider: "service",
  },
  {
    id: "tx-5",
    type: "credit",
    amount: 20,
    description: "استرداد نقدي (Cashback) - عرض الصيف",
    date: "05 سبتمبر 2026",
    time: "01:10 م",
    provider: "cashback",
  },
  {
    id: "tx-6",
    type: "debit",
    amount: 40,
    description: "دفع حجز - كلاسيك باربر (حلاقة VIP وسشوار)",
    date: "28 أغسطس 2026",
    time: "08:15 م",
    provider: "service",
  },
]

export default function WalletScreen({ theme, lang }: Props) {
  const C = getC(theme)
  const T = useT(lang)
  const dir = lang === "ar" ? "rtl" : "ltr"

  const [balance, setBalance] = useState(() => {
    try {
      const saved = localStorage.getItem("wallet_balance")
      if (saved) return parseFloat(saved)
    } catch {}
    return 48
  })
  const [showTopUpSheet, setShowTopUpSheet] = useState(false)
  const [selectedProvider, setSelectedProvider] =
    useState<"onepay" | "lypay" | null>(null)
  const [amountInput, setAmountInput] = useState<string>("")
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all")

  // Copy ID ref
  const copyBtnRef = useRef<HTMLButtonElement>(null)

  // Peer-to-peer transfer states
  const [showTransferSheet, setShowTransferSheet] = useState(false)
  const [transferRecipientId, setTransferRecipientId] = useState("")
  const [verifiedRecipient, setVerifiedRecipient] = useState<{
    id: string
    name: string
    phone?: string
    avatar?: string
  } | null>(null)
  const [isVerifyingRecipient, setIsVerifyingRecipient] = useState(false)
  const [transferAmount, setTransferAmount] = useState("")
  const [transferError, setTransferError] = useState<string | null>(null)
  const [transferAmountError, setTransferAmountError] = useState<string | null>(
    null,
  )

  const currency = lang === "ar" ? "د.ل" : "LYD"

  const handleVerifyRecipient = () => {
    const raw = transferRecipientId.replace(/[^0-9]/g, "").trim()
    if (!raw) {
      setTransferError(
        lang === "ar"
          ? "يرجى إدخال الرقم التعريفي للعميل"
          : "Please enter customer ID",
      )
      return
    }

    if (raw === "84920") {
      setTransferError(
        lang === "ar"
          ? "لا يمكنك تحويل رصيد إلى نفس حسابك"
          : "You cannot transfer to your own account",
      )
      return
    }

    setIsVerifyingRecipient(true)
    setTransferError(null)

    setTimeout(() => {
      setIsVerifyingRecipient(false)
      const found = CUSTOMER_DIRECTORY[raw]
      if (found) {
        setVerifiedRecipient({
          id: raw,
          name: found.name,
          phone: found.phone,
          avatar: found.avatar,
        })
      } else if (raw.length >= 3) {
        const numHash = raw
          .split("")
          .reduce((acc, c) => acc + c.charCodeAt(0), 0)
        const name =
          ARABIC_CUSTOMER_NAMES[numHash % ARABIC_CUSTOMER_NAMES.length]
        const avatar = CUSTOMER_AVATARS[numHash % CUSTOMER_AVATARS.length]
        const lastDigits = raw.slice(-4).padStart(4, "0")
        const phone = `091-***-${lastDigits}`
        setVerifiedRecipient({
          id: raw,
          name,
          phone,
          avatar,
        })
      } else {
        setTransferError(
          lang === "ar"
            ? "الرقم التعريفي غير صحيح أو قصير جداً"
            : "Customer ID is invalid or too short",
        )
      }
    }, 350)
  }

  const parsedTransferAmount = parseFloat(transferAmount)
  const isValidTransferAmount =
    !isNaN(parsedTransferAmount) && parsedTransferAmount > 0

  const handleConfirmTransfer = () => {
    if (!verifiedRecipient) return
    const amt = parseFloat(transferAmount)
    if (isNaN(amt) || amt <= 0) {
      setTransferAmountError(
        lang === "ar"
          ? "يرجى إدخال قيمة صحيحة للتحويل"
          : "Please enter a valid transfer amount",
      )
      return
    }

    if (amt > balance) {
      setTransferAmountError(
        lang === "ar"
          ? `رصيد المحفظة الحالي (${balance.toFixed(2)} ${currency}) غير كافٍ لإتمام التحويل`
          : `Insufficient wallet balance (${balance.toFixed(2)} ${currency})`,
      )
      return
    }

    setBalance((prev) => {
      const next = prev - amt
      try {
        localStorage.setItem("wallet_balance", next.toString())
      } catch {}
      return next
    })

    const now = new Date()
    const timeStr = now.toLocaleTimeString(lang === "ar" ? "ar-LY" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: "debit",
      amount: amt,
      description:
        lang === "ar"
          ? `تحويل رصيد إلى ${verifiedRecipient.name} (#${verifiedRecipient.id})`
          : `Transfer to ${verifiedRecipient.name} (#${verifiedRecipient.id})`,
      date: lang === "ar" ? "اليوم" : "Today",
      time: timeStr,
      provider: "service",
    }

    setTransactions((prev) => [newTx, ...prev])
    setShowTransferSheet(false)
    setTransferRecipientId("")
    setVerifiedRecipient(null)
    setTransferAmount("")
    setTransferError(null)
    setTransferAmountError(null)

    showSnackbar({
      title:
        lang === "ar"
          ? "تمت عملية التحويل بنجاح"
          : "Transfer completed successfully",
      description:
        lang === "ar"
          ? `تم تحويل ${amt.toFixed(2)} ${currency} بنجاح`
          : `Successfully transferred ${amt.toFixed(2)} ${currency}`,
      type: "success",
    })
  }

  const parsedAmount = parseFloat(amountInput)
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0

  const handleConfirmTopUp = () => {
    if (!selectedProvider || !isValidAmount) return

    const topUpValue = parsedAmount
    setBalance((prev) => {
      const next = prev + topUpValue
      try {
        localStorage.setItem("wallet_balance", next.toString())
      } catch {}
      return next
    })

    const now = new Date()
    const timeStr = now.toLocaleTimeString(lang === "ar" ? "ar-LY" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })

    const providerLabel = selectedProvider === "onepay" ? "ONEPAY" : "LYPAY"
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: "credit",
      amount: topUpValue,
      description:
        lang === "ar"
          ? `شحن رصيد عبر ${providerLabel}`
          : `Wallet top-up via ${providerLabel}`,
      date: lang === "ar" ? "اليوم" : "Today",
      time: timeStr,
      provider: selectedProvider,
    }

    setTransactions((prev) => [newTx, ...prev])
    setShowTopUpSheet(false)
    setSelectedProvider(null)
    setAmountInput("")

    // Trigger celebratory toast
    showSnackbar({
      title:
        lang === "ar"
          ? "تم شحن المحفظة بنجاح"
          : "Wallet topped up successfully",
      description:
        lang === "ar"
          ? `تم شحن ${topUpValue.toFixed(2)} ${currency} بنجاح عبر ${providerLabel}`
          : `Successfully topped up ${topUpValue.toFixed(2)} ${currency} via ${providerLabel}`,
      type: "success",
    })
  }

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true
    return tx.type === filter
  })

  return (
    <div
      className="flex flex-col h-full relative"
      style={{ backgroundColor: C.bg }}
    >
      {/* Screen Header */}
      <div
        className="px-5 pt-12 pb-4 border-b border-[var(--border)]"
        dir={dir}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">
              {lang === "ar" ? "المحفظة" : "Wallet"}
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              {lang === "ar"
                ? "إدارة الرصيد وعمليات الشحن والمدفوعات"
                : "Manage balance, top-ups, and payments"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] border border-[var(--primary)]/20 shadow-xs">
            <IconWallet size={22} stroke={2} />
          </div>
        </div>
      </div>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" dir={dir}>
        {/* 1. Wallet Balance Card (قيمة المحفظة) */}
        <Card className="rounded-3xl p-5 bg-[var(--card)] border border-[var(--border)] shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold tracking-wider text-[var(--primary)] flex items-center gap-1.5 uppercase">
                {lang === "ar" ? "رصيد المحفظة" : "Wallet Balance"}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
                {balance.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-[var(--primary)]">
                {currency}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border)]/60 flex items-center gap-2 text-xs">
              <span className="text-[var(--muted-foreground)]">
                {lang === "ar" ? "الرقم التعريفي:" : "Account ID:"}
              </span>
              <span
                onClick={() => copyBtnRef.current?.click()}
                className="font-mono font-bold text-sm text-[var(--foreground)] underline underline-offset-4 decoration-[var(--primary)] decoration-2 hover:opacity-80 cursor-pointer select-all"
                title={lang === "ar" ? "انقر للنسخ" : "Click to copy"}
              >
                #84920
              </span>
              <CopyButton
                ref={copyBtnRef}
                text="84920"
                lang={lang}
                title={lang === "ar" ? "نسخ الرقم التعريفي" : "Copy ID"}
              />
            </div>
          </div>
        </Card>

        {/* 2. Action Buttons (شحن المحفظة + تحويل مال بين العملاء) */}
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            size="lg"
            onClick={() => {
              setSelectedProvider(null)
              setAmountInput("")
              setShowTopUpSheet(true)
            }}
            className="rounded-2xl h-12 text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            <IconPlus size={18} stroke={2.5} />
            <span>{lang === "ar" ? "شحن المحفظة" : "Top Up"}</span>
          </Button>

          <Button
            size="lg"
            onClick={() => {
              setTransferRecipientId("")
              setVerifiedRecipient(null)
              setTransferAmount("")
              setTransferError(null)
              setTransferAmountError(null)
              setShowTransferSheet(true)
            }}
            className="rounded-2xl h-12 text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            <IconArrowsExchange size={18} stroke={2.2} />
            <span>{lang === "ar" ? "تحويل الأموال" : "Transfer Money"}</span>
          </Button>
        </div>

        {/* 3. Transaction History Section (سجل المحفظة دائن أو مدين) */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <IconReceipt2
                size={18}
                stroke={2}
                className="text-[var(--muted-foreground)]"
              />
              <h2 className="text-sm font-bold text-[var(--foreground)]">
                {lang === "ar" ? "سجل المحفظة" : "Transaction History"}
              </h2>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-2.5">
            {filteredTransactions.map((tx) => {
              const isCredit = tx.type === "credit"
              return (
                <Card
                  key={tx.id}
                  className="rounded-2xl p-3.5 border-[var(--border)] bg-[var(--card)] hover:border-[var(--border)]/80 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Direction Icon & Description */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
                          isCredit
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                            : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25"
                        }`}
                      >
                        {isCredit ? (
                          <IconArrowDownLeft size={20} stroke={2.4} />
                        ) : (
                          <IconArrowUpRight size={20} stroke={2.4} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-xs font-bold text-[var(--foreground)] leading-snug break-words">
                          {tx.description}
                        </p>
                        <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                          {tx.date} • {tx.time}
                        </p>
                      </div>
                    </div>

                    {/* Amount & Type Badge (أحمر وأخضر) */}
                    <div className="text-end flex-shrink-0 pt-0.5 whitespace-nowrap">
                      <p
                        className={`text-sm font-extrabold ${
                          isCredit
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                        dir="ltr"
                      >
                        {isCredit ? "+" : "-"}
                        {tx.amount.toFixed(2)} {currency}
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })}

            {filteredTransactions.length === 0 && (
              <div className="py-8 text-center text-[var(--muted-foreground)]">
                <IconReceipt2
                  size={36}
                  stroke={1.5}
                  className="mx-auto mb-2 opacity-40"
                />
                <p className="text-xs">
                  {lang === "ar"
                    ? "لا توجد عمليات مسجلة"
                    : "No transactions found"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Top-Up Bottom Sheet (خطوتان: أنواع الشحن أولاً، ثم إدخال القيمة وتأكيد الشحن) */}
      <BottomSheet
        open={showTopUpSheet}
        onClose={() => {
          setShowTopUpSheet(false)
          setSelectedProvider(null)
          setAmountInput("")
        }}
        title={
          selectedProvider
            ? lang === "ar"
              ? "تحديد مبلغ الشحن"
              : "Enter Top-up Amount"
            : lang === "ar"
              ? "شحن رصيد المحفظة"
              : "Top Up Wallet Balance"
        }
        description={
          selectedProvider
            ? lang === "ar"
              ? "أدخل القيمة المراد إضافتها إلى محفظتك"
              : "Enter the amount to add to your wallet"
            : lang === "ar"
              ? "اختر طريقة الدفع للمتابعة"
              : "Select a payment method to proceed"
        }
        dir={dir}
      >
        <div className="py-2" dir={dir}>
          {!selectedProvider ? (
            /* Step 1: Payment Methods Selection Only (عرض انواع الشحن فقط بدون مبالغ) */
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[var(--muted-foreground)]">
                {lang === "ar"
                  ? "وسائل الدفع المتاحة"
                  : "Available Payment Methods"}
              </label>

              {/* ONEPAY Option */}
              <button
                type="button"
                onClick={() => setSelectedProvider("onepay")}
                className="w-full flex items-center justify-between py-3.5 px-4 rounded-2xl transition-all duration-200 active:scale-[0.98] cursor-pointer hover:bg-[var(--secondary)]/40 border border-[var(--border)]/70 bg-[var(--card)]"
              >
                {/* Arrow */}
                <div className="text-[var(--muted-foreground)]">
                  {dir === "rtl" ? (
                    <IconChevronLeft size={18} stroke={2} />
                  ) : (
                    <IconChevronRight size={18} stroke={2} />
                  )}
                </div>

                {/* Service Info & Logo */}
                <div className="flex items-center gap-3">
                  <div className="text-end">
                    <span className="text-sm font-bold text-[var(--foreground)] block">
                      ONEPAY (وان باي)
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">
                      {lang === "ar"
                        ? "الدفع الفوري السريع"
                        : "Fast instant payment"}
                    </span>
                  </div>

                  {/* ONEPAY Logo Container */}
                  <div className="w-12 h-10 rounded-xl bg-black flex items-center justify-center p-1 border border-zinc-800 shadow-2xs flex-shrink-0">
                    <img
                      src={onepayLogo}
                      alt="ONEPAY"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </button>

              {/* LYPAY Option */}
              <button
                type="button"
                onClick={() => setSelectedProvider("lypay")}
                className="w-full flex items-center justify-between py-3.5 px-4 rounded-2xl transition-all duration-200 active:scale-[0.98] cursor-pointer hover:bg-[var(--secondary)]/40 border border-[var(--border)]/70 bg-[var(--card)]"
              >
                {/* Arrow */}
                <div className="text-[var(--muted-foreground)]">
                  {dir === "rtl" ? (
                    <IconChevronLeft size={18} stroke={2} />
                  ) : (
                    <IconChevronRight size={18} stroke={2} />
                  )}
                </div>

                {/* Service Info & Logo */}
                <div className="flex items-center gap-3">
                  <div className="text-end">
                    <span className="text-sm font-bold text-[var(--foreground)] block">
                      LYPAY (لي باي)
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">
                      {lang === "ar"
                        ? "الدفع الإلكتروني عبر لي باي"
                        : "Direct LYPAY payment"}
                    </span>
                  </div>

                  {/* LYPAY Logo Container */}
                  <div className="w-12 h-10 rounded-xl bg-[#0b2444] flex items-center justify-center p-1 border border-[#1b3d6c] shadow-2xs flex-shrink-0">
                    <img
                      src={lypayLogo}
                      alt="LYPAY"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </button>
            </div>
          ) : (
            /* Step 2: Custom Amount Input & Confirm Button (بدون قيم جاهزة مع زر تأكيد) */
            <div className="space-y-4">
              {/* Selected Method Summary Box */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--secondary)]/40 border border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-8 rounded-xl flex items-center justify-center p-1 border shadow-2xs flex-shrink-0 ${
                      selectedProvider === "onepay"
                        ? "bg-black border-zinc-800"
                        : "bg-[#0b2444] border-[#1b3d6c]"
                    }`}
                  >
                    <img
                      src={
                        selectedProvider === "onepay" ? onepayLogo : lypayLogo
                      }
                      alt={selectedProvider === "onepay" ? "ONEPAY" : "LYPAY"}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--foreground)] block">
                      {selectedProvider === "onepay"
                        ? "ONEPAY (وان باي)"
                        : "LYPAY (لي باي)"}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {lang === "ar"
                        ? "طريقة الدفع المختارة"
                        : "Selected payment method"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProvider(null)}
                  className="text-xs font-bold text-[var(--primary)] hover:underline px-2 py-1 rounded-lg hover:bg-[var(--primary)]/10 transition-colors cursor-pointer"
                >
                  {lang === "ar" ? "تغيير" : "Change"}
                </button>
              </div>

              {/* Amount Input Field - No Presets */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--muted-foreground)]">
                  {lang === "ar" ? "قيمة الشحن المطلوبة" : "Top-up Amount"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    autoFocus
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder={
                      lang === "ar"
                        ? "أدخل القيمة بالدينار..."
                        : "Enter amount in LYD..."
                    }
                    className="w-full h-12 px-4 pe-14 rounded-2xl bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 text-base font-bold text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--muted-foreground)]"
                    dir={dir}
                  />
                  <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[var(--muted-foreground)] pointer-events-none">
                    {currency}
                  </span>
                </div>
              </div>

              {/* Confirm Button */}
              <Button
                size="default"
                fullWidth
                disabled={!isValidAmount}
                onClick={handleConfirmTopUp}
                className="h-11 rounded-2xl font-bold cursor-pointer transition-all shadow-xs mt-2"
              >
                {lang === "ar"
                  ? isValidAmount
                    ? `تأكيد شحن ${parsedAmount} ${currency}`
                    : "تأكيد الشحن"
                  : isValidAmount
                    ? `Confirm ${parsedAmount} ${currency}`
                    : "Confirm Top-up"}
              </Button>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* 5. Transfer Bottom Sheet (تحويل مال بين العملاء) */}
      <BottomSheet
        open={showTransferSheet}
        onClose={() => {
          setShowTransferSheet(false)
          setTransferRecipientId("")
          setVerifiedRecipient(null)
          setTransferAmount("")
          setTransferError(null)
          setTransferAmountError(null)
        }}
        title={
          lang === "ar" ? "تحويل مال بين العملاء" : "Transfer Money to Customer"
        }
        description={
          lang === "ar"
            ? "تحويل فوري وآمن من رصيدك إلى عميل آخر"
            : "Instant and secure transfer to another customer"
        }
        dir={dir}
      >
        <div className="py-2 space-y-4" dir={dir}>
          {/* Customer ID Input + Verify Button */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--muted-foreground)]">
              {lang === "ar"
                ? "الرقم التعريفي للعميل المستلم"
                : "Recipient Customer ID"}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  disabled={!!verifiedRecipient}
                  value={transferRecipientId}
                  onChange={(e) => {
                    setTransferRecipientId(e.target.value)
                    setTransferError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !verifiedRecipient) {
                      handleVerifyRecipient()
                    }
                  }}
                  placeholder={
                    lang === "ar" ? "أدخل الرقم (مثال: 92451)" : "e.g. 92451"
                  }
                  className="w-full h-11 px-3.5 pe-9 rounded-xl bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 text-sm font-bold text-[var(--foreground)] outline-none transition-all disabled:opacity-75 disabled:bg-[var(--secondary)]/30 placeholder:text-[var(--muted-foreground)]"
                  dir={dir}
                />
                {verifiedRecipient && (
                  <button
                    type="button"
                    onClick={() => {
                      setVerifiedRecipient(null)
                      setTransferRecipientId("")
                      setTransferAmount("")
                      setTransferAmountError(null)
                    }}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-rose-500 p-1 cursor-pointer transition-colors"
                    title={
                      lang === "ar"
                        ? "إلغاء واختيار عميل آخر"
                        : "Change recipient"
                    }
                  >
                    <IconX size={16} stroke={2} />
                  </button>
                )}
              </div>

              {!verifiedRecipient && (
                <Button
                  type="button"
                  onClick={handleVerifyRecipient}
                  disabled={!transferRecipientId.trim() || isVerifyingRecipient}
                  className="h-11 px-4 rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                >
                  {isVerifyingRecipient ? (
                    <span className="inline-block animate-spin">⏳</span>
                  ) : (
                    <span>{lang === "ar" ? "تحقق" : "Verify"}</span>
                  )}
                </Button>
              )}
            </div>

            {/* Error Message */}
            {transferError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-500 mt-1">
                <IconAlertCircle size={14} stroke={2} className="shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            {!verifiedRecipient && !transferError && (
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                {lang === "ar"
                  ? "أدخل الرقم التعريفي واضغط تحقق لعرض اسم العميل"
                  : "Enter customer ID and click verify to fetch customer name"}
              </p>
            )}
          </div>

          {/* Verified Customer Card (اسم وصورة العميل والرقم التعريفي والهاتف) */}
          {verifiedRecipient && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between animate-sheet-enter">
              <div className="flex items-center gap-3">
                {/* صورة العميل (إن وجدت) */}
                <div className="w-13 h-13 rounded-2xl overflow-hidden bg-[var(--secondary)]/60 border border-[var(--border)] shrink-0 shadow-2xs">
                  {verifiedRecipient.avatar ? (
                    <img
                      src={verifiedRecipient.avatar}
                      alt={verifiedRecipient.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--primary)] font-bold text-sm bg-[var(--primary)]/10">
                      <IconUser size={22} stroke={2} />
                    </div>
                  )}
                </div>

                {/* تفاصيل العميل */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-[var(--foreground)]">
                      {verifiedRecipient.name}
                    </span>
                    <IconCircleCheck
                      size={16}
                      stroke={2.5}
                      className="text-emerald-500 shrink-0"
                    />
                  </div>

                  <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                    <span>
                      {lang === "ar" ? "الرقم التعريفي:" : "Customer ID:"}
                    </span>
                    <span
                      className="font-mono font-bold text-[var(--foreground)]"
                      dir="ltr"
                    >
                      #{verifiedRecipient.id}
                    </span>
                  </p>

                  {verifiedRecipient.phone && (
                    <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                      <span>{lang === "ar" ? "رقم الهاتف:" : "Phone:"}</span>
                      <span
                        className="font-mono font-medium text-[var(--foreground)] tracking-wide"
                        dir="ltr"
                      >
                        {verifiedRecipient.phone}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 self-start mt-0.5">
                {lang === "ar" ? "تم التحقق" : "Verified"}
              </span>
            </div>
          )}

          {/* Transfer Amount Input & Confirmation */}
          {verifiedRecipient && (
            <div className="space-y-4 pt-1 animate-sheet-enter">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--muted-foreground)]">
                  {lang === "ar" ? "القيمة المراد تحويلها" : "Transfer Amount"}
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    autoFocus
                    value={transferAmount}
                    onChange={(e) => {
                      setTransferAmount(e.target.value)
                      setTransferAmountError(null)
                    }}
                    placeholder={
                      lang === "ar" ? "أدخل المبلغ..." : "Enter amount..."
                    }
                    className="w-full h-12 px-4 pe-14 rounded-2xl bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 text-base font-bold text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--muted-foreground)]"
                    dir={dir}
                  />
                  <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[var(--muted-foreground)] pointer-events-none">
                    {currency}
                  </span>
                </div>

                {transferAmountError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500 mt-1">
                    <IconAlertCircle
                      size={14}
                      stroke={2}
                      className="shrink-0"
                    />
                    <span>{transferAmountError}</span>
                  </div>
                )}
              </div>

              {/* Confirm Transfer Button */}
              <Button
                size="default"
                fullWidth
                disabled={!isValidTransferAmount}
                onClick={handleConfirmTransfer}
                className="h-11 rounded-2xl font-bold cursor-pointer transition-all shadow-xs mt-2"
              >
                {lang === "ar" ? "تأكيد التحويل" : "Confirm Transfer"}
              </Button>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  )
}
