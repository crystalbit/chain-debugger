import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

class Storage {
  private dataPath: string;

  constructor() {
    // Use userData directory which is persistent between npx runs
    this.dataPath = path.join(app.getPath('userData'), 'storage.json');
    this.ensureFile();
  }

  private ensureFile(): void {
    if (!fs.existsSync(this.dataPath)) {
      fs.writeFileSync(this.dataPath, JSON.stringify({}), 'utf-8');
    }
  }

  public get(key: string): any {
    try {
      const data = JSON.parse(fs.readFileSync(this.dataPath, 'utf-8'));
      return data[key];
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  }

  public set(key: string, value: any): void {
    try {
      const data = JSON.parse(fs.readFileSync(this.dataPath, 'utf-8'));
      data[key] = value;
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing to storage:', error);
    }
  }
}

export const storage = new Storage(); 