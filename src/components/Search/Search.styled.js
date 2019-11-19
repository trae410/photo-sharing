import styled from 'styled-components';

export const SearchBox = styled.div `
  padding: 10px 0 10px 10px;
  box-sizing: content-box;
  border: 0;
	font-size: 16px;
  .search {
	  font-size: 16px;
	  border-radius: 5px;
  }
  span {
    vertical-align: middle;
    padding 2px 3px;
  }
`;

export const UserResults = styled.div`
  padding: 5px 10px;
  margin: 10px;
  box-sizing: content-box;
	border: 1px solid gray;
	font-size: 16px;
  display: flex;
  .img-container {
    padding: 0 10px 0 0;
    align-self: flex-end;
  }
  img {
    max-width: 90px;
  }
`;