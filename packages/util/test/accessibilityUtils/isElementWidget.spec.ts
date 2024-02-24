import isElementWidget from '../../src/accessibilityUtils/isElementWidget';
import { QWElement } from '@qualweb/qw-element';
import AccessibilityUtils from '../../src/accessibilityUtils/accessibilityUtils';

import { expect } from 'chai';
import sinon from 'sinon';
import { JSDOM } from 'jsdom';

describe('isElementWidget', () => {
  /**
   * Returns:
   * - true if the element has a role that is in the widgetRoles array
   * - false otherwise
   * 
   * Stubs:
   * - window.AccessibilityUtils.getElementRoleAName
   */

  let dom: JSDOM;
  let qwElement: QWElement;

  beforeEach(() => {
    dom = new JSDOM();
    qwElement = new QWElement(dom.window.document.createElement('div'));

    // @ts-expect-error: 
    global.window = dom.window;
    global.window.AccessibilityUtils = AccessibilityUtils;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should return true if a given element has a widget role', () => {
    let roleToTest: string = 'menuitem';

    sinon.stub(AccessibilityUtils, 'getElementRoleAName').returns(roleToTest);

    expect(isElementWidget(qwElement)).to.be.true;
  });
  
  it('Should return false if a given element has a non-widget role', () => {
    let roleToTest: string = 'notawidgetrole';

    sinon.stub(AccessibilityUtils, 'getElementRoleAName').returns(roleToTest);

    expect(isElementWidget(qwElement)).to.be.false;
  });

  it('Should return false if a given element has no roles', () => {
    let roleToTest: string = '';

    sinon.stub(AccessibilityUtils, 'getElementRoleAName').returns(roleToTest);

    expect(isElementWidget(qwElement)).to.be.false;    
  });
});
