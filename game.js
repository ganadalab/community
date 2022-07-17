const colors = require('colors');
const mysql = require('mysql2/promise');
const sql = require('./config.json').sql.production;

const pool = mysql.createPool({
  host: sql.host,
  user: sql.user,
  password: sql.password,
  port: sql.port,
});

const SALT_COUNT = 10;

const DATABASE_NAME = sql.database || 'cms';

const main = async () => {
  try {
    await start();
    await game();
    await chartOneMinute();
    await chartThreeMinute();
    await chartFiveMinute();
    await end();
  } catch (e) {
    console.error(e);
  }
};

const start = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const [result, ] = await conn.query(`SHOW DATABASES LIKE '${DATABASE_NAME}'`);
      if (result.length === 0) {
        await conn.query(`CREATE DATABASE ${DATABASE_NAME};`);
      }
      await conn.query(`USE ${DATABASE_NAME};`);
      await conn.query(`set FOREIGN_KEY_CHECKS = 0;`);
    } finally {
      conn.release();
    }
  } catch (e) {
    console.error(e);
  }
};

const game = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE game (
        id int unsigned NOT NULL AUTO_INCREMENT,
        game_user_ID int unsigned DEFAULT NULL,
        game_chartOneMinute_ID int unsigned DEFAULT NULL,
        game_chartThreeMinute_ID int unsigned DEFAULT NULL,
        game_chartFiveMinute_ID int unsigned DEFAULT NULL,
        \`position\` varchar(45) DEFAULT NULL,
        point int unsigned DEFAULT NULL,
        result tinyint unsigned DEFAULT NULL,
        status tinyint(1) DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY game_user_ID (game_user_ID),
        KEY game_chartOneMinute_ID (game_chartOneMinute_ID),
        KEY game_chartThreeMinute_ID (game_chartThreeMinute_ID),
        KEY game_chartFiveMinute_ID (game_chartFiveMinute_ID),
        KEY \`position\` (\`position\`),
        CONSTRAINT game_chartFiveMinute_ID FOREIGN KEY (game_chartFiveMinute_ID) REFERENCES chartFiveMinute (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT game_chartOneMinute_ID FOREIGN KEY (game_chartOneMinute_ID) REFERENCES chartOneMinute (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT game_chartThreeMinute_ID FOREIGN KEY (game_chartThreeMinute_ID) REFERENCES chartThreeMinute (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT game_user_ID FOREIGN KEY (game_user_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'game' 테이블 생성완료`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`이미 'game' 테이블이 있습니다.`.red);
    } else {
      console.error(e);
    }
  }
};

const chartOneMinute = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE chartOneMinute (
        id int unsigned NOT NULL AUTO_INCREMENT,
        round int DEFAULT NULL,
        datetime datetime DEFAULT NULL,
        priceOpen decimal(10,2) DEFAULT NULL,
        priceHigh decimal(10,2) DEFAULT NULL,
        priceLow decimal(10,2) DEFAULT NULL,
        priceClose decimal(10,2) DEFAULT NULL,
        underOver varchar(45) DEFAULT NULL,
        oddEven varchar(45) DEFAULT NULL,
        status tinyint(1) DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY datetime_UNIQUE (datetime),
        KEY underOver (underOver),
        KEY oddEven (oddEven)
      ) ENGINE=InnoDB AUTO_INCREMENT=4427 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'chartOneMinute' 테이블 생성완료`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`이미 'chartOneMinute' 테이블이 있습니다.`.red);
    } else {
      console.error(e);
    }
  }
};

const chartThreeMinute = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE chartThreeMinute (
        id int unsigned NOT NULL AUTO_INCREMENT,
        round int DEFAULT NULL,
        datetime datetime DEFAULT NULL,
        priceOpen decimal(10,2) DEFAULT NULL,
        priceHigh decimal(10,2) DEFAULT NULL,
        priceLow decimal(10,2) DEFAULT NULL,
        priceClose decimal(10,2) DEFAULT NULL,
        underOver varchar(45) DEFAULT NULL,
        oddEven varchar(45) DEFAULT NULL,
        status tinyint(1) DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY datetime_UNIQUE (datetime),
        KEY underOver (underOver),
        KEY oddEven (oddEven)
      ) ENGINE=InnoDB AUTO_INCREMENT=1428 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'chartThreeMinute' 테이블 생성완료`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`이미 'chartThreeMinute' 테이블이 있습니다.`.red);
    } else {
      console.error(e);
    }
  }
};

const chartFiveMinute = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE chartFiveMinute (
        id int unsigned NOT NULL AUTO_INCREMENT,
        round int DEFAULT NULL,
        datetime datetime DEFAULT NULL,
        priceOpen decimal(10,2) DEFAULT NULL,
        priceHigh decimal(10,2) DEFAULT NULL,
        priceLow decimal(10,2) DEFAULT NULL,
        priceClose decimal(10,2) DEFAULT NULL,
        underOver varchar(45) DEFAULT NULL,
        oddEven varchar(45) DEFAULT NULL,
        status tinyint(1) DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY datetime_UNIQUE (datetime),
        KEY underOver (underOver),
        KEY oddEven (oddEven)
      ) ENGINE=InnoDB AUTO_INCREMENT=857 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'chartFiveMinute' 테이블 생성완료`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`이미 'chartFiveMinute' 테이블이 있습니다.`.red);
    } else {
      console.error(e);
    }
  }
};

const end = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.query(`set FOREIGN_KEY_CHECKS = 1;`);
      console.log('Install Complete');
      process.exit(1);
    } finally {
      conn.release();
    }
  } catch (e) {
    console.error(e);
  }
};

main();