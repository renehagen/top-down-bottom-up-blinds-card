# Top-Down Bottom-Up Blinds Card

A custom Home Assistant Lovelace card for controlling top-down bottom-up blinds with dual motor entities.

## Features

- **Dual Motor Control**: Separate control for top and bottom motors
- **Visual Feedback**: Interactive blinds visualization showing current position
- **Entity Status**: Real-time status indicators for both motors
- **Minimum Gap**: Automatic 5% minimum gap enforcement between top and bottom
- **Preset Buttons**: Quick access to common positions (Fully Open, Fully Closed, 50% Coverage)
- **Home Assistant Integration**: Full sync with entity states and attributes
- **Responsive Design**: Adapts to Home Assistant themes

## Installation

### Manual Installation

1. Copy `top-down-bottom-up-blinds-card.js` to your `config/www/` directory
2. Add the card to your resources in Home Assistant:
   - Go to **Settings → Dashboards → Resources**
   - Click **Add Resource**
   - URL: `/local/top-down-bottom-up-blinds-card.js`
   - Resource type: **JavaScript Module**
3. Refresh your browser cache (Ctrl+F5)

### HACS Installation

This card is not yet available in HACS. Use manual installation for now.

## Configuration

Add the card to your Lovelace dashboard:

```yaml
type: custom:top-down-bottom-up-blinds-card
top_entity: cover.motionblinds_left_top
bottom_entity: cover.motionblinds_left_bottom
name: "Living Room Blinds"
min_gap: 5
```

### Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `top_entity` | string | **Yes** | - | Entity ID for the top motor |
| `bottom_entity` | string | **Yes** | - | Entity ID for the bottom motor |
| `name` | string | No | "Top-Down Bottom-Up Blinds" | Card title |
| `min_gap` | number | No | 5 | Minimum gap percentage between top and bottom |

## Usage

### Sliders
- **Top Motor**: Controls the position of the top edge of the blinds
- **Bottom Motor**: Controls the position of the bottom edge of the blinds
- Both sliders automatically maintain the minimum gap setting

### Entity Status
- **Green dot**: Entity is available and responsive
- **Gray dot**: Entity is unavailable
- **Status badges**: Show current state (OPEN/CLOSED/etc.)

### Preset Buttons
- **Fully Open**: Sets both motors to 0% (no coverage)
- **Fully Closed**: Sets top to 100%, bottom to 0% (full coverage)
- **50% Coverage**: Sets top to 75%, bottom to 25% (50% coverage in middle)

### Visual Display
- **Coverage**: Shows percentage of window covered by blinds
- **Gap**: Shows percentage of window that is open
- **Canvas**: Visual representation of current blind position

## Entity Requirements

Your cover entities should have the following attributes:
- `current_position`: Current position percentage (0-100)
- `state`: Current state (open, closed, etc.)

## Troubleshooting

### Card Not Loading
- Check browser console for errors
- Verify the JavaScript file is accessible at `/local/top-down-bottom-up-blinds-card.js`
- Clear browser cache and restart Home Assistant if needed

### Entities Not Found
- Verify entity IDs are correct in your configuration
- Check that entities exist in **Developer Tools → States**
- Ensure entities have `current_position` attribute

### Sliders Not Syncing
- Check that your entities report `current_position` changes
- Verify Home Assistant can control the entities
- Check for JavaScript errors in browser console

## Version History

- **v1.9.0-CLEAN**: Stable release with core functionality
  - Dual motor control
  - Visual feedback
  - Preset buttons
  - Entity status monitoring
  - Minimum gap enforcement

## License

This project is open source. Feel free to modify and distribute.

## Contributing

Issues and pull requests are welcome. Please test thoroughly before submitting changes.
