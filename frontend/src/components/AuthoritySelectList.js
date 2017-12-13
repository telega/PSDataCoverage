import React, { Component } from 'react';
import AuthoritySelectButton from './AuthoritySelectButton'

class AuthoritySelectList extends Component{
	
	// constructor(props){
	// 	super(props);
	// }

	listItem(){
		if(this.props.authorityList instanceof Array){
			return this.props.authorityList.map((authority, i)=>{
				return (
					<AuthoritySelectButton key = {i} listClicked={()=>this.props.listClicked(authority)} authorityId = {authority.Id} shortName = {authority.shortName} countryCode = {authority.countryCode} />
					)
			})
		}
	}


	render(){
		return(
			<div>
				{this.listItem()}
			</div>
			)
	}
}

export default AuthoritySelectList;