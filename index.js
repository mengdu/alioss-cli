#!/usr/bin/env node
const { Command } = require('commander')
const path = require('path')
const fs = require('fs')
const glob = require('glob')
const OSS = require('ali-oss')
const pkg = require('./package.json')

const program = new Command()

program.version(pkg.version)

program
    .description('Aliyun oss cli')
    .arguments('<dir>')
    .option('-c --config [file]', 'ali-cli config file', '.aliossrc')
    .option('-d --dest <path>', 'ali-cli config file')
    .parse(process.argv, {
        
    })


function asyncGlob (pattern, options) {
    return new Promise(function (resolve, reject) {
        glob(pattern, options, function (err, files) {
            if (err) return reject(err)
            resolve(files)
        })
    })
}

async function main () {
    const configFile = path.resolve(process.cwd(), program.config)
    const dest = program.dest
    const dir = program.args[0]
    // console.log(program.args)
    // console.log(configFile, dest, dir, process.cwd())

    if (!dir || !dest) {
        program.help()
        return
    }

    let config = null

    try {
        const text = fs.readFileSync(configFile, 'utf-8').trim()
        if (!text) {
            console.error(`Invalid configuration file ${configFile}`)
            console.log('Please see: https://www.npmjs.com/package/ali-oss#ossoptions')
            process.exit(1)
        }
        config = JSON.parse(text)
    } catch (err) {
        console.error(err.message)
        process.exit(1)
    }

    if (!config) {
        console.error(`Invalid configuration file ${configFile}`)
        console.log('Please see: https://www.npmjs.com/package/ali-oss#ossoptions')
        process.exit(1)
    }

    const cwd = path.resolve(process.cwd(), dir)
    const files = await asyncGlob('**/*', { cwd: cwd, nodir: true })
    const store = new OSS(config)

    console.log(`Total found ${files.length}`)

    for (const i in files) {
        const file = path.resolve(cwd, files[i])
        const objName = file.replace(cwd, dest).replace(/^[/\\]/g, '')
        // console.log(i, file, objName)
        const result = await store.put(objName, fs.createReadStream(file))
        console.log(`${i} ${result.url}`)
    }
}

main().catch(err => {
    console.error(err.message)
    process.exit(1)
})