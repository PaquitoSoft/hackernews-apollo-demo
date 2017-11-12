import React from 'react';
import { GC_AUTH_TOKEN, GC_USER_ID } from '../constants';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';

class Login extends React.Component {

	state = {
		login: true, // switch between Login and SignUp
		email: '',
		password: '',
		name: ''
	}

	_saveUserData = (id, token) => {
		localStorage.setItem(GC_USER_ID, id);
		localStorage.setItem(GC_AUTH_TOKEN, token);
	}

	_confirm = async () => {
		const { name, email, password } = this.state;
		if (this.state.login) {
			const result = await this.props.authenticateUserMutation({
				variables: { email, password }
				// variables: {
				// 	email: { email, password }
				// }
			});
			const { id, token } = result.data.authenticateuser;
			this._saveUserData(id, token);
		} else {
			const result = await this.props.signupUserMutation({
				variables: { name, email, password }
			});
			const { id, token } = result.data.signupUser;
			this._saveUserData(id, token);
		}
		this.props.history.push('/');
	}

	render() {
		return (
			<div>
				<h4 className="mv3">{this.state.login ? 'Login' : 'Sign Up'}</h4>
				<div className="flex flex-column">
					{
						!this.state.login &&
						<input
							value={this.state.name}
							onChange={e => this.setState({ name: e.target.value})}
							type="text"
							placeholder="Your name"
						/>
					}
					<input
						value={this.state.email}
						onChange={(e) => this.setState({ email: e.target.value })}
						type='text'
						placeholder='Your email address'
					/>
					<input
						value={this.state.password}
						onChange={(e) => this.setState({ password: e.target.value })}
						type='password'
						placeholder='Choose a safe password'
					/>
				</div>
				<div className="flex mt3">
					<div
						className='pointer mr2 button'
						onClick={() => this._confirm()}
					>
						{this.state.login ? 'login' : 'create account' }
					</div>
					<div
						className="pointer mr2 button"
						onClick={() => this.setState({ login: !this.state.login })}
					>
						{this.state.login ? 'need to create an account?' : 'already have an account?'}
					</div>
				</div>
			</div>
		);
	}

}

const SIGNUP_USER_MUTATION = gql`
	mutation SignupUserMutation($email: String!, $password: String!, $name: String!) {
		signupUser(
			email: $email,
			password: $password,
			name: $name
		) {
			id
			token
		}
	}
`;

const AUTHENTICATE_USER_MUTATION = gql`
	mutation AuthenticateUserMutation($email: String!, $password: String!) {
		authenticateUser(
			email: $email,
			password: $password
		) {
			token
			user {
				id
			}
		}
	}
`;

export default compose(
	graphql(SIGNUP_USER_MUTATION, { name: 'signupUserMutation' }),
	graphql(AUTHENTICATE_USER_MUTATION, { name: 'authenticateUserMutation' })
)(Login);
