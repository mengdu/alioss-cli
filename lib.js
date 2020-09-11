const glob = require('glob')
const OSS = require('ali-oss')
const util = require('util')
const fs = require('fs')
const path = require('path')

/**
 * @param {object} options
 * @param {string} options.from - Dir path or filePath
 * @param {string} [options.to] - upload to path; default '/'
 * @param {object} options.oss - options for ali-oss
 * @param {object} options.glob - options for glob
 * @param {(i: number, file: string, result: object, len: number) => ()} options.progress - upload progress
 * @returns {Promise<number>}
 * **/
module.exports = async function upload (options) {
    let files = []
    const stat = await util.promisify(fs.stat)(options.from)
    let from = options.from
    const to = options.to + '/'

    if (stat.isFile()) {
        files = [options.from]
        from = options.from.replace(path.basename(options.from), '')
    } else {
        files = await util.promisify(glob)('**/*', { cwd: from, nodir: true, ...options.glob })
    }

    if (files.length === 0) return 0

    const store = new OSS(options.oss)

    for (let i = 0, len = files.length; i < len; i++) {
        const file = path.resolve(from, files[i])
        const objName = file.replace(from, to || '/').replace(/(\\|\/)+/g, '/').replace(/^[/\\]/g, '')

        const result = await store.put(objName, fs.createReadStream(file))

        if (typeof options.progress === 'function') {
            options.progress(i, files[i], result, len)
        }
    }

    return files.length
}
