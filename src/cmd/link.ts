import fs from "fs-extra";
import path from "path";
import os from "os";
import common from "@mxbe/common";
import yml from "js-yaml";

export default async () => {
    const projectPath = process.cwd();

    const pkg = await common.getJsonFile.package();

    const rawYaml = fs.readFileSync(path.join(projectPath, "paths.yml"), "utf-8");
    const paths = yml.load(rawYaml) as { base_path: string, resource_path: string, behavior_path: string };

    const mcDir = path.join(
        os.homedir(),
        paths.base_path
    );

    const rpSrc = path.join(projectPath, "resource");
    const bpSrc = path.join(projectPath, "behavior");

    const rpDest = path.join(mcDir, paths.resource_path, pkg.name);
    const bpDest = path.join(mcDir, paths.behavior_path, pkg.name);

    if (fs.existsSync(rpDest)) fs.removeSync(rpDest);
    if (fs.existsSync(bpDest)) fs.removeSync(bpDest);

    if (fs.existsSync(rpSrc)) fs.symlinkSync(rpSrc, rpDest, "junction");
    if (fs.existsSync(bpSrc)) fs.symlinkSync(bpSrc, bpDest, "junction");

    console.log(`Linked ${pkg.name} to ${mcDir}`);
}
