<template>
  <div class="p-6 bg-base-200 rounded-lg">
    <h1 class="text-3xl font-bold text-center">Your Transactions</h1>

    <table class="table-auto w-full mt-4">
      <thead>
        <tr>
          <th class="px-4 py-2">Datum</th>
          <th class="px-4 py-2">Betrag</th>
          <th class="px-4 py-2">Verwendungszweck</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tx in transactions" :key="tx.id">
          <td class="border px-4 py-2">{{ formatDate(tx.booking_date) }}</td>
          <td class="border px-4 py-2">{{ formatCurrency(tx.amount, tx.currency) }}</td>
          <td class="border px-4 py-2">{{ tx.remittance }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// grab the JSON blob from the div’s data attribute
const el = document.getElementById('vue-root')
const raw = el?.dataset.transactions || '[]'

// parse into a reactive array
const transactions = ref(JSON.parse(raw))

function formatDate(d) {
  return new Date(d).toLocaleDateString('de-DE')
}
function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  }).format(amount)
}
</script>
