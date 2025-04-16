import { AuthProvider } from '../context/AuthContext';
import { TodoProvider } from '../context/TodoContext';
import '../styles/globals.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <TodoProvider>
        <Component {...pageProps} />
      </TodoProvider>
    </AuthProvider>
  );
}

export default MyApp;