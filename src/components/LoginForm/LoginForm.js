import React, { useState, useEffect } from 'react';
import { Button, InputDiv, FormStyle, ErrorTextStyle } from '../../theme.js';
import { addNewUser, logUserIn } from '../../firebase/auth';
import firebase from '../../firebase';
import { useLocation } from "react-router-dom";


function useQuery() {
  return new URLSearchParams(useLocation().search);
};

function LoginForm({ setUserObject }) {

	const [ loginOrSignup, setLoginOrSignup ] = useState('');
	const [ names, setNames ] = useState({firstName: "", lastName: ""});
	const [ email, setEmail ] = useState('');
	const [ password, setPassword ] = useState('');
	const [ passwordAgain, setPasswordAgain ] = useState('');
	const [ errorText, setErrorText ] = useState('');
	// const [ errorTextVisibility, setErrorTextVisibility ] = useState(false);
	const [ firstRender, setFirstRender ] = useState(true);
	const [ successText, setSuccessText ] = useState('');
	const [ successTextClass, setSuccessTextClass ] = useState('');

	if (successTextClass === "visible") {
		setTimeout(() => setSuccessText(''), 6500);
		setTimeout(() => setSuccessTextClass("hidden"), 1000);
	};

	let query = useQuery();

	const errorFunction = err => {
		const msg = err.message;
		setErrorText(msg.slice(0, msg.indexOf('.')) + '...');
	};

	const handlePasswordAgain = e => {
		const text = e.target.value;
		setPasswordAgain(text);
	};

	const checkPasswords = () => {
		if (password.length < 6 && passwordAgain.length) {
			setErrorText("password must be at least 6 characters!");

		} else if (password !== passwordAgain && passwordAgain.length) {
			setErrorText("passwords do not match!");

		} else {
			setErrorText('')
		}
	};

	const handleFirstName = e => {
		const text = e.target.value;
		setNames(names => ({...names, firstName: text}));
	};

	const handleLastName = e => {
		const text = e.target.value;
		setNames(names => ({...names, lastName: text}));
	};

	const handleSignup = () => {
		addNewUser(email, password, names, errorFunction);
	};

	const handleLogin = () => {
		logUserIn(email, password, setUserObject, errorFunction);
	};

	const handleForgotPassword = e => {
		e.preventDefault();
		if (email) {
			firebase.auth().sendPasswordResetEmail(email).then(res => {
				console.log(res);
				setSuccessTextClass("visible");
				setSuccessText("Success! Password reset link has been emailed to you");
			}).catch(err => {
				console.log(err);
				errorFunction(err);
			});
		};
		if (!email) {
			setErrorText('please input your email')
		}
	}
	
	const handleSubmit = e => {
		e.preventDefault();
		if (!errorText && email && password) {
			if (loginOrSignup === 'Sign up') {
				handleSignup()
			} else if (loginOrSignup === 'Log in') {
				handleLogin()
			}
		} else {
			return false
		} 
	};


	if (firstRender) {
		const hasUrlParams = query.has("em") || query.has("fn") || query.has("ln");

		if (hasUrlParams) {	  
			let em = query.get("em");
		  let fn = query.get("fn");
		  let ln = query.get("ln");

		  if (fn || ln) {
		  	setLoginOrSignup('Sign up');
		  } else {
		  	setLoginOrSignup('Log in');
		  };

		  if (em) {
			  setEmail(em);
			};

			if (fn) {
		  	setNames(names => ({...names, firstName: fn}))
	  	};

	  	if (ln) {
		  	setNames(names => ({...names, lastName: ln}))
	  	};

		} else {
	  	setLoginOrSignup('Log in');
		};
		setFirstRender(false);
	};



	useEffect((/*did update*/) => {
		window.history.pushState({}, document.title, "/");
	 // eslint-disable-next-line react-hooks/exhaustive-deps
	},[]);

	if (loginOrSignup === 'Sign up') {
		return (
			<FormStyle formType="login" onSubmit={e => handleSubmit(e)} >
				<div className="modal-content">
					<span className="heading">Sign up</span>
					<p>or</p>
					<div className="link-appearance blue large" onClick={e => {
						setLoginOrSignup('Log in');
						setErrorText('');
						setPasswordAgain('')
						}} >
						Log in
					</div> 
					<form>

						<InputDiv>
							<input type="email" placeholder="email" 
							onChange={e => {
								setEmail(e.target.value);
								setErrorText('')
							}} 
							value={email}
							required />
						</InputDiv>

						<InputDiv>
							<input type="password" onKeyUp={checkPasswords} 
							onChange={e => {
								setPassword(e.target.value);
							}}
							placeholder="password" 
							value={password} 
							required />
						</InputDiv>

						<InputDiv>
							<input type="password" onKeyUp={checkPasswords} 
							onChange={e => handlePasswordAgain(e)} 
							placeholder="password again" 
							value={passwordAgain} />
						</InputDiv><br />

						<InputDiv>
							<input type="text" placeholder="first name" 
							onChange={e => handleFirstName(e)}
							value={names.firstName}
							required />
						</InputDiv>

						<InputDiv>
							<input type="text" placeholder="last name" 
							onChange={e => handleLastName(e)}
							value={names.lastName}
							required />
						</InputDiv>
		
						<div className={successTextClass}>{successText}</div>
						<ErrorTextStyle formError={true}>{errorText}</ErrorTextStyle>
						<Button>
							{loginOrSignup}
						</Button>
					</form>
				</div>
			</FormStyle>
		)

	} else {
		return (
			<FormStyle formType="login" onSubmit={e => handleSubmit(e)} >
				<div className="modal-content">
					<span className="heading">Log in</span>
					<p>or</p>
					<div className="link-appearance blue large" onClick={e => {
						setLoginOrSignup('Sign up');
						setErrorText('')
						}} >
					Sign up</div> 
					<form>
						<InputDiv>
							<input type="email" onChange={e => { 
								setEmail(e.target.value);
								setErrorText('')
							}}
							placeholder="email" 
							value={email}
							required />
						</InputDiv>

						<InputDiv>
							<input type="password" onChange={e => {
								setPassword(e.target.value);
								setErrorText('')
							}}
							placeholder="password" 
							value={password} 
							required />
						</InputDiv>
						
						<div className={successTextClass}>{successText}</div>
						<ErrorTextStyle formError={true} >{errorText}</ErrorTextStyle>
						<p className='link-appearance blue small' onClick={e => handleForgotPassword(e)}>forgot password</p>
						<Button>
							{loginOrSignup}
						</Button>
					</form>
				</div>
			</FormStyle>
		)
	}
};

export default LoginForm; 