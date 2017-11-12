import React from 'react';

class Link extends React.Component {

	_voteForLink = async () => {
		// TODO Save user interaction
	}

	render() {
		const { link: { description, url } } = this.props;
		return (
			<div>
				<div>
					{description} ({url})
				</div>
			</div>
		);
	}

}

export default Link;
