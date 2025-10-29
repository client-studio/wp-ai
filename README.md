# WordPress AI Editor

A WordPress plugin that provides AI-powered content editing capabilities directly in the WordPress block editor.

## Features

- **AI Chat Widget**: Interactive chat interface for content editing assistance
- **Block-level Editing**: Target and edit specific WordPress blocks
- **Real-time Streaming**: Stream AI responses for better user experience
- **Diff Viewer**: Preview and review changes before applying them
- **ACF Integration**: Full support for Advanced Custom Fields
- **WPML Support**: Compatible with multilingual WordPress sites

## Installation

1. Upload the plugin files to `/wp-content/plugins/client-ai-editor/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Configure your API settings in Settings → AI Editor
4. Add your OpenAI API key or compatible endpoint

## Configuration

Navigate to **Settings → AI Editor** in your WordPress admin panel to configure:

- API endpoint URL
- API key
- Model selection
- System prompts
- Chat widget behavior

## Usage

Once activated and configured, the AI chat widget will appear in the WordPress block editor. You can:

1. Click on any block to target it for editing
2. Type your editing request in the chat
3. Review the proposed changes in the diff viewer
4. Apply or discard changes as needed

## Requirements

- WordPress 5.8 or higher
- PHP 7.4 or higher
- OpenAI API key or compatible AI service

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Development mode
npm run start
```

## License

This plugin is proprietary software developed by Client Studio.

## Support

For support and questions, please contact your development team.

