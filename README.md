# Obsidian Mood and Energy Plugin

This plugin allows users to quickly insert mood and energy level values into their Obsidian notes. It provides a convenient interface for selecting predefined mood items and adjusting energy levels through a slider.

## Features

- Insert a predefined mood value at the cursor position.
- Adjust and insert a current energy level as a text value, percentage, or a progress bar.
- Hotkeys for quickly accessing mood and energy commands.
- User-friendly modal dialogs for selecting mood and energy levels.

## Installation

<!--
### Install from Community Plugins (coming soon)

1. In Obsidian, go to **Settings → Community plugins → Browse**.
2. Search for "Mood and Energy Plugin" (or the plugin's name).
3. Click **Install** and then **Enable**.
-->

**Recommended:**

1. Go to the [Releases](https://github.com/Jack-Chronicle/mood-tracker/releases) page.
2. Download the latest `main.js`, `manifest.json`, and `package.json` files from the newest release.
3. Create a folder for the plugin in your Obsidian vault's `.obsidian/plugins/` directory (e.g., `.obsidian/plugins/obsidian-mood-energy-plugin`).
4. Place the downloaded files into that folder.
5. Enable the plugin in Obsidian's settings.

### Development / Manual Build

If you want to build the plugin yourself or contribute:

1. Clone the repository:
   ```
   git clone https://github.com/Jack-Chronicle/mood-tracker.git
   ```

2. Navigate to the plugin directory:
   ```
   cd obsidian-mood-energy-plugin
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Build the plugin:
   ```
   npm run build
   ```

5. Copy the generated `main.js`, `manifest.json`, and `package.json` to your Obsidian plugins folder as described above.

## Usage

- Use the designated hotkeys to open the mood menu or energy slider.
- Select a mood from the grid and click "okay" to insert it into your note.
- Adjust the energy level using the slider and click "okay" to insert it as a progress bar.

## Hotkeys

- **Insert Energy**: Alt+5
- **Insert Mood**: Alt+6
- **Insert Both Mood and Energy Level**: Alt+7

## Contributing

Feel free to submit issues or pull requests to improve the plugin. Contributions are welcome!

## License

This project is licensed under the MIT License. See the LICENSE file for details.