import React    from "react"
import { pure } from "recompose"
import styled   from "styled-components";

const NavigationButtonWrapper = styled.div`
  width: 50%;
`;

const NavigationButtonWrapperRight = styled.div`
  width: 50%;
  text-align: right;
`;

const NavigationButton = styled.span`
  color: ${props => props.aboveImage ? "#fff" : "#888"};
  cursor: pointer;
  padding: 4px 7px;
  border-radius: 2px;
  text-shadow: ${props => props.aboveImage ? "1px 1px 5px rgba(0,0,0,0.5)" : "none"};

  :hover {
    color: #000;
    background-color: #f5f5f5;
    text-shadow: none;
    box-shadow: 1px 1px 2px rgba(0,0,0,0.4);
  }
`;

const NavButton = ({ keyName, buttonRight, icon, text, onClick, aboveImage }) => {
  const button = buttonRight ? 
    <NavigationButtonWrapperRight>
      <NavigationButton
        key = { keyName }
        onClick = { onClick }
        aboveImage = { aboveImage }>
        <i className= { icon }></i>
        { " " + text }
      </NavigationButton>
    </NavigationButtonWrapperRight>
    : 
    <NavigationButtonWrapper>
      <NavigationButton
        key = { keyName }
        onClick = { onClick }
        aboveImage = { aboveImage }>
        <i className= { icon }></i>
        { " " + text }
      </NavigationButton>
    </NavigationButtonWrapper>;

  return(button);
}

module.exports = pure(NavButton)
