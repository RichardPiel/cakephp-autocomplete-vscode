import { Uri, languages, workspace, TextDocument, ExtensionContext } from "vscode";
import { ucFirst, camelCase, inArray, getCakeMajorVersion, parseVariablesFromFile } from "./tools";
const workspacePath = workspace.asRelativePath(
	workspace.workspaceFolders![0].uri
);
const directorySeparator = require('path').sep
const cakephpMajorVersion = getCakeMajorVersion();

export function activate(context: ExtensionContext) {

	
	console.log('CakePHP major version:', cakephpMajorVersion)

	if (cakephpMajorVersion >= 3 && cakephpMajorVersion <= 4) {

		context.subscriptions.push(languages.registerCompletionItemProvider('php', {

			provideCompletionItems(document: TextDocument) {

				let fileNameExploded: Array<String> = [];

				if (cakephpMajorVersion == 3) {
					fileNameExploded = document.fileName.split(`${directorySeparator}Template${directorySeparator}`);
				} else if (cakephpMajorVersion == 4) {
					fileNameExploded = document.fileName.split(`${directorySeparator}templates${directorySeparator}`);
				}

				if (fileNameExploded.length > 0) {

					const levels = fileNameExploded[1].split(directorySeparator);
					const levelsNumber = levels.length - 1;
					let prefix: String | undefined, controller: String | undefined, method: String | undefined, filePathToParse: String | undefined;

					// Seulement pour les cells avec prefix
					if (levelsNumber === 3) {

						prefix = ucFirst(levels[1]);
						controller = ucFirst(levels[2]);
						method = camelCase(levels[3]).slice(0, -4);

						filePathToParse = workspacePath + directorySeparator + 'src' + directorySeparator + 'View' + directorySeparator + 'Cell' + directorySeparator + prefix + directorySeparator + controller + 'Cell.php';

					// Controller avec prefix ou Cell
					} else if (levelsNumber === 2) {

						prefix = ucFirst(levels[0]);
						controller = ucFirst(levels[1]);
						method = camelCase(levels[2]).slice(0, -4);

						if (prefix === 'Cell') {
							filePathToParse = workspacePath + directorySeparator + 'src' + directorySeparator + 'View' + directorySeparator + prefix + directorySeparator + controller + 'Cell.php';
						} else {
							filePathToParse = workspacePath + directorySeparator + 'src' + directorySeparator + 'Controller' + directorySeparator + prefix + directorySeparator + controller + 'Controller.php';
						}

					// Controller seul
					} else if (levelsNumber === 1) {
						controller = ucFirst(levels[0]);
						method = camelCase(levels[1]).slice(0, -4);
						filePathToParse = workspacePath + directorySeparator + 'src' + directorySeparator + 'Controller' + directorySeparator + controller + 'Controller.php';
					}

					if (filePathToParse) {
						return parseVariablesFromFile(filePathToParse);
					}
				}
			}
		}));
	}

}

// this method is called when your extension is deactivated
export function deactivate() { }
