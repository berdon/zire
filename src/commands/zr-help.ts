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
    async showHelp(argOptions: any, ...args: string[]): Promise<number> {
        return this.run(argOptions, ...args);
    }

    async run(options : any, ...args: string[]): Promise<number> {
        console.log(
            chalk.yellow(
                figlet.textSync('Zire', { horizontalLayout: 'full' })
            )
        );

        if (args.length == 1) {
            let files = await promisify(fs.readdir)(__dirname);
            let command = this.config.alias[args[0]] || args[0];
            let moduleFile = files.find(f => f == ("zr-" + command + ".js"));
            if (moduleFile) {
                let module = (require(__dirname + '/' + moduleFile) as any).default as Command;
                await module.showHelp(options, ...args.slice(1));
                return 0;
            }
        }

        console.log(chalk.white.bold('Commands'))
        let files = await promisify(fs.readdir)(__dirname);
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