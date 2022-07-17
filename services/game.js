const { timezone } = require('../config');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault(timezone);
const datetime = require('../middleware/datetime');
const Class = require('./class');
const Point = require('./point');
const Chart = require('./chart');
const User = require('./user');
const pool = require('../middleware/database');

const OVER_ODD = 3.1;
const OVER_EVEN = 4.3;
const UNDER_ODD = 4.3;
const UNDER_EVEN = 3.1;
const OVER = 2;
const UNDER = 2;
const ODD = 2;
const EVEN = 2;

class Game extends Class {
  async setGame (data) {
    data = Object.assign({
      user: null,
      gameType: null,
      round: null,
      point: null,
      underOver: null,
      oddEven: null,
    }, data);
    const { user, gameType, round, point, underOver, oddEven } = data;
    if (user && gameType && round && Number(point) && (underOver || oddEven)) {
      let position = null;
      if (underOver === 'under' && oddEven === 'odd') {
        position = 'underOdd';
      } else if (underOver === 'under' && oddEven === 'even') {
        position = 'underEven';
      } else if (underOver === 'over' && oddEven === 'odd') {
        position = 'overOdd';
      } else if (underOver === 'over' && oddEven === 'even') {
        position = 'overEven';
      } else if (underOver === 'under') {
        position = 'under';
      } else if (underOver === 'over') {
        position = 'over';
      } else if (oddEven === 'odd') {
        position = 'odd';
      } else if (oddEven === 'even') {
        position = 'even';
      }
      let query = '';
      if (gameType === 1) {
        query = `INSERT INTO game
        (game_user_ID, game_chartOneMinute_ID, position, point)
        VALUES (?, ?, ?, ?)`;
      } else if (gameType === 3) {
        query = `INSERT INTO game
        (game_user_ID, game_chartThreeMinute_ID, position, point)
        VALUES (?, ?, ?, ?)`;
      } else if (gameType === 5) {
        query = `INSERT INTO game
        (game_user_ID, game_chartFiveMinute_ID, position, point)
        VALUES (?, ?, ?, ?)`;
      }
      try {
        const chartClass = new Chart(this.req, this.res, this.conn);
        const chartId = await chartClass.getByRound(gameType, round);
        await this.conn.query(query, [user.id, chartId, position, point]);
        const pointClass = new Point(this.req, this.res, this.conn);
        const pointData = {
          user,
          type: 'game',
          point,
        };
        pointClass.remove(pointData);
        return true;
      } catch (e) {
        console.error(e);
        throw new Error('게임 등록 실패');
      }
    } else {
      throw new Error('입력값이 부족합니다');
    }
  }
  async getGames (gameType) {
    let query = null;
    if (gameType === 1) {
      query = `SELECT g.*, c.priceOpen, c.priceClose, c.underOver, c.oddEven
      FROM game AS g
      LEFT JOIN chartOneMinute AS c
      ON g.game_chartOneMinute_ID = c.id
      WHERE g.game_chartOneMinute_ID AND c.priceClose AND g.result IS NULL
      ORDER BY id ASC`;
    } else if (gameType === 3) {
      query = `SELECT g.*, c.priceOpen, c.priceClose, c.underOver, c.oddEven
      FROM game AS g
      LEFT JOIN chartThreeMinute AS c
      ON g.game_chartThreeMinute_ID = c.id
      WHERE g.game_chartThreeMinute_ID AND c.priceClose AND g.result IS NULL
      ORDER BY id ASC`;
    } else if (gameType === 5) {
      query = `SELECT g.*, c.priceOpen, c.priceClose, c.underOver, c.oddEven
      FROM game AS g
      LEFT JOIN chartFiveMinute AS c
      ON g.game_chartFiveMinute_ID = c.id
      WHERE g.game_chartFiveMinute_ID AND c.priceClose AND g.result IS NULL
      ORDER BY id ASC`;
    }
    const [games, ] = await this.conn.query(query);
    return games;
  }
  async updateResult (gameId, result) {
    await this.conn.query(`UPDATE game SET result=? WHERE id=?`, [result, gameId]);
  }
  async getRecentResult (data) {
    data = Object.assign({
      user: null,
      type: null,
    }, data);
    const { user, type } = data;
    let query = null;
    if (type === 1) {
      query = `SELECT g.*, c.round, c.datetime AS datetimeRaw
      FROM game AS g
      LEFT JOIN chartOneMinute AS c
      ON g.game_chartOneMinute_ID = c.id
      WHERE game_user_ID=? AND game_chartOneMinute_ID
      ORDER BY id DESC
      LIMIT 10`;
    } else if (type === 3) {
      query = `SELECT g.*, c.round, c.datetime AS datetimeRaw
      FROM game AS g
      LEFT JOIN chartThreeMinute AS c
      ON g.game_chartThreeMinute_ID = c.id
      WHERE game_user_ID=? AND game_chartThreeMinute_ID
      ORDER BY id DESC
      LIMIT 10`;
    } else if (type === 5) {
      query = `SELECT g.*, c.round, c.datetime AS datetimeRaw
      FROM game AS g
      LEFT JOIN chartFiveMinute AS c
      ON g.game_chartFiveMinute_ID = c.id
      WHERE game_user_ID=? AND game_chartFiveMinute_ID
      ORDER BY id DESC
      LIMIT 10`;
    }
    const [results, ] = await this.conn.query(query, [user?.id]);
    results.forEach(result => {
      result.datetime = moment(result.datetimeRaw).format('hh:mm');
      if (result.position === 'overOdd') {
        result.pointCalc = result.point * OVER_ODD;
      } else if (result.position === 'overEven') {
        result.pointCalc = result.point * OVER_EVEN;
      } else if (result.position === 'underOdd') {
        result.pointCalc = result.point * UNDER_ODD;
      } else if (result.position === 'underEven') {
        result.pointCalc = result.point * UNDER_EVEN;
      } else if (result.position === 'over') {
        result.pointCalc = result.point * OVER;
      } else if (result.position === 'under') {
        result.pointCalc = result.point * UNDER;
      } else if (result.position === 'odd') {
        result.pointCalc = result.point * ODD;
      } else if (result.position === 'even') {
        result.pointCalc = result.point * EVEN;
      }
    });
    return results;
  }
  async getStatistics (type) {
    let query = null;
    if (type === 1) {
      query = `SELECT *
      FROM chartOneMinute
      ORDER BY id DESC
      LIMIT 300`;
    } else if (type === 3) {
      query = `SELECT *
      FROM chartThreeMinute
      ORDER BY id DESC
      LIMIT 300`;
    } else if (type === 5) {
      query = `SELECT *
      FROM chartFiveMinute
      ORDER BY id DESC
      LIMIT 300`;
    }
    const [charts, ] = await this.conn.query(query);
    const underOver = [];
    const oddEven = [];
    let i = 0;
    let underOverStatus = null;
    let oddEvenStatus = null;
    // underOver
    for (let chart of charts) {
      if (chart.underOver === 'under') {
        if (underOverStatus === null) {
          underOver[i] = {
            status: 'under',
            charts: [],
          };
          underOver[i].charts.push(chart);
        } else if (underOverStatus === 'over') {
          ++i;
          underOver[i] = {
            status: 'under',
            charts: [],
          };
          underOver[i].charts.push(chart);
        } else {
          underOver[i].charts.push(chart);
        }
        underOverStatus = 'under';
      } else if (chart.underOver === 'over') {
        if (underOverStatus === null) {
          underOver[i] = {
            status: 'over',
            charts: [],
          };
          underOver[i].charts.push(chart);
        } else if (underOverStatus === 'under') {
          ++i;
          underOver[i] = {
            status: 'over',
            charts: [],
          };
          underOver[i].charts.push(chart);
        } else {
          underOver[i].charts.push(chart);
        }
        underOverStatus = 'over';
      }
    }
    // oddEven
    let j = 0;
    for (let chart of charts) {
      if (chart.oddEven === 'odd') {
        if (oddEvenStatus === null) {
          oddEven[j] = {
            status: 'odd',
            charts: [],
          };
          oddEven[j].charts.push(chart);
        } else if (oddEvenStatus === 'even') {
          ++j;
          oddEven[j] = {
            status: 'odd',
            charts: [],
          };
          oddEven[j].charts.push(chart);
        } else {
          oddEven[j].charts.push(chart);
        }
        oddEvenStatus = 'odd';
      } else if (chart.oddEven === 'even') {
        if (oddEvenStatus === null) {
          oddEven[j] = {
            status: 'even',
            charts: [],
          };
          oddEven[j].charts.push(chart);
        } else if (oddEvenStatus === 'odd') {
          ++j;
          oddEven[j] = {
            status: 'even',
            charts: [],
          };
          oddEven[j].charts.push(chart);
        } else {
          oddEven[j].charts.push(chart);
        }
        oddEvenStatus = 'even';
      }
    }
    underOver.reverse();
    oddEven.reverse();
    underOver.forEach(item => {
      item.charts.reverse();
    });
    oddEven.forEach(item => {
      item.charts.reverse();
    });
    return {
      underOver,
      oddEven,
    };
  }
  async makeGameResult () {
    const conn = await pool.getConnection();
    try {
      this.conn = conn;
      const oneGames = await this.getGames(1);
      const userClass = new User(null, null, this.conn);
      const pointClass = new Point(null, null, this.conn);
      for (let game of oneGames) {
        if (game.position === 'overOdd' && game.underOver === 'over' && game.oddEven === 'odd') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * OVER_ODD,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'overEven' && game.underOver === 'over' && game.oddEven === 'even') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * OVER_EVEN,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'underOdd' && game.underOver === 'under' && game.oddEven === 'odd') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * UNDER_ODD,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'underEven' && game.underOver === 'under' && game.oddEven === 'even') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * UNDER_EVEN,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'over' && game.underOver === 'over') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * OVER,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'under' && game.underOver === 'under') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * UNDER,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'odd' && game.oddEven === 'odd') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * ODD,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'even' && game.oddEven === 'odd') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * EVEN,
          };
          await pointClass.create(pointData);
        } else { // 아무것도 아님
          await this.updateResult(game.id, 0);
        }
      }
      const threeGames = await this.getGames(3);
      for (let game of threeGames) {
        console.log(game);
        if (game.position === 'overOdd' && game.underOver === 'over' && game.oddEven === 'odd') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * OVER_ODD,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'overEven' && game.underOver === 'over' && game.oddEven === 'even') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * OVER_EVEN,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'underOdd' && game.underOver === 'under' && game.oddEven === 'odd') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * UNDER_ODD,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'underEven' && game.underOver === 'under' && game.oddEven === 'even') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * UNDER_EVEN,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'over' && game.underOver === 'over') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * OVER,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'under' && game.underOver === 'under') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * UNDER,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'odd' && game.oddEven === 'odd') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * ODD,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'even' && game.oddEven === 'odd') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * EVEN,
          };
          await pointClass.create(pointData);
        } else { // 아무것도 아님
          await this.updateResult(game.id, 0);
        }
      }
      const fiveGames = await this.getGames(5);
      for (let game of fiveGames) {
        console.log(game);
        if (game.position === 'overOdd' && game.underOver === 'over' && game.oddEven === 'odd') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * OVER_ODD,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'overEven' && game.underOver === 'over' && game.oddEven === 'even') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * OVER_EVEN,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'underOdd' && game.underOver === 'under' && game.oddEven === 'odd') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * UNDER_ODD,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'underEven' && game.underOver === 'under' && game.oddEven === 'even') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * UNDER_EVEN,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'over' && game.underOver === 'over') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * OVER,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'under' && game.underOver === 'under') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * UNDER,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'odd' && game.oddEven === 'odd') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * ODD,
          };
          await pointClass.create(pointData);
        } else if (game.position === 'even' && game.oddEven === 'odd') {
          await this.updateResult(game.id, 1);
          const user = await userClass.get(game.game_user_ID);
          const pointData = {
            user,
            type: 'game',
            point: game.point * EVEN,
          };
          await pointClass.create(pointData);
        } else { // 아무것도 아님
          await this.updateResult(game.id, 0);
        }
      }
    } finally {
      conn.release();
    }
  }
  replaceData (rawData) {
    const data = {
      time: rawData.t,
      open: rawData.o,
      high: rawData.h,
      low: rawData.l,
      close: rawData.c,
    };
    return data;
  }
}

module.exports = Game;