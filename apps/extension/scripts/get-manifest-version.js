const path = require('path')
const fs = require('fs')

function get_manifest_version() {
  const manifestPath = `${path.resolve(__dirname, '../src')}/manifest.json`
  const data = fs.readFileSync(manifestPath, { encoding: 'utf-8' })
  const __json = JSON.parse(data)
  const version = __json.version

  return version
}

module.exports = { get_manifest_version }
