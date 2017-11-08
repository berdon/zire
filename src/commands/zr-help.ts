#!/usr/bin/env node

/*** Node Modules ***/
let sprintf = require("sprintfjs");

/*** Typed Modules ***/
import chalk from 'chalk';
import preferences from 'preferences';

/*** Local Modules ***/
import { Command } from "../interfaces";
import { chalkForStatus } from '../helpers/jira';
import AbstractCommand from './abstractCommand';

export class CloseCommand extends AbstractCommand {
    async ShowHelp(argOptions: any, ...args: string[]): Promise<number> {

        return 0;
    }

    async Run(options : any, ...args: string[]): Promise<number> {

        return -1;
    }
}

export default (new CloseCommand());