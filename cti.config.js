// JavaScript configuration file for create-ts-index
module.exports = {
    addNewline: true,
    excludes: [
      '@types',
      'typings',
      '__test__',
      '__tests__',
      'node_modules',
      'tools'
    ],
    fileExcludePatterns: [],
    fileFirst: false,
    globOptions: {
      dot: true,
      nonull: true,
    },
    includeCWD: true,
    output: 'index.ts',
    quote: "'",
    targetExts: [
      'ts',
      'tsx',
    ],
    useSemicolon: true,
    useTimestamp: false,
    verbose: false,
    backup: false,
    withoutBackupFile: false,
    createBackup: false,
    withoutComment: false,
    input: [
    "./src/*/**"
    ]
  };