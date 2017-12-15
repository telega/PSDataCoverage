import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import RegionService from '../services/RegionService';
import AuthorityService from '../services/AuthorityService';
import DownloadService from '../services/DownloadService';
import AuthoritySelectList from './AuthoritySelectList';
import RegionSelectButton from './RegionSelectButton';
import AuthorityCoverageTable from './AuthorityCoverageTable';
import AuthorityCoveragePdf from './AuthorityCoveragePdf';
//import pdf from 'html-pdf';
import {base64ToBlob} from '../modules/base64-to-blob'
import fileSaver from 'file-saver';

const findAuthById = (id) => {
	return (element)=>{
		return element.id === id;
	}
}

const findSegmentByHeading = (heading) => {
	return (element)=>{
		return element.heading === heading;
	}
}

const filterById = (id)=>{
	return(elem) =>{
  		return elem.id !== id;
  }
}

class SavePdfButton extends Component{
	render(){
		if( (this.props.dataSetList instanceof Array) && (this.props.dataSetList.length > 0) ){
			return(
				<div className = 'row'>
						<div className = 'col-md-11'></div>
						<div className = 'col-md-1'>
							<button className = 'btn btn-primary' onClick = {this.props.savePDF} ><span className="fa fa-download"></span> PDF</button>
						</div>
				</div>
			)
		} else {
			return null;
		}
	}	

}

class ContentSegmentButton extends Component {
	render(){
		if( this.props.active ){
		return(
			<button onClick = {() => this.props.clicked(this.props.heading)} className = 'btn btn-sm btn-primary ml-1 mb-1 active'>{this.props.heading}</button>
			)
		} else {
			return(
				<button onClick = {() => this.props.clicked(this.props.heading)} className = 'btn btn-sm btn-primary ml-1 mb-1 '>{this.props.heading}</button>
			)
		} 
	}
}

class SelectedAuthority extends Component{
	render(){
		return(
			<button onClick = {() => this.props.clicked(this.props.authority) } className = 'btn btn-danger ml-1 mb-1'><span className="fa fa-times"></span> {this.props.authority.shortName}</button>
		)
	}
}

class DataCoverageWidget extends Component{
	
	constructor(props){
		super(props);

		this.state = {
			authorityList: '',
			dataSetList: '',
			selectedRegion: 'All',
			selectedAuthorities: [], 
			selectedContentSegments : [ 
				{ heading: 'Biblio', 	 	active: true  },
				{ heading: 'Abstract', 	 	active: true  },
				{ heading: 'Claims', 	 	active: false  },
				{ heading: 'Description',  	active: false  },
				{ heading: 'PDF',  		 	active: false  },
				{ heading: 'Citations', 	active: false  },
				{ heading: 'Families',  	active: false  },
				{ heading: 'Legal Data', 	active: false  },
				{ heading: 'Legal Status',  active: false  }
			]			
		};

		//this.addRegionService = new RegionService();
		this.getRegionAuthorities = this.getRegionAuthorities.bind(this);
		this.getAuthorityDataSets = this.getAuthorityDataSets.bind(this);
		this.getAllAuthorities = this.getAllAuthorities.bind(this);
		this.savePDF = this.savePDF.bind(this)
		this.addAuthorityToSelected = this.addAuthorityToSelected.bind(this);
		this.removeAuthorityFromSelected = this.removeAuthorityFromSelected.bind(this);
		this.currentSelection = this.currentSelection.bind(this);
		this.toggleSelectedContentSegment = this.toggleSelectedContentSegment.bind(this);
	}

	componentDidMount(){
		this.getAllAuthorities();
	}

	getRegionAuthorities(region){
		let rs = new RegionService();
		rs.getRegion(region)
			.then((authorityList)=>{
				this.setState({
					authorityList: authorityList,
					selectedRegion: region
				});
			})
	}

	getAllAuthorities(){
		let rs = new RegionService();
		rs.getAllRegions()
			.then((authorityList)=>{
				this.setState({authorityList: authorityList});
			});
	}

	getAuthorityDataSets(){
		
		let auService = new AuthorityService();
		let authorityIdList = this.state.selectedAuthorities.map((a)=>{ return a.id });
		auService.getDataSetsByIds( authorityIdList)
			.then((dataSetList)=>{
					this.setState({dataSetList: dataSetList});
				}); 	
	}

	addAuthorityToSelected(authority){
		let newSelectedAuthorities = this.state.selectedAuthorities;
		if(! this.state.selectedAuthorities.find(findAuthById(authority.id)) ){
			newSelectedAuthorities.push(authority);
		}
		this.setState({selectedAuthorities: newSelectedAuthorities}, ()=>{ this.getAuthorityDataSets() });
		
	}

	removeAuthorityFromSelected(authority){
		let newSelectedAuthorities = this.state.selectedAuthorities.filter(filterById(authority.id));
		this.setState({selectedAuthorities: newSelectedAuthorities}, ()=>{	this.getAuthorityDataSets() } );
	}

	regionList(){
		return this.props.regionList.map((region,i)=>{
			return(
				<RegionSelectButton key={i} selectedRegion = {this.state.selectedRegion} regionName={region} getAuthority = {this.getRegionAuthorities}/>
				)
		})
	}

	toggleSelectedContentSegment(heading){
		let newSelectedContentSegments = this.state.selectedContentSegments;
		let segment = this.state.selectedContentSegments.findIndex(findSegmentByHeading(heading));
		newSelectedContentSegments[segment].active = ! newSelectedContentSegments[segment].active;
		this.setState({selectedContentSegments: newSelectedContentSegments});
	}

	contentSegmentList(){
		return this.props.contentSegmentList.map( (contentSegment, i)=>{
			let segment = this.state.selectedContentSegments.find(findSegmentByHeading(contentSegment));
			return(
				<ContentSegmentButton key = {i} active = {segment.active}  heading = {contentSegment} clicked = { this.toggleSelectedContentSegment }/>
				)
		})
	}

	currentSelection(){

		// let selectedAuthority = this.state.dataSetList.map((d)=>{return d.shortName;})

		if(this.state.selectedAuthorities.length === 0){
			return (
					<div className="text-secondary"> No Authority Selected </div>
				)

		} else {

			return this.state.selectedAuthorities.map((authority,i)=>{
				return(
					<SelectedAuthority key={i} clicked = {this.removeAuthorityFromSelected.bind(this)} authority={authority} />
					)
			})
		}
	}

	savePDF(){
		let ds = new DownloadService();
		let x = ReactDOMServer.renderToStaticMarkup(<AuthorityCoveragePdf dataSetList={this.state.dataSetList} selectedContentSegments ={this.state.selectedContentSegments} />);
		
		ds.getPdf(x).then((response)=>{

			let pdfBlob = base64ToBlob(response);
			fileSaver.saveAs(pdfBlob,'test.pdf');
		});
		
	}

	render(){
		return(
			<div>
				<div className = "row">
					<div className="col-md-12 mb-2">
						<h3><span className="fa fa-globe"></span> Select Region</h3>
						{this.regionList()}
					</div>
					
				</div>
				<div className = "row">
					<div className = 'col-md-3'>
						<h4>Current Selection</h4>
						{this.currentSelection()}
						<h4>Select Authorities</h4>
						<AuthoritySelectList listClicked = {this.addAuthorityToSelected} authorityList={this.state.authorityList} />
					</div>
					<div className = 'col-md-9'>
					<div className = "col-md-12 mb-2">
						<h5><span className="fa fa-table"></span> Select Content Segments</h5>
						{this.contentSegmentList()}
					</div>
						<AuthorityCoverageTable dataSetList={this.state.dataSetList} selectedContentSegments ={this.state.selectedContentSegments} />
						<SavePdfButton savePDF = {this.savePDF} dataSetList = {this.state.dataSetList} />
					</div>
				</div>
				
			</div>
			)
	}
}

DataCoverageWidget.defaultProps = {
	regionList: [
		'All',
		'Africa',
		//'Antarctica', 
		'Asia', 
		'Caribbean', 
		'Europe', 
		'Middle East', 
		'North America',
		'Oceania', 
		'Other', 
		'South America' 
	],
	contentSegmentList: [
		'Biblio', 	 
		'Abstract', 	 
		'Claims', 	 
		'Description', 
		'PDF',  		 
		'Citations', 	
		'Families',  	
		'Legal Data', 
		'Legal Status',
	]
}
export default DataCoverageWidget;