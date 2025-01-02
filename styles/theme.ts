import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  components: {
    Avatar: {
      baseStyle: {
        excessLabel: {
          bg: '#5865F2',
          color: 'white',
          borderRadius: 'full',
          fontSize: 'sm',
          fontWeight: 'bold',
          h: '32px',
          w: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
    },
  },
  fonts: {
    heading: 'Open Sans',
    body: 'Open Sans',
  },
  colors: {
    brand: {
      500: '#FFB430',
    },
    gray: {
      900: '#181b23',
      800: '#1f2229',
      700: '#353646',
      600: '#4b4d63',
      500: '#616480',
      400: '#797d9a',
      300: '#9699b0',
      200: '#b3b5c6',
      100: '#d1d2dc',
      50: '#eeeef2',
    },
    discord: {
      50: '#f6f6f6',
      100: '#e6e6e6',
      200: '#c2c2c2',
      300: '#9e9e9e',
      400: '#7a7a7a',
      500: '#555555',
      600: '#414141',
      700: '#2d2d2d',
      800: '#1a1a1a',
      900: '#0a0a0a',
    },
  },
  styles: {
    global: {
      'html, body, #__next': {
        height: '100%',
        // overflow: 'hidden',
      },
      '#__next': {
        backgroundColor: 'white',
      },
    },
  },
  breakpoints: {
    xs: '320px',
    sm: '450px',
    md: '700px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1440px',
    xxxl: '1920px',
  },
});
