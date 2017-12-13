import React, { Component } from 'react';

class AuthoritySelectButton extends Component{
	
	// constructor(props){
	// 	super(props);
	// }

	// listItem(){
	// 	if(this.props.authorityList instanceof Array){
	// 		return this.props.authorityList.map((authority, i)=>{
	// 			return (
	// 				<li key = {i} onClick={()=>this.props.listClicked(i)} >{authority.shortName}</li>
	// 				)
	// 		})
	// 	}
	// }

	render(){
		return(
			<button className="list-group-item list-group-item-action" onClick={()=>this.props.listClicked(this.props.authorityId)}>{this.props.shortName} ({this.props.countryCode}) </button>
			)
	}
}

export default AuthoritySelectButton;