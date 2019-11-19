// theme.js '#EFFFFA' old primaryLight color
import styled, { keyframes } from 'styled-components';


export const theme = {
  primaryDark: '#0D0C1D',
  primaryLight: '#fafafa',
  primaryDarkBackground: 'lightgray',
};

export const GridContent = styled.div `
  grid-column: content-start / content-end;
  grid-row: content-start / content-end;
  padding-bottom: 15vh;
`;

//for spinner
const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const Spinner = styled.div`
  animation: ${rotate360} 1s linear infinite;
  transform: translateZ(0);
  
  border-top: 2px solid grey;
  border-right: 2px solid grey;
  border-bottom: 2px solid grey;
  border-left: 4px solid black;
  background: transparent;
  width: 10vw;
  height: 10vw;
  border-radius: 50%;
  position: fixed;
  top: 10%;
  left: 45vw;
`;

export const SubNav = styled.div `
  padding: 0 2px 10px 2px;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  li {
    display: inline-flex;
    padding: 8px 10px;
    :hover:not(.active) {
      background-color: #292929;
    }
  }
  .active {
    background-color: #4a4747;
  }
  .align-right {
    padding: 8px 10px;
    background-color: #292929;
    font-size: 14px;
    :hover {
      background-color: #4a4747;
    }
    svg {
      vertical-align: text-bottom;
    }
  }
`;

export const Button = styled.button`
	background: darkgray;
	padding: 3px 5px;
	margin: 10px 10px 10px 0px;
	border-radius: 5px;
	display: inline-block;
	font-size 16px;
`;
export const InputDiv = styled.div `
	svg {
		text-align: right;
    margin: 0 6px -2px 0;
	}
  .tooltip {
  	display: inline-block;
	  position: relative;
	  padding: 0 10px 0 10px;
    align-self: center;
    font-size: 18px;
	}
	.tooltip .tooltiptext {
	  visibility: hidden;
	  width: 120px;
	  background-color: inherit;
	  color: inherit;
	  text-align: center;
	  border-radius: 6px;
    padding: 3px 4px 6px 4px;
	  position: absolute;
	  z-index: 1;
	  top: -5px;
	  left: 105%;
	}
	.tooltip:hover .tooltiptext {
	  visibility: visible;
	}
	input {
		background-color: transparent;
		border: none;
		border-bottom: 1px solid #9e9e9e;
		border-radius: 0;
		outline: none;

		font-size: 16px;
		box-shadow: none;
		box-sizing: content-box;
	}
`;

export const FormStyle = styled.div`
  padding: 10px 15px 15px 15px;
  left: 0;
  right: 0;
  grid-column: content;
  margin: auto;
  overflow-y: auto;
  color: ${({theme}) => theme.primaryDark};
  background-color: transparent;
  font-size: 16px;
  display: grid;
  grid-template-columns: auto [content-start]  ${({ formType }) => formType === 'login' ? `auto` : `1fr`} [content-end] auto;
  text-align: ${({ formType }) => formType === 'login' ? `center` : `left`};

  form {
    margin: ${({ formType }) => formType === 'login' ? `20px 0 0 0` : `0`};
  }
  .heading {
    font-size: 2em;
  }
  .modal-content {
    padding: ${({ formType }) => formType === 'login' ? `30px 50px` : `20px`}
    border-radius: 5px;
    grid-column: content;
    background-color: ${({theme}) => theme.primaryLight};
`;

export const ThumbnailContainer = styled.div `
  display: inline-block;
  margin: 0 8px 8px 0;
  .thumbnail {
    border: 1px solid gray;
    text-align: center;
  }
  .file-remove {
    text-align: right;
    margin: 0 6px 0 0;
  }
  img {
    padding: 0 8px; 
    height: 100px;
  }
  video {
    padding: 0 8px; 
    width: 80%;
  }
  input {
    width 110px;
    padding: 3px;
    border: none;
    padding: 0 3px 3px 3px;
  }
`;

export const ErrorTextStyle = styled.p `
    display: ${({ textVisibility, formError }) => textVisibility ? `block` : `none`}
    margin: 0 10px 0 10px;
    display: flex;
    justify-content: space-between;
    color: red;
    font-size: 14px;
    ${({ formError }) => formError ? `max-width: fit-content` : null}
    .exit {
      color: ${({ theme }) => theme.primaryLight};
    }
`;