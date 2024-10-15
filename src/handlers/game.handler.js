import { getGameAssets } from '../init/asset.js';
import { setStage, getStage, initializeStage } from '../models/stage.model.js';

export const gameStart = (uuid) => {
    const { stages } = getGameAssets();
    initializeStage(uuid);
    // stages 배열의 0번째 = 첫번째 스테이지 받아 서버에 저장할 것
    setStage(uuid, stages.data[0].id);
    console.log('Stage: ', getStage(uuid));
  
    return { status: 'success', handler : 2 };
  };

  export const gameEnd = (uuid, payload) => {
    // 클라 -> 서버로 점수를 전달할 것
    const { score } = payload;
    const stages = getStage(uuid);
  
    if (!stages.length) {
      return { status: 'fail', message: 'No stages found for this user' };
    }
    console.log(`Game ended by score : ${score}`);
  
    return { status: 'success', message: 'Game ended', handler : 3 };
  };
  