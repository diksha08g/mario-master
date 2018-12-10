import { Component } from '@angular/core';
import { BestScoreManager } from './app.storage.service';
import { CONTROLS, COLORS, GAME_MODES } from './app.constants';

@Component({
  selector: 'ngx-mario',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {
    '(document:keydown)': 'handleKeyboardEvents($event)'
  }
})
export class AppComponent {
  private interval: number;
  private tempDirection: number;
  private isGameOver = false;

  public all_modes = GAME_MODES;
  public getKeys = Object.keys;
  public board = [];
  public score = 0;
  public cellsMoved = 0;
  public showMenuChecker = false;
  public gameStarted = false;
  public newBestScore = false;
  a: number = 0; //set default value as 0
  b: number = 0;
  public best_score = this.bestScoreService.retrieve();
  private startFlag;
  private mario = {
    direction: CONTROLS.LEFT,
    parts: [
      {
        x: -1,
        y: -1
      }
    ]
  };

  private fruit = {
    x: -1,
    y: -1
  };
  fruits: Array<any> = [];

  constructor(
    private bestScoreService: BestScoreManager
  ) {
    // this.setBoard();
  }

  handleKeyboardEvents(e: KeyboardEvent) {
    if (e.keyCode === CONTROLS.LEFT) {
      this.tempDirection = CONTROLS.LEFT;
    } else if (e.keyCode === CONTROLS.UP) {
      this.tempDirection = CONTROLS.UP;
    } else if (e.keyCode === CONTROLS.RIGHT) {
      this.tempDirection = CONTROLS.RIGHT;
    } else if (e.keyCode === CONTROLS.DOWN) {
      this.tempDirection = CONTROLS.DOWN;
    }
    if ((e.keyCode === CONTROLS.LEFT) || (e.keyCode === CONTROLS.RIGHT) || (e.keyCode === CONTROLS.UP) || (e.keyCode === CONTROLS.DOWN)) {
      this.startFlag = true;

    }
  }

  setColors(col: number, row: number): string {
    if (this.isGameOver) {
      return COLORS.GAME_OVER;
    } else if (this.fruits && this.checkFruit(col, row)) {
      return require('./assets/apple (1).png');
    } else if (this.mario.parts[0].x === row && this.mario.parts[0].y === col) {
      return require('./assets/icons8-super-mario-32.png');
    }

    return require('./assets/grass (1).png');
  };
  checkFruit(col, row) {
    for (let i = 0; i < this.fruits.length; i++) {
      if (this.fruits[i].x === row && this.fruits[i].y === col) {
        return true;
      }
    }
  };
  updatePositions(): void {
    let newHead;
    let me = this;
    if (this.startFlag) {
      newHead = this.repositionHead();
      this.cellsMoved++;

      this.noWallsTransition(newHead);
      if (this.fruitCollision(newHead)) {
        this.eatFruit();
      }

      let oldTail = this.mario.parts.pop();
      this.board[oldTail.x][oldTail.y] = false;

      this.mario.parts.unshift(newHead);
      this.board[newHead.x][newHead.y] = true;

      this.mario.direction = this.tempDirection;
    }
    setTimeout(() => {
      me.updatePositions();
    }, this.interval);
  }

  repositionHead(): any {
    let newHead = Object.assign({}, this.mario.parts[0]);

    if (this.tempDirection === CONTROLS.LEFT) {
      newHead.y -= 1;
    } else if (this.tempDirection === CONTROLS.RIGHT) {
      newHead.y += 1;
    } else if (this.tempDirection === CONTROLS.UP) {
      newHead.x -= 1;
    } else if (this.tempDirection === CONTROLS.DOWN) {
      newHead.x += 1;
    }

    return newHead;
  }

  noWallsTransition(part: any): void {
    if (part.x === this.a) {
      part.x = 0;
    } else if (part.x === -1) {
      part.x = this.a - 1;
    }

    if (part.y === this.b) {
      part.y = 0;
    } else if (part.y === -1) {
      part.y = this.b - 1;
    }
  }

  boardCollision(part: any): boolean {
    return part.x === this.a || part.x === -1 || part.y === this.b || part.y === -1;
  }

  fruitCollision(part: any): boolean {
    let checkCollision = false;
    for (let f = 0; f < this.fruits.length; f++) {
      if (part.x === this.fruits[f].x && part.y === this.fruits[f].y) {
        checkCollision = true;
        this.fruits.splice(f, 1);
        break;
      }
    }
    return checkCollision;
  }

  resetFruit(): void {
    let x = this.randomNumber(this.a);
    let y = this.randomNumber(this.b);

    if (this.board[x][y] === true) {
      return this.resetFruit();
    }

    this.fruit = {
      x: x,
      y: y
    };
    this.fruits.push(this.fruit);
    if (this.fruits.length < this.b) {
      return this.resetFruit();
    }
  }

  eatFruit(): void {
    this.score++;
    if (this.fruits.length === 0) {
      this.gameOver();
    }
  }

  gameOver(): void {
    this.isGameOver = true;
    this.gameStarted = false;
    let me = this;

    if (this.score > this.best_score) {
      this.bestScoreService.store(this.score);
      this.best_score = this.score;
      this.newBestScore = true;
    }
    this.startFlag = false;

    this.setGameBoard();
  }

  randomNumber(axis): any {
    return Math.floor(Math.random() * axis);
  }
  setGameBoard(): void {
    this.board = [];

    for (let i = 0; i < this.a; i++) {
      this.board[i] = [];
      for (let j = 0; j < this.b; j++) {
        this.board[i][j] = false;
      }
    }
  }

  showMenu(): void {
    this.showMenuChecker = !this.showMenuChecker;
  }

  newGame(): void {
    this.setGameBoard();
    this.startFlag = false;
    this.showMenuChecker = false;
    this.newBestScore = false;
    this.gameStarted = true;
    this.score = 0;
    this.tempDirection = CONTROLS.LEFT;
    this.isGameOver = false;
    this.interval = 200;
    this.mario = {
      direction: CONTROLS.LEFT,
      parts: []
    };
    this.mario.parts.push({ x: 0, y: 0 })
    this.resetFruit();
    this.updatePositions();

  }
}
