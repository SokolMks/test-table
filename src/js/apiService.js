export default class apiService{
  
  async fetchResult() {
    const url = 'https://itrex-react-lab-files.s3.eu-central-1.amazonaws.com/react-test-api.json'
    const request = await fetch(url);
    const response = await request.json();
    return response;
  }
}