//from recipes progect

//offline data
// db.enablePersistence()
// .catch(err => {
// 	if(err.code == 'failed-precondition') {
// 		//probably multiple tabs open
// 		console.log('Persistence failed');
// 	} else if (err.code == 'unimplemented') {
// 		//lack of browser support 
// 		console.log('persistence is not available');
// 	}
// })


// //real time listener
// db.collection('recipes').onSnapshot((snapshot) => {
// 	// console.log(snapshot.docChanges());
// 	snapshot.docChanges().forEach(change => {
// 		// console.log(change, change.doc.data(), change.doc.id);
// 		if(change.type === 'added') {
// 			//add the doc data to the page
// 			renderRecipe(change.doc.data(), change.doc.id);
// 		}
// 		if (change.type === 'removed') {
// 			//remove the doc data from the page
// 			removeRecipe(change.doc.id)
// 		}
// 	})
// })








//add new recipe
// const form = document.querySelector('form');
// form.addEventListener('submit', evt => {
// 	evt.preventDefault();

// 	const recipe = {
// 		title: form.title.value,
// 		ingredients: form.ingredients.value
// 	};
// 	db.collection('recipes').add(recipe)
// 	.catch(err => console.log(err));

// 	form.title.value = "";
// 	form.ingredients.value = "";
// })

// remove a recipe
// const recipeContainer = document.querySelector('.recipes');
// recipeContainer.addEventListener('click', evt => {
//   if(evt.target.tagName === 'I'){
//     const id = evt.target.getAttribute('data-id');
//     //console.log(id);
//     db.collection('recipes').doc(id).delete();
//   }
// })