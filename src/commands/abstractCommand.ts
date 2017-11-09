#!/usr/bin/env node

/*** Node Modules ***/

/*** Typed Modules ***/
import chalk from 'chalk';
import preferences from 'preferences';

/*** Local Modules ***/
import { Command } from "../interfaces";

export default abstract class AbstractCommand implements Command {
    protected jira : any;
    protected user : any;
    protected prefs : preferences;

    protected get hasActiveIssue(): boolean {
        return !!this.prefs.active_issue;
    }

    protected get activeIssue(): any {
        return this.prefs.active_issue;
    }

    protected set activeIssue(value : any) {
        this.prefs.active_issue = value;
    }

    protected get config(): any {
        if (!this.prefs.config) this.prefs.config = {};
        return this.prefs.config;
    }

    execute(jira: any, user: any, prefs: any, argOptions : any, ...args: string[]): Promise<number> {
        this.jira = jira;
        this.user = user;
        this.prefs = prefs;

        if (argOptions.help) {
            return this.showHelp(argOptions, ...args);
        }

        return this.run(argOptions, ...args);
    }

    abstract run(argOptions: any, ...args: string[]): Promise<number>;
    abstract showHelp(argOptions: any, ...args: string[]): Promise<number>;
}