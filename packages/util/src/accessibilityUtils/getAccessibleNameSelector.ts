'use strict';
import allowsNameFromContent from "./allowsNameFromContent";
import getValueFromEmbeddedControl from './getValueFromEmbeddedControl';
import { formElements, typesWithLabel } from './constants';

import { QWPage } from '@qualweb/qw-page';
import { QWElement } from '@qualweb/qw-element';
import { AccessibilityUtils } from "@qualweb/util";
import getDefaultName from "./getDefaultName";

function getAccessibleNameSelector(element: QWElement, pageQW: QWPage): string[] | undefined {
  return getAccessibleNameRecursion(element, pageQW, false, false);
}

function getAccessibleNameRecursion(element: QWElement, page: QWPage, recursion: boolean, isWidget: boolean): string[] | undefined {
  let AName, ariaLabelBy, ariaLabel, title, alt, attrType, value, role, placeholder, id, defaultName;
  let elementSelector = element.getElementSelector();
  let name = element.getElementTagName();
  let allowNameFromContent = allowsNameFromContent(element);
  ariaLabelBy = element.getElementAttribute("aria-labelledby");

  if (ariaLabelBy !== null && !(verifyAriaLabel(ariaLabelBy, page, element))) {
    ariaLabelBy = "";
  }
  ariaLabel = !!(element.getElementAttribute("aria-label")) ? [elementSelector] : null;
  attrType = element.getElementAttribute("type");
  title = !!(element.getElementAttribute("title")) ? [elementSelector] : null;
  alt = !!(element.getElementAttribute("alt")) ? [elementSelector] : null;
  value = !!(element.getElementAttribute("value")) ? [elementSelector] : null;
  placeholder = element.getElementAttribute("placeholder") ? [elementSelector] : null;
  role = AccessibilityUtils.getElementRoleAName(element, page, "");
  id = element.getElementAttribute("id");
  defaultName = !!(getDefaultName(element)) ? ["default"] : null;

  let referencedByAriaLabel = AccessibilityUtils.isElementReferencedByAriaLabel(element, page);
  if (ariaLabelBy && ariaLabelBy !== "" && !(referencedByAriaLabel && recursion)) {
    AName = getAccessibleNameFromAriaLabelledBy(element, ariaLabelBy, page);
  } else if (ariaLabel) {
    AName = ariaLabel;
  } else if (isWidget && AccessibilityUtils.isElementControl(element, page)) {
    let valueFromEmbeddedControl = !!(getValueFromEmbeddedControl(element, page)) ? elementSelector : null;
    AName = getFirstNotUndefined(valueFromEmbeddedControl, title);
  } else if (name === "area" || (name === "input" && attrType === "image")) {
    AName = getFirstNotUndefined(alt, title);
  } else if (name === "img") {
    AName = getFirstNotUndefined(alt, title);
  } else if (name === "input" && (attrType === "button" || attrType === "submit" || attrType === "reset")) {
    AName = getFirstNotUndefined(value, defaultName, title);
  } else if (name === "input" && (typesWithLabel.indexOf(attrType) >= 0 || !attrType)) {
    if (!recursion) {
      AName = getFirstNotUndefined(getValueFromLabel(element, id, page), title, placeholder);
    } else {
      AName = getFirstNotUndefined(title, placeholder);
    }
  } else if (name && formElements.indexOf(name) >= 0) {
    if (!recursion) {
      AName = getFirstNotUndefined(getValueFromLabel(element, id, page), title);
    } else {
      AName = getFirstNotUndefined(title);
    }
  } else if (name === "textarea") {
    if (!recursion) {
      AName = getFirstNotUndefined(getValueFromLabel(element, id, page), title, placeholder);
    } else {
      AName = getFirstNotUndefined(getTextFromCss(element, page, isWidget), title, placeholder);
    }
  } else if (name === "figure") {
    AName = getFirstNotUndefined(getValueFromSpecialLabel(element, "figcaption", page), title);
  } else if (name === "table") {
    AName = getFirstNotUndefined(getValueFromSpecialLabel(element, "caption", page), title);
  } else if (name === "fieldset") {
    AName = getFirstNotUndefined(getValueFromSpecialLabel(element, "legend", page), title);
  } else if (allowNameFromContent || ((role && allowNameFromContent) || (!role)) && recursion) {
    AName = getFirstNotUndefined(getTextFromCss(element, page, isWidget), title);
  } else /*if (name && (sectionAndGrouping.indexOf(name) >= 0 || name === "iframe" || tabularElements.indexOf(name) >= 0)) and all other elements*/ {
    AName = getFirstNotUndefined(title);
  }

  return AName;
}

function getFirstNotUndefined(...args: any[]): string | undefined {
  let result;
  let i = 0;
  let arg;
  let end = false;

  while (i < args.length && !end) {
    arg = args[i];
    if (arg !== undefined && arg !== null) {
      result = arg;
      if (String(arg).trim() !== "") {
        end = true;
      }
    }
    i++;
  }

  return result;
}

function getValueFromSpecialLabel(element: QWElement, label: string, page: QWPage): string {
  let labelElement = element.getElement(label);
  let accessNameFromLabel, result;

  if (labelElement)
    accessNameFromLabel = getAccessibleNameRecursion(labelElement, page, true, false);

  if (!!accessNameFromLabel)
    result = [element.getElementSelector()];

  return result;
}

function getValueFromLabel(element: QWElement, id: string, page: QWPage): string[] {
  let referencedByLabelList: QWElement[] = [];
  let referencedByLabel = page.getElements(`label[for="${id}"]`, element);
  if (referencedByLabel) {
    referencedByLabelList.push(...referencedByLabel);
  }
  let parent = element.getElementParent();
  let result: string[] = [], accessNameFromLabel;
  let isWidget = AccessibilityUtils.isElementWidget(element, page);

  if (parent && parent.getElementTagName() === "label" && !(isElementPresent(parent, referencedByLabelList))) {
    referencedByLabelList.push(parent);
  }

  for (let label of referencedByLabelList) {
    accessNameFromLabel = getAccessibleNameRecursion(label, page, true, isWidget);
    if (accessNameFromLabel) {
      result.push(label.getElementSelector())
    }

  }

  return result;
}
function isElementPresent(element: QWElement, listElement: QWElement[]): boolean {
  let result = false;
  let i = 0;
  let elementSelector = element.getElementSelector();
  while (i < listElement.length && !result) {
    result = elementSelector === listElement[i].getElementSelector();
    i++;
  }
  return result;

}



function getAccessibleNameFromAriaLabelledBy(element: QWElement, ariaLabelId: string, page: QWPage): string[] {
  let ListIdRefs = ariaLabelId.split(" ");
  let result: string[] = [];
  let accessNameFromId;
  let isWidget = AccessibilityUtils.isElementWidget(element, page);
  let elem;
  let elementID = element.getElementAttribute("id");

  for (let id of ListIdRefs) {
    if (id !== "" && elementID !== id)
      elem = page.getElementByID(id, element);
    if (elem)
      accessNameFromId = getAccessibleNameRecursion(elem, page, true, isWidget);
    if (accessNameFromId) {
      result.push(elem.getElementSelector());
    }
  }
  return result;
}

function getTextFromCss(element: QWElement, page: QWPage, isWidget: boolean): string[] {
  let aNameList = getAccessibleNameFromChildren(element, page, isWidget);
  let textValue = !!(getConcatentedText(element, [])) ? element.getElementSelector() : null;

  if (!!textValue)
    aNameList.push(textValue);



  return aNameList;
}

function getConcatentedText(element: QWElement, aNames: string[]): string {
  if (!element) {
    throw Error('Element is not defined');
  }
  return element.concatANames(aNames);
}

function getAccessibleNameFromChildren(element: QWElement, page: QWPage, isWidget: boolean): string[] {
  if (!isWidget) {
    isWidget = AccessibilityUtils.isElementWidget(element, page);
  }
  let children = element.getElementChildren();
  let result: string[] = [];
  let aName;

  if (children) {
    for (let child of children) {
      aName = getAccessibleNameRecursion(child, page, true, isWidget);
      if (aName) {
        result.push(child.getElementSelector());
      }
    }
  }
  return result;
}



function verifyAriaLabel(ariaLabelBy: string, page: QWPage, element: QWElement) {

  let elementIds = ariaLabelBy.split(" ");
  let result = false;
  for (let id of elementIds) {
    if (!result) {
      result = page.getElementByID(id, element) !== null;
    }
  }

  return result;
}

export default getAccessibleNameSelector;
