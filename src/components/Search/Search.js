import React, { useState, useEffect } from 'react';
import firebase from '../../firebase/index';
import { useMediaQuery } from 'react-responsive';
import { PhotoFeedStyle, PostContainer, ImgContainer, ImageHeading, GridImage, GridVideo, Info } from '../PhotoFeed/PhotoFeed.styled';
import { useLocation } from "react-router-dom";
import { SearchBox, UserResults } from './Search.styled';
import { SubNav, ErrorTextStyle } from '../../theme';
import { logUserOut } from '../../firebase/auth';


function useQuery() {
  return new URLSearchParams(useLocation().search);
};

const Search = ({ userData, setUserData, setFetching }) => {
	const [ docs, setDocs ] = useState([]);
	const [ searchInput, setSearchInput ] = useState('');
	const [ collection, setCollection ] = useState('');
	const [ firstRender, setFirstRender ] = useState(true);
	const [ subNav, setSubNav ] = useState('photos');
	const [ successTextClass, setSuccessTextClass ] = useState('hidden');
	const [ noResultsDisplay, setNoResultsDisplay ] = useState(false);
	const [ errorText, setErrorText ] = useState('');
	const [ successText, setSuccessText ] = useState('');
	const [ photoMetaId, setPhotoMetaId ] = useState('');
	const [ newCacheControl, setNewCacheControl ] = useState('');

	const collections = ['theThirteen', 'allFamily', 'extendedFamily'];
	const storageRef = ['profilePictures', 'images'];

	const isLessThan415px = useMediaQuery({ maxWidth: 415 });
	let query = useQuery();

	useEffect((/*did update*/) => {
	  let photos = query.get("photos");
	  let users = query.get("users");
	  if (photos) {
	  	setSearchInput(photos);
			window.history.pushState({}, document.title, "/search");
			getResults(photos)
	  };
	  if (users) {
	  	setSearchInput(users);
			window.history.pushState({}, document.title, "/search");
	  	getResults(users)
	  }
	 // eslint-disable-next-line react-hooks/exhaustive-deps
	},[]);

	//set collection
	if (firstRender) {
		const hasUrlParams = query.has("photos") || query.has("users");

		if (hasUrlParams) {
		  let photos = query.get("photos");
  	  if (photos) {
  	  	if (userData.isOneOfThirteen) {
					setCollection(collections[1]);
				} else {
					setCollection(collections[2]);
				};
		  } else { //must be users
		  	setCollection('users');
		  	setSubNav('users');
		  };

		} else { //no urlParams
			if (userData.isOneOfThirteen) {
				setCollection(collections[1]);
			} else {
				setCollection(collections[2]);
			}
		};

		setFirstRender(false);
	};

	//admin function
	const changePhotoMetadata = e => {
		e.preventDefault();
		const newMetadata = {
			cacheControl: newCacheControl
		};
		console.log(newMetadata, photoMetaId);
		firebase.storage().ref(storageRef[0]).child(photoMetaId).updateMetadata(newMetadata).then(metadata => {
			console.log(metadata)
		}).catch(err => {
			console.log(err);
			setErrorText(err.message);
		})
		setPhotoMetaId('');
	};

	const handleUsersSelected = () => {
		setCollection('users');
		setDocs([]);
		setSearchInput('');
		setNoResultsDisplay(false);
	};

	const handlePhotosSelected = () => {
		if (userData.isOneOfThirteen === true) {
			setCollection(collections[1]);
		} else {
			setCollection(collections[2]);
		};
		setDocs([]);
		setSearchInput('');
		setNoResultsDisplay(false);
	};

	const clientAddOrRemoveAdmin = (userEmail, addAdmin, i) => {
		const windowResult = window.confirm(`are you sure you want to change [${userEmail}]'s account info to admin: [${addAdmin}]?`);
		if (windowResult) {
			setFetching(true);
			const add = firebase.functions().httpsCallable('addOrRemoveAdmin');
			return add({ email: userEmail, value: addAdmin}).then(result => {
				console.log(result, result.data.message, 'function didnt error:', result.data.value);
				if (result.data.value) {
					const DBAdd = firebase.functions().httpsCallable('DBAddOrRemoveAdmin');
					return DBAdd({ email: userEmail, value: addAdmin }).then(result => {
						setSuccessText(`Success changed ${userEmail}'s account info to admin: ${addAdmin}`)
						setSuccessTextClass("visible");
						setTimeout(() => setSuccessTextClass("hidden"), 500);
						const newDocs = docs;
						newDocs[i].isAdmin = addAdmin;
						setDocs(newDocs);
						setFetching(false);
						console.log(result)
					})
				} else {
					console.log('error: addOrRemoveAdmin claims responded with', result.data.value );
					return setFetching(false);
				}
			}).catch(err => {
				return (
					err,
					console.log(err),
					setErrorText(`error: ${err.message}`),
					setFetching(false)
				);
			})
		} else {
			return false
		}
	};

	const clientAddOrRemoveOneOfThirteen = (userEmail, addToThirteen, i) => {
		let windowResult = window.confirm(`are you sure you want to change [${userEmail}]'s 'one of the 13 status' to: [${addToThirteen}]?`);
		if (windowResult) {
			setFetching(true);
			const add = firebase.functions().httpsCallable('addOrRemoveOneOfThirteen');
			return add({ email: userEmail, value: addToThirteen}).then(result => {
				console.log(result, result.data.message, 'function didnt error:', result.data.value);
				if (result.data.value) {
					const DBAdd = firebase.functions().httpsCallable('DBAddOrRemoveOneOfThirteen');
					return DBAdd({ email: userEmail, value: addToThirteen}).then(DBresult => {
						setSuccessText(`Success changed ${userEmail}'s 'one of the 13 status' to: ${addToThirteen}`)
						setSuccessTextClass("visible");
						setTimeout(() => setSuccessTextClass("hidden"), 500);
						const newDocs = docs;
						newDocs[i].isOneOfThirteen = addToThirteen;
						setDocs(newDocs);
						setFetching(false)
					})
				} else {
					console.log('error: addOrRemoveOneOfThirteen claims responded with', result.data.value );
					return setFetching(false);
				}
			}).catch(err => {
				return (
					err,
					console.log(err),
					setErrorText(`error: ${err.message}`),
					setFetching(false)
				);
			})
		} else {
			return false
		}
	};

	const deleteMultiplePhotos = docs => {
		docs.forEach(doc => {
			//delete from all collections
			doc.data().collections.forEach(col => {
				return firebase.firestore().collection(col).doc(doc.id).delete()
			})
			// delete from storage
			return firebase.storage().ref(storageRef[1]).child(doc.id).delete()
		})
	};

	const clientDeleteUser = (userEmail, userUid) => {
		const windowResult = window.confirm(`are you sure you want to delete ${userData.email === userEmail ? `your account (${userEmail})` : `user: ${userEmail}?`}`);
		if (windowResult) {
			setFetching(true);
			const deleteUser = firebase.functions().httpsCallable('deleteUser');

			// get photos and delete them
			return firebase.firestore().collection(collections[1]).where('uploader', '==', userUid).get().then(snapshot => {
				return deleteMultiplePhotos(snapshot.docs)

			}).then(() => {
				// remove user
				return deleteUser({email: userEmail, uid: userUid})
			}).then(result => {
				const newDocs = docs.filter(user => user.email !== userEmail);
				setTimeout(() => setSuccessTextClass("hidden"), 1000);
			
				if (result.data.value === true) {
					// check if user is deleting their own account
					if (userData.uid === userUid) {
						// setTimeout(() => setSuccessTextClass("hidden"), 500);
						const successFunctionsOne = [
							setSuccessTextClass("visible"),
							setSuccessText(`sorry to see you go ${userEmail}! logging you out now...`),
							setFetching(false),
							setTimeout(() => logUserOut(setUserData), 5000)
						];
						return successFunctionsOne;
					} else {
						// remove user from UI
						// setTimeout(() => setSuccessTextClass("hidden"), 500);
						const successFunctionsTwo = [
							setSuccessTextClass("visible"),
							setSuccessText(`Success! deleted ${userEmail}'s account`),
							setDocs(newDocs),
							setFetching(false)
						];
						// setSuccessText(`Success! deleted ${userEmail}'s account`);
						return successFunctionsTwo;
					}

				} else { 
					setErrorText(result.data.message);
					setFetching(false)
				}
			}).catch(err => {
				console.log(err)
			})
		} else {
			return false
		}
	};

  const getResults = (text) => {
		setNoResultsDisplay(false);
		setErrorText('');
		setFetching(true);
		firebase.firestore().collection(collection).where("searchData", "array-contains", text).orderBy('uploadedDate', 'desc').get().then(snapshot => {
			const newDocs = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data()
			}));
			setDocs(newDocs);
			setFetching(false);
			if (!newDocs.length) {
				setFetching(false);
				setNoResultsDisplay(true);
			};
		})
	};

	const handleRemovePic = (id, photosCollections) => {
		const windowResult = window.confirm('are you sure you want to delete this image?');
		if (windowResult) {
			setFetching(true);
			//remove from storage
			return firebase.storage().ref(storageRef[1]).child(id).delete().then(() => {
			//remove from all collections
				return photosCollections.forEach(col => {
					return firebase.firestore().collection(col).doc(id).delete();
				})
			}).then(() => {
				const newDocs = docs.filter(doc => doc.id !== id);
				setDocs(newDocs);
				setFetching(false);
			}).catch(err => {
				setErrorText(err.message);
				console.log(err);
			})
			
		} else {
			return false
		}
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

	const searchUsers = docs.map((doc, i) => {

		if (collection === 'users' ) {
			return (
				<div key={doc.email}>
					{ 
						userData.admin ? 
							<div style={{textAlign: "right", padding: "10px 10px 0 0"}} onClick={() => setPhotoMetaId(doc.uid)}>edit</div> 
						: null
					}
					<UserResults>
						
						<div className="img-container">
							<img src={doc.profilePicture || "/assets/blank-profile-picture.png"} alt=""/>
						</div>
						<div>
							<strong><a className="name-link" href={`/search?users=${doc.firstName}`}>{`${doc.firstName} ${doc.lastName} `}</a></strong>
							{ doc.isOneOfThirteen ? <div>One of The 13</div> : null }
							{ doc.admin ? <div>Admin</div> : null }
							
							{
								userData.isOneOfThirteen && !doc.isOneOfThirteen ? 
								<div>
									<div className="link-appearance small" onClick={() => clientAddOrRemoveOneOfThirteen(doc.email, true, i)}> 
										{`add ${doc.firstName} as one of the thirteen`}
									</div> 
									
								</div>
								: null
							}
							{
								userData.admin && doc.isOneOfThirteen ? 
								<div>
									<div className="link-appearance small" onClick={() => clientAddOrRemoveOneOfThirteen(doc.email, false, i)}> 
										remove from 13
									</div> 
								</div>
								: null
							}
							{
								doc.admin && userData.admin ? 
								<div>
									<div className="link-appearance small" onClick={() => clientAddOrRemoveAdmin(doc.email, false, i)}> 
										remove admin
									</div> 
								</div>
								: null
							}
							{
								!doc.admin && userData.admin ? 
								<div>
									<div className="link-appearance small" onClick={() => clientAddOrRemoveAdmin(doc.email, true, i)}> 
										add as admin
									</div> 
								</div>
								: null
							}
							{
								userData.admin || doc.uid === userData.uid ? 
								<div>
									<div className="link-appearance small" onClick={() => clientDeleteUser(doc.email, doc.uid)}> 
										{doc.uid === userData.uid? 'delete my account' : 'delete user'}
									</div> 
								</div>
								: null
							}
							<div>
								<a className="link-appearance small" href={`/search?photos=${doc.uid.slice(0, 10)}`}>View {doc.firstName}'s photos</a>
							</div>
						</div>
					</UserResults>
					{
						photoMetaId === doc.uid ? 
						<div>
							<form onSubmit={e => changePhotoMetadata(e)} >
								<span style={{padding: "0 5px 0 10px"}}>cacheControl:</span><input type="text" onChange={e => setNewCacheControl(e.target.value)} value={newCacheControl} placeholder="ex: max-age=120 do not use special char" />
								<button>Submit</button>
							</form>
						</div>
						: null
						}
				</div>
			)
		} else {
			return null
		};
	});

	const searchPhotos = docs.map((doc, i) => {

		if (collection !== 'users' ) {
			const fileType = doc.fileName.toLocaleLowerCase();
			const isVideo = fileType.includes(".mp4") || 
			fileType.includes(".avi") || fileType.includes(".wmv") || 
			fileType.includes(".mov") || fileType.includes(".qt") || 
			fileType.includes(".mkv") || fileType.includes(".avchd");
				return (
				<PostContainer key={doc.id} numberOfPhotos={docs.length} aspectRatio={doc.width / doc.height} isLessThan415px={isLessThan415px} >
				
					<ImageHeading>
						<strong><a className="name-link" href={`/search?users=${doc.firstName}`}>{`${doc.firstName} ${doc.lastName} `}</a></strong>
						{
							!isVideo ?
							<span onClick={e => rotateImage(e, doc, i)}>Rotate</span> : null
						}
						{
							doc.uploader === userData.uid || userData.admin ? 
								<span onClick={() => handleRemovePic(doc.id, doc.collections)}>
									<svg viewBox="0 0 32 32" width="16px" height="16px" fill="none" stroke="currentcolor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
								    <path d="M28 6 L6 6 8 30 24 29 26 6 4 6 M16 12 L16 24 M21 12 L20 24 M11 12 L12 24 M12 6 L13 2 19 2 20 6" />
									</svg>delete
								</span>
							: null
						}
					</ImageHeading>

					<ImgContainer>
						{
							isVideo ? 
								<GridVideo controls name="media" >
									<source src={doc.url} type="video/mp4" />
									mp4 video unsuported,
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
							<a className="link-appearance large" href={`/search?photos=${tag.replace(/#/g, "%23")}`} key={tag+Math.floor(Math.random()*1000)}>{tag}</a>)
						}
					</div>
					{
						userData.isOneOfThirteen && doc.collections.includes(collections[0]) ? 
						<Info>
							<span className='text'>Photo only visible to the 13</span>
							<div className='dots'>...</div>
						</Info>
						: null
					}

				</PostContainer>
			)
		} else {
			return null
		};
	});

	//component non conditional renders
	return (
		<div>
			<SubNav>
				<ul>
					<li className={subNav === 'photos' ? 'active' : null} 
					onClick={() => {
						setSubNav('photos');
						handlePhotosSelected();
					}}>
						Search Photos
					</li>
					<li className={subNav === 'users' ? 'active' : null} 
					onClick={() => {
						setSubNav('users');
						handleUsersSelected();
					}}>
						Search Users
					</li>
				</ul>
			</SubNav>

			<SearchBox>

				<input className="search" type='search' placeholder='search' value={searchInput} 
				onKeyPress={e => e.key === 'Enter' ? getResults(searchInput) : null} 
				onChange={e => setSearchInput(e.target.value)}/>
				<span onClick={e => getResults(searchInput)}>
					<svg viewBox="0 0 32 32" width="1.2rem" 
					height="1.2rem" fill="none" stroke="currentcolor" 
					strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
				    <circle cx="14" cy="14" r="12" />
				    <path d="M23 23 L30 30" />
					</svg>
				</span>
			</SearchBox>

			<ErrorTextStyle>{errorText}</ErrorTextStyle>
			<p className={noResultsDisplay ? 'visible' : 'quick-hide'}>No results found</p>
			{
				collection === 'users' ? 
					<div>
						<div className={successTextClass}>{successText}</div>
						<div>{searchUsers}</div>
					</div>
				: 
					<PhotoFeedStyle id="photofeed" isLessThan415px={isLessThan415px}>
						{searchPhotos}
					</PhotoFeedStyle>
			}
		</div>
	)
};

export default Search; 
