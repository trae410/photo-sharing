import React from 'react';
import styled from 'styled-components';
// import { Spacer } from '../formatting';
import { useMediaQuery } from 'react-responsive';


export const HeadingStyle = styled.div `
	div {
	  background-image: linear-gradient(to right, gray, ${({ theme }) => theme.primaryDark});
		padding: 4px 0 4px 8px;
		font-size: 30px;
	  font-style: italic;
		text-transform: uppercase;
	}
  color: ${({ theme }) => theme.primaryLight};
  background-color: ${({ theme }) => theme.primaryDark};
  ${({ isLessThan700px }) => isLessThan700px ? `
		grid-column: main-start / main-end;
		position: fixed;
		width: 100%;
  ` : `
		grid-column: main-start / inner-end;

  `};
`;

const Heading = () => {
  const isLessThan700px = useMediaQuery({ maxWidth: 700 });
	return (
		<HeadingStyle isLessThan700px={isLessThan700px}>
			<div onClick={() => window.location.reload(true)}>
				Photo sharing
			</div>
		</HeadingStyle>
	);
}

export default Heading; 
