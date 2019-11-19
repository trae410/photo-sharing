import firebase from 'firebase/app';
import 'firebase/storage';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyA9wa-CGMUNFJlGj3piDXWaLlAU6oPDvaU",
  authDomain: "photo-sharing-dc7a1.firebaseapp.com",
  databaseURL: "https://photo-sharing-dc7a1.firebaseio.com",
  projectId: "photo-sharing-dc7a1",
  storageBucket: "photo-sharing-dc7a1.appspot.com",
  messagingSenderId: "129764023379",
  appId: "1:129764023379:web:16446f1e687d16e43bbaa6",
  measurementId: "G-C2LL3M81P6"
};

firebase.initializeApp(firebaseConfig);
// export const db = firebase.firestore();
// export const storage = firebase.storage();
// export const auth = firebase.auth();
// export const functions = firebase.functions()

// The default cache size threshold is 40 MB. Configure "cacheSizeBytes"
// for a different threshold (minimum 1 MB) or set to "CACHE_SIZE_UNLIMITED"
// to disable clean-up.
firebase.firestore().enablePersistence({synchronizeTabs:true})
  .catch(function(err) {
  	console.log(err)
  });

export default firebase
