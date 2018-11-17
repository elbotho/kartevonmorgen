import React, { Component }         from "react"
import { Map, TileLayer }   from "react-leaflet"
import URLs                         from "../../constants/URLs"
import { pure }                     from "recompose"
import STYLE                        from "../styling/Variables"
import styled                       from "styled-components";
import T                            from "prop-types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import MarkerLayer from './MarkerLayer'

import  "leaflet/dist/leaflet.css"


class KVMMap extends Component {

  componentDidMount(){
    //workaround due to a bug in react-leaflet:
    const map = this.refs.map;
    if (map) {
      //map.fireLeafletEvent('load', map) 
      map.leafletElement.addControl(L.control.zoom({position: 'bottomright'}))
      this.props.onMoveend(this.getMapCoordinates())
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
      highlight,
      category
    } = this.props;

    let attribution = ""
    URLs.TILE_SERVER_ATTR.name ? attribution = '<a class="osm attr" href=' + URLs.TILE_SERVER_ATTR.link + '>' + URLs.TILE_SERVER_ATTR.name + '</a> | '  : null
    attribution += '&copy; <a class="osm attr" href=' + URLs.OSM_ATTR.link + '>' + URLs.OSM_ATTR.name + '</a>'

    return (
      <Wrapper>
        <Map
          ref         = 'map'
          center      = { center }
          zoom        = { zoom }
          zoomSnap    = { 1.0 }
          zoomControl = { false }
          className   = "map"
          onMoveend   = { (e) => { onMoveend(this.getMapCoordinates()) }}
          onZoomend   = { (e) => { onZoomend(this.getMapCoordinates()) }}
          onClick     = { (e) => { onClick(e.latlng) }} >

          <TileLayer
            url = { URLs.TILE_SERVER.link }
            attribution = { attribution }
          />

          <MarkerLayer
            entries = { entries }
            ratings = { ratings }
            highlight = { highlight }
            onMarkerClick = { onMarkerClick }
            marker = { marker }
            category = {category}
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

module.exports = pure(KVMMap);



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