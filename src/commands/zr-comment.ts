#!/usr/bin/env node

/*** Node Modules ***/
let sprintf = require("sprintfjs");

/*** Typed Modules ***/
import chalk from 'chalk';
import preferences from 'preferences';
import * as inquirer from 'inquirer';

/*** Local Modules ***/
import { Command } from "../interfaces";
import AbstractCommand from './abstractCommand';

export class CommentCommand extends AbstractCommand {
    async ShowHelp(argOptions: any, ...args: string[]): Promise<number> {
        return 0;
    }

    async Run(options : any, ...args: string[]): Promise<number> {
        let issue = args.length == 0 ? this.active_issue : await this.jira.findIssue(args[0]);

        var commentResults = await inquirer.prompt({
            type: 'editor',
            name: 'comments',
            message: 'Comments:'
        });

        this.jira.addComment(issue.id, commentResults.comments);

        return 0;
    }
}

export default (new CommentCommand());