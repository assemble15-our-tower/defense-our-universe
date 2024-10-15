const towers = {};

export const initializeTower = (uuid) => {
  towers[uuid] = [];
};

export const getTower = (uuid) => {
  return stages[uuid];
};

export const setTower = (uuid, id) => {
  return stages[uuid].push(id);
};
