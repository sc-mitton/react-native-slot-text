import fs from 'fs-extra'
import path from 'path'

const outputPath = path.join(import.meta.dirname, '../lib')
const rootPath = path.join(import.meta.dirname, '../')
const shouldMovedFiles = ['LICENSE', 'README.md', 'package.json']

  ; (async () => {
    await Promise.all(
      shouldMovedFiles.map(async name => {
        const filePath = path.join(rootPath, name)
        const outputFilePath = path.join(outputPath, name)
        await fs.copy(filePath, outputFilePath)
      }),
    )
    console.log('All files moved.')
  })()
