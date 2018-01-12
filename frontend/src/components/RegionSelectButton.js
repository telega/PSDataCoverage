import React, { Component } from 'react';

class RegionSelectButton extends Component{

	render(){
		if(this.props.selectedRegion === this.props.regionName){


			return(
				<button onClick = {()=>this.props.getAuthority(this.props.regionName)} className = "btn btn-primary mr-1 mt-1 active">{this.props.regionName} </button>
				)

		} else {

			return(
				<button onClick = {()=>this.props.getAuthority(this.props.regionName)} className = "btn btn-primary mr-1 mt-1">{this.props.regionName} </button>
				)
		}
	}
}

export default RegionSelectButton;