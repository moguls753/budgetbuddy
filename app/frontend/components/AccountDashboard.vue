<template>
  <div class="min-h-screen p-12 animate-fade-in">
    <!-- Dramatic Header -->
    <div class="mb-16 pb-8 border-b-4 border-salmon">
      <h1 class="font-display text-7xl text-near-black mb-4 tracking-tight leading-none">
        {{ account.name }}
      </h1>
      <p class="font-mono text-xs text-gold uppercase tracking-widest">Account Dashboard</p>
    </div>

    <!-- Key Stats Grid - Bold Editorial Layout -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      <!-- Current Balance - Emphasized -->
      <div class="bg-gradient-to-br from-salmon-light to-white border-4 border-near-black p-8 card-hover ink-bleed animate-slide-up stagger-1">
        <p class="font-mono text-xs uppercase tracking-widest text-near-black/60 mb-3">Aktueller Saldo</p>
        <p class="font-mono text-5xl font-bold leading-none" :class="currentBalance >= 0 ? 'text-income' : 'text-expense'">
          €{{ currentBalance }}
        </p>
      </div>

      <!-- Total Spending -->
      <div class="bg-white border-4 border-near-black p-8 card-hover animate-slide-up stagger-2">
        <p class="font-mono text-xs uppercase tracking-widest text-near-black/60 mb-3">Ausgaben (30 Tage)</p>
        <p class="font-mono text-5xl font-bold text-expense leading-none">
          €{{ totalSpending }}
        </p>
      </div>

      <!-- Avg Daily Spending -->
      <div class="bg-white border-4 border-near-black p-8 card-hover animate-slide-up stagger-3">
        <p class="font-mono text-xs uppercase tracking-widest text-near-black/60 mb-3">Ø Tägliche Ausgaben</p>
        <p class="font-mono text-5xl font-bold text-gold leading-none">
          €{{ avgDailySpending }}
        </p>
      </div>

      <!-- Transaction Count -->
      <div class="bg-white border-4 border-near-black p-8 card-hover animate-slide-up stagger-4">
        <p class="font-mono text-xs uppercase tracking-widest text-near-black/60 mb-3">Transaktionen</p>
        <p class="font-mono text-5xl font-bold text-navy leading-none">
          {{ transactionCount }}
        </p>
      </div>
    </div>

    <!-- Charts Section with Editorial Headers -->
    <div class="space-y-12">
      <!-- Balance Chart - Full Width Feature -->
      <div class="border-l-4 border-salmon pl-8 animate-slide-up stagger-5">
        <h2 class="font-display text-4xl text-near-black mb-6">Kontostand Verlauf</h2>
        <div class="bg-white border-2 border-near-black p-8">
          <div ref="balanceContainer" style="height: 400px;">
            <v-chart
              v-if="chartReady"
              :option="balanceChartOptions"
              :style="{ width: '100%', height: '100%' }"
              autoresize
            />
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Daily Spending Chart -->
        <div class="border-l-4 border-gold pl-8 animate-slide-up stagger-6">
          <h2 class="font-display text-3xl text-near-black mb-6">Tägliche<br/>Ausgaben</h2>
          <div class="bg-cream border-2 border-near-black p-6">
            <div ref="spendingContainer" style="height: 300px;">
              <v-chart
                v-if="chartReady"
                :option="dailySpendingChartOptions"
                :style="{ width: '100%', height: '100%' }"
                autoresize
              />
            </div>
          </div>
        </div>

        <!-- Category Pie Chart -->
        <div class="border-l-4 border-navy pl-8 animate-slide-up stagger-6">
          <h2 class="font-display text-3xl text-near-black mb-6">Ausgaben<br/>nach Kategorie</h2>
          <div class="bg-cream border-2 border-near-black p-6">
            <div ref="categoryContainer" style="height: 300px;">
              <v-chart
                v-if="chartReady"
                :option="categoryPieChartOptions"
                :style="{ width: '100%', height: '100%' }"
                autoresize
              />
            </div>
          </div>
        </div>

        <!-- Top Merchants Chart - Spans Full Width on Small Screens -->
        <div class="lg:col-span-2 border-l-4 border-salmon pl-8 animate-slide-up stagger-6">
          <h2 class="font-display text-3xl text-near-black mb-6">Top 10 Händler</h2>
          <div class="bg-cream border-2 border-near-black p-6">
            <div ref="merchantContainer" style="height: 350px;">
              <v-chart
                v-if="chartReady"
                :option="merchantBarChartOptions"
                :style="{ width: '100%', height: '100%' }"
                autoresize
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions Table with Bold Typography -->
      <div class="border-l-4 border-gold pl-8 animate-slide-up stagger-6">
        <h2 class="font-display text-4xl text-near-black mb-6">Letzte Transaktionen</h2>
        <div class="bg-white border-2 border-near-black overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-charcoal text-cream">
                <tr>
                  <th class="px-6 py-4 text-left font-mono text-xs uppercase tracking-widest">Datum</th>
                  <th class="px-6 py-4 text-left font-mono text-xs uppercase tracking-widest">Händler</th>
                  <th class="px-6 py-4 text-left font-mono text-xs uppercase tracking-widest">Kategorie</th>
                  <th class="px-6 py-4 text-right font-mono text-xs uppercase tracking-widest">Betrag</th>
                </tr>
              </thead>
              <tbody class="divide-y-2 divide-near-black/10">
                <tr v-for="tx in recentTransactions" :key="tx.id" class="hover:bg-salmon-light transition-colors duration-200">
                  <td class="px-6 py-4 font-mono text-sm text-near-black/70">{{ formatDate(tx.booking_date) }}</td>
                  <td class="px-6 py-4 font-sans font-semibold text-near-black">{{ tx.creditor_name || 'Unbekannt' }}</td>
                  <td class="px-6 py-4">
                    <span class="inline-block font-mono text-xs font-semibold px-3 py-1 bg-gold/20 text-near-black border border-gold uppercase tracking-wide">
                      {{ getCategoryForTransaction(tx) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right font-mono text-lg font-bold" :class="Number(tx.amount) < 0 ? 'text-expense' : 'text-income'">
                    €{{ Math.abs(Number(tx.amount)).toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { use } from 'echarts/core'
import VChart from 'vue-echarts'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from 'echarts/components'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
])

const props = defineProps({
  transactions: {
    type: Array,
    default: () => []
  },
  account: {
    type: Object,
    default: () => ({})
  }
})

const transactions = ref(props.transactions)
const account = ref(props.account)

// Summary calculations
const currentBalance = account.value.interim_available

const totalSpending = transactions.value
  .filter(tx => Number(tx.amount) < 0)
  .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0)
  .toFixed(2)

// Calculate average daily spending directly
const dailySpendingMap = new Map()
for (const tx of transactions.value) {
  if (Number(tx.amount) < 0) {
    const d = tx.booking_date
    const a = Math.abs(Number(tx.amount))
    dailySpendingMap.set(d, (dailySpendingMap.get(d) || 0) + a)
  }
}
const dailySpendingValues = Array.from(dailySpendingMap.values())
const avgDailySpending = dailySpendingValues.length === 0
  ? '0.00'
  : (dailySpendingValues.reduce((sum, val) => sum + val, 0) / dailySpendingValues.length).toFixed(2)

const transactionCount = transactions.value.length

const recentTransactions = [...transactions.value]
  .sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date))
  .slice(0, 10)

// Helper functions
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const getCategoryForTransaction = (tx) => {
  return tx.category || 'Uncategorized'
}

const getCategoryBadgeClass = (tx) => {
  const category = getCategoryForTransaction(tx)
  const classes = {
    'Food & Dining': 'badge-warning',
    'Groceries': 'badge-success',
    'Transportation': 'badge-info',
    'Shopping': 'badge-primary',
    'Entertainment': 'badge-secondary',
    'Bills & Utilities': 'badge-accent',
    'Healthcare': 'badge-info',
    'Education': 'badge-primary',
    'Travel': 'badge-warning',
    'Income': 'badge-success',
    'Transfers': 'badge-neutral',
    'ATM/Cash': 'badge-ghost',
    'Fees & Charges': 'badge-error',
    'Other': 'badge-ghost',
    'Uncategorized': 'badge-ghost'
  }
  return classes[category] || 'badge-ghost'
}

// Data calculations
const balanceData = computed(() => {
  const map = new Map()
  for (const tx of transactions.value) {
    const d = tx.booking_date
    const a = Number(tx.amount)
    map.set(d, (map.get(d) || 0) + a)
  }
  const sorted = Array.from(map.entries()).sort(
    ([d1], [d2]) => new Date(d1) - new Date(d2),
  )

  // Start with current balance and work backwards
  let balance = Number(currentBalance)
  const cumulativeValues = []

  // Calculate backwards to get starting balance
  const totalTransactionAmount = sorted.reduce((sum, [, value]) => sum + value, 0)
  let runningBalance = balance - totalTransactionAmount

  // Now calculate forward from the calculated starting balance
  for (const [, value] of sorted) {
    runningBalance += value
    cumulativeValues.push(runningBalance.toFixed(2))
  }

  return {
    labels: sorted.map(([d]) =>
      new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }),
    ),
    values: cumulativeValues,
  }
})

const dailySpendingData = computed(() => {
  const map = new Map()
  for (const tx of transactions.value) {
    if (Number(tx.amount) < 0) {
      const d = tx.booking_date
      const a = Math.abs(Number(tx.amount))
      map.set(d, (map.get(d) || 0) + a)
    }
  }
  const sorted = Array.from(map.entries()).sort(
    ([d1], [d2]) => new Date(d1) - new Date(d2),
  )

  return {
    labels: sorted.map(([d]) =>
      new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }),
    ),
    values: sorted.map(([, v]) => v.toFixed(2)),
  }
})

const categoryData = computed(() => {
  const categories = new Map()

  for (const tx of transactions.value) {
    if (Number(tx.amount) < 0) {
      const category = getCategoryForTransaction(tx)
      const amount = Math.abs(Number(tx.amount))
      categories.set(category, (categories.get(category) || 0) + amount)
    }
  }

  return Array.from(categories.entries()).map(([name, value]) => ({
    name,
    value: value.toFixed(2)
  }))
})

const merchantData = computed(() => {
  const merchants = new Map()

  for (const tx of transactions.value) {
    if (Number(tx.amount) < 0) {
      const merchant = tx.creditor_name || 'Unbekannt'
      const amount = Math.abs(Number(tx.amount))
      merchants.set(merchant, (merchants.get(merchant) || 0) + amount)
    }
  }

  const sorted = Array.from(merchants.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  return {
    labels: sorted.map(([name]) => name),
    values: sorted.map(([, value]) => value.toFixed(2))
  }
})

// Chart configurations with custom Financial Editorial colors
const balanceChartOptions = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params) => `${params[0].name}<br/>Saldo: €${params[0].value}`,
    backgroundColor: '#1A1A1A',
    borderColor: '#FF9B85',
    borderWidth: 2,
    textStyle: { color: '#FAF9F6', fontFamily: 'JetBrains Mono' }
  },
  grid: { left: '8%', right: '5%', bottom: '15%', top: '5%' },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: balanceData.value.labels,
    axisLabel: {
      rotate: 45,
      fontFamily: 'JetBrains Mono',
      fontSize: 11,
      color: '#0A0A0A'
    },
    axisLine: { lineStyle: { color: '#0A0A0A', width: 2 } }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '€{value}',
      fontFamily: 'JetBrains Mono',
      fontSize: 11,
      color: '#0A0A0A'
    },
    axisLine: { lineStyle: { color: '#0A0A0A', width: 2 } },
    splitLine: { lineStyle: { color: '#FF9B85', opacity: 0.1, type: 'dashed' } }
  },
  series: [{
    type: 'line',
    smooth: true,
    data: balanceData.value.values,
    itemStyle: { color: '#2D5016' },
    lineStyle: { width: 3 },
    areaStyle: { color: 'rgba(45, 80, 22, 0.1)' }
  }],
}))

const dailySpendingChartOptions = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params) => `${params[0].name}<br/>Ausgaben: €${params[0].value}`,
    backgroundColor: '#1A1A1A',
    borderColor: '#FF9B85',
    borderWidth: 2,
    textStyle: { color: '#FAF9F6', fontFamily: 'JetBrains Mono' }
  },
  grid: { left: '12%', right: '5%', bottom: '15%', top: '5%' },
  xAxis: {
    type: 'category',
    data: dailySpendingData.value.labels,
    axisLabel: {
      rotate: 45,
      fontFamily: 'JetBrains Mono',
      fontSize: 11,
      color: '#0A0A0A'
    },
    axisLine: { lineStyle: { color: '#0A0A0A', width: 2 } }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '€{value}',
      fontFamily: 'JetBrains Mono',
      fontSize: 11,
      color: '#0A0A0A'
    },
    axisLine: { lineStyle: { color: '#0A0A0A', width: 2 } },
    splitLine: { lineStyle: { color: '#C5A572', opacity: 0.1, type: 'dashed' } }
  },
  series: [{
    type: 'bar',
    data: dailySpendingData.value.values,
    itemStyle: { color: '#8B1E3F', borderRadius: [4, 4, 0, 0] },
    barWidth: '60%'
  }],
}))

const categoryPieChartOptions = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}<br/>€{c} ({d}%)',
    backgroundColor: '#1A1A1A',
    borderColor: '#FF9B85',
    borderWidth: 2,
    textStyle: { color: '#FAF9F6', fontFamily: 'JetBrains Mono' }
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    textStyle: {
      fontSize: 11,
      fontFamily: 'IBM Plex Sans',
      color: '#0A0A0A'
    }
  },
  color: ['#FF9B85', '#C5A572', '#1E3A5F', '#2D5016', '#8B1E3F', '#FFE5D9'],
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['60%', '50%'],
    avoidLabelOverlap: false,
    itemStyle: {
      borderRadius: 8,
      borderColor: '#FAF9F6',
      borderWidth: 3
    },
    label: { show: false },
    emphasis: {
      label: {
        show: true,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'JetBrains Mono',
        color: '#0A0A0A'
      }
    },
    data: categoryData.value
  }]
}))

const merchantBarChartOptions = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params) => `${params[0].name}<br/>Gesamt: €${params[0].value}`,
    backgroundColor: '#1A1A1A',
    borderColor: '#FF9B85',
    borderWidth: 2,
    textStyle: { color: '#FAF9F6', fontFamily: 'JetBrains Mono' }
  },
  grid: {
    left: '30%',
    right: '8%',
    bottom: '5%',
    top: '5%'
  },
  xAxis: {
    type: 'value',
    axisLabel: {
      formatter: '€{value}',
      fontFamily: 'JetBrains Mono',
      fontSize: 11,
      color: '#0A0A0A'
    },
    axisLine: { lineStyle: { color: '#0A0A0A', width: 2 } },
    splitLine: { lineStyle: { color: '#FF9B85', opacity: 0.1, type: 'dashed' } }
  },
  yAxis: {
    type: 'category',
    data: merchantData.value.labels,
    axisLabel: {
      fontSize: 11,
      fontFamily: 'IBM Plex Sans',
      color: '#0A0A0A'
    },
    axisLine: { lineStyle: { color: '#0A0A0A', width: 2 } }
  },
  series: [{
    type: 'bar',
    data: merchantData.value.values,
    itemStyle: { color: '#FF9B85', borderRadius: [0, 4, 4, 0] },
    barWidth: '70%'
  }]
}))

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
/* Financial Editorial Brutalism - Account Dashboard Styles */

/* Ensure animations work */
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
