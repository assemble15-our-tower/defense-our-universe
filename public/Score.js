import { sendEvent } from './Socket.js';

class Score {
  score = 0;
  HIGH_SCORE_KEY = 'highScore';
  stageChange = true;
  currentStage = 0;
  stageChanged = {};

  constructor(ctx, stageTable, monsterTable) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.stageTable = stageTable;
    this.monsterTable = monsterTable;

    // 모든 스테이지에 대해 stageChanged false로 전부 초기화
    this.stageTable.forEach((stage) => {
      this.stageChanged[stage.id] = false;
    });
    this.currentStage = this.stageTable[0].id;
  }

  // 스테이지 넘어갈 시점인지 체크
  checkStageChange() {
    for (let i = 0; i < this.stageTable.length; i++) {
      const stage = this.stageTable[i];

      if (
        Math.floor(this.score) >= stage.score &&
        !this.stageChanged[stage.id] &&
        stage.id !== this.stageTable[0].id
      ) {
        const previousStage = this.currentStage;
        this.currentStage = stage.id;

        // 해당 스테이지로 변경됨을 표시
        this.stageChanged[stage.id] = true;

        // 서버로 이벤트 전송
        sendEvent(11, { currentStage: previousStage, targetStage: this.currentStage });

        // 스테이지 변경 후 반복문 종료
        break;
      }
    }
  }

  eliminateMonster(monsterId) {
    const monsterInfo = this.monsterTable.find((monster) => monster.id === monsterId);
    if (monsterInfo) {
      this.score += monsterInfo.score;
      sendEvent(17, { monsterId, score : this.score });

      this.checkStageChange();
    }
  }

  reset() {
    this.score = 0;
    this.currentStage = this.stageTable[0].id;
    this.stageChanged = {};
  }

  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (!highScore || this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
    }
  }

  getScore() {
    return this.score;
  }

  draw() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const y = 20;
    const stageNumber = this.currentStage;

    const fontSize = 25;
    this.ctx.font = `bold ${fontSize}px Times New Roman`;
    this.ctx.fillStyle = '#fefefe';

    const scoreX = this.canvas.width - 75;
    const highScoreX = scoreX - 150;
    const stageNumberX = highScoreX - 530;

    const stageIndication = parseInt(stageNumber.toString().at(-1)) + 1;

    this.ctx.fillStyle = 'skyblue';
    this.ctx.fillText(`최고 기록: ${highScore}`, 100, 50); // 최고 기록 표시
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(`점수: ${this.score}`, 100, 100); // 현재 스코어 표시
  }
}

export default Score;
