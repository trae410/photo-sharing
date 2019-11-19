import styled from 'styled-components';

export const LoadMoreButton = styled.div `
  text-align: center;
  padding-top: 30px;
  button {
    height: 30px;
  }
`;

export const PhotoFeedStyle = styled.div `
  ${
    ({ isLessThan415px }) => isLessThan415px ? 
    `grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));` 
    : `grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));`
  }
  padding-top: 20px;
  display: grid;
  grid-gap: ${({ isLessThan415px }) => isLessThan415px ? `30px`: `10px`}
  grid-auto-rows: auto;
  grid-auto-flow: dense;
`;

export const PostContainer = styled.div `

  ${
    ({ aspectRatio, isLessThan415px }) => isLessThan415px ? 
    `grid-column: span 2; grid-row: span 2;`
    : aspectRatio < 1 / 3 ? `grid-column: span 2; grid-row: span 4;` //0.333
    : aspectRatio < 1 / 2 ? `grid-column: span 2; grid-row: span 4;` //0.5
    : aspectRatio < 2 / 3 ? `grid-column: span 2; grid-row: span 4;` //0.6667
    : aspectRatio < 1 / 1 ? `grid-column: span 2; grid-row: span 2;` //1
    : aspectRatio < 3 / 2 ? `grid-column: span 2; grid-row: span 2;` //1.5
    : aspectRatio < 2 / 1 ? `grid-column: span 4; grid-row: span 2;` //2
    : aspectRatio >  2 / 1 ? `grid-column: span 4; grid-row: span 2;` //2+
    : `grid-column: span 2; grid-row: span 2;`
  }
  ${
    ({ isLessThan415px }) => isLessThan415px ?
    null  
    : `border: 2px solid gray` 
  };
  ${
    ({ numberOfPhotos, isLessThan415px }) => numberOfPhotos < 3 && !isLessThan415px ? `max-width: 250px` : null
  };
  .hashtag-container {
    display: flex;
    flex-flow: wrap;
  }
`;

export const ImageHeading = styled.div `
  display: flex;
  justify-content: space-between;
  padding: 0 10px 0 0;
  span {
    padding: 3px 0 0 0;
    cursor: pointer;
  }
`;

export const ImgContainer = styled.div `
  display: flex;
  align-items: center;    
  justify-content: center;
`;

export const GridImage = styled.img `
  width: 100%;
  object-fit: cover;
  ${
    ({ isLessThan415px }) => 
    isLessThan415px ? null
    : 
    `:active {
      left: 0;
      top: 0;
      position: absolute;
      transform: scale(0.9);
      z-index: 100;
      width: -webkit-fill-available;
      height: -webkit-fill-available;
      object-fit: contain;
    }`
  }
`;

export const GridVideo = styled.video `
  width: 100%;
  object-fit: cover;
`;

export const Info = styled.div `
  margin: 0 0 0 3px;

  .dots {
    font-size: 25px;
  }

  .text {
    padding: 16px 0 0 0;
    font-size: 12px;
    display: none;
  }
  :hover {
    .text {
      display: inline-block;
    }
    .dots {
      display: none;
    }
  }
`;


  // :hover {
  //   .text {
  //     display: inline-block;
  //   }
  //   .dots {
  //     width: auto;
  //     transform-origin: center;
  //     transform: rotate(0.75turn);
  //     padding: 0 20px 0 0px;
  //   }
  // }
