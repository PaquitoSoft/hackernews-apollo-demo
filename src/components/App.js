import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import Header from './Header';
import Login from './Login';
import LinkList from './LinkList';
import CreateLink from './CreateLink';
import Search from './Search';

class App extends Component {

	render() {
		return (
			<div className="center w85">
				<Header />
				<div className="">
					<Switch>
						<Route exact path="/" component={LinkList} />
						<Route path="/create" component={CreateLink} />
						<Route path="/login" component={Login} />
						<Route path="/search" component={Search} />
					</Switch>
				</div>
			</div>
		);
	}
}

export default App;
