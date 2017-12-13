import axios from 'axios';

class RegionService{

	 getDataSetsByIds(authorityIdList){

		 return axios({
		 	method: 'post',
		 	url: 'http://localhost:8080/authority',
		 	data: {
		 		authorityIdList:authorityIdList
		 	}
		 	})
			.then((response)=>{
				return response.data.dataSetList;
			})
			.catch((err)=>{console.log(err)})
	};
}

export default RegionService;