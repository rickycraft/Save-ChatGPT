# Save ChatGPT Conversations Chrome Extension

This Chrome extension allows you to save your ChatGPT conversations in different formats: TXT, Markdown, and PDF. 

## Features

- Save conversations as TXT files
- Save conversations as Markdown files
- Save conversations as PDF files

## Installation

1. Download or clone this repository to your local machine.
2. Open Google Chrome, and navigate to `chrome://extensions`.
3. Enable `Developer mode` by toggling the switch on the top right corner.
4. Click on `Load unpacked` and select the directory where you downloaded or cloned this repository.
5. The extension should now be visible in your extensions list and be ready for use.

## Usage

1. Open a ChatGPT conversation that you would like to save.
2. Click on the extension icon in the toolbar.
3. Choose the desired format (TXT, Markdown, or PDF) by clicking on the corresponding button.
4. Depending on the chosen format, the extension will save the conversation in the specified format.

## Code Overview

`popup.js` is the main script for the extension. It contains the event listeners for the buttons and functions to save the conversation in different formats.

The following is a brief description of the functions:

- `saveAsTxt()`: Saves the conversation as a TXT file.
- `saveAsMarkdown()`: Saves the conversation as a Markdown file.
- `saveAsPDF()`: Saves the conversation as a PDF file.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.