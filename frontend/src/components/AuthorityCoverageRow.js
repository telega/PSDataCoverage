import React, { Component } from 'react';

const findSegmentByType = (segmentType)=>{
	return (element)=>{
		return element.segmentType === segmentType;
	}
}

const findSegmentByHeading = (heading) => {
	return (element)=>{
		return element.heading === heading;
	}
}



class AuthorityCoverageRow extends Component{
	
	// constructor(props){
	// 	super(props);
	// }

	isVisible(segmentType){
		let segment = this.props.selectedSegmentList.find(findSegmentByHeading(segmentType));
		return segment.active;
	}

	getSegment(segmentType){

		if(this.isVisible(segmentType)){
			let contentSegment = this.props.dataSet.contentSegments.find(findSegmentByType(segmentType));
			
			let coverageStartString = ''
	
			if(contentSegment.coverageStart === null){
				coverageStartString = '-'
			} else {
				coverageStartString = 'from ' + contentSegment.coverageStart;
			}
	
			let goodCoverageStartString = '';
	
			let goodCoverage = false;
	
			//if(contentSegment.coverageStart != contentSegment.goodCoverageStart){
				if(contentSegment.goodCoverageStart === null){
					goodCoverageStartString = 'coverage below 60%'
				} else {
					goodCoverage = true;
					goodCoverageStartString= 'good coverage from '  + contentSegment.goodCoverageStart;
				}
			
			//}
	
			if(this.props.showGoodCoverageYear){
				if( goodCoverage ){
					return(
						<td className="no-break"><div className="no-break">
					 		{coverageStartString}<hr />
					 	<div className="no-break">{goodCoverageStartString}</div>
						</div></td>
					)
				} else {
						return(
						<td className="no-break"><div className='no-break'>
					 		{coverageStartString}<hr />
					 		<div className = 'text-danger no-break'>{goodCoverageStartString}</div>
						</div>
						</td>
					)
		
				}
			} else {
				return(
					<td className="no-break" ><div className="no-break">
						{coverageStartString}
					</div></td>
					)
			}

		} else {
			return null;
		}

	}

	makeRow(){
		return(
			<tr>
				<td>
 					<div className="no-break">{this.props.shortName}<br/>( {this.props.countryCode} ) </div>
				</td>
				<td>
					<div className="no-break">{this.props.dataSet.dataSetType}</div>
				</td>
				<td>
					<div className="no-break">{this.props.dataSet.pubType}</div>
				</td>
				
					{this.getSegment('Biblio')}
			
					{this.getSegment('Abstract')}
			
					{this.getSegment('Claims')}
				
					{this.getSegment('Description')}
			
					{this.getSegment('PDF')}
				
					{this.getSegment('Citations')}
				
					{this.getSegment('Families')}
				
					{this.getSegment('Legal Data')}
			
					{this.getSegment('Legal Status')}
				

			</tr>
			)
	}

	render(){
		return(
			this.makeRow()
			)
	}
}

export default AuthorityCoverageRow;