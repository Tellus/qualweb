const { executeWappalyzer } = require('../dist/index');
const { expect } = require('chai');

const URL = 'https://ciencias.ulisboa.pt/';

describe('Wappalyzer', function() {
  it('should execute', async function() {
    this.timeout(0);

    const results = await executeWappalyzer(URL);
    console.log(JSON.stringify(results, null, 2));
    expect(Object.keys(results)).to.be.an('array').and.to.include('result');
  }); 
});