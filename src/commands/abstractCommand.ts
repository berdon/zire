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

    protected get has_active_issue(): boolean {
        return !!this.prefs.active_issue;
    }

    protected get active_issue(): any {
        return this.prefs.active_issue;
    }

    protected set active_issue(value : any) {
        this.prefs.active_issue = value;
    }

    protected get config(): any {
        if (!this.prefs.config) this.prefs.config = {};
        return this.prefs.config;
    }

    Execute(jira: any, user: any, prefs: any, argOptions : any, ...args: string[]): Promise<number> {
        this.jira = jira;
        this.user = user;
        this.prefs = prefs;

        if (argOptions.help) {
            return this.ShowHelp(argOptions, ...args);
        }

        return this.Run(argOptions, ...args);
    }

    abstract ShowHelp(argOptions: any, ...args: string[]): Promise<number>;
    abstract Run(argOptions: any, ...args: string[]): Promise<number>;
}