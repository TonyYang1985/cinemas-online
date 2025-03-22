module.exports = {
    backup: false,
    verbose: true,
    extensions: [".ts", ".tsx"],
    exclude: ["*.spec.ts", "*.test.ts", "*.d.ts", "*.bak"],
    includeSelf: false,
    fileExcludePatterns: ["node_modules"],
    targetExcludePatterns: ["dist", "build", "node_modules"],
    input: [
        "./src/*/**"
    ]
  };
  