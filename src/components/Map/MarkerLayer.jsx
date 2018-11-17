import React, { PureComponent } from "react"
import { Marker, Tooltip, CircleMarker }   from "react-leaflet"
import STYLE from "../styling/Variables"
import styled from "styled-components";
import { IDS } from  "../../constants/Categories"
const { INITIATIVE, EVENT, COMPANY } = IDS;
import { avg_rating_for_entry }     from "../../rating"
import { icons }                    from "vm-leaflet-icons"

class MarkerLayer extends PureComponent {

  getIconById(id) {
    switch (id) {
      case INITIATIVE:
        return icons.initiative;
      case EVENT:
        return icons.event;
      case COMPANY:
        return icons.company;
      default:
        return icons.unknown;
    }
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
    const { entries, ratings, highlight, onMarkerClick, marker } = this.props

    if (entries && entries.length > 0 ) {
      entries.forEach(e => {
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
              icon      = { this.getIconById(e.categories[0]) }
              opacity   = { opacity }
            >
              <SmallTooltip direction='bottom' offset={[0, 2]}><h3>{e.title}</h3></SmallTooltip>
            </Marker>
          );
        } else {
          // to make clicking the circle easier add a larger circle with 0 opacity:

          let opacity = 0.5;
          if(highlight.indexOf(e.id) == 0 || highlight.length == 0) opacity = 1;

          markersArray.push(
            <CircleMarker
              onClick   = { () => { onMarkerClick(e.id) }}
              key       = { e.id }
              center    = {{ lat: e.lat, lng: e.lng }}
              opacity   = { 1 }
              radius    = { 9 }
              color     = { "#fff" }
              weight    = { 0.7 }
              fillColor = { this.getCategoryColorById(e.categories[0]) }
              fillOpacity = { opacity }
            >
              <SmallTooltip direction='bottom' offset={[0, 10]}><h3>{e.title}</h3></SmallTooltip>
            </CircleMarker>
          );
        }

        if(highlight.length > 0 && highlight.indexOf(e.id) == 0){

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
        <Marker position = { marker } icon = { this.getIconById(parseInt(this.props.category)) } />
      )
    }
    return (
      markersArray
    )
  }
        
}

module.exports = MarkerLayer 

const SmallTooltip = styled(Tooltip)`
  > h3 {
    font-family: sans-serif;
    margin: 0;
    padding: 0;
    font-size: 0.75rem;
  }
`