const userGold = new Map();

export const initializeGold = (userId, payload) => {
  const { userGold : initialUserGold } = payload;
  if (!initialUserGold) {
    userGold.set(userId, 0);
  }
  return userGold.set(userId, +initialUserGold);
};

export const setuserGold = (userId, gold) => {
  if (!userGold.has(userId)) {
    userGold.set(userId, 0);
  }
  return userGold.set(userId, gold);
};

export const getuserGold = (userId) => {
  return userGold.get(userId) || 0;
};
