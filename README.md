# WinnetouJs3 Visual Studio Code Extension

This extension provides support for [WinnetouJs3](https://winnetoujs.org). It enables you to quickly navigate to the constructo definition (wcto.html file) in your JavaScript / TypeScript code.

## How to Use

Just press `Ctrl` (or `Cmd` on Mac) and click on a `constructo` keyword in your code. This will take you directly to the corresponding `wcto.html` file and line.

## Installation

1. Open Visual Studio Code.
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window or by pressing `Ctrl+Shift+X`.
3. Search for "WinnetouJs3".
4. Click the "Install" button to install the extension.

## Requirements

- Visual Studio Code
- JavaScript/TypeScript project using WinnetouJs3
- WinnetouJs3 library installed in your project

## Extension Settings

To set a specific path for the winnetoujs project, you can add the following setting in your VSCode settings.json file:

```json
"winnetoujs.fullPath": "/absolute/path/to/your/winnetoujs"
```

Replace `"/absolute/path/to/your/winnetoujs"` with the actual path to your WinnetouJs3 installation (normally the folder where win.config.json is located).

If you are working on a project that already has a `win.config.json` file in root folder, the extension will automatically detect the path from there, so you don't need to set this manually.

## Known Issues

- None at the moment. If you encounter any issues, please report them on the [GitHub repository](https://github.com/cedrosdev/vscode-winnetoujs3/issues).

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details

## Acknowledgements

- Thanks to the [WinnetouJs](https://winnetoujs.org) team for creating this amazing library.

## Author

- [Pamela Sedrez (@pamydev)](https://github.com/pamydev)
