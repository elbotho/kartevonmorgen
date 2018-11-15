import React, { Component,PureComponent }         from "react"
import { Map, TileLayer, Marker, CircleMarker, Tooltip }   from "react-leaflet"
import { icons }                    from "vm-leaflet-icons"
import URLs                         from "../constants/URLs"
import { pure }                     from "recompose"
import { IDS }                      from  "../constants/Categories"
import STYLE                        from "./styling/Variables"
import { avg_rating_for_entry }     from "../rating"
import styled                       from "styled-components";
import T                            from "prop-types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import L from 'leaflet'
import { translate }          from "react-i18next";
import { NAMES }    from "../constants/Categories"
import Actions              from "../Actions"
import serverActions         from "../Actions/server";

const { INITIATIVE, EVENT, COMPANY } = IDS;
import  "leaflet/dist/leaflet.css"

const munichBounds = L.latLngBounds(L.latLng(48.4,12.349), L.latLng(47.744,10.494));

var attribution = ""
URLs.TILE_SERVER_ATTR.name ? attribution = '<a class="osm attr" href=' + URLs.TILE_SERVER_ATTR.link + '>' + URLs.TILE_SERVER_ATTR.name + '</a> | '  : null
attribution += '&copy; <a class="osm attr" href=' + URLs.OSM_ATTR.link + '>' + URLs.OSM_ATTR.name + '</a>'


var searchTimer = 0;

class KVMMap extends Component {

  
  // shouldComponentUpdate() {
  //   return false;
  // }

  componentDidMount(){
    //workaround due to a bug in react-leaflet:
    const map = this.refs.map;
    if (map) {
      //map.fireLeafletEvent('load', map) 
      map.leafletElement.addControl(L.control.zoom({position: 'bottomright'}))
      this.props.onMoveend(this.getMapCoordinates())
    }

    //load icons for munich once:
    // this.props.dispatch(Actions.setBbox(munichBounds));
    // this.props.dispatch(serverActions.Actions.search());
  }

  getMapCoordinates(){
    const m = this.refs.map.leafletElement
    return {
      center: m.getCenter(),
      bbox  : m.getBounds(),
      zoom  : m.getZoom()
    }
  }

  _onMoveend () {
    this.props.onMoveend(this.getMapCoordinates()) 
    clearTimeout(searchTimer);
    // searchTimer = setTimeout(()=>{
    //   console.log("!!!! _onMoveend !!!! ")
    //   this.props.onMoveend(this.getMapCoordinates()) 
    // },400)
  }

  _onZoomend () {
    this.props.onZoomend(this.getMapCoordinates()) 
    
    clearTimeout(searchTimer);
    // searchTimer = setTimeout(()=>{
    //   console.log("!!!! _onZoomend !!!! ")
    //   this.props.onZoomend(this.getMapCoordinates()) 
    // },400)
  }



  render() {

    const {
      center,
      zoom,
      marker,
      onClick,
      showLocateButton,
      entries,
      ratings,
      highlight,
      onMarkerClick
    } = this.props;

    return (
      <Wrapper>
        <Map
          ref         = 'map'
          center      = { center }
          zoom        = { zoom }
          maxBounds   = { munichBounds.pad(0.3) }
          zoomSnap    = { 1 }
          zoomControl = { false }
          minZoom     = { 10 }
          className   = "map"
          onMoveend   = { () => { this._onMoveend() }}
          onZoomend   = { () => { this._onZoomend() }}
          onClick     = { (e) => { onClick(e.latlng) }} >

          <TileLayer
            url = { URLs.TILE_SERVER.link }
            attribution = { attribution }
            tileSize= { 512 }
            zoomOffset= { -1 }
          />
          
          <MarkerLayer
            entries = { entries }
            ratings = { ratings }
            highlight = { highlight }
            onMarkerClick = { onMarkerClick }
            marker = { marker }
            zoom = { zoom }
          />
      
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
                  <LocateIcon icon="location-arrow" />
                </LocateButton>
              </LocateButtonInnerContainer>
            </LocateButtonContainer>
          </div>
          : null }
      </Wrapper>)
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

module.exports = (pure(KVMMap));


class MarkerLayer extends PureComponent {
  // shouldComponentUpdate () {
  //   return false
  // }

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

  getIcon(size) {
    const helper = size/2

    return new L.Icon({
      iconUrl: require('../img/marker.svg'),
      iconRetinaUrl: require('../img/marker.svg'),
      iconSize: [size, size]
      // ??? iconAnchor: [helper, size],
      // popupAnchor: [0, 100]
    });
  }



  render() {

    let markersArray = []
    //return markersArray;
    const { entries, ratings, highlight, onMarkerClick, marker, zoom } = this.props
    const markerSize = 18+ (zoom-9)*6

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
              icon      = { this.getIcon(markerSize) }
              opacity   = { opacity }
            >
              <LongTooltip entry={ e } />
            </Marker>
          );
        } else {
          // to make clicking the circle easier add a larger circle with 0 opacity:

          let opacity = 0.5;
          if(highlight.indexOf(e.id) == 0 || highlight.length == 0) opacity = 1;
          
          const circleSize = markerSize/5

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
              <LongTooltip entry={ e } />                
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
    return(
      <React.Fragment>
        { markersArray }
        { marker
          ? <Marker position = { marker } icon = { this.getIcon(40) } />
          : null
        }
      </React.Fragment>
    )
  }
}

class _LongTooltip extends Component {


  render() {
    const { entry, t } = this.props
    const maxLength = 100
    const desc = (entry.description.length < maxLength) ? entry.description : entry.description.substr(0,maxLength) + ' …'
     
    return(
      <SmallTooltip direction='bottom' offset={[0, 10]}>
        <React.Fragment>
          <span>{t("category." + NAMES[entry.categories && entry.categories[0]])}</span>
          <h3>{entry.title}</h3>
          <p>{desc}</p>
        </React.Fragment>
      </SmallTooltip>            
    )
  }
}

const LongTooltip = translate('translation')(pure(_LongTooltip))

const Wrapper = styled.div`

  div.map {
    height: 100%;
    width: 100%;
    position: absolute;
    margin: 0;
    z-index: 0;
    padding: 0;
    top: 0;
    left: 0;
  }
  .osm.attr, .leaflet-control-attribution.leaflet-control a {
    color: ${ STYLE.darkGray }
  }

  .transition-icon{
    width: 40px;
    height: 40px;
    background: red;   
  }
`;

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

const LocateIcon = styled(FontAwesomeIcon)`
  width: 12px;
  height: 12px;
`;

const SmallTooltip = styled(Tooltip)`
  min-width: 10.5rem;
  white-space: normal !important;

  > span {
    color: ${ STYLE.initiative };
    font-size: 0.67rem;
    text-transform: uppercase;
  }

  > h3 {
    font-family: sans-serif;
    margin: 0;
    padding: 0;
    font-size: 0.75rem;
  }
`