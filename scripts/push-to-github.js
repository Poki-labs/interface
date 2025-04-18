const shelljs = require('shelljs')
const path = require('path')
const fs = require('fs')

const app = process.argv[2]

if (!app) throw new Error('no app name')

function pushExtension() {
  const manifestPath = `${path.resolve(__dirname, '../apps/extension/src')}/manifest.json`

  const data = fs.readFileSync(manifestPath, { encoding: 'utf-8' })

  const __json = JSON.parse(data)
  const version = __json.version

  shelljs.exec(`git add .`)
  shelljs.exec(`git commit -m "extension ${version}"`)
  shelljs.exec(`git push`)
  shelljs.exec(`git tag -d extension-v${version}`)
  shelljs.exec(`git tag -a extension-v${version} -m "extension ${version}"`)
  shelljs.exec(`git push origin extension-v${version}`)
}

if (app === 'extension') {
  pushExtension()
}
