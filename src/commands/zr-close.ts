#!/usr/bin/env node

/*** Node Modules ***/
let sprintf = require("sprintfjs");

/*** Typed Modules ***/
import chalk from 'chalk';
import preferences from 'preferences';

/*** Local Modules ***/
import { Command } from "../interfaces";
import AbstractCommand from './abstractCommand';
import { transition_issue } from '../helpers/jira';

export class CloseCommand extends AbstractCommand {
    async ShowHelp(argOptions: any, ...args: string[]): Promise<number> {
        console.log('Closes the current active issue')
        console.log('\t' + chalk.white('zr close ') + chalk.grey('[-h|--help]'));
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
    
        // Transition the issue
        await transition_issue(this.jira, await this.jira.findIssue(this.active_issue.id))

        this.active_issue = null;

        return 0;
    }
}

export default (new CloseCommand());