import fs from 'fs-extra';
import path from 'path';

export default async (action: boolean) => {
    const manifest = fs.readJSONSync(path.join(process.cwd(), 'manifest.json'));
    const worldPath = path.resolve(process.cwd(), '..', '..', 'worlds');
    const worldFolder = fs
        .readdirSync(worldPath, { withFileTypes: true })
        .filter(folder => folder.isDirectory())
        .map(folder => folder.name)[0];
    const files = fs.readdirSync(path.join(worldPath, worldFolder), { withFileTypes: true });

    if (action) {
        const filePack = files.find(file => file.name.startsWith('world_behavior_packs'));

        if (!fs.existsSync(path.join(filePack.parentPath)))
            throw new Error(`File world_behavior_packs.json not found in ${worldPath}/${worldFolder}`);

        const file = fs.readJSONSync(path.join(filePack.parentPath, filePack.name));

        if (file.find(item => item.pack_id === manifest.header.uuid)) {
            console.error('Behavior pack already exists in world behavior packs!')
            return;
        }

        const json = [
            ...file,
            {
                pack_id: manifest.header.uuid,
                version: manifest.header.version
            }
        ]

        fs.writeJSONSync(path.join(filePack.parentPath, filePack.name), json, { spaces: 2 });

        console.log('Behavior pack imported successfully!')
    } else {
        const filePack = files.find(file => file.name.startsWith('world_resource_packs'));

        if (!fs.existsSync(path.join(filePack.parentPath)))
            throw new Error(`File world_resource_packs.json not found in ${worldPath}/${worldFolder}`);

        const file = fs.readJSONSync(path.join(filePack.parentPath, filePack.name));

        if (file.find(item => item.pack_id === manifest.header.uuid)) {
            console.log('Resource pack already exists in world resource packs!')
            return;
        }

        const json = [
            ...file,
            {
                pack_id: manifest.header.uuid,
                version: manifest.header.version
            }
        ]

        fs.writeJSONSync(path.join(filePack.parentPath, filePack.name), json, { spaces: 2 });

        console.log('Resource pack imported successfully!')
    }
}