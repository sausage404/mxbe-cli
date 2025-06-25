import * as fs from "fs-extra";
import archiver from "archiver";

export default async (options: { mcpack: boolean }) => {
    const behaviorFolder = fs
        .readdirSync('.', { withFileTypes: true })
        .filter(entry => entry.isDirectory() && entry.name === 'behavior');
    const resourceFolder = fs
        .readdirSync('.', { withFileTypes: true })
        .filter(entry => entry.isDirectory() && entry.name === 'resource');

    const pkg = fs.readJSONSync('package.json');

    if (behaviorFolder.length > 0 && resourceFolder.length > 0) {
        if (options.mcpack) {
            const zipBehavior = `${pkg.name}-bp.mcpack`;
            const zipResource = `${pkg.name}-rp.mcpack`;

            await zipFolder('./behavior', zipBehavior)
            await zipFolder('./resource', zipResource)

            const archive = archiver('zip', { zlib: { level: 9 } });
            const output = fs.createWriteStream(pkg.name + '.mcaddon');

            await new Promise<void>((resolve, reject) => {
                output.on('close', () => resolve());
                archive.on('error', err => reject(err));
                archive.pipe(output);
                archive.file(zipBehavior, { name: zipBehavior });
                archive.file(zipResource, { name: zipResource });
                archive.finalize();
            })

            console.log(` ${pkg.name}.mcaddon`);
        } else {
            const zipBehavior = `${pkg.name}-bp.zip`;
            const zipResource = `${pkg.name}-rp.zip`;

            await zipFolder('./behavior', zipBehavior)
            await zipFolder('./resource', zipResource)

            const archive = archiver('zip', { zlib: { level: 9 } });
            const output = fs.createWriteStream(pkg.name + '.zip');

            await new Promise<void>((resolve, reject) => {
                output.on('close', () => resolve());
                archive.on('error', err => reject(err));
                archive.pipe(output);
                archive.file(zipBehavior, { name: zipBehavior });
                archive.file(zipResource, { name: zipResource });
                archive.finalize();
            })

            console.log(`Successfully created ${pkg.name}.zip`);
        }

    } else if (behaviorFolder.length > 0 && resourceFolder.length === 0) {
        if (options.mcpack) {
            const zipBehavior = `${pkg.name}-bp.mcpack`;
            await zipFolder('./behavior', zipBehavior);
            console.log(`Successfully created  ${zipBehavior}`);
        } else {
            const zipBehavior = `${pkg.name}-bp.zip`;
            await zipFolder('./behavior', zipBehavior);
            console.log(`Successfully created  ${zipBehavior}`);
        }
    } else if (behaviorFolder.length === 0 && resourceFolder.length > 0) {
        if (options.mcpack) {
            const zipResource = `${pkg.name}-rp.mcpack`;
            await zipFolder('./resource', zipResource);
            console.log(`Successfully created  ${zipResource}`);
        } else {
            const zipResource = `${pkg.name}-rp.zip`;
            await zipFolder('./resource', zipResource);
            console.log(`Successfully created  ${zipResource}`);
        }
    } else {
        console.log('No behavior or resource folder found.');
    }
};

async function zipFolder(inputPath: string, outputPath: string) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const output = fs.createWriteStream(outputPath);

    return new Promise<void>((resolve, reject) => {
        output.on('close', () => resolve());
        archive.on('error', err => reject(err));
        archive.pipe(output);
        archive.directory(inputPath, false);
        archive.finalize();
    });
}
