# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.9.0] - 2025-05-28

### Added
- Initial release of the Top-Down Bottom-Up Blinds Card
- Dual motor control with separate sliders for top and bottom motors
- Interactive blinds visualization with Canvas rendering
- Real-time entity status indicators
- Automatic 5% minimum gap enforcement between top and bottom positions
- Preset buttons for common positions (Fully Open, Fully Closed, 50% Coverage)
- Full Home Assistant integration with entity state synchronization
- Responsive design that adapts to Home Assistant themes
- Entity status badges showing current state (OPEN/CLOSED/etc.)
- Coverage and gap percentage display
- Error handling for missing or unavailable entities
- Support for disabled sliders when entities are unavailable

### Features
- **Visual Feedback**: Live canvas-based visualization of blinds position
- **Theme Integration**: Automatically adapts to Home Assistant color schemes
- **Entity Monitoring**: Real-time status updates from Home Assistant entities
- **Preset Controls**: Quick access buttons for common blind positions
- **Gap Enforcement**: Prevents overlapping positions with configurable minimum gap
- **Dual Entity Support**: Works with separate top and bottom motor entities

### Technical Details
- Built as a custom Web Component using Shadow DOM
- Responsive Canvas-based visualization
- Event-driven architecture for real-time updates
- Configurable minimum gap settings
- Error handling and graceful degradation

## [Unreleased]

### Planned Features
- Delay functionality for reduced motor wear
- Animation support for smooth transitions
- Additional preset positions
- Custom styling options
- Scheduling integration
- Advanced entity attribute support