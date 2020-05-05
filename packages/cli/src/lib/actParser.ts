'use strict';
import { validateACT, validatePrinciples, validateLevels, printError } from './parserUtils';
import { readJsonFile, fileExists } from './fileUtils';
import clone from 'lodash.clone';

async function parseAct(mainOptions, options) {
  options['act-rules'] = {}

  if(mainOptions['act-rules']){

    if(mainOptions.module && !options['execute']['act']) {
      printError("Wrong module selected.");
    }else{
      console.log("Warning: Module act has options but is not select. Will be select automatically");
      options['execute']["act"] = true;
    }

    if(mainOptions['act-rules'].length === 1){
      if(await fileExists(mainOptions['act-rules'][0])){
        let rules = await readJsonFile(mainOptions['act-rules'][0]);
        options['act-rules']['rules'] = clone(rules['act-rules']['rules']);
      }else{
        options['act-rules']['rules'] = clone(mainOptions['act-rules']);
      }
    }else{
      options['act-rules']['rules'] = clone(mainOptions['act-rules']);
    }

    validateACT(options['act-rules']['rules']);
  }

  if(mainOptions['act-levels']){
    if(mainOptions.module && !options['execute']['act']) {
      printError("Wrong module selected.");
    }else{
      console.log("Warning: Module act has options but is not select. Will be select automatically");
      options['execute']["act"] = true;
    }

    options['act-rules']['levels'] = clone(mainOptions['act-levels']);
    validateLevels(options['act-rules']['levels']);
  }

  if(mainOptions['act-principles']){
    if(mainOptions.module && !options['execute']['act']) {
      printError("Wrong module selected.");
    }else{
      console.log("Warning: Module act has options but is not select. Will be select automatically");
      options['execute']["act"] = true;
    }

    options['act-rules']['principles'] = clone(mainOptions['act-principles']);
    validatePrinciples(options['act-rules']['principles']);
  }

  if(Object.keys(options['act-rules']).length === 0){
    delete options['act-rules'];
  }

  return options;
}

export {
  parseAct
}