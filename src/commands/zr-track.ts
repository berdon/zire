#!/usr/bin/env node

/*** Node Modules ***/
let sprintf = require("sprintfjs");

/*** Typed Modules ***/
import chalk from 'chalk';
import preferences from 'preferences';
import * as inquirer from 'inquirer';
import * as moment from 'moment';
import 'moment-duration-format';

/*** Local Modules ***/
import { Command } from "../interfaces";
import { chalkForStatus } from '../helpers/jira';
import AbstractCommand from './abstractCommand';

class Tracker {
    public startTime : Date
    public issueId : number
    public ellapsedTimeMs(currentDate : Date = new Date()) : number {
        return (currentDate.getTime() - this.startTime.getTime());
    }

    constructor(data : {startTime : string, issueId : number}) {
        this.startTime = new Date(data.startTime);
        this.issueId = data.issueId;
    }
}

export class TrackCommand extends AbstractCommand {
    private get isTracking() : boolean {
        return this.prefs.tracker;
    }

    private get tracker() : Tracker {
        return new Tracker(this.prefs.tracker);
    }

    private track(startTime : Date, issueId : number) : void {
        this.prefs.tracker = {
            startTime: startTime,
            issueId : issueId
        };
    }

    private clearTracker() : void {
        this.prefs.tracker = null;
    }

    async showHelp(argOptions: any, ...args: string[]): Promise<number> {
        return 0;
    }

    async run(options : any, ...args: string[]): Promise<number> {
        if (args.length == 0) {
            this.showTrackerStatus();
        }

        let issueId = options.issue || this.activeIssue.id;

        if (args[0] == "s" || args[0] == "start" || args[0] == "r" || args[0] == "restart") {
            if (this.isTracking && (args[0] == "s" || args[0] == "start")) {
                console.log(
                    "You're already tracking time; use",
                    chalk.grey("zr track restart"),
                    "to restart the tracker"
                );
                return -1;
            }

            this.track(new Date(), issueId);
            console.log("Tracker started.")
            return 1;
        }

        if (args[0] == "t" || args[0] == "stop") {
            if (!this.isTracking) {
                console.log(
                    chalk.white("Your tracker currently isn't running; start one with"),
                    chalk.grey("zr track start")
                );
                return -1;
            }

            if (!(options.x || options.cancel)) {
                let now = new Date();

                let commentResults = await inquirer.prompt({
                    type: 'editor',
                    name: 'comments',
                    message: 'Comments:'
                });

                let worklog = {
                    started: this.tracker.startTime.toISOString().slice(0, -1) + '+0000',
                    //timeSpent: moment.duration(this.tracker.ellapsedTimeMs(), 'milliseconds').format('hh[h] mm[m] ss[s]'),
                    timeSpentSeconds: this.tracker.ellapsedTimeMs() / 1000,
                    comment: commentResults.comments
                }

                if (commentResults.comments) {
                    worklog.comment = commentResults.comments;
                }

                await this.jira.addWorklog(
                    Number(issueId),
                    worklog
                )

                console.log(
                    chalk.white("Logged %s to %s"),
                    chalk.green(moment.duration(this.tracker.ellapsedTimeMs(), 'milliseconds').format('hh[h] mm[m] ss[s]')),
                    chalk.white.bold(this.activeIssue.key)
                );
            }

            this.clearTracker();

            return 1;
        }

        return -1;
    }

    private showTrackerStatus() {
        if (this.isTracking) {
            console.log(chalk.white(`Started at: ${this.tracker.startTime.toDateString()}`))
            console.log(chalk.white(`Ellapsed: ${moment.duration(this.tracker.ellapsedTimeMs(), 'milliseconds').format('hh[h] mm[m] ss[s]')}`))
            return;
        }

        console.log(
            chalk.white("Your tracker currently isn't running; start one with"),
            chalk.grey("zr track start")
        );
    }
}

export default (new TrackCommand());