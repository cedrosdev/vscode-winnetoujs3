import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { getUpdatedWinConfig, parseConstructos } from "./parser";
import { Statusbar } from "./statusbar";
import { bundlerProvider } from "./bundler-webview";
import { errorProvider } from "./error-webview";
const statusbar = new Statusbar();

// codicons reference
// https://iconduck.com/sets/codicons

export async function activate(context: vscode.ExtensionContext) {
  activate_(context);
}

async function activate_(context: vscode.ExtensionContext) {
  console.log(`WinnetouJs3 IDE is running.`);

  statusbar.messages.running();
  statusbar.show();
  statusbar.messages.parsing();

  const config = await getUpdatedWinConfig();

  if (!config) {
    vscode.window.showErrorMessage(
      "WinnetouJs extension not running because win.config.json file not found or it is not a WinnetouJs project workspace."
    );

    statusbar.messages.error("WinnetouJs extension not running.");

    const bundlerProvider_ = new errorProvider(context.extensionUri);

    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        "bundlerWebView_v3",
        bundlerProvider_
      )
    );
    return;
  }

  parseConstructos().then(constructosObj => {
    setTimeout(statusbar.messages.running, 5000);
    const provider = vscode.languages.registerDefinitionProvider(
      [
        { scheme: "file", language: "javascript" },
        { scheme: "file", language: "typescript" },
      ],
      {
        provideDefinition(document, position, token) {
          const range = document.getWordRangeAtPosition(
            position,
            /\$?[\.\w\(]+/
          );
          let word = range ? document.getText(range) : "";
          if (!word.includes("(") || !word.includes("$") || word.includes("."))
            return;
          else word = word.replace("(", "").replace(".", "").replace("$", "");
          let match = constructosObj.find(elem => elem.id === word);
          if (match) {
            if (fs.existsSync(match.file)) {
              const location = new vscode.Location(
                vscode.Uri.file(match.file),
                new vscode.Position(match.line - 1, match.position)
              );

              // Navigate to the first item directly
              vscode.workspace.openTextDocument(location.uri).then(doc => {
                vscode.window.showTextDocument(doc, {
                  selection: new vscode.Range(
                    location.range.start,
                    location.range.start
                  ),
                });
              });
              // --------------
              // returns item for popup
              const htmlUri = vscode.Uri.file(match.file);
              return new vscode.Location(
                htmlUri,
                new vscode.Position(match.line - 1, match.position)
              );
            }
          }
          return null;
        },
      }
    );
    context.subscriptions.push(provider);
    //-----
    const fileChangeWatcher = vscode.workspace.onDidChangeTextDocument(
      async event => {
        if (event.document.languageId === "html") {
          constructosObj = await parseConstructos();
          return true;
        }
      }
    );
    context.subscriptions.push(fileChangeWatcher);
  });

  const bundlerProvider_ = new bundlerProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "bundlerWebView_v3",
      bundlerProvider_
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("winnetoujs.extension.reload", () => {
      vscode.commands.executeCommand("workbench.action.reloadWindow");
    })
  );
}

export function deactivate() {}
