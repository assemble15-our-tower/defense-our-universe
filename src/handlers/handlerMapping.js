import { gameEnd, gameStart } from './game.handler.js';
import { moveStageHandler } from './stage.handler.js';
import { bindTower } from './tower.handler.js';
import { handleEliminateMonster } from './monster.handler.js'

const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  11: moveStageHandler,
  17: handleEliminateMonster,
  99: bindTower

};

export default handlerMappings;
