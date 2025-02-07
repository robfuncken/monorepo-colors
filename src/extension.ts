import * as vscode from "vscode";
import * as path from "path";
import { Dirent } from "fs";

interface ColorConfig {
  pattern: string;
  color: string;
  priority?: number;
}

// Module-level variables
let originalTheme: any = undefined;
let currentColorState: string | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
  // Function to generate a color from a string (folder name)
  function generateColorFromString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${color.padStart(6, "0")}`;
  }

  // Function to get color configurations
  function getColorConfigs(): ColorConfig[] {
    const userConfigs = vscode.workspace
      .getConfiguration("monorepoColors")
      .get<ColorConfig[]>("patterns", []);

    console.log("User configs:", userConfigs);

    // If user has specified configs, use those
    if (userConfigs.length > 0) {
      return userConfigs;
    }

    try {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        console.log("No workspace folders found");
        return [];
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;
      const appsPath = path.join(workspacePath, "apps");

      console.log("Checking apps path:", appsPath);

      // Check if apps directory exists
      if (!require("fs").existsSync(appsPath)) {
        console.log("No /apps directory found at:", appsPath);
        return [];
      }

      // Read all directories in /apps
      const appFolders = require("fs")
        .readdirSync(appsPath, { withFileTypes: true })
        .filter((dirent: Dirent) => dirent.isDirectory())
        .map((dirent: Dirent) => dirent.name);

      console.log("Found app folders:", appFolders);

      const configs = appFolders.map((folderName: string) => ({
        pattern: `apps/${folderName}/**`,
        color: generateColorFromString(folderName),
        priority: 1,
      }));

      console.log("Generated configs:", configs);
      return configs;
    } catch (error) {
      console.error("Error generating app configs:", error);
      return [];
    }
  }

  // Function to validate color string
  function isValidColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  // Function to find matching color configuration for a file path
  function findMatchingConfig(
    filePath: string,
    workspacePath: string
  ): ColorConfig | undefined {
    try {
      const relativePath = path.relative(workspacePath, filePath);
      console.log("Checking path:", relativePath);

      const configs = getColorConfigs();
      console.log("Available configs:", configs);

      const filteredConfigs = configs
        .filter((config) => isValidColor(config.color))
        .sort((a, b) => (b.priority || 0) - (a.priority || 0));

      for (const config of filteredConfigs) {
        const minimatch = require("minimatch");
        if (minimatch(relativePath, config.pattern)) {
          console.log("Found matching config:", config);
          return config;
        }
      }
      console.log("No matching config found");
    } catch (error) {
      console.error("Error finding matching config:", error);
      vscode.window.showErrorMessage("Error matching path pattern");
    }
    return undefined;
  }

  // Function to update colors based on active file
  async function updateColors() {
    console.log("updateColors called");
    try {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        console.log("No active editor");
        return;
      }

      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        console.log("No workspace folders");
        return;
      }

      const filePath = activeEditor.document.uri.fsPath;
      const workspacePath = workspaceFolders[0].uri.fsPath;

      console.log("Current file:", filePath);
      console.log("Workspace path:", workspacePath);

      const matchingConfig = findMatchingConfig(filePath, workspacePath);

      if (matchingConfig) {
        console.log("Applying color:", matchingConfig.color);
        // Store the original theme if not already stored
        if (!originalTheme) {
          originalTheme = await vscode.workspace
            .getConfiguration()
            .get("workbench.colorCustomizations");
          console.log("Stored original theme:", originalTheme);
        }

        // Apply the new color
        await vscode.workspace.getConfiguration().update(
          "workbench.colorCustomizations",
          {
            "titleBar.activeBackground": matchingConfig.color,
            "titleBar.activeForeground": "#FFFFFF",
            "titleBar.inactiveBackground": matchingConfig.color + "99", // 60% opacity
            "titleBar.inactiveForeground": "#FFFFFF99",
          },
          vscode.ConfigurationTarget.Workspace
        );
        currentColorState = matchingConfig.color;
      } else {
        console.log("No matching config, restoring original theme");
        // Restore original theme if no matching config
        if (originalTheme !== undefined) {
          await vscode.workspace
            .getConfiguration()
            .update(
              "workbench.colorCustomizations",
              originalTheme,
              vscode.ConfigurationTarget.Workspace
            );
          currentColorState = undefined;
        }
      }
    } catch (error) {
      console.error("Error in updateColors:", error);
    }
  }

  // Register configuration change handler
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("monorepoColors")) {
        updateColors();
      }
    })
  );

  // Register editor change handler
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      updateColors();
    })
  );

  // Register file save handler
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document) => {
      if (
        document.uri.scheme === "file" &&
        document.uri.fsPath.endsWith(".code-workspace")
      ) {
        updateColors();
      }
    })
  );

  // Initial color update
  updateColors();
}

export async function deactivate() {
  // Reset to original theme when extension is deactivated
  if (originalTheme !== undefined) {
    try {
      await vscode.workspace
        .getConfiguration()
        .update(
          "workbench.colorCustomizations",
          originalTheme,
          vscode.ConfigurationTarget.Workspace
        );
    } catch (error) {
      console.error("Error resetting colors:", error);
    }
  }
}
