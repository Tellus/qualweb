import isElementHidden from '../../src/domUtils/isElementHidden';
import { QWElement } from '@qualweb/qw-element';
import DomUtils from '../../src/domUtils/domUtils';
import { expect } from 'chai';
import sinon from 'sinon';
import { JSDOM } from 'jsdom';

describe('isElementHidden', () => {
  /**
   * To stub:
   * - getElementTagName
   * - getElementAttribute('type')
   * - getElementAttribute('aria-hidden')
   * - getElementAttribute('hidden')
   * - isElementHiddenByCSSAux
   * - getElementParent
   * - isElementHidden (recursive)
   */

  /**
   * Outcomes:
   * - true if isElementHiddenByCSSAux returns true
   * - true if hidden attribute is set
   * - true if aria-hidden attribute is set
   * - true if the parent is hidden (recursive)
   * - true if the element is an input with type "hidden"
   * 
   * In order for one condition to be tested correctly, we must make sure that
   * all the others are false.
   */

  let dom: JSDOM;

  let htmlElement: HTMLElement;
  let qwElement: QWElement;

  beforeEach(() => {
    dom = new JSDOM();
    htmlElement = dom.window.document.createElement('div');
    qwElement = new QWElement(htmlElement);

    // @ts-expect-error: JSDOM and the expected type don't match perfectly.
    // They match enough for our purposes.
    global.window = dom.window;

    global.window.DomUtils = DomUtils;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should return false if the element is not hidden', () => {
    sinon.stub(global.window.DomUtils, 'isElementHiddenByCSSAux').returns(false); 

    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected parameter passed to getElementAttribute')
      .withArgs('hidden').returns(null)
      .withArgs('aria-hidden').returns(null)
      .withArgs('type').returns(null)
      ;

    sinon.stub(qwElement, 'getElementParent').returns(null);

    sinon.stub(qwElement, 'getElementTagName').returns('div');

    expect(isElementHidden(qwElement)).to.be.false;
  });

  it('Should return true if isElementHiddenByCSSAux returns true', () => {
    sinon.stub(global.window.DomUtils, 'isElementHiddenByCSSAux').returns(true); 

    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected parameter passed to getElementAttribute')
      .withArgs('hidden').returns(null)
      .withArgs('aria-hidden').returns(null)
      .withArgs('type').returns(null)
      ;

    sinon.stub(qwElement, 'getElementParent').returns(null);

    sinon.stub(qwElement, 'getElementTagName').returns('div');

    expect(isElementHidden(qwElement)).to.be.true;
  });

  it('Should return true if hidden attribute is set', () => {
    sinon.stub(global.window.DomUtils, 'isElementHiddenByCSSAux').returns(false); 

    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected parameter passed to getElementAttribute')
      .withArgs('hidden').returns('true')
      .withArgs('aria-hidden').returns(null)
      .withArgs('type').returns(null)
      ;

    sinon.stub(qwElement, 'getElementParent').returns(null);

    sinon.stub(qwElement, 'getElementTagName').returns('div');

    expect(isElementHidden(qwElement)).to.be.true;
  });

  it('Should return true if aria-hidden attribute is set', () => {
    sinon.stub(global.window.DomUtils, 'isElementHiddenByCSSAux').returns(false); 

    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected parameter passed to getElementAttribute')
      .withArgs('hidden').returns(null)
      .withArgs('aria-hidden').returns('true')
      .withArgs('type').returns(null)
      ;

    sinon.stub(qwElement, 'getElementParent').returns(null);

    sinon.stub(qwElement, 'getElementTagName').returns('div');

    expect(isElementHidden(qwElement)).to.be.true;
  });

  it('Should return true if the parent is hidden (recursive)', () => {
    sinon.stub(global.window.DomUtils, 'isElementHiddenByCSSAux').returns(false); 

    // isElementHidden references the DomUtils version of the function. It's
    // still just a recursion via a different name.
    sinon.stub(global.window.DomUtils, 'isElementHidden').returns(true);
    
    const parentHtmlElement = dom.window.document.createElement('div');
    const parentQwElement = new QWElement(parentHtmlElement);

    sinon.stub(parentQwElement, 'getElementAttribute')
      .throws('Unexpected parameter passed to getElementAttribute')
      .withArgs('hidden').returns('true')
      .withArgs('aria-hidden').returns(null)
      .withArgs('type').returns(null)
      ;

    sinon.stub(parentQwElement, 'getElementParent').returns(null);
    sinon.stub(parentQwElement, 'getElementTagName').returns('div');
    
    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected parameter passed to getElementAttribute')
      .withArgs('hidden').returns(null)
      .withArgs('aria-hidden').returns(null)
      .withArgs('type').returns(null)
      ;

    sinon.stub(qwElement, 'getElementParent').returns(parentQwElement);
    sinon.stub(qwElement, 'getElementTagName').returns('div');

    expect(isElementHidden(qwElement)).to.be.true;
  });

  it('Should return true if the element is an input with type "hidden"', () => {
    sinon.stub(global.window.DomUtils, 'isElementHiddenByCSSAux').returns(false); 

    sinon.stub(qwElement, 'getElementTagName').returns('input');

    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected parameter passed to getElementAttribute')
      .withArgs('hidden').returns(null)
      .withArgs('aria-hidden').returns(null)
      .withArgs('type').returns('hidden')
      ;

    sinon.stub(qwElement, 'getElementParent').returns(null);

    expect(isElementHidden(qwElement)).to.be.true;
  });
});
