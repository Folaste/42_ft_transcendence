require('tailwindcss/plugin');

module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily:
      {
        poppins: "'Poppins'",
      },
      height:
      {
        'banner': '90px'
      },
      backgroundImage:
      {
        'banner': "url('/public/Banner2.png')",
        'blob' : "url('/src/images/blob2.png')",
        'blobAbout' : "url('/src/images/blobAbout.png')"
      },
      borderRadius:
      {
        'round': '50%'
      },
      translate:
      {
        'test': '4px'
      }
    },
  },
  plugins: [
  ],
}
