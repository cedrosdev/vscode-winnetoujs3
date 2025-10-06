import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import {
  getUpdatedWinConfig,
  getWinnetouFolderFromWorkspaceSettings,
} from "./parser";
const { exec } = require("child_process");

export class bundlerProvider implements vscode.WebviewViewProvider {
  constructor(private readonly _extensionUri: vscode.Uri) {
    this.extensionUri = _extensionUri;
  }

  private _view?: vscode.WebviewView;
  codiconUri: any;
  extensionUri: vscode.Uri;

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
    };
    this.codiconUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.extensionUri,
        "node_modules",
        "@vscode",
        "codicons",
        "dist",
        "codicon.css"
      )
    );
    this.getExternalHTML().then(content => {
      webviewView.webview.html = content;
    });
  }

  private async runServer(hasToShowTerminal: boolean) {
    console.log(`inside runServer`);
    const terminal = vscode.window.createTerminal(
      "WinnetouJs WBR Extension Server"
    );
    const winnetouFolder = getWinnetouFolderFromWorkspaceSettings();
    const command = winnetouFolder
      ? `cd "${winnetouFolder}" && node wbr -rs`
      : `node wbr -rs`;
    terminal.sendText(command);
    if (hasToShowTerminal) {
      terminal.show();
    }
  }

  private async getExternalHTML(): Promise<string> {
    let script = await fs.promises.readFile(
      path.resolve(this._extensionUri.fsPath, "src", "bundler-webview.js"),
      "utf-8"
    );
    let content = await fs.promises.readFile(
      path.resolve(this._extensionUri.fsPath, "src", "bundler-webview.html"),
      "utf-8"
    );
    const workingFolder = getWinnetouFolderFromWorkspaceSettings();
    return content;
  }
}
