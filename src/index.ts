#! /usr/bin/env node

import chalk from "chalk";
let clear = require("clear");
let clui = require("clui");
let figlet = require("figlet");
import * as inquirer from "inquirer";
let preferences = require("preferences");
import * as lodash from "lodash";
import * as touch from "touch";
import * as fs from "fs";
let sprintf = require("sprintfjs");
let jiraClient = require("jira-client");
import Git from "./lib/git";
import { promisify } from 'typed-promisify';
import * as path from 'path';

import * as files from './lib/files';
import { Command } from "./interfaces";
import { transitionIssue } from "./helpers/jira";

function getJiraCredentials(): Promise<inquirer.Answers> {
    var questions = [
        {
            name: 'username',
            type: 'input',
            message: 'Enter your Jira:',
            validate: (value: string) => {
                if (value.length) {
                    return true;
                } else {
                    return 'Please enter your username or e-mail address';
                }
            }
        },
        {
            name: 'password',
            type: 'password',
            message: 'Enter your password:',
            validate: (value: string) => {
                if (value.length) {
                    return true;
                } else {
                    return 'Please enter your password';
                }
            }
        }
    ];

    return inquirer.prompt(questions);
}

let globalPrefs = new preferences('zire', { config: { alias: {} } });
var cwd = path.dirname(process.cwd());
let prefs = new preferences(cwd, { config: { alias: {} } },
    {
        file: path.join(cwd, '.zire'),
        format: 'yaml'
    }
);
let git = new Git('./');

async function main() {
    // console.log(
    //     chalk.yellow(
    //         figlet.textSync('Zire', { horizontalLayout: 'full' })
    //     )
    // );

    if (!globalPrefs.config) {
        globalPrefs.config = {
            alias: {
                co: 'checkout',
                st: 'status',
                ls: 'list',
                log: 'comment',
                lg: 'comment'
            }
        };
    }
    if (!globalPrefs.config.alias) globalPrefs.config.alias = {};

    if (!globalPrefs.jira || !globalPrefs.jira.username || !globalPrefs.jira.password) {
        let results = await getJiraCredentials();
        globalPrefs.jira = results;
    }

    let jira = new jiraClient({
        protocol: "https",
        host: "jira.zuerchertech.com",
        username: globalPrefs.jira.username,
        password: globalPrefs.jira.password,
        apiVersion: "2",
        strictSSL: true
    });

    if (!globalPrefs.current_user) {
        globalPrefs.current_user = await jira.getCurrentUser();
    }

    let argv = require('minimist')(process.argv.slice(2));

    if (!argv._ || argv._.length == 0) {
        console.log(chalk.red('Invalid arguments'));
        return;
    }

    // Command arbitration
    // 1. Check the internal commands directory
    let files = await promisify(fs.readdir)(sprintf("%s/commands", __dirname));
    let command = globalPrefs.config.alias[argv._[0]] || argv._[0]
    let moduleFile = files.find(f => f == ("zr-" + command + ".js"));
    if (moduleFile) {
        let module = (require('./commands/' + moduleFile) as any).default as Command;
        await module.execute(jira, globalPrefs.current_user, globalPrefs, prefs, argv, ...argv._.slice(1));
        console.log('');
        return 0;
    }

    console.log(chalk.red('Unknown command'));
    console.log('');

    return 1;
}

main().catch((reason) => {
    console.log(chalk.red(reason.stack));
});