import { GameState, UnitType, Territory } from '../types/index';
import gsap from 'gsap';

export class UI {
  private container: HTMLElement;
  private selectedTerritory: string | null = null;
  private selectedUnitType: UnitType = UnitType.INFANTRY;
  private hudElement: HTMLElement;
  private minimapElement: HTMLElement;
  private minimap: HTMLCanvasElement;
  private minimapCtx: CanvasRenderingContext2D;

  constructor() {
    this.container = document.getElementById('ui-container')!;
    this.hudElement = this.createHUD();
    this.minimap = this.createMinimap();
    this.minimapCtx = this.minimap.getContext('2d')!;
    this.setupEventListeners();
  }

  private createHUD(): HTMLElement {
    const hud = document.createElement('div');
    hud.id = 'hud';
    hud.className = 'hud';
    hud.innerHTML = `
      <div class="hud-panel top-left">
        <h2>Territorial Conquest</h2>
        <div id="player-stats" class="player-stats"></div>
      </div>
      
      <div class="hud-panel top-right">
        <div id="territory-info" class="territory-info hidden">
          <h3>Territory Info</h3>
          <p>Troops: <span id="troop-count">0</span></p>
          <p>Terrain: <span id="terrain-type">-</span></p>
          <p>Owner: <span id="owner-name">-</span></p>
        </div>
      </div>
      
      <div class="hud-panel bottom-left">
        <div id="minimap-container" class="minimap-container"></div>
      </div>
      
      <div class="hud-panel bottom-right">
        <div class="unit-selector">
          <button class="unit-btn active" data-unit="infantry">Infantry</button>
          <button class="unit-btn" data-unit="tank">Tank</button>
          <button class="unit-btn" data-unit="scout">Scout</button>
        </div>
        <div class="controls">
          <button id="pause-btn" class="control-btn">Pause</button>
          <button id="settings-btn" class="control-btn">Settings</button>
        </div>
      </div>
    `;
    
    this.container.appendChild(hud);
    return hud;
  }

  private createMinimap(): HTMLCanvasElement {
    const minimap = document.createElement('canvas');
    minimap.width = 200;
    minimap.height = 150;
    minimap.className = 'minimap';
    document.querySelector('#minimap-container')?.appendChild(minimap);
    return minimap;
  }

  private setupEventListeners(): void {
    this.hudElement.querySelectorAll('.unit-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.hudElement.querySelectorAll('.unit-btn').forEach((b) => b.classList.remove('active'));
        (e.target as HTMLElement).classList.add('active');
        this.selectedUnitType = (e.target as HTMLElement).dataset.unit as UnitType;
      });
    });
  }

  public updateHUD(gameState: GameState): void {
    const playerStatsDiv = this.hudElement.querySelector('#player-stats');
    if (playerStatsDiv) {
      playerStatsDiv.innerHTML = '';
      gameState.players.forEach((player) => {
        const statRow = document.createElement('div');
        statRow.className = 'stat-row';
        statRow.innerHTML = `
          <span style="color: ${player.color}">●</span>
          <span>${player.name}</span>
          <span>${Math.floor(player.resources)}/${player.maxResources}</span>
          <span>${player.territories.length} territories</span>
        `;
        playerStatsDiv.appendChild(statRow);
      });
    }
  }

  public updateMinimap(gameState: GameState, mapWidth: number, mapHeight: number): void {
    const canvas = this.minimap;
    const ctx = this.minimapCtx;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / mapWidth;
    const scaleY = canvas.height / mapHeight;

    // Draw territories
    gameState.territories.forEach((territory) => {
      const x = territory.position.x * scaleX;
      const y = territory.position.y * scaleY;
      const size = territory.size * scaleX * 0.5;

      if (territory.owner) {
        const owner = gameState.players.get(territory.owner);
        ctx.fillStyle = owner?.color || '#999';
      } else {
        ctx.fillStyle = '#666';
      }

      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    });

    // Draw armies
    gameState.armies.forEach((army) => {
      const owner = gameState.players.get(army.owner);
      ctx.fillStyle = owner?.color || '#fff';
      const x = army.position.x * scaleX;
      const y = army.position.y * scaleY;
      ctx.fillRect(x - 2, y - 2, 4, 4);
    });
  }

  public showTerritoryInfo(territory: Territory, owner?: any): void {
    const infoDiv = this.hudElement.querySelector('#territory-info');
    if (infoDiv) {
      infoDiv.classList.remove('hidden');
      this.selectedTerritory = territory.id;

      infoDiv.querySelector('#troop-count')!.textContent = String(Math.floor(territory.troops));
      infoDiv.querySelector('#terrain-type')!.textContent = territory.terrain;
      infoDiv.querySelector('#owner-name')!.textContent = owner?.name || 'Neutral';
    }
  }

  public hideTerritoryInfo(): void {
    const infoDiv = this.hudElement.querySelector('#territory-info');
    if (infoDiv) {
      infoDiv.classList.add('hidden');
      this.selectedTerritory = null;
    }
  }

  public showNotification(message: string, duration: number = 3): void {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    this.container.appendChild(notification);

    gsap.to(notification, {
      opacity: 0,
      duration: 0.5,
      delay: duration,
      onComplete: () => notification.remove(),
    });
  }

  public getSelectedUnitType(): UnitType {
    return this.selectedUnitType;
  }

  public getSelectedTerritory(): string | null {
    return this.selectedTerritory;
  }
}