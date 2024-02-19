import { QWElement } from '@qualweb/qw-element';
import getElementReferencedByHREF from '../../src/domUtils/getElementReferencedByHREF';
import { expect } from 'chai';
import sinon from 'sinon';
import { JSDOM } from 'jsdom';

describe('getElementReferencedByHREF', () => {
  /**
   * getElementReferencedByHREF returns a targeted QWElement if:
   * 1. a source QWElement has a href attribute with a fragment identifier in
   * one of these forms:
   * - Just the identifier: "#id"
   * - An absolute URL, followed by the identifier:
   *   "https://somedomain.null/#id" (or "https://somedomain.null/somefile.html#id")
   * - A filename (or last URL segment after a slash), with an identifier:
   *   "somefile.html#id"
   * 2. the identifier points to an existing element in the DOM with that ID.
   */

  /**
   * Tests:
   * 
   * - non-null when referencing existing element (#id)
   * - non-null when referencing existing element (https://somedomain.null/#id)
   * - non-null when referencing existing element (somefile.html#id)
   * - non-null when referencing existing element (https://somedomain.null/somefile.html#id)
   * - null when href is empty
   * - null when href points to a non-existent element
   * - null when href does not contain a fragment identifier
   *    - https://somedomain.null/
   *    - somefile.html
   *    - https://somedomain.null/somefile.html
   */

  let dom: JSDOM;
  let htmlElement: HTMLElement;
  let qwElement: QWElement;

  // Not all tests need this, but enough to warrant general setup/teardown.
  let referencedHtmlElement: HTMLElement;
  let referencedQwElement: QWElement;

  let url: string = 'https://www.demourl.null';
  let anchorId = 'anchor';

  beforeEach(() => {
    dom = new JSDOM();

    // Manual stub. QWPage has static methods, which don't play well with sinon.
    // @ts-expect-error: JSDOM's window type doesn't perfectly match that of a
    // real browser.
    global.window = dom.window;

    // @ts-expect-error: We're only stubbing the relevant parts of QWPage.
    global.window.qwPage = {
      getURL() {
        return url;
      },
      getElement(selector: string): QWElement | null {
        if (selector === `[id='${anchorId}']`) {
          return referencedQwElement;
        } else {
          return null;
        }
      },
    };

    htmlElement = dom.window.document.createElement('a');
    qwElement = new QWElement(htmlElement);

    referencedHtmlElement = dom.window.document.createElement('div');
    referencedQwElement = new QWElement(referencedHtmlElement);
  })

  afterEach(() => {
    sinon.restore();
  });

  it('Should return a referenced QWElement if the passed QWElement references an existing element via anchor', () => {
    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected argument passed')
      .withArgs('href').returns(`#${anchorId}`)
      ;

    expect(getElementReferencedByHREF(qwElement)).to.not.be.null;
  });

  it('Should return referenced QWElement if the passed QWElement references an existing element via a full URL with anchor', () => {
    url = 'https://www.demourl.null/';

    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected argument passed')
      .withArgs('href').returns(`${url}#${anchorId}`)
      ;

    expect(getElementReferencedByHREF(qwElement)).to.not.be.null;
  });

  it('Should return referenced QWElement if referencing existing element (somefile.html#id)', () => {
    const filename = 'somefile.html';

    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected argument passed')
      .withArgs('href').returns(`${filename}#${anchorId}`)
      ;

    expect(getElementReferencedByHREF(qwElement)).to.not.be.null;
  });

  it('Should return referenced QWElement if referencing existing element (https://somedomain.null/somefile.html#id)', () => {
    url = 'https://www.demourl.null/somefile.html';

    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected argument passed')
      .withArgs('href').returns(`${url}#${anchorId}`)
      ;

    expect(getElementReferencedByHREF(qwElement)).to.not.be.null;
  });


  it('Should return null when href is empty', () => {
    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected argument passed')
      .withArgs('href').returns('')
      ;

    expect(getElementReferencedByHREF(qwElement)).to.be.null;
  });

  it('Should return null when href contains an empty fragment identifier', () => {
    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected argument passed')
      .withArgs('href').returns('#')
      ;

    expect(getElementReferencedByHREF(qwElement)).to.be.null;
  });

  it('Should return null when href points to a non-existent element', () => {
    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected argument passed')
      .withArgs('href').returns('#non-existent-element')
      ;

    expect(getElementReferencedByHREF(qwElement)).to.be.null;
  });

  it(`Should return null when href does not contain a fragment identifier (${url})`, () => {
    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected argument passed')
      .withArgs('href').returns(url)
      ;

    expect(getElementReferencedByHREF(qwElement)).to.be.null;
  });

  it('Should return null when href does not contain a fragment identifier (somefile.html)', () => {
    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected argument passed')
      .withArgs('href').returns('somefile.html')
      ;

    expect(getElementReferencedByHREF(qwElement)).to.be.null;
  });

  it(`Should return null when href does not contain a fragment identifier (${url}/somefile.html)`, () => {
    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected argument passed')
      .withArgs('href').returns(`${url}/somefile.html`)
      ;

    expect(getElementReferencedByHREF(qwElement)).to.be.null;
  });
});
