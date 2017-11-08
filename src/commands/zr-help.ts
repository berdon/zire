#!/usr/bin/env node

/*** Node Modules ***/
let figlet = require('figlet');
let sprintf = require("sprintfjs");

/*** Typed Modules ***/
import * as fs from 'fs';
import chalk from 'chalk';
import preferences from 'preferences';

/*** Local Modules ***/
import { Command } from "../interfaces";
import AbstractCommand from './abstractCommand';
import { promisify } from 'typed-promisify';

export class HelpCommand extends AbstractCommand {
    async ShowHelp(argOptions: any, ...args: string[]): Promise<number> {
        return this.Run(argOptions, ...args);
    }

    async Run(options : any, ...args: string[]): Promise<number> {
        console.log(
            chalk.yellow(
                figlet.textSync('Zire', { horizontalLayout: 'full' })
            )
        );

        console.log(chalk.white.bold('Commands'))
        let files = await promisify(fs.readdir)(sprintf(__dirname));
        files.forEach(f => {
            if (f.startsWith('zr') && f.endsWith('.js')) {
                console.log(sprintf(
                    '\t%s\t',
                    chalk.yellow.bold(sprintf(
                        '%-20s',
                        f.replace('zr-', '').replace('.js', '')))))
            }
        });

        return 0;
    }
}

export default (new HelpCommand());