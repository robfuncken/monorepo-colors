# Monorepo Colors for VS Code

A VS Code extension that automatically changes your title bar color based on which app you're working on in your monorepo. Makes it easy to visually identify which part of your monorepo you're currently working in.

## Features

- 🎨 Automatically assigns unique colors to each app in your monorepo
- 🤖 Zero configuration needed - works out of the box
- 🎯 Visual distinction between different apps in your workspace
- 💾 Consistent colors - same app always gets the same color
- 🛠️ Customizable through settings (optional)
- Works great with Turborepo

## How it Works

1. The extension automatically detects all folders in your `/apps` directory
2. Each app gets assigned a unique color based on its name
3. The VS Code title bar changes color as you switch between files in different apps
4. Colors remain consistent across sessions and restarts

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Monorepo Colors" or [click here](https://marketplace.visualstudio.com/items?itemName=Nybl.monorepo-colors)
4. Click Install

## Usage

Just open a monorepo project with an `apps` directory - it works automatically! The title bar will change color as you switch between files in different apps.

## Custom Configuration (Optional)

If you want to customize the colors, you can add patterns in your `settings.json`:

```json
{
  "monorepoColors.patterns": [
    {
      "pattern": "apps/frontend/**",
      "color": "#FF6B6B",
      "priority": 2
    },
    {
      "pattern": "apps/backend/**",
      "color": "#4ECDC4",
      "priority": 2
    },
    {
      "pattern": "packages/**",
      "color": "#45B7D1",
      "priority": 1
    }
  ]
}
```

## Requirements

- VS Code version 1.50.0 or higher
- A monorepo with an `apps` directory

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Release Notes

### 1.0.0

- Initial release
- Automatic app detection and color assignment
- Support for custom configurations

```
{
    "monorepoColors.patterns": [
        {
            "pattern": "apps/frontend/**",
            "color": "#FF0000",
            "priority": 2
        },
        {
            "pattern": "apps/backend/**",
            "color": "#00FF00",
            "priority": 2
        },
        {
            "pattern": "libs/**",
            "color": "#0000FF",
            "priority": 1
        }
    ]
}
```
