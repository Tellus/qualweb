import { JSDOM } from 'jsdom';
import { QWElement } from '@qualweb/qw-element';
import { expect } from 'chai';
import sinon from 'sinon';

// Direct import of function, since it's not exported.
import textHasTheSameColorOfBackground from '../../src/domUtils/textHasTheSameColorOfBackground'

describe('testHasTheSameColorOfBackground', () => {
  let dom = new JSDOM();

  // Re-initialize JSDOM between tests.
  beforeEach(() => {
    dom = new JSDOM();
  });

  it('should return true if text exists and has the same color as the background', () => {
    const htmlElement = dom.window.document.createElement('div');
    const qwElement = new QWElement(htmlElement);

    sinon.stub(qwElement, 'getElementStyleProperty')
      .withArgs('color', '').returns('#000000')
      .withArgs('background-color', '').returns('#000000')
      ;
    sinon.stub(qwElement, 'getElementText')
      .returns('Sample text');
    
    const result = textHasTheSameColorOfBackground(qwElement);
    
    expect(result).to.be.true;
  });
  
  it('should return false if text exists and has a different color than the background', () => {
    const htmlElement = dom.window.document.createElement('div');

    const qwElement = new QWElement(htmlElement);
    sinon.stub(qwElement, 'getElementStyleProperty')
      .withArgs('color', '').returns('#000000')
      .withArgs('background-color', '').returns('#FFFFFF')
      ;
    sinon.stub(qwElement, 'getElementText')
      .returns('Sample text');
    
    const result = textHasTheSameColorOfBackground(qwElement);
    
    expect(result).to.be.false;
  });
  
  it('should return false if there is no text', () => {
    const htmlElement = dom.window.document.createElement('div');

    const qwElement = new QWElement(htmlElement);

    sinon.stub(qwElement, 'getElementStyleProperty')
      .withArgs('color', '').returns('#000000')
      .withArgs('background-color', '').returns('#000000')
      ;
    sinon.stub(qwElement, 'getElementText')
      .returns('');
    
    const result = textHasTheSameColorOfBackground(qwElement);
    
    expect(result).to.be.false;
  });
});