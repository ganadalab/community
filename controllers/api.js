const pool = require('../middleware/database');
const axios = require('axios');
const cheerio = require('cheerio');
const { sendMessage } = require('../middleware/sendMessage');
const hashCreate = require('../middleware/hash');
const imageUpload = require('../middleware/imageUpload');
const doAsync = require('../middleware/doAsync');
const config = require('../middleware/config');
const Article = require('../services/article');
const Comment = require('../services/comment');
const Image = require('../services/image');
const Point = require('../services/point');
const Alarm = require('../services/alarm');
const Report = require('../services/report');
const UserGroupBoard = require('../services/userGroupBoard');
const checkBlockWordsFunc = require('../middleware/blockWords');
const status = require('../services/status');
const Chart = require('../services/chart');
const Game = require('../services/game');

/* AWS S3 */
const AWS = require('aws-sdk');
const s3Info = config.getS3();
const storage = config.getStorage();

const { accessKeyId, secretAccessKey, region, bucket, host, endpoint } = s3Info;

const spacesEndpoint = new AWS.Endpoint(endpoint);
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId,
    secretAccessKey,
    region,
    bucket,
});

// Game
exports.getChartData = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { type } = req.body;
    const chartClass = new Chart(req, res, conn);
    const chartData = await chartClass.getRecentChartsForChart(type);
    const readyGame = await chartClass.getReadyChart(type);
    // console.log(chartData);
    res.send({
      chartData,
      readyGame,
    });
  } finally {
    conn.release();
  }
});

exports.getPoint = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const user = res.locals.user;
    if (user) {
      res.send({
        status: true,
        point: user.point,
      });
    } else {
      res.send({
        status: false,
        message: '???????????? ???????????????',
      });
    }
  } finally {
    conn.release();
  }
});

exports.setGame = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const user = res.locals.user;
    if (user) {
      const { gameType, round, point, underOver, oddEven } = req.body;
      if (user.point >= point) {
        const data = {
          user,
          gameType,
          round,
          point,
          underOver,
          oddEven,
        };
        const gameClass = new Game(req, res, conn);
        try {
          await gameClass.setGame(data);
          res.send({
            status: true,
            message: '????????? ?????????????????????.',
          });
        } catch (e) {
          res.send({
            status: false,
            message: e.message,
          });
        }
      } else {
        res.send({
          status: false,
          message: '???????????? ???????????????',
        });
      }
    } else {
      res.send({
        status: false,
        message: '???????????? ???????????????',
      });
    }
  } finally {
    conn.release();
  }
});

exports.getReadyGame = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { type } = req.body;
    const chartClass = new Chart(req, res, conn);
    const readyResult = await chartClass.getReadyChartForApi(type);
    res.send(readyResult);
  } finally {
    conn.release();
  }
});

exports.getRecentResult = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { type } = req.body;
    const user = res.locals.user;
    const gameClass = new Game(req, res, conn);
    const data = {
      user,
      type,
    }
    const results = await gameClass.getRecentResult(data);
    if (results.length) {
      res.send({
        status: true,
        datas: results,
      });
    } else {
      res.send({
        status: false,
      });
    }
  } finally {
    conn.release();
  }
});

exports.getStatistics = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { type } = req.body;
    const gameClass = new Game(req, res, conn);
    const { underOver, oddEven } = await gameClass.getStatistics(type);
    if (underOver.length && oddEven.length) {
      res.send({
        status: true,
        underOver,
        oddEven,
      });
    } else {
      res.send({
        status: false,
      });
    }
  } finally {
    conn.release();
  }
});

exports.imageNew = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { articleId } = req.body;
    const { files } = req;
    const imageClass = new Image(req, res, conn);
    const images = imageClass.align(files.images);
    for await (let image of images) {
      const data = {
        articleId,
        image,
      }
      await imageClass.create(data);
    }
    const newImages = await imageClass.getImages(articleId);
    res.send(newImages);
  } finally {
    conn.release();
  }
});

exports.imageDelete = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { articleId, imageId } = req.body;
    const imageClass = new Image(req, res, conn);
    await imageClass.remove(imageId);
    const newImages = await imageClass.getImages(articleId);
    res.send(newImages);
  } finally {
    conn.release();
  }
});

// CKEditor5
exports.imageUpload = doAsync(async (req, res, next) => {
  const { type } = req.body;
  const image = req.files.image[0];
  const key = await imageUpload(image, type);
  imageUpload(image, 'thumb', key, 640);
  const url = `${storage}/${type}/${key}`;
  res.send({
    url,
  });
});

exports.userImage = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const user = res.locals.user;
    const { files } = req;
    const image = files.userImage[0];
    const key = await imageUpload(image, 'userImage');
    await conn.query(`UPDATE user SET image=? WHERE id=?`, [key, user.id]);
    const oldKey = user.image;
    if (oldKey) {
      // Delete Old Key
      const thumbParams = {
        Bucket: bucket,
        Key: `userImage/${oldKey}`,
      };
      s3.deleteObject(thumbParams, (err, data) => {
        if (err) {
          console.error(err);
        }
      })
    }
    res.send({
      key,
    });
  } finally {
    conn.release();
  }
});

exports.blockChat = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { userId, type } = req.body;
    
  } finally {
    conn.release();
  }
});

exports.idCheck = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { uId } = req.body;
    const [result, ] = await conn.query(`SELECT * FROM user WHERE uId=?`, [uId]);
    if (result.length) {
      res.send(false);
    } else {
      res.send(true);
    }
  } finally {
    conn.release();
  }
});

exports.nickNameCheck = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { nickName } = req.body;
    const [result, ] = await conn.query(`SELECT * FROM user WHERE nickName=?`, [nickName]);
    if (result.length) {
      res.send(false);
    } else {
      res.send(true);
    }
  } finally {
    conn.release();
  }
});

exports.emailCheck = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { email } = req.body;
    const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/ig;
    if (email.match(emailRegex)) {
      const [result, ] = await conn.query(`SELECT * FROM user WHERE email=?`, [email]);
      if (result.length) {
        res.send({
          status: false,
          message: '????????? ????????? ?????????',
        });
      } else {
        res.send({
          status: true,
          message: '??????????????? ????????? ?????????',
        });
      }
    } else {
      res.send({
        status: false,
        message: '????????? ????????? ????????? ??????????????????',
      });
    }
  } finally {
    conn.release();
  }
});

exports.phoneVerify = doAsync(async (req, res, next) => {
  const phoneNumberRaw = req.body.phoneNumber;
  const phoneNumber = phoneNumberRaw.replace(/-/ig, '');
  const verifyNumber = Math.random().toString().slice(3, 7);
  sendMessage(phoneNumber, `[${res.locals.setting.siteName}] ??????????????? ${verifyNumber} ?????????`);
  req.session.verifyNumber = verifyNumber;
  req.session.save();
});

exports.phoneVerifyComplete = doAsync(async (req, res, next) => {
  const { verifyNumber } = req.body;
  if (verifyNumber === req.session.verifyNumber) {
    res.send(true);
  } else {
    res.send(false);
  }
});

exports.usePermissionImage = doAsync(async (req, res, next) => {
  let usePermissionImage = null;
  if (res.locals.setting.usePermissionImage) {
    usePermissionImage = true;
  } else {
    usePermissionImage = false;
  }
  res.status(200).send(usePermissionImage);
});

exports.getLink = doAsync(async (req, res, next) => {
  const { url } = req.query;
  const result = await axios.get(url);
  const html = result.data;
  const $ = cheerio.load(html);
  const title = $('title').text();
  const description = $(`meta[name="description"]`).attr("content");
  if ($(`meta[property="og:image"]`)) {
    const imageUrl = $(`meta[property="og:image"]`).attr("content");
    res.send({
      success: 1,
      meta: {
        title,
        description,
        image: {
          url: imageUrl,
        },
      },
    });
  }
});

exports.getContent = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.body;
    const [result, ] = await conn.query(`SELECT content FROM article WHERE id=?`, [id]);
    const data = JSON.parse(result[0].content);
    res.send(data);
  } finally {
    conn.release();
  }
});

exports.getContentPage = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { slug } = req.body;
    const [result, ] = await conn.query(`SELECT content FROM page WHERE slug=?`, [slug]);
    const data = JSON.parse(result[0].content);
    res.send(data);
  } finally {
    conn.release();
  }
});

exports.getChats = doAsync(async (req, res, next) => {
  res.send(status.chats);
});

exports.makeChatRoom = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { myId, targetId } = req.body;
    if (myId !== targetId) {
      const [chatList, ] = await conn.query(`SELECT * FROM chatRoom WHERE chatRoom_user_ID = ? AND chatRoom_targetUser_ID = ?`, [myId, targetId]);
      if (chatList.length) {
        res.send({
          status: true,
          hash: chatList[0].hash,
        });
      } else {
        const hash = hashCreate(8);
        await conn.query(`INSERT INTO chatRoom (chatRoom_user_ID, chatRoom_targetUser_ID, hash) VALUES (?, ?, ?)`, [myId, targetId, hash]);
        await conn.query(`INSERT INTO chatRoom (chatRoom_user_ID, chatRoom_targetUser_ID, hash) VALUES (?, ?, ?)`, [targetId, myId, hash]);
        res.send({
          status: true,
          hash,
        });
      }
    } else {
      res.status(404).send({
        status: false,
        message: 'error',
      });
    }
  } finally {
    conn.release();
  }
});

exports.getCategories = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const selected = req.body.data.selected;
    const query = `SELECT *
    FROM category
    WHERE category_board_ID=?`;
    const [categories, ] = await conn.query(query, [selected]);
    if (categories.length) {
      res.send(categories);
    } else {
      res.send(false);
    }
  } finally {
    conn.release();
  }
});

exports.getUser = doAsync(async (req, res, next) => {
  const user = res.locals.user;
  if (user) {
    res.send({
      isLogin: true,
      isAdmin: user.isAdmin,
      id: user.id,
      nickName: user.nickName,
      permission: user.permission,
      permissionImage: user.permissionImage,
      userImage: `${res.locals.storage}/userImage/${user.image}`,
    });
  } else {
    res.send({
      isLogin: false,
      message: '????????? ??????',
    });
  }
});

exports.getBoard = doAsync(async (req, res, next) => {
  const { boardId } = req.body;
  const board = res.locals.boards.find(board => board.id === Number(boardId));
  res.send(board);
});

exports.getUserGroupPermission = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { boardId, type } = req.body;
    const userGroupBoardClass = new UserGroupBoard(req, res, conn);
    const result = await userGroupBoardClass.check(boardId, type);
    res.send(result);
  } finally {
    conn.release();
  }
});

exports.getSetting = doAsync(async (req, res, next) => {
  const setting = res.locals.setting;
  const openSetting = {
    useMessage: setting.useMessage,
    usePermissionImage: setting.usePermissionImage,
  };
  res.send(openSetting);
});

exports.report = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { reportType, reportId, content } = req.body;
    const data = {
      reportType,
      reportId,
      content,
    };
    const reportClass = new Report(req, res, conn);
    const result = await reportClass.create(data);
    res.send(result);
  } finally {
    conn.release();
  }
});

exports.checkBlockWords = doAsync(async (req, res, next) => {
  const setting = res.locals.setting;
  const { content } = req.body;
  const result = checkBlockWordsFunc(setting.blockWords, content);
  res.send(result);
});

exports.like = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { articleId } = req.body;
    const [result, ] = await conn.query(`SELECT * FROM userArticleLike WHERE userArticleLike_user_ID=? AND userArticleLike_article_ID=?`,[res.locals.user.id, articleId]);
    if (!result.length) { // ?????? ????????? ?????? ?????? (count + 1)
      const insertQuery = `INSERT INTO userArticleLike
      (userArticleLike_user_ID, userArticleLike_article_ID)
      VALUES (?, ?)`;
      await conn.query(insertQuery, [res.locals.user.id, articleId]);
      await conn.query(`UPDATE article SET likeCount=likeCount+1 WHERE id=?`, [articleId]);
    } else { // ?????? ????????? ?????? ?????? (count - 1)
      const deleteQuery = `DELETE FROM userArticleLike
      WHERE userArticleLike_user_ID=? AND userArticleLike_article_ID=?`;
      await conn.query(deleteQuery, [res.locals.user.id, articleId]);
      await conn.query(`UPDATE article SET likeCount=likeCount-1 WHERE id=?`, [articleId]);
    }
    res.send(true);
  } finally {
    conn.release();
  }
});

exports.getComments = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { articleId, boardId } = req.body;
    const boards = res.locals.boards;
    const board = boards.find(board => board.id === Number(boardId));
    const commentsClass = new Comment(req, res, conn);
    const comments = await commentsClass.getComments(articleId, board);
    if (comments) {
      res.send({
        message: '?????? ???????????? ??????',
        comments,
      });
    } else {
      res.status(401).send({
        message: '?????? ???????????? ??????',
      });
    }
  } finally {
    conn.release();
  }
});

exports.newComment = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { articleId, content, nickName, password } = req.body;
    const data = {
      content,
      nickName,
      password,
    };
    const commentClass = new Comment(req, res, conn);
    const articleClass = new Article(req, res, conn);
    const article = await articleClass.get(articleId);
    const userGroupBoardClass = new UserGroupBoard(req, res, conn);
    const userGroupCommentPermission = await userGroupBoardClass.check(article.article_board_ID, 'commentPermission');
    if (userGroupCommentPermission) {
      const result = await commentClass.create(articleId, data);
      if (result) {
        res.send({
          message: '?????? ?????? ??????',
        });
      } else {
        res.status(401).send({
          message: '?????? ?????? ??????',
        });
      }
    } else {
      res.status(401).send({
        message: '????????? ????????????',
      });
    }
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
});

exports.replyComment = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { commentParentId, content, nickName, password } = req.body;
    const data = {
      content,
      nickName,
      password,
    };
    const commentClass = new Comment(req, res, conn);
    const comment = await commentClass.get(commentParentId);
    const articleClass = new Article(req, res, conn);
    const article = await articleClass.get(comment.comment_article_ID);
    const userGroupBoardClass = new UserGroupBoard(req, res, conn);
    const userGroupCommentPermission = await userGroupBoardClass.check(article.article_board_ID, 'commentPermission');
    if (userGroupCommentPermission) {
      const result = await commentClass.reply(commentParentId, data);
      res.send(result);
    } else {
      res.send(false);
    }
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
});

exports.editComment = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { commentId, content, nickName, password } = req.body;
    const data = {
      content,
      nickName,
      password,
    };
    const commentClass = new Comment(req, res, conn);
    const result = await commentClass.update(commentId, data);
    res.send(result);
  } finally {
    conn.release();
  }
});

exports.deleteComment = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { commentId, password } = req.body;
    const data = {
      password,
    };
    const commentClass = new Comment(req, res, conn);
    const result = await commentClass.remove(commentId, data);
    res.send(result);
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
});

exports.likeComment = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { commentId } = req.body;
    const commentClass = new Comment(req, res, conn);
    const result = await commentClass.like(commentId);
    res.send(result);
  } finally {
    conn.release();
  }
});

exports.unlikeComment = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { commentId } = req.body;
    const commentClass = new Comment(req, res, conn);
    const result = await commentClass.unlike(commentId);
    res.send(result);
  } finally {
    conn.release();
  }
});

// Offline
exports.getProvinces = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const [provinces, ] = await conn.query(`SELECT * FROM offlineProvince ORDER BY id ASC`);
    res.send(provinces);
  } finally {
    conn.release();
  }
});

exports.geolocation = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { method } = req;
    if (method === 'GET') {
      const geoLocation = req.cookies['geoLocation'];
      if (geoLocation) {
        res.send(geoLocation);
      } else {
        res.send(null);
      }
    } else if (method === 'POST') {
      const { latitude, longitude } = req.body;
      let geoLocation = null;
      if (latitude, longitude) {
        geoLocation = {
          latitude,
          longitude,
        };
      } else {
        let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress || null;
        geoLocation = await getGeoLocation(ip);
      }
      res.cookie('geoLocation', geoLocation, {
        maxAge: 1000 * 60 * 60,
      });
      res.send(geoLocation);
    }
  } finally {
    conn.release();
  }
});