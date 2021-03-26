import { executeWappalyzer } from '../dist/index';
import { expect } from 'chai';

const URL = 'https://ciencias.ulisboa.pt/';

describe('Wappalyzer', function() {
  it('Should execute', async function() {
    this.timeout(0);

    const results = await executeWappalyzer(URL);
    console.log(JSON.stringify(results, null, 2));
    expect(Object.keys(results)).to.be.an('array').and.to.include('result');
  }); 
});