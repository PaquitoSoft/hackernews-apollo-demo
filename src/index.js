import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
// import { ApolloLink } from 'apollo-link';

import { ApolloLink, split } from 'apollo-client-preset';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

import { GC_AUTH_TOKEN } from './constants';

import './styles/index.css';

// const httpLink = new HttpLink({ uri: 'https://api.graph.cool/simple/v1/cj9mzzig401lm0158ltmu2821' });
const httpLink = new HttpLink({ uri: 'https://api.graph.cool/simple/v1/cj9vmff910qsf01488elqknze' });

const wsLink = new WebSocketLink({
	uri: 'wss://subscriptions.graph.cool/v1/cj9vmff910qsf01488elqknze',
	options: {
		reconnect: true,
		connectionParams: {
			authToken: localStorage.getItem(GC_AUTH_TOKEN)
		}
	}
});

const middlewareAuthLink = new ApolloLink((operation, forward) => {
	const token = localStorage.getItem(GC_AUTH_TOKEN);
	const authorizationHeader = token ? `Bearer ${token}` : null;
	operation.setContext({
		headers: {
			authotization: authorizationHeader
		}
	});
	return forward(operation);
});

const httpLinkWithAuthToken = middlewareAuthLink.concat(httpLink);

// Split tests 'requests' against first parameter: if result it's true,
// then it sends them to the second (link) argument; if it's false
// they're passed to third (link) argument
const link = split(
	({ query }) => {
		const { kind, operation } = getMainDefinition(query);
		return (kind === 'OperationDefinition' && operation === 'subscription');
	},
	wsLink,
	httpLinkWithAuthToken
);

const client = new ApolloClient({
	// link: httpLink,
	// link: httpLinkWithAuthToken,
	link,
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
