import { GameState, GameConfig, Territory, Army, Player, TerrainType, UnitType, AILevel } from '../types/index';
import { v4 as uuidv4 } from 'uuid';

export class GameEngine {
  private state: GameState;
  private tickRate: number = 60; // ticks per second
  private lastTickTime: number = 0;
  private updateCallbacks: ((state: GameState) => void)[] = [];

  constructor(config: GameConfig) {
    this.state = {
      gameId: uuidv4(),
      players: new Map(),
      territories: new Map(),
      armies: new Map(),
      tick: 0,
      gameTime: 0,
      isPaused: false,
      mapWidth: config.mapWidth,
      mapHeight: config.mapHeight,
      fogOfWar: new Map(),
    };

    this.initializePlayers(config);
    this.generateMap(config);
  }

  private initializePlayers(config: GameConfig): void {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];
    
    for (let i = 0; i < config.playerCount; i++) {
      const playerId = uuidv4();
      const player: Player = {
        id: playerId,
        name: i === 0 ? 'You' : `AI-${i}`,
        color: colors[i % colors.length],
        resources: config.initialResources,
        maxResources: config.maxResources,
        territories: [],
        armies: [],
        upgrades: { production: 1, speed: 1, strength: 1 },
        isAI: i !== 0,
        difficulty: i !== 0 ? config.aiDifficulty : undefined,
      };

      this.state.players.set(playerId, player);
      this.state.fogOfWar.set(playerId, new Set());
    }
  }

  private generateMap(config: GameConfig): void {
    const territoryCount = Math.floor((config.mapWidth * config.mapHeight) / 5000);
    const players = Array.from(this.state.players.values());

    for (let i = 0; i < territoryCount; i++) {
      const territoryId = uuidv4();
      const isStartingTerritory = i < players.length;
      const owner = isStartingTerritory ? players[i].id : null;

      const territory: Territory = {
        id: territoryId,
        owner: owner || '',
        position: {
          x: Math.random() * config.mapWidth,
          y: Math.random() * config.mapHeight,
        },
        size: 50 + Math.random() * 50,
        troops: isStartingTerritory ? 500 : Math.random() * 200,
        resources: 0,
        terrain: this.randomTerrain(),
        defenseBuff: 1,
        isCity: Math.random() < 0.15,
      };

      if (territory.isCity) {
        territory.defenseBuff = 1.3;
      }

      this.state.territories.set(territoryId, territory);

      if (owner) {
        const player = this.state.players.get(owner);
        if (player) {
          player.territories.push(territoryId);
        }
      }
    }
  }

  private randomTerrain(): TerrainType {
    const rand = Math.random();
    if (rand < 0.6) return TerrainType.PLAINS;
    if (rand < 0.9) return TerrainType.MOUNTAINS;
    return TerrainType.WATER;
  }

  public update(deltaTime: number): void {
    if (this.state.isPaused) return;

    this.state.gameTime += deltaTime;
    this.state.tick++;

    // Update armies
    this.updateArmies(deltaTime);

    // Generate resources
    this.generateResources();

    // Check for combat
    this.checkCombat();

    // Update fog of war
    this.updateFogOfWar();

    // AI decisions
    this.updateAI();

    this.notifySubscribers();
  }

  private updateArmies(deltaTime: number): void {
    this.state.armies.forEach((army) => {
      if (!army.destination) return;

      const distance = Math.hypot(
        army.destination.x - army.position.x,
        army.destination.y - army.position.y
      );

      if (distance < 5) {
        // Reached destination
        const targetTerritory = this.getTerritoryAt(army.destination);
        if (targetTerritory) {
          army.targetTerritory = targetTerritory.id;
          army.destination = undefined;
        }
        return;
      }

      const direction = {
        x: (army.destination.x - army.position.x) / distance,
        y: (army.destination.y - army.position.y) / distance,
      };

      const unitStats = this.getUnitStats(army.unitType);
      const speed = unitStats.speed * 100 * (1 + this.state.players.get(army.owner)!.upgrades.speed * 0.1);
      const moveDistance = speed * deltaTime;

      army.position.x += direction.x * moveDistance;
      army.position.y += direction.y * moveDistance;
    });
  }

  private generateResources(): void {
    this.state.players.forEach((player) => {
      let incomePerTick = 0;

      player.territories.forEach((territoryId) => {
        const territory = this.state.territories.get(territoryId)!;
        let income = 10 * (1 + player.upgrades.production * 0.2);

        if (territory.isCity) {
          income *= 1.5;
        }

        incomePerTick += income;
      });

      player.resources = Math.min(
        player.resources + incomePerTick / this.tickRate,
        player.maxResources
      );
    });
  }

  private checkCombat(): void {
    this.state.armies.forEach((army) => {
      if (!army.targetTerritory) return;

      const territory = this.state.territories.get(army.targetTerritory);
      if (!territory || territory.owner === army.owner) return;

      const combatStrength = army.troops * this.getUnitStats(army.unitType).strength;
      const defenseStrength = territory.troops * territory.defenseBuff;
      const randomFactor = 0.9 + Math.random() * 0.2;

      if (combatStrength * randomFactor > defenseStrength) {
        // Attacker wins
        const casualty = Math.floor(army.troops * 0.2);
        army.troops = Math.max(0, army.troops - casualty);
        territory.troops = 0;

        if (territory.owner) {
          const previousOwner = this.state.players.get(territory.owner)!;
          previousOwner.territories = previousOwner.territories.filter((id) => id !== army.targetTerritory);
        }

        territory.owner = army.owner;
        const newOwner = this.state.players.get(army.owner)!;
        newOwner.territories.push(army.targetTerritory);

        army.targetTerritory = undefined;
      } else {
        // Defender wins
        territory.troops -= Math.floor(army.troops * 0.3);
        army.troops = 0;
        this.state.armies.delete(army.id);
      }
    });
  }

  private updateFogOfWar(): void {
    this.state.fogOfWar.forEach((visibleTerritories, playerId) => {
      visibleTerritories.clear();
      const player = this.state.players.get(playerId)!;

      player.territories.forEach((territoryId) => {
        const territory = this.state.territories.get(territoryId)!;
        visibleTerritories.add(territoryId);

        // Add nearby territories
        this.state.territories.forEach((other) => {
          const distance = Math.hypot(other.position.x - territory.position.x, other.position.y - territory.position.y);
          if (distance < 200) {
            visibleTerritories.add(other.id);
          }
        });
      });

      // Add army vision
      player.armies.forEach((armyId) => {
        const army = this.state.armies.get(armyId)!;
        this.state.territories.forEach((territory) => {
          const distance = Math.hypot(army.position.x - territory.position.x, army.position.y - territory.position.y);
          if (distance < 150) {
            visibleTerritories.add(territory.id);
          }
        });
      });
    });
  }

  private updateAI(): void {
    this.state.players.forEach((player) => {
      if (!player.isAI) return;

      if (this.state.tick % 120 === 0) {
        // AI decides every 2 seconds
        this.makeAIDecision(player);
      }
    });
  }

  private makeAIDecision(player: Player): void {
    if (player.territories.length === 0) return;

    const randomTerritory = player.territories[Math.floor(Math.random() * player.territories.length)];
    const territory = this.state.territories.get(randomTerritory)!;

    // Find nearby enemy territories
    const nearbyEnemies: Territory[] = [];
    this.state.territories.forEach((other) => {
      if (other.owner !== player.id && other.owner !== '') {
        const distance = Math.hypot(other.position.x - territory.position.x, other.position.y - territory.position.y);
        if (distance < 500) {
          nearbyEnemies.push(other);
        }
      }
    });

    if (nearbyEnemies.length > 0 && territory.troops > 100) {
      const target = nearbyEnemies[Math.floor(Math.random() * nearbyEnemies.length)];
      this.sendArmy(player.id, randomTerritory, target.position, territory.troops * 0.3, UnitType.INFANTRY);
    }
  }

  public sendArmy(
    playerId: string,
    fromTerritoryId: string,
    destination: { x: number; y: number },
    troops: number,
    unitType: UnitType
  ): void {
    const territory = this.state.territories.get(fromTerritoryId)!;
    if (territory.troops < troops) return;

    territory.troops -= troops;

    const army: Army = {
      id: uuidv4(),
      owner: playerId,
      position: { ...territory.position },
      destination,
      troops,
      unitType,
    };

    this.state.armies.set(army.id, army);

    const player = this.state.players.get(playerId)!;
    player.armies.push(army.id);
  }

  private getTerritoryAt(position: { x: number; y: number }): Territory | null {
    for (const territory of this.state.territories.values()) {
      const distance = Math.hypot(position.x - territory.position.x, position.y - territory.position.y);
      if (distance < territory.size) {
        return territory;
      }
    }
    return null;
  }

  private getUnitStats(unitType: UnitType) {
    const stats = {
      [UnitType.INFANTRY]: { speed: 1, strength: 1, cost: 10, capacity: 1 },
      [UnitType.TANK]: { speed: 0.6, strength: 2, cost: 40, capacity: 1 },
      [UnitType.SCOUT]: { speed: 1.8, strength: 0.5, cost: 5, capacity: 1 },
    };
    return stats[unitType];
  }

  public subscribe(callback: (state: GameState) => void): void {
    this.updateCallbacks.push(callback);
  }

  private notifySubscribers(): void {
    this.updateCallbacks.forEach((callback) => callback(this.state));
  }

  public getState(): GameState {
    return this.state;
  }

  public pause(): void {
    this.state.isPaused = true;
  }

  public resume(): void {
    this.state.isPaused = false;
  }
}