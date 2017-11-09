import preferences from 'preferences';

export interface Command {
    execute(jira: any, user: any, prefs : preferences, argOptions : any, ...args: string[]) : Promise<number>;
    showHelp(argOptions: any, ...args: string[]): Promise<number>;
}