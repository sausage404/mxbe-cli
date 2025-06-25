import fs from 'fs-extra';
import path from 'path';

export default async (isBehavior: boolean) => {
    const devPath = process.cwd();
    const worldsPath = path.resolve(devPath, '..', 'worlds');
    const fileName = isBehavior ? 'world_behavior_packs.json' : 'world_resource_packs.json';

    const packFolders = fs
        .readdirSync(devPath, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

    const worldFolders = fs
        .readdirSync(worldsPath, { withFileTypes: true })
        .filter(folder => folder.isDirectory())
        .map(folder => folder.name);

    for (const worldFolder of worldFolders) {
        const fullWorldPath = path.join(worldsPath, worldFolder);
        const filePath = path.join(fullWorldPath, fileName);

        if (!fs.existsSync(filePath)) {
            console.warn(`${fileName} not found in ${worldFolder}`);
            continue;
        }

        let worldPackData = fs.readJSONSync(filePath, { throws: false }) ?? [];

        for (const packFolder of packFolders) {
            const manifestPath = path.join(devPath, packFolder, 'manifest.json');
            if (!fs.existsSync(manifestPath)) {
                console.warn(`manifest.json not found in ${packFolder}`);
                continue;
            }

            const manifest = fs.readJSONSync(manifestPath) ?? [];
            const exists = worldPackData.find((item: any) => item.pack_id === manifest.header.uuid);

            if (exists) {
                console.log(`Already exists: ${manifest.header.name} in ${worldFolder}`);
                continue;
            }

            worldPackData.push({
                pack_id: manifest.header.uuid,
                version: manifest.header.version
            });

            console.log(`Imported ${manifest.header.name} into ${worldFolder}`);
        }

        fs.writeJSONSync(filePath, worldPackData, { spaces: 2 });
    }

    console.log(`Imported all ${isBehavior ? 'behavior' : 'resource'} packs to all worlds.`);
};
