const { executeWappalyzer } = require('../dist/index');
const { expect } = require('chai');

const URL = 'http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/test/';

describe('Wappalyzer', function() {
  it('should execute', async function() {
    const results = await executeWappalyzer(URL);
    expect(Object.keys(results)).to.be.an('array').and.to.include('result');
  }); 
});