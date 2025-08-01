import fs from "fs-extra";
import path from "path";
import os from "os";
import dotenv from "dotenv";
import common from "@mxbe/common";

export default async () => {
    const projectPath = process.cwd();

    const pkg = await common.getJsonFile.package();

    dotenv.config({ path: path.join(projectPath, ".env") });

    const mcDir = path.join(
        os.homedir(),
        process.env.BASE_PATH
    );

    const bpSrc = path.join(projectPath, "behavior");
    const rpSrc = path.join(projectPath, "resource");

    const bpDest = path.join(mcDir, process.env.BEHAVIOR_PATH, pkg.name);
    const rpDest = path.join(mcDir, process.env.RESOURCE_PATH, pkg.name);

    if (fs.existsSync(bpDest)) fs.removeSync(bpDest);
    if (fs.existsSync(rpDest)) fs.removeSync(rpDest);

    if (fs.existsSync(bpSrc)) fs.symlinkSync(bpSrc, bpDest, "junction");
    if (fs.existsSync(rpSrc)) fs.symlinkSync(rpSrc, rpDest, "junction");

    console.log(`Linked ${pkg.name} to ${mcDir}`);
}
