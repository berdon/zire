import preferences from 'preferences';

export interface Command {
    Execute(jira: any, user: any, prefs : preferences, argOptions : any, ...args: string[]) : Promise<number>
}