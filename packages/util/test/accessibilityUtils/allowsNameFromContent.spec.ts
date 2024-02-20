import { QWElement } from '@qualweb/qw-element';
import allowsNameFromContent from '../../src/accessibilityUtils/allowsNameFromContent';
import { nameFromContentElements, nameFromContentRoles } from '../../src/accessibilityUtils/constants';
import { expect } from 'chai';
import sinon from 'sinon';
import { JSDOM } from 'jsdom';

describe('allowsNameFromContent', () => {
  /**
   * Returns:
   * - true if the element has a role that is in nameFromContentRoles
   * - true if the element has a tag type that is in nameFromContentElements
   * - false otherwse
   * 
   * Stubs:
   * - getElementTagName
   * - getElementAttribute
   */

  let dom: JSDOM;
  let htmlElement: HTMLElement;
  let qwElement: QWElement;

  beforeEach(() => {
    dom = new JSDOM();
    htmlElement = dom.window.document.createElement('div');
    qwElement = new QWElement(htmlElement);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should return true if element has a valid role', () => {
    let roleToReturn: string = '';

    sinon.stub(qwElement, 'getElementTagName').returns('div');
    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected parameter passed to function')
      .withArgs('role').callsFake((_) => roleToReturn)
      ;

    for (const roleToTest of nameFromContentRoles) {
      roleToReturn = roleToTest;
      expect(allowsNameFromContent(qwElement)).to.be.true;
    }
  });

  it('Should return true if element has a valid tag', () => {
    let tagToReturn: string = '';

    sinon.stub(qwElement, 'getElementTagName').callsFake(() => tagToReturn);
    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected parameter passed to function')
      .withArgs('role').returns('')
      ;

    for (const tagToTest of nameFromContentElements) {
      tagToReturn = tagToTest;
      expect(allowsNameFromContent(qwElement)).to.be.true;
    }
  });

  it('Should return false if element does not have valid role or tag', () => {
    sinon.stub(qwElement, 'getElementTagName').returns('div');
    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected parameter passed to function')
      .withArgs('role').returns('')
      ;

    expect(allowsNameFromContent(qwElement)).to.be.false;
  });
});
