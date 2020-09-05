#!/usr/bin/env node
const { Command } = require('commander')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const upload = require('./lib')
const pkg = require('./package.json')

const program = new Command()
const defaultConfigFileName = '.aliossrc'

program.version(pkg.version)

program
    .name('alioss')
    .description('Aliyun oss cli')
    .arguments('<dir>')
    .option('-c --config [file]', 'Specify configuration file default(.aliossrc or ~/.aliossrc)')
    .option('-d --dest [path]', 'object name perfix for oss', '/')
    .parse(process.argv)

function lookFile (files) {
    for (const i in files) {
        try {
            const stat = fs.statSync(files[i])
            if (!stat.isFile()) continue
            else return files[i]
        } catch (err) {
            continue
        }
    }

    return false
}

async function main() {
    const dest = program.dest
    const dir = program.args[0]

    if (!dir || !dest) {
        program.help()
        return
    }

    let configFile = ''

    if (program.config) {
        configFile = path.resolve(process.cwd(), program.config)
    } else {
        const localConfigFile = path.resolve(process.cwd(), defaultConfigFileName)
        const userConfigFile = path.resolve(process.env.HOME || process.env.USERPROFILE, defaultConfigFileName)
        const configFiles = [localConfigFile, userConfigFile]
        configFile = lookFile(configFiles)

        if (!configFile) {
            throw new Error(`Cannot found '${configFiles[0]}' or '${configFiles[1]}' file.`)
        }
    }

    try {
        fs.statSync(configFile)
    } catch (err) {
        throw new Error(`Cannot found file: ${configFile}`)
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
    const start = Date.now()
    const total = await upload({
        oss: config,
        from: cwd,
        to: dest,
        progress: (i, file, result, len) => {
            console.log(`${chalk.cyan(i + 1)}${chalk.gray('/')}${len} ${file} ${chalk.gray('➜')} ${chalk.green(result.url)}`)
        }
    })

    console.log(`Uploaded total ${chalk.cyan(total)}, Used ${chalk.green((Date.now() - start) / 1000 + 's')}`)
}

main().catch(err => {
    console.error(`Failed: ${err.message}`)
    process.exit(1)
})
