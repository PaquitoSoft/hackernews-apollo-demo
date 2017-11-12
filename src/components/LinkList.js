import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Link from './Link';

class LinkList extends React.Component {

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
					{links.map(link => (
						<Link key={link.id} link={link} />
					))}
				</div>
			</div>
		);
	}

}

const ALL_LINKS_QUERY = gql`
	query AllLinksQuery {
		allLinks {
			id
			createdAt
			url
			description
		}
	}
`;

export default graphql(ALL_LINKS_QUERY, { name: 'allLinksQuery'})(LinkList);
