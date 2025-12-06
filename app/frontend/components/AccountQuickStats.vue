<template>
  <div class="w-full space-y-4">
    <!-- Bold Trend Display -->
    <div class="bg-salmon-light border-2 border-salmon p-4 text-center">
      <p class="font-mono text-xs uppercase tracking-widest text-near-black/60 mb-2">3-Wochen Trend</p>
      <div class="flex items-center justify-center space-x-2">
        <component
          :is="trendIcon"
          :class="trendColorClass"
          class="w-6 h-6"
        />
        <span class="font-mono text-3xl font-bold" :class="trendColorClass">
          {{ trendDirection }}{{ Math.abs(trendPercentage).toFixed(1) }}%
        </span>
      </div>
    </div>

    <!-- Data Grid with Bold Numbers -->
    <div class="space-y-3">
      <div class="border-b-2 border-near-black/10 pb-2">
        <p class="font-mono text-xs uppercase tracking-wide text-near-black/50 mb-1">Ausgaben (30T)</p>
        <p class="font-mono text-2xl font-bold text-expense">-€{{ monthlySpending }}</p>
      </div>
      <div class="border-b-2 border-near-black/10 pb-2">
        <p class="font-mono text-xs uppercase tracking-wide text-near-black/50 mb-1">Ø Transaktion</p>
        <p class="font-mono text-2xl font-bold text-near-black">€{{ averageTransaction }}</p>
      </div>
      <div class="pb-2">
        <p class="font-mono text-xs uppercase tracking-wide text-near-black/50 mb-1">Letzte Aktivität</p>
        <p class="font-sans text-lg font-semibold text-gold">{{ lastActivityText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon
} from '@heroicons/vue/24/solid'

const props = defineProps({
  account: {
    type: Object,
    required: true
  },
  transactions: {
    type: Array,
    default: () => []
  }
})

// Calculate 3-week trend
const trendData = computed(() => {
  if (!props.transactions || props.transactions.length === 0) {
    return { percentage: 0, direction: 'neutral' }
  }

  const threeWeeksAgo = new Date()
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21)

  // Get transactions from last 3 weeks
  const recentTransactions = props.transactions.filter(tx =>
    new Date(tx.booking_date) >= threeWeeksAgo
  )

  if (recentTransactions.length === 0) {
    return { percentage: 0, direction: 'neutral' }
  }

  // Calculate total change
  const totalChange = recentTransactions.reduce((sum, tx) =>
    sum + Number(tx.amount), 0
  )

  // Calculate percentage relative to current balance
  const currentBalance = props.account.interim_available || 0
  const startingBalance = currentBalance - totalChange

  if (Math.abs(startingBalance) < 10) {
    // Avoid division by very small numbers
    return { percentage: 0, direction: 'neutral' }
  }

  const percentage = (totalChange / Math.abs(startingBalance)) * 100

  let direction = 'neutral'
  if (percentage > 2) direction = 'up'
  else if (percentage < -2) direction = 'down'

  return { percentage, direction }
})

const trendPercentage = computed(() => trendData.value.percentage)

const trendDirection = computed(() => {
  if (trendData.value.percentage > 0) return '+'
  return ''
})

const trendIcon = computed(() => {
  switch (trendData.value.direction) {
    case 'up': return ArrowUpIcon
    case 'down': return ArrowDownIcon
    default: return ArrowRightIcon
  }
})

const trendColorClass = computed(() => {
  switch (trendData.value.direction) {
    case 'up': return 'text-income'
    case 'down': return 'text-expense'
    default: return 'text-gold'
  }
})

// Calculate monthly spending (last 30 days)
const monthlySpending = computed(() => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const spending = props.transactions
    .filter(tx => {
      const txDate = new Date(tx.booking_date)
      return txDate >= thirtyDaysAgo && Number(tx.amount) < 0
    })
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0)

  return spending.toFixed(2)
})

// Calculate average transaction amount
const averageTransaction = computed(() => {
  if (!props.transactions || props.transactions.length === 0) return '0.00'

  const last30Transactions = props.transactions.slice(0, 30)
  const sum = last30Transactions.reduce((acc, tx) =>
    acc + Math.abs(Number(tx.amount)), 0
  )

  return (sum / last30Transactions.length).toFixed(2)
})

// Calculate last activity
const lastActivityText = computed(() => {
  if (!props.transactions || props.transactions.length === 0) return 'Keine'

  const lastTx = props.transactions[0]
  const lastDate = new Date(lastTx.booking_date)
  const today = new Date()
  const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24))

  if (daysDiff === 0) return 'Heute'
  if (daysDiff === 1) return 'Gestern'
  if (daysDiff < 7) return `vor ${daysDiff} Tagen`
  if (daysDiff < 30) return `vor ${Math.floor(daysDiff / 7)} Wochen`
  return `vor ${Math.floor(daysDiff / 30)} Monaten`
})
</script>
