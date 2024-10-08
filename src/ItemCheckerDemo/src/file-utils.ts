// file-utils.ts
import * as fs from 'fs';

export function existsSync(path: string): boolean {
    return fs.existsSync(path);
}

export function mkdirSync(path: string): void {
    fs.mkdirSync(path);
}

export function writeFileSync(filePath: string, data: string): void {
    fs.writeFileSync(filePath, data, 'utf-8');
}

export function readFileSync(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
}

