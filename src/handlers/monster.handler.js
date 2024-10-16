import { getGameAssets } from '../init/asset.js';
import { getScore, setScore } from '../models/score.model.js';
import { getStage } from '../models/stage.model.js';
import { getuserGold, setuserGold } from '../models/usergold.model.js';
import stageTable from '../../public/assets/stage.json' with { type: 'json' };
import { moveStageHandler } from './stage.handler.js';

// 몬스터 처리에 대한 핸들러 - 페이로드에서 몬스터 처치당 점수와 골드를 받는다
export const eliminateMonster = (userId, payload) => {
  const { monsters } = getGameAssets();
  const { monsterId, monsterScore, monsterGold, score, userGold } = payload;

  // 몬스터 정보 조회
  const monster = monsters.data.find((monster) => (monster.id = monsterId));
  if (!monster) {
    return { status: 'fail', message: 'Invalid monster info' };
  }
  // 몬스터 id에 맞게 할당된 스코어인지 검증
  if (monster.score !== monsterScore) {
    return { status: 'fail', message: 'Monster score mismatch' };
  }
  // 몬스터 id에 맞게 할당된 골드인지 검증
  if (monster.gold !== monsterGold) {
    return { status: 'fail', message: 'Monster gold mismatch' };
  }

  // 몬스터도 있고 id에 할당된 골드, 스코어도 맞다면 더해준다
  const savedScore = getScore(userId);
  const earnedScore = savedScore + monster.score;
  const savedGold = getuserGold(userId);
  const earnedGold = savedGold + monster.gold;

  // 클라단에서 전해준 스코어, 골드와 비교해 유효한지 검증
  if (score !== earnedScore) {
    return { status: 'fail', message: 'Invalid score gaining' };
  }
  if (userGold !== earnedGold) {
    return { status: 'fail', message: 'Invalid gold gaining' };
  }
  setScore(userId, earnedScore);
  setuserGold(userId, earnedGold);

  // 일정 스테이지 이상이면 스테이지를 이동시켜 주고 싶다

  let currentStage = getStage(userId);
  for (let i = 0; i < stageTable.length; i++) {
    const stage = stageTable[i];
    if (
      Math.floor(score) >= stage.score &&
      stage.id > stageTable[0].id && 
      stage.id !== stageTable[0].id 
    ) {
      const previousStage = currentStage;
      currentStage = stage.id;

      // 스테이지 변경 핸들러 호출해서 현재 유저의 스테이지
      moveStageHandler(userId, { currentStage: previousStage, targetStage: currentStage });

      // 스테이지 변경 후 반복문 종료
      break;
    }
  }

  return { status: 'success', score: earnedScore, handler: 17 };
};
