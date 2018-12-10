import { Injectable } from '@angular/core';

@Injectable()
export class BestScoreManager {

  private ngxMario = 'ngx_mario';

  public store(score: number) {
    localStorage.setItem(this.ngxMario, JSON.stringify({ 'best_score': score }));
  }

  public retrieve() {
    let storage = this.parse();
    if (!storage) {
      this.store(0);
      storage = this.parse();
    }

    return storage.best_score;
  }

  private parse() {
    return JSON.parse(localStorage.getItem(this.ngxMario));
  }
}
