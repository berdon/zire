/*** Node Modules ***/
let inquirer = require('inquirer');
let sprintf = require("sprintfjs");

/*** Typed Modules ***/
import chalk from 'chalk';

/*** Local Modules ***/

export async function transition_issue(jira : any, issue : any) : Promise<void> {
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

export function chalkForStatus(issue : any) : (...text : string[]) => string {
    switch(issue.fields.status.name) {
        case 'Ready':
            return chalk.green;
    }

    return (text) => { return text };
}