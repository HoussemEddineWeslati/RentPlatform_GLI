const path = require('path');

module.exports = {
  plugins: [
    require('tailwindcss')({ config: path.resolve(__dirname, 'tailwind.config.cjs') }),
    require('autoprefixer'),
  ],
};