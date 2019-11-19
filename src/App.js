import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './global';
import { theme, Spinner, GridContent } from './theme';
import Navbar from './components/Navbar/Navbar';
import PhotoFeed from './components/PhotoFeed/PhotoFeed';
import Heading from './components/Heading/Heading';
import Search from './components/Search/Search';
import Profile from './components/Profile/Profile';
import UploadForm from './components/UploadForm/UploadForm';
import LoginForm from './components/LoginForm/LoginForm';
import { loginStatus } from './firebase/auth';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function CheckAuth(props) {
	if (props.spinnerDisplay) {
		return <Spinner />
		}
	if (props.userData && props.userObject) {
		return props.children
	} else {
		return <LoginForm setUserObject={props.setUserObject} />
	}
};

function App () {
const [ userObject, setUserObject ] = useState(null);
const [ userData, setUserData ] = useState({});
const [ spinnerDisplay, setSpinnerDisplay ] = useState(true);
const [ fetching, setFetching ] = useState(false);

useEffect((userObject) => {
	loginStatus(setUserObject, userData, setUserData, setSpinnerDisplay);
	// eslint-disable-next-line react-hooks/exhaustive-deps
},[]);

	return(
		<Router>
	  	<ThemeProvider theme={theme}>
	  		<GlobalStyles />
				<Heading />
				{
					fetching ? <Spinner /> : null
				}
				<Navbar fetching={fetching} />
				<Switch>
					<Route exact={true} path="/">
						<GridContent>
							<CheckAuth spinnerDisplay={spinnerDisplay} userObject={userObject} userData={userData} setUserObject={setUserObject}> 
								<PhotoFeed userData={userData} setUserData={setUserData} setFetching={setFetching} />
							</CheckAuth>
						</GridContent>
					</Route>
					<Route exact={true} path="/search">
						<GridContent>
							<CheckAuth spinnerDisplay={spinnerDisplay} userObject={userObject} userData={userData} setUserObject={setUserObject}> 
								<Search userData={userData} setUserData={setUserData} setFetching={setFetching} />
							</CheckAuth>
						</GridContent>
					</Route>
					<Route exact={true} path="/profile">
						<GridContent>
							<CheckAuth spinnerDisplay={spinnerDisplay} userObject={userObject} userData={userData} setUserObject={setUserObject}> 
								<Profile userData={userData} setUserData={setUserData}/>
							</CheckAuth>
						</GridContent>
					</Route>
					<Route exact={true} path="/add">
						<GridContent>
							<CheckAuth spinnerDisplay={spinnerDisplay} userObject={userObject} userData={userData} setUserObject={setUserObject}> 
								<UploadForm userData={userData} />
							</CheckAuth>
						</GridContent>
					</Route>
				</Switch>
	    </ThemeProvider>
		</Router>
		);
}

export default App;
