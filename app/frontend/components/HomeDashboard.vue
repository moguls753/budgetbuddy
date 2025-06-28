<template>
  <div class="bg-base-100 rounded-2xl p-6 shadow-lg w-full">
    <!-- Header Section with Total Balance -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-6 text-base-content">Finanzübersicht</h2>

      <!-- Total Balance Card -->
      <div
        class="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-base-content/60 mb-1">Gesamtvermögen</p>
            <p class="text-3xl font-bold" :class="currentTotalBalance >= 0 ? 'text-success' : 'text-error'">
              €{{ currentTotalBalance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </p>
          </div>
          <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Accounts Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div v-for="account in accounts" :key="account.id"
        class="group bg-base-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:bg-base-300 hover:scale-[1.02] border border-base-300 hover:border-primary/30">
        <!-- Account Header -->
        <h3 class="text-lg font-semibold text-base-content pb-5">{{ account.name }}</h3>

        <!-- Account Balance -->
        <div class="mb-6">
          <p class="text-2xl font-bold" :class="balanceFor(account.iban) >= 0 ? 'text-success' : 'text-error'">
            €{{ balanceFor(account.iban).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            }}
          </p>
        </div>

        <!-- Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Recent Transactions -->
          <div
            class="bg-base-100 rounded-xl p-4 border border-base-300 group-hover:border-primary/20 transition-all duration-300">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-base-content">Letzte Transaktionen</h4>
              <svg class="w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>

            <div class="space-y-2">
              <div v-if="recentTransactionsFor(account.id).length === 0"
                class="text-center py-4 text-base-content/40 text-sm">
                Keine Transaktionen
              </div>
              <div v-for="tx in recentTransactionsFor(account.id)" :key="tx.id"
                class="flex items-center justify-between py-2 border-b border-base-300 last:border-0">
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-base-content/60">{{ formatDate(tx.booking_date) }}</p>
                  <p class="text-sm font-medium truncate">{{ tx.creditor_name || 'Unbekannt' }}</p>
                </div>
                <p class="text-sm font-mono ml-2" :class="Number(tx.amount) < 0 ? 'text-error' : 'text-success'">
                  {{ Number(tx.amount) < 0 ? '-' : '+' }}€{{ Math.abs(Number(tx.amount)).toFixed(2) }} </p>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div
            class="bg-base-100 rounded-xl p-4 border border-base-300 group-hover:border-primary/20 transition-all duration-300">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-base-content">Übersicht</h4>
              <svg class="w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <AccountQuickStats :account="account" :transactions="transactions[account.id] || []" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import AccountQuickStats from './AccountQuickStats.vue'

const props = defineProps({
  transactions: { type: Array, required: true },
  accounts: { type: Array, required: true },
  stats: { type: Object, required: true },
})

const transactions = props.transactions
const accounts = props.accounts

const currentTotalBalance = accounts.reduce((sum, item) => {
  return sum + item.interim_available
}, 0)

const balanceFor = (iban) => {
  const account = accounts.find(account => account.iban === iban)
  return account ? account.interim_available : 0
}

const recentTransactionsFor = (account_id) => {
  return transactions[account_id]?.slice(0, 3) || []
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
  })
}

const chartReady = ref(false)
let resizeObserver = null
let resizeTimeout = null

const handleResize = () => {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    window.dispatchEvent(new Event('resize'))
  }, 100)
}

onMounted(async () => {
  await nextTick()
  setTimeout(() => {
    chartReady.value = true
  }, 100)

  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(handleResize)
    const containers = document.querySelectorAll('[ref$="Container"]')
    containers.forEach(container => {
      if (container) resizeObserver.observe(container)
    })
  }

  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect()
  window.removeEventListener('resize', handleResize)
  if (resizeTimeout) clearTimeout(resizeTimeout)
})
</script>

<style scoped>
/* Smooth transitions for interactive elements */
.group:hover .bg-base-100 {
  @apply shadow-lg;
}

/* Add a glow effect on hover for luxury theme */
.group:hover {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 20px -5px theme('colors.primary.DEFAULT');
}

/* Optional: Add a subtle animation to the total balance icon */
@keyframes pulse-slow {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: .8;
    transform: scale(1.05);
  }
}

.group:hover svg {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Add a golden shimmer effect for the luxury theme */
@keyframes shimmer {
  0% {
    background-position: -200% center;
  }

  100% {
    background-position: 200% center;
  }
}

.bg-gradient-to-br {
  background-size: 200% 100%;
  animation: shimmer 8s linear infinite;
}
</style>
