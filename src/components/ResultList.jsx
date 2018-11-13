import React        from "react"
import Actions      from "../Actions"
import Address      from "./AddressLine"
import { pure }     from "recompose"
import Flower       from "./Flower";
import NavButton    from "./NavButton";
import i18n         from "../i18n";
import { NAMES }    from "../constants/Categories"
import { translate} from "react-i18next";
import PropTypes    from "prop-types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import STYLE        from "./styling/Variables"
import styled       from "styled-components";


const ResultListElement = ({highlight, entry, ratings, onClick, onMouseEnter, onMouseLeave, t}) => {
  var css_class = highlight ? 'highlight-entry ' : '';
  css_class = css_class + NAMES[entry.categories && entry.categories[0]];

  return (
    <ListElement
      key           = { entry.id }
      className     = { css_class }
      onClick       = { (ev) => { onClick(entry.id, {lat: entry.lat, lng: entry.lng}) }}
      onMouseEnter  = { (ev) => { ev.preventDefault(); onMouseEnter(entry.id) }}
      onMouseLeave  = { (ev) => { ev.preventDefault(); onMouseLeave(entry.id) }} >
      <div className = "pure-g">
        <div className = "pure-u-23-24">
          <div className="category">
            <span className="category">
              { t("category." + NAMES[entry.categories && entry.categories[0]]) }
            </span>
          </div>
          <div>
            <h3 className="title">{entry.title}</h3>
          </div>
          <div>
            <span className= "subtitle">{entry.description}</span>
          </div>
          { (entry.street || entry.zip || entry.city)
            ? <AddressWrapper><Address { ...entry } /></AddressWrapper>
            : null
          }
          <div className="flower">
            <Flower ratings={ratings} radius={30} />
          </div>
          {
            entry.tags ? (entry.tags.length > 0) 
              ? <TagsWrapper>
                <ul >
                  { entry.tags.slice(0, 5).map(t => <Tag key={t}>#{t}</Tag>) }
                </ul>
              </TagsWrapper>
              : null
              : null
          }
        </div>
        <div className = "pure-u-1-24 chevron">
          <FontAwesomeIcon icon="chevron-right" />
        </div>
      </div>
    </ListElement>)
}

const ResultList = ({ dispatch, waiting, entries, ratings, highlight, onClick,
  moreEntriesAvailable, onMoreEntriesClick, t}) => {

  let results = entries.map( e =>
    <ResultListElement
      entry        = { e            }
      ratings      = { (e.ratings || []).map(id => ratings[id])}
      key          = { e.id         }
      highlight    = { highlight.indexOf(e.id) >= 0 }
      onClick      = { (id, center) => { dispatch(Actions.setCurrentEntry(id, center)) }}
      onMouseEnter = { (id) => { dispatch(Actions.highlight(e.id)) }}
      onMouseLeave = { (id) => { dispatch(Actions.highlight()) }}
      t            = { t } />);
  if(moreEntriesAvailable && !waiting){
    results.push(
      <ListElement key="show-more-entries">
        <div>
          <a onClick = { onMoreEntriesClick } href="#">
            {t("resultlist.showMoreEntries")}
          </a>
        </div>
      </ListElement>
    );
  }

  return (
    <Wrapper>
      <div className= "result-list">
      {
        (results.length > 0)
          ? <ul>{results}</ul>
          : (waiting ?
          <p className= "loading">
            <span>{t("resultlist.entriesLoading")}</span>
          </p>
          : <p className= "no-results">
              <FontAwesomeIcon icon={['far', 'frown']} /> <span>{t("resultlist.noEntriesFound")}</span>
            </p>)
      }
      </div>
      <nav className="menu pure-g">
        <NavButton
          key = "back"
          classname = "pure-u-1"
          icon = "plus"
          text = {t("resultlist.addEntry")}
          onClick = {() => {
            dispatch(Actions.showNewEntry());
          }}
        />
      </nav>
    </Wrapper>)
}

ResultList.propTypes = {
  dispatch:             PropTypes.func.isRequired,
  waiting:              PropTypes.bool.isRequired,
  entries:              PropTypes.array.isRequired,
  ratings:              PropTypes.object.isRequired,
  highlight:            PropTypes.array.isRequired,
  moreEntriesAvailable: PropTypes.bool.isRequired,
  onMoreEntriesClick:   PropTypes.func.isRequired,
  t:                    PropTypes.func.isRequired,
  onClick:              PropTypes.func
}

module.exports = translate("translation")(pure(ResultList))

const AddressWrapper = styled.div`
  font-size: 0.8em;
  color: ${STYLE.gray};
  margin-top: .3rem;
  margin-bottom: .4rem;

`;

const ListElement = styled.li `
  cursor: pointer;
  margin: 0;
  padding-left: 0.7em;
  padding-top: 0.7em;
  padding-right: 0.5em;
  padding-bottom: 0.7em;
  border-bottom: 1px solid #ddd;
  border-left: 5px solid transparent;
  div {
    &:first-child {
      margin-bottom: 0.1em;
    }
    &.category {
      height: 1.2em;
    }
  }
  h3 {
    font-size: 1.2em;
    margin: .2rem .3em .2rem 0;
  }
  &.current-entry {
    background: #fff;
  }
  &:hover {
    background-color: #fff;
  }
  &.event {
    &.current-entry {
      border-left: 5px solid ${STYLE.event};
    }
    &:hover {
      border-left: 5px solid ${STYLE.event};
    }
    span.category {
      color: ${STYLE.event};
    }
  }
  &.company {
    &.current-entry {
      border-left: 5px solid ${STYLE.company};
    }
    &:hover {
      border-left: 5px solid ${STYLE.company};
    }
    span.category {
      color: ${STYLE.company};
    }
  }
  &.initiative {
    &.current-entry {
      border-left: 5px solid ${STYLE.initiative};
    }
    &:hover {
      border-left: 5px solid ${STYLE.initiative};
    }
    span.category {
      color: ${STYLE.initiative};
    }
  }
  h3.title{
    font-weight: 500;
  }
  span {
    &.category {
      font-size: 0.8em;
      color: #aaa;
      text-transform: uppercase;
    }
    &.title {
      font-weight: 500;
      font-size: 1.2em;
      margin-right: 0.3em;
    }
    &.subtitle {
      font-size: 0.8em;
      color: #555;
    }
  }
  .highlight-entry {

    div.chevron {
      color: $darkGray;
    }
    &.initiative div.chevron {
      color: $initiative;
    }
    &.company div.chevron {
      color: $company;
    }
    &.event div.chevron {
      color: $event;
    }
  }
`

const TagsWrapper = styled.div `
  margin-top: 0.4em;
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
`

const Tag = styled.div `
  font-size: 0.75em;
  display: inline-block;
  background: #eaeaea;
  color: #333;
  border-radius: 0.3em;
  padding: 0.2em 0.4em;
  margin-right: 0.4em;
  margin-bottom: 0.2em;
  border: 0;
  letter-spacing: 0.06em;
`

const Wrapper = styled.div `
.result-list {
  p {
    &.no-results {
      margin: 0;
      padding: 1em;
      font-size: 0.9em;
      span {
        margin-left: 0.5em;
      }
    }
    &.loading {
      margin: 0;
      padding: 1em;
      font-size: 0.9em;
      span {
        margin-left: 0.5em;
      }
    }
  }
  .flower {
    float: right;
    margin-top: 0.4em;
    margin-right: 1.2rem;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
   
  }
}
`