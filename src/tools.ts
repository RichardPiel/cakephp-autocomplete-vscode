
import { workspace, Uri, CompletionItem } from "vscode";
const ds = require('path').sep
const semver = require('semver')

/**
 * ucFirst function
 * @param text 
 * @returns 
 */
export function ucFirst(text: String): typeof text {
    return text[0].toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * camelCase function
 * @param text 
 * @returns 
 */
export function camelCase(text: String): typeof text {
    return text.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
            .replace('-', '')
            .replace('_', '');
    });
}

/**
 * inArray function
 * @param needle 
 * @param haystack 
 * @returns 
 */
export function inArray(needle: String, haystack: Array<String>): boolean {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
        if (haystack[i] == needle) return true;
    }
    return false;
}

/**
 * Retourne les commandes de l'extension
 * @returns commands
 */
export function getCakeMajorVersion(): number {
    const workspacePath = workspace.asRelativePath(
        workspace.workspaceFolders![0].uri
    );
    const meta = require(workspacePath + ds + 'composer.json')
    if (meta.require['cakephp/cakephp']) {
        return semver.minVersion(meta.require['cakephp/cakephp']).major;
    }
    return 0;
}

/**
 * Permet d'extraire les variables d'un fichier
 * @param filePath 
 * @returns 
 */
export async function parseVariablesFromFile(filePath: String) {
    console.log('filePath', filePath)
    let variables: Array<CompletionItem> = [];
    const path = Uri.parse("file:///" + filePath);
    await workspace.openTextDocument(path).then((document) => {
        let lineWithVars = document.getText().match(/\$this->set\((.*?)\)\;/g);
        let already: Array<String> = [];
        lineWithVars?.forEach(f => {
            const foundVars = Array.from(f.matchAll(/\'(.*?)\'/g)).map(match => match[1]);
            if (foundVars) {
                foundVars?.forEach(v => {
                    if (!inArray(v, already)) {
                        console.log('PUSH : ', v)
                        already.push(v);
                        variables.push(new CompletionItem('$' + v, 5))
                    }
                })
            }
        })
    });
    return variables;
}
