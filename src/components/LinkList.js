import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Link from './Link';
import { LINKS_PER_PAGE } from '../constants';

class LinkList extends React.Component {

	// Carlos: WTF!!! It appears I have to manually update cached
	// content to see the new created vote
	// https://www.howtographql.com/react-apollo/6-more-mutations-and-updating-the-store/
	_updateCacheAfterVote = (store, createVote, linkId) => {
		// Read what is currently in the cache for the query that
		// returns all available links
		// const data = store.readQuery({ query: ALL_LINKS_QUERY });

		// // Update the link which was voted in the cached list
		// // with the response from the server ('createVote')
		// const votedLink = data.allLinks.find(link => link.id === linkId);
		// votedLink.votes = createVote.link.votes;

		// // Store the updated list
		// store.writeQuery({ query: ALL_LINKS_QUERY, data });


		const isNewPage = this.props.location.pathname.includes('new');
		const page = parseInt(this.props.match.params.page, 10);
		const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
		const first = isNewPage ? LINKS_PER_PAGE : 100;
		const orderBy = isNewPage ? 'createdAt_DESC' : null;
		const data = store.readQuery({
			query: ALL_LINKS_QUERY,
			variables: { first, skip, orderBy }
		});

		const votedLink = data.allLinks.find(link => link.id === linkId);
		votedLink.votes = createVote.link.votes;
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

	_getLinksToRender = (isNewPage) => {
		if (isNewPage) {
			return this.props.allLinksQuery.allLinks;
		}

		const rankedLinks = this.props.allLinksQuery.allLinks.slice();
		rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length);
		return rankedLinks;
	}

	_previousPage = () => {
		const page = parseInt(this.props.match.params.page, 10);
		if (page > 1) {
			const previousPage = page - 1;
			this.props.history.push(`/new/${previousPage}`);
		}
	}

	_nextPage = () => {
		const page = parseInt(this.props.match.params.page, 10);
		if (page <= this.props.allLinksQuery._allLinksMeta.count / LINKS_PER_PAGE) {
			const nextPage = page + 1;
			this.props.history.push(`/new/${nextPage}`);
		}
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

		// const links = allLinksQuery.allLinks;
		const isNewPage = this.props.location.pathname.includes('new');
		const links = this._getLinksToRender(isNewPage);
		const page = parseInt(this.props.match.params.page, 10);

		return (
			<div>
				<div>
					{links.map((link, index) => (
						<Link
							key={link.id}
							link={link}
							_index={index}
							index={page ? (page - 1) * LINKS_PER_PAGE + index : index}
							updateStoreAfterVote={this._updateCacheAfterVote}
						/>
					))}
				</div>
				{
					isNewPage &&
					<div className="flex ml4 mv3 gray">
						<div
							className="pointer mr2"
							onClick={() => this._previousPage()}>
							Previous
						</div>
						<div
							className="pointer"
							onClick={() => this._nextPage()}>
							Next
						</div>
					</div>
				}
			</div>
		);
	}

}

export const ALL_LINKS_QUERY = gql`
	query AllLinksQuery($first: Int, $skip: Int, $orderBy: LinkOrderBy) {
		allLinks(first: $first, skip: $skip, orderBy: $orderBy) {
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
		_allLinksMeta {
			count
		}
	}
`;

export default graphql(ALL_LINKS_QUERY, {
	name: 'allLinksQuery',
	options: (ownProps) => {
		const page = parseInt(ownProps.match.params.page, 10);
		const isNewPage = ownProps.location.pathname.includes('new');
		const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
		const first = isNewPage ? LINKS_PER_PAGE : 100;
		const orderBy = isNewPage ? 'createdAt_DESC' : null;
		return {
			variables: { first, skip, orderBy }
		};
	}
})(LinkList);
