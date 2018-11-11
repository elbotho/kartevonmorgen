import React, { Component } from "react";
import Select, { Creatable }  from 'react-select';
import request from "superagent/lib/client";
import { translate } from "react-i18next";
import normalize from "../util/normalize";


class SelectTags extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      allOptions: [],
      options: []
    };
    
    //TODO: List of Tags should probably be loaded with the WebAPI or use Async react-select  (started to build "getAllTags" already). (…)
    
    request
      .get('http://api.ofdb.io/v0/tags/')
      .accept('json')
      .end((err, response) => {
        if (err) {
          console.error(err);
        }
        if (response.body) {
          let options = []
          for (var i = 0; i < response.body.length; i++) {
            options[i] = {
              "value": response.body[i],
              "label": response.body[i]
            }
          } 
          this.state = {
            allOptions: options
          }
        }
      });
  }

  onInputChange(input,action) {
    this.filterOptions(input)

    this.state.lastInput
  }

  filterOptions(input) {
    let res
    if(input.length < 2){
      res = []
    } 
    else {
      let searchString = input.toLowerCase().trim();
      res = this.state.allOptions.filter(function(d) {
        return d.label.match( searchString );
      });
    }
    
    res = res.slice(0, 30)

    this.setState({
      options: res
    })

  }

  valueToArray() {
    const value = this.props.input.value

    if( typeof value !== "string") return value
    return value.split(',').map( val => {
      return {value: val, label: val }
    })
  }

  valueToString(cb,newValue,event) {

    const val = newValue  // ? newValue : this.props.input.value
    if( typeof val === "string" ) return val

    const currentTagsArray = this.props.input.value.split(',')


    let arr = []
    for (let i = 0; i < val.length; i++) {
      const normalized = normalize.tags(val[i].value)
      if ( normalized==false ) continue
      
      const isNew = (i == (val.length -1) && event.action == "create-option")
      if (isNew ) if (currentTagsArray.indexOf(normalized) != -1 ) return false

      arr.push( normalized )
    }
    cb( arr.join(',') );
  }

  validate(input) {
    return (input.length > 2 )
  }

  render(){

    return(
      <Creatable
        {...this.props}

        isClearable={false}
        isMulti={true}

        options={this.state.options || []}
        placeholder={this.props.t("entryForm.tags")}
        noOptionsMessage={() => this.props.t("entryForm.noTagSuggestion") }
        formatCreateLabel={(inputValue) => this.props.t("entryForm.newTag")+" "+normalize.tags(inputValue) }

        onInputChange={this.onInputChange.bind(this)}
        onChange={ (value,event) => {this.valueToString( this.props.input.onChange, value, event ) } }
        onBlur={() => this.props.input.onBlur([this.props.input.value]) }
        onBlur={() => this.props.input.onBlur(this.props.input.value) }
        value={ this.valueToArray() }
        isValidNewOption = { this.validate }
        getNewOptionDatafunction = {this.getNewOptionData}
      />
    )
  }
}


module.exports = translate('translation')(SelectTags)