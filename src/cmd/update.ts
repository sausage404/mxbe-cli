import * as fs from "fs-extra";
import * as path from "path";
import inquirer from "inquirer";
import common from "@mxbe/common";
import { execSync } from "child_process";
import cliProgress from "cli-progress";

export default async () => {
    const manifest = await common.getJsonFile.manifest();
    const pkg = await common.getJsonFile.package();
    const answers = await inquirer.prompt([{
        type: 'input',
        name: 'minimumEngineVersion',
        message: 'What is the minimum engine version required?',
        default: manifest.header.min_engine_version.join('.'),
        validate: input => {
            if (input.length === 0) return 'Minimum engine version is required';
            const [major, minor, patch] = input.split('.');
            return (!isNaN(parseInt(major)) && !isNaN(parseInt(minor)) && !isNaN(parseInt(patch))) || 'Minimum engine version must be in the format x.x.x';
        }
    }, {
        type: 'list',
        name: 'gameType',
        message: 'What game type would you like to use?',
        choices: ['stable', 'preview']
    }, {
        type: 'checkbox',
        name: 'dependencies',
        message: 'Which dependencies would you like to add?',
        default: Object.keys(pkg.devDependencies).filter(dep =>
            [
                ...common.pkg.plugins,
                ...common.pkg.modules
            ].includes(dep)
        ),
        choices: [
            ...common.pkg.modules,
            ...common.pkg.plugins
        ],
        validate: input => input.length > 0 || 'At least one dependency is required'
    }, {
        type: 'checkbox',
        name: 'addons',
        message: 'Which addons would you like to add?',
        default: Object.keys(pkg.devDependencies).filter(dep =>
            common.pkg.addons.includes(dep)
        ),
        choices: common.pkg.addons
    }]);

    const dependencies = await common.getDependencyVersions(answers.dependencies, answers.gameType);

    const dependencyVersions = await inquirer.prompt(
        await Promise.all(
            dependencies.map(async ({ name, choices }) => ({
                type: 'list',
                name,
                default: Object
                    .entries((await common.getJsonFile.package()).devDependencies as Record<string, string>)
                    .map(([dep, version]) => [dep, version.replace(/^[\^~]/, '')])
                    .find(([dep]) => dep === name)?.[1],
                message: `Which ${name} version would you like to use?`,
                choices
            }))
        )
    );

    const dependencyUpdates = Object.entries(dependencyVersions)
        .map(([name, version]) => `${name}@${version}`).concat(answers.addons)

    const projectPath = process.cwd();
    const behaviorPath = path.join(projectPath, 'behavior');

    await fs.writeJson(path.join(projectPath, 'package.json'), {
        name: path.basename(projectPath),
        ...pkg,
        devDependencies: {
            ...Object.fromEntries(
                Object.entries(pkg.devDependencies)
                    .filter(([dep]) => ![
                        ...common.pkg.modules,
                        ...common.pkg.plugins,
                        ...common.pkg.addons
                    ].includes(dep))
                    .map(([dep, version]) => {
                        if (answers.dependencies.includes(dep)) {
                            return [dep, `^${dependencyVersions[dep]}`]
                        } else {
                            return [dep, version]
                        }
                    })
            )
        }

    }, { spaces: 2 });

    await fs.writeJson(path.join(behaviorPath, 'manifest.json'), {
        ...manifest,
        header: {
            ...manifest.header,
            min_engine_version: answers.minimumEngineVersion.split('.').map(Number),
        },
        dependencies: Object.entries(dependencyVersions)
            .filter(([name]) => common.pkg.modules.includes(name))
            .map(([name, version]) => ({
                module_name: name,
                version: version.includes("beta") ? `${version.split("-")[0]}-beta` : version.split("-")[0],
            }))
    }, { spaces: 2 });

    const bar = new cliProgress.SingleBar({
        format: 'Installing [{bar}] {percentage}% | {value}/{total} | {dep}',
        barCompleteChar: '█',
        barIncompleteChar: '░',
        hideCursor: true
    }, cliProgress.Presets.shades_classic);

    bar.start(dependencyUpdates.length, 0, { dep: '' });

    for (const dep of dependencyUpdates) {
        bar.update({ dep });

        try {
            execSync(`npm install --save-dev ${dep} --legacy-peer-deps`, {
                cwd: process.cwd(),
                stdio: 'ignore'
            });
        } catch (err) {
            bar.stop();
            console.error(`Failed to install ${dep}`);
            console.error(err.message);
            process.exit(1);
        }

        bar.increment();
    }

    bar.stop();
    console.log('Project updated successfully!');
}