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
import Git from "../lib/git";

export class CheckoutCommand extends AbstractCommand {
    private git : Git;

    async ShowHelp(argOptions: any, ...args: string[]): Promise<number> {
        console.log('Sets an issue as active and switches to a feature branch for it, creating one if necessary.')
        console.log('\t' + chalk.white('zr checkout ') + chalk.yellow.bold('<issue-ish> ') + chalk.grey('[-h|--help]'));
        console.log();
        console.log(chalk.bold('Options'));
        console.log(sprintf(
            '\t%s\tEither a Jira issue key (FO-1234) or a Jira issue ID (1234)',
            chalk.yellow.bold(sprintf("%-20s", "<issue-ish>"))));
        console.log();
        console.log(chalk.bold('Flags'));
        console.log(sprintf(
            '\t%s\tDisplay this message',
            chalk.grey.bold(sprintf("%-20s", "-h|--help"))));

        return 0;
    }

    async Run(options, ...args: string[]): Promise<number> {
        this.git = new Git('./');

        await this.checkout_issue(this.jira, this.user, args[0]);

        return 0;
    }

    private async checkout_issue(jira : any, user : any, key : string) : Promise<void> {
        if (this.has_active_issue) {
            if (this.active_issue.key == key) {
                console.log(chalk.white("You're already on that issue"));
                return;
            }
    
            // Mark the current active issue as Ready
            await transition_issue(jira, await jira.findIssue(this.active_issue.id))
        }
    
        // Grab the issue
        let issue = await jira.findIssue(key);
        await transition_issue(jira, issue)
    
        // Transition the issue to In Progress
        this.active_issue = issue;
    
        // Determine if we need to create the branch
        
        let branchName = sprintf('feature/%s/%s', user.name, issue.key);
        let doesBranchExist = await this.git.doesBranchExist(branchName);
    
        if (!doesBranchExist) {
            console.log(chalk.yellow('Create new branch for %s'), issue.key);
            await this.git.createBranchAndCheckout(branchName, 'master');
        } else {
            console.log(chalk.white('Switching to branch for %s'), issue.key);
            await this.git.checkout(branchName);
        }
    }
}

export default (new CheckoutCommand());