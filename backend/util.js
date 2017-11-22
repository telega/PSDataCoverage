require('dotenv').config();
const Authority = require('../models/authority');
const DataSet = require('../models/dataset')
const mongoose = require('mongoose');
const bluebird = require('bluebird');
const colors = require('colors');
const program = require('commander')
const fs = require('fs');
const util = require('util');
const stream = require('stream');
//const es = require('event-stream');
const parse = require('csv-parse');
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


const processDataCoverage = ()=>{
	console.log(dbUrl);
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

program
	.version('1.0.0')
	.description('utility to process coverage csvs');

program.command('process')
	.alias('p')
	.description('process coverage csv')
	.action(()=>{
		processDataCoverage();
	});

program.command('countries <countryFile>')
	.alias('c')
	.description('process country list csv')
	.action((countryFile)=>{
		 processCountries(countryFile);
	});

 program.parse(process.argv);