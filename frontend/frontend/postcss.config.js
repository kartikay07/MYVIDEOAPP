module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      perspective: {
        600: '600px', // Add perspective utility
      },
      transformStyle: {
        'preserve-3d': 'preserve-3d', // Add transform-style utility
      },
    },
  },
  plugins: [],
};
module.exports = {
  theme: {
    extend: {
      animation: {
        'homotopy-mapping-cylinder': 'homotopyMappingCylinder 5s infinite linear',
      },
      keyframes: {
        homotopyMappingCylinder: {
          '0%': {
            transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
          },
          '50%': {
            transform: 'rotateX(180deg) rotateY(180deg) rotateZ(180deg) scale(1.2)',
            borderRadius: '40%',
            width: '45px',
            height: '45px',
          },
          '100%': {
            transform: 'rotateX(360deg) rotateY(360deg) rotateZ(360deg) scale(1.5)',
            borderRadius: '20%',
            width: '30px',
            height: '30px',
          },
        },
      },
    },
  },
};
