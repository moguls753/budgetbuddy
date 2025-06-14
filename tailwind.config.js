/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/views/**/*.html.erb",
    "./app/helpers/**/*.rb",
    "./app/frontend/**/*.{js,ts,vue}",
  ],
  theme: { extend: {} },
  plugins: [ require("daisyui") ],
  daisyui: { themes: ["light","dark"] },
}
