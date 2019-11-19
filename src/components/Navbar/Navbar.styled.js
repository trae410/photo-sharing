import styled from 'styled-components';

export const NavbarStyle = styled.div `
  display: flex;
  z-index: 100;
  ${
  	({ isLessThan700px, theme }) => isLessThan700px ? 
  	`position: fixed; 
	  justify-content: space-around;
	  bottom: 0;
	  left: 0;
	  width: 100%;
	  color: ${theme.primaryDark};
	  background-color: ${theme.primaryDarkBackground};` 
  : 
	  `grid-column: inner-end / main-end;
		justify-content: flex-end;
	  color: ${theme.primaryLight};
  	background-color: transparent;
  	padding-right: 8px;`
	};
`;
