// global.js
import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  html, body {
    box-sizing: border-box;
    margin: 0;
    height: 100%;
    background: ${props => props.theme.primaryDark};
    color: ${({ theme }) => theme.primaryLight};
    text-rendering: optimizeLegibility;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    overflow-y: scroll;
    font-size: 16px;
  };

  .visible {
    padding: 0 0 0 10px;
    font-size: 14px;
    opacity: 1;
    transition: opacity 0.2s linear;
    max-width: fit-content;
  }
  .hidden {
    padding: 0 0 0 10px;
    font-size: 14px;
    opacity 0;
    transition: opacity 5s linear;
    max-width: fit-content;
  }
  .quick-hide {
    display: none;
  }
  .link-appearance {
    text-decoration: underline;
    color: inherit;
  }
  .link-appearance.small {
    font-size: 14px;
  }
  .link-appearance.large {
    font-size: 16px;
    margin: 0 5px 0 0;
  }
  link-appearance.blue {
    color: blue;
  }
  .name-link {
    font-size 20px;
    text-decoration: none;
    color: inherit;
  }

  #root {
    display: grid;
    grid-template-columns: 
      [main-start] minmax(0,1fr) 
        [content-start] minmax(0,200px)
          [middle-start] auto 
            [inner-start] 2fr 
            [inner-end] auto 
          [middle-end] minmax(0,200px)
        [content-end] minmax(0,1fr) 
      [main-end];
    grid-template-rows: 
      [main-start] 60px 
        [content-start] auto 
        [content-end] auto 
      [main-end]; 
    align-items: center;
  };

`;
