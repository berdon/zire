#!/usr/bin/env node

/*** Node Modules ***/
let sprintf = require("sprintfjs");

/*** Typed Modules ***/
import chalk from 'chalk';
import preferences from 'preferences';

/*** Local Modules ***/
import { Command } from "../interfaces";
import AbstractCommand from './abstractCommand';
import { transitionIssue, chalkForStatus } from '../helpers/jira';
import Git from "../lib/git";

export class ListCommand extends AbstractCommand {
    async showHelp(argOptions: any, ...args: string[]): Promise<number> {
        console.log('Lists the issues currently assigned to you.')
        console.log('\t' + chalk.white('zr list ' + chalk.grey('[-a|-all] [-d|--debug] [-h|--help]')));
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

    async run(options : any, ...args: string[]): Promise<number> {
        await this.display_issues(options.a || options.all, options.d || options.debug)        

        return 0;
    }

    private async display_issues(all : boolean = false, debug : boolean = false) : Promise<any> {
        let query : any;
        if (all) {
            query = await this.jira.searchJira("project = FO ORDER BY Rank ASC");
        } else {
            query = await this.jira.searchJira(
                "project = FO AND assignee = '" + this.user.name + "' AND status not in (Open, Closed) ORDER BY Rank ASC");
        }
        query.issues.forEach(async issue => {
            console.log(
                sprintf("(%s) [%s] %s %s",
                    sprintf(chalkForStatus(issue)("%-12s"), issue.fields.status.name),
                    sprintf(chalk.bold.white('%-8s'), issue.key),
                    sprintf(
                        chalk.bold.cyan('@%-8s'),
                        issue.fields.assignee.name.substr(
                            0,
                            Math.min(8, issue.fields.assignee.name.length))),
                    sprintf(chalk.bold.white('%s'), issue.fields.summary))
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