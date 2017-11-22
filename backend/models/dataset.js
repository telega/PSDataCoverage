const mongoose = require('mongoose');
const bluebird = require('bluebird');
const Schema   = mongoose.Schema;
mongoose.Promise = bluebird;

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
        default: 'Biblio'
	}
	count: {
		type: Number,
		default: 0
	}
})

var DataYearSchema = new Schema({
	year: Number,
	contentSegments: [SegmentSchema]
})

var DataSetSchema = new Schema({
	setType: {
		type: String,
		default: 'Patents',
		enum: ['Patents','Utility Models', 'Designs']
		},
	pubType:{
		type: String,
		enum: ['Applications','Grants','Registrations'],
		default: 'Grants'
	},
	dataSets: [
		{
			type: mongoose.Schema.Types.ObjectId,
            ref: 'DataSets'
		}
	],
	coverageStarts: Number,
	goodCoverageStarts: Number
})


module.exports = mongoose.model('DataSet', DataSetSchema);