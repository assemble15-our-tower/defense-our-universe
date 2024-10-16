import towerTable from './assets/tower.json' with { type: 'json' };
import towerUpgradeTable from './assets/tower_upgrade.json' with { type: 'json' };

export class Tower {
  constructor(x, y, level) {
    this.x = x; // 타워 이미지 x 좌표
    this.y = y; // 타워 이미지 y 좌표
    this.width = 78; // 타워 이미지 가로 길이
    this.height = 150; // 타워 이미지 세로 길이
    this.level = level; // 타워 레벨
    this.cooldown = 0; // 공격 쿨타임
    this.beamDuration = 0; // 광선 지속 시간
    this.target = null; // 현재 목표 몬스터
    this.updateProperties();
  }

  // 타워의 레벨에 따라 업데이트
  updateProperties() {
    const upgradeData = towerUpgradeTable.data[this.level];
    if (upgradeData) {
      this.attackPower = upgradeData.attackPower; // 공격력
      this.upgradeCost = upgradeData.cost; // 업그레이드
      this.image = upgradeData.image; // 타워 이미지
    } else {
      console.error(`Level ${this.level}의 업그레이드 정보를 찾을 수 없습니다.`);
    }

    this.range = 300; // 타워 사거리
    this.cost = towerTable.data[this.level].cost; // 초기 구매 비용
  }

  draw(ctx) {
    const towerImage = new Image();
    towerImage.src = this.image;
    ctx.drawImage(towerImage, this.x, this.y, this.width, this.height);

    if (this.beamDuration > 0 && this.target) {
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
      ctx.lineTo(this.target.x + this.target.width / 2, this.target.y + this.target.height / 2);
      ctx.strokeStyle = '#FFFF99';
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.closePath();
      this.beamDuration--;
    }
  }

  attack(monster) {
    if (this.cooldown <= 0) {
      monster.hp -= this.attackPower; // 몬스터의 HP 감소
      this.cooldown = 180; // 3초  60 당 1 초
      this.beamDuration = 30; // 광선 지속 시간
      this.target = monster; // 광선의 목표 설정
    }
  }

  updateCooldown() {
    if (this.cooldown > 0) {
      this.cooldown--;
    }
  }

  // 타워 업그레이드 메소드
  upgrade() {
    if (this.level < towerUpgradeTable.data.length - 1) {
      // 최대 레벨 확인
      this.level++;
      this.updateProperties(); // 타워 업그레이드 정보 업데이트
    } else {
      console.warn(`타워는 이미 최대 레벨(${this.level})에 도달했습니다.`);
    }
  }
}
