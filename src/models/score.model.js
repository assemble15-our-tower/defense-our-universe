const userScores = new Map();

export const initializeScore = (userId) => {
  return userScores.set(userId, 0);
};

export const setScore = (userId, score) => {
  if (!userScores.has(userId)) {
    userScores.set(userId, 0);
  }
  return userScores.set(userId, score);
};

export const getScore = (userId) => {
  if (userScores.has(userId)) {
    return userScores.get(userId) || 0;
  }
};

export const setHighestScore = (userId, currentScore) => {
  const highScore = userScores.get(userId);
  if (currentScore > highScore) {
    return setScore(userId, currentScore);
  }
};
