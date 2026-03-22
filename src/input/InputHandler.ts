import { Vector2 } from '../types/index';
import * as PIXI from 'pixi.js';

export type InputCallback = (position: Vector2, button: number) => void;
export type DragCallback = (from: Vector2, to: Vector2) => void;

export class InputHandler {
  private canvas: HTMLCanvasElement;
  private clickCallbacks: InputCallback[] = [];
  private dragCallbacks: DragCallback[] = [];
  private dragStart: Vector2 | null = null;
  private isDragging: boolean = false;
  private dragThreshold: number = 5;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupListeners();
  }

  private setupListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));

    // Touch events
    this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));

    // Keyboard events
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  private getMousePos(e: MouseEvent | TouchEvent): Vector2 {
    const rect = this.canvas.getBoundingClientRect();
    let x, y;

    if (e instanceof MouseEvent) {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    }

    return { x, y };
  }

  private onMouseDown(e: MouseEvent): void {
    this.dragStart = this.getMousePos(e);
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.dragStart) return;

    const currentPos = this.getMousePos(e);
    const distance = Math.hypot(
      currentPos.x - this.dragStart.x,
      currentPos.y - this.dragStart.y
    );

    if (distance > this.dragThreshold && !this.isDragging) {
      this.isDragging = true;
    }
  }

  private onMouseUp(e: MouseEvent): void {
    if (!this.dragStart) return;

    const endPos = this.getMousePos(e);

    if (this.isDragging) {
      this.dragCallbacks.forEach((cb) => cb(this.dragStart!, endPos));
    } else {
      this.clickCallbacks.forEach((cb) => cb(endPos, e.button));
    }

    this.dragStart = null;
    this.isDragging = false;
  }

  private onMouseLeave(): void {
    this.dragStart = null;
    this.isDragging = false;
  }

  private onTouchStart(e: TouchEvent): void {
    this.dragStart = this.getMousePos(e);
  }

  private onTouchMove(e: TouchEvent): void {
    if (!this.dragStart) return;

    const currentPos = this.getMousePos(e);
    const distance = Math.hypot(
      currentPos.x - this.dragStart.x,
      currentPos.y - this.dragStart.y
    );

    if (distance > this.dragThreshold && !this.isDragging) {
      this.isDragging = true;
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    if (!this.dragStart) return;

    const endPos = this.getMousePos(e);

    if (this.isDragging) {
      this.dragCallbacks.forEach((cb) => cb(this.dragStart!, endPos));
    } else {
      this.clickCallbacks.forEach((cb) => cb(endPos, 0));
    }

    this.dragStart = null;
    this.isDragging = false;
  }

  private onKeyDown(e: KeyboardEvent): void {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        break;
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    // Handle key ups
  }

  public onClick(callback: InputCallback): void {
    this.clickCallbacks.push(callback);
  }

  public onDrag(callback: DragCallback): void {
    this.dragCallbacks.push(callback);
  }

  public isDragInProgress(): boolean {
    return this.isDragging;
  }
}