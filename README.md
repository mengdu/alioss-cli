# alioss-cli

Upload folder to aliyun oss.

```ls
npm install -g @lanyue/alioss-cli
```

## Usage

```sh
alioss dir -d /demo
```

```txt
Usage: alioss [options] <dir>

Aliyun oss cli

Options:
  -V, --version       output the version number
  -c --config [file]  Specify configuration file default(.aliossrc or ~/.aliossrc)
  -d --dest [path]    object name perfix for oss (default: "/")
  -h, --help          display help for command
```

`.aliossrc` config file:

```
{
  "region": "oss-cn-shenzhen",
  "bucket": "<bucket>",
  "accessKeyId": "<accessKeyId>",
  "accessKeySecret": "<accessKeySecret>"
}
```

Use api:

```js
const upload = require('@lanyue/alioss-cli')

upload({
    from: './dist',
    to: '/demo'
}).then((total) => {})
```

**options**

```txt
upload(options)

+ @param {object} options
+ @param {string} options.from - dir path
+ @param {string} [options.to] - upload to path; default '/'
+ @param {object} options.oss - options for ali-oss
+ @param {object} options.glob - options for glob
+ @param {(i: number, file: string, result: object, len: number) => ()} options.progress - upload progress
+ @returns {Promise<number>}
```
