# QualWeb Wappalyzer

[Wappalyzer](https://www.wappalyzer.com/) module for QualWeb.

## How to install

```shell
  $ npm i @qualweb/wappalyzer --save
```

## How to run

```javascript
  'use strict';

  const { executeWappalyzer } = require('@qualweb/wappalyzer');

  (async () => {
    const report = await executeWappalyzer('https://act-rules.github.io/pages/about/');

    console.log(report);
  })();
```

# License

ISC