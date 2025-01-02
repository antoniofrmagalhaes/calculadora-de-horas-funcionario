import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '@/styles/theme';
import type { AppProps } from 'next/app';
import ApplicationProvider from '@/contexts/ApplicationContext';

import "react-datepicker/dist/react-datepicker.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <ApplicationProvider>
        <Component {...pageProps} />
      </ApplicationProvider>
    </ChakraProvider>
  );
}

export default MyApp;
