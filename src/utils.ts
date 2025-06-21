import fs from 'fs-extra';
import path from 'path';

export function getFiles(dir: string) {
    let results = [];

    try {
        const list = fs.readdirSync(dir);

        for (const file of list) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                results = results.concat(getFiles(filePath));
            } else if (stat.isFile()) {
                results.push(filePath);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error.message);
    }

    return results;
}