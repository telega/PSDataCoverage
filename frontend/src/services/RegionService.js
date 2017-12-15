import axios from 'axios';

class RegionService{

	 getAllRegions(){
		 return axios.get('http://localhost:8080/region/all')
			.then((response)=>{
				return response.data.authorityList;
			})
			.catch((err)=>{console.log(err)})
	};

	 getRegion(region){

	 	if(region === 'All'){
	 		return this.getAllRegions();
	 	} else {
			return axios.get('http://localhost:8080/region/'+region)
				.then((response)=>{
					return response.data.authorityList;
				})
				.catch((err)=>{console.log(err)})
		}
	}

}

export default RegionService;