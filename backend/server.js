require('dotenv').config();
const mongoose = require('mongoose');
const bluebird = require('bluebird');
const DataSet = require('./models/dataset');
const Authority = require('./models/authority');
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');
const pdf = require('html-pdf')
const fs = require('fs');

const cors = corsMiddleware({
	origins: ['*']
  	//allowHeaders: ['API-Token'],
  	//exposeHeaders: ['API-Token-Expiry']
})

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

const server = restify.createServer();


server.pre(cors.preflight);
server.use(cors.actual);
server.use(restify.plugins.bodyParser());

// helpers 

const getBase64String = (path) => {
  const file = fs.readFileSync(path);
    return new Buffer(file).toString('base64');
 };

const generatePDF = (html, fileName) =>{
 
    return new Promise((resolve, reject) => {
    	pdf.create(html, {
      		format: 'A4',
      		orientation: 'landscape',
      		border: { top: '0.5cm', right: '0.5cm', bottom: '0.5cm', left: '0.5cm' },
    		})
    		.toFile('./tmp/' + fileName , (error, response) => {
      			if (error) {
        			reject(error);
      			} else {
      				resolve( getBase64String(response.filename) );
      				//fs.unlink(response.filename);
      			}
    	});
    });
};

// const getComponentAsHTML = (component, props) => {
//   try {
//     return ReactDOMServer.renderToStaticMarkup(component(props));
//   } catch (exception) {
//     console.log(exception);
//   }
// };

// const handler = ({ component, props, fileName }, promise) => {
//   module = promise;
//   const html = getComponentAsHTML(component, props);
//   if (html && fileName) generatePDF(html, fileName);
// };

// export const generateComponentAsPDF = (options) => {
//   return new Promise((resolve, reject) => {
//     return handler(options, { resolve, reject });
//   });
// };



// ------ controllers

function getPDF(req,res,next){
	let htmlTable = req.body.htmlTable; 
	console.log(htmlTable);
	//console.log(htmlTable);
	generatePDF(htmlTable, 'test.pdf').then((pdf)=>{
	//console.log(pdf);
	res.send(200,{pdf});
	//res.send(200,pdf);
	next();
	})
}


function getAllAuthorities(req,res,next){
	
	Authority.find({}).sort({'shortName':1}).exec()
		.then((authorities)=>{

			let authorityList = [];

			authorities.forEach((authority)=>{
				if(authority.dataSets.length > 0){	
					authorityList.push({
						name: authority.name,
						shortName:authority.shortName,
						countryCode: authority.code,
						id:authority._id
					})
				}	
			
			})

			return authorityList;
		})
		.then((authorityList)=>{
			res.charSet('utf-8');
			res.json({authorityList:authorityList});
			next();
			})
		.catch((err)=>{console.log(err)});

}

function getAuthorityByRegion(req,res,next){
	
	Authority.find({'region': req.params.region}).sort({'shortName': 1}).exec()
		.then((authorities)=>{

			let authorityList = [];

			
				authorities.forEach((authority)=>{
					if(authority.dataSets.length > 0){
						authorityList.push({
							name: authority.name,
							shortName:authority.shortName,
							countryCode: authority.code,
							id:authority._id
						})
					}
				})
			
			return authorityList;
		})
		.then((authorityList)=>{
			res.charSet('utf-8');
			res.json({authorityList:authorityList});
			next();
			})
		.catch((err)=>{console.log(err)});

}

function getDataSetByAuthorities(req,res,next){
	// eg Brazil 5a26a385e686190aba2c91b5 Portugal 5a26a385e686190aba2c9173
	let idList = req.body.authorityIdList.map((e)=>{
		return mongoose.Types.ObjectId(e);
	})

	Authority.find({_id: idList}).populate('dataSets').exec()
		.then((authorities)=>{
			let countriesDataSetList = [];
			
			authorities.forEach((authority)=>{
	
				let dataSets = [];

				authority.dataSets.forEach((ds)=>{
					let contentSegments = [];
					ds.contentSegments.forEach((cs)=>{
						contentSegments.push({
							segmentType: cs.segmentType,
							goodCoverageStart: cs.goodCoverageStart,
							coverageStart: cs.coverageStart
						})
					})
					dataSets.push({
						dataSetType: ds.dataSetType,
						pubType: ds.pubType,	
						contentSegments: contentSegments
					})
										
				})

				countriesDataSetList.push({
					shortName: authority.name,
					countryCode: authority.code,
					dataSets: dataSets			
				})
			})

			return countriesDataSetList;
		})
		.then((countriesDataSetList)=>{
			res.charSet('utf-8');
			res.json({dataSetList: countriesDataSetList});
			next();
		})
		.catch((err)=>{
			console.log(err)
		})

}

function getDataSetByAuthority(req,res,next){
	// eg Brazil 5a26a385e686190aba2c91b5
	Authority.findOne({_id: req.params.authority_id}).populate('dataSets').exec()
	.then((authority)=>{
		let dataSetList = [];

		authority.dataSets.forEach((ds)=>{
			let contentSegments = [];
			ds.contentSegments.forEach((cs)=>{
				contentSegments.push({
					segmentType: cs.segmentType,
					goodCoverageStart: cs.goodCoverageStart,
					coverageStart: cs.coverageStart
				})
			})
			
			dataSetList.push({
				shortName: authority.name,
				countryCode: authority.code,
				dataSetType: ds.dataSetType,
				pubType: ds.pubType,	
				contentSegments: contentSegments			
			})
		})

		return dataSetList;
	})
	.then((dataSetList)=>{
		res.charSet('utf-8');
		res.json({dataSetList: dataSetList});
		next();
	})
	.catch((err)=>{console.log(err)});
}


// ------


// ------ routes


server.get('/region/all', getAllAuthorities);
server.get('/region/:region', getAuthorityByRegion);
server.get('/authority/:authority_id', getDataSetByAuthority);
server.post('/authority', getDataSetByAuthorities);
server.post('/pdf', getPDF);
// ------

server.listen(8080,function(){
	console.log('%s  listening %s', server.name, server.url);
})