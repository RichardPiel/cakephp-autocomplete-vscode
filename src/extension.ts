import { Uri, languages, workspace, TextDocument, ExtensionContext, CompletionItem, Position } from "vscode";
import { ucFirst, camelCase, inArray, getCakeMajorVersion } from "./tools";
const workspacePath = workspace.asRelativePath(
	workspace.workspaceFolders![0].uri
);
const ds = require('path').sep
const majorVersion = getCakeMajorVersion();

export function activate(context: ExtensionContext) {

	if (majorVersion >= 3 && majorVersion <= 4) {

		console.log('Major version', majorVersion)

		context.subscriptions.push(languages.registerCompletionItemProvider('php', {

			provideCompletionItems(document: TextDocument, position: Position) {

				let variables: any = [];
				let fileNameExploded: Array<String> = [];
				
				if (majorVersion == 3) {
					fileNameExploded = document.fileName.split(`${ds}Template${ds}`);
				} else if (majorVersion == 4) {
					fileNameExploded = document.fileName.split(`${ds}templates${ds}`);
				}

				if (fileNameExploded.length > 0) {

					const levels = fileNameExploded[1].split(ds);
					const levelsNumber = levels.length - 1;

					let prefix: String | undefined, controller: String | undefined, method: String | undefined, controllerPath: String | undefined;

					if (levelsNumber === 2) {
						prefix = ucFirst(levels[0]);
						controller = ucFirst(levels[1]);
						method = camelCase(levels[2]).slice(0, -4);
						controllerPath = workspacePath + ds + 'src' + ds + 'Controller' + ds + prefix + ds + controller + 'Controller.php';
					} else if (levelsNumber === 1) {
						controller = ucFirst(levels[0]);
						method = camelCase(levels[1]).slice(0, -4);
						controllerPath = workspacePath + ds + 'src' + ds + 'Controller' + ds + controller + 'Controller.php';
					}

					if (controllerPath) {
						const path = Uri.parse("file:///" + controllerPath);
						async function parseVariables() {
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
						return parseVariables();
					}
				}
			}
		}));
	}

}

// this method is called when your extension is deactivated
export function deactivate() { }
