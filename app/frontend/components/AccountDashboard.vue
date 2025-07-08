<template>
  <div class="bg-base-100 rounded-xl p-4 shadow w-full">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="stat bg-base-200 rounded-lg">
        <div class="stat-title">Aktueller Saldo</div>
        <div class="stat-value text-2xl" :class="currentBalance >= 0 ? 'text-success' : 'text-error'">
          €{{ currentBalance }}
        </div>
      </div>
      <div class="stat bg-base-200 rounded-lg">
        <div class="stat-title">Ausgaben (30 Tage)</div>
        <div class="stat-value text-2xl text-error">€{{ totalSpending }}</div>
      </div>
      <div class="stat bg-base-200 rounded-lg">
        <div class="stat-title">Ø Tägliche Ausgaben</div>
        <div class="stat-value text-2xl text-warning">€{{ avgDailySpending }}</div>
      </div>
      <div class="stat bg-base-200 rounded-lg">
        <div class="stat-title">Transaktionen</div>
        <div class="stat-value text-2xl">{{ transactionCount }}</div>
      </div>
    </div>

          <!-- <!-- Chart on the right --> -->
          <!-- <div class="box-border border-1 rounded-lg p-4"> -->
          <!--   <h4 class="text-sm font-semibold mb-3">Kontostand Verlauf</h4> -->
          <!--   <div :ref="`balanceContainer-${account.id}`" style="height: 150px;"> -->
          <!--     <v-chart -->
          <!--       v-if="chartReady" -->
          <!--       :option="getBalanceChartOptions(account)" -->
          <!--       :style="{ width: '100%', height: '100%' }" -->
          <!--       autoresize -->
          <!--     /> -->
          <!--   </div> -->
          <!-- </div> -->
    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Balance Chart -->
      <div class="bg-base-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-2">Kontostand Verlauf</h3>
        <div ref="balanceContainer" style="height: 300px;">
          <v-chart
            v-if="chartReady"
            :option="balanceChartOptions"
            :style="{ width: '100%', height: '100%' }"
            autoresize
          />
        </div>
      </div>

      <!-- Daily Spending Chart -->
      <div class="bg-base-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-2">Tägliche Ausgaben</h3>
        <div ref="spendingContainer" style="height: 300px;">
          <v-chart
            v-if="chartReady"
            :option="dailySpendingChartOptions"
            :style="{ width: '100%', height: '100%' }"
            autoresize
          />
        </div>
      </div>

      <!-- Category Pie Chart -->
      <div class="bg-base-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-2">Ausgaben nach Kategorie</h3>
        <div ref="categoryContainer" style="height: 300px;">
          <v-chart
            v-if="chartReady"
            :option="categoryPieChartOptions"
            :style="{ width: '100%', height: '100%' }"
            autoresize
          />
        </div>
      </div>

      <!-- Top Merchants Chart -->
      <div class="bg-base-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-2">Top 10 Händler</h3>
        <div ref="merchantContainer" style="height: 300px;">
          <v-chart
            v-if="chartReady"
            :option="merchantBarChartOptions"
            :style="{ width: '100%', height: '100%' }"
            autoresize
          />
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="mt-6 bg-base-200 rounded-lg p-4">
      <h3 class="text-lg font-semibold mb-3">Letzte Transaktionen</h3>
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Händler</th>
              <th>Kategorie</th>
              <th class="text-right">Betrag</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in recentTransactions" :key="tx.id">
              <td>{{ formatDate(tx.booking_date) }}</td>
              <td>{{ tx.creditor_name || 'Unbekannt' }}</td>
              <td>
                <span class="badge badge-sm" :class="getCategoryBadgeClass(tx)">
                  {{ getCategoryForTransaction(tx) }}
                </span>
              </td>
              <td class="text-right font-mono" :class="Number(tx.amount) < 0 ? 'text-error' : 'text-success'">
                €{{ Math.abs(Number(tx.amount)).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
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
// const currentBalance = computed(() => {
//   console.log(balances.value[0].interim_available)
//   const values = balanceData.value.values
//   return values.length > 0 ? values[values.length - 1] : '0.00'
// })

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
  .slice(0, 5)

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

// Chart configurations
const balanceChartOptions = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params) => `${params[0].name}<br/>Saldo: €${params[0].value}`
  },
  grid: { left: '10%', right: '5%', bottom: '15%', top: '5%' },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: balanceData.value.labels,
    axisLabel: { rotate: 45 }
  },
  yAxis: {
    type: 'value',
    axisLabel: { formatter: '€{value}' }
  },
  series: [{
    type: 'line',
    smooth: true,
    data: balanceData.value.values,
    itemStyle: { color: '#3b82f6' },
    areaStyle: { color: 'rgba(59, 130, 246, 0.1)' }
  }],
}))

const dailySpendingChartOptions = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params) => `${params[0].name}<br/>Ausgaben: €${params[0].value}`
  },
  grid: { left: '10%', right: '5%', bottom: '15%', top: '5%' },
  xAxis: {
    type: 'category',
    data: dailySpendingData.value.labels,
    axisLabel: { rotate: 45 }
  },
  yAxis: {
    type: 'value',
    axisLabel: { formatter: '€{value}' }
  },
  series: [{
    type: 'bar',
    data: dailySpendingData.value.values,
    itemStyle: { color: '#ef4444' }
  }],
}))

const categoryPieChartOptions = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}<br/>€{c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    textStyle: { fontSize: 11 }
  },
  series: [{
    type: 'pie',
    radius: ['35%', '65%'],
    center: ['60%', '50%'],
    avoidLabelOverlap: false,
    itemStyle: {
      borderRadius: 8,
      borderColor: '#fff',
      borderWidth: 2
    },
    label: { show: false },
    emphasis: {
      label: {
        show: true,
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    data: categoryData.value
  }]
}))

const merchantBarChartOptions = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params) => `${params[0].name}<br/>Gesamt: €${params[0].value}`
  },
  grid: {
    left: '25%',
    right: '5%',
    bottom: '5%',
    top: '5%'
  },
  xAxis: {
    type: 'value',
    axisLabel: { formatter: '€{value}' }
  },
  yAxis: {
    type: 'category',
    data: merchantData.value.labels,
    axisLabel: { fontSize: 10 }
  },
  series: [{
    type: 'bar',
    data: merchantData.value.values,
    itemStyle: { color: '#f59e0b' }
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
.stat {
  padding: 1rem;
}
.stat-title {
  font-size: 0.875rem;
  opacity: 0.7;
}
.stat-value {
  margin-top: 0.25rem;
}
</style>
