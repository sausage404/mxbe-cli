import common from "@mxbe/common";
import { program } from "commander";
import { execSync } from "child_process";
import compile from "./cmd/compile";
import update from "./cmd/update";
import imported from "./cmd/imported";
import link from "./cmd/link";

function setupCLI(): void {
    program
        .name("@mxbe/cli")
        .description("This is a CLI tool to make minecraft bedrock extension")

    program
        .command("import")
        .description("Import a project from a pack (use only bds)")
        .option("-r, --resource", "Import a resource pack")
        .option("-b, --behavior", "Import a behavior pack")
        .action((action) => {
            if (action.resource) {
                imported(false);
            } else if (action.behavior) {
                imported(true);
            } else {
                console.error("Error: Please specify either --resource or --behavior option.");
                process.exit(1);
            }
        })

    program
        .command("compile")
        .description("Compile the project into a distributable package")
        .option("-e, --rebuild", "Rebuild the project before compiling")
        .option("-p --mcpack", "Compress zip file to mcpack")
        .action((options) => {
            console.log("Compiling project...");

            if (options.rebuild && options.behavior) {
                console.log("Running build step first...");
                try {
                    execSync("npm run build", {
                        cwd: process.cwd(),
                        stdio: "inherit"
                    });
                } catch (error) {
                    console.error("Build failed:");
                    console.error(error);
                    process.exit(1);
                }
            }

            compile(options).catch((error) => {
                console.error("Failed to compile project:");
                console.error(error);
                process.exit(1);
            });
        });

    program
        .command("update")
        .description("Update project dependencies and configuration")
        .option("-a, --all", "Update all packages bundled with the project")
        .action((options) => {
            if (options.all) {
                console.log("Updating all compiler packages...");
                try {
                    execSync(
                        `npm update ${common.pkg.compiler.join(" ")}`,
                        {
                            cwd: process.cwd(),
                            stdio: "inherit"
                        }
                    );
                } catch (error) {
                    console.error("Failed to update compiler packages:");
                    console.error(error);
                }
            }

            update().catch((error) => {
                console.error("Failed to update project:");
                console.error(error);
                process.exit(1);
            });
        });

    program
        .command("link")
        .description("Link project to your minecraft directory")
        .action(() => {
            console.log("Linking project to your minecraft directory...");
            try {
                link();
            } catch (error) {
                console.error("Failed to link project:");
                console.error(error);
                process.exit(1);
            }
        });

    program.parse(process.argv);

    if (!process.argv.slice(2).length) {
        program.outputHelp();
    }
}

setupCLI();