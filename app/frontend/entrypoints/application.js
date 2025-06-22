// To see this message, add the following to the `<head>` section in your
// views/layouts/application.html.erb
//
//    <%= vite_client_tag %>
//    <%= vite_javascript_tag 'application' %>
console.log('Vite ⚡️ Rails')

// If using a TypeScript entrypoint file:
//     <%= vite_typescript_tag 'application' %>
//
// If you want to use .jsx or .tsx, add the extension:
//     <%= vite_javascript_tag 'application.jsx' %>

console.log('Visit the guide for more information: ', 'https://vite-ruby.netlify.app/guide/rails')

// Example: Load Rails libraries in Vite.
//
// import * as Turbo from '@hotwired/turbo'
// Turbo.start()
//
// import ActiveStorage from '@rails/activestorage'
// ActiveStorage.start()
//
// // Import all channels.
// const channels = import.meta.globEager('./**/*_channel.js')

// Example: Import a stylesheet in app/frontend/index.css
// import '~/index.css'
import '@fortawesome/fontawesome-free/css/all.css'
import "../styles/application.css"
import { createApp } from "vue"
import HomeDashboard from "../components/HomeDashboard.vue"
import AccountDashboard from "../components/AccountDashboard.vue"
import ForecastDashboard from "../components/ForecastDashboard.vue"
import { use } from 'echarts/core'
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

const registry = {
  HomeDashboard,
  AccountDashboard,
  ForecastDashboard,
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-component]").forEach(el => {
    const name = el.dataset.component
    const component = registry[name]
    if (!component) return

    const props = Object.entries(el.dataset)
      .filter(([key]) => key !== "component")
      .reduce((h, [key, val]) => {
        h[key] = JSON.parse(val)
        return h
      }, {})

    createApp(component, props).mount(el)
  })
})

