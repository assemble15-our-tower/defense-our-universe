import { Base } from './base.js';
import { Monster } from './monster.js';
import { Tower } from './tower.js';
import { sendEvent } from './Socket.js';
// import Score from './Score.js';
import './Socket.js';
import { CLIENT_VERSION } from './Constants.js';
import monsterTable from './assets/monster.json' with { type: 'json' };
import monsterUnlockTable from './assets/monster_unlock.json' with { type: 'json' };
import stageTable from './assets/stage.json' with { type: 'json' };
import towerTable from './assets/tower.json' with { type: 'json' };
import baseTable from './assets/base.json' with { type: 'json' };
import towerUpgradeTable from './assets/tower_upgrade.json' with { type: 'json' };

// 어딘가에 엑세스 토큰이 저장이 안되어 있다면 로그인을 유도하는 코드를 여기에
const authorization = sessionStorage.getItem('authorization');
if (!authorization) {
  alert('로그인 해줘 제발 ..');
  window.location.href = 'login.html';
}

// let serverSocket; // 서버 웹소켓 객체
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

//CONFIGS
const MONSTER_CONFIG = monsterTable.data;
const MONSTER_UNLOCK_CONFIG = monsterUnlockTable.data;
const STAGE_DATA = stageTable.data;
const TOWER_CONFIG = towerTable.data;
const UPGRADE_CONFIG = towerUpgradeTable.data;
const BASE_CONFIG = baseTable.data;
const towers = [];
const monsters = [];

const NUM_OF_MONSTERS = 5; // 몬스터 개수

let userGold = 100000; // 유저 골드
let base; // 기지 객체
let baseHp = BASE_CONFIG[0].hp; // 기지 체력

let towerCost = TOWER_CONFIG[0].cost; // 타워 구입 비용
let numOfInitialTowers = TOWER_CONFIG[0].level + 1; // 초기 타워 개수
let monsterLevel = STAGE_DATA[0].monsterLevel; // 몬스터 레벨
let monsterSpawnInterval = 2000; // 몬스터 생성 주기

let score = 0; // 게임 점수
const highScore = Number(localStorage.getItem('highScore')); // 기존 최고 점수
let isInitGame = false;

// 이미지 로딩 파트
const backgroundImage = new Image();
backgroundImage.src = 'images/bg.webp';

const towerImage = new Image();
towerImage.src = 'images/tower1.png';

const baseImage = new Image();
baseImage.src = 'images/base.png';

const burningbaseImage = new Image();
burningbaseImage.src = 'images/base_fire.png';

const pathImage = new Image();
pathImage.src = 'images/path.png';

const defeatSound = new Audio();
defeatSound.src = 'sounds/defeat2.mp3';

const bgmSource = new Audio();
bgmSource.src = 'sounds/start_of_adventure.wav';

const monsterImages = [];
for (let i = 1; i <= NUM_OF_MONSTERS; i++) {
  const img = new Image();
  img.src = `images/monster${i}.png`;
  monsterImages.push(img);
}

let monsterPath;

function generateRandomMonsterPath() {
  const path = [];
  let currentX = 0;
  let currentY = Math.floor(Math.random() * 21) + 500; // 500 ~ 520 범위의 y 시작 (캔버스 y축 중간쯤에서 시작할 수 있도록 유도)

  path.push({ x: currentX, y: currentY });

  while (currentX < canvas.width) {
    currentX += Math.floor(Math.random() * 100) + 50; // 50 ~ 150 범위의 x 증가
    // x 좌표에 대한 clamp 처리
    if (currentX > canvas.width) {
      currentX = canvas.width;
    }

    currentY += Math.floor(Math.random() * 200) - 100; // -100 ~ 100 범위의 y 변경
    // y 좌표에 대한 clamp 처리
    if (currentY < 0) {
      currentY = 0;
    }
    if (currentY > canvas.height) {
      currentY = canvas.height;
    }

    path.push({ x: currentX, y: currentY });
  }

  return path;
}

function initMap() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 그리기
  drawPath();
  sendEvent(2, { message: '게임 시작' });
}

function drawPath() {
  const segmentLength = 20; // 몬스터 경로 세그먼트 길이
  const imageWidth = 60; // 몬스터 경로 이미지 너비
  const imageHeight = 60; // 몬스터 경로 이미지 높이
  const gap = 5; // 몬스터 경로 이미지 겹침 방지를 위한 간격

  for (let i = 0; i < monsterPath.length - 1; i++) {
    const startX = monsterPath[i].x;
    const startY = monsterPath[i].y;
    const endX = monsterPath[i + 1].x;
    const endY = monsterPath[i + 1].y;

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // 피타고라스 정리로 두 점 사이의 거리를 구함 (유클리드 거리)
    const angle = Math.atan2(deltaY, deltaX); // 두 점 사이의 각도는 tan-1(y/x)로 구해야 함 (자세한 것은 역삼각함수 참고): 삼각함수는 변의 비율! 역삼각함수는 각도를 구하는 것!

    for (let j = gap; j < distance - gap; j += segmentLength) {
      // 사실 이거는 삼각함수에 대한 기본적인 이해도가 있으면 충분히 이해하실 수 있습니다.
      // 자세한 것은 https://thirdspacelearning.com/gcse-maths/geometry-and-measure/sin-cos-tan-graphs/ 참고 부탁해요!
      const x = startX + Math.cos(angle) * j; // 다음 이미지 x좌표 계산(각도의 코사인 값은 x축 방향의 단위 벡터 * j를 곱하여 경로를 따라 이동한 x축 좌표를 구함)
      const y = startY + Math.sin(angle) * j; // 다음 이미지 y좌표 계산(각도의 사인 값은 y축 방향의 단위 벡터 * j를 곱하여 경로를 따라 이동한 y축 좌표를 구함)
      drawRotatedImage(pathImage, x, y, imageWidth, imageHeight, angle);
    }
  }
}

function drawRotatedImage(image, x, y, width, height, angle) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(angle);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}

function getRandomPositionNearPath(maxDistance) {
  // 타워 배치를 위한 몬스터가 지나가는 경로 상에서 maxDistance 범위 내에서 랜덤한 위치를 반환하는 함수!
  const segmentIndex = Math.floor(Math.random() * (monsterPath.length - 1));
  const startX = monsterPath[segmentIndex].x;
  const startY = monsterPath[segmentIndex].y;
  const endX = monsterPath[segmentIndex + 1].x;
  const endY = monsterPath[segmentIndex + 1].y;

  const t = Math.random();
  const posX = startX + t * (endX - startX);
  const posY = startY + t * (endY - startY);

  const offsetX = (Math.random() - 0.5) * 2 * maxDistance;
  const offsetY = (Math.random() - 0.5) * 2 * maxDistance;

  return {
    x: posX + offsetX,
    y: posY + offsetY,
  };
}

function placeInitialTowers() {
  for (let i = 0; i < numOfInitialTowers; i++) {
    const { x, y } = getRandomPositionNearPath(200);
    const tower = new Tower(x, y, 0);
    towers.push(tower);
    tower.draw(ctx, towerImage);
  }
}

function placeNewTower() {
  if (userGold < towerCost) {
    alert('소지금이 부족해!');
    return;
  }
  userGold -= towerCost; // 타워 구입 비용 차감
  const { x, y } = getRandomPositionNearPath(200); // 랜덤 위치 생성
  const tower = new Tower(x, y, 0); // 타워 생성
  towers.push(tower); // 타워 배열에 추가
  tower.draw(ctx, towerImage); // 타워 그리기
}

function setHighScore() {
  const highScore = Number(localStorage.getItem('highScore'));
  if (!highScore || score > highScore) {
    localStorage.setItem('highScore', Math.floor(score));
  }
}

// 타워들 저장 배열인 towers가 game.js 안에 있다
// 타워들의 현재 레벨만 불러올 수 있다면 업그레이드 할 수 있을 것 같은데...

export const upgradeTower = () => {
  // 현재 타워 레벨을 배열로 가져오기
  const currentTowerLevels = towers.map((tower) => tower.level);
  console.log('현재 타워 레벨:', currentTowerLevels);

  // 모든 타워 업그레이드 비용 계산
  let totalUpgradeCost = 0;

  towers.forEach((tower) => {
    const nextLevel = tower.level + 1; // 다음 레벨
    const upgradeCost = towerUpgradeTable.data[nextLevel]?.cost; // 다음 레벨의 업그레이드 비용

    if (upgradeCost) {
      totalUpgradeCost += upgradeCost; // 다음 레벨의 업그레이드 비용 누적
    } else {
      console.warn(`Level ${nextLevel}에 대한 업그레이드 비용이 없습니다.`);
    }
  });

  console.log('총 업그레이드 비용:', totalUpgradeCost);

  // 소지금이 충분한 경우 업그레이드
  if (totalUpgradeCost <= userGold) {
    userGold -= totalUpgradeCost; // 소지금 차감
    towers.forEach((tower) => tower.upgrade()); // 모든 타워 업그레이드
  } else {
    alert('업그레이드에 필요한 소지금이 부족합니다!'); // 오류 메시지
  }
};

function placeBase() {
  const lastPoint = monsterPath[monsterPath.length - 1];
  base = new Base(lastPoint.x, lastPoint.y, baseHp);
  base.draw(ctx, baseImage);
}

function spawnMonster() {
  monsters.push(new Monster(monsterPath, monsterImages, monsterLevel));
}

function gameLoop() {
  // 렌더링 시에는 항상 배경 이미지부터 그려야 합니다! 그래야 다른 이미지들이 배경 이미지 위에 그려져요!
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 다시 그리기
  drawPath(monsterPath); // 경로 다시 그리기

  bgmSource.volume = 0.1;
  bgmSource.play();

  ctx.font = 'bold 25px Times New Roman';
  ctx.fillStyle = 'skyblue';
  ctx.fillText(`최고 기록: ${highScore}`, 100, 50); // 최고 기록 표시
  ctx.fillStyle = 'white';
  ctx.fillText(`점수: ${score}`, 100, 100); // 현재 스코어 표시
  ctx.fillStyle = 'yellow';
  ctx.fillText(`골드: ${userGold}`, 100, 150); // 골드 표시
  ctx.fillStyle = 'black';
  ctx.fillText(`현재 레벨: ${monsterLevel}`, 100, 200); // 최고 기록 표시

  // 타워 그리기 및 몬스터 공격 처리
  towers.forEach((tower) => {
    tower.draw(ctx, towerImage);
    tower.updateCooldown();
    monsters.forEach((monster) => {
      const distance = Math.sqrt(
        Math.pow(tower.x - monster.x, 2) + Math.pow(tower.y - monster.y, 2),
      );
      if (distance < tower.range) {
        tower.attack(monster);
      }
    });
  });

  // 몬스터가 공격을 했을 수 있으므로 기지 다시 그리기
  base.draw(ctx, baseImage);
  for (let i = monsters.length - 1; i >= 0; i--) {
    const monster = monsters[i];
    if (monster.hp > 0) {
      const isDestroyed = monster.move(base);
      if (base.hp <= base.maxHp / 2) {
        base.draw(ctx, burningbaseImage);
      }
      if (isDestroyed) {
        /* 게임 오버 */
        bgmSource.pause();
        setHighScore();
        sendEvent(3, { score });
        alert('게임 오버. 스파르타 본부를 지키지 못했다...ㅠㅠ');

        window.location.href = 'index.html';
        location.reload();
        break;
      }
      monster.draw(ctx);
    } else {
      /* 몬스터가 죽었을 때 */
      defeatSound.volume = 0.2;
      defeatSound.play();

      const monsterScore = MONSTER_CONFIG[i].score;
      const monsterGold = MONSTER_CONFIG[i].gold;

      score += monsterScore;
      userGold += monsterGold;

      sendEvent(17, { monsterScore, monsterGold, score });

      if (score % 2000 === 0) {
        monsterLevel++;
        monsterSpawnInterval -= 500;
        base.hp += 30 * monsterLevel;
        base.maxHp += 30 * monsterLevel;
      }

      monsters.splice(i, 1);
    }
  }

  requestAnimationFrame(gameLoop); // 지속적으로 다음 프레임에 gameLoop 함수 호출할 수 있도록 함
}

function initGame() {
  if (isInitGame) {
    return;
  }

  monsterPath = generateRandomMonsterPath(); // 몬스터 경로 생성
  initMap(); // 맵 초기화 (배경, 몬스터 경로 그리기)
  placeInitialTowers(); // 설정된 초기 타워 개수만큼 사전에 타워 배치
  placeBase(); // 기지 배치

  setInterval(spawnMonster, monsterSpawnInterval); // 설정된 몬스터 생성 주기마다 몬스터 생성
  gameLoop(); // 게임 루프 최초 실행
  isInitGame = true;
}

// 이미지 로딩 완료 후 서버와 연결하고 게임 초기화
Promise.all([
  new Promise((resolve) => (backgroundImage.onload = resolve)),
  new Promise((resolve) => (towerImage.onload = resolve)),
  new Promise((resolve) => (baseImage.onload = resolve)),
  new Promise((resolve) => (pathImage.onload = resolve)),
  ...monsterImages.map((img) => new Promise((resolve) => (img.onload = resolve))),
]).then(() => {
  if (!isInitGame) {
    initGame();
  }
  /* 
    서버의 이벤트들을 받는 코드들은 여기다가 쭉 작성해주시면 됩니다! 
    e.g. serverSocket.on("...", () => {...});
    이 때, 상태 동기화 이벤트의 경우에 아래의 코드를 마지막에 넣어주세요! 
    최초의 상태 동기화 이후에 게임을 초기화해야 하기 때문입니다! 
    if (!isInitGame) {
      initGame();
    }
  */
});

const buyTowerButton = document.createElement('button');
buyTowerButton.textContent = '타워 구입';
buyTowerButton.style.position = 'absolute';
buyTowerButton.style.top = '10px';
buyTowerButton.style.right = '10px';
buyTowerButton.style.padding = '10px 20px';
buyTowerButton.style.fontSize = '16px';
buyTowerButton.style.cursor = 'pointer';

buyTowerButton.addEventListener('click', placeNewTower);

document.body.appendChild(buyTowerButton);

const upgradeTowerButton = document.createElement('button');
upgradeTowerButton.textContent = '타워 업그레이드';
upgradeTowerButton.style.position = 'absolute';
upgradeTowerButton.style.top = '10px';
upgradeTowerButton.style.right = '150px';
upgradeTowerButton.style.padding = '10px 20px';
upgradeTowerButton.style.fontSize = '16px';
upgradeTowerButton.style.cursor = 'pointer';

upgradeTowerButton.addEventListener('click', upgradeTower);

document.body.appendChild(upgradeTowerButton);
