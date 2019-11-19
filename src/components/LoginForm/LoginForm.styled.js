import styled from 'styled-components';

export const LoginFormStyle = styled.div `
  left: 0;
  right: 0;
	grid-column: content;
  margin: auto;
  overflow-y: auto;
	color: ${({theme}) => theme.primaryDark};
	background-color: transparent;
	font-size: 16px;
	text-align: center;
	display: grid;
  grid-template-columns: auto [content-start] auto [content-end] auto;
	padding: 10px 15px 15px 15px;

	form {
		margin-top: 20px;
	}
	.heading {
		font-size: 2em;
	}
  .modal-content {
    padding: 30px 50px;
		border-radius: 5px;
		grid-column: content;
		background-color: ${({theme}) => theme.primaryLight};
  }
`;