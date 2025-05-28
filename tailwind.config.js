const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        '.dentify-logoName': {
          fontWeight: 'normal',
          fontSize: '2rem',
          lineHeight: '3rem',
          color: '#FFFFFF',
          fontFamily: 'Arial, sans-serif',
          '@screen sm': {
            fontSize: '3rem',
            lineHeight: '4.75rem',
          },
          '@screen md': {
            fontSize: '4rem',
            lineHeight: '6.375rem',
          },
        },
        '.auth-head': {
          fontWeight: 'bold',
          fontSize: '1.5rem',
          lineHeight: '1.5',
          fontFamily: 'Poppins, sans-serif',
          float: 'left',
          color: '#090713',
          '@screen sm': {
            fontSize: '1.75rem',
            lineHeight: '1.75',
          },
          '@screen md': {
            fontSize: '2.25rem',
            lineHeight: '1.75',
          },
          '@screen lg': {
            fontSize: '2.5rem',
            lineHeight: '1.75',
          },
        },
        '.table': {
          minWidth: '100%',
          fontSize: '0.875rem',
          textAlign: 'left',
          direction: 'ltr',
          color: '#6B7280',
          borderCollapse: 'collapse',
          borderSpacing: '0',
          border: 'none',
        },
        '.table-divided': {
          borderColor: '#E5E7EB',
          borderBottomWidth: '1px',
          borderTopWidth: '1px',
        },
        '.table-header': {
          minWidth: '100px',
          height: '2.5rem',
          padding: '0.5rem 1rem',
          borderBottom: '1px solid #EAE5FF',
          textAlign: 'left',
          fontSize: '0.75rem',
          fontWeight: '500',
          fontFamily: 'Montserrat, sans-serif',
          color: '#090713',
          letterSpacing: '0.05em',
        },
        '.table-data': {
          padding: '0.5rem 1rem',
          borderBottom: '1px solid #EAE5FF',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          fontSize: '0.875rem',
        },
        '.next-button': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 0.75rem',
          height: '2rem',
          lineHeight: '1.25rem',
          color: 'white',
          backgroundColor: '#115CC9',
          borderRadius: '0.375rem',
          '&:hover': {
            backgroundColor: '#2563eb',
            color: 'white',
          },
        },
        '.previous-button': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 0.75rem',
          height: '2rem',
          lineHeight: '2rem',
          color: '#6b7280',
          backgroundColor: '#ffffff',
          borderRadius: '0.375rem',
          '&:hover': {
            backgroundColor: '#f3f4f6',
            color: '#374151',
          },
        },
        '.current-page': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 0.75rem',
          height: '2rem',
          lineHeight: '1rem',
          color: '#090713',
          fontWeight: '400',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '0.75rem',
          backgroundColor: '#ffffff',
          borderRadius: '0.375rem',
        },
        '.action-button': {
          display: 'flex',
          alignItems: 'center',
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '10px',
          cursor: 'pointer',
        },
      });
    }),
  ],
};
