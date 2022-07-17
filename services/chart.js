const { timezone } = require('../config');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault(timezone);
const Class = require('./class');
const pool = require('../middleware/database');

class Chart extends Class {
  constructor (req, res, conn) {
    super(req, res, conn);
    this.status = false;
    this.close = null;
    this.open = null;
    this.high = null;
    this.low = null;
    this.minute = null;
  }
  async setData (type, data, dataRaw) {
    if (data) {
      const dateTime = moment(data[0]).format('YYYY-MM-DD HH:mm:ss');
      const hour = Number(moment(data[0]).format('hh'));
      const minute = Number(moment(data[0]).format('mm'));
      const second = Number(moment(data[0]).format('ss'));
      if (this.status === false) {
        this.minute = minute;
        this.status = true;
      }
      if (this.minute !== minute && minute % type === 0) {
        this.minute = minute;
        const dateTimeNext = makeDateTimeterm(data[0], type, 1);
        const dateTimeNextNext = makeDateTimeterm(data[0], type, 2);
        const conn = await pool.getConnection();
        try {
          this.conn = conn;
          const chart = await this.getByDateTime({ type, dateTime, dateTimeRaw: data[0], status: 0 });
          if (chart) {
            const roundCheckNext = moment(dateTimeNext).format('HHmmss');
            let roundNext = chart.round + 1; 
            roundCheckNext === '000000' ? roundNext : chart.round + 1;
            const chartNext = await this.getByDateTime({ type, round: roundNext, dateTime: dateTimeNext, status: 0 });
            if (chartNext) {
              const roundCheckNextNext = moment(dateTimeNextNext).format('HHmmss');
              let roundNextNext = chart.round + 1; 
              roundCheckNextNext === '000000' ? round : chartNext.round + 1;
              await this.getByDateTime({ type, round: roundNextNext, dateTime: dateTimeNextNext, status: 0 });
            }
            let underOver = null;
            let oddEven = null;
            const close = Math.floor(Number(data[4]));
            const lastNumber = Number(close.toString().slice(-1));
            const number = Number(Number(data[4]).toFixed(1).slice(-1));
            if (number > 4) {
              underOver = 'over';
            } else {
              underOver = 'under';
            }
            if (number % 2 === 0) {
              oddEven = 'even';
            } else {
              oddEven = 'odd';
            }
            const updateData = {
              priceOpen: data[1],
              priceHigh: data[2],
              priceLow: data[3],
              priceClose: data[4],
              status: 1,
              underOver,
              oddEven,
            };
            await this.update(type, chart.id, updateData);
            this.minute = data[0];
            this.open = data[1];
            this.high = data[2];
            this.low = data[3];
            this.close = data[4];
          }
        } finally {
          conn.release();
        }
      }
    }
  }
  async getByDateTime (data) {
    data = Object.assign({
      type: null,
      round: 1,
      dateTime: null,
      dateTimeRaw: null,
      status: 1,
    }, data);
    const { type, dateTime, dateTimeRaw, status } = data;
    let { round } = data;
    const roundCheck = moment(dateTimeRaw).format('HHmmss');
    console.log(roundCheck);
    if (roundCheck === '000000') round = 1;
    let query = null;
    if (type === 1) {
      query = `SELECT * FROM chartOneMinute WHERE datetime=? AND status=?`;
    } else if (type === 3) {
      query = `SELECT * FROM chartThreeMinute WHERE datetime=? AND status=?`;
    } else if (type === 5) {
      query = `SELECT * FROM chartFiveMinute WHERE datetime=? AND status=?`;
    }
    const [charts, ] = await this.conn.query(query, [dateTime, status]);
    if (charts.length) {
      const chart = charts[0];
      return chart;
    } else {
      const chartId = await this.create({ type, round, dateTime });
      const chart = await this.get(type, chartId);
      return chart;
    }
  }
  async get (type, chartId) {
    let charts = null;
    if (type === 1) {
      [charts, ] = await this.conn.query(`SELECT * FROM chartOneMinute WHERE id=?`, [chartId]);
    } else if (type === 3) {
      [charts, ] = await this.conn.query(`SELECT * FROM chartThreeMinute WHERE id=?`, [chartId]);
    } else if (type === 5) {
      [charts, ] = await this.conn.query(`SELECT * FROM chartFiveMinute WHERE id=?`, [chartId]);
    }
    if (charts.length) {
      const chart = charts[0];
      return chart;
    } else {
      return null;
    }
  }
  async create (data) {
    data = Object.assign({
      type: null,
      round: 1,
      dateTime: null,
      status: 0,
    }, data);
    const { type, round, dateTime, status } = data;
    let query = null;
    if (type === 1) {
      query = `INSERT INTO chartOneMinute (round, dateTime, status) VALUES (?, ?, ?)`;
    } else if (type === 3) {
      query = `INSERT INTO chartThreeMinute (round, dateTime, status) VALUES (?, ?, ?)`;
    } else if (type === 5) {
      query = `INSERT INTO chartFiveMinute (round, dateTime, status) VALUES (?, ?, ?)`;
    }
    try {
      const [result, ] = await this.conn.query(query, [round, dateTime, status]);
      if (result.insertId) {
        console.log(`Add ${type} minute chart complete`);
        return result.insertId;
      } else {
        return null;
      }
    } catch (e) {
      if (e.errno === 1062) {
        console.log(`Duplicate entry: ${dateTime}`);
      } else {
        console.error(e);
      }
      return null;
    }
  }
  async update (type, chartId, data) {
    const chart = await this.get(type, chartId);
    data = Object.assign({
      priceOpen: chart.priceOpen,
      priceHigh: chart.priceHigh,
      priceLow: chart.priceLow,
      priceClose: chart.priceClose,
      underOver: chart.underOver,
      oddEven: chart.oddEven,
      status: chart.status,
    }, data);
    const { priceOpen, priceHigh, priceLow, priceClose, underOver, oddEven, status } = data;
    let query = null;
    if (type === 1) {
      query = `UPDATE chartOneMinute
      SET priceOpen=?, priceHigh=?, priceLow=?, priceClose=?, underOver=?, oddEven=?, status=?
      WHERE id=?`;
    } else if (type === 3) {
      query = `UPDATE chartThreeMinute
      SET priceOpen=?, priceHigh=?, priceLow=?, priceClose=?, underOver=?, oddEven=?, status=?
      WHERE id=?`;
    } else if (type === 5) {
      query = `UPDATE chartFiveMinute
      SET priceOpen=?, priceHigh=?, priceLow=?, priceClose=?, underOver=?, oddEven=?, status=?
      WHERE id=?`;
    }
    await this.conn.query(query, [priceOpen, priceHigh, priceLow, priceClose, underOver, oddEven, status, chartId]);
  }
  async remove () {

  }
  async getReadyChart (type, dateTimeRaw) {
    let query = null;
    if (type === 1) {
      query = `SELECT *
      FROM chartOneMinute
      WHERE status=0
      ORDER BY id DESC
      LIMIT 1`;
    } else if (type === 3) {
      query = `SELECT *
      FROM chartThreeMinute
      WHERE status=0
      ORDER BY id DESC
      LIMIT 1`;
    } else if (type === 5) {
      query = `SELECT *
      FROM chartFiveMinute
      WHERE status=0
      ORDER BY id DESC
      LIMIT 1`;
    }
    const [charts, ] = await this.conn.query(query);
    if (charts.length) {
      const chart = charts[0];
      return chart;
    } else {
      const lastChart = await this.getRecentChart(type);
      let round = 1;
      if (lastChart) round = lastChart.round + 1;
      const dateTime = moment(dateTimeRaw).format('YYYY-MM-DD HH:mm:ss');
      let result = null;
      if (type === 1) {
        [result, ] = await this.conn.query(`INSERT INTO chartOneMinute (round, dateTime, status) VALUES (?, ?, ?)`, [round, dateTime, 0]);
      } else if (type === 3) {
        [result, ] = await this.conn.query(`INSERT INTO chartThreeMinute (round, dateTime, status) VALUES (?, ?, ?)`, [round, dateTime, 0]);
      } else if (type === 5) {
        [result, ] = await this.conn.query(`INSERT INTO chartFiveMinute (round, dateTime, status) VALUES (?, ?, ?)`, [round, dateTime, 0]);
      }
      const chart = await this.get(type, result.insertId);
      return chart;
    }
  }
  async getReadyChartForApi (type) {
    let query = null;
    if (type === 1) {
      query = `SELECT *
      FROM chartOneMinute
      WHERE status=0
      ORDER BY id DESC
      LIMIT 1`;
    } else if (type === 3) {
      query = `SELECT *
      FROM chartThreeMinute
      WHERE status=0
      ORDER BY id DESC
      LIMIT 1`;
    } else if (type === 5) {
      query = `SELECT *
      FROM chartFiveMinute
      WHERE status=0
      ORDER BY id DESC
      LIMIT 1`;
    }
    // console.log(this.req, this.res, this.conn);
    const [charts, ] = await this.conn.query(query);
    if (charts.length) {
      const chart = charts[0];
      return {
        status: true,
        chart,
      };
    } else {
      return {
        status: false,
      };
    }
  }
  async getRecentChart (type) {
    let query = null;
    if (type === 1) {
      query = `SELECT *
      FROM chartOneMinute
      WHERE status=1
      ORDER BY id DESC
      LIMIT 1`;
    } else if (type === 3) {
      query = `SELECT *
      FROM chartThreeMinute
      WHERE status=1
      ORDER BY id DESC
      LIMIT 1`;
    } else if (type === 5) {
      query = `SELECT *
      FROM chartFiveMinute
      WHERE status=1
      ORDER BY id DESC
      LIMIT 1`;
    }
    const [charts, ] = await this.conn.query(query);
    if (charts.length) {
      const chart = charts[0];
      return chart;
    } else {
      return null;
    }
  }
  async getByRound (type, round) {
    let charts = null;
    if (type === 1) {
      [charts, ] = await this.conn.query(`SELECT * FROM chartOneMinute WHERE round=?`, [round]);
    } else if (type === 3) {
      [charts, ] = await this.conn.query(`SELECT * FROM chartThreeMinute WHERE round=?`, [round]);
    } else if (type === 5) {
      [charts, ] = await this.conn.query(`SELECT * FROM chartFiveMinute WHERE round=?`, [round]);
    }
    if (charts.length) {
      const chart = charts[0];
      return chart.id;
    } else {
      return null;
    }
  }
}

const makeDateTimeterm = (dateTimeRaw, type, term) => {
  const dateTimeReplace = moment(dateTimeRaw).add(Number(type) * Number(term), 'm').format('YYYY-MM-DD HH:mm:ss');
  return dateTimeReplace;
}

module.exports = Chart;