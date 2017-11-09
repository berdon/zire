#!/usr/bin/env node

/*** Node Modules ***/
let sprintf = require("sprintfjs");
let objectPath = require('object-path');

/*** Typed Modules ***/
import chalk from 'chalk';
import preferences from 'preferences';

/*** Local Modules ***/
import { Command } from "../interfaces";
import { chalkForStatus } from '../helpers/jira';
import AbstractCommand from './abstractCommand';

export class ConfigCommand extends AbstractCommand {
    async showHelp(argOptions: any, ...args: string[]): Promise<number> {
        console.log('Configures zire.')
        console.log('\t' + chalk.white('zr config ') + chalk.grey('[--help]'));
        console.log('\t' + chalk.white('zr config ') + chalk.yellow.bold('<key> <value>'));
        console.log('\t' + chalk.white('zr config ') + chalk.grey('--list'));
        console.log('\t' + chalk.white('zr config ') + chalk.grey('--unset') + chalk.yellow.bold(' <key1> [<key2> ...]'));
        console.log();
        console.log(chalk.bold('Options'));
        console.log(sprintf(
            '\t%s\tA string to associate to a value (eg. co)',
            chalk.yellow.bold(sprintf("%-20s", "<key>"))));
        console.log(sprintf(
            '\t%s\tA string to associate to a key (eg. checkout)',
            chalk.yellow.bold(sprintf("%-20s", "<value>"))));
        console.log();
        console.log(chalk.bold('Flags'));
        console.log(sprintf(
            '\t%s\tDeletes the proceeding key/values',
            chalk.grey.bold(sprintf("%-20s", "-u|--unset"))));
        console.log(sprintf(
            '\t%s\tDisplay this message',
            chalk.grey.bold(sprintf("%-20s", "-h|--help"))));

        return 0;
    }

    async run(options : any, ...args: string[]): Promise<number> {
        if (options.u || options.unset) {
            if ((options.u || options.unset) === true) {
                console.log(chalk.yellow('Unset what?'))
                return -1;
            }
            // Options are dumb
            // config --unset               => { unset: true }
            // config --unset flerp         => { unset: "flerp", ['config', 'derp'] }
            // config --unset flerp derp    => { unset: "flerp", ['config', 'derp'] }

            // This merges them into a single thing
            let keys = [].concat.apply([], [options.u || options.unset, args]);
            keys.forEach(element => {
                if (element == 'alias') return;

                console.log(chalk.red(sprintf("Deleting %s", chalk.bold(element))));
                objectPath.del(this.config, element);
            });

            return 0;
        }

        if (args.length == 0) {
            function displayObject(key : any, value : any, level : number = 0) {
                let keys = Object.keys(value);

                if (value instanceof Object) {
                    console.log('\t'.repeat(level) + chalk.white.bold(key) + ':');
                    keys.forEach(v => displayObject(v, value[v], level + 1));
                } else {
                    console.log('\t'.repeat(level) + sprintf('%s: %s', chalk.white(key), chalk.white.bold(value)));
                }
            }

            Object.keys(this.config).forEach(element => displayObject(element, this.config[element]));
            return 0;
        }

        if (args.length == 2) {
            console.log(sprintf("%s => %s", chalk.white(args[0]), chalk.white.bold(args[1])));
            objectPath.set(this.config, args[0], args[1]);
            return 0;
        }

        return -1;
    }
}

export default (new ConfigCommand());