
import { workspace } from "vscode";
const ds = require('path').sep
const semver = require('semver')

export function ucFirst(text: String): typeof text {
    return text[0].toUpperCase() + text.slice(1).toLowerCase();
}

export function camelCase(text: String): typeof text {
    return text.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
            .replace('-', '')
            .replace('_', '');
    });
}

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