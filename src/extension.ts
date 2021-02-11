import * as vscode from 'vscode';
import * as cp from 'child_process';

export function activate(context: vscode.ExtensionContext) {

    const name = cp.execSync("git config user.name").toString().trim();

    cp.exec("gp url", (error, stdout, stderr) => {
        if (error) {
            errorOut(`[Gitpod Trivia] error 'gp url': ${error.message}`);
            return;
        }
        if (stderr) {
            errorOut(`[Gitpod Trivia] stderr 'gp url': ${stderr}`);
            return;
        }
        const url = stdout.trim();
        // get subdomain by https://stackoverflow.com/a/10526727/1364435
        const subdomainRegex = /(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/i;
        const subdomain = url.match(subdomainRegex);
        if (!subdomain || subdomain.length < 2) {
            errorOut(`[Gitpod Trivia] could not find subdomain in '${url}'`);
            return;
        }
        const [color, animal] = capitalizeArray(subdomain[1].split('-'));
        if (!color || !animal) {
            errorOut(`[Gitpod Trivia] failed to split color and animal in '${subdomain[1]}'`);
            return;
        }
        showMessage(name, color, animal);
    });
}

const capitalizeArray = (s: string[]) => {
    return s.map(x => capitalize(x));
}

const capitalize = (s: string) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

const showMessage = (name: string, color: string, animal: string) => {
    const colorAction = `What is ${color}?`
    const animalAction = `What is a ${animal}?`
    vscode.window.showInformationMessage(`Hello ${name}, I'm your friendly Gitpod workspace. My creator has given me the unique name “${color} ${animal}”. Want to learn more about it?`, colorAction, animalAction).then(selection => {
        switch (selection) {
            case colorAction: {
                vscode.env.openExternal(vscode.Uri.parse(`https://google.com/search`).with({ query: `q=${color}+Color` }));
                showMessage(name, color, animal);
            }
            case animalAction: {
                vscode.env.openExternal(vscode.Uri.parse(`https://en.wikipedia.org/wiki/${animal}`));
                showMessage(name, color, animal);
            }
        };
    });
}

const errorOut = (msg: string) => {
    console.error(msg);
    vscode.window.showErrorMessage(msg);
}

export function deactivate() { }
