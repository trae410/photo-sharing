import React from 'react';
import styled from 'styled-components';

export const StyledIcon = styled.li`
  text-align: center;
  padding: 10px;
  text-decoration: none;
  background-color: transparent;
  border: none;
  font-size: 14px;
  ${({isLessThan700px}) => isLessThan700px ? null : 'float: left;'}
  list-style-type: none;
  color: ${({ isLessThan700px, theme }) => isLessThan700px ? theme.primaryDark : theme.primaryLight}
`;

const Icon = ({ isLessThan700px, iconProps }) => {

  return (
    <StyledIcon isLessThan700px={isLessThan700px}>
        <svg id={iconProps.link} viewBox="0 0 32 32" 
        width={
          isLessThan700px ? '1.8em' : '20px'} height={isLessThan700px ? '1.8em' : '20px'} 
          fill={iconProps.fill} 
        stroke="currentcolor" strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={iconProps.strokeWidth}>
        {iconProps.additional}
          <path d={iconProps.d} />
        </svg>{isLessThan700px ? null : <div>{iconProps.name}</div>}
    </StyledIcon>
  )
}

export default Icon; 