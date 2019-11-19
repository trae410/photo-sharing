const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();


exports.DBAddOrRemoveOneOfThirteen = functions.https.onCall((data, context) => {
	//check request made by one of 13
	if ( context.auth.token.oneOfThirteen !== true ) {
    return { 
    	message: ' error: Only the thirteen can add the thirteen',
    	value: false 
    }
  }

  //get user
	return admin.auth().getUserByEmail(data.email).then(user => { 
		//change data in db
		return admin.firestore().collection('users').doc(user.uid).set({
			isOneOfThirteen: data.value
			}, { merge: true });
	}).then(() => {
		return {
			message: `Success! ${data.email}'s account has been set to: oneOfThirteen: ${data.value}`,
			value: true
		}
	}).catch(err => {
		return {
			message: `error: ${err}`,
			value: false,
			data: data
		}
	});

});


exports.addOrRemoveOneOfThirteen = functions.https.onCall((data, context) => {
	let returnedUser;
	let newClaims;
	//check request made by one of 13
	if ( context.auth.token.oneOfThirteen !== true ) {
    return { 
    	message: 'error: Only the thirteen can add or remove the thirteen',
    	value: false
    }
  }
  
	//get user and add custom claim
	return admin.auth().getUserByEmail(data.email).then(user => {

		//get current custom user claims
		existingClaims = user.customClaims;
		newClaims = {...existingClaims, oneOfThirteen: data.value};

		// change custom user claims
		return admin.auth().setCustomUserClaims(user.uid, newClaims)
	}).then(() => {
		return {
			message: `Success! ${data.email}'s claims have been set to: oneOfThirteen: ${newClaims.oneOfThirteen}`,
			value: true
		}
	}).catch(err => {
		return {
			message: `error: ${err}`,
			value: false,
			data: data
		}
	});

});


exports.DBAddOrRemoveAdmin = functions.https.onCall((data, context) => {
	//check request made by admin
	if ( context.auth.token.admin !== true ) {
    return { 
    	message: 'error: Only admins can add or remove admins',
    	value: false
    }
  }

  //get user
	return admin.auth().getUserByEmail(data.email).then(user => { 
		//change data in db
		return admin.firestore().collection('users').doc(user.uid).set({
			admin: data.value
			}, { merge: true });
	}).then(() => {
		return {
			message: `Success! ${data.email}'s account has been set to: admin: ${data.value}`,
			value: true
		}
	}).catch(err => {
		return {
			message: `error: ${err}`,
			value: false,
			data: data
		}
	});

});


exports.addOrRemoveAdmin = functions.https.onCall((data, context) => {
	let returnedUser;
	let newClaims;
	//check request made by admin
	if ( context.auth.token.admin !== true ) {
    return { 
    	message: 'error: Only admins can add or remove admins',
			value: false
	  }
	}
  
	//get user and add custom claim
	return admin.auth().getUserByEmail(data.email).then(user => {

		//get current custom user claims
		existingClaims = user.customClaims;
		newClaims = {...existingClaims, admin: data.value};

		// change custom user claims
		return admin.auth().setCustomUserClaims(user.uid, newClaims)
	}).then(() => {
		return {
			message: `Success! ${data.email}'s claims have been set to: admin: ${newClaims.admin}`,
			value: true,
		}
	}).catch(err => {
		return {
			message: `error: ${err}`,
			value: false,
			data: data,
			newClaims: newClaims
		}
	});

});


exports.deleteUser = functions.https.onCall((data, context) => {
	const idToken = context.auth.token;
		
	// check if admin or user
	if ( context.auth.token.admin !== true && context.auth.token.uid !== data.uid ) {
    return { 
    	message: 'error: Users can only delete their own accounts',
    	value: false,
    	idTokenUID: idToken.uid,
    	dataUID: data.uid,
    	admin: idToken.admin
    }
	}

	return admin.auth().deleteUser(data.uid).then(() => {
		return {
			message: 'deleted user successfully. Now deleting user info...',
			value: true
		}
	}).then(() => {
		//change data in db
		return admin.firestore().collection('users').doc(data.uid).delete()
	}).then(() => {
		return {
			message: 'deleted user successfully!',
			value: true
		}
	}).catch(err => {
		return {
			message: `error: ${err}`,
			value: false,
			data: data
		}	
	})

});

// verify the uid a different way... more secure this way? 
// could a user on client end set the params for context?
	// return admin.auth().verifyIdToken(data.idToken).then(decodedToken => {
		
	// 	// check if admin or user
	// 	if ( idToken.admin !== true  || idToken.uid !== decodedToken.uid ) {
	//     return { value: false, error: 'Users can only delete their own accounts', decodedToken }
	//   }