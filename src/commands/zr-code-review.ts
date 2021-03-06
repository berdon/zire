#!/usr/bin/env node

/*** Node Modules ***/
let sprintf = require("sprintfjs");

/*** Typed Modules ***/
import chalk from 'chalk';
import preferences from 'preferences';

/*** Local Modules ***/
import { Command } from "../interfaces";
import AbstractCommand from './abstractCommand';

export class CodeReviewCommand extends AbstractCommand {
    async showHelp(argOptions: any, ...args: string[]): Promise<number> {
        return 0;
    }

    async run(options : any, ...args: string[]): Promise<number> {
        return 0;
    }
}

export default (new CodeReviewCommand());