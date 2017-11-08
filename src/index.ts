#! /usr/bin/env node

import chalk from "chalk";
var clear = require("clear");
var clui = require("clui");
var figlet = require("figlet");
import * as inquirer from "inquirer";
var preferences = require("preferences");
import * as lodash from "lodash";
import * as touch from "touch";
import * as fs from "fs";
var sprintf = require("sprintfjs");
var jiraClient = require("jira-client");
import Git from "./lib/git";

import * as files from './lib/files';

function getJiraCredentials(): Promise<inquirer.Answers> {
    var questions = [
        {
            name: 'username',
            type: 'input',
            message: 'Enter your Github username or e-mail address:',
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

    var argv = require('minimist')(process.argv.slice(2));

    if (!argv._ || argv._.length == 0) {
        console.log(chalk.red('Invalid arguments'));
        return;
    }

    switch (argv._[0]) {
        case 'ls':
            return await display_issues(jira, prefs.current_user, argv.debug);
        case 'cr':
        case 'code-review':
            return await code_review_issue(jira, prefs.current_user);
        case 'cl':
        case 'close':
            return await close_issue(jira, prefs.current_user);
        case 'co':
        case 'checkout':
            return await checkout_issue(jira, prefs.current_user, argv._[1]);
        case 's':
        case 'st':
        case 'status':
            return await display_status(jira, prefs.current_user);
        case 'd':
            // console.log(await git.doesBranchExist('master'));
            (await jira.listTransitions(263912)).transitions.forEach(t => console.log(t.name, t.fields));
    }
}

async function close_issue(jira : any, user : any) : Promise<void> {
    if (!prefs.active_issue) {
        console.log(chalk.yellow("No active issue. Mark one with zire co <issue>"));
        return;
    }

    // Transition the issue
    await transition_issue(jira, await jira.findIssue(prefs.active_issue.id))


}

async function code_review_issue(jira : any, issue : any) : Promise<void> {

}

async function transition_issue(jira : any, issue : any) : Promise<void> {
    let transitions = await jira.listTransitions(issue.id);
    let states = transitions.transitions
        .map(t => {
            return {
                name: t.name,
                value: t }
            });
    states.unshift({
        name: issue.fields.status.name,
        value: null
    });

    let result = await inquirer.prompt({
        type: 'list',
        name: 'transition',
        message: sprintf('Transition %s to:', issue.key),
        choices: states,
        default: states[0].value
    })

    if (result.transition == null) return;

    var commentResults = await inquirer.prompt({
        type: 'editor',
        name: 'comments',
        message: 'Comments:'
    });

    // Based on the transition - ask field related questions
    let questions = Object.keys(result.transition.fields)
        .map(k => result.transition.fields[k])
        .filter((f, i, a) => f.required)
        .map((f, i, a) => {
            let type = inquirerTypeFromJiraType(f.schema.custom ? f.schema.custom : f.schema.type);
            return {
                type: type.type,
                name: f.name,
                message: sprintf('%s:', f.name),
                choices: f.allowedValues
            }
        });
    
    let fieldResults = await inquirer.prompt(questions);

    var data = {
        fields: Object.keys(fieldResults).map(k => {
            var result = {};
            result[k] = { name: fieldResults[k] };
            return result;
        }),
        transition : {
            id: result.transition.id
        }
    }

    if (commentResults.comments && commentResults.comments != '') {
        data['update'] = {
            comment: [{
                add: {
                    body: commentResults.comments
                }
            }]
        }
    }

    console.log(data);

    return;

    await jira.transitionIssue(issue.id, { transition: { id: result.transition }});
}

function inquirerTypeFromJiraType(type : string) : { type : string, option : string } {
    switch(type) {
        case 'com.atlassian.jira.plugin.system.customfieldtypes:select':
            return { type: 'list', option: '' };
        case 'com.atlassian.jira.plugin.system.customfieldtypes:multicheckboxes':
        case 'com.atlassian.jira.plugin.system.customfieldtypes:multiselect':
            return { type: 'checkbox', option: '' };
        case 'string':
        case 'com.atlassian.jira.plugin.system.customfieldtypes:textfield':
        case 'com.atlassian.jira.plugin.system.customfieldtypes:datetime':
        case 'com.atlassian.jira.plugin.system.customfieldtypes:datepicker':
        case 'com.atlassian.jira.plugin.system.customfieldtypes:userpicker':
            return { type: 'input', option: '' };
        case 'com.atlassian.jira.plugin.system.customfieldtypes:textarea':
            return { type: 'editor', option: '' };
    }

    return { type: 'input', option : '' };
}

async function checkout_issue(jira : any, user : any, key : string) : Promise<void> {
    if (prefs.active_issue) {
        if (prefs.active_issue.key == key) {
            console.log(chalk.white("You're already on that issue"));
            return;
        }

        // Mark the current active issue as Ready
        await transition_issue(jira, await jira.findIssue(prefs.active_issue.id))
    }

    // Grab the issue
    let issue = await jira.findIssue(key);
    await transition_issue(jira, issue)

    // Transition the issue to In Progress
    prefs.active_issue = issue;

    // Determine if we need to create the branch
    
    let branchName = sprintf('feature/%s/%s', user.name, issue.key);
    let doesBranchExist = await git.doesBranchExist(branchName);

    if (!doesBranchExist) {
        console.log(chalk.yellow('Create new branch for %s'), issue.key);
        await git.createBranchAndCheckout(branchName, 'master');
    } else {
        console.log(chalk.white('Switching to branch for %s'), issue.key);
        await git.checkout(branchName);
    }
}

async function display_status(jira : any, user : any) : Promise<void> {
    if (!prefs.active_issue) {
        console.log(chalk.yellow("No active issue. Mark one with zire co <issue>"));
        return;
    }

    console.log(
        sprintf("(" + chalkForStatus(prefs.active_issue)("%-12s") +") [%s] %s",
            prefs.active_issue.fields.status.name,
            chalk.bold.white(prefs.active_issue.key),
            chalk.bold.white(prefs.active_issue.fields.summary))
    )
}

async function display_issues(jira : any, user : any, debug : boolean = false) : Promise<any> {
    let query = await jira.searchJira(
        "project = FO AND assignee = '" + user.name + "' AND status not in (Open, Closed) ORDER BY Rank ASC");
    query.issues.forEach(async issue => {
        console.log(
            sprintf("(" + chalkForStatus(issue)("%-12s") +") [%s] %s",
                issue.fields.status.name,
                chalk.bold.white(issue.key),
                chalk.bold.white(issue.fields.summary))
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

function chalkForStatus(issue : any) : (...text : string[]) => string {
    switch(issue.fields.status.name) {
        case 'Ready':
            return chalk.green;
    }

    return (text) => { return text };
}

main().catch((reason) => { throw reason });