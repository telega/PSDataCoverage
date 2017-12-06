require('dotenv').config();
const Authority = require('../models/authority');
const DataSet = require('../models/dataset');
const mongoose = require('mongoose');
const bluebird = require('bluebird');
const colors = require('colors');
const program = require('commander')
const fs = require('fs');
const util = require('util');
const stream = require('stream');
//const es = require('event-stream');
const parse = require('csv-parse');
const transform = require('stream-transform');
const async = require('async');
const csv = require('fast-csv');

var dbUrl;

if(process.env.NODE_ENV !=='test'){
	dbUrl =  process.env.DB_URL;
} else {
	dbUrl = process.env.TEST_DB;
}

mongoose.promise = bluebird;
mongoose.connect(dbUrl, {
	useMongoClient:true
});

const titleCase = (str)=> {  
  str = str.toLowerCase().split(' ');

  for(var i = 0; i < str.length; i++){
    str[i] = str[i].split('');
    str[i][0] = str[i][0].toUpperCase(); 
    str[i] = str[i].join('');
  }
  return str.join(' ');
}

const makeCoverageObject = (o)=>{
	console.log(colors.blue('Making Object from CSV data...' + o.country + ' ('+ o.pbdt +')'))

	let coverage = {};

	if(!o.pbdt){
		coverage =  null;
	
	} else {

		coverage.year = parseInt(o.pbdt);
	 	coverage.biblioCount = o.patent_biblio;
		coverage.abstractCount = o.patent_abstract;
		coverage.claimsCount = o.patent_claim;
		coverage.descriptionCount = o.patent_description;
		coverage.pdfCount = o.patent_pdf;
		coverage.legalDataCount = o.legal_data;
		coverage.legalStatusCount = o.legal_status;
		coverage.familiesCount = o.patent_family;
		coverage.citationCount = o.patent_citation;
	 	coverage.countryCode = o.country;
	 	coverage.totalCount = o.patent_biblio;
	 	coverage.setType = '';
	 	coverage.pubType = '';
	 	coverage.patentTypeCode = o.patent_type.substr(2,3);
	 			
	 	if(coverage.patentTypeCode == 'A'){
	 		coverage.setType = 'Patents';
	 		coverage.pubType = 'Applications';
	 	}
	 	if(coverage.patentTypeCode == 'B'){
	 		coverage.setType = 'Patents';
	 		coverage.pubType = 'Grants';
	 	}
	 	if(coverage.patentTypeCode == 'D'){
	 		coverage.setType = 'Designs';
	 		coverage.pubType = 'Registrations';
	 	}
	 	if(coverage.patentTypeCode == 'U'){
	 		coverage.setType = 'Utility Models';
	 		coverage.pubType = 'Registrations';
	 	}

	 	let biblioDataYear ={
	 		year:  parseInt(coverage.year),
	 		count: parseInt(coverage.biblioCount),
	 		total: parseInt(coverage.totalCount) 
	 	}
	 	let abstractDataYear ={
	 		year:  parseInt(coverage.year),
	 		count: parseInt(coverage.abstractCount),
	 		total: parseInt(coverage.totalCount) 
	 	}

	 	let claimsDataYear ={
	 		year:  parseInt(coverage.year),
	 		count: parseInt(coverage.claimsCount),
	 		total: parseInt(coverage.totalCount) 
	 	}
	 	let descriptionDataYear ={
	 		year:  parseInt(coverage.year),
	 		count: parseInt(coverage.descriptionCount),
	 		total: parseInt(coverage.totalCount) 
	 	}

	 	let pdfDataYear ={
	 		year:  parseInt(coverage.year),
	 		count: parseInt(coverage.pdfCount),
	 		total: parseInt(coverage.totalCount)
	 	} 
	 	
		let citationsDataYear ={
	 		year:  parseInt(coverage.year),
	 		count: parseInt(coverage.citationCount),
	 		total: parseInt(coverage.totalCount)
	 	} 
	 	
		let familiesDataYear ={
	 		year:  parseInt(coverage.year),
	 		count: parseInt(coverage.familiesCount),
	 		total: parseInt(coverage.totalCount)
	 	} 
	 	
		let legalDataDataYear ={
	 		year:  parseInt(coverage.year),
	 		count: parseInt(coverage.legalDataCount),
	 		total: parseInt(coverage.totalCount)
	 	} 
	 	
		let legalStatusDataYear ={
	 		year:  parseInt(coverage.year),
	 		count: parseInt(coverage.legalStatusCount),
	 		total: parseInt(coverage.totalCount)
	 	}

	 	coverage.biblioDataYear			= biblioDataYear;
	 	coverage.abstractDataYear 		= abstractDataYear;
	 	coverage.claimsDataYear 		= claimsDataYear;
	 	coverage.descriptionDataYear 	= descriptionDataYear;
	 	coverage.pdfDataYear			= pdfDataYear;
		coverage.citationsDataYear 		= citationsDataYear;
		coverage.familiesDataYear 		= familiesDataYear;
		coverage.legalDataDataYear 		= legalDataDataYear;
		coverage.legalStatusDataYear 	= legalStatusDataYear;
	 	
	}
	 	
	return coverage;
}


const findSegmentByType = (segmentType)=>{
	return (element)=>{
		return element.segmentType == segmentType;
	}
}



const makeNewSegment = (type, year, dataYear) => {

	let newSegment = {	
	 	segmentType			: type,
	 	coverageStart 		: year,
	 	goodCoverageStart	: year,
	 	dataYears			: [ dataYear ]
	 };

	 return newSegment;
}

const processDataCoverage = (coverageFile)=>{
	console.log(colors.green('Processing Coverage File: ' + coverageFile));

	var csvstream = csv.fromPath(coverageFile, {headers:true})
  	.on("data", function(o){
   		console.log(colors.cyan('pausing..'))
   		csvstream.pause();
   		let coverage = makeCoverageObject(o);
   		if(!coverage){
   			console.log(colors.magenta('No year. Skipping...'));
   			console.log(colors.yellow('resuming..'));
   			csvstream.resume();
   		} else {
   			DataSet.findOne({'countryCode': coverage.countryCode, 'dataSetType': coverage.setType, 'pubType': coverage.pubType }).exec()
   				.then((ds)=>{
   					
   					if(ds){

   						let contentSegments = ds.contentSegments;

						let biblioSegment 		= contentSegments.find(findSegmentByType('Biblio'));
						let abstractSegment 	= contentSegments.find(findSegmentByType('Abstract'));
						let claimsSegment 		= contentSegments.find(findSegmentByType('Claims'));
						let descriptionSegment 	= contentSegments.find(findSegmentByType('Description'));
						let pdfSegment 			= contentSegments.find(findSegmentByType('PDF'));
						let citationsSegment 	= contentSegments.find(findSegmentByType('Citations'));
						let familiesSegment 	= contentSegments.find(findSegmentByType('Families'));
						let legalDataSegment 	= contentSegments.find(findSegmentByType('Legal Data'));
						let legalStatusSegment 	= contentSegments.find(findSegmentByType('Legal Status'));

						
						if(biblioSegment){
							if(biblioSegment.dataYears.find((element)=>{return element.year == coverage.year;} )){
								console.log(colors.cyan('Data Year Exists'))
							}else{
								console.log(colors.yellow('Adding Data Year: ' + coverage.year));
								biblioSegment.dataYears.push(coverage.biblioDataYear);	
							}
						} else {
	 						ds.contentSegments.push(makeNewSegment('Biblio', coverage.year, coverage.biblioDataYear));
						}
							
						if(abstractSegment){		
							if(abstractSegment.dataYears.find((element)=>{return element.year == coverage.year;} )){
								//console.log(colors.cyan('Data Year Exists'))
							}else{
								//console.log(colors.yellow('Adding Data Year: ' + coverage.year));
								abstractSegment.dataYears.push(coverage.abstractDataYear);
							}
						}else {
							ds.contentSegments.push(makeNewSegment('Abstract', coverage.year, coverage.abstractDataYear));
						}											
								
						if(claimsSegment){
							if(claimsSegment.dataYears.find((element)=>{return element.year == coverage.year;} )){
								//console.log(colors.cyan('Data Year Exists'))
							}else{
								//console.log(colors.yellow('Adding Data Year: ' + coverage.year));
								claimsSegment.dataYears.push(coverage.claimsDataYear);	
							}
						}else{
							ds.contentSegments.push(makeNewSegment('Claims',coverage.year,coverage.claimsDataYear))
						}

						if(descriptionSegment){
							if(descriptionSegment.dataYears.find((element)=>{return element.year == coverage.year;} )){
								//console.log(colors.cyan('Data Year Exists'))
							}else{
								//console.log(colors.yellow('Adding Data Year: ' + coverage.year));
								descriptionSegment.dataYears.push(coverage.descriptionDataYear); 
							}
						}else{
							ds.contentSegments.push(makeNewSegment('Description', coverage.year, coverage.descriptionDataYear));
						}
							
						if(pdfSegment){	
							if(pdfSegment.dataYears.find((element)=>{return element.year == coverage.year;} )){
								//console.log(colors.cyan('Data Year Exists'))
							}else{
								//console.log(colors.yellow('Adding Data Year: ' + coverage.year));
								pdfSegment.dataYears.push(coverage.pdfDataYear);	
							}
						} else {
							ds.contentSegments.push(makeNewSegment('PDF', coverage.year, coverage.pdfDataYear));
						}

						if(citationsSegment){
							
							if(citationsSegment.dataYears.find((element)=>{return element.year == coverage.year;} )){
								//console.log(colors.cyan('Data Year Exists'))
							}else{
								//console.log(colors.yellow('Adding Data Year: ' + coverage.year));
								citationsSegment.dataYears.push(coverage.citationsDataYear);	
							}
						}else{
							ds.contentSegments.push(makeNewSegment('Citations', coverage.year, coverage.citationsDataYear));
						}

						if(familiesSegment){
							
							if(familiesSegment.dataYears.find((element)=>{return element.year == coverage.year;} )){
								//console.log(colors.cyan('Data Year Exists'))
							}else{
								//console.log(colors.yellow('Adding Data Year: ' + coverage.year));
								familiesSegment.dataYears.push(coverage.familiesDataYear);
							}

						}else{
							ds.contentSegments.push(makeNewSegment('Families', coverage.year, coverage.familiesDataYear));
						}

						if(legalDataSegment){
							
							if(legalDataSegment.dataYears.find((element)=>{return element.year == coverage.year;} )){
								//console.log(colors.cyan('Data Year Exists'))
							}else{
								//console.log(colors.yellow('Adding Data Year: ' + coverage.year));
								legalDataSegment.dataYears.push(coverage.legalDataDataYear);	
							}
						} else {
							ds.contentSegments.push(makeNewSegment('Legal Data', coverage.year, coverage.legalDataDataYear));
						}

						if(legalStatusSegment){
							
							if(legalStatusSegment.dataYears	.find((element)=>{return element.year == coverage.year;} )){
								//console.log(colors.cyan('Data Year Exists'))
							}else{
								//console.log(colors.yellow('Adding Data Year: ' + coverage.year));
								legalStatusSegment.dataYears.push(coverage.legalStatusDataYear); 
							}
						} else {
							ds.contentSegments.push(makeNewSegment('Legal Status', coverage.year, coverage.legalStatusDataYear));
						}


   						return ds.save();
   					} else {

   						console.log(colors.red('No data set found'))
						console.log(colors.blue('Creating data for year: ' + coverage.year + ' country:' + coverage.countryCode));

   						newDs = new DataSet();

   						newDs.dataSetType = coverage.setType;
						newDs.pubType = coverage.pubType;
						newDs.countryCode = coverage.countryCode;

	 					newDs.contentSegments = []
	 					newDs.contentSegments.push(
	 						makeNewSegment('Biblio', coverage.year, coverage.biblioDataYear ),
	 						makeNewSegment('Abstract', coverage.year, coverage.abstractDataYear ),
	 						makeNewSegment('Claims', coverage.year, coverage.claimsDataYear ),
	 						makeNewSegment('Description', coverage.year, coverage.descriptionDataYear ),
	 						makeNewSegment('PDF', coverage.year, coverage.pdfDataYear ),
	 						makeNewSegment('Citations', coverage.year, coverage.citationsDataYear ),
	 						makeNewSegment('Families', coverage.year, coverage.familiesDataYear ),
	 						makeNewSegment('Legal Data', coverage.year, coverage.legalDataDataYear ),
	 						makeNewSegment('Legal Status', coverage.year, coverage.legalStatusDataYear ),
	 						);
   						return newDs.save();
   					}

   				})
   				.then((ds)=>{
   					console.log(colors.yellow('resuming..'))
   					csvstream.resume();
   				})
   				.catch((err)=>{console.log(err)})
		}   
    
  })
  .on("end", function(data){
    console.log("End");
    //process.exit();
  });	 
};


const processCountries = (countryFile)=>{
	console.log(colors.green('Processing Country File: ' + countryFile));
	 fs.createReadStream(countryFile)
	 .pipe(
	 		parse({},function(err,output){
	 			output.forEach((o, i) =>{
	 				if( i > 0){
	 					let name = titleCase(o[0]);
	 					let shortName = titleCase(o[1]);
	 					let code = o[2];
	 					let authorityType = o[3];
	 					let region = o[4];
	 					if((region == null)||(region == '')){
	 					region = 'Other'
	 					}
	
	 					let newAuthority = new Authority();
	
	 					newAuthority.name = name;
	 					newAuthority.shortName = shortName;
	 					newAuthority.code = code;
	 					newAuthority.region = region;
	 					newAuthority.authorityType = authorityType;
	
	 					console.log(colors.blue('Adding authority: ' + shortName + '(' + code +')'));
	
	 					newAuthority.save((err)=>{
	 						if(err){
	 							console.log(err)
	 						}
	 					})
	 				}
	 			})	
		 	})
		)
		.on('error', (err)=>{
			console.log('error reading file', err);
		})
		.on('end', ()=>{
			console.log(colors.green('File End'));
			//process.exit();
		})
}

const updateSegmentYears = () =>{
	console.log(colors.green('updating segment years...'));

	DataSet.find({})
		.cursor()
		.eachAsync((ds)=>{

			ds.contentSegments.forEach((cs)=>{
				let coverageStart = cs.coverageStart;
				let goodCoverageStart =  0;

				cs.dataYears.forEach((dy)=>{
					if(dy.year < coverageStart){
						console.log(colors.blue('coverage year ' + dy.year + ' is earlier than ' + coverageStart ));
						coverageStart = dy.year;
					} 

					if( (dy.count/dy.total >= 0.6) && ( (dy.year < goodCoverageStart) || (goodCoverageStart == 0))){
						console.log(colors.cyan('good coverage year was ' + goodCoverageStart + ' is now ' + dy.year))
						goodCoverageStart = dy.year;
					}
				})

			});

			return ds.save();

		})
		.then(()=>{
			console.log(colors.red('Done'));
		})
		.catch((err)=>{
			console.log(err);
		})
}

updateAuthorities = () =>{
	console.log(colors.green('updating Authorities...'));

	DataSet.find({})
		.cursor()
		.eachAsync((ds)=>{

				// cf process_companies lines 29-56
			Authority.findOne({'code': ds.countryCode }).exec()
				.then((authority)=>{
					if(authority){
					console.log(authority.shortName)
					} else{
						console.log(colors.red(ds.countryCode))
					}
				
				})
				.catch((err)=>{console.log(err)});
				

		})
		.then(()=>{
			console.log(colors.red('Done'));
		})
		.catch((err)=>{
			console.log(err);
		})

}

program
	.version('1.0.0')
	.description('utility to process coverage csvs');

program.command('process <coverageFile>')
	.alias('p')
	.description('process coverage csv')
	.action((coverageFile)=>{
		processDataCoverage(coverageFile);
	});


program.command('countries <countryFile>')
	.alias('c')
	.description('process country list csv')
	.action((countryFile)=>{
		 processCountries(countryFile);
	});

program.command('authorities')
	.alias('a')
	.description('update authorities by creating links to coverage information')
	.action(()=>{
		updateAuthorities();
	});	

program.command('update')
	.alias('u')
	.description('update segment years - when does [good] coverage start')
	.action(()=>{
		updateSegmentYears();
	});

 program.parse(process.argv);