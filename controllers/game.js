const pool = require('../middleware/database');
const doAsync = require('../middleware/doAsync');
const Game = require('../services/game');

exports.game = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { gameType } = req.query;
    const user = res.locals.user;
    let gameTypeTitle = 1;
    if (gameType === undefined) {
      gameTypeTitle = 1;
    } else if (gameType === '3min') {
      gameTypeTitle = 3;
    } else if (gameType === '5min') {
      gameTypeTitle = 5;
    }
    const gameClass = new Game(req, res, conn);
    const data = {
      user,
      type: gameTypeTitle,
    };
    const results = await gameClass.getRecentResult(data);
    const { underOver, oddEven } = await gameClass.getStatistics(gameTypeTitle);
    res.render('game', {
      pageTitle: `코인미니게임 - ${res.locals.setting.siteName}`,
      gameType,
      gameTypeTitle,
      results,
      underOver,
      oddEven,
    });
  } finally {
    conn.release();
  }
});