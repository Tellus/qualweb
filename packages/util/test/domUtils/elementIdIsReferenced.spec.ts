import elementIdIsReferenced from '../../src/domUtils/elementIdIsReferenced';
import { QWElement } from '@qualweb/qw-element';
import { JSDOM } from 'jsdom';
import { expect } from 'chai';
import sinon from 'sinon';

describe('elementIdIsReferenced', () => {
  const dom = new JSDOM();

  it('Should return true if an element with the given id is referenced', async () => {
    const testAttribute = 'id';
    const testId = 'test';

    // Set up the QWElement to pass to elementIdIsReferenced
    const htmlElement = dom.window.document.createElement('div');
    htmlElement.id = testId;

    const qwElement = new QWElement(htmlElement);

    // Set up the QWElement that references the first QWElement
    const referencingHtmlElement = dom.window.document.createElement('div');
    referencingHtmlElement.setAttribute(testAttribute, testId);

    const referencingQwElement = new QWElement(referencingHtmlElement);

    // Manually stub the function that is used internally by
    // elementIdIsReferenced. If you wanted to do this with sinon, you'd have
    // to instantiate a QWPage, which requires a browser environment (heavy
    // use of the window variable).
    global.window = dom.window as any;
    global.window.qwPage = {
      getElement(selector: string, element: QWElement): QWElement {
        return referencingQwElement;
      }
    } as any;

    const result = elementIdIsReferenced(qwElement, testId, testAttribute);
    expect(result).to.be.true;
  });

  it('Should return false if an element with the given id is not referenced', async () => {
    const testAttribute = 'id';
    const testId = 'test';

    // Set up the QWElement to pass to elementIdIsReferenced
    const htmlElement = dom.window.document.createElement('div');
    htmlElement.id = testId;

    const qwElement = new QWElement(htmlElement);

    // Manually stub the function that is used internally by
    // elementIdIsReferenced. If you wanted to do this with sinon, you'd have
    // to instantiate a QWPage, which requires a browser environment (heavy
    // use of the window variable).
    global.window = dom.window as any;
    global.window.qwPage = {
      getElement(selector: string, element: QWElement): QWElement | null {
        return null;
      }
    } as any;

    const result = elementIdIsReferenced(qwElement, testId, testAttribute);
    expect(result).to.be.false;
  });

  it('Should return false if QWPage.getElement() throws', async () => {
    const testAttribute = 'id';
    const testId = 'test';

    // Set up the QWElement to pass to elementIdIsReferenced
    const htmlElement = dom.window.document.createElement('div');
    htmlElement.id = testId;

    const qwElement = new QWElement(htmlElement);

    // Manually stub the function that is used internally by
    // elementIdIsReferenced. If you wanted to do this with sinon, you'd have
    // to instantiate a QWPage, which requires a browser environment (heavy
    // use of the window variable).
    global.window = dom.window as any;
    global.window.qwPage = {
      getElement(selector: string, element: QWElement): QWElement | null {
        throw Error('test error');
      }
    } as any;

    const result = elementIdIsReferenced(qwElement, testId, testAttribute);
    expect(result).to.be.false;
  });
});
