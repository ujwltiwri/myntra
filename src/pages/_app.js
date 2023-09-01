import '@/styles/globals.css';
import { ApolloProvider } from '@apollo/client';
import client from '../../apollo';
import { Provider } from 'react-redux';
import store from '@/redux/store';

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </Provider>
  );
}