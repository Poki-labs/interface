const shelljs = require('shelljs')
const { get_manifest_version } = require('./get-manifest-version')
const path = require('path')

const version = get_manifest_version()

const zipPath = path.resolve(__dirname, `../build-v${version}.zip`)
const folderPath = path.resolve(__dirname, `../build`)

shelljs.exec(`zip -r ${zipPath} ${folderPath}`)
