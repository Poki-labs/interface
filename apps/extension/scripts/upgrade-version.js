const fs = require('fs')
const path = require('path')

const manifestPath = `${path.resolve(__dirname, '../src')}/manifest.json`

fs.readFile(manifestPath, 'utf-8', (err, data) => {
  if (err) throw err

  const __json = JSON.parse(data)
  const splitVersionArr = __json.version.split('.')

  __json.version = splitVersionArr
    .map((e, index) => {
      if (index === splitVersionArr.length - 1) {
        return Number(e) + 1
      }

      return e
    })
    .join('.')

  const newJson = JSON.stringify(__json, null, 2)

  fs.writeFile(manifestPath, newJson, 'utf-8', (err) => {
    if (err) throw err
    console.log('Upgrade manifest.json version success.')
  })
})
