// DuoWallet Global State & Data Bible
const DataBible = {
  todayFormatted: "24 Oct 2026",
  daysLeftInMonth: 8,
  currentUser: {
    id: "usr_rina",
    name: "Rina",
    role: "user",
    avatarColor: "#6366F1",
    avatarUrl: null,
    email: "rina@example.com",
    phone: "+62 812-3456-7890",
    bio: "Smart saver & personal finance enthusiast"
  },
  partner: {
    id: "usr_dimas",
    name: "Dimas",
    role: "user",
    avatarColor: "#F97316",
    joinedDate: "3 Sep 2026",
    email: "dimas@example.com"
  },
  // Site Customization Config (Controlled by Super Admin)
  siteConfig: {
    appName: "DuoWallet",
    tagline: "Your money. Together when you choose.",
    announcement: "",
    primaryColor: "#6366F1",
    accentColor: "#10B981",
    defaultCurrency: "IDR (Rp)",
    featuresEnabled: {
      aiCopilot: true,
      collabSpace: true,
      safeToSpend: true,
      exportReport: true
    }
  },
  collabSpace: {
    name: "Rina & Dimas",
    active: true,
    inviteCode: "K7M2QX",
    defaultSplit: "50/50",
    partnerJoined: true
  },
  privacySettings: {
    shareNotes: false,
    shareReceipt: false,
    shareSourceWallet: false,
    autoSync: false
  },
  wallets: [
    { id: "w_bca", name: "Rina BCA", type: "Bank", balance: 4100000, scope: "personal", icon: "account_balance" },
    { id: "w_gopay", name: "Rina GoPay", type: "E-wallet", balance: 650000, scope: "personal", icon: "account_balance_wallet" },
    { id: "w_cash", name: "Rina Cash", type: "Cash", balance: 250000, scope: "personal", icon: "payments" },
    { id: "w_joint_bca", name: "Joint BCA", type: "Bank", balance: 8450000, scope: "collab", sync: "Manual", icon: "account_balance" },
    { id: "w_household_cash", name: "Household Cash", type: "Cash", balance: 400000, scope: "collab", sync: "Manual", icon: "payments" }
  ],
  budgets: {
    personal: [
      { id: "b_food", category: "Food & Drinks", limit: 800000, spent: 700000, icon: "restaurant" },
      { id: "b_trans", category: "Transport", limit: 600000, spent: 420000, icon: "directions_car" },
      { id: "b_shop", category: "Shopping", limit: 500000, spent: 580000, icon: "shopping_bag" },
      { id: "b_ent", category: "Entertainment", limit: 300000, spent: 200000, icon: "movie" },
      { id: "b_groc", category: "Groceries", limit: 300000, spent: 150000, icon: "local_grocery_store" }
    ],
    collab: [
      { id: "cb_groc", category: "Groceries", limit: 1400000, spent: 1180000, icon: "local_grocery_store" },
      { id: "cb_bills", category: "Bills & Utilities", limit: 1500000, spent: 1300000, icon: "receipt_long" },
      { id: "cb_food", category: "Food & Drinks", limit: 800000, spent: 520000, icon: "restaurant" },
      { id: "cb_shop", category: "Shopping", limit: 300000, spent: 350000, icon: "shopping_bag" }
    ]
  },
  goals: {
    personal: [
      {
        id: "g_headphones",
        name: "New Headphones",
        target: 500000,
        saved: 150000,
        dueDate: "30 Nov 2026",
        daysLeft: 37,
        status: "At risk",
        monthlyNeeded: 290000,
        weeklyNeeded: 66000,
        dailyNeeded: 9500,
        estimatedCompletion: "14 Dec 2026",
        icon: "headphones",
        whyAtRisk: "Shopping is 116% of budget and Food & Drinks is on pace to pass its limit, leaving less than the Rp 290.000/month this goal needs.",
        suggestion: "Cut Rp 150.000 from Food & Drinks to get back on track"
      },
      {
        id: "g_safetynet",
        name: "Safety Net",
        target: 10000000,
        saved: 2500000,
        dueDate: "No deadline",
        status: "On track",
        monthlyNeeded: 500000,
        icon: "shield"
      }
    ],
    collab: [
      {
        id: "cg_trip",
        name: "Anniversary Trip",
        target: 4000000,
        saved: 2400000,
        dueDate: "15 Dec 2026",
        daysLeft: 52,
        status: "On track",
        monthlyNeeded: 940000,
        icon: "flight_takeoff",
        contributions: {
          rina: 1100000,
          dimas: 1300000
        }
      },
      {
        id: "cg_emergency",
        name: "Joint Emergency Fund",
        target: 20000000,
        saved: 5000000,
        dueDate: "No deadline",
        status: "On track",
        monthlyNeeded: 1000000,
        icon: "savings",
        contributions: {
          rina: 2300000,
          dimas: 2700000
        }
      }
    ]
  },
  bills: {
    personal: [
      { id: "bill_telk", name: "Telkomsel", amount: 150000, dueDate: "27 Oct 2026", status: "Due soon", category: "Bills & Utilities", isContribution: false },
      { id: "bill_anniv", name: "Contribution to Anniversary Trip", amount: 220000, dueDate: "28 Oct 2026", status: "Scheduled", category: "Contribution", isContribution: true },
      { id: "bill_gym", name: "Gym membership", amount: 250000, dueDate: "30 Oct 2026", status: "Due soon", category: "Health", isContribution: false },
      { id: "bill_spot", name: "Spotify", amount: 86000, dueDate: "5 Nov 2026", status: "Upcoming", category: "Subscriptions", isContribution: false }
    ],
    collab: [
      { id: "cbill_pln", name: "PLN Electricity", amount: 450000, dueDate: "27 Oct 2026", status: "Due soon", wallet: "Joint BCA", category: "Bills & Utilities" },
      { id: "cbill_indihome", name: "IndiHome Internet", amount: 385000, dueDate: "28 Oct 2026", status: "Due soon", wallet: "Joint BCA", category: "Bills & Utilities" },
      { id: "cbill_netflix", name: "Netflix", amount: 186000, dueDate: "30 Oct 2026", status: "Due soon", wallet: "Joint BCA", category: "Subscriptions" }
    ]
  },
  transactions: [
    {
      id: "tx_indomaret",
      merchant: "Indomaret",
      category: "Groceries",
      amount: -87500,
      walletId: "w_bca",
      date: "24 Oct 2026",
      hasReceipt: true,
      shared: true,
      sharedWallet: "Joint BCA",
      split: "50/50",
      dimasOwes: 43750,
      isSettled: false,
      notes: "Weekly pantry essentials",
      items: [
        { name: "Ultra Milk 1L", qty: 2, price: 38000 },
        { name: "Sari Roti Tawar", qty: 1, price: 15500 },
        { name: "Telur Ayam 10s", qty: 1, price: 26000 },
        { name: "Indomie Goreng", qty: 2, price: 8000 }
      ],
      sharedBy: "Rina"
    },
    {
      id: "tx_grab",
      merchant: "Grab",
      category: "Transport",
      amount: -32000,
      walletId: "w_gopay",
      date: "24 Oct 2026",
      hasReceipt: false,
      shared: false
    },
    {
      id: "tx_warung",
      merchant: "Warung Bu Sri",
      category: "Food & Drinks",
      amount: -65000,
      walletId: "w_cash",
      date: "23 Oct 2026",
      hasReceipt: false,
      shared: true,
      sharedWallet: "Joint BCA",
      split: "50/50",
      dimasOwes: 32500,
      isSettled: false,
      sharedBy: "Rina"
    },
    {
      id: "tx_kopi",
      merchant: "Kopi Kenangan",
      category: "Food & Drinks",
      amount: -38000,
      walletId: "w_gopay",
      date: "23 Oct 2026",
      hasReceipt: false,
      shared: false
    },
    {
      id: "tx_tokopedia",
      merchant: "Tokopedia",
      category: "Shopping",
      amount: -245000,
      walletId: "w_bca",
      date: "22 Oct 2026",
      hasReceipt: true,
      shared: true,
      sharedWallet: "Joint BCA",
      split: "50/50",
      dimasOwes: 122500,
      isSettled: false,
      sharedBy: "Rina"
    },
    {
      id: "tx_sate",
      merchant: "Sate Khas Senayan",
      category: "Food & Drinks",
      amount: -242500,
      walletId: "w_bca",
      date: "12 Oct 2026",
      hasReceipt: false,
      shared: true,
      sharedWallet: "Joint BCA",
      split: "50/50",
      dimasOwes: 121250,
      isSettled: false,
      sharedBy: "Rina"
    }
  ],
  suggestedToShare: [
    { id: "sug_pizzahut", merchant: "Pizza Hut Delivery", amount: -148000, date: "18 Oct 2026", category: "Food & Drinks", wallet: "Rina BCA", reason: "Dining out with Dimas" },
    { id: "sug_esteler", merchant: "Es Teler 77", amount: -76500, date: "16 Oct 2026", category: "Food & Drinks", wallet: "Rina BCA", reason: "Dining out with Dimas" },
    { id: "sug_sushitei", merchant: "Sushi Tei", amount: -130000, date: "14 Oct 2026", category: "Food & Drinks", wallet: "Rina BCA", reason: "Dining out with Dimas" }
  ],
  collabActivity: [
    { id: "ca_indomaret", merchant: "Indomaret", category: "Groceries", amount: -87500, wallet: "Joint BCA", date: "Today", actor: "Rina", type: "shared_rina", owesText: "Dimas owes Rina Rp 43.750" },
    { id: "ca_alfamart", merchant: "Alfamart", category: "Groceries", amount: -64000, wallet: "Joint BCA", date: "Today", actor: "Dimas", type: "shared_dimas", owesText: "Not split" },
    { id: "ca_warung", merchant: "Warung Bu Sri", category: "Food & Drinks", amount: -65000, wallet: "Joint BCA", date: "23 Oct 2026", actor: "Rina", type: "shared_rina", owesText: "Dimas owes Rina Rp 32.500" },
    { id: "ca_gas", merchant: "Gas refill", category: "Bills & Utilities", amount: -45000, wallet: "Household Cash", date: "22 Oct 2026", actor: "Dimas", type: "direct", owesText: "Paid from Household Cash" },
    { id: "ca_tokopedia", merchant: "Tokopedia", category: "Shopping", amount: -245000, wallet: "Joint BCA", date: "22 Oct 2026", actor: "Rina", type: "shared_rina", owesText: "Dimas owes Rina Rp 122.500" }
  ],
  activityLogs: [
    { time: "Today 11:20", text: "Dimas commented on Indomaret" },
    { time: "Today 10:42", text: "Rina shared Indomaret (Rp 87.500)" },
    { time: "Today 09:15", text: "Dimas shared Alfamart (Rp 64.000)" },
    { time: "22 Oct 15:30", text: "Dimas added Gas refill (Rp 45.000) in Household Cash" },
    { time: "1 Oct 09:00", text: "Rina contributed Rp 3.500.000 to Joint BCA" },
    { time: "1 Oct 08:30", text: "Dimas contributed Rp 4.000.000 to Joint BCA" }
  ],
  healthScore: {
    total: 72,
    grade: "Good",
    trend: "+3 vs last month",
    factors: [
      { name: "Savings rate", score: 85, detail: "21% saved this month", status: "Good" },
      { name: "Fixed bills vs income", score: 95, detail: "7% of monthly income", status: "Excellent" },
      { name: "Safety Net coverage", score: 45, detail: "1.2 months of expenses (aim for 3)", status: "Needs attention" },
      { name: "Budget adherence", score: 70, detail: "4 of 5 categories within limit", status: "Good" },
      { name: "Logging consistency", score: 65, detail: "17 of 24 days active", status: "Fair" }
    ]
  }
};

// Currency formatter: "Rp 1.250.000"
function formatMoney(amount, sign = false) {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = "Rp " + abs.toLocaleString("id-ID");
  if (sign) {
    if (isNegative) return "−" + formatted;
    if (amount > 0) return "+" + formatted;
  }
  return formatted;
}
window.formatMoney = formatMoney;

window.translations = {
  id: {
    personal: "Pribadi",
    collab: "Bersama",
    budgets: "Anggaran",
    wallets: "Dompet",
    more: "Lainnya",
    personalSpace: "Ruang Pribadi",
    collabSpace: "Ruang Bersama (Collab)",
    switchToCollab: "Beralih ke Collab Space",
    switchToPersonal: "Beralih ke Personal Space",
    sharedPoolDesc: "Rina & Dimas • Kas Bersama",
    privateDesc: "100% Khusus & Privat untuk Rina",
    personalBalance: "Saldo Pribadi",
    jointPool: "Saldo Kas Bersama",
    safeToSpend: "Aman Dibelanjakan",
    perDay: "/hari",
    dimasOwesYou: "Dimas berhutang padamu",
    fromSharedExpenses: "Dari 4 transaksi bersama",
    settleUp: "Selesaikan",
    allSettled: "Semua Lunas & Beres!",
    noPendingDebts: "Tidak ada hutang tersisa antara kamu dan Dimas",
    recentTx: "Transaksi Terbaru",
    viewAll: "Lihat Semua",
    add: "Tambah",
    scan: "Pindai",
    deposit: "Setor",
    expense: "Pengeluaran",
    financialHealth: "Kesehatan Finansial",
    sharedActivity: "Aktivitas Bersama",
    sharedGoalHighlight: "Sorotan Tabungan Bersama",
    unsharedFound: "3 Pengeluaran Belum Dibagi Ditemukan",
    reviewSuggestions: "Periksa Saran",
    aiAdvisorTitle: "DuoAI Penasihat Finansial",
    aiAdvisorSub: "Analisis keuangan cerdas real-time",
    aiPlaceholder: "Tanya tentang keuanganmu...",
    quickPrompts: "Saran Cepat:",
    promptSaveTips: "💡 Tips Hemat",
    promptGoalStatus: "🎯 Status Target",
    promptSettleDebt: "⚖️ Hutang Dimas",
    promptCanSpend: "🛒 Boleh Belanja?",
    desktopMode: "Tampilan Desktop",
    mobileMode: "Tampilan Mobile",
    switchLang: "Bahasa",
    notifications: "Notifikasi",
    settings: "Pengaturan",
    greeting: "Halo",
    editProfile: "Edit Profil",
    changePhoto: "Ganti Foto",
    removePhoto: "Hapus Foto",
    uploadPhoto: "Unggah Foto",
    fullName: "Nama Lengkap",
    emailAddress: "Alamat Email",
    phoneNumber: "Nomor Telepon",
    bioStatus: "Bio / Catatan",
    avatarColor: "Warna Avatar",
    saveChanges: "Simpan Perubahan",
    cancel: "Batal",
    profileUpdated: "Profil berhasil diperbarui!",
    photoUpdated: "Foto profil berhasil diubah!",
    photoRemoved: "Foto profil dihapus.",
    onlineAnalysis: "Online • Analisis Finansial Cerdas",
    personalSettings: "Pengaturan Pribadi",
    privacyCenter: "Pusat Privasi & Berbagi",
    currencyLabel: "Mata Uang",
    biometricLock: "Kunci Biometrik",
    exportReport: "Ekspor Laporan Keuangan",
    resetData: "Reset Data Demo",
    logOut: "Keluar",
    smartLedger: "Keuangan Cerdas",
    activeSpace: "RUANG AKTIF",
    mainMenu: "MENU UTAMA",
    systemMenu: "SISTEM",
    daysLeft: "hari tersisa",
    unhide: "Buka Sensor",
    mask: "Sensor",
    back: "Kembali",
    safePace: "Pace sehat",
    activeWallets: "kantong aktif",
    budgetSpent: "Anggaran Terpakai",
    categories: "kategori",
    dimasOwes: "Piutang Dimas",
    needCollect: "Perlu ditagih",
    settled: "Lunas",
    all: "Semua",
    billsUpcoming: "Tagihan Mendatang",
    collabGoals: "Target Bersama",
    settleStatus: "Status Hutang",
    balanced: "Kas seimbang",
    contributeToGoal: "Setor ke Target Tabungan",
    savingsTarget: "Target Tabungan",
    fromWallet: "Dari Dompet Sumber",
    toWallet: "Ke Dompet Tujuan",
    confirmTransferToGoal: "Konfirmasi Setoran",
    transferFunds: "Transfer Saldo Antar Rekening",
    completeTransfer: "Eksekusi Transfer",
    recordSettlePayment: "Catat Pelunasan Utang",
    dimasPayingRina: "Dimas melunasi ke Rina",
    paymentMethodReceived: "Metode Penerimaan",
    destPersonalWallet: "Dompet Pribadi Penerima",
    confirmClearBalance: "Konfirmasi & Lunaskan Saldo",
    contributeToPool: "Setor Dana Kas Bersama",
    contributor: "Penyetor",
    fromRinaPersonalWallet: "Dari Dompet Pribadi Rina",
    destJointWallet: "Dompet Kas Bersama Tujuan",
    note: "Catatan",
    monthlyJointDeposit: "Setoran Bulanan Kas Bersama",
    depositFunds: "Konfirmasi Setoran"
  },
  su: {
    personal: "Pribadi",
    collab: "Babarengan",
    budgets: "Anggaran",
    wallets: "Dompét",
    more: "Lianna",
    personalSpace: "Rohangan Pribadi",
    collabSpace: "Rohangan Babarengan",
    switchToCollab: "Pindah ka Collab Space",
    switchToPersonal: "Pindah ka Personal Space",
    sharedPoolDesc: "Rina & Dimas • Kas Babarengan",
    privateDesc: "100% Khusus & Rahasia pikeun Rina",
    personalBalance: "Saldo Pribadi",
    jointPool: "Saldo Kas Babarengan",
    safeToSpend: "Aman Dibalanwakeun",
    perDay: "/dinten",
    dimasOwesYou: "Dimas gaduh sambetan",
    fromSharedExpenses: "Tina 4 transaksi babarengan",
    settleUp: "Beresihan Hutang",
    allSettled: "Parantos Lunas Sadayana!",
    noPendingDebts: "Teu aya sambetan deui antawis anjeun sareng Dimas",
    recentTx: "Transaksi Panganyarna",
    viewAll: "Tingal Sadayana",
    add: "Tambih",
    scan: "Parios / Scan",
    deposit: "Setor",
    expense: "Pangaluaran",
    financialHealth: "Kasehatan Kauangan",
    sharedActivity: "Kagiatan Babarengan",
    sharedGoalHighlight: "Sorotan Tabungan Babarengan",
    unsharedFound: "3 Pangaluaran Teu Acan Dibagi",
    reviewSuggestions: "Pariksa Saran",
    aiAdvisorTitle: "DuoAI Panaros Kauangan",
    aiAdvisorSub: "Analisis kauangan pinter real-time",
    aiPlaceholder: "Taros perkawis artos anjeun...",
    quickPrompts: "Pituduh Gancang:",
    promptSaveTips: "💡 Tips Nyimpen Artos",
    promptGoalStatus: "🎯 Status Target",
    promptSettleDebt: "⚖️ Sambetan Dimas",
    promptCanSpend: "🛒 Tiasa Balanja?",
    desktopMode: "Tampilan Desktop",
    mobileMode: "Tampilan HP",
    switchLang: "Basa",
    notifications: "Bewara",
    settings: "Setélan",
    greeting: "Sampurasun",
    editProfile: "Robi Profil",
    changePhoto: "Gentos Poto",
    removePhoto: "Hapus Poto",
    uploadPhoto: "Unggah Poto",
    fullName: "Wasta Lengkep",
    emailAddress: "Alamat Surélék",
    phoneNumber: "Nomer Telepon",
    bioStatus: "Bio / Catetan",
    avatarColor: "Warna Avatar",
    saveChanges: "Simpen Parobihan",
    cancel: "Batal",
    profileUpdated: "Profil parantos diropéa!",
    photoUpdated: "Poto profil parantos digentos!",
    photoRemoved: "Poto profil dihapus.",
    onlineAnalysis: "Online • Analisis Kauangan Pinter",
    personalSettings: "Setélan Pribadi",
    privacyCenter: "Puseur Privasi & Babagi",
    currencyLabel: "Mata Artos",
    biometricLock: "Konci Biometrik",
    exportReport: "Ékspor Laporan Kauangan",
    resetData: "Balikkeun Data Demo",
    logOut: "Kaluar",
    smartLedger: "Kauangan Pinter",
    activeSpace: "ROHANGAN AKTIF",
    mainMenu: "MENU UTAMA",
    systemMenu: "SISTEM",
    daysLeft: "dinten deui",
    unhide: "Buka Sensor",
    mask: "Sensor",
    back: "Balik",
    safePace: "Kondisi sehat",
    activeWallets: "dompét aktip",
    budgetSpent: "Anggaran Kanggo",
    categories: "kategori",
    dimasOwes: "Sambetan Dimas",
    needCollect: "Kedah ditaros",
    settled: "Lunas",
    all: "Sadayana",
    billsUpcoming: "Tagihan Ka Payun",
    collabGoals: "Udagan Babarengan",
    settleStatus: "Status Sambetan",
    balanced: "Kas saimbang",
    contributeToGoal: "Setor ka Udagan Tabungan",
    savingsTarget: "Udagan Tabungan",
    fromWallet: "Tina Dompét Sumber",
    toWallet: "Ka Dompét Tujuan",
    confirmTransferToGoal: "Konfirmasi Setoran",
    transferFunds: "Transfer Saldo Antar Rékéning",
    completeTransfer: "Prak Transfer",
    recordSettlePayment: "Catet Mayar Sambetan",
    dimasPayingRina: "Dimas mayar ka Rina",
    paymentMethodReceived: "Cara Nampi",
    destPersonalWallet: "Dompét Pribadi Panampi",
    confirmClearBalance: "Konfirmasi & Bereskeun Saldo",
    contributeToPool: "Setor Artos Kas Babarengan",
    contributor: "Panyetor",
    fromRinaPersonalWallet: "Tina Dompét Pribadi Rina",
    destJointWallet: "Dompét Kas Babarengan Tujuan",
    note: "Catetan",
    monthlyJointDeposit: "Setoran Sasihan Kas Babarengan",
    depositFunds: "Konfirmasi Setoran"
  },
  en: {
    personal: "Personal",
    collab: "Collab",
    budgets: "Budgets",
    wallets: "Wallets",
    more: "More",
    personalSpace: "Personal Space",
    collabSpace: "Collab Space",
    switchToCollab: "Switch to Collab Space",
    switchToPersonal: "Switch to Personal Space",
    sharedPoolDesc: "Rina & Dimas • Shared Pool",
    privateDesc: "100% Private to Rina",
    personalBalance: "Personal Balance",
    jointPool: "Joint Shared Pool",
    safeToSpend: "Safe to spend",
    perDay: "/day",
    dimasOwesYou: "Dimas owes you",
    fromSharedExpenses: "From 4 shared expenses",
    settleUp: "Settle Up",
    allSettled: "All Settled Up!",
    noPendingDebts: "No pending balances between you and Dimas",
    recentTx: "Recent Transactions",
    viewAll: "View All",
    add: "Add",
    scan: "Scan",
    deposit: "Deposit",
    expense: "Expense",
    financialHealth: "Financial Health",
    sharedActivity: "Shared Activity",
    sharedGoalHighlight: "Shared Goal Highlight",
    unsharedFound: "3 Unshared Expenses Found",
    reviewSuggestions: "Review Suggestions",
    aiAdvisorTitle: "DuoAI Financial Advisor",
    aiAdvisorSub: "Real-time intelligent ledger analysis",
    aiPlaceholder: "Ask anything about your money...",
    quickPrompts: "Quick Prompts:",
    promptSaveTips: "💡 Savings Tips",
    promptGoalStatus: "🎯 Goals Status",
    promptSettleDebt: "⚖️ Dimas Debt",
    promptCanSpend: "🛒 Can I Spend?",
    desktopMode: "Desktop View",
    mobileMode: "Mobile View",
    switchLang: "Language",
    notifications: "Notifications",
    settings: "Settings",
    greeting: "Hello",
    editProfile: "Edit Profile",
    changePhoto: "Change Photo",
    removePhoto: "Remove Photo",
    uploadPhoto: "Upload Photo",
    fullName: "Full Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    bioStatus: "Bio / Status",
    avatarColor: "Avatar Color",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    profileUpdated: "Profile updated successfully!",
    photoUpdated: "Profile photo updated!",
    photoRemoved: "Profile photo removed.",
    onlineAnalysis: "Online • Smart Financial Analysis",
    personalSettings: "Personal Settings",
    privacyCenter: "Privacy & Sharing Center",
    currencyLabel: "Currency",
    biometricLock: "Biometric Lock",
    exportReport: "Export Financial Report",
    resetData: "Reset Demo Data",
    logOut: "Log Out",
    smartLedger: "Smart Ledger",
    activeSpace: "ACTIVE SPACE",
    mainMenu: "MAIN MENU",
    systemMenu: "SYSTEM",
    daysLeft: "days left",
    unhide: "Unhide",
    mask: "Mask",
    back: "Back",
    safePace: "Healthy pace",
    activeWallets: "active wallets",
    budgetSpent: "Budget Spent",
    categories: "categories",
    dimasOwes: "Dimas Owes",
    needCollect: "Pending",
    settled: "Settled",
    all: "All",
    billsUpcoming: "Upcoming Bills",
    collabGoals: "Collab Goals",
    settleStatus: "Settle Status",
    balanced: "Balanced",
    contributeToGoal: "Contribute to Savings Goal",
    savingsTarget: "Savings Target",
    fromWallet: "From Wallet",
    toWallet: "To Wallet",
    confirmTransferToGoal: "Transfer to Goal",
    transferFunds: "Transfer Funds",
    completeTransfer: "Complete Transfer",
    recordSettlePayment: "Record Settle Payment",
    dimasPayingRina: "Dimas is paying Rina",
    paymentMethodReceived: "Payment Method Received",
    destPersonalWallet: "Destination Personal Wallet",
    confirmClearBalance: "Confirm & Clear Balance",
    contributeToPool: "Contribute to Pool",
    contributor: "Contributor",
    fromRinaPersonalWallet: "From Rina's Personal Wallet",
    destJointWallet: "Destination Joint Wallet",
    note: "Note",
    monthlyJointDeposit: "Monthly Joint Deposit",
    depositFunds: "Deposit Funds"
  }
};

window.t = function(key) {
  const lang = (window.DuoState && window.DuoState.lang) || "id";
  const dict = window.translations[lang] || window.translations["id"];
  return dict[key] || window.translations["en"][key] || key;
};

// DuoWallet Security & Sanitization Layer
const Security = {
  escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },
  sanitizeText(str, maxLength = 120) {
    if (!str) return '';
    return String(str).trim().slice(0, maxLength);
  },
  validateAmount(amt, min = 1, max = 10000000000) {
    const clean = typeof amt === 'string' ? amt.replace(/[^0-9]/g, '') : amt;
    const num = Number(clean);
    if (!Number.isFinite(num) || num < min || num > max) return null;
    return Math.floor(num);
  },
  renderSafeMarkdown(text) {
    const safe = this.escapeHtml(text || '');
    return safe
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
};
window.Security = Security;

// Multi-User Registry & RBAC System
const DEFAULT_USERS = [
  {
    id: "usr_rina",
    name: "Rina",
    email: "rina@example.com",
    password: "password123",
    role: "user",
    roleLabel: "Regular User",
    avatarColor: "#6366F1",
    avatarUrl: null,
    phone: "+62 812-3456-7890",
    bio: "Smart saver & personal finance enthusiast"
  },
  {
    id: "usr_dimas",
    name: "Dimas",
    email: "dimas@example.com",
    password: "password123",
    role: "user",
    roleLabel: "Regular User (Partner)",
    avatarColor: "#F97316",
    avatarUrl: null,
    phone: "+62 813-9876-5432",
    bio: "Tech worker & joint budgeter"
  },
  {
    id: "adm_super",
    name: "Atha (Super Admin)",
    email: "admin@duowallet.com",
    password: "admin123",
    role: "super_admin",
    roleLabel: "Super Admin",
    avatarColor: "#DC2626",
    avatarUrl: null,
    phone: "+62 811-0000-0001",
    bio: "Full system controller & UI architect"
  },
  {
    id: "adm_finance",
    name: "Budi (Admin Keuangan)",
    email: "admin.finance@duowallet.com",
    password: "admin123",
    role: "admin_finance",
    roleLabel: "Admin Fitur A (Keuangan)",
    avatarColor: "#059669",
    avatarUrl: null,
    phone: "+62 811-0000-0002",
    bio: "Financial auditor & statement analyst"
  },
  {
    id: "adm_ai",
    name: "Siti (Admin Copilot/AI)",
    email: "admin.ai@duowallet.com",
    password: "admin123",
    role: "admin_ai",
    roleLabel: "Admin Fitur B (Copilot & AI)",
    avatarColor: "#7C3AED",
    avatarUrl: null,
    phone: "+62 811-0000-0003",
    bio: "AI model engineer & prompt maintainer"
  }
];

window.DuoAuth = {
  getUsers() {
    try {
      const stored = localStorage.getItem('duowallet_users');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_USERS;
  },
  saveUsers(users) {
    localStorage.setItem('duowallet_users', JSON.stringify(users));
  },
  getCurrentUser() {
    try {
      const stored = localStorage.getItem('duowallet_session_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  },
  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('duowallet_session_user', JSON.stringify(user));
      if (window.DuoState) {
        DuoState.initPersistence();
      }
    } else {
      localStorage.removeItem('duowallet_session_user');
      if (window.DuoState) {
        DuoState.data = JSON.parse(JSON.stringify(DataBible));
        DuoState.data.currentUser = null;
      }
    }
  },
  login(email, password) {
    const users = this.getUsers();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
    if (user) {
      this.setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: 'Email atau password salah' };
  },
  loginGoogle(googleProfile) {
    let users = this.getUsers();
    let user = users.find(u => u.email.toLowerCase() === googleProfile.email.toLowerCase());
    if (!user) {
      user = {
        id: 'usr_g_' + Date.now(),
        name: googleProfile.name,
        email: googleProfile.email,
        password: 'google_oauth_' + Math.random().toString(36).slice(-6),
        role: 'user',
        roleLabel: 'Google Verified User',
        avatarColor: '#EA4335',
        avatarUrl: googleProfile.picture || null,
        phone: '',
        bio: 'Signed in with Google'
      };
      users.push(user);
      this.saveUsers(users);
    }
    this.setCurrentUser(user);
    return { success: true, user };
  },
  register(name, email, password) {
    const users = this.getUsers();
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email sudah terdaftar!' };
    }
    const newUser = {
      id: 'usr_' + Date.now(),
      name: Security.sanitizeText(name, 50),
      email: cleanEmail,
      password: password,
      role: 'user',
      roleLabel: 'Regular User',
      avatarColor: '#10B981',
      avatarUrl: null,
      phone: '',
      bio: 'New DuoWallet user'
    };
    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  },
  logout() {
    this.setCurrentUser(null);
  },
  hasPermission(requiredRole) {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    if (Array.isArray(requiredRole)) return requiredRole.includes(user.role);
    return user.role === requiredRole;
  }
};

window.renderUserAvatar = function(sizeClass = '', customStyle = '') {
  const user = (window.DuoState && window.DuoState.data && window.DuoState.data.currentUser) || { name: 'Rina', avatarColor: '#6366F1' };
  const safeName = Security.escapeHtml(user.name || 'Rina');
  const initial = (safeName.trim().charAt(0).toUpperCase()) || 'R';
  if (user.avatarUrl) {
    const safeUrl = Security.escapeHtml(user.avatarUrl);
    return `<div class=\"avatar ${sizeClass}\" style=\"background-image:url('${safeUrl}'); background-size:cover; background-position:center; border:2px solid #ffffff; ${customStyle}\" role=\"img\" aria-label=\"${safeName}\"></div>`;
  }
  const safeColor = Security.escapeHtml(user.avatarColor || '#6366F1');
  return `<div class=\"avatar ${sizeClass}\" style=\"background-color:${safeColor}; ${customStyle}\">${initial}</div>`;
};

window.getUserName = function() {
  return (window.DuoState && window.DuoState.data && window.DuoState.data.currentUser && window.DuoState.data.currentUser.name) || 'Rina';
};

window.DuoState = {
  data: JSON.parse(JSON.stringify(DataBible)),
  currentScreen: "S01",
  activeOverlay: null,
  activeDialog: null,
  history: ["S01"],
  selectedTransactions: new Set(),
  maskAmounts: false,
  lang: "id",
  viewMode: "mobile",
  isAiOpen: false,
  aiChatHistory: [],
  
    initPersistence() {
    try {
      // 1. Sync active session user if logged in
      let sessionUser = null;
      if (window.DuoAuth) {
        sessionUser = DuoAuth.getCurrentUser();
      }
      
      const storageKey = sessionUser ? `duowallet_v2_data_${sessionUser.id}` : 'duowallet_v2_data_guest';
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.wallets && parsed.transactions) {
          this.data = parsed;
        }
      } else if (sessionUser) {
        // Akun demo bawaan mendapat template DataBible lengkap
        const isDemo = ['usr_rina', 'usr_dimas', 'usr_admin', 'usr_finance', 'usr_ai'].includes(sessionUser.id);
        if (isDemo) {
          this.data = JSON.parse(JSON.stringify(DataBible));
          if (sessionUser.id === 'usr_dimas') {
            this.data.currentUser = sessionUser;
          }
        } else {
          // Akun baru (regular / Google): Ruang keuangan bersih terisolasi
          this.data = this.createEmptyUserData(sessionUser);
        }
        this.persist();
      }
      
      if (sessionUser) {
        this.data.currentUser = sessionUser;
      }

      const savedLang = localStorage.getItem('duowallet_v2_lang');
      if (savedLang && (savedLang === 'id' || savedLang === 'en' || savedLang === 'su')) {
        this.lang = savedLang;
      }
      
      // Sync custom siteConfig
      const savedSite = localStorage.getItem('duowallet_site_config');
      if (savedSite) {
        try {
          this.data.siteConfig = { ...this.data.siteConfig, ...JSON.parse(savedSite) };
        } catch(e) {}
      }
    } catch (e) {
      console.warn('Persistence init skipped', e);
    }
  },

  createEmptyUserData(user) {
    const userName = (user && user.name) || 'User';
    return {
      currentUser: user,
      partner: null,
      wallets: [
        { id: `w_${Date.now()}_1`, name: `Dompet Utama (${userName})`, type: 'Bank', balance: 0, scope: 'personal', sync: 'Manual', icon: 'account_balance_wallet' },
        { id: `w_${Date.now()}_2`, name: 'Kas Harian', type: 'Cash', balance: 0, scope: 'personal', sync: 'Manual', icon: 'payments' }
      ],
      budgets: {
        personal: [
          { id: 'b_food', category: 'Food & Drinks', limit: 1000000, spent: 0, icon: 'restaurant' },
          { id: 'b_trans', category: 'Transportation', limit: 500000, spent: 0, icon: 'directions_subway' },
          { id: 'b_bills', category: 'Bills & Utilities', limit: 500000, spent: 0, icon: 'receipt_long' }
        ],
        collab: []
      },
      goals: [
        { id: 'g_init', name: 'Dana Darurat Pribadi', target: 5000000, current: 0, scope: 'personal', deadline: '2026-12-31', icon: 'savings' }
      ],
      transactions: [],
      bills: [],
      safetyBuffer: 500000,
      monthlyIncome: 0,
      settleUpHistory: [],
      auditTrail: [
        { id: 'at_init', time: new Date().toISOString(), action: 'Account Created', detail: 'Dompet dan ruang keuangan pribadi berhasil dibuat' }
      ],
      siteConfig: {
        appName: 'DuoWallet',
        tagline: 'Your money. Together when you choose.',
        primaryColor: '#0D9488',
        accentColor: '#F59E0B'
      }
    };
  },

  persist() {
    try {
      const user = (window.DuoAuth && DuoAuth.getCurrentUser()) || (this.data && this.data.currentUser);
      const storageKey = user ? `duowallet_v2_data_${user.id}` : 'duowallet_v2_data_guest';
      localStorage.setItem(storageKey, JSON.stringify(this.data));
      localStorage.setItem('duowallet_v2_lang', this.lang);
    } catch (e) {
      console.warn('Persist save skipped', e);
    }
  },

  reset() {
    this.data = JSON.parse(JSON.stringify(DataBible));
    try {
      localStorage.removeItem('duowallet_v2_data');
    } catch (e) {}
  },
  
  getPersonalBalance() {
    return this.data.wallets
      .filter(w => w.scope === "personal")
      .reduce((sum, w) => sum + w.balance, 0);
  },
  
  getCollabBalance() {
    return this.data.wallets
      .filter(w => w.scope === "collab")
      .reduce((sum, w) => sum + w.balance, 0);
  },
  
  getCombinedBalance() {
    return this.getPersonalBalance() + this.getCollabBalance();
  },
  
  getSettleUpTotal() {
    return this.data.transactions
      .filter(tx => tx.shared && !tx.isSettled)
      .reduce((sum, tx) => sum + (tx.dimasOwes || 0), 0);
  },

  getSafetyBuffer() {
    return (this.data && typeof this.data.safetyBuffer === 'number') ? this.data.safetyBuffer : 500000;
  },

  getSafeToSpendDaily() {
    const balance = this.getPersonalBalance();
    const unpaidBills = ((this.data && this.data.bills && this.data.bills.personal) || [])
      .filter(b => b.status !== 'Paid')
      .reduce((s, b) => s + (b.amount || 0), 0);
    const goalsCommitment = ((this.data && this.data.goals && this.data.goals.personal) || [])
      .reduce((s, g) => s + (g.monthlyCommitment || 0), 0);
    const buffer = this.getSafetyBuffer();
    const days = Math.max(1, (this.data && this.data.daysLeftInMonth) || 8);
    const surplus = Math.max(0, balance - unpaidBills - goalsCommitment - buffer);
    return Math.floor(surplus / days);
  }
};