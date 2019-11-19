import React, { useState, useEffect } from 'react';
import { Button, InputDiv, SubNav, ErrorTextStyle } from '../../theme';
import { logUserOut } from '../../firebase/auth';
import { ProfileContainer, ProfilePicture } from './Profile.styled';
import firebase from '../../firebase/index';
import { PhotoFeedStyle, PostContainer, ImageHeading, ImgContainer, GridImage, GridVideo } from '../PhotoFeed/PhotoFeed.styled';
import { useMediaQuery } from 'react-responsive';


const Profile = ({ userData, setUserData }) => {
	const [ images, setImages ] = useState ('');
	const [ pictureUrl, setPictureUrl ] = useState('');
	const [ firstRender, setFirstRender ] = useState(true);
	const [ errorText, setErrorText ] = useState('');
	const [ subNav, setSubNav ] = useState('info');
	const [ docs, setDocs ] = useState([]);
	const [ nameChangeDisplay, setNameChangeDisplay ] = useState(false);
	const [ newName, setNewName ] = useState('');
	const [ noResultsDisplay, setNoResultsDisplay ] = useState(false);

	const collections = ['theThirteen', 'allFamily', 'extendedFamily'];
	const storageRef = ['profilePictures', 'images'];

	const isLessThan415px = useMediaQuery({ maxWidth: 415 });

	const handleLogout = () => {
		logUserOut(setUserData)
	};

	useEffect((/*did update*/) => {
		if(firstRender) {
			if (userData.profilePicture) {
				setPictureUrl(userData.profilePicture);
				setFirstRender(false);
			} else {
				setPictureUrl("/assets/blank-profile-picture.png");
				setFirstRender(false);
			};
		}
	},[userData, firstRender]);

	const handleText = e => {
		const text = e.target.value;
		setNewName(text);
	};

	const handleNameChange = () => {
		const re = /\s+/;
		const nameArray = newName.split(re);			

		const nameOne = nameArray[0];
		let nameTwo;
		if (nameArray[1]) {
			nameTwo = nameArray[1]
		} else {
			nameTwo = ''
		};
		console.log('name changed to ' + nameArray[0] + " " + nameArray[1]);		

		//update firestore, users.....
		const firstNameToLC = nameOne.toLowerCase();
		const lastNameToLC = nameTwo.toLowerCase();
		const firstNameFirstLetterToUC = nameOne[0].toUpperCase()+nameOne.replace(nameOne[0], "");
		const lastNameFirstLetterToUC = nameTwo[0].toUpperCase()+nameTwo.replace(nameTwo[0], "");

		firebase.firestore().collection('users').doc(userData.uid).update({
			firstName: nameOne,
			lastName: nameTwo,
			searchData: firebase.firestore.FieldValue.arrayUnion(nameOne, nameTwo, firstNameToLC, firstNameFirstLetterToUC, lastNameToLC, lastNameFirstLetterToUC)
		});

		//update all the search data and name on all existing photos in all collections
		collections.forEach(col => {
			firebase.firestore().collection(col).where('uploader', '==', userData.uid).get().then(snapshot => {
				snapshot.docs.forEach(doc => {
					firebase.firestore().collection(col).doc(doc.id).set({
						firstName: nameOne,
						lastName: nameTwo,
						searchData: firebase.firestore.FieldValue.arrayUnion(nameOne, nameTwo)
						}, { merge: true });
				})
			})
		});

		setUserData(userData => ({...userData, firstName: nameOne, lastName: nameTwo}));
		setNameChangeDisplay(false);
	};

	const handleChangeImage = () => {
		const fileInput = document.getElementById('file-input');
			// e.preventDefault();
			fileInput.click();
	};

	const handleRemoveProfilePic = () => {
		if (!images) {
			let windowResult = window.confirm('are you sure you want to remove your profile picture?');
			if (windowResult) {
				setImages('');
				document.getElementById('file-input').value = "";
				setPictureUrl("/assets/blank-profile-picture.png");
				removeProfilePic();
			} else {
				return false
			}
		} else {
			setImages('');
			document.getElementById('file-input').value = "";
			if (userData.profilePicture) {
				setPictureUrl(userData.profilePicture);
			} else {
				setPictureUrl("/assets/blank-profile-picture.png");
			}
		}
	};

	const handleRemovePic = (id, photosCollections) => {
		let windowResult = window.confirm('are you sure you want to delete this image?');
		if (windowResult) {			
			//remove from storage
			firebase.storage().ref(storageRef[1]).child(id).delete().then(() => {
			});
			
			//remove from all collections
			photosCollections.forEach(col => {
				firebase.firestore().collection(col).doc(id).delete();
			});

			const newDocs = docs.filter(doc => doc.id !== id);
			setDocs(newDocs);
			if (!newDocs.length) {
				setNoResultsDisplay(true)
			};
		}
	};

	const fileSelectedHandler = e => {
		if (e.target.files[0]) { 
			let file = e.target.files[0];
			let fileReader = new FileReader();
	    fileReader.onload = () => {
	      const image = new Image();
	      image.src = fileReader.result;
	      image.onload = () => {
	      	setImages({
	      		src: image.src, 
	      		width: image.width, 
		      	height: image.height,
		      	file: file
		      });
		      setPictureUrl(image.src)
	      };
	    };
	    fileReader.readAsDataURL(file);
		}
	};

	const fileUploadHandler = () => {
		// keep photos in cache for one month and allow cdn to cache and if max age passed, async revalidate within one day
		const metadata = {
		  cacheControl: 'public, max-age=2592000, stale-while-revalidate=86400'
		};
		let uploadTask = firebase.storage().ref(`${storageRef[0]}/${userData.uid}`).put(images.file, metadata);
			
		uploadTask.on('state_changed',  // on('evt_listener', progress(), error(), complete()
		(snapshot) => {
			//progress function
		}, (err) => {
			//error function
			console.log(err);
			setErrorText("something went wrong with the upload please refresh the page and try again");
		}, () => {
			//complete function
			firebase.storage().ref(storageRef[0]).child(userData.uid).getDownloadURL().then(url => {
				//add to DB.....
				firebase.firestore().collection('users').doc(userData.uid).set({
					profilePicture: url
				}, { merge: true });
				setImages('');
			})
		})
	};

	const removeProfilePic = () => {
		// delete from storage
		firebase.storage().ref(storageRef[0]).child(userData.uid).delete()
		.then(() => {
	  // delete from db
			firebase.firestore().collection('users').doc(userData.uid).update({
				profilePicture: firebase.firestore.FieldValue.delete()
			})
		}).catch(err => {
	  	setErrorText('An error occurred, please refresh the page and try again')
		});
	};

	const viewPhotos = () => {
		firebase.firestore().collection(collections[1]).where("uploader", "==", userData.uid).orderBy('uploadedDate', 'desc').get().then(snapshot => {
			const newDocs = snapshot.docs
			.map(doc => ({
				id: doc.id,
				...doc.data()
			}));
			setDocs(newDocs);

			if (!newDocs.length) {
				setNoResultsDisplay(true);
			};
		});
	};

	const rotateImage = (e, doc, i) => {
		// deal with EXIF issues
		const img = e.target.parentElement.parentElement.children[1].firstElementChild;
		const newDocs = docs;
		const newDoc = docs[i];
		if (!newDoc.rotate) {
			newDoc.rotate = 0
		};

		if (newDoc.rotate === 270) {
			img.removeAttribute("style");
			img.removeAttribute("height");
			img.removeAttribute("width");
			newDoc.rotate = 0;
		} else if (newDoc.rotate === 90) {
			img.height = newDoc.height / (newDoc.width / img.width);
			img.style.transform = `rotate(${newDoc.rotate + 90}deg)`;
			newDoc.rotate = newDoc.rotate + 90;
		} else {
			img.height = newDoc.width / (newDoc.width / img.width);
			img.style.transform = `rotate(${newDoc.rotate + 90}deg)`;
			newDoc.rotate = newDoc.rotate + 90;
		};
		setDocs(newDocs);
	};

	const results = docs.map((doc, i) => {
		const fileType = doc.fileName.toLocaleLowerCase();
		const isVideo = fileType.includes(".mp4") || 
		fileType.includes(".avi") || fileType.includes(".wmv") || 
		fileType.includes(".mov") || fileType.includes(".qt") || 
		fileType.includes(".mkv") || fileType.includes(".avchd");

		return (
			<PostContainer key={doc.id} numberOfPhotos={docs.length} aspectRatio={doc.width / doc.height}
			isLessThan415px={isLessThan415px} >
				<ImageHeading>
					<strong><a className="name-link" href={`/search?users=${doc.firstName}`}>{`${doc.firstName} ${doc.lastName} `}</a></strong>
					{
						!isVideo ?
						<span onClick={e => rotateImage(e, doc, i)}>Rotate</span> :null
					}
					<span onClick={() => handleRemovePic(doc.id, doc.collections)}>
						<svg viewBox="0 0 32 32" width="16px" height="16px" fill="none" stroke="currentcolor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
					    <path d="M28 6 L6 6 8 30 24 29 26 6 4 6 M16 12 L16 24 M21 12 L20 24 M11 12 L12 24 M12 6 L13 2 19 2 20 6" />
						</svg>delete
					</span>
				</ImageHeading>
				
				<ImgContainer>
					{
						isVideo ? 
							<GridVideo controls name="media" >
								<source src={doc.url} />
								Video unsuported,
								you can try<a href={doc.url}> this link</a>
							</GridVideo>
						:
						<GridImage src={doc.url} alt="" isLessThan415px={isLessThan415px} />
					}
				</ImgContainer>
				
				<strong><a className="name-link" href={`/search?users=${doc.firstName}`}>{`${doc.firstName} ${doc.lastName} `}</a></strong>
				<div className="hashtag-container">
					{
						doc.hashtags.map(tag => 
						<a className="link-appearance large" href={`/search?photos=${tag.replace(/#/g, "%23")}`} key={tag+Math.floor(Math.random()*1000)}>{tag} </a>)
					}
				</div>
			</PostContainer>
		)
	});

	return (
		<div>
			<SubNav>
				<ul>
					<li className={subNav === 'info' ? 'active' : null} 
					onClick={() => setSubNav('info')}>
						My Info
					</li>
					<li className={subNav === 'photos' ? 'active' : null} 
					onClick={() => {
						setSubNav('photos');
						viewPhotos();
					}}>
						My Photos
					</li>
				</ul>
				<span className="align-right" onClick={() => handleLogout()}>
					<svg  viewBox="0 0 32 32" width="18px" height="18px" fill="none" stroke="currentcolor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
				    <path d="M28 16 L8 16 M20 8 L28 16 20 24 M11 28 L3 28 3 4 11 4" />
					</svg> logout
				</span>
			</SubNav>
			{
				subNav === 'photos' ?			
					<PhotoFeedStyle numberOfPhotos={docs.length} id="photofeed" isLessThan415px={isLessThan415px}>
						{results}
						<p className={noResultsDisplay ? 'visible' : 'quick-hide'}>No photos found</p>
					</PhotoFeedStyle>
				:
					<ProfileContainer>
						{
							nameChangeDisplay ?
								<InputDiv>
									<input type="text" className="new-name"
									onChange={e => handleText(e)}
								  value={newName}/>
									<svg onClick={e => {
										if (newName === `${userData.firstName} ${userData.lastName}`) {
											setNewName('')
										} else {
											setNewName(`${userData.firstName} ${userData.lastName}`)
										}
									}} 
									viewBox="0 0 32 32" width="12px" height="12px" 
									fill="none" stroke="currentcolor" strokeLinecap="round" 
									strokeLinejoin="round" strokeWidth="3">
								    <path d="M2 30 L30 2 M30 30 L2 2" />
									</svg>
									<div>
									<Button onClick={() => {
										setNameChangeDisplay(false);
										setNewName('');
									}}>Cancel</Button>
									{
										`${userData.firstName} ${userData.lastName}` !== newName && newName ?
											<Button onClick={() => handleNameChange()}>Save Changes</Button> 
										: null
									}
									</div>
								</InputDiv>
							: 
								<div className="heading">
									{`${userData.firstName} ${userData.lastName}`}
									<span className="edit-name" onClick={() => {
										setNameChangeDisplay(true);
										setNewName(`${userData.firstName} ${userData.lastName}`);
									}}>
										<svg viewBox="0 0 32 25" width="12px" height="12px" fill="none" stroke="currentcolor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
									    <path d="M30 7 L25 2 5 22 3 29 10 27 Z M21 6 L26 11 Z M5 22 L10 27 Z" />
										</svg> 
										edit
									</span>
								</div>
						}

						<ErrorTextStyle>{errorText}</ErrorTextStyle>
						<ProfilePicture>
							<input id="file-input" type="file" onChange={fileSelectedHandler} style={{display: 'none'}} multiple/>
							<ImageHeading>
								<span onClick={() => handleChangeImage()}>
									<svg viewBox="0 0 32 32" width="16px" height="16px" fill="none" stroke="currentcolor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
								    <path d="M2 8 L 9 8 12 4 20 4 23 8 30 8 30 26 2 26 Z" />
								    <circle cx="16" cy="16" r="5" />
									</svg><span className="tag">change</span>
								</span>
								{
									images ? 
									<span style={{fontSize: "12px"}} onClick={() => handleRemoveProfilePic()}>Cancel</span>
									:
									<svg onClick={() => handleRemoveProfilePic()} viewBox="0 0 32 32" width="16px" height="16px" fill="none" stroke="currentcolor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
								    <path d="M28 6 L6 6 8 30 24 30 26 6 4 6 M16 12 L16 24 M21 12 L20 24 M11 12 L12 24 M12 6 L13 2 19 2 20 6" />
									</svg>
								}
								
							</ImageHeading>
							<img src={pictureUrl} alt=""/>
						</ProfilePicture> 
						<Button style={images ? {display: 'block'} : {display: 'none'}} onClick={() => fileUploadHandler()}>Save Changes</Button>
						<div>Your email: {userData.email}</div>
					</ProfileContainer>
			}

		</div>
	);
}

export default Profile; 

