import * as fs from "fs-extra";
import archiver from "archiver";
import { getFiles } from "../utils";

export default async (options: {
    version: boolean;
    mcpack: boolean;
    resource: boolean;
    behavior: boolean;
}) => {
    const cancelled = ['package.json', 'package-lock.json', 'tsconfig.json', 'src', 'node_modules', 'webpack.config.js'];

    const files = getFiles('.').filter(file => !cancelled.some(key => file.includes(key)));

    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    const packName = manifest.header.name;
    const packType = options.resource ? '-rp' : '-bp';
    const packVersion = options.version ? `-${manifest.header.version.join('.')}` : '';
    const packExtension = `.zip${options.mcpack ? '.mcpack' : ''}`;

    const outputStream = fs.createWriteStream(`${packName}${packType}${packVersion}${packExtension}`);

    return new Promise<void>((resolve, reject) => {
        outputStream.on('close', () => {
            console.log(archive.pointer() + ' total bytes');
            console.log('Archiver has been finalized and the output file descriptor has closed.');
            resolve();
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(outputStream);

        files.forEach(file => {
            archive.file(file, { name: file });
        });

        archive.finalize();
    });
}