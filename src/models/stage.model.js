const stages = {};

// 스테이지 초기화
export const initializeStage = (uuid) => {
  stages[uuid] = [];
};

export const getStage = (uuid) => {
  return stages[uuid];
};

// 시간단위로 점수 얻는게 아니라서 timestamp 필요X - 스테이지 id만 받아와서 넣어준다 
export const setStage = (uuid, id) => {
  return stages[uuid].push(id);
};
