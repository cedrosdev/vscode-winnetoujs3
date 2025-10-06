import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { IWinConfig } from "./types";

interface ConstructoData {
  id: string;
  file: string;
  line: number;
  position: number;
}

export async function parseConstructos(): Promise<ConstructoData[]> {
  const results: ConstructoData[] = [];
  const config = await __getUpdatedWinConfig();
  const folder = config !== false ? config.constructosSourceFolder : `./src`;
  const folderPath = path.isAbsolute(folder)
    ? folder
    : path.join(getWinnetouFolderFromWorkspaceSettings() || "", folder);
  if (!fs.existsSync(folderPath)) {
    console.warn(`Folder not found: ${folderPath}`);
    return [];
  }

  function getAllHtmlFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = entries
      .filter(
        entry =>
          !entry.isDirectory() &&
          (entry.name.endsWith(".html") || entry.name.endsWith(".htm"))
      )
      .map(file => path.join(dir, file.name));
    const folders = entries.filter(entry => entry.isDirectory());
    folders.forEach(folder => {
      files.push(...getAllHtmlFiles(path.join(dir, folder.name)));
    });
    return files;
  }

  const htmlFiles = getAllHtmlFiles(folderPath);

  await Promise.all(
    htmlFiles.map(async filePath => {
      const fileContent = await fs.promises.readFile(filePath, "utf-8");
      const lines = fileContent.split("\n");

      lines.forEach((line, index) => {
        const regex = /id="\[\[([^\]]+)\]\]"/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
          const id = match[1];
          const position = match.index + match[0].indexOf(`[[${id}]]`) + 2;

          results.push({
            id,
            file: filePath,
            line: index + 1,
            position,
          });
        }
      });
    })
  );

  return results;
}

export async function getUpdatedWinConfig(): Promise<IWinConfig | false> {
  return await __getUpdatedWinConfig();
}

async function __getUpdatedWinConfig(): Promise<IWinConfig | false> {
  const WINNETOU_FOLDER_FROM_WORKSPACE_SETTINGS =
    getWinnetouFolderFromWorkspaceSettings();

  console.log(`Winnetou folder: ${WINNETOU_FOLDER_FROM_WORKSPACE_SETTINGS}`);

  let configPath = path.join(
    WINNETOU_FOLDER_FROM_WORKSPACE_SETTINGS,
    "win.config.json"
  );

  if (!fs.existsSync(configPath)) {
    return false;
  }
  const configFileContent = fs.readFileSync(configPath, "utf-8");
  const config = JSON.parse(configFileContent);
  return config;
}

export function getWinnetouFolderFromWorkspaceSettings(): string {
  let conf = vscode.workspace
    .getConfiguration("winnetoujs")
    .get<string>("fullPath");

  let folder = vscode.workspace.workspaceFolders
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : "";

  if (conf === `/full/path/to/your/winnetoujs/project`) {
    return folder;
  }
  if (conf && path.isAbsolute(conf)) {
    return conf;
  } else if (conf) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      return path.join(workspaceFolders[0].uri.fsPath, conf);
    } else {
      return folder;
    }
  } else {
    return folder;
  }
}
