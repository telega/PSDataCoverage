import React, { Component } from 'react';
import AuthorityCoverageRow from './AuthorityCoverageRow'
//import logo from '../logo.svg';

class TableHeading extends Component {
	render(){
		return( 
			<th>{this.props.heading}</th>
		)
	}
}

class AuthorityCoverageTable extends Component{
	
	// constructor(props){
	// 	super(props);
	// }

	tableRow(){
		if(this.props.dataSetList instanceof Array){
			return this.props.dataSetList.map((dataSetList, i)=>{
				return dataSetList.dataSets.map((dataSet, i)=>{

				return (
					<AuthorityCoverageRow key = {i} selectedSegmentList = {this.props.selectedContentSegments} shortName = {dataSetList.shortName} countryCode = {dataSetList.countryCode} dataSet = {dataSetList.dataSets[i]} showGoodCoverageYear = {this.props.showGoodCoverageYear}/>
					);
				});
			});
		}
	}

	initialTableHeadings(){
			return ['Authority', 'Data Set', 'PubType'].map((heading, i)=>{
				return (
						<TableHeading key = {i} heading = {heading} />
				)
				
			});
	}


	tableHeadings(){
			return this.props.selectedContentSegments.map((contentSegment, i)=>{
				if(contentSegment.active === false){
					return null;
				} else {
					return (
						<TableHeading key = {i} heading = {contentSegment.heading} />
					)
				}
			});
	}

	render(){
		if( (this.props.dataSetList instanceof Array) && (this.props.dataSetList.length > 0) ){
			return(
				<div className ="table-container">
				<table className="table table-striped">
					<thead className = "thead-default">
						<tr>
							{this.initialTableHeadings()}
							{this.tableHeadings()}
						</tr>
					</thead>
					<tbody>
						{this.tableRow()}
					</tbody>
				</table>
				</div>
			)
		} else {
			return null;
		}
	}
}

export default AuthorityCoverageTable;