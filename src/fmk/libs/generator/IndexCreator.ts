import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface IndexCreatorOptions {
  /**
   * Root directory to start search from
   * @default './src'
   */
  rootDir?: string;
  /**
   * Path to the cti configuration file
   * @default '.ctirc'
   */
  configPath?: string;
  /**
   * Whether to exclude certain directories
   * @default []
   */
  excludeDirs?: string[];

  /**
   * Whether to show verbose output
   * @default false
   */
  verbose?: boolean;
}

export class IndexCreator {
  private options: Required<IndexCreatorOptions>;

  constructor(options: IndexCreatorOptions = {}) {
    // Set default options
    this.options = {
      rootDir: options.rootDir || './src',
      configPath: options.configPath || '.ctirc',
      excludeDirs: options.excludeDirs || [],
      verbose: options.verbose || false,
    };
  }

  private getDirs(dir: string): string[] {
    let results: string[] = [];

    try {
      const list = fs.readdirSync(dir);

      for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
          // Check if this directory should be excluded
          const relativePath = path.relative(this.options.rootDir, filePath);
          const shouldExclude = this.options.excludeDirs.some((excludeDir) => relativePath === excludeDir || relativePath.startsWith(`${excludeDir}/`));

          if (!shouldExclude) {
            results.push(filePath);
            // Recursively get subdirectories
            results = results.concat(this.getDirs(filePath));
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }

    return results;
  }

  public generate(): void {
    try {
      // Resolve absolute path to root directory
      const rootDir = path.resolve(this.options.rootDir);

      // Get all subdirectories
      const allDirs = this.getDirs(rootDir);

      console.log(`Found ${allDirs.length} directories to process`);

      // Process each directory
      allDirs.forEach((dir) => {
        if (this.options.verbose) {
          console.log(`Processing ${dir}`);
        }

        try {
          // Execute cti command for this directory
          execSync(`cti create "${dir}" --config ${this.options.configPath}`);

          if (this.options.verbose) {
            console.log(`✓ Created index file for ${dir}`);
          }
        } catch (error) {
          console.error(`✗ Error processing ${dir}:`, error instanceof Error ? error.message : String(error));
        }
      });

      console.log('All index files generated successfully!');
    } catch (error) {
      console.error('Failed to generate index files:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }
}
