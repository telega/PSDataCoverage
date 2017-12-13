import React, { Component } from 'react';

class RegionSelectButton extends Component{
	

	render(){
		return(
			<button onClick = {()=>this.props.getAuthority(this.props.regionName)} className = "btn btn-primary mr-1 mt-1">{this.props.regionName} </button>
			)
	}
}

export default RegionSelectButton;