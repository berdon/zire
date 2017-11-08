#!/usr/bin/env node

/*** Node Modules ***/
let sprintf = require("sprintfjs");

/*** Typed Modules ***/
import chalk from 'chalk';
import preferences from 'preferences';

/*** Local Modules ***/
import { Command } from "../interfaces";
import AbstractCommand from './abstractCommand';
import { transition_issue, chalkForStatus } from '../helpers/jira';
import Git from "../lib/git";

export class ListCommand extends AbstractCommand {
    async ShowHelp(argOptions: any, ...args: string[]): Promise<number> {
        console.log('Lists the issues currently assigned to you.')
        console.log('\t' + chalk.white('zr list ' + chalk.grey('[-d|--debug] [-h|--help]')));
        console.log();
        console.log(chalk.bold('Flags'));
        console.log(sprintf(
            '\t%s\tShows additional information about each issue',
            chalk.grey.bold(sprintf("%-20s", "-d|--debug"))));
        console.log(sprintf(
            '\t%s\tDisplay this message',
            chalk.grey.bold(sprintf("%-20s", "-h|--help"))));

        return 0;
    }

    async Run(options : any, ...args: string[]): Promise<number> {
        await this.display_issues(options.d || options.debug)        

        return 0;
    }

    private async display_issues(debug : boolean = false) : Promise<any> {
        let query = await this.jira.searchJira(
            "project = FO AND assignee = '" + this.user.name + "' AND status not in (Open, Closed) ORDER BY Rank ASC");
        query.issues.forEach(async issue => {
            console.log(
                sprintf("(" + chalkForStatus(issue)("%-12s") +") [%s] %s",
                    issue.fields.status.name,
                    chalk.bold.white(issue.key),
                    chalk.bold.white(issue.fields.summary))
            )
            if (debug) {
                console.log(sprintf("\tID: %s", chalk.grey(issue.id)))
            }
        })
        // let openIssues = issues.contents.issuesNotCompletedInCurrentSprint;
        // openIssues
        //     .filter(issue => issue.assignee == username)
        //     .forEach(issue => console.log(issue.key));
    }
}

export default (new ListCommand());