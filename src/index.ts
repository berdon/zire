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

import * as files from './lib/files';
import { Command } from "./interfaces";
import { transition_issue } from "./helpers/jira";

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

let prefs = new preferences('zire');
let git = new Git('./');

async function main() {
    // console.log(
    //     chalk.yellow(
    //         figlet.textSync('Zire', { horizontalLayout: 'full' })
    //     )
    // );

    if (!prefs.config) {
        prefs.config = {
            alias: {
                co: 'checkout',
                st: 'status',
                ls: 'list',
                log: 'comment',
                lg: 'comment'
            }
        };
    }
    if (!prefs.config.alias) prefs.config.alias = {};

    if (!prefs.jira || !prefs.jira.username || !prefs.jira.password) {
        let results = await getJiraCredentials();
        prefs.jira = results;
    }

    let jira = new jiraClient({
        protocol: "https",
        host: "jira.zuerchertech.com",
        username: prefs.jira.username,
        password: prefs.jira.password,
        apiVersion: "2",
        strictSSL: true
    });

    if (!prefs.current_user) {
        prefs.current_user = await jira.getCurrentUser();
    }

    let argv = require('minimist')(process.argv.slice(2));

    if (!argv._ || argv._.length == 0) {
        console.log(chalk.red('Invalid arguments'));
        return;
    }

    // Command arbitration
    // 1. Check the internal commands directory
    let files = await promisify(fs.readdir)(sprintf("%s/commands", __dirname));
    let command = prefs.config.alias[argv._[0]] || argv._[0];
    let moduleFile = files.find(f => f == ("zr-" + command + ".js"));
    if (moduleFile) {
        let module = (require('./commands/' + moduleFile) as any).default as Command;
        await module.Execute(jira, prefs.current_user, prefs, argv, ...argv._.slice(1));
        console.log('');
        return 0;
    }

    console.log(chalk.red('Unknown command'));
    console.log('');

    return 1;
}

main().catch((reason) => { throw reason });