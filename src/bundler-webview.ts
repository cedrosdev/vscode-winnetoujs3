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
    let content = await fs.promises.readFile(
      path.resolve(this._extensionUri.fsPath, "src", "bundler-webview.html"),
      "utf-8"
    );
    // Get WinnetouJS package version
    const workingFolder = getWinnetouFolderFromWorkspaceSettings();
    let winnetouVersion = "Unknown";
    try {
      const packageJsonPath = workingFolder
        ? path.join(workingFolder, "node_modules", "winnetoujs", "package.json")
        : path.join(
            process.cwd(),
            "node_modules",
            "winnetoujs",
            "package.json"
          );

      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf-8")
        );
        winnetouVersion = packageJson.version;
      }
    } catch (error) {
      console.log("Could not read WinnetouJS version:", error);
    }
    content = content.replace("((winnetoujs_version))", winnetouVersion);
    //-----------------
    // get latest winnetoujs version from npm
    let latestVersion: string = await new Promise((resolve, reject) => {
      exec("npm show winnetoujs version", (error: any, stdout: string) => {
        if (error) {
          console.error(`Error fetching latest WinnetouJS version: ${error}`);
          return resolve("Unknown");
        }
        const latestVersion = stdout.trim();

        resolve(latestVersion);
      });
    });

    //-----------------
    // Replace placeholders in the HTML with actual values

    return (
      content
        .replace("{codiconUri}", this.codiconUri)
        .replace("((winnetoujs_folder))", workingFolder || "")
        //winnetoujs version
        .replace("((winnetoujs_version))", winnetouVersion)
        .replace("((latest_winnetoujs_version))", latestVersion)
        .replace(`// @ts-ignore`, ``)
        .replace(`//@ts-ignore`, ``)
    );
    return content;
  }
}
