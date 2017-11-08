#!/usr/bin/env node

/*** Node Modules ***/
let sprintf = require("sprintfjs");

/*** Typed Modules ***/
import chalk from 'chalk';
import preferences from 'preferences';

/*** Local Modules ***/
import { Command } from "../interfaces";
import AbstractCommand from './abstractCommand';

export class CommentCommand extends AbstractCommand {
    async ShowHelp(argOptions: any, ...args: string[]): Promise<number> {
        return 0;
    }

    async Run(options : any, ...args: string[]): Promise<number> {
        return 0;
    }
}

export default (new CommentCommand());