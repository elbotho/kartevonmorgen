// Copyright (c) 2015 - 2017 Markus Kohlhase <mail@markus-kohlhase.de>
import "./styling/Stylesheets"

import React, { Component } from "react"
import T                    from "prop-types"
import V                    from "../constants/PanelView"
import C                    from "../constants/Categories"
import Actions              from "../Actions"
// import CityList             from "./CityList"
import Info                 from "./Info"
import Modal                from "./Modal"
import Map                  from "./Map"
import Sidebar              from "./Sidebar"
import SearchBar            from "./SearchBar"
import LandingPage          from "./LandingPage"
import { EDIT, RATING }     from "../constants/Form"
import URLs                 from "../constants/URLs"
import { pure }             from "recompose"
import { initialize }       from "redux-form"
import mapConst             from "../constants/Map"
import { translate }        from "react-i18next"
import NotificationsSystem  from "reapop";
import theme                from "reapop-theme-wybo";

import styled,{ keyframes } from "styled-components";
import STYLE                from "./styling/Variables"

class Main extends Component {

  render(){
    const { dispatch, search, view, server, map, form, url, user, timedActions, t } = this.props;
    const { addresses } = search;
    const { entries, ratings } = server;
    const { explainRatingContext, selectedContext } = view;

    if (url.hash !== window.location.hash) {
      console.log("URL CHANGE FROM APP: " + window.location.hash + " --> " + url.hash);
      window.history.pushState(null, null, window.location.pathname + url.hash);
    }
    
    const resultEntries = search.result.filter(e => entries[e.id]).map(e => entries[e.id]);

    const rightPanelIsOpen = false;   // rightpanel moved into landingpage, TODO
    
    // TODO:
    // const mapCenter = (e && e.lat && e.lng && search.current) 
    //   ? {
    //       lat: entries[search.current].lat,
    //       lng: entries[search.current].lng
    //     } 
    //   : map.center;
    const mapCenter = map.center;

    const loggedIn = user.username ? true : false;
    
    return (
      <StyledApp className="app">
        <MainWrapper className="main">
          <NotificationsSystem theme={theme}/>
          { 
            view.menu ? 
              <LandingPage
                onMenuItemClick={ id => {
                  switch (id) {
                    case 'map':
                      return dispatch(Actions.toggleLandingPage());
                    case 'new':
                      dispatch(Actions.toggleLandingPage());
                      return dispatch(Actions.showNewEntry());
                    case 'landing':
                      dispatch(Actions.showInfo(null));
                      return dispatch(Actions.toggleLandingPage());
                    case V.LOGOUT:
                      dispatch(Actions.logout());
                      return dispatch(Actions.showInfo(V.LOGOUT));
                    case V.SUBSCRIBE_TO_BBOX:
                      return dispatch(Actions.showSubscribeToBbox());
                    default:
                      return dispatch(Actions.showInfo(id));
                  }
                }}
                onChange={ city => {
                  dispatch(Actions.setCitySearchText(city));
                  if (city && city.length > 3) {
                    return dispatch(Actions.searchCity());
                  }
                }}
                content={ view.right }
                searchText={ search.city }
                searchError={ search.error }
                cities={ search.cities }
                onEscape={ () => { return dispatch(Actions.setCitySearchText('')); }}
                onSelection={ city => {
                  if (city) {
                    dispatch(Actions.setCenter({
                      lat: city.lat,
                      lng: city.lon
                    }));
                    dispatch(Actions.setZoom(mapConst.CITY_DEFAULT_ZOOM));
                    dispatch(Actions.toggleLandingPage());
                    dispatch(Actions.setSearchText(''));
                    return dispatch(Actions.finishCitySearch());
                  }
                }}
                onLogin={ data => {
                  var password, username;
                  username = data.username, password = data.password;
                  return dispatch(Actions.login(username, password));
                }}
                onRegister={ data => {
                  var email, password, username;
                  username = data.username, password = data.password, email = data.email;
                  return dispatch(Actions.register(username, password, email));
                }}
                loggedIn={ loggedIn}
                user={ user}
                onDeleteAccount={ () => {
                  return dispatch(Actions.deleteAccount());
                }}
              />
              : ""
          }
          { 
            view.modal != null ? <Modal view={view} dispatch={dispatch} /> : ""
          }

          <LeftPanel className={"left " + (view.showLeftPanel && !view.menu ? 'opened' : 'closed')}>
            <div className={"search " + ((view.left === V.RESULT) ? 'open' : 'closed')}>
              <SearchBar
                searchText={search.text}
                categories={search.categories}
                type="integrated"
                disabled={view.left === V.EDIT || view.left === V.NEW}
                toggleCat={ c => {
                  if (c === C.IDS.EVENT) {
                    return dispatch(Actions.showFeatureToDonate("events"));
                  } else {
                    dispatch(Actions.toggleSearchCategory(c));
                    return dispatch(Actions.search());
                  }
                }}
                onChange={txt => {
                  if (txt == null) {
                    txt = "";
                  }
                  dispatch(Actions.setSearchText(txt));
                  return dispatch(Actions.search());
                }}
                onEscape={ () => {
                  return dispatch(Actions.setSearchText(''));
                }}
                onEnter={ () => {}}      // currently not used, TODO
              />
            </div>

            <div className="content-wrapper">
              <Sidebar
                view={ view }
                search={ search }
                map={ map }
                user={ user }
                form={ form }
                entries={entries}
                resultEntries={ resultEntries }
                ratings={ ratings }
                LeftPanelentries={ server.entries }
                dispatch={ dispatch }
                t={ t }
              />
            </div>
          </LeftPanel>

          <HiddenSidebar>
            <button
              onClick={ () => {
                if (view.showLeftPanel) {
                  return dispatch(Actions.hideLeftPanel());
                } else {
                  return dispatch(Actions.showLeftPanel());
                }
              }}>
              <i className={"fa fa-angle-double-" + (view.showLeftPanel ? 'left' : 'right')}/>
            </button>
          </HiddenSidebar>   
          
          <RightPanel open={rightPanelIsOpen}>
            <div className="menu-toggle">
              <button onClick={()=>{ return dispatch(Actions.toggleMenu()); }} >
                <span className="pincloud">
                  <i className={"fa fa-" + (rightPanelIsOpen ? 'times' : 'bars')} />
                </span>
              </button>
            </div>
          </RightPanel> 

          <div className="center">
            <Map
              marker={ (view.left === V.EDIT || view.left === V.NEW) ? map.marker : null}
              size={ view.left != null ? (rightPanelIsOpen ? 3 : 2) : rightPanelIsOpen ? 1 : 0}
              highlight={ search.highlight }
              center={ mapCenter}
              zoom={ map.zoom}
              category={ form[EDIT.id] ? form[EDIT.id].category ? form[EDIT.id].category.value : null : null}
              entries={ resultEntries}
              ratings={ ratings}
              onClick={ latlng => {
                return dispatch(Actions.setMarker(latlng));
              }}
              onMarkerClick={ id => { 
                dispatch(Actions.setCurrentEntry(id, null)); 
                return dispatch(Actions.showLeftPanel()); 
              }}
              onMoveend={ coordinates => { return dispatch(Actions.onMoveend(coordinates, map.center)); }}
              onZoomend={ coordinates => { return dispatch(Actions.onZoomend(coordinates, map.zoom)); }}
              onLocate={ () => { return dispatch(Actions.showOwnPosition()); }}
              showLocateButton={ true }
            />
          </div>
        </MainWrapper>
      </StyledApp>
    );  
  }
}

Main.propTypes = {
  view :          T.object.isRequired,
  server :        T.object.isRequired,
  map:            T.object.isRequired,
  search :        T.object.isRequired,
  form :          T.object.isRequired,
  url:            T.object.isRequired,
  user :          T.object.isRequired,
  timedActions :  T.object.isRequired
};

module.exports = translate('translation')(pure(Main))




/* Moved all styles here. TODO: Move to right components */


// Create the keyframes
const fadein = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

import pincloud from "../img/pincloud.png";


const MainWrapper = styled.div `
  height: 100vh;
`

const LeftPanel = styled.div `
  position: relative;
  z-index: 2;
  order: -1;
  height: 100vh;
  overflow-y: hidden;
  float: left;
  background-color: #fff;
  box-shadow: 1px 1px 5px rgba(0,0,0,.5);
  .content-wrapper {
    .result {
      box-sizing: border-box;
      padding-bottom: 30px;
      overflow: auto;
    }
    .content-above-buttons {
      overflow-y: scroll;
      overflow: auto;
      height: calc(100vh - 42px);
      box-sizing: border-box;
      padding-bottom: 30px;
    }
    .content {
      overflow-y: scroll;
      overflow: auto;
      height: 100vh;
      width: 100%;
      box-sizing: border-box;
      padding-bottom: 30px;
      position: absolute;
    }
  }
  &.closed {
    width: 0;
  }
  &.opened {
    max-width: 380px;
    width: 90%;
    .menu {
      width: 100%;
    }
  }
  .search {
    &.closed {
      display: none;
    }
    .main-categories {
      height: 2.1em;
    }
  }
  nav {
    &.menu {
      z-index: 10;
      padding: 0;
      margin: 0;
      background: ${STYLE.coal};
      text-align: center;
      position: absolute;
      bottom: 0;
      li {
        cursor: pointer;
        box-sizing: border-box;
        font-weight: normal;
        padding: 0.3em;
        font-size: 1.2em;
        border: none;
        color: ${STYLE.lightGray};
        background: transparent;
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
        &:hover {
          color: #fff;
          border-bottom: 4px solid #fff;
        }
        i {
          margin-right: 0.5em;
        }
      }
    }
    &.menu-top {
      top: 0;
      display: flex;
      flex-direction: row;
      padding: 9pt 6pt 8pt 7pt;
    }
  }
`

const RightPanel = styled.div `

  float: right;
  height: 100vh;
  
  background: #fff;
  color: ${STYLE.coal};
  position: relative;
  &.opened {
    width: 28em;
    button {
      margin-left: 0;
      color: ${STYLE.darkGray};
      box-shadow: none;
      border: none;
      .pincloud {
        width: 2em;
        background: none;
      }
      &:hover {
        box-shadow: none;
        border: none;
      }
    }
  }
  &.closed {
    position: relative;
    top: 0;
    right: 0;
    width: 0;
    z-index: 1;
    button {
      width: 3.8em;
      margin-left: -3.8em;
    }
  }
  a {
    text-decoration: none;
    color: ${STYLE.darkGray};
  }
  .logo {
    cursor: pointer;
    margin-top: 2em;
    background: url("../../img/logo.png");
    background-position: center;
    background-repeat: no-repeat;
    height: 95px;
  }
  div {
    &.menu-content {
      padding: 2.5em;
      position: absolute;
      top: 10em;
      bottom: 2em;
      left: 0;
      right: 0;
      overflow: auto;
      a {
        padding-bottom: 0.05em;
        border-bottom: 1px solid rgba(255,255,255,0.4);
        &:hover {
          color: #000;
          border-bottom: 1px solid #000;
        }
      }
    }
    &.menu-footer {
      display: block;
      cursor: pointer;
      text-transform: uppercase;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 10px;
      text-align: center;
      font-size: 0.85em;
      a:hover {
        color: #000;
        border-bottom: 2px solid #000;
      }
      &.active > a {
        color: ${STYLE.coal};
        border-bottom: 2px solid ${STYLE.darkGray};
      }
    }
  }
  ul {
    &.menu {
      margin: 2.5em 0 0 0;
      list-style: none;
      padding: 0;
      text-align: center;
      > li {
        margin-top: 2.5em;
        display: block;
        cursor: pointer;
        text-transform: uppercase;
        > a {
          font-weight: bold;
          font-size: 20px;
        }
        a:hover {
          color: #000;
          border-bottom: 2px solid #000;
        }
        &.active > a {
          color: ${STYLE.coal};
          border-bottom: 2px solid ${STYLE.darkGray};
        }
      }
    }
    &.submenu {
      margin: 0;
      list-style: none;
      padding: 0;
      text-align: center;
      > li {
        margin-top: 0.75em;
        font-size: 0.85em;
        display: block;
        cursor: pointer;
        text-transform: uppercase;
        a:hover {
          color: #000;
          border-bottom: 2px solid #000;
        }
        &.active > a {
          color: ${STYLE.coal};
          border-bottom: 2px solid ${STYLE.darkGray};
        }
      }
    }
  }

  .menu-toggle button, .content-toggle button {
    outline: none;
    position: relative;
    z-index: 1;
    top: 10pt;
    font-size: 15pt;
    text-transform: uppercase;
    text-align: right;
    color: ${STYLE.darkGray};
    background: #fff;
    border: 1px solid ${STYLE.lightGray};
    border-radius: 0.2em 0 0 0.2em;
    padding: 0.2em;
    box-shadow: 0 1px 3px 0.2px rgba(0,0,0,0.5);
    right: 0;
    &:hover {
      color: ${STYLE.coal};
      box-shadow: 0 1px 3px 0.2px #000;
    }
    .pincloud {
      display: inline-block;
      width: 3.5em;
      height: 1.2em;
      background-position: left;
      background-image: url(${pincloud});
      background-repeat: no-repeat;
      background-size: 50%;
    }
    i {
      margin-right: 0.3em;
    }
  }
  .subscribe-link a {
    outline: none;
    position: absolute;
    z-index: 2;
    top: 5em;
    font-size: 1.8em;
    text-transform: uppercase;
    text-align: right;
    color: ${STYLE.darkGray};
    background: #fff;
    border: 1px solid ${STYLE.lightGray};
    border-radius: 0.2em 0 0 0.2em;
    padding: 0.2em;
  }
`

const HiddenSidebar = styled.div `
  position: relative;
  z-index: 2;
  height: 0;
  >button {
    position: relative;
    top: 65px;
    font-size: 13pt;
    color: ${STYLE.darkGray};
    background: ${STYLE.white};
    border: 1px solid ${STYLE.lightGray};
    border-radius: 0 0.2em 0.2em 0;
    padding: 0.5em 0 0.5em 0.3em;
    box-shadow: 1px 1px 2px 0.3px rgba(0,0,0,50);
    &:hover {
      color: ${STYLE.coal};
      box-shadow: px 2px 2px 0.3px #000;
    }
    i {
      margin-right: 0.3em;
    }
  }
`

const StyledApp = styled.div `

  background: #fff;
  min-height: 100vh;
  height: 100vh;

  .tutorial {
    margin-bottom: 3em;
    img { width: 100%; }
  }

  /* TYPO */ 
  @media only screen and(max-width: 600px) {
    body {
      font-size: 80%;
    }
  }

  input, select, textarea, button {
    font-family: ${STYLE.bodyFont};
  }

  h1, h2, h3, h4, h5, h6, h7 {
    font-family: ${STYLE.headerFont};
  }

  button {
    font-family: ${STYLE.bodyFont};
    &.pure-button i {
      margin-right: 0.5em;
    }
  }

  .fa {
    font-family: "FontAwesome" !important;
  }

  .pure-g [class *= "pure-u"] {
    font-family: ${styles.bodyFont};
  }

  /* ============================== */
  /* SCROLLBAR */
  ::-webkit-scrollbar {
    background-color: #eee;
  }
  ::-webkit-scrollbar-thumb {
    /* //Instead of the line below you could use @include border-radius($radius, $vertical-radius) */
    border-radius: 0;
    background-color: #ccc;
  }

  .pure-menu-list {
    margin: 0 50px;
  }

  .pure-menu-link:hover {
    color: #000;
  }


  label span.desc {
    color: ${STYLE.darkGray};
    font-size: 0.8em;
    margin-left: 0.5em;
  }
  legend span.desc {
    color: ${STYLE.darkGray};
    font-size: 0.8em;
    margin-left: 0.5em;
  }



  /* ======= FORM */
  form {
    div.err {
      color: #f44;
      font-size: 0.9em;
    }
    input[type="text"].err {
      border-color: #f44;
    }
    textarea.err {
      border-color: #f44;
    }
    select.err {
      border-color: #f44;
    }
  }
  /* ======= */

  /* ======= BANNER */
  .banner {
    position: relative;
    z-index: 10;
    color: #eee;
    text-align: center;
    padding-top: 1em;
    padding-bottom: 1em;
    .banner-link {
      color: #000;
    }
  }
  /* ======= */

  /* ======= CHEVRON */
  div.chevron {
    position: relative;
    color: ${STYLE.lightGray};
    i {
      position: absolute;
      display: inline-table;
      top: 0;
      bottom: 0;
      margin: auto;
    }
  }
  /* ======= */


  /* ======= MISC */

  .close-button {
    text-align: center;
    margin: 0;
    padding: 1em;
    button {
      margin: 0 5px;
    }
  }
  .message {
    white-space: pre-wrap;
    margin: 0;
    padding: 1em;
  }
  .add-entry-form {
    margin-left: 1em;
    margin-right: 1em;
    select {
      height: 2.5em;
    }
    .radio-button {
      margin-top: 0.2em;
      margin-bottom: 0.2em;
    }
    .form-heading {
      font-weight: bold;
      margin-top: 0.5em;
      margin-bottom: 0;
    }
    .rating-context-explanation {
      margin-top: 0.5em;
      margin-bottom: 0.5em;
      font-style: italic;
    }
    h3 {
      margin-top: 1em;
      margin-bottom: 0.2em;
    }
  }
  .new-rating-form {
    margin-left: 1em;
    margin-right: 1em;
    select {
      height: 2.5em;
    }
    .radio-button {
      margin-top: 0.2em;
      margin-bottom: 0.2em;
    }
    .form-heading {
      font-weight: bold;
      margin-top: 0.5em;
      margin-bottom: 0;
    }
    .rating-context-explanation {
      margin-top: 0.5em;
      margin-bottom: 0.5em;
      font-style: italic;
    }
    .title {
      font-weight: bold;
    }
  }
  .optional::placeholder {
    color: #777;
  }
  input, textarea, select {
    box-shadow: none !important;
    border-radius: 3px !important;
  }
  .info {
    .landing-img {
      width: 70%;
    }
    h3 {
      margin-top: 50px;
    }
  }
  .license input {
    margin-top: 0.7em;
  }
`