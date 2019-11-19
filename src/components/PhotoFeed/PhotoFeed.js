import React, { useState, useEffect } from 'react';
import { PhotoFeedStyle, PostContainer, ImageHeading, ImgContainer, GridImage, GridVideo, Info, LoadMoreButton } from './PhotoFeed.styled';
import firebase from '../../firebase/index';
import { useMediaQuery } from 'react-responsive';
import { Button, SubNav, ErrorTextStyle } from '../../theme';
import { logUserOut } from '../../firebase/auth';


const PhotoFeed = ({ userData, setUserData, setFetching }) => {
	const [ docs, setDocs ] = useState([]);
	const [ lastVisibleDoc, setLastVisibleDoc ] = useState(false);
	const [ collection, setCollection ] = useState('');
	const [ firstRender, setFirstRender ] = useState(true);
	const [ errorText, setErrorText ] = useState('');
	const [ photoMetaId, setPhotoMetaId ] = useState('');
	const [ newCacheControl, setNewCacheControl ] = useState('');

	const collections = ['theThirteen', 'allFamily', 'extendedFamily'];
	const storageRef = ['profilePictures', 'images'];

	const isLessThan415px = useMediaQuery({ maxWidth: 415 });
	
  useEffect(() => {
		data(collection);
	 // eslint-disable-next-line react-hooks/exhaustive-deps
  },[collection]);

  if (firstRender) {
  	if (userData.isOneOfThirteen) {
  		setCollection(collections[1]);
  		setFirstRender(false);
  	} else {
  		setCollection(collections[2]);
  		setFirstRender(false);
  	}
  };

	//admin function
	const changePhotoMetadata = e => {
		e.preventDefault();
		const newMetadata = {
			cacheControl: newCacheControl
		};
		console.log(newMetadata, photoMetaId);
		firebase.storage().ref(storageRef[1]).child(photoMetaId).updateMetadata(newMetadata).then(metadata => {
			console.log(metadata)
		}).catch(err => {
			console.log(err);
			setErrorText(err.message);
		})
		setPhotoMetaId('');
	};

	const handleLogout = () => {
		logUserOut(setUserData)
	};

	const setSubnav = (name) => {
		setCollection(name);
		setLastVisibleDoc(false);
		setDocs([]);
	};

  const data = (collection) => {
  	setFetching(true);
		const limit = 5;
  	if (lastVisibleDoc === false) {
			firebase.firestore().collection(collection).orderBy('uploadedDate', 'desc').limit(limit).get().then(snapshot => {
				setLastVisibleDoc(snapshot.docs[snapshot.docs.length-1]);
				const newDocs = snapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data()
				}));
				setDocs(newDocs);
				setFetching(false);
			})
  	} else if (lastVisibleDoc) {
  		const limit = 5;
  		firebase.firestore().collection(collection).orderBy('uploadedDate', 'desc').startAfter(lastVisibleDoc).limit(limit).get().then(snapshot => {
				const newDocs = docs.concat(
					snapshot.docs.map(doc => ({
						id: doc.id,
						...doc.data()
					}))
				);
			  setDocs(newDocs); //could use the spread operator here instead of having data stored in state in photofeed as data?
			  snapshot.docs.length < limit ? setLastVisibleDoc(null) : 
			  setLastVisibleDoc(snapshot.docs[snapshot.docs.length-1]);
			  setFetching(false);
			})	
  	}
  };

	const handleRemovePic = (id, photosCollections) => {
		let windowResult = window.confirm('are you sure you want to delete this image?');
		if (windowResult) {
			//remove from storage
			return firebase.storage().ref(storageRef[1]).child(id).delete().then(() => {
			//remove from all collections
				return photosCollections.forEach(col => {
					return firebase.firestore().collection(col).doc(id).delete();
				})
			}).then(() => {
				const newDocs = docs.filter(doc => doc.id !== id);
				setDocs(newDocs);
			}).catch(err => {
				setErrorText(err.message);
				console.log(err)
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

	const posts = docs.map((doc, i) => {
		const fileType = doc.fileName.toLocaleLowerCase();
		const isVideo = fileType.includes(".mp4") || 
		fileType.includes(".avi") || fileType.includes(".wmv") || 
		fileType.includes(".mov") || fileType.includes(".qt") || 
		fileType.includes(".mkv") || fileType.includes(".avchd");
		return (
			<PostContainer key={doc.id} numberOfPhotos={docs.length} isLessThan415px={isLessThan415px} aspectRatio={doc.width / doc.height}>

				<ImageHeading>
					<strong><a className="name-link" href={`/search?users=${doc.firstName}`}>{`${doc.firstName} ${doc.lastName} `}</a></strong>
					{
						!isVideo ?
						<span onClick={e => rotateImage(e, doc, i)}>Rotate</span> :null
					}
					{ 
						userData.admin ? 
						<span onClick={() => setPhotoMetaId(doc.id)}>Edit</span> 
						: null
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
								<source src={doc.url} />
								video unsuported,
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
				{
					photoMetaId === doc.id ? 
					<div>
						<form onSubmit={e => changePhotoMetadata(e)} >
							<span style={{padding: "0 5px 0 2px"}}>cacheControl:</span><input type="text" onChange={e => setNewCacheControl(e.target.value)} value={newCacheControl} placeholder="ex: max-age=120 do not use special char" />
							<button>Submit</button>
						</form>
					</div>
					: null
				}
				
			</PostContainer>
		)
	});

	return (
		<div>
			<SubNav style={userData.isOneOfThirteen ? {justifyContent: "space-between"} : {justifyContent: "flex-end"}}>
				<ul style={userData.isOneOfThirteen ? null : {display: "none"} }>
					<li className={collection === collections[1] ? 'active' : null} 
					onClick={() => setSubnav(collections[1])}>
						All
					</li>
					<li className={collection === collections[0] ? 'active' : null} 
					onClick={() => setSubnav(collections[0])}>
						Just the 13
					</li>
					<li className={collection === collections[2] ? 'active' : null} 
					onClick={() => setSubnav(collections[2])}>
						Extended Family
					</li>
				</ul>
				<span className="align-right" onClick={() => handleLogout()}>
					<svg  viewBox="0 0 32 32" width="18px" height="18px" fill="none" stroke="currentcolor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
				    <path d="M28 16 L8 16 M20 8 L28 16 20 24 M11 28 L3 28 3 4 11 4" />
					</svg>
					<span style={userData.isOneOfThirteen ? {display: "none"} : null}> logout</span>
				</span>
			</SubNav>
			{
				errorText ? 
				<ErrorTextStyle>
					<div>{errorText}</div> 
					<div className="exit" onClick={() => {
						setErrorText('');
					}}>
						X
					</div>
				</ErrorTextStyle>
				: null
			}
			<PhotoFeedStyle id="photofeed" isLessThan415px={isLessThan415px} >
				{posts}
			</PhotoFeedStyle>

			<LoadMoreButton>
			{lastVisibleDoc ? <Button onClick={() => data(collection)}>load more photos</Button> 
			: <span>end of photos</span>}
			</LoadMoreButton>
		</div>
	)
};

export default PhotoFeed; 
