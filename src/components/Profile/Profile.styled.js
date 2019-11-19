import styled from 'styled-components';


export const ProfileContainer = styled.div `
  padding: 10px 0 0 10px;
	.heading {
		font-size: 24px;
		padding: 0 0 10px 0;
		font-family: inherit;
	}
	.edit-name {
		opacity: 0;
		padding: 2px 5px 2px 12px;
		font-size: 12px;
		vertical-align: super;
		:hover {
			opacity: 1;
		}
	}
  .new-name {
  	color: white;
  	font-size: 24px;
		font-family: inherit;
  }
`;

export const ProfilePicture = styled.div `
  display: inline-block;
  border: 1px solid gray;
  padding: 5px;
	img {
		width: 200px;
	}
	.edit {
		display: flex;
    justify-content: space-between;
	}		
	.tag {
		font-size: 10px;
    vertical-align: top;
    padding: 0 0 0 3px
	}
	svg {
		padding: 0 0 2px 0;
	}
`;