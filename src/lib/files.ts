#! /usr/bin/env node

import * as fs from "fs";
import * as path from "path";

export function getCurrentDirectoryBase() {
    return path.basename(process.cwd());
}

export function directoryExists(filePath : string) : boolean {
    try {
        return fs.statSync(filePath).isDirectory();
    } catch (err) {
        return false;
    }
}