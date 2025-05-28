class TopDownBottomUpBlindsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.lastTopValue = 100;
    this.lastBottomValue = 0;
    this.isUpdatingFromHA = false;
  }

  setConfig(config) {
    if (!config.top_entity || !config.bottom_entity) {
      throw new Error('You need to define both top_entity and bottom_entity');
    }
    this.config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.updateCard();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: var(--ha-card-background, var(--card-background-color, white));
          border-radius: var(--ha-card-border-radius, 12px);
          box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1));
          padding: 16px;
          font-family: var(--paper-font-body1_-_font-family);
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          font-size: 1.2em;
          font-weight: 500;
          color: var(--primary-text-color);
        }

        .entity-status {
          font-size: 0.8em;
          color: var(--secondary-text-color);
          display: flex;
          gap: 8px;
        }

        .entity-badge {
          padding: 2px 6px;
          border-radius: 4px;
          background: var(--state-icon-color);
          color: white;
          font-size: 0.7em;
        }

        .entity-badge.open {
          background: var(--state-cover-open-color, #44739e);
        }

        .entity-badge.closed {
          background: var(--state-cover-closed-color, #44739e);
        }

        .card-content {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .blinds-visual {
          flex-shrink: 0;
        }

        .controls {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .control-label {
          min-width: 80px;
          font-weight: 500;
          color: var(--secondary-text-color);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .entity-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--state-icon-color);
        }

        .entity-indicator.available {
          background: var(--state-cover-open-color, #44739e);
        }

        .entity-indicator.unavailable {
          background: var(--state-unavailable-color, #bdbdbd);
        }

        .slider-container {
          flex: 1;
          position: relative;
        }

        input[type="range"] {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: var(--disabled-text-color);
          outline: none;
          opacity: 0.7;
          transition: opacity 0.2s;
          -webkit-appearance: none;
          appearance: none;
        }

        input[type="range"]:hover {
          opacity: 1;
        }

        input[type="range"]:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--primary-color);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--primary-color);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .value-display {
          min-width: 45px;
          text-align: right;
          font-weight: 500;
          color: var(--primary-text-color);
        }

        .status-info {
          font-size: 0.9em;
          color: var(--secondary-text-color);
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          padding: 8px;
          background: var(--secondary-background-color);
          border-radius: 4px;
        }

        canvas {
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .error {
          color: var(--error-color);
          padding: 8px;
          background: var(--error-color);
          background-opacity: 0.1;
          border-radius: 4px;
          margin: 8px 0;
        }

        .preset-buttons {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .preset-btn {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          cursor: pointer;
          font-size: 0.9em;
          transition: background-color 0.2s;
        }

        .preset-btn:hover {
          background: var(--primary-color);
          color: var(--text-primary-color);
        }
      </style>

      <div class="card-header">
        <span>${this.config.name || 'Top-Down Bottom-Up Blinds'}</span>
        <div class="entity-status" id="entityStatus">
          <span class="entity-badge" id="topStatus">Top</span>
          <span class="entity-badge" id="bottomStatus">Bottom</span>
        </div>
      </div>

      <div class="card-content">
        <div class="blinds-visual">
          <canvas id="blindsCanvas" width="200" height="200"></canvas>
        </div>

        <div class="controls">
          <div class="control-group">
            <span class="control-label">
              <span class="entity-indicator" id="topIndicator"></span>
              Top Motor:
            </span>
            <div class="slider-container">
              <input type="range" id="topSlider" min="0" max="100" value="100">
            </div>
            <span class="value-display" id="topValue">100%</span>
          </div>

          <div class="control-group">
            <span class="control-label">
              <span class="entity-indicator" id="bottomIndicator"></span>
              Bottom Motor:
            </span>
            <div class="slider-container">
              <input type="range" id="bottomSlider" min="0" max="100" value="0">
            </div>
            <span class="value-display" id="bottomValue">0%</span>
          </div>

          <div class="status-info">
            <span>Coverage: <strong id="coverageValue">100%</strong></span>
            <span>Gap: <strong id="gapValue">0%</strong></span>
          </div>

          <div class="preset-buttons">
            <button class="preset-btn" id="openBtn">Fully Open</button>
            <button class="preset-btn" id="closeBtn">Fully Closed</button>
            <button class="preset-btn" id="halfBtn">50% Coverage</button>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
    this.drawBlinds(100, 0);
  }

  setupEventListeners() {
    const topSlider = this.shadowRoot.getElementById('topSlider');
    const bottomSlider = this.shadowRoot.getElementById('bottomSlider');
    const openBtn = this.shadowRoot.getElementById('openBtn');
    const closeBtn = this.shadowRoot.getElementById('closeBtn');
    const halfBtn = this.shadowRoot.getElementById('halfBtn');

    topSlider.addEventListener('input', () => this.updateBlinds());
    bottomSlider.addEventListener('input', () => this.updateBlinds());

    // Send to HA when user releases slider
    topSlider.addEventListener('change', () => this.sendTopPosition());
    bottomSlider.addEventListener('change', () => this.sendBottomPosition());

    // Preset buttons
    openBtn.addEventListener('click', () => this.setPreset(0, 0));
    closeBtn.addEventListener('click', () => this.setPreset(100, 0));
    halfBtn.addEventListener('click', () => this.setPreset(75, 25));
  }

  updateBlinds() {
    if (this.isUpdatingFromHA) return;

    const topSlider = this.shadowRoot.getElementById('topSlider');
    const bottomSlider = this.shadowRoot.getElementById('bottomSlider');
    const topValue = this.shadowRoot.getElementById('topValue');
    const bottomValue = this.shadowRoot.getElementById('bottomValue');
    const coverageValue = this.shadowRoot.getElementById('coverageValue');
    const gapValue = this.shadowRoot.getElementById('gapValue');

    let topPercent = parseInt(topSlider.value);
    let bottomPercent = parseInt(bottomSlider.value);

    // Determine which slider changed
    const topChanged = topPercent !== this.lastTopValue;
    const bottomChanged = bottomPercent !== this.lastBottomValue;

    // Ensure minimum 5% gap
    const minGap = this.config.min_gap || 5;

    if (topChanged) {
      if (topPercent - bottomPercent < minGap) {
        const newBottom = Math.max(0, topPercent - minGap);
        bottomSlider.value = newBottom;
        bottomPercent = newBottom;
      }
    } else if (bottomChanged) {
      if (topPercent - bottomPercent < minGap) {
        const newTop = Math.min(100, bottomPercent + minGap);
        topSlider.value = newTop;
        topPercent = newTop;
      }
    }

    // Update last values
    this.lastTopValue = parseInt(topSlider.value);
    this.lastBottomValue = parseInt(bottomSlider.value);

    // Update display
    topValue.textContent = topSlider.value + '%';
    bottomValue.textContent = bottomSlider.value + '%';
    
    const coverage = Math.max(0, topPercent - bottomPercent);
    const gap = 100 - coverage;
    coverageValue.textContent = coverage + '%';
    gapValue.textContent = gap + '%';

    this.drawBlinds(parseInt(topSlider.value), parseInt(bottomSlider.value));
  }

  setPreset(top, bottom) {
    const topSlider = this.shadowRoot.getElementById('topSlider');
    const bottomSlider = this.shadowRoot.getElementById('bottomSlider');
    
    topSlider.value = top;
    bottomSlider.value = bottom;
    
    this.lastTopValue = top;
    this.lastBottomValue = bottom;
    
    this.updateBlinds();
    
    this.sendTopPosition();
    this.sendBottomPosition();
  }

  updateCard() {
    if (!this._hass || !this.config.top_entity || !this.config.bottom_entity) return;

    const topStateObj = this._hass.states[this.config.top_entity];
    const bottomStateObj = this._hass.states[this.config.bottom_entity];
    
    this.updateEntityStatus(topStateObj, bottomStateObj);

    if (!topStateObj || !bottomStateObj) {
      this.shadowRoot.querySelector('.card-content').innerHTML = 
        '<div class="error">Entity not found. Check top_entity and bottom_entity configuration.</div>';
      return;
    }

    this.isUpdatingFromHA = true;
    
    const topSlider = this.shadowRoot.getElementById('topSlider');
    const bottomSlider = this.shadowRoot.getElementById('bottomSlider');
    
    if (topStateObj.attributes.current_position !== undefined) {
      topSlider.value = topStateObj.attributes.current_position;
      this.lastTopValue = topStateObj.attributes.current_position;
    }
    
    if (bottomStateObj.attributes.current_position !== undefined) {
      bottomSlider.value = bottomStateObj.attributes.current_position;
      this.lastBottomValue = bottomStateObj.attributes.current_position;
    }

    this.isUpdatingFromHA = false;
    this.updateBlinds();
  }

  updateEntityStatus(topStateObj, bottomStateObj) {
    const topStatus = this.shadowRoot.getElementById('topStatus');
    const bottomStatus = this.shadowRoot.getElementById('bottomStatus');
    const topIndicator = this.shadowRoot.getElementById('topIndicator');
    const bottomIndicator = this.shadowRoot.getElementById('bottomIndicator');
    const topSlider = this.shadowRoot.getElementById('topSlider');
    const bottomSlider = this.shadowRoot.getElementById('bottomSlider');

    if (topStateObj) {
      topStatus.textContent = topStateObj.state.toUpperCase();
      topStatus.className = 'entity-badge ' + topStateObj.state;
      topIndicator.className = 'entity-indicator ' + 
        (topStateObj.state === 'unavailable' ? 'unavailable' : 'available');
      topSlider.disabled = topStateObj.state === 'unavailable';
    } else {
      topStatus.textContent = 'NOT FOUND';
      topStatus.className = 'entity-badge unavailable';
      topIndicator.className = 'entity-indicator unavailable';
      topSlider.disabled = true;
    }

    if (bottomStateObj) {
      bottomStatus.textContent = bottomStateObj.state.toUpperCase();
      bottomStatus.className = 'entity-badge ' + bottomStateObj.state;
      bottomIndicator.className = 'entity-indicator ' + 
        (bottomStateObj.state === 'unavailable' ? 'unavailable' : 'available');
      bottomSlider.disabled = bottomStateObj.state === 'unavailable';
    } else {
      bottomStatus.textContent = 'NOT FOUND';
      bottomStatus.className = 'entity-badge unavailable';
      bottomIndicator.className = 'entity-indicator unavailable';
      bottomSlider.disabled = true;
    }
  }

  sendTopPosition() {
    if (!this._hass || !this.config.top_entity) return;

    const topSlider = this.shadowRoot.getElementById('topSlider');
    const position = parseInt(topSlider.value);

    this._hass.callService('cover', 'set_cover_position', {
      entity_id: this.config.top_entity,
      position: position
    });
  }

  sendBottomPosition() {
    if (!this._hass || !this.config.bottom_entity) return;

    const bottomSlider = this.shadowRoot.getElementById('bottomSlider');
    const position = parseInt(bottomSlider.value);

    this._hass.callService('cover', 'set_cover_position', {
      entity_id: this.config.bottom_entity,
      position: position
    });
  }

  drawBlinds(topPercent, bottomPercent) {
    const canvas = this.shadowRoot.getElementById('blindsCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const iconSize = 180;
    const x = (canvas.width - iconSize) / 2;
    const y = (canvas.height - iconSize) / 2;
    const padding = 8;

    // Dark frame
    ctx.fillStyle = '#2a3a4a';
    ctx.beginPath();
    ctx.roundRect(x, y, iconSize, iconSize, 8);
    ctx.fill();

    // Outer border
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, iconSize, iconSize, 8);
    ctx.stroke();

    // White rail
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + padding, y + padding, iconSize - (padding * 2), 20);

    // Gray area
    const railHeight = 20;
    const marginBetween = 6;
    const grayAreaY = y + padding + railHeight + marginBetween;
    const grayAreaHeight = iconSize - (padding * 2) - railHeight - marginBetween;

    ctx.fillStyle = '#c8d0d8';
    ctx.fillRect(x + padding, grayAreaY, iconSize - (padding * 2), grayAreaHeight);

    // Rail border
    ctx.strokeStyle = '#2a3a4a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + padding, y + padding, iconSize - (padding * 2), 20);

    // Draw blinds
    const availableHeight = grayAreaHeight;
    const gordijnStartY = grayAreaY;
    const gordijnEndY = grayAreaY + grayAreaHeight;

    const topPositionY = gordijnEndY - (topPercent / 100) * availableHeight;
    const bottomPositionY = gordijnEndY - (bottomPercent / 100) * availableHeight;

    if (topPercent > bottomPercent) {
      const gordijnTopY = topPositionY;
      const gordijnBottomY = bottomPositionY;
      const gordijnHeight = gordijnBottomY - gordijnTopY;

      if (gordijnHeight > 0 && gordijnTopY >= gordijnStartY) {
        const lineHeight = 6;
        const lineSpacing = 12;
        ctx.fillStyle = '#ffffff';

        const minSpaceForOneLine = lineHeight + 6;

        if (gordijnHeight >= minSpaceForOneLine) {
          const numLamellen = Math.floor(gordijnHeight / lineSpacing);
          for (let i = 0; i < numLamellen; i++) {
            const lamelY = gordijnTopY + 3 + (i * lineSpacing);
            if (lamelY + lineHeight <= gordijnBottomY) {
              ctx.fillRect(x + padding, lamelY, iconSize - (padding * 2), lineHeight);
            }
          }
        } else if (gordijnHeight > 0) {
          const centerY = gordijnTopY + (gordijnHeight - lineHeight) / 2;
          ctx.fillRect(x + padding, centerY, iconSize - (padding * 2), lineHeight);
        }
      }
    }

    // Draw cord
    ctx.strokeStyle = '#2a3a4a';
    ctx.lineWidth = 3;
    const koordX = x + iconSize - padding - 15;
    ctx.beginPath();
    ctx.moveTo(koordX, gordijnStartY);
    ctx.lineTo(koordX, gordijnEndY - 10);
    ctx.stroke();

    // Cord handle
    ctx.fillStyle = '#2a3a4a';
    ctx.beginPath();
    ctx.arc(koordX, gordijnEndY - 6, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(koordX, gordijnEndY - 6, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  getCardSize() {
    return 4;
  }

  static getConfigElement() {
    return document.createElement('top-down-bottom-up-blinds-card-editor');
  }

  static getStubConfig() {
    return {
      top_entity: 'cover.motionblinds_left_top',
      bottom_entity: 'cover.motionblinds_left_bottom',
      name: 'Living Room Blinds',
      min_gap: 5
    };
  }
}

customElements.define('top-down-bottom-up-blinds-card', TopDownBottomUpBlindsCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'top-down-bottom-up-blinds-card',
  name: 'Top-Down Bottom-Up Blinds Card',
  description: 'A card for controlling top-down bottom-up blinds with dual motor entities'
});

console.info(
  '%c TOP-DOWN-BOTTOM-UP-BLINDS-CARD %c v1.9.0-CLEAN ',
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);