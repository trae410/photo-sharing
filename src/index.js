import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import swConfig from './swConfig';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//https://create-react-app.dev/docs/making-a-progressive-web-app/ the above link didnt work 
//see the following article on caching for PWAs the problem is if the user never closes their tab 
// as in the case with a phone: https://dev.to/flexdinesh/cache-busting-a-react-app-22lk
serviceWorker.register(swConfig);
// if("serviceWorker" in navigator) {
// 	navigator.serviceWorker.register('/sw.js')
// 	.then((reg) => console.log("serviceWorker registered", reg))
// 	.catch((err) => console.log("serviceWorker not registered", err))
// }