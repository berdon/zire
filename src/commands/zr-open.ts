#!/usr/bin/env node

/*** Node Modules ***/
let sprintf = require("sprintfjs");

/*** Typed Modules ***/
import chalk from 'chalk';
import preferences from 'preferences';
import * as opn from 'opn';

/*** Local Modules ***/
import { Command } from "../interfaces";
import AbstractCommand from './abstractCommand';

export class OpenCommand extends AbstractCommand {
    async showHelp(argOptions: any, ...args: string[]): Promise<number> {
        return 0;
    }

    async run(options : any, ...args: string[]): Promise<number> {
        let issue = await this.jira.findIssue(args[0]);
        let link = sprintf('https://jira.zuerchertech.com/browse/%s', issue.key);

        console.log('Opening %s', link)
        opn(sprintf('https://jira.zuerchertech.com/browse/%s', issue.key));

        return 0;
    }
}

export default (new OpenCommand());