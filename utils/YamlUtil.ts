import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

export class YamlUtil {
  static load(filePath: string): any {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return yaml.load(fileContent);
    } catch (error) {
      console.error(`Error loading YAML file ${filePath}:`, error);
      throw error;
    }
  }

  static dump(data: any): string {
    try {
      return yaml.dump(data);
    } catch (error) {
      console.error('Error dumping YAML:', error);
      throw error;
    }
  }

  static saveToFile(data: any, filePath: string): void {
    try {
      const yamlString = this.dump(data);
      fs.writeFileSync(filePath, yamlString, 'utf8');
    } catch (error) {
      console.error(`Error saving YAML to file ${filePath}:`, error);
      throw error;
    }
  }
}
