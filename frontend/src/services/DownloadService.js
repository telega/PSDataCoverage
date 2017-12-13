import axios from 'axios';
import pdf from 'html-pdf';
import {base64ToBlob} from '../modules/base64-to-blob'

class DownloadService{

	 getPdf(html){

	 	console.log(html);

		 return axios({
		 	method: 'post',
		 	url: 'http://localhost:8080/pdf',
		 	data: {
		 		 htmlTable:html
		 	}
		 	})
			.then((response)=>{
				console.log(response)
				console.log('type' + typeof(response.data.pdf))
				return response.data.pdf;
			})
			.catch((err)=>{console.log(err)})
	};

}

export default DownloadService;