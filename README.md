# CLI for @mxbe packages

[![npm version](https://badge.fury.io/js/%40mxbe%2Fcli.svg)](https://www.npmjs.com/package/@mxbe/cli)
[![license](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://github.com/sausage404/mxbe-cli/blob/main/LICENSE)

See full documentation for this module here:
https://docs.mxbe.dev/docs/minecraft-be-extension/packages/cli

## Overview

`@mxbe/cli`
This package provides a CLI tool to make minecraft bedrock extension, which can be used to make a minecraft bedrock extension.
This package is extended from [@mxbe/create](https://docs.mxbe.dev/docs/minecraft-be-extension/packages/create).

## Usage

To use this package, you can run the following command:

```bash
npm install -g @mxbe/cli
```

This will install the package globally.

## Commands

In this package, you can use the following commands:

1. **Compile the project**

   ```bash
   mxbe compile
   ```

   #### Options

   - `--original` or `-o` - Cancel rebuild and compile the original project files

   - `--version` or `-v` - Compile the project with a specific version

   - `--mcpack` or `-p` - Compile the project as a mcpack

   This command will compile your project, creating a zip file containing all necessary files.

2. **Update the project**

   ```bash
   mxbe update
   ```

   #### Options

   - `--all` or `-a` - Update all packages bundled with the project

   This command will update and edit the project configuration.

3. **Import a project**

   ```bash
   mxbe import
   ```

   #### Options

   - `--resource` or `-r` - Import a resource pack project
   - `--behavior` or `-b` - Import a behavior pack project

   This command will import a project to the bds server.
