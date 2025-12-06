<template>
  <div class="min-h-screen p-12 animate-fade-in">
    <!-- Dramatic Header with Oversized Typography -->
    <div class="mb-16 border-b-4 border-salmon pb-8">
      <div class="flex items-end justify-between mb-8">
        <div>
          <h1 class="font-display text-7xl text-near-black mb-2 tracking-tight leading-none">Finanz<br/>Übersicht</h1>
          <p class="font-mono text-xs text-gold uppercase tracking-widest">Portfolio Dashboard</p>
        </div>
        <div class="text-right">
          <p class="font-mono text-xs text-near-black/60 uppercase tracking-wide mb-2">Gesamtvermögen</p>
          <p class="font-mono text-6xl font-bold tracking-tight"
             :class="currentTotalBalance >= 0 ? 'text-income' : 'text-expense'">
            €{{ currentTotalBalance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Asymmetric Accounts Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div v-for="(account, index) in accounts" :key="account.id"
        :class="`animate-slide-up stagger-${Math.min(index + 1, 6)}`"
        class="card-hover bg-white border-4 border-near-black shadow-lg overflow-hidden">

        <!-- Account Header with Diagonal Accent -->
        <div class="bg-gradient-to-br from-salmon-light to-white p-8 border-b-4 border-near-black relative">
          <div class="absolute top-0 right-0 w-32 h-32 bg-gold opacity-10 rounded-full -mr-16 -mt-16"></div>
          <h2 class="font-display text-3xl text-near-black mb-2 relative z-10">{{ account.name }}</h2>
          <p class="font-mono text-xs uppercase tracking-widest text-near-black/60 relative z-10">Account Balance</p>

          <!-- Oversized Balance Number -->
          <div class="mt-6 relative z-10">
            <p class="font-mono text-5xl font-bold tracking-tight"
               :class="balanceFor(account.iban) >= 0 ? 'text-income' : 'text-expense'">
              €{{ balanceFor(account.iban).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </p>
          </div>
        </div>

        <!-- Content Grid with Editorial Layout -->
        <div class="p-8 bg-cream">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Recent Transactions with Bold Typography -->
            <div class="border-l-4 border-salmon pl-6">
              <h3 class="font-display text-xl text-near-black mb-4">Letzte<br/>Transaktionen</h3>

              <div class="space-y-3">
                <div v-if="recentTransactionsFor(account.id).length === 0"
                  class="text-center py-8 text-near-black/40 font-mono text-sm">
                  Keine Transaktionen
                </div>
                <div v-for="tx in recentTransactionsFor(account.id)" :key="tx.id"
                  class="pb-3 border-b border-near-black/10 last:border-0">
                  <div class="flex items-start justify-between mb-1">
                    <p class="font-mono text-xs text-near-black/50 uppercase">{{ formatDate(tx.booking_date) }}</p>
                    <span class="font-mono text-sm font-bold"
                          :class="Number(tx.amount) < 0 ? 'badge-expense' : 'badge-income'">
                      {{ Number(tx.amount) < 0 ? '-' : '+' }}€{{ Math.abs(Number(tx.amount)).toFixed(2) }}
                    </span>
                  </div>
                  <p class="font-sans text-sm font-medium text-near-black truncate">{{ tx.creditor_name || 'Unbekannt' }}</p>
                </div>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="bg-white border-2 border-near-black p-6">
              <h3 class="font-display text-xl text-near-black mb-4 border-b-2 border-gold pb-2">Übersicht</h3>
              <AccountQuickStats :account="account" :transactions="transactions[account.id] || []" />
            </div>
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
  transactions: { type: Object, required: true },
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
/* Financial Editorial Brutalism - Component Styles */

/* Ensure stagger animations work */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced card hover with ink bleed effect */
.card-hover:hover {
  box-shadow:
    0 25px 30px -10px rgba(0, 0, 0, 0.2),
    0 0 40px rgba(255, 155, 133, 0.15);
}
</style>
