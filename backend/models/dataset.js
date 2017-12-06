const mongoose = require('mongoose');
const bluebird = require('bluebird');
const Schema   = mongoose.Schema;
mongoose.Promise = bluebird;

var DataYearSchema = new Schema({
	year: Number,
	count:{
		type: Number,
		defualt: 0
	},
	total:{
		type: Number,
		defualt: 0
	}
})

var SegmentSchema = new Schema({
	segmentType: {
		type: String,
		enum: [ 'Biblio',
                'Abstract',
                'Claims',
                'Description',
                'Abstract Image',
                'PDF',
                'Citations',
               	'Families',
                'Legal Data',
                'Legal Status' ],
        default:'Biblio'
	},
	dataYears: [DataYearSchema],
	coverageStart: Number,
	goodCoverageStart:Number
})

var DataSetSchema = new Schema({
	countryCode:{
		type:String,
		required: true
	},
	dataSetType: {
		type: String,
		default: 'Patents',
		enum: ['Patents','Utility Models', 'Designs']
		},
	pubType:{
		type: String,
		enum: ['Applications','Grants','Registrations'],
		default: 'Grants'
	},
	contentSegments: [SegmentSchema],
})


module.exports = mongoose.model('DataSet', DataSetSchema);