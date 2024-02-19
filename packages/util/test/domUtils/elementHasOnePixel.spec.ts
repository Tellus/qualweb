import elementHasOnePixel from '../../src/domUtils/elementHasOnePixel';

import { QWElement } from '@qualweb/qw-element';

import { JSDOM } from 'jsdom';
import { expect } from 'chai';
import sinon from 'sinon';

describe('elementHasOnePixel', () => {
// Return true if height is not undefined, and its value is exactly '1px' AND its parent's background is the same as its own background OR the own background is transparent  
  let dom: JSDOM;

  // All tests for the function will require a QWElement to pass to it, so
  // initializing it here seems DRY.
  let htmlElement: HTMLElement;
  let qwElement: QWElement;

  // elementHasOnePixel *requires* a parent for a true return value, and must
  // be present to test for non-parent-related tests. It makes sense to have one
  // prepared for every test, then.
  let parentHtmlElement: HTMLElement;
  let parentQwElement: QWElement;

  beforeEach(() => {
    dom = new JSDOM();

    htmlElement = dom.window.document.createElement('div');
    qwElement = new QWElement(htmlElement);

    parentHtmlElement = dom.window.document.createElement('div');
    parentQwElement = new QWElement(parentHtmlElement);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should return false if an element does not have a parent', () => {
    sinon.stub(qwElement, 'getElementStyleProperty')
      .throws('Unexpected parameter passed to getElementStyleProperty')
      .withArgs('height').returns('17px')
      .withArgs('background-color').returns('');
      ;
      
    sinon.stub(qwElement, 'getElementParent').returns(null);

    expect(elementHasOnePixel(qwElement)).to.be.false;
  });

  describe('Parent: transparent', () => {
    beforeEach(() => {
      sinon.stub(parentQwElement, 'getElementStyleProperty')
        .throws('Unexpected parameter passed to getElementStyleProperty')
        .withArgs('background-color').returns('transparent')
        ;

      sinon.stub(qwElement, 'getElementParent').returns(parentQwElement);
    });

    it('Should return true if an element reports a height of one pixel', () => {
      sinon.stub(qwElement, 'getElementStyleProperty')
        .throws('Unexpected parameter passed to getElementStyleProperty')
        .withArgs('height').returns('1px')
        .withArgs('background-color').returns('');
        ;
  
      expect(elementHasOnePixel(qwElement)).to.be.true;
    });
  
    it('Should return true if an element reports a height of one pixel with extraneous whitespaces', () => {
      sinon.stub(qwElement, 'getElementStyleProperty')
        .throws('Unexpected parameter passed to getElementStyleProperty')
        .withArgs('height').returns(' 1 px ')
        .withArgs('background-color').returns('');
        ;
  
      expect(elementHasOnePixel(qwElement)).to.be.true;
    });
  
    it('Should return false if an element does not report a height', () => {    
      sinon.stub(qwElement, 'getElementStyleProperty')
        .throws('Unexpected parameter passed to getElementStyleProperty')
        .withArgs('height').returns('')
        .withArgs('background-color').returns('');
        ;
  
      expect(elementHasOnePixel(qwElement)).to.be.false;
    });
  
    it('Should return false if an element reports a height of more than one pixel', () => {
      sinon.stub(qwElement, 'getElementStyleProperty')
        .throws('Unexpected parameter passed to getElementStyleProperty')
        .withArgs('height').returns('17px')
        .withArgs('background-color').returns('');
        ;
  
      expect(elementHasOnePixel(qwElement)).to.be.false;
    });
  });

  describe('Parent: same as test element', () => {
    const backgroundColor = 'white';

    beforeEach(() => {
      sinon.stub(parentQwElement, 'getElementStyleProperty')
        .throws('Unexpected parameter passed to getElementStyleProperty')
        .withArgs('background-color').returns(backgroundColor)
        ;

      sinon.stub(qwElement, 'getElementParent').returns(parentQwElement);
    });

    it('Should return true if an element reports a height of one pixel', () => {
      sinon.stub(qwElement, 'getElementStyleProperty')
        .throws('Unexpected parameter passed to getElementStyleProperty')
        .withArgs('height').returns('1px')
        .withArgs('background-color').returns(backgroundColor);
        ;
  
      expect(elementHasOnePixel(qwElement)).to.be.true;
    });
  
    it('Should return true if an element reports a height of one pixel with extraneous whitespaces', () => {
      sinon.stub(qwElement, 'getElementStyleProperty')
        .throws('Unexpected parameter passed to getElementStyleProperty')
        .withArgs('height').returns(' 1 px ')
        .withArgs('background-color').returns(backgroundColor);
        ;
  
      expect(elementHasOnePixel(qwElement)).to.be.true;
    });
  
    it('Should return false if an element does not report a height', () => {    
      sinon.stub(qwElement, 'getElementStyleProperty')
        .throws('Unexpected parameter passed to getElementStyleProperty')
        .withArgs('height').returns('')
        .withArgs('background-color').returns(backgroundColor);
        ;
  
      expect(elementHasOnePixel(qwElement)).to.be.false;
    });
  
    it('Should return false if an element reports a height of more than one pixel', () => {
      sinon.stub(qwElement, 'getElementStyleProperty')
        .throws('Unexpected parameter passed to getElementStyleProperty')
        .withArgs('height').returns('17px')
        .withArgs('background-color').returns(backgroundColor);
        ;
  
      expect(elementHasOnePixel(qwElement)).to.be.false;
    });
  });
});
