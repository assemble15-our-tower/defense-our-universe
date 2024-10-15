import { getGameAssets } from '../init/asset.js';
import { getStage } from '../models/stage.model.js';


export const handleEliminateMonster = (userId, payload) => {

    console.log('핸들몬스터의 페이로드?', payload)
    // const { monsters, monsterUnlocks } = getGameAssets();
    // const { monsterId } = payload;

    // // 일단 몬스터 정보 조회
    // const monster = monsters.data.find((monster) => monster.id = monsterId);
    // if(!monster) {
    //     return { status: 'fail', message : 'Invalid monster Info' };
    // }

    // // 유저의 현재 스테이지 정보 조회
    // const currentStages = getStage(userId);
    // if(!currentStages) {
    //     return { status : 'fail', message : 'No stages for this user'};
    // }

    // const currentStage = currentStages[currentStages.length -1].id;

    // // 현재 스테이지에서 나올 수 있는 몬스터인지 검증
    // const allowMonsters = monsterUnlocks.data.find((monster) => monster.stage_id === currentStage).monster_ids;
    // if(!allowMonsters.includes(monsterId)) {
    //     return { status : 'fail', message : 'Not allowed monster for this stage!!'};
    // }

    // return { status : 'success', handler : 17 }

}