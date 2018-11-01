import "./styling/Map.styl"
import React, { Component }         from "react"
import { Map, TileLayer, Marker, CircleMarker, Circle }   from "react-leaflet"
import { icons }                    from "vm-leaflet-icons"
import URLs                         from "../constants/URLs"
import { pure }                     from "recompose"
import { IDS }                      from  "../constants/Categories"
import COLORS                       from "./styling/Colors"
import { avg_rating_for_entry }     from "../rating"
import styled                       from "styled-components";
import T                            from "prop-types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const { INITIATIVE, EVENT, COMPANY } = IDS;

const LocateButtonContainer = styled.div`
  bottom: 95px;
  position: absolute;
  z-index: 0;
`;

const LocateButtonInnerContainer = styled.div`
  box-shadow: none !important;
  width: 30px;
  height: 30px;
  border: 2px solid rgba(0,0,0,0.2);
  background-clip: padding-box;
`;

const LocateButton = styled.a `
  cursor: pointer;
  font-size: 14px;
  color: #333;
  width: 30px !important;
  height: 30px !important;
  line-height: 30px !important;
`;

class KVMMap extends Component {

  getIconById(id){
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
        return COLORS.initiative;
      case EVENT:
        return COLORS.event;
      case COMPANY:
        return COLORS.company;
      default:
        return COLORS.otherCategory;
    }
  }

  componentDidMount(){
    //workaround due to a bug in react-leaflet:
    const map = this.refs.map;
    if (map) {
      map.fireLeafletEvent('load', map)
      map.leafletElement.addControl(L.control.zoom({position: 'bottomright'}))
      this.props.onMoveend(this.getMapCoordinates())
    }
  }

  componentDidUpdate(prevProps, prevState){
    if (prevProps.size != this.props.size) {
      this.refs.map.leafletElement.invalidateSize()
    }
  }

  getMapCoordinates(){
    const m = this.refs.map.leafletElement
    return {
      center: m.getCenter(),
      bbox  : m.getBounds(),
      zoom  : m.getZoom()
    }
  }

  render() {

    var markers = [];

    const {
      entries,
      center,
      zoom,
      marker,
      onMoveend,
      onZoomend,
      onClick,
      onMarkerClick,
      ratings,
      showLocateButton,
      highlight
    } = this.props;

    if (entries && entries.length > 0 ) {
      entries.forEach(e => {
        let avg_rating = null;

        if(e.ratings.length > 0 && Object.keys(ratings).length > 0){
          const ratings_for_entry = (e.ratings || []).map(id => ratings[id]);
          avg_rating = avg_rating_for_entry(ratings_for_entry);
        }

        if(e.ratings.length > 0 && avg_rating && avg_rating > 0){
          if(highlight.indexOf(e.id) == 0 || highlight.length == 0){
            markers.push(
              <Marker
                key       = { e.id }
                onClick   = { () => { onMarkerClick(e.id) }}
                position  = {{ lat: e.lat, lng: e.lng }}
                icon      = { this.getIconById(e.categories[0]) }
                opacity   = { 1 }
              />
            );
          } else if(highlight.length > 0){
            markers.push(
              <Marker
                key       = { e.id }
                onClick   = { () => { onMarkerClick(e.id) }}
                position  = {{ lat: e.lat, lng: e.lng }}
                icon      = { this.getIconById(e.categories[0]) }
                opacity   = { 0.5 }
              />
            );
          }
        } else {
          if(highlight.indexOf(e.id) == 0 || highlight.length == 0){
            markers.push(
              <CircleMarker
                onClick   = { () => { onMarkerClick(e.id) }}
                key       = { e.id }
                center    = {{ lat: e.lat, lng: e.lng }}
                opacity   = { 1 }
                radius    = { 12 }
                color     = { "#fff" }
                weight    = { 0.7 }
                fillColor = { this.getCategoryColorById(e.categories[0]) }
                fillOpacity = { 1.0 }
              />);
          } else if(highlight.length > 0){
            markers.push(
              <CircleMarker
                onClick   = { () => { onMarkerClick(e.id) }}
                key       = { e.id }
                center    = {{ lat: e.lat, lng: e.lng }}
                opacity   = { 1 }
                radius    = { 8 }
                color     = { "#fff" }
                weight    = { 0.7 }
                fillColor = { this.getCategoryColorById(e.categories[0]) }
                fillOpacity = { 0.6 }
              />);
          }
        }

        if(highlight.length > 0 && highlight.indexOf(e.id) == 0){
          markers.push(
            <CircleMarker
              onClick   = { () => { onMarkerClick(e.id) }}
              key       = { e.id + "-highlight"}
              center    = {{ lat: e.lat, lng: e.lng }}
              opacity   = { 1 }
              radius    = { 13 }
              color     = { "#fff" }
              fillColor = { this.getCategoryColorById(e.categories[0]) }
              weight    = { 2.5 }
              fillOpacity = { 1 }
            />);
        }
      });
    }

    return (
        <div>
        <Map
        style = {{
          height:   "100%",
          width:    "100%",
          position: "absolute",
          margin:   0,
          zIndex:   0,
          padding:  0,
          top:      0,
          left:     0
        }}
        ref         = 'map'
        center      = { center }
        zoom        = { zoom   }
        zoomSnap    = { 1.0 }
        // zoomStep    = "1"
        zoomControl = { true }
        className   = "map"
        onMoveend   = { (e) => { onMoveend(this.getMapCoordinates()) }}
        onZoomend   = { (e) => { onZoomend(this.getMapCoordinates()) }}
        onClick     = { (e) => { onClick(e.latlng) }} >

          <TileLayer
            url = { URLs.OSM_TILES.link }
            minZoom ='10'
            attribution = {
              '&copy; <a class="osm attr" href=' +
               URLs.OSM_ATTR.link + '>' + URLs.OSM_ATTR.name + '</a>' } >
          </TileLayer>
          { markers }
          { marker
            ? <Marker position = { marker } icon = { this.getIconById(parseInt(this.props.category)) } />
            : null
          }
          }
        </Map>
        {showLocateButton ?
          <div className="leaflet-control-container">
            <LocateButtonContainer className="leaflet-right">
                <LocateButtonInnerContainer className = "leaflet-control-locate leaflet-bar leaflet-control">
                  <LocateButton
                    className   = "leaflet-bar-part leaflet-bar-part-single" //"locate-icon"
                    onClick     = { this.props.onLocate }
                    title       = "Zeige meine Position" >
                    <FontAwesomeIcon icon="location-arrow" />
                  </LocateButton>
                </LocateButtonInnerContainer>
            </LocateButtonContainer>
          </div>
          : null }
        </div>)
    }
}

KVMMap.propTypes = {
    entries       : T.array,
    ratings       : T.object,
    highlight     : T.array,
    center        : T.object,
    zoom          : T.number,
    marker        : T.object,
    onClick       : T.func,
    onMoveend     : T.func,
    onZoomend     : T.func,
    onMarkerClick : T.func,
    onLocate      : T.func,
    showLocateButton : T.bool
};

module.exports = pure(KVMMap);