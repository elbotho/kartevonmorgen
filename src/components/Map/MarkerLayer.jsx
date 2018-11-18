import React, { Component, PureComponent } from "react"
import { Marker, Tooltip, CircleMarker } from "react-leaflet"
import STYLE from "../styling/Variables"
import styled from "styled-components";
import { avg_rating_for_entry } from "../../rating"
import L from 'leaflet'
import { translate } from "react-i18next"

import { IDS } from  "../../constants/Categories"
const { INITIATIVE, EVENT, COMPANY } = IDS;
import { NAMES }    from "../../constants/Categories"

const ICONSVG = 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 80"><radialGradient id="a" cx="-411.46" cy="370.93" r="28" gradientTransform="matrix(-2.0733 -.00485 -.00563 2.4046 -823.24 -872.86)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="{stop0}"/><stop offset="1" stop-color="{stop1}"/></radialGradient><path d="M28 80S0 42.8 0 28 13.2 0 28 0s28 13.2 28 28-28 52-28 52z" fill="url(%23a)"/></svg>'
const ICONS = []


class MarkerLayer extends PureComponent {

  componentWillMount(){
    ICONS[INITIATIVE] = this.buildIcon(INITIATIVE)
    ICONS[EVENT] = this.buildIcon(EVENT)
    ICONS[COMPANY] = this.buildIcon(COMPANY)
  }

  buildIcon(id){
    const color = this.getCategoryColorById(id)
    const colorparts = color.split('%,')
    const lightness = parseInt(colorparts[1].replace("%","").replace(" ",""))
    const stop0 = colorparts[0] + '%, ' + (lightness+10) + '%)'
    const stop1 = colorparts[0] + '%, ' + (lightness-10) + '%)'
    const shape = ICONSVG.replace("{stop0}",stop0).replace("{stop1}",stop1)
    return shape
  }

  getIcon(size, id) {
    const helper = size/2
  
    return new L.Icon({
      iconUrl: ICONS[id],
      iconRetinaUrl: ICONS[id],
      iconSize: [size, size],
      iconAnchor: [helper, size - size/6]
    });
  }

  getCategoryColorById(id){
    switch (id) {
      case INITIATIVE:
        return STYLE.initiative;
      case EVENT:
        return STYLE.event;
      case COMPANY:
        return STYLE.company;
      default:
        return STYLE.otherCategory;
    }
  }

  render() {
    let markersArray = []
    const { entries, ratings, highlight, onMarkerClick, marker, zoom } = this.props
    
    const markerSize = 14 + (zoom-9)*6

    if (entries && entries.length > 0 ) {
      entries.forEach(e => {

        let isHighlight = highlight.length > 0 && highlight.indexOf(e.id) == 0
        let avg_rating = null;

        if(e.ratings.length > 0 && Object.keys(ratings).length > 0){
          const ratings_for_entry = (e.ratings || []).map(id => ratings[id]);
          avg_rating = avg_rating_for_entry(ratings_for_entry);
        }

        if(e.ratings.length > 0 && avg_rating && avg_rating > 0){
          let opacity = 0.5;
          if(highlight.indexOf(e.id) == 0 || highlight.length == 0) opacity = 1;
          markersArray.push(
            <Marker
              key       = { e.id }
              onClick   = { () => { onMarkerClick(e.id) }}
              position  = {{ lat: e.lat, lng: e.lng }}
              icon      = { this.getIcon(markerSize, e.categories[0]) }
              opacity   = { opacity }
            >
              { !isHighlight && <LongTooltip entry={ e } /> }
            </Marker>
          );
        } else {
          // to make clicking the circle easier add a larger circle with 0 opacity:

          let opacity = 0.5;
          if(highlight.indexOf(e.id) == 0 || highlight.length == 0) opacity = 1;
          
          const circleSize = markerSize/4.5

          markersArray.push(
            <CircleMarker
              onClick   = { () => { onMarkerClick(e.id) }}
              key       = { e.id }
              center    = {{ lat: e.lat, lng: e.lng }}
              opacity   = { 1 }
              radius    = { circleSize }
              color     = { "#fff" }
              weight    = { 0.7 }
              fillColor = { this.getCategoryColorById(e.categories[0]) }
              fillOpacity = { opacity }
            >
              { !isHighlight && <LongTooltip entry={ e } /> } 
            </CircleMarker>
          );
        }

        if(isHighlight){
          

          let yOffset = 10
          if(e.ratings.length > 0 && avg_rating && avg_rating > 0) yOffset = 2

          markersArray.push(
            <CircleMarker
              onClick   = { () => { onMarkerClick(e.id) }}
              key       = { e.id + "-highlight"}
              center    = {{ lat: e.lat, lng: e.lng }}
              opacity   = { 0 }
              fillOpacity = { 0 }
            >
              <SmallTooltip permanent={true} direction='bottom' offset={[0, yOffset]}><h3>{e.title}</h3></SmallTooltip>
            </CircleMarker>);
        }
      });
    }

    if (marker) {
      markersArray.push(
        <Marker position = { marker } icon = { this.getIcon(40) } />
      )
    }
    return (
      markersArray
    )
  }
        
}

module.exports = MarkerLayer 

class _LongTooltip extends PureComponent {
  render() {
    const { entry, t } = this.props
    const maxLength = 100
    const desc = (entry.description.length < maxLength) ? entry.description : entry.description.substr(0,maxLength) + ' …'
     
    return(
      <SmallTooltip long={true} direction='bottom' offset={[0, 10]}>
        <React.Fragment>
          <span>{t("category." + NAMES[entry.categories && entry.categories[0]])}</span>
          <h3>{entry.title}</h3>
          <p>{desc}</p>
        </React.Fragment>
      </SmallTooltip>            
    )
  }
}

const LongTooltip = translate('translation')(_LongTooltip)


const SmallTooltip = styled(Tooltip)`

  ${props => props.long && `
    min-width: 10.5rem;
    white-space: normal !important;
  `}

  > span {
    color: ${ STYLE.initiative };
    font-size: 0.77rem;
    text-transform: uppercase;
  }

  > h3 {
    font-family: sans-serif;
    margin: 0;
    padding: 0;
    font-size: 0.85rem;
  }
`