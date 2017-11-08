#!/usr/bin/env node

/*** Node Modules ***/
let sprintf = require("sprintfjs");

/*** Typed Modules ***/
import chalk from 'chalk';
import preferences from 'preferences';

/*** Local Modules ***/
import { Command } from "../interfaces";
import { chalkForStatus } from '../helpers/jira';
import AbstractCommand from './abstractCommand';

export class StatusCommand extends AbstractCommand {
    async ShowHelp(argOptions: any, ...args: string[]): Promise<number> {
        console.log('Shows the status of your zire.')
        console.log('\t' + chalk.white('zr status ') + chalk.grey('[-h|--help]'));
        console.log();
        console.log(chalk.bold('Flags'));
        console.log(sprintf(
            '\t%s\tDisplay this message',
            chalk.grey.bold(sprintf("%-20s", "-h|--help"))));

        return 0;
    }

    async Run(options : any, ...args: string[]): Promise<number> {
        if (!this.active_issue) {
            console.log(chalk.yellow("No active issue. Mark one with zire co <issue>"));
            return -1;
        }
    
        console.log(
            sprintf("(" + chalkForStatus(this.active_issue)("%-12s") +") [%s] %s",
                this.active_issue.fields.status.name,
                chalk.bold.white(this.active_issue.key),
                chalk.bold.white(this.active_issue.fields.summary))
        )

        return 0;
    }
}

export default (new StatusCommand());