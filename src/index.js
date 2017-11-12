import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import './styles/index.css';

// const httpLink = new HttpLink({ uri: 'https://api.graph.cool/simple/v1/cj9mzzig401lm0158ltmu2821' });
const httpLink = new HttpLink({ uri: 'https://api.graph.cool/simple/v1/cj9vmff910qsf01488elqknze' });

const client = new ApolloClient({
	link: httpLink,
	cache: new InMemoryCache()
});

const Root = (
	<BrowserRouter>
		<ApolloProvider client={client}>
			<App />
		</ApolloProvider>
	</BrowserRouter>
);

ReactDOM.render(Root, document.getElementById('root'));

registerServiceWorker();
