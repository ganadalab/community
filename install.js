const bcrypt =  require('bcrypt');
const colors = require('colors');
const mysql = require('mysql2/promise');
const sql = require('./config.json').sql.production;
const hashCreate = require('./middleware/hash');

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
    await alarm();
    await article();
    await articleTag();
    await assets();
    await authentication();
    await banner();
    await board();
    await category();
    await chat();
    await check();
    await checkContinue();
    await comment();
    await go();
    await image();
    await indexBoard();
    await indexBoardGroup();
    await indexBoardIndexBoardGroup();
    await log();
    await menu();
    await message();
    await page();
    await permission();
    await plugin();
    await point();
    await pointDeposit();
    await pointWithdraw();
    await report();
    await setting();
    await tag();
    await update();
    await user();
    await userArticleLike();
    await userArticleUnlike();
    await userBoard();
    await userChat();
    await userCommentLike();
    await userCommentUnlike();
    await userGroup();
    await userGroupBoard();
    await userUser();
    await userUserGroup();
    await adminColumn();
    await permissionColumn();
    await menuColumn();
    await settingColumn();
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

const alarm = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE alarm (
        id int unsigned NOT NULL AUTO_INCREMENT,
        alarm_user_ID int unsigned DEFAULT NULL,
        alarm_relatedUser_ID int unsigned DEFAULT NULL,
        alarm_board_ID int unsigned DEFAULT NULL,
        alarm_article_ID int unsigned DEFAULT NULL,
        alarm_comment_ID int unsigned DEFAULT NULL,
        alarm_message_ID int unsigned DEFAULT NULL,
        type varchar(45) NOT NULL,
        status tinyint(1) DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY alarm_user_ID (alarm_user_ID),
        KEY alarm_board_ID (alarm_board_ID),
        KEY alarm_article_ID (alarm_article_ID),
        KEY alarm_comment_ID (alarm_comment_ID),
        KEY alarm_message_ID (alarm_message_ID),
        KEY type (type),
        KEY alarm_relatedUser_ID (alarm_relatedUser_ID),
        CONSTRAINT alarm_article_ID FOREIGN KEY (alarm_article_ID) REFERENCES article (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT alarm_board_ID FOREIGN KEY (alarm_board_ID) REFERENCES board (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT alarm_comment_ID FOREIGN KEY (alarm_comment_ID) REFERENCES comment (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT alarm_message_ID FOREIGN KEY (alarm_message_ID) REFERENCES message (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT alarm_relatedUser_ID FOREIGN KEY (alarm_relatedUser_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT alarm_user_ID FOREIGN KEY (alarm_user_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'alarm' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'alarm' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const article = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE article (
        id int unsigned NOT NULL AUTO_INCREMENT,
        article_board_ID int unsigned DEFAULT NULL,
        article_category_ID int unsigned DEFAULT NULL,
        article_user_ID int unsigned DEFAULT NULL,
        type tinyint DEFAULT '1',
        title varchar(200) NOT NULL,
        content longtext NOT NULL,
        html longtext,
        notice tinyint NOT NULL DEFAULT '0',
        anonymous tinyint NOT NULL DEFAULT '0',
        likeCount int unsigned DEFAULT '0',
        unlikeCount int unsigned DEFAULT '0',
        viewCount int unsigned DEFAULT '0',
        commentCount int unsigned DEFAULT '0',
        links varchar(400) DEFAULT NULL,
        files varchar(400) DEFAULT NULL,
        nickName varchar(45) DEFAULT NULL,
        password varchar(200) DEFAULT NULL,
        status tinyint NOT NULL DEFAULT '1',
        customField01 varchar(400) DEFAULT NULL,
        customField02 varchar(400) DEFAULT NULL,
        customField03 varchar(400) DEFAULT NULL,
        customField04 varchar(400) DEFAULT NULL,
        customField05 varchar(400) DEFAULT NULL,
        customField06 varchar(400) DEFAULT NULL,
        customField07 varchar(400) DEFAULT NULL,
        customField08 varchar(400) DEFAULT NULL,
        customField09 varchar(400) DEFAULT NULL,
        customField10 varchar(400) DEFAULT NULL,
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY article_board_ID (article_board_ID),
        KEY article_category_ID (article_category_ID),
        KEY article_user_ID (article_user_ID),
        CONSTRAINT article_board_ID FOREIGN KEY (article_board_ID) REFERENCES board (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT article_category_ID FOREIGN KEY (article_category_ID) REFERENCES category (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT article_user_ID FOREIGN KEY (article_user_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=1201 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'article' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'article' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const articleTag = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE articleTag (
        id int unsigned NOT NULL AUTO_INCREMENT,
        articleTag_article_ID int unsigned DEFAULT NULL,
        articleTag_tag_ID int unsigned DEFAULT NULL,
        status tinyint(1) DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY articleTag_article_ID (articleTag_article_ID),
        KEY articleTag_tag_ID (articleTag_tag_ID),
        CONSTRAINT articleTag_article_ID FOREIGN KEY (articleTag_article_ID) REFERENCES article (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT articleTag_tag_ID FOREIGN KEY (articleTag_tag_ID) REFERENCES tag (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'articleTag' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'articleTag' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const assets = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE assets (
        id int unsigned NOT NULL AUTO_INCREMENT,
        type varchar(45) DEFAULT NULL,
        slug varchar(45) DEFAULT NULL,
        image varchar(200) DEFAULT NULL,
        title varchar(200) DEFAULT NULL,
        content longtext,
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY type (type)
      ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'assets' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'assets' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const authentication = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE authentication (
        id int unsigned NOT NULL AUTO_INCREMENT,
        authentication_user_ID int unsigned DEFAULT NULL,
        type varchar(200) NOT NULL,
        hash varchar(200) NOT NULL,
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY authentication_user_ID (authentication_user_ID),
        CONSTRAINT authentication_user_ID FOREIGN KEY (authentication_user_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'authentication' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'authentication' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const banner = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE banner (
        id int unsigned NOT NULL AUTO_INCREMENT,
        position varchar(200) NOT NULL,
        image varchar(200) NOT NULL,
        link varchar(200) NOT NULL,
        viewOrder int unsigned DEFAULT '100',
        newPage tinyint DEFAULT '0',
        desktopHide tinyint DEFAULT '0',
        mobileHide tinyint DEFAULT '0',
        status tinyint unsigned DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'banner' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'banner' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const board = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE board (
        id int unsigned NOT NULL AUTO_INCREMENT,
        title varchar(200) NOT NULL,
        slug varchar(200) NOT NULL,
        type varchar(45) DEFAULT NULL,
        summary varchar(400) DEFAULT NULL,
        image varchar(200) DEFAULT NULL,
        listCount int NOT NULL DEFAULT '12',
        viewOrder int unsigned DEFAULT '100',
        listPermission int DEFAULT '0',
        readPermission int DEFAULT '0',
        writePermission int DEFAULT '1',
        commentPermission int DEFAULT '1',
        writePoint int NOT NULL DEFAULT '0',
        commentPoint int NOT NULL DEFAULT '0',
        readPoint int NOT NULL DEFAULT '0',
        useSecret tinyint DEFAULT '0',
        useAnonymous tinyint DEFAULT '0',
        useOnce tinyint DEFAULT '0',
        useLinks tinyint DEFAULT '0',
        useFiles tinyint DEFAULT '0',
        useHtml tinyint DEFAULT '0',
        useUserGroupPermission tinyint DEFAULT '0',
        useUserAlarm tinyint DEFAULT '0',
        useAdminAlarm tinyint DEFAULT '0',
        status tinyint DEFAULT '1',
        useCustomField01 tinyint DEFAULT '0',
        useCustomField02 tinyint DEFAULT '0',
        useCustomField03 tinyint DEFAULT '0',
        useCustomField04 tinyint DEFAULT '0',
        useCustomField05 tinyint DEFAULT '0',
        useCustomField06 tinyint DEFAULT '0',
        useCustomField07 tinyint DEFAULT '0',
        useCustomField08 tinyint DEFAULT '0',
        useCustomField09 tinyint DEFAULT '0',
        useCustomField10 tinyint DEFAULT '0',
        customFieldTitle01 varchar(45) DEFAULT NULL,
        customFieldTitle02 varchar(45) DEFAULT NULL,
        customFieldTitle03 varchar(45) DEFAULT NULL,
        customFieldTitle04 varchar(45) DEFAULT NULL,
        customFieldTitle05 varchar(45) DEFAULT NULL,
        customFieldTitle06 varchar(45) DEFAULT NULL,
        customFieldTitle07 varchar(45) DEFAULT NULL,
        customFieldTitle08 varchar(45) DEFAULT NULL,
        customFieldTitle09 varchar(45) DEFAULT NULL,
        customFieldTitle10 varchar(45) DEFAULT NULL,
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY title (title),
        UNIQUE KEY slug (slug)
      ) ENGINE=InnoDB AUTO_INCREMENT=232 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'board' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'board' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const category = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE category (
        id int unsigned NOT NULL AUTO_INCREMENT,
        category_board_ID int unsigned DEFAULT NULL,
        title varchar(200) NOT NULL,
        viewOrder int DEFAULT '100',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY category_board_ID (category_board_ID),
        KEY title (title),
        CONSTRAINT category_board_ID FOREIGN KEY (category_board_ID) REFERENCES board (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'category' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'category' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const chat = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE chat (
        id int unsigned NOT NULL AUTO_INCREMENT,
        chat_user_ID int unsigned NOT NULL,
        message varchar(200) NOT NULL,
        status tinyint NOT NULL DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY chat_user_ID (chat_user_ID),
        KEY status (status),
        CONSTRAINT chat_user_ID FOREIGN KEY (chat_user_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=372 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'chat' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'chat' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const check = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE \`check\` (
        id int unsigned NOT NULL AUTO_INCREMENT,
        check_user_ID int unsigned DEFAULT NULL,
        comment varchar(200) NOT NULL,
        point int unsigned DEFAULT '0',
        status tinyint(1) DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY check_user_ID (check_user_ID),
        CONSTRAINT check_user_ID FOREIGN KEY (check_user_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=442 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'check' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'check' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const checkContinue = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE checkContinue (
        id int unsigned NOT NULL AUTO_INCREMENT,
        date int unsigned DEFAULT '0',
        point int unsigned DEFAULT '0',
        status tinyint(1) DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'checkContinue' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'checkContinue' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const comment = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE comment (
        id int unsigned NOT NULL AUTO_INCREMENT,
        comment_user_ID int unsigned DEFAULT NULL,
        comment_article_ID int unsigned DEFAULT NULL,
        comment_parent_ID int unsigned DEFAULT NULL,
        comment_group_ID int unsigned DEFAULT NULL,
        content longtext,
        likeCount int unsigned DEFAULT '0',
        unlikeCount int unsigned DEFAULT '0',
        replyCount int unsigned DEFAULT '0',
        nickName varchar(45) DEFAULT NULL,
        password varchar(200) DEFAULT NULL,
        status tinyint DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY status (status),
        KEY comment_user_ID (comment_user_ID),
        KEY comment_article_ID (comment_article_ID),
        KEY comment_parent_ID (comment_parent_ID),
        KEY comment_group_ID (comment_group_ID),
        CONSTRAINT comment_article_ID FOREIGN KEY (comment_article_ID) REFERENCES article (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT comment_group_ID FOREIGN KEY (comment_group_ID) REFERENCES comment (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT comment_parent_ID FOREIGN KEY (comment_parent_ID) REFERENCES comment (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT comment_user_ID FOREIGN KEY (comment_user_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=725 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'comment' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'comment' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const go = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE go (
        id int unsigned NOT NULL AUTO_INCREMENT,
        slug varchar(45) NOT NULL,
        url varchar(800) NOT NULL,
        status tinyint(1) DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'go' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'go' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const image = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE image (
        id int unsigned NOT NULL AUTO_INCREMENT,
        image_article_ID int unsigned DEFAULT NULL,
        image_comment_ID int unsigned DEFAULT NULL,
        image_page_ID int unsigned DEFAULT NULL,
        \`key\` varchar(200) NOT NULL,
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY image_UNIQUE (\`key\`),
        KEY image_article_ID (image_article_ID),
        KEY image_comment_ID (image_comment_ID),
        KEY image_page_ID (image_page_ID),
        CONSTRAINT image_article_ID FOREIGN KEY (image_article_ID) REFERENCES article (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT image_comment_ID FOREIGN KEY (image_comment_ID) REFERENCES comment (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT image_page_ID FOREIGN KEY (image_page_ID) REFERENCES page (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=358 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'image' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'image' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const indexBoard = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE indexBoard (
        id int unsigned NOT NULL AUTO_INCREMENT,
        indexBoard_board_ID int unsigned NOT NULL,
        type varchar(45) NOT NULL DEFAULT 'text',
        articleOrder varchar(45) NOT NULL DEFAULT 'lately',
        exceptBoards varchar(200) DEFAULT NULL,
        viewCount int unsigned DEFAULT '5',
        viewOrder int unsigned DEFAULT '100',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'indexBoard' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'indexBoard' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const indexBoardGroup = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE indexBoardGroup (
        id int unsigned NOT NULL AUTO_INCREMENT,
        title varchar(200) NOT NULL,
        content varchar(200) DEFAULT NULL,
        type varchar(200) NOT NULL,
        showTitleAndContent tinyint DEFAULT '0',
        viewOrder int DEFAULT '100',
        status tinyint NOT NULL DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY title (title)
      ) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'indexBoardGroup' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'indexBoardGroup' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const indexBoardIndexBoardGroup = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE indexBoardIndexBoardGroup (
        id int unsigned NOT NULL AUTO_INCREMENT,
        indexBoardIndexBoardGroup_indexBoard_ID int unsigned DEFAULT NULL,
        indexBoardIndexBoardGroup_indexBoardGroup_ID int unsigned DEFAULT NULL,
        status tinyint(1) DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY indexBoardIndexBoardGroup_indexBoard_ID (indexBoardIndexBoardGroup_indexBoard_ID),
        KEY indexBoardIndexBoardGroup_indexBoardGroup_ID (indexBoardIndexBoardGroup_indexBoardGroup_ID),
        CONSTRAINT indexBoardIndexBoardGroup_indexBoard_ID FOREIGN KEY (indexBoardIndexBoardGroup_indexBoard_ID) REFERENCES indexBoard (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT indexBoardIndexBoardGroup_indexBoardGroup_ID FOREIGN KEY (indexBoardIndexBoardGroup_indexBoardGroup_ID) REFERENCES indexBoardGroup (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'indexBoardIndexBoardGroup' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'indexBoardIndexBoardGroup' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const log = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE log (
        id int unsigned NOT NULL AUTO_INCREMENT,
        log_article_ID int unsigned DEFAULT NULL,
        location varchar(200) DEFAULT NULL,
        viewDate datetime DEFAULT CURRENT_TIMESTAMP,
        viewIp varchar(200) DEFAULT NULL,
        referer varchar(800) DEFAULT NULL,
        userAgent varchar(800) DEFAULT NULL,
        PRIMARY KEY (id),
        KEY log_article_ID (log_article_ID),
        CONSTRAINT log_article_ID FOREIGN KEY (log_article_ID) REFERENCES article (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=138 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'log' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'log' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const menu = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE menu (
        id int unsigned NOT NULL AUTO_INCREMENT,
        menu_parent_ID int unsigned DEFAULT NULL,
        type varchar(45) NOT NULL DEFAULT 'top',
        title varchar(200) NOT NULL,
        slug varchar(45) DEFAULT NULL,
        target varchar(200) NOT NULL,
        viewOrder int unsigned DEFAULT '100',
        status tinyint DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY menu_parent_ID (menu_parent_ID),
        CONSTRAINT menu_parent_ID FOREIGN KEY (menu_parent_ID) REFERENCES menu (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=199 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'menu' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'menu' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const message = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE message (
        id int unsigned NOT NULL AUTO_INCREMENT,
        message_sender_ID int unsigned DEFAULT NULL,
        message_recipient_ID int unsigned DEFAULT NULL,
        content longtext,
        status tinyint DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY message_recipient_ID (message_recipient_ID),
        KEY message_sender_ID (message_sender_ID),
        CONSTRAINT message_recipient_ID FOREIGN KEY (message_recipient_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT message_sender_ID FOREIGN KEY (message_sender_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=347 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'message' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'message' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const page = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE page (
        id int unsigned NOT NULL AUTO_INCREMENT,
        type varchar(45) NOT NULL DEFAULT 'editor',
        title varchar(200) NOT NULL,
        slug varchar(200) NOT NULL,
        content longtext,
        html longtext,
        css longtext,
        js longtext,
        status tinyint DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY slug (slug)
      ) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'page' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'page' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const permission = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE permission (
        id int unsigned NOT NULL AUTO_INCREMENT,
        title varchar(200) DEFAULT NULL,
        permission int unsigned DEFAULT NULL,
        pointBaseline int DEFAULT '0',
        isAdmin tinyint DEFAULT '0',
        image varchar(200) DEFAULT NULL,
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY permission_UNIQUE (permission)
      ) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'permission' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'permission' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const plugin = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE plugin (
        id int unsigned NOT NULL AUTO_INCREMENT,
        slug varchar(200) NOT NULL,
        status tinyint(1) DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY slug (slug)
      ) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'plugin' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'plugin' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const point = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE point (
        id int unsigned NOT NULL AUTO_INCREMENT,
        point_user_ID int unsigned DEFAULT NULL,
        point_board_ID int unsigned DEFAULT NULL,
        point_article_ID int unsigned DEFAULT NULL,
        point_comment_ID int unsigned DEFAULT NULL,
        point_pointDeposit_ID int unsigned DEFAULT NULL,
        type varchar(200) NOT NULL,
        point int DEFAULT NULL,
        comment varchar(200) DEFAULT NULL,
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY type (type),
        KEY point_article_ID (point_article_ID),
        KEY point_board_ID (point_board_ID),
        KEY point_comment_ID (point_comment_ID),
        KEY point_user_ID (point_user_ID),
        KEY point_pointDeposit_ID (point_pointDeposit_ID),
        CONSTRAINT point_article_ID FOREIGN KEY (point_article_ID) REFERENCES article (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT point_board_ID FOREIGN KEY (point_board_ID) REFERENCES board (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT point_comment_ID FOREIGN KEY (point_comment_ID) REFERENCES comment (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT point_pointDeposit_ID FOREIGN KEY (point_pointDeposit_ID) REFERENCES pointDeposit (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT point_user_ID FOREIGN KEY (point_user_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=908 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'point' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'point' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const pointDeposit = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE pointDeposit (
        id int unsigned NOT NULL AUTO_INCREMENT,
        pointDeposit_user_ID int unsigned DEFAULT NULL,
        point int unsigned DEFAULT NULL,
        bonusPoint int DEFAULT NULL,
        type varchar(45) DEFAULT NULL,
        depositor varchar(45) DEFAULT NULL,
        receipt tinyint DEFAULT NULL,
        receiptType tinyint DEFAULT NULL,
        reciptNumber varchar(45) DEFAULT NULL,
        taxbillNumber varchar(45) DEFAULT NULL,
        taxbillCompany varchar(45) DEFAULT NULL,
        status tinyint(1) DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY pointDeposit_user_ID (pointDeposit_user_ID),
        CONSTRAINT pointDeposit_user_ID FOREIGN KEY (pointDeposit_user_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'pointDeposit' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'pointDeposit' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const pointWithdraw = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE pointWithdraw (
        id int unsigned NOT NULL AUTO_INCREMENT,
        pointWithdraw_user_ID int unsigned DEFAULT NULL,
        type varchar(45) NOT NULL,
        point int unsigned NOT NULL,
        comment varchar(800) DEFAULT NULL,
        status int unsigned NOT NULL DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY pointWithdraw_user_ID (pointWithdraw_user_ID),
        CONSTRAINT pointWithdraw_user_ID FOREIGN KEY (pointWithdraw_user_ID) REFERENCES user (id)
      ) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'pointWithdraw' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'pointWithdraw' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const report = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE report (
        id int unsigned NOT NULL AUTO_INCREMENT,
        report_user_ID int unsigned DEFAULT NULL,
        report_article_ID int unsigned DEFAULT NULL,
        report_comment_ID int unsigned DEFAULT NULL,
        report_message_ID int unsigned DEFAULT NULL,
        content longtext,
        status tinyint(1) DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY report_user_ID (report_user_ID),
        KEY report_article_ID (report_article_ID),
        KEY report_comment_ID (report_comment_ID),
        KEY report_message_ID (report_message_ID),
        CONSTRAINT report_article_ID FOREIGN KEY (report_article_ID) REFERENCES article (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT report_comment_ID FOREIGN KEY (report_comment_ID) REFERENCES comment (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT report_message_ID FOREIGN KEY (report_message_ID) REFERENCES message (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT report_user_ID FOREIGN KEY (report_user_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'pointWithdraw' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'pointWithdraw' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const setting = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const hash = hashCreate(6);
      const query = `CREATE TABLE setting (
        id int unsigned NOT NULL AUTO_INCREMENT,
        hash varchar(45) DEFAULT NULL,
        \`index\` varchar(45) DEFAULT 'basic',
        editor varchar(45) DEFAULT 'ckeditor',
        siteName varchar(200) NOT NULL DEFAULT '????????????',
        siteNameRaw varchar(200) DEFAULT '????????????',
        siteDescription varchar(200) NOT NULL DEFAULT '????????? ??????',
        siteKeywords varchar(200) DEFAULT NULL,
        siteDomain varchar(200) NOT NULL DEFAULT 'https://???????????????.com',
        footerGuide longtext,
        pageCommonCss longtext,
        emailService varchar(200) NOT NULL DEFAULT 'gmail',
        gmailUser varchar(200) DEFAULT NULL,
        gmailOauthClientId varchar(400) DEFAULT NULL,
        gmailOauthClientSecret varchar(400) DEFAULT NULL,
        gmailOauthRefreshToken varchar(400) DEFAULT NULL,
        logoType varchar(45) NOT NULL DEFAULT 'text',
        logoImage varchar(45) DEFAULT NULL,
        logoImageSize int DEFAULT '200',
        faviconImage varchar(45) DEFAULT NULL,
        useCustomLayout tinyint DEFAULT '0',
        font varchar(45) DEFAULT 'basic',
        theme varchar(45) DEFAULT 'white',
        boardTheme varchar(45) DEFAULT 'basic',
        headerLayout varchar(45) NOT NULL DEFAULT 'basic',
        footerLayout varchar(45) NOT NULL DEFAULT 'basic',
        mainLayout varchar(45) DEFAULT 'basic',
        indexLayout varchar(45) NOT NULL DEFAULT 'basic',
        landingLayout varchar(45) DEFAULT 'basic',
        headerFontColor varchar(45) NOT NULL DEFAULT '#000',
        headerBackgroundColor varchar(45) NOT NULL DEFAULT '#fff',
        bodyFontColor varchar(45) NOT NULL DEFAULT '#000',
        bodyBackgroundColor varchar(45) DEFAULT '#EBEDF3',
        pointColor varchar(45) NOT NULL DEFAULT '#FF9602',
        pointBackgroundColor varchar(45) NOT NULL DEFAULT '#FAEFE0',
        copyright longtext,
        language varchar(45) NOT NULL DEFAULT 'ko',
        license tinyint NOT NULL DEFAULT '0',
        joinMethod varchar(45) NOT NULL DEFAULT 'simple',
        smsCallerId varchar(45) DEFAULT NULL,
        smsServiceId varchar(45) DEFAULT NULL,
        smsServiceSecretKey varchar(45) DEFAULT NULL,
        customHeadTags longtext,
        customHeaderTags longtext,
        customFooterTags longtext,
        adsenseAds varchar(400) DEFAULT NULL,
        adsenseIndexTop text DEFAULT NULL,
        adsenseIndexBottom text DEFAULT NULL,
        adsenseArticleTop text DEFAULT NULL,
        adsenseArticleBottom text DEFAULT NULL,
        adsenseArticleCenter text DEFAULT NULL,
        adsenseSide text DEFAULT NULL,
        adsenseCustom text DEFAULT NULL,
        useAutoPermission tinyint DEFAULT '0',
        useWithdraw tinyint DEFAULT '0',
        useEmailAuthentication tinyint DEFAULT '0',
        useSmsAuthentication tinyint DEFAULT '0',
        useTermsAndPrivacy tinyint DEFAULT '0',
        useArticleViewCount tinyint DEFAULT '0',
        useVisitCount tinyint DEFAULT '0',
        useWorkingUser tinyint DEFAULT '1',
        useMessage tinyint DEFAULT '1',
        useChat tinyint DEFAULT '1',
        useSms tinyint DEFAULT '0',
        usePermissionImage tinyint DEFAULT '1',
        usePointWithdraw tinyint DEFAULT '0',
        pointWithdrawLimit int unsigned DEFAULT '0',
        checkPoint int DEFAULT '0',
        invitePoint int DEFAULT '0',
        blockWords longtext,
        useJoinPhone tinyint DEFAULT '0',
        useJoinRealName tinyint DEFAULT '0',
        useJoinBirthDay tinyint DEFAULT '0',
        useCheckComments tinyint DEFAULT '0',
        checkComments varchar(800) DEFAULT NULL,
        desktopBannerRowsHeader int DEFAULT '2',
        desktopBannerRowsIndexTop int DEFAULT '2',
        desktopBannerRowsIndexBottom int DEFAULT '2',
        desktopBannerRowsSideTop int DEFAULT '2',
        desktopBannerRowsSideBottom int DEFAULT '2',
        desktopBannerRowsArticleTop int DEFAULT '2',
        desktopBannerRowsArticleBottom int DEFAULT '2',
        desktopBannerRowsCustom int DEFAULT '2',
        mobileBannerRowsHeader int DEFAULT '1',
        mobileBannerRowsIndexTop int DEFAULT '1',
        mobileBannerRowsIndexBottom int DEFAULT '1',
        mobileBannerRowsSideTop int DEFAULT '1',
        mobileBannerRowsSideBottom int DEFAULT '1',
        mobileBannerRowsArticleTop int DEFAULT '1',
        mobileBannerRowsArticleBottom int DEFAULT '1',
        mobileBannerRowsCustom int DEFAULT '1',
        bannerAlignHeader varchar(45) DEFAULT 'lately',
        bannerAlignIndexTop varchar(45) DEFAULT 'lately',
        bannerAlignIndexBottom varchar(45) DEFAULT 'lately',
        bannerAlignSideTop varchar(45) DEFAULT 'lately',
        bannerAlignSideBottom varchar(45) DEFAULT 'lately',
        bannerAlignArticleTop varchar(45) DEFAULT 'lately',
        bannerAlignArticleBottom varchar(45) DEFAULT 'lately',
        bannerAlignLeftWing varchar(45) DEFAULT 'lately',
        bannerAlignRightWing varchar(45) DEFAULT 'lately',
        bannerAlignCustom varchar(45) DEFAULT 'lately',
        bannerGapDesktop varchar(45) DEFAULT '20',
        bannerGapMobile varchar(45) DEFAULT '10',
        bannerBorderRounding tinyint DEFAULT '1',
        boardPrevNextArticle tinyint DEFAULT '1',
        boardAllArticle tinyint DEFAULT '0',
        boardAuthorArticle tinyint DEFAULT '0',
        writingTerm int DEFAULT '0',
        terms longtext,
        privacy longtext,
        useSocialApple tinyint DEFAULT '0',
        useSocialGoogle tinyint DEFAULT '0',
        useSocialFacebook tinyint DEFAULT '0',
        useSocialTwitter tinyint DEFAULT '0',
        useSocialNaver tinyint DEFAULT '0',
        useSocialKakao tinyint DEFAULT '0',
        socialAppleServiceId varchar(200) DEFAULT NULL,
        socialAppleTeamId varchar(200) DEFAULT NULL,
        socialAppleKeyId varchar(200) DEFAULT NULL,
        socialAppleAuthKey varchar(800) DEFAULT NULL,
        socialGoogleClientId varchar(200) DEFAULT NULL,
        socialGoogleClientSecret varchar(200) DEFAULT NULL,
        socialFacebookAppId varchar(200) DEFAULT NULL,
        socialFacebookAppSecret varchar(200) DEFAULT NULL,
        socialTwitterApiKey varchar(200) DEFAULT NULL,
        socialTwitterApiSecret varchar(200) DEFAULT NULL,
        socialNaverClientId varchar(200) DEFAULT NULL,
        socialNaverClientSecret varchar(200) DEFAULT NULL,
        socialKakaoClientId varchar(200) DEFAULT NULL,
        socialKakaoClientSecret varchar(200) DEFAULT NULL,
        telegramToken varchar(200) DEFAULT NULL,
        telegramChatId varchar(45) DEFAULT NULL,
        naverCloudPlatformAccessKeyId varchar(200) DEFAULT NULL,
        naverCloudPlatformSecretKey varchar(200) DEFAULT NULL,
        googleCloudPlatformApiKey varchar(200) DEFAULT NULL,
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY siteName_UNIQUE (siteName)
      ) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query, [hash]);
      if (rows) {
        console.log(`'setting' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'setting' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const tag = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE tag (
        id int unsigned NOT NULL AUTO_INCREMENT,
        \`key\` varchar(200) DEFAULT NULL,
        status tinyint(1) DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY title (\`key\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'tag' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'tag' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const update = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE \`update\` (
        id int unsigned NOT NULL AUTO_INCREMENT,
        \`hash\` varchar(45) DEFAULT NULL,
        \`sql\` longtext,
        status tinyint DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'update' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'update' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const user = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE user (
        id int unsigned NOT NULL AUTO_INCREMENT,
        user_parent_ID int unsigned DEFAULT NULL,
        uId varchar(200) NOT NULL,
        password varchar(200) NOT NULL,
        nickName varchar(45) NOT NULL,
        email varchar(200) DEFAULT NULL,
        emailAuthentication tinyint DEFAULT '0',
        permission int DEFAULT '1',
        workingUser tinyint unsigned DEFAULT '0',
        point int DEFAULT '0',
        realName varchar(45) DEFAULT NULL,
        realNameAuthentication tinyint DEFAULT '0',
        phone varchar(45) DEFAULT NULL,
        phoneAuthentication tinyint DEFAULT '0',
        image varchar(200) DEFAULT NULL,
        ios varchar(400) DEFAULT NULL,
        android varchar(400) DEFAULT NULL,
        appleId varchar(200) DEFAULT NULL,
        googleId varchar(200) DEFAULT NULL,
        facebookId varchar(200) DEFAULT NULL,
        twitterId varchar(200) DEFAULT NULL,
        naverId varchar(200) DEFAULT NULL,
        kakaoId varchar(200) DEFAULT NULL,
        marketingAgreement tinyint DEFAULT '0',
        checkContinue int DEFAULT '0',
        checkTotal int DEFAULT '0',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY cid (uId),
        UNIQUE KEY nickName_UNIQUE (nickName),
        KEY user_parent_ID (user_parent_ID),
        CONSTRAINT user_parent_ID FOREIGN KEY (user_parent_ID) REFERENCES user (id) ON DELETE SET NULL ON UPDATE SET NULL
      ) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'user' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'user' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const userArticleLike = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE userArticleLike (
        id int unsigned NOT NULL AUTO_INCREMENT,
        userArticleLike_user_ID int unsigned DEFAULT NULL,
        userArticleLike_article_ID int unsigned DEFAULT NULL,
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY userArticleLike_user_ID (userArticleLike_user_ID),
        KEY userArticleLike_article_ID (userArticleLike_article_ID),
        CONSTRAINT userArticleLike_article_ID FOREIGN KEY (userArticleLike_article_ID) REFERENCES article (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT userArticleLike_user_ID FOREIGN KEY (userArticleLike_user_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=247 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'userArticleLike' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'userArticleLike' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const userArticleUnlike = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE userArticleUnlike (
        id int unsigned NOT NULL AUTO_INCREMENT,
        userArticleUnlike_user_ID int unsigned DEFAULT NULL,
        userArticleUnlike_article_ID int unsigned DEFAULT NULL,
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY userArticleUnlike_user_ID (userArticleUnlike_user_ID),
        KEY userArticleUnlike_article_ID (userArticleUnlike_article_ID),
        CONSTRAINT userArticleUnlike_article_ID FOREIGN KEY (userArticleUnlike_article_ID) REFERENCES article (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT userArticleUnlike_user_ID FOREIGN KEY (userArticleUnlike_user_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=247 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'userArticleUnlike' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'userArticleUnlike' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const userBoard = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE userBoard (
        id int unsigned NOT NULL AUTO_INCREMENT,
        userBoard_user_ID int unsigned DEFAULT NULL,
        userBoard_board_ID int unsigned DEFAULT NULL,
        status tinyint(1) DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY userBoard_user_ID (userBoard_user_ID),
        KEY userBoard_board_ID (userBoard_board_ID),
        CONSTRAINT userBoard_user_ID FOREIGN KEY (userBoard_user_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT userBoard_board_ID FOREIGN KEY (userBoard_board_ID) REFERENCES board (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'userBoard' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'userBoard' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const userChat = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE userChat (
        id int unsigned NOT NULL AUTO_INCREMENT,
        userChat_user_ID int unsigned DEFAULT NULL,
        userChat_chatRoom_ID int unsigned DEFAULT NULL,
        userChat_chat_ID int unsigned DEFAULT NULL,
        status tinyint DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY userChat_chatRoom_ID (userChat_chatRoom_ID),
        KEY userChat_chat_ID (userChat_chat_ID),
        KEY userChat_user_ID (userChat_user_ID),
        CONSTRAINT userChat_chat_ID FOREIGN KEY (userChat_chat_ID) REFERENCES chat (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT userChat_chatRoom_ID FOREIGN KEY (userChat_chatRoom_ID) REFERENCES chatRoom (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT userChat_user_ID FOREIGN KEY (userChat_user_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'userChat' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'userChat' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const userCommentLike = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE userCommentLike (
        id int unsigned NOT NULL AUTO_INCREMENT,
        userCommentLike_user_ID int unsigned DEFAULT NULL,
        userCommentLike_comment_ID int unsigned DEFAULT NULL,
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY userCommentLike_comment_ID (userCommentLike_comment_ID),
        KEY userCommentLike_user_ID (userCommentLike_user_ID),
        CONSTRAINT userCommentLike_comment_ID FOREIGN KEY (userCommentLike_comment_ID) REFERENCES comment (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT userCommentLike_user_ID FOREIGN KEY (userCommentLike_user_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=210 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'userCommentLike' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'userCommentLike' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const userCommentUnlike = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE userCommentUnlike (
        id int unsigned NOT NULL AUTO_INCREMENT,
        userCommentUnlike_user_ID int unsigned DEFAULT NULL,
        userCommentUnlike_comment_ID int unsigned DEFAULT NULL,
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY userCommentUnlike_comment_ID (userCommentUnlike_comment_ID),
        KEY userCommentUnlike_user_ID (userCommentUnlike_user_ID),
        CONSTRAINT userCommentUnlike_comment_ID FOREIGN KEY (userCommentUnlike_comment_ID) REFERENCES comment (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT userCommentUnlike_user_ID FOREIGN KEY (userCommentUnlike_user_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=210 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'userCommentUnlike' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'userCommentUnlike' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const userGroup = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE userGroup (
        id int unsigned NOT NULL AUTO_INCREMENT,
        title varchar(200) NOT NULL,
        slug varchar(200) NOT NULL,
        viewOrder int unsigned DEFAULT '100',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY title (title),
        UNIQUE KEY slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'userGroup' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'userGroup' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const userGroupBoard = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE userGroupBoard (
        id int unsigned NOT NULL AUTO_INCREMENT,
        userGroupBoard_userGroup_ID int unsigned DEFAULT NULL,
        userGroupBoard_board_ID int unsigned DEFAULT NULL,
        listPermission tinyint(1) DEFAULT '1',
        readPermission tinyint(1) DEFAULT '1',
        writePermission tinyint(1) DEFAULT '1',
        commentPermission tinyint(1) DEFAULT '1',
        status tinyint(1) DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY userGroupBoard_userGroup_ID (userGroupBoard_userGroup_ID),
        KEY userGroupBoard_board_ID (userGroupBoard_board_ID),
        CONSTRAINT userGroupBoard_board_ID FOREIGN KEY (userGroupBoard_board_ID) REFERENCES board (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT userGroupBoard_userGroup_ID FOREIGN KEY (userGroupBoard_userGroup_ID) REFERENCES userGroup (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'userGroupBoard' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'userGroupBoard' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const userUser = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE userUser (
        id int unsigned NOT NULL AUTO_INCREMENT,
        userUser_user_ID int unsigned DEFAULT NULL,
        userUser_targetUser_ID int unsigned DEFAULT NULL,
        status tinyint(1) DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY userUser_user_ID (userUser_user_ID),
        KEY userUser_targetUser_ID (userUser_targetUser_ID),
        CONSTRAINT userUser_user_ID FOREIGN KEY (userUser_user_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT userUser_targetUser_ID FOREIGN KEY (userUser_targetUser_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'userUser' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'userUser' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const userUserGroup = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const query = `CREATE TABLE userUserGroup (
        id int unsigned NOT NULL AUTO_INCREMENT,
        userUserGroup_user_ID int unsigned DEFAULT NULL,
        userUserGroup_userGroup_ID int unsigned DEFAULT NULL,
        status tinyint(1) DEFAULT '1',
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY userUserGroup_user_ID (userUserGroup_user_ID),
        KEY userUserGroup_userGroup_ID (userUserGroup_userGroup_ID),
        CONSTRAINT userUserGroup_user_ID FOREIGN KEY (userUserGroup_user_ID) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT userUserGroup_userGroup_ID FOREIGN KEY (userUserGroup_userGroup_ID) REFERENCES userGroup (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
      const [rows, ] = await conn.query(query);
      if (rows) {
        console.log(`'userUserGroup' ????????? ????????????`.green);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === 1050) {
      console.log(`?????? 'userUserGroup' ???????????? ????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const adminColumn = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const [result, ] = await conn.query(`SELECT * FROM user`);
      if (!result.length) {
        const query = `INSERT INTO user (uId, password, nickName, email, permission)
        VALUES (?, ?, ?, ?, ?)`;
        const password = 'admin';
        const salt = bcrypt.genSaltSync(SALT_COUNT);
        const hash = bcrypt.hashSync(password, salt);
        const [rows, ] = await conn.query(query, ['admin', hash, 'admin', 'admin@admin.com', 10]);
        if (rows && rows.serverStatus === 2) {
          console.log(`'admin' ?????? ????????????`.green);
        }
      } else {
        console.log(`?????? 'admin' ????????? ?????????????????????.`.red);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === '1062') {
      console.log(`?????? 'admin' ????????? ?????????????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const permissionColumn = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const [result, ] = await conn.query(`SELECT * FROM permission`);
      if (result.length !== 10) {
        let rows = null;
        [rows, ] = await conn.query(`INSERT INTO permission (title, permission, isAdmin) VALUES (?, ?, ?)`, [1, 1, 0]);
        [rows, ] = await conn.query(`INSERT INTO permission (title, permission, isAdmin) VALUES (?, ?, ?)`, [2, 2, 0]);
        [rows, ] = await conn.query(`INSERT INTO permission (title, permission, isAdmin) VALUES (?, ?, ?)`, [3, 3, 0]);
        [rows, ] = await conn.query(`INSERT INTO permission (title, permission, isAdmin) VALUES (?, ?, ?)`, [4, 4, 0]);
        [rows, ] = await conn.query(`INSERT INTO permission (title, permission, isAdmin) VALUES (?, ?, ?)`, [5, 5, 0]);
        [rows, ] = await conn.query(`INSERT INTO permission (title, permission, isAdmin) VALUES (?, ?, ?)`, [6, 6, 0]);
        [rows, ] = await conn.query(`INSERT INTO permission (title, permission, isAdmin) VALUES (?, ?, ?)`, [7, 7, 0]);
        [rows, ] = await conn.query(`INSERT INTO permission (title, permission, isAdmin) VALUES (?, ?, ?)`, [8, 8, 0]);
        [rows, ] = await conn.query(`INSERT INTO permission (title, permission, isAdmin) VALUES (?, ?, ?)`, [9, 9, 0]);
        [rows, ] = await conn.query(`INSERT INTO permission (title, permission, isAdmin) VALUES (?, ?, ?)`, ['?????????', 10, 1]);
        if (rows && rows.serverStatus === 2) {
          console.log(`'permission' ?????? ????????????`.green);
        }
      } else {
        console.log(`?????? 'permission' ????????? ?????????????????????.`.red);
      }
      
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === '1062') {
      console.log(`?????? 'permission' ????????? ?????????????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const menuColumn = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const [result, ] = await conn.query(`SELECT * FROM menu`);
      if (!result.length) {
        let rows = null;
        [rows, ] = await conn.query(`INSERT INTO menu (type, title, target, viewOrder) VALUES (?, ?, ?, ?)`, ['top', '????????????', 'check', 1000]);
        if (rows && rows.serverStatus === 2) {
          console.log(`'menu' ?????? ????????????`.green);
        }
      } else {
        console.log(`?????? 'menu' ????????? ?????????????????????.`.red);
      }
      
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === '1062') {
      console.log(`?????? 'menu' ????????? ?????????????????????.`.red);
    } else {
      console.error(e);
    }
  }
};

const settingColumn = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const [result, ] = await conn.query(`SELECT * FROM setting`);
      if (!result.length) {
        const query = `INSERT INTO setting (id, siteName) VALUES (?, ?)`;
        const [rows, ] = await conn.query(query, [1, '????????????']);
        if (rows && rows.serverStatus === 2) {
          console.log(`'setting' ?????? ????????????`.green);
        }
      } else {
        console.log(`?????? 'setting' ????????? ?????????????????????.`.red);
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    if (e.errno === '1062') {
      console.log(`?????? 'setting' ????????? ?????????????????????.`.red);
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