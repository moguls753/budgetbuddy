module.exports = {
  content: [
    './app/views/**/*.{html,erb,haml}',
    './app/helpers/**/*.rb',
    './app/frontend/**/*.{js,jsx,ts,tsx,vue}',
  ],
  plugins: [require("daisyui")],
}
