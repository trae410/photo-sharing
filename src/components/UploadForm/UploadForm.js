import React, { useState, useEffect } from 'react';
import { Button, InputDiv, ThumbnailContainer, FormStyle, ErrorTextStyle } from '../../theme.js'
import firebase from '../../firebase/index';
import uuid from 'uuid/v1';


const UploadForm = ({ userData }) => {
	const [ images, setImages ] = useState ([]);
	const [ uploadProgress, setUploadProgress ] = useState({percent: 0, display: 'none'});
	const [ postingToTheThirteen, setPostingToTheThirteen ] = useState(false);
	const [ postingToExtendedFamily, setPostingToExtendedFamily ] = useState(false);
	const [ errorText, setErrorText ] = useState('');
	const [ successTextClass, setSuccessTextClass ] = useState('hidden');
	const [ preventUpload, setPreventUpload ] = useState(false);
	const [ totalUploadSize, setTotalUploadSize ] = useState(0);

	const collections = ['theThirteen', 'allFamily', 'extendedFamily'];
	const storageRef = ['profilePictures', 'images'];

	useEffect((/*did update*/) => {
		if (userData.isOneOfThirteen) {
			setPostingToTheThirteen(true);
		};
		// query users photos to see how many photos theyve uploaded today
		const today = new Date();
		let yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1);
		yesterday = yesterday.toJSON();

		firebase.firestore().collection(collections[1]).where("uploader", "==", userData.uid).get().then(snapshot => {
			const todaysDocs = snapshot.docs.filter(doc => {
				return doc.id > yesterday;
				}
			);
			if (todaysDocs.length > 15 ) {
				setPreventUpload(true)
			}
		});
		setPostingToExtendedFamily(true);
		// eslint-disable-next-line
	},[]);

	const findVideoDimensions = (e, i) => {
		const width = e.currentTarget.videoWidth;
		const height = e.currentTarget.videoHeight;
		console.log(width, height);
		const newImages = images;
		images[i].width = width;
		images[i].height = height;
		setImages(newImages);
	};

	const handleHashtags = (text, id, type) => {
		const newImages = images.map(img => {
			// var re = /\s|#(?=#)/;
			if (img.tempId === id) {
				type === "clear" ? img.hashtags = "" : img.hashtags = text;
			};
			return img
		});
		setImages(newImages);
	};

	const handleKeyPress = (e, id) => {
		const text = e.target.value + " #";
		const char = e.charCode;
		if (char === 32 || char === 35) {
			e.preventDefault();
			handleHashtags(text, id);
		}
	};

	const handleChooseFile = e => {
		if (preventUpload) {
			return setErrorText('Sorry theres a maximum upload of 15 images per day')
		};

		if (totalUploadSize >= 1700000) {
			setErrorText('Sorry, only 1.7MB or less allowed per upload. your upload is ' + (totalUploadSize / 1000000) + 'MB');
		};

		const fileInput = document.getElementById('file-input');
		e.preventDefault();
		fileInput.click();
	};

	const fileSelectedHandler = e => {
		

		const fileList = e.target.files;				

		let i, j;
		for (i = 0, j = totalUploadSize; i < fileList.length; i++) {
			const file = fileList[i];

			const fileType = file.name.toLocaleLowerCase();
			const isVideo = fileType.includes(".mp4") || 
			fileType.includes(".avi") || fileType.includes(".wmv") || 
			fileType.includes(".mov") || fileType.includes(".qt") || 
			fileType.includes(".mkv") || fileType.includes(".avchd");

			if (!e.target.files[0]) {return false};
			setErrorText("");

			if (i > 8) {
				return setErrorText('Sorry theres a maximum upload of 10 images at a time');
			};

			if (j + file.size < 1700000) {
					let fileReader = new FileReader();
			    fileReader.onload = () => {
			    	if (isVideo) {
			      	setImages(images => ([...images, {
			      		src: fileReader.result, 
			      		firstName: userData.firstName,
			      		lastName: userData.lastName,
			      		width: "",
				      	height: "",
				      	tempId: uuid(),
				      	hashtags: "",
				      	url: "",
				      	uploadedDate: new Date().toJSON(),
				      	file: file,
				      }]));
							
						} else {
				      const image = new Image();
				      image.src = fileReader.result;
				      image.onload = () => {
				      	setImages(images => ([...images, {
				      		src: image.src, 
				      		firstName: userData.firstName,
				      		lastName: userData.lastName,
				      		width: image.width, 
					      	height: image.height,
					      	tempId: uuid(),
					      	hashtags: "",
					      	url: "",
					      	// uploadedDate: new Date().toLocaleString().replace(/\s+|\,\s/g, "-"),
					      	uploadedDate: new Date().toJSON(),
					      	file: file
					      }]));
				      };					
						}
			    };
			    fileReader.readAsDataURL(file);			
			    j += file.size;

			} else {
				return setErrorText('Sorry, only 1.7MB or less allowed per upload. your upload is ' + ((totalUploadSize + file.size) / 1000000) + 'MB');
			}		
			setTotalUploadSize(j);
		};
	};

	const fileRemovedHandler = id => {
		const newImages = images.filter(img => {
			if (img.tempId === id) {
				if (totalUploadSize - img.file.size > 1700000) {
					setErrorText('Sorry, only 1.7MB or less allowed per upload')
				};
				console.log(totalUploadSize, img.file.size)
				let newTotalUploadSize = totalUploadSize;
				newTotalUploadSize -= img.file.size;
				setTotalUploadSize(newTotalUploadSize);				
			};
			
			return img.tempId !== id
		});

		document.getElementById("file-input").value = null;
		setImages(newImages);
		setErrorText('');
	};

	const fileUploadHandler = e => {		
		e.preventDefault();
		if (images.length) {	

			let postingToCollections = [];
			if (postingToExtendedFamily || postingToTheThirteen) {
				postingToCollections.push(collections[1]);
			};
			if (postingToExtendedFamily) {
				postingToCollections.push(collections[2]);
			} else if (postingToTheThirteen) {
				postingToCollections.push(collections[0]);
			} else {
				return false
			};
			if (totalUploadSize > 1700000) {

				return setErrorText('Sorry, only 1.7MB or less allowed per upload. your upload is ' + (totalUploadSize / 1000000) + 'MB');
			};

			setUploadProgress(uploadProgress => ({...uploadProgress, display: 'block'})); //change this to simply overwrite?
			// keep photos in cache for one month and allow cdn to cache and if max age passed, async revalidate within one day
			const metadata = {
			  cacheControl: 'public, max-age=2592000, stale-while-revalidate=86400'
			};

			let i;
			for (i = 0; i < images.length; i++) {
				let img = images[i];
				let uploadTask = firebase.storage().ref(`${storageRef[1]}/${img.uploadedDate}`).put(img.file, metadata);
				uploadTask.on('state_changed',  // on('evt_listener', progress(), error(), complete()
				(snapshot) => {
					//progress function
					let progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
					setUploadProgress(uploadProgress => ({...uploadProgress, percent: progress}));
				}, (err) => {
					//error function
					console.log(err);
					setErrorText("err.message");
					setUploadProgress(uploadProgress => ({...uploadProgress, percent: 0, display: 'none'}));
				}, () => {
					const re = /\s+|\./;
					//complete function
					firebase.storage().ref(storageRef[1]).child(img.uploadedDate).getDownloadURL().then(url => {
						setUploadProgress(uploadProgress => ({...uploadProgress, percent: 0, display: 'none'}));

						//add to collections.....
						postingToCollections.forEach(col => {
							firebase.firestore().collection(col).doc(img.uploadedDate).set({ 
								firstName: img.firstName, //from state
								lastName: img.lastName,
								fileName: img.file.name, 
								hashtags: img.hashtags.split(re),
								width: img.width,
								height: img.height,
								url: url, //from getDownloadUrl
								uploadedDate: img.uploadedDate,
								uploader: userData.uid,
								collections: postingToCollections,
								searchData: `${img.hashtags} ${img.file.name} ${img.firstName} ${img.lastName} ${userData.uid.slice(0, 10)}`.split(re)
							});
						});
						setImages([]);
						setSuccessTextClass("visible");
						setTimeout(() => setSuccessTextClass("hidden"), 250)
					}).catch(err => {
						console.log(err);
						setErrorText(err.message)
					})
				}) //end of upload task 
			} //end of for loop
		} else {
			return null
		}
	};

	return (
		<FormStyle>
		<div className="modal-content">
			<span className="heading">Add Photo</span>
			<ErrorTextStyle style={{margin: 0}}>{errorText}</ErrorTextStyle>
			<form onSubmit={e => fileUploadHandler(e)}>
				<progress style={{display: uploadProgress.display}} value={uploadProgress.percent} max="100" />
				<input id="file-input" type="file" onChange={fileSelectedHandler} style={{display: 'none'}} multiple/>
				<div style={{padding: 0}} className={successTextClass}>Upload successfull!</div>
				<div>
					<Button onClick={e => handleChooseFile(e)} >Choose Photo
					</Button>
				</div>
				{
					userData.isOneOfThirteen ? 
						<div>
							<div>Posting as: {`${userData.firstName} ${userData.lastName}`} to </div> 
							<div>
								<label>
									<input type="checkbox" onChange={e => setPostingToTheThirteen(!postingToTheThirteen)} 
									checked={postingToTheThirteen}/>The Thirteen
								</label>
							</div>
							<div>
								<label>
									<input type="checkbox" onChange={e => setPostingToExtendedFamily(!postingToExtendedFamily)}
									checked={postingToExtendedFamily}/>The Extended Family
								</label>
							</div>
						</div>
					: <p>Posting to the Family as: {`${userData.firstName} ${userData.lastName}`}</p> 
				}
				
				<div style={{minHeight: "200px", margin: "20px 0 0 0"}}>
					{ images[0] ? images.map((img, i) => {
						const fileType = img.file.name.toLocaleLowerCase();
						const isVideo = fileType.includes(".mp4") || 
						fileType.includes(".avi") || fileType.includes(".wmv") || 
						fileType.includes(".mov") || fileType.includes(".qt") || 
						fileType.includes(".mkv") || fileType.includes(".avchd");

						return (
							<ThumbnailContainer key={img.tempId}> 
								<div className="thumbnail">
									<div className="file-remove">
										<svg onClick={() => fileRemovedHandler(img.tempId)} 
										viewBox="0 0 32 32" width="12px" height="12px" 
										fill="none" stroke="currentcolor" strokeLinecap="round" 
										strokeLinejoin="round" strokeWidth="3">
									    <path d="M2 30 L30 2 M30 30 L2 2" />
										</svg>
									</div>
									{
										isVideo ?
										<video controls id={img.id} onLoadedMetadata={e => findVideoDimensions(e, i)}>
											<source src={img.src} type="video/mp4" />
											couldn't load video in this frame
										</video>
										: 
										<img src={img.src} alt="" />
									}
									<InputDiv>
										<input type="text" onClick={() => img.hashtags[0] ? null : handleHashtags('#', img.tempId)} onKeyPress={e => handleKeyPress(e, img.tempId)} 
										onChange={e => handleHashtags(e.target.value, img.tempId)} value={img.hashtags} placeholder="add hashtags"/>
										<svg onClick={e => handleHashtags(e.target.value, img.tempId, "clear")} 
										viewBox="0 0 32 32" width="12px" height="12px" 
										fill="none" stroke="currentcolor" strokeLinecap="round" 
										strokeLinejoin="round" strokeWidth="3">
									    <path d="M2 30 L30 2 M30 30 L2 2" />
										</svg>
									</InputDiv>
								</div>
									
							</ThumbnailContainer>
						)
						}) : 
					<div>
						<p>Selected Images will appear below</p>
						<div style={{border: "2px solid gray", minHeight: "200px"}} />
					</div>
					}
				</div> 
				{
					preventUpload ? null : 
						<Button>Upload</Button>
				}
				<span className={successTextClass}>Upload successfull!</span>
				<ErrorTextStyle style={{margin: 0}}>{errorText}</ErrorTextStyle>
			</form>
		</div>
		</FormStyle>
	);
}

export default UploadForm; 

