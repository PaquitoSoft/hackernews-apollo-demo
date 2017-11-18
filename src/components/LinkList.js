import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Link from './Link';

class LinkList extends React.Component {

	// Carlos: WTF!!! It appears I have to manually update cached
	// content to see the new created vote
	// https://www.howtographql.com/react-apollo/6-more-mutations-and-updating-the-store/
	_updateCacheAfterVote = (store, createVote, linkId) => {
		// Read what is currently in the cache for the query that
		// returns all available links
		const data = store.readQuery({ query: ALL_LINKS_QUERY });

		// Update the link which was voted in the cached list
		// with the response from the server ('createVote')
		const votedLink = data.allLinks.find(link => link.id === linkId);
		votedLink.votes = createVote.link.votes;

		// Store the updated list
		store.writeQuery({ query: ALL_LINKS_QUERY, data });
	}

	_subscribeToNewLinks = () => {
		this.props.allLinksQuery.subscribeToMore({
			document: gql`
				subscription {
					Link(filter: {
						mutation_in: [CREATED]
					}) {
						node {
							id
							url
							description
							createdAt
							postedBy {
								id
								name
							}
							votes {
								id
								user {
									id
								}
							}
						}
					}
				}
			`,
			updateQuery: (previous, { subscriptionData }) => {
				const newAllLinks = [
					subscriptionData.Link.node,
					...previous.allLinks
				];

				const result = {
					...previous,
					allLinks: newAllLinks
				};

				return result;

				// return {
				// 	...previous,
				// 	allLinks: [
				// 		...previous.allLinks,
				// 		subscriptionData.Link.node
				// 	]
				// }
			}
		});
	}

	_subscribeToNewVotes = () => {
		this.props.allLinksQuery.subscribeToMore({
			document: gql`
				subscription {
					Vote(filter: { mutation_in: [CREATED] }) {
						node {
							id
							link {
								id
								url
								description
								createdAt
								postedBy {
									id
									name
								}
								votes {
									id
									user {
										id
									}
								}
							}
							user {
								id
							}
						}
					}
				}
			`,
			updateQuery: (previous, { subscriptionData }) => {
				const votedLinkIndex = previous.allLinks.findIndex(link => link.id === subscriptionData.Vote.node.link.id);
				const link = subscriptionData.Vote.node.link;
				const newAllLinks = previous.allLinks.slice();
				newAllLinks[votedLinkIndex] = link;
				const result = {
					...previous,
					allLinks: newAllLinks
				};
				return result;
			}
		});
	}

	componentDidMount() {
		this._subscribeToNewLinks();
		this._subscribeToNewVotes();
	}

	render() {
		const { allLinksQuery } = this.props;

		if (allLinksQuery.loading) {
			return (<p>Fetching data...</p>);
		}

		if (allLinksQuery.error) {
			return (<p>Error: {allLinksQuery.error}</p>);
		}

		const links = allLinksQuery.allLinks;

		return (
			<div>
				<div>
					{links.map((link, index) => (
						<Link
							key={link.id}
							link={link}
							index={index}
							updateStoreAfterVote={this._updateCacheAfterVote}
						/>
					))}
				</div>
			</div>
		);
	}

}

export const ALL_LINKS_QUERY = gql`
	query AllLinksQuery {
		allLinks {
			id
			createdAt
			url
			description
			postedBy {
				id
				name
			}
			votes {
				id
				user {
					id
				}
			}
		}
	}
`;

export default graphql(ALL_LINKS_QUERY, { name: 'allLinksQuery'})(LinkList);
