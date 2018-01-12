import React, { Component } from 'react';
import AuthorityCoverageRow from './AuthorityCoverageRow'
import InlineCss from 'react-inline-css';
//import logo from '../logo.svg';

class TableHeading extends Component {
	render(){
		return( 
			<th>{this.props.heading}</th>
		)
	}
}

class AuthorityCoveragePdf extends Component{
	

	tables(){

			let dataSetList = this.props.dataSetList;

			let newDataSetList = []	;  

			for(var key in dataSetList){
				let shortName = dataSetList[key].shortName;
				let countryCode = dataSetList[key].countryCode;

				dataSetList[key].dataSets.forEach((ds)=>{
					ds.shortName = shortName;
					ds.countryCode = countryCode;
					newDataSetList.push(ds);
				})
			}

			let dataSetArray = [];

			let rowSize = 5;
			if(this.props.showGoodCoverageYear === false ){
				rowSize = 8;
			}

			for(var i = 0; i < newDataSetList.length; i += rowSize){
				dataSetArray.push (newDataSetList.slice(i,i+rowSize) );
			}

			return(

				dataSetArray.map((dataSet,i)=>{
					return(

						<InlineCss key={i} stylesheet={`

				& hr {
				    margin-top: 1rem;
				    margin-bottom: 1rem;
				    border: 0;
				    border-top: 1px solid rgba(0, 0, 0, 0.1)
				}

				& table {
				    border-collapse: collapse;
				}
				
				& th {
				    text-align: left;
				}

				& tr {
    				page-break-inside: avoid !important;
				}

				& .no-break{
					page-break-inside: avoid !important;
				}
				
				& .table {
				    width: 100%;
				    max-width: 100%;
				    margin-bottom: 1rem;
				    background-color: #ececec;
				    font-family: sans-serif;
				    font-size:8px
				}
				
				& .table th,
				 .table td {
				    padding: .75rem;
				    border-top: 1px solid #e9ecef;
				    page-break-inside:avoid !important;
				}
				
				& .table thead th {
				    vertical-align: bottom;
				    background-color: #3c3c3c;
				    font-weight: 400
				}
				
				& .table tbody+tbody {
				    border-top: 2px solid #e9ecef
				}
				
				& .table .table {
				    background-color: #fff
				}
				
				& .table-sm th,
				& .table-sm td {
				    padding: .3rem
				}
				
				& .table-bordered {
				    border: 1px solid #e9ecef
				}
				
				& .table-bordered th,
				 .table-bordered td {
				    border: 1px solid #e9ecef
				}
				
				& .table-bordered thead th,
				.table-bordered thead td {
				    border-bottom-width: 2px
				}
				
				& .table-striped tbody tr:nth-of-type(odd) {
				    background-color: rgba(0, 0, 0, 0.05)
				}
				
				& .table-hover tbody tr:hover {
				    background-color: rgba(0, 0, 0, 0.075)
				}
				
				& .table-primary,
				.table-primary>th,
				.table-primary>td {
				    background-color: #b8e6ee
				}
								
				& .table-secondary,
				.table-secondary>th,
				.table-secondary>td {
				    background-color: #d7d7d7
				}
												
				& .thead-inverse th {
				    color: #fff;
				    background-color: #212529
				}
				
				& .thead-default th {
				    color: #aebd38;
				    background-color: #3c3c3c
				}
				
				& .table-inverse {
				    color: #fff;
				    background-color: #212529
				}
				
				& .table-inverse th,
				.table-inverse td,
				.table-inverse thead th {
				    border-color: #32383e
				}
				
				& .table-inverse.table-bordered {
				    border: 0
				}
				
				& .table-inverse.table-striped tbody tr:nth-of-type(odd) {
				    background-color: rgba(255, 255, 255, 0.05)
				}
				
				& .table-inverse.table-hover tbody tr:hover {
				    background-color: rgba(255, 255, 255, 0.075)
				}

				& .table-logo {
				    height: 20px;
				    float: right;
				    margin-bottom:10px;
				}

				& .break-before{
					page-break-before:always;
				}

				`}>
				
				
						{this.table(dataSet,i)}

				</InlineCss>

						)
				})
			)


	}


	table(dataSetArray,i){
		if(i === 0){
			return(
				<div>
				<div><img alt="logo" src="logo.svg" className="table-logo"/></div>
				<table className="table table-striped">
						<thead className = "thead-default">
							<tr>
								{this.initialTableHeadings()}
								{this.tableHeadings()}
							</tr>
						</thead>
						<tbody>
							{this.tableRow(dataSetArray)}
						</tbody>
				</table>
				</div>
			)
		} else {
			return(
				<div className = "break-before">
				<div><img alt="logo" src="logo.svg" className="table-logo"/></div>
				<table className="table table-striped">
						<thead className = "thead-default">
							<tr>
								{this.initialTableHeadings()}
								{this.tableHeadings()}
							</tr>
						</thead>
						<tbody>
							{this.tableRow(dataSetArray)}
						</tbody>
				</table>
				</div>
			)
		}
	}


	tableRow(dataSet){
		if(dataSet instanceof Array){

			return dataSet.map((dataSetItem, i)=>{
				return (
					<AuthorityCoverageRow key = {i} selectedSegmentList = {this.props.selectedContentSegments} shortName = {dataSetItem.shortName} 
					countryCode = {dataSetItem.countryCode} dataSet = {dataSetItem} showGoodCoverageYear = {this.props.showGoodCoverageYear} />
					)
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
				<div>
					{this.tables()}
				</div>
			 )
		} else {
			return null;
		}
	}
}

export default AuthorityCoveragePdf;