const mongoose = require('mongoose');
const bluebird = require('bluebird');
const Schema   = mongoose.Schema;
mongoose.Promise = bluebird;

var AuthoritySchema = new Schema({
	name: {
		type: String,
		unique: true
		},
	code:{ 
		type: String,
		unique: true
	},
	shortName: String,
	region: {
		type: String,
		default: 'Other',
		enum: ['Africa', 'Antarctica', 'Asia', 'Caribbean', 'Europe', 'Middle East', 'North America' ,'Oceania', 'Other', 'South America' ]
	},
	authorityType:{
		type: String,
		enum: ['country','organisation'],
		default: 'country'
	},
	dataSets: [
		{
			type: mongoose.Schema.Types.ObjectId,
            ref: 'DataSet'
		}
	]
})

AuthoritySchema.index({shortName:'text'});

module.exports = mongoose.model('Authority', AuthoritySchema);