import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { GC_USER_ID } from '../constants';
import { timeDifferenceForDate } from "../utils";

class Link extends React.Component {

	_voteForLink = async () => {
		// TODO Save user interaction
		const userId = localStorage.getItem(GC_USER_ID);
		const voterIds = this.props.link.votes.map(vote => vote.user.id);

		if (voterIds.includes(userId)) {
			alert(`User (${userId}) already voted for this link.`);
			return false;
		}

		const linkId = this.props.link.id;
		await this.props.createVoteMutation({
			variables: { userId, linkId },
			// Carlos: WTF!!! It appears I have to manually update cached
			// content to see the new created vote
			// https://www.howtographql.com/react-apollo/6-more-mutations-and-updating-the-store/
			update: (store, { data: { createVote } }) => {
				this.props.updateStoreAfterVote(store, createVote, linkId)
			}
		});
	}

	render() {
		const { link: { description, url, votes, postedBy, createdAt }, index } = this.props;
		const userId = localStorage.getItem(GC_USER_ID);
		return (
			<div className="flex mt2 items-start">
				<div className="flex items-center">
					<span className="gray">{index + 1}.</span>
					{
						userId &&
						<div
							className="ml1 gray f11"
							onClick={() => this._voteForLink()}
						>▲</div>
					}
				</div>
				<div className="ml1">
					<div>{description} (<a href={url} target="_blank">{url}</a>)</div>
					<div className="f6 lh-copy gray">
						{votes.length} votes | by {postedBy ? postedBy.name : 'Unknown' }
						&nbsp;
						{timeDifferenceForDate(createdAt)}
					</div>
				</div>
			</div>
		);
	}

}

const CREATE_VOTE_MUTATION = gql`
	mutation CreateVoteMutation($userId: ID!, $linkId: ID!) {
		createVote(userId: $userId, linkId: $linkId) {
			id
			link {
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
`;

export default graphql(CREATE_VOTE_MUTATION, {
	name: 'createVoteMutation'
})(Link);
