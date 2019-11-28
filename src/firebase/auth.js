// signup
import firebase from './index';

//listen for auth status changed
export function loginStatus(setUserObject, userData, setUserData, setSpinnerDisplay) {
	firebase.auth().onAuthStateChanged(user => {
		setUserObject(user);
		if (user) {
			console.log(user.uid);

  		return (
  			user.getIdTokenResult().then(idTokenResult => {
	  			return idTokenResult
	  		}).then(idTokenResult => {
					const admin = idTokenResult.claims.admin === true;
					const oneOfThirteen = idTokenResult.claims.oneOfThirteen === true;

					return () => {
						setUserObject({...user, admin, oneOfThirteen: oneOfThirteen});
						setUserData({...userData, admin, isOneOfThirteen: oneOfThirteen});
					}
			  }).catch(err => {
					console.log(err)
				}),
				//get user Data from db
				firebase.firestore().collection('users').doc(user.uid).get().then(doc => {
					const docData = doc.data()
		  		setUserData({...userData, ...docData});
					setSpinnerDisplay(false);
		  	}).catch(err => {
					console.log(err)
				})
	  	)
		} else {
			setSpinnerDisplay(false);
		}
	})
};

// sign up
export function addNewUser(email, password, names, errorFunction) {
	firebase.auth().createUserWithEmailAndPassword(email, password)
	.then(cred => {
		const firstNameToLC = names.firstName.toLowerCase();
		const lastNameToLC = names.lastName.toLowerCase();
		const firstNameFirstLetterToUC = names.firstName[0].toUpperCase()+names.firstName.replace(names.firstName[0], "");
		const lastNameFirstLetterToUC = names.lastName[0].toUpperCase()+names.lastName.replace(names.lastName[0], "");
		
		//add user info to userdb
		return firebase.firestore().collection('users').doc(cred.user.uid).set({
			admin: false,
			email: email,
			firstName: names.firstName,
			isOneOfThirteen: false,
			lastName: names.lastName,
			searchData: [names.firstName, names.lastName, firstNameToLC, lastNameToLC, firstNameFirstLetterToUC, lastNameFirstLetterToUC],
			uid: cred.user.uid,
			uploadedDate: new Date().toJSON()
		});
	})
	.catch(err => {
	  return errorFunction(err)
	})
};

//log out
export function logUserOut(setUserData) {
	firebase.auth().signOut().then(() => {
		//user data is the same as the last logged in user to begin with
		setUserData(null);
	})
};

//log in
export function logUserIn(email, password, setUserObject, errorFunction) {
	firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
		firebase.auth().currentUser.getIdToken(true);
	})
	.catch(err => {
		return errorFunction(err)
	})
};