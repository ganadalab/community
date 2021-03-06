const { timezone } = require('../config');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault(timezone);
const bcrypt = require('bcrypt');
const pool = require('../middleware/database');
const flash = require('../middleware/flash');
const hashCreate = require('../middleware/hash');
const { addLog } = require('../middleware/addlog');
const { sendMessage } = require('../middleware/sendMessage');
const datetime = require('../middleware/datetime');
const doAsync = require('../middleware/doAsync');
const emptyCheck = require('../middleware/emptyCheck');
const shuffle = require('../middleware/shuffle');
const { AppleLogin, GoogleLogin, FacebookLogin, TwitterLogin, NaverLogin, KakaoLogin } = require('../middleware/socialLogin');
const IndexBoard = require('../services/indexBoard');
const User = require('../services/user');
const Go = require('../services/go');
const Article = require('../services/article');
const Email = require('../services/email');

const SALT_COUNT = 10;

const apple = new AppleLogin();
const google = new GoogleLogin();
const facebook = new FacebookLogin();
const twitter = new TwitterLogin();
const naver = new NaverLogin();
const kakao = new KakaoLogin();

exports.authApple = doAsync(async (req, res, next) => {
  const setting = res.locals.setting;
  const { socialAppleServiceId, socialAppleTeamId, socialAppleKeyId, socialAppleAuthKey } = setting;
  const appleAuthUrl = apple.getLoginUrl(socialAppleServiceId, socialAppleTeamId, socialAppleKeyId, socialAppleAuthKey, `${setting.siteDomain}/auth/apple/callback`);
  res.redirect(appleAuthUrl);
});

exports.authGoogle = doAsync(async (req, res, next) => {
  const setting = res.locals.setting;
  const { socialGoogleClientId, socialGoogleClientSecret } = setting;
  const googleAuthUrl = google.getLoginUrl(socialGoogleClientId, socialGoogleClientSecret, `${setting.siteDomain}/auth/google/callback`);
  res.redirect(googleAuthUrl);
});

exports.authFacebook = doAsync(async (req, res, next) => {
  const setting = res.locals.setting;
  const { socialFacebookAppId, socialFacebookAppSecret } = setting;
  const facebookAuthUrl = facebook.getLoginUrl(socialFacebookAppId, socialFacebookAppSecret, `${setting.siteDomain}/auth/facebook/callback`);
  res.redirect(facebookAuthUrl);
});

exports.authTwitter = doAsync(async (req, res, next) => {
  const setting = res.locals.setting;
  const { socialTwitterApiKey, socialTwitterApiSecret } = setting;
  const twitterAuthUrl = await twitter.getLoginUrl(req, socialTwitterApiKey, socialTwitterApiSecret, `${setting.siteDomain}/auth/twitter/callback`);
  res.redirect(twitterAuthUrl);
});

exports.authNaver = doAsync(async (req, res, next) => {
  const setting = res.locals.setting;
  const { socialNaverClientId, socialNaverClientSecret } = setting;
  const naverAuthUrl = naver.getLoginUrl(socialNaverClientId, socialNaverClientSecret, `${setting.siteDomain}/auth/naver/callback`);
  res.redirect(naverAuthUrl);
});

exports.authKakao = doAsync(async (req, res, next) => {
  const setting = res.locals.setting;
  const { socialKakaoClientId, socialKakaoClientSecret } = setting;
  const kakaoAuthUrl = kakao.getLoginUrl(socialKakaoClientId, socialKakaoClientSecret, `${setting.siteDomain}/auth/kakao/callback`);
  res.redirect(kakaoAuthUrl);
});

exports.authAppleCallback = doAsync(async (req, res, next) => {
  const { code } = req.body;
  const user = await apple.auth(code);
  const result = await authCheckout(req, res, next, user);
  if (result) {
    res.redirect('/');
  } else {
    flash.create({
      status: false,
      message: '???????????? ??????????????????',
    });
    res.redirect('/login');
  }
});

exports.authGoogleCallback = doAsync(async (req, res, next) => {
  const { code } = req.query;
  const user = await google.auth(code);
  const result = await authCheckout(req, res, next, user);
  if (result) {
    res.redirect('/');
  } else {
    flash.create({
      status: false,
      message: '???????????? ??????????????????',
    });
    res.redirect('/login');
  }
});

exports.authFacebookCallback = doAsync(async (req, res, next) => {
  const { code } = req.query;
  const user = await facebook.auth(code);
  const result = await authCheckout(req, res, next, user);
  if (result) {
    res.redirect('/');
  } else {
    flash.create({
      status: false,
      message: '???????????? ??????????????????',
    });
    res.redirect('/login');
  }
});

exports.authTwitterCallback = doAsync(async (req, res, next) => {
  const { oauth_verifier } = req.query;
  const user = await twitter.auth(req, oauth_verifier);
  const result = await authCheckout(req, res, next, user);
  if (result) {
    res.redirect('/');
  } else {
    flash.create({
      status: false,
      message: '???????????? ??????????????????',
    });
    res.redirect('/login');
  }
});

exports.authNaverCallback = doAsync(async (req, res, next) => {
  const { code, state } = req.query;
  const user = await naver.auth(code, state);
  const result = await authCheckout(req, res, next, user);
  if (result) {
    res.redirect('/');
  } else {
    flash.create({
      status: false,
      message: '???????????? ??????????????????',
    });
    res.redirect('/login');
  }
});

exports.authKakaoCallback = doAsync(async (req, res, next) => {
  const { code } = req.query;
  const user = await kakao.auth(code);
  const result = await authCheckout(req, res, next, user);
  if (result) {
    res.redirect('/');
  } else {
    flash.create({
      status: false,
      message: '???????????? ??????????????????',
    });
    res.redirect('/login');
  }
});

const authCheckout = async (req, res, next, userInfo) => {
  if (userInfo && userInfo.email) {
    const { type, id, email } = userInfo;
    const conn = await pool.getConnection();
    try {
      const [socialIdResult, ] = await conn.query(`SELECT * FROM user WHERE ${type}Id=?`, [id]);
      if (socialIdResult.length) { // ?????????
        const user = socialIdResult[0];
        req.session.user = user;
        req.session.save(() => {
          
        });
      } else { // ????????????
        // ????????? ??????
        const [emailResult, ] = await conn.query(`SELECT * FROM user WHERE uId=? OR email=?`, [email, email]);
        if (emailResult.length) { // ?????? ????????? ?????? ???????????? ??????
          const user = emailResult[0];
          const [result, ] = await conn.query(`UPDATE user SET ${type}Id=? WHERE id=?`, [id, user.id]);
          if (result.affectedRows) {
            // ????????? ??????
            req.session.user = user;
            req.session.save(() => {
              
            });
          } else {
            res.redirect('/login');
          }
        } else { // ?????? ?????? ??????
          const password = hashCreate(8);
          const nickName = hashCreate(6);
          const salt = bcrypt.genSaltSync(SALT_COUNT);
          const hash = bcrypt.hashSync(password, salt);
          const query = `INSERT INTO user (uId, password, nickName, email, ${type}Id) VALUES (?, ?, ?, ?, ?)`;
          const [result, ] = await conn.query(query, [email, hash, nickName, email, id]);
          if (result.insertId) {
            const [users, ] = await conn.query(`SELECT * FROM user WHERE id=?`, [result.insertId]);
            if (users.length) {
              const user = users[0];
              req.session.user = user;
              req.session.save(() => {
                
              });
              const userClass = new User(req, res, conn);
              await userClass.checkout(user);
            }
          }
        }
      }
    } finally {
      conn.release();
    }
  } else {
    if (!userInfo) {
      throw new Error('?????? ????????? ???????????? ????????????');
    } else if (!userInfo.email) {
      throw new Error('?????? ???????????? ???????????? ????????????');
    } else {
      throw new Error('Auth checkout error');
    }
  }
};

exports.emailAuthentication = doAsync(async (req, res, next) => {
  const { method } = req;
  if (method === 'GET') {
    const user = res.locals.user;
    if (user && res.locals.setting.useEmailAuthentication && !user.emailAuthentication && !user.isAdmin && !user.workingUser) {
      res.render('emailAuthentication', {
        pageTitle: `????????? ?????? - ${res.locals.setting.siteName}`,
      });
    } else {
      if (req.headers.referer && !req.headers.referer.match(/emailAuthentication/)) {
        res.redirect(req.headers.referer);
      } else {
        res.redirect('/');
      }
    }
  } else if (method === 'POST') {
    const { emailService, emailUser, emailPassword } = res.locals.setting;
    if (emailUser, emailPassword) {
      const conn = await pool.getConnection();
      try {
        const { submit } = req.body;
        const user = res.locals.user;
        if (submit === 'authentication') {
          const { hash } = req.body;
          const [check, ] = await conn.query(`SELECT * FROM authentication WHERE authentication_user_ID = ? AND type = ?`, [user.id, 'email']);
          if (check.length) {
            if (hash === check[0].hash) {
              // conn.beginTransaction();
              await conn.query(`DELETE FROM authentication WHERE authentication_user_ID = ? AND type = ?`, [user.id, 'email']);
              await conn.query(`UPDATE user SET emailAuthentication = ? WHERE id = ?`, [1, user.id]);
              // await conn.commit();
              if (req.headers.referer && !req.headers.referer.match(/emailAuthentication/)) {
                res.redirect(`${req.headers.referer}`);
              } else {
                res.redirect('/');
              }
            } else {
              flash.create({
                status: false,
                message: '??????????????? ????????????',
              });
              res.redirect('/emailAuthentication');
            }
          }
        } else if (submit === 'emailResend') {
          const hash = hashCreate(8);
          const [oldHash, ] = await conn.query(`SELECT * FROM authentication WHERE authentication_user_ID = ? AND type = ?`, [user.id, 'email']);
          if (oldHash.length) await conn.query(`DELETE FROM authentication WHERE authentication_user_ID = ? AND type = ?`, [user.id, 'email']);
          await conn.query(`INSERT INTO authentication (authentication_user_ID, type, hash) VALUES (?, ?, ?)`, [user.id, 'email', hash]);
          const emailClass = new Email(req, res, conn);
          emailClass.create(user.email, {
            subject: `????????? ?????? - ${res.locals.setting.siteName}`,
            content: `
            <h1>????????? ?????? - ${res.locals.setting.siteName}</h1>
            <hr>
            <p>${user.nickName} ?????? ????????? ????????????</p><p style="font-weight: bold;">${hash}</p>`,
          });
          flash.create({
            status: true,
            message: '???????????? ?????????????????????',
          });
          res.redirect('/emailAuthentication');
        }
      } catch (e) {
        await conn.rollback();
        next(e);
      } finally {
        conn.release();
      }
    } else {
      flash.create({
        status: false,
        message: '?????? ???????????? ????????? ????????? ???????????? ????????????',
      });
      res.redirect(req.headers.referer);
    }
  }
});

exports.smsAuthentication = doAsync(async (req, res, next) => {
  const { method } = req;
  if (method === 'GET') {
    if (res.locals.user && res.locals.setting.useSmsAuthentication && !res.locals.user.phoneAuthentication && !res.locals.user.isAdmin && !res.locals.user.workingUser) {
      res.render('smsAuthentication', {
        pageTitle: `SMS ?????? - ${res.locals.setting.siteName}`,
      });
    } else {
      if (req.headers.referer && !req.headers.referer.match(/smsAuthentication/)) {
        res.redirect(`${req.headers.referer}`);
      } else {
        res.redirect('/');
      }
    }
  } else if (method === 'POST') {
    const conn = await pool.getConnection();
    try {
      const { submit } = req.body;
      const user = res.locals.user;
      if (submit === 'authentication') {
        const { hash } = req.body;
        const [check, ] = await conn.query(`SELECT * FROM authentication WHERE authentication_user_ID = ? AND type = ? ORDER BY id DESC`, [user.id, 'sms']);
        if (check.length) {
          if (hash === check[0].hash) {
            // conn.beginTransaction();
            await conn.query(`DELETE FROM authentication WHERE authentication_user_ID = ? AND type = ?`, [user.id, 'email']);
            await conn.query(`UPDATE user SET phoneAuthentication = ? WHERE id = ?`, [1, user.id]);
            // await conn.commit();
            if (req.headers.referer && !req.headers.referer.match(/smsAuthentication/)) {
              res.redirect(`${req.headers.referer}`);
            } else {
              res.redirect('/');
            }
          } else {
            flash.create({
              status: false,
              message: '??????????????? ????????????',
            });
            res.redirect('/smsAuthentication');
          }
        }
      } else if (submit === 'smsResend') {
        const verifyNumber = Math.random().toString().slice(3, 7);
        const query = `INSERT INTO authentication
        (authentication_user_ID, type, hash)
        VALUES (?, ?, ?)`;
        await conn.query(query, [user.id, 'sms', verifyNumber]);
        sendMessage(user.phone, `[${res.locals.setting.siteNameRaw}] ??????????????? ${verifyNumber} ?????????`);
        flash.create({
          status: true,
          message: 'SMS??? ?????????????????????',
        });
        res.redirect('/smsAuthentication');
      }
    } catch (e) {
      await conn.rollback();
      next(e);
    } finally {
      conn.release();
    }
  }
});

exports.index = doAsync(async (req, res, next) => {
  const index = res.locals.setting.index;
  if (index === 'basic') {
    const conn = await pool.getConnection();
    try {
      const indexBoard = new IndexBoard(req, res, conn);
      const indexBoardGroups = await indexBoard.get('index');
      addLog(req, `/`);
      res.render('index', {
        pageTitle: `${res.locals.setting.siteName}`,
        indexBoardGroups,
      });
    } finally {
      conn.release();
    }
  } else {
    next();
  }
});

exports.go = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { slug } = req.params;
    const goClass = new Go(req, res, conn);
    const go = await goClass.getBySlug(slug);
    if (go) {
      res.redirect(go.url);
    } else {
      next();
    }
  } finally {
    conn.release();
  }
});

exports.terms = doAsync(async (req, res, next) => {
  res.render('terms', {
    pageTitle: `???????????? - ${res.locals.setting.siteName}`,
  });
});

exports.privacy = doAsync(async (req, res, next) => {
  res.render('privacy', {
    pageTitle: `?????????????????? ?????? - ${res.locals.setting.siteName}`,
  });
});

exports.changeUser = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { method } = req;
    if (method === 'GET') {
      const query = `SELECT *
      FROM user
      WHERE workingUser = 1`;
      const [users, ] = await conn.query(query);
      if (users.length > 1) {
        const existingUser = res.locals.user;
        let random = Math.floor(Math.random() * users.length);
        let newUser = null;
        do {
          random = Math.floor(Math.random() * users.length);
          newUser = users[random];
        } while (existingUser.id === newUser.id);
        req.session.user = users[random];
        req.session.save();
      }
    } else if (method === 'POST') {
      const { keyword } = req.body;
      const query = `SELECT u.*
      FROM user AS u
      LEFT JOIN permission AS p
      ON u.permission = p.permission
      WHERE u.workingUser = 1 AND u.uId LIKE CONCAT('%',?,'%')
      OR p.isAdmin AND u.uId LIKE CONCAT('%',?,'%')
      OR u.workingUser = 1 AND u.nickName LIKE CONCAT('%',?,'%')
      OR p.isAdmin AND u.nickName LIKE CONCAT('%',?,'%')`;
      const [users,] = await conn.query(query, [keyword, keyword, keyword, keyword]);
      if (users.length) {
        const user = users[0];
        res.locals.user = user;
        req.session.user = user;
        req.session.save();
      }
    }
    res.redirect(req.headers.referer);
  } finally {
    conn.release();
  }
});

exports.login = doAsync(async (req, res, next) => {
  const { method } = req;
  if (method === 'GET') {
    if (res.locals.user) {
      res.redirect('/');
    } else {
      res.render('login', {
        pageTitle: `????????? - ${res.locals.setting.siteName}`,
      });
    }
  } else if (method === 'POST') {
    const conn = await pool.getConnection();
    try {
      const { keyword, password } = req.body;
      const data = {
        keyword,
        password,
      };
      const userClass = new User(req, res, conn);
      try {
        const user = await userClass.login(data);
        if (user) {
          req.session.user = user;
          req.session.save(() => {
            res.redirect(req.headers.referer);
          });
        }
      } catch (e) {
        flash.create({
          status: false,
          message: e.message,
        });
        res.redirect(req.headers.referer);
      }
    } finally {
      conn.release();
    }
  }
});

exports.logout = doAsync(async (req, res, next) => {
  req.session.destroy(() => {
    res.redirect(req.headers.referer);
  });
});

exports.join = doAsync(async (req, res, next) => {
  const { method } = req;
  if (method === 'GET') {
    res.render('join', {
      pageTitle: `???????????? - ${res.locals.setting.siteName}`,
    });
  } else if (method === 'POST') {
    const conn = await pool.getConnection();
    try {
      const { uId, password, passwordCheck, nickName, email, phone, realName, inviteId } = req.body;
      if (emptyCheck(uId, password, passwordCheck, nickName, email)) {
        if (password === passwordCheck) {
          const userClass = new User(req, res, conn);
          const data = {
            uId,
            password,
            nickName,
            email,
            phone,
            realName,
            inviteId,
          };
          const user = await userClass.create(data);
          if (user) {
            await userClass.checkout(user);
            req.session.user = user;
            req.session.save(() => {
              res.redirect('/');
            });
          }
        } else {
          res.redirect('/join');
        }
      } else {
        res.redirect('/join');
      }
    } finally {
      conn.release();
    }
  }
});

exports.joinAgreement = doAsync(async (req, res, next) => {
  res.cookie('agreement', true, {
    maxAge: 1000 * 60 * 60,
  });
  res.redirect('/join');
});

// ????????????
exports.check = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { method } = req;
    const user = res.locals.user;
    const setting = res.locals.setting;
    if (method === 'GET') {
      const { date } = req.query;
      const today = date || datetime(Date.now(), 'date');
      const yesterday = moment(today).subtract(1, 'days').format('YYYY-MM-DD');
      const tomorrow = moment(today).subtract(-1, 'days').format('YYYY-MM-DD');
      const now = datetime(Date.now(), 'date');
      const query = `SELECT c.*, u.nickName, u.checkContinue AS \`continue\`, u.checkTotal AS total
      FROM \`check\` AS c
      LEFT JOIN user AS u
      ON c.check_user_ID = u.id
      WHERE date_format(CONVERT_TZ(c.createdAt, @@session.time_zone, '+09:00'), '%Y-%m-%d') = ?
      ORDER BY c.id ASC`;
      const [checks, ] = await conn.query(query, today);
      let i = 1;
      checks.forEach(check => {
        check.datetime = datetime(check.createdAt, 'time');
        check.number = i;
        i ++;
      });
      checks.reverse();
      const [checkContinues, ] = await conn.query(`SELECT * FROM checkContinue ORDER BY date ASC`);
      let status = false;
      if (user) {
        const statusQuery = `SELECT c.*
        FROM \`check\` AS c
        LEFT JOIN user AS u
        ON c.check_user_ID = u.id
        WHERE date_format(CONVERT_TZ(c.createdAt, @@session.time_zone, '+09:00'), '%Y-%m-%d') = ?
        AND c.check_user_ID = ?
        ORDER BY c.id DESC`;
        const [checkStatusResult, ] = await conn.query(statusQuery, [today, user.id]);
        if (checkStatusResult.length) {
          status = true;
        }
      }
      // ?????? ?????????
      let checkComment = null;
      if (setting.useCheckComments) {
        const checkComments = setting.checkComments;
        const checkCommentsArray = checkComments ? checkComments.split(',').map(comment => comment.trim()).filter(comment => comment.length) : [];
        if (checkCommentsArray.length) {
          checkComment = shuffle(checkCommentsArray)[0];
        }
      }
      res.render('check', {
        pageTitle: `???????????? - ${res.locals.setting.siteName}`,
        today,
        yesterday,
        tomorrow,
        now,
        checks,
        checkContinues,
        checkComment,
        status,
      });
    } else if (method === 'POST') {
      const { comment } = req.body;
      const checkPoint = res.locals.setting.checkPoint;
      const user = res.locals.user;
      if (user) {
        const today = datetime(Date.now(), 'date');
        const query = `SELECT c.*
        FROM \`check\` AS c
        LEFT JOIN user AS u
        ON c.check_user_ID = u.id
        WHERE date_format(CONVERT_TZ(c.createdAt, @@session.time_zone, '+09:00'), '%Y-%m-%d') = ?
        AND c.check_user_ID = ?
        ORDER BY c.id DESC`;
        const [checks, ] = await conn.query(query, [today, user?.id]);
        if (!checks.length) {
          let point = checkPoint;
          const yesterday = moment(Date.now()).subtract('1', 'days').format('YYYY-MM-DD');
          const yesterdayQuery = `SELECT c.*
          FROM \`check\` AS c
          LEFT JOIN user AS u
          ON c.check_user_ID = u.id
          WHERE date_format(CONVERT_TZ(c.createdAt, @@session.time_zone, '+09:00'), '%Y-%m-%d') = ?
          AND c.check_user_ID = ?
          ORDER BY c.id DESC`;
          const [yesterdayResult, ] = await conn.query(yesterdayQuery, [yesterday, user.id]);
          // conn.beginTransaction();
          // ????????? ??????
          if (yesterdayResult.length) {
            const userContinue = user.checkContinue + 1;
            await conn.query(`UPDATE user SET checkContinue=checkContinue+1 WHERE id=?`, [user.id]);
            const [checkContinues, ] = await conn.query(`SELECT * FROM checkContinue ORDER BY date ASC`);
            let thisContinues = checkContinues.filter(checkContinue => checkContinue.date === userContinue);
            // ?????? ?????? ??????
            if (thisContinues.length) {
              const thisContainue = thisContinues[0];
              point = thisContainue.point;
            } else {
              thisContinues = checkContinues.filter(checkContinue => checkContinue.date < userContinue);
              const thisContainue = thisContinues[thisContinues.length - 1];
              if (thisContainue) {
                point = thisContainue.point;
              }
            }
          } else {
            // ????????? ?????? ??????
            await conn.query(`UPDATE user SET checkContinue=? WHERE id=?`, [1, user.id]);
          }
          // ?????? ??????
          await conn.query(`INSERT INTO \`check\` (check_user_ID, comment, point) VALUES (?, ?, ?)`, [user.id, comment, point]);
          // ????????? ?????? & ??? ????????? + 1
          await conn.query(`UPDATE user SET point=point+?, checkTotal=checkTotal+1 WHERE id=?`, [point, user.id]);
          // ????????? ?????? ?????? ??????
          await conn.query(`INSERT INTO point (point_user_ID, type, point) VALUES (?, ?, ?)`, [user.id, 'checkPoint', point]);
          // await conn.commit();
          // ??????
          flash.create({
            status: true,
            message: '???????????? ??????',
          });
        } else {
          flash.create({
            status: false,
            message: '????????? ?????? ???????????? ???????????????',
          });
        }
      } else {
        flash.create({
          status: false,
          message: '???????????? ???????????????',
        });
      }
      res.redirect(req.headers.referer);
    }
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
});

exports.rank = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { date } = req.query;
    const userClass = new User(req, res, conn);
    const pointRanks = await userClass.getPointRanks({ date });
    res.render('rank', {
      pageTitle: `????????? ?????? - ${res.locals.setting.siteName}`,
      pointRanks,
      date,
    });
  } finally {
    conn.release();
  }
});

exports.findInfo = doAsync(async (req, res, next) => {
  res.render('findInfo', {
    pageTitle: `?????????, ???????????? - ${res.locals.setting.siteName}`,
  });
});

exports.findId = doAsync(async (req, res, next) => {
  const { method } = req;
  if (method === 'GET') {
    res.render('findId', {
      pageTitle: `????????? ?????? - ${res.locals.setting.siteName}`,
    });
  }
});

exports.findIdEmail = doAsync(async (req, res, next) => {
  const { method } = req;
  if (method === 'GET') {
    res.render('findId-email', {
      pageTitle: `????????? ?????? - ${res.locals.setting.siteName}`,
    });
  } else if (method === 'POST') {
    const conn = await pool.getConnection();
    try {
      const { email } = req.body;
      const hash = hashCreate(8);
      const [users, ] = await conn.query(`SELECT * FROM user WHERE email=?`, [email]);
      if (users.length) {
        const user = users[0];
        const query = `INSERT INTO authentication
        (authentication_user_ID, type, hash)
        VALUES (?, ?, ?)`;
        await conn.query(query, [user.id, 'id', hash]);
        const emailClass = new Email(req, res, conn);
        emailClass.create(email, {
          subject: `????????? ?????? - ${res.locals.setting.siteName}`,
          content: `
          <h1>????????? ?????? - ${res.locals.setting.siteName}</h1>
          <hr>
          <p>${user.nickName} ??? ?????? ??? ?????????</p><p>${user.uId}</p>`,
        });
        flash.create({
          status: true,
          message: '???????????? ?????????????????????',
        });
        res.redirect('/login');
      } else {
        // ???????????? ???????????? ????????????.
        flash.create({
          status: false,
          message: '???????????? ???????????? ????????????',
        })
        res.redirect('/findPassword');
      }
    } finally {
      conn.release();
    }
  }
});

exports.findIdSms = doAsync(async (req, res, next) => {
  const { method } = req;
  if (method === 'GET') {
    res.render('findId-sms', {
      pageTitle: `????????? ?????? - ${res.locals.setting.siteName}`,
    });
  } else if (method === 'POST') {
    const conn = await pool.getConnection();
    try {
      const phoneNumberRaw = req.body.phoneNumber;
      const phoneNumber = phoneNumberRaw.replace(/\-/ig, '');
      const [users, ] = await conn.query(`SELECT * FROM user WHERE phone=?`, [phoneNumber]);
      if (users.length) {
        const user = users[0];
        const verifyNumber = Math.random().toString().slice(3, 7);
        const query = `INSERT INTO authentication
        (authentication_user_ID, type, hash)
        VALUES (?, ?, ?)`;
        await conn.query(query, [user.id, 'id', 'sms', verifyNumber]);
        sendMessage(phoneNumber, `[${res.locals.setting.siteName}] ??????????????? ${verifyNumber} ?????????`);
        res.redirect('/findId/sms/verify');
      } else {
        flash.create({
          status: false,
          message: '????????? ????????? ????????????',
        });
        res.redirect('/findId/sms');
      }
    } finally {
      conn.release();
    }
  }
});

exports.findIdSmsAuth = doAsync(async (req, res, next) => {
  const { method } = req;
  if (method === 'GET') {
    res.render('findId-sms-verify', {
      pageTitle: `????????? ?????? - ${res.locals.setting.siteName}`,
    });
  } else if (method === 'POST') {
    const conn = await pool.getConnection();
    try {
      const { verifyNumber } = req.body;
      const query = `SELECT a.*, u.nickName AS nickName, u.id AS id, u.uId AS uId
      FROM authentication AS a
      JOIN user AS u
      ON a.authentication_user_ID = u.id
      WHERE a.hash=?`;
      const [results, ] = await conn.query(query, [verifyNumber]);
      if (results.length) {
        const result = results[0];
        await conn.query(`DELETE FROM authentication WHERE authentication_user_ID=?`, [result.id]);
        res.render('findId-sms-complete', {
          pageTitle: `????????? ?????? - ${res.locals.setting.siteName}`,
          result,
        });
      } else {
        flash.create({
          status: false,
          message: `??????????????? ????????????`,
        });
        res.redirect('/findId/sms/verify');
      }
    } finally {
      conn.release();
    }
  }
});

exports.findPassword = doAsync(async (req, res, next) => {
  const { method } = req;
  if (method === 'GET') {
    res.render('findPassword', {
      pageTitle: `???????????? ?????? - ${res.locals.setting.siteName}`,
    });
  }
});

exports.findPasswordEmail = doAsync(async (req, res, next) => {
  const { method } = req;
  if (method === 'GET') {
    res.render('findPassword-email', {
      pageTitle: `???????????? ?????? - ${res.locals.setting.siteName}`,
    });
  } else if (method === 'POST') {
    const conn = await pool.getConnection();
    try {
      const [settings, ] = await conn.query(`SELECT * FROM setting ORDER BY id DESC LIMIT 1`);
      if (settings.length) {
        const { email } = req.body;
        // const salt = bcrypt.genSaltSync(SALT_COUNT);
        // const hash = bcrypt.hashSync(email, salt);
        const hash = hashCreate(8);
        const [users, ] = await conn.query(`SELECT * FROM user WHERE email=?`, [email]);
        if (users.length) {
          const user = users[0];
          const query = `INSERT INTO authentication
          (authentication_user_ID, type, hash)
          VALUES (?, ?, ?)`;
          await conn.query(query, [user.id, 'password', hash]);
          const emailClass = new Email(req, res, conn);
          emailClass.create(email, {
            subject: `??? ???????????? - ${res.locals.setting.siteName}`,
            content: `
            <h1>??? ???????????? - ${res.locals.setting.siteName}</h1>
            <hr>
            <p><a href="${res.locals.setting.siteDomain}/findPassword/newPassword/${hash}">??? ???????????? ??????</a>`,
          });
          flash.create({
            status: true,
            message: '???????????? ?????????????????????.',
          })
          res.redirect('/');
        } else {
          // ???????????? ???????????? ????????????.
          flash.create({
            status: false,
            message: '???????????? ???????????? ????????????',
          })
          res.redirect('/findPassword/email');
        }
      } else {
        next();
      }
    } finally {
      conn.release();
    }
  }
});

exports.findPasswordSms = doAsync(async (req, res, next) => {
  const { method } = req;
  if (method === 'GET') {
    res.render('findPassword-sms', {
      pageTitle: `???????????? ?????? - ${res.locals.setting.siteName}`,
    });
  } else if (method === 'POST') {
    const conn = await pool.getConnection();
    try {
      const phoneNumberRaw = req.body.phoneNumber;
      const phoneNumber = phoneNumberRaw.replace(/\-/ig, '');
      const [users, ] = await conn.query(`SELECT * FROM user WHERE phone=?`, [phoneNumber]);
      if (users.length) {
        const user = users[0];
        const verifyNumber = Math.random().toString().slice(3, 7);
        const query = `INSERT INTO authentication
        (authentication_user_ID, type, hash)
        VALUES (?, ?, ?)`;
        await conn.query(query, [user.id, 'id', 'sms', verifyNumber]);
        sendMessage(phoneNumber, `[${res.locals.setting.siteName}] ??????????????? ${verifyNumber} ?????????`);
        res.redirect('/findPassword/sms/verify');
      } else {
        flash.create({
          status: false,
          message: '????????? ????????? ????????????',
        });
        res.redirect('/findPassword/sms');
      }
    } finally {
      conn.release();
    }
  }
});

exports.findPasswordSmsAuth = doAsync(async (req, res, next) => {
  const { method } = req;
  if (method === 'GET') {
    res.render('findPassword-sms-verify', {
      pageTitle: `???????????? ?????? - ${res.locals.setting.siteName}`,
    });
  } else if (method === 'POST') {
    const conn = await pool.getConnection();
    try {
      const { verifyNumber } = req.body;
      const query = `SELECT a.*, u.nickName AS nickName, u.id AS id, u.uId AS uId
      FROM authentication AS a
      JOIN user AS u
      ON a.authentication_user_ID = u.id
      WHERE a.hash=?`;
      const [results, ] = await conn.query(query, [verifyNumber]);
      if (results.length) {
        const result = results[0];
        res.redirect(`/findPassword/newPassword/${result.hash}`);
      } else {
        flash.create({
          status: false,
          message: `??????????????? ????????????`,
        });
        res.redirect('/findPassword/sms/verify');
      }
    } finally {
      conn.release();
    }
  }
});

exports.findPasswordComplete = doAsync(async (req, res, next) => {
  const { method } = req;
  if (method === 'GET') {
    const { hash } = req.params;
    res.render('newPassword', {
      pageTitle: `??? ???????????? - ${res.locals.siteName}`,
      hash,
    });
  } else if (method === 'POST') {
    const conn = await pool.getConnection();
    try {
      const { password, passwordCheck } = req.body;
      if (password === passwordCheck) {
        const salt = bcrypt.genSaltSync(SALT_COUNT);
        const passwordHash = bcrypt.hashSync(password, salt);
        const { hash } = req.params;
        const [result, ] = await conn.query(`SELECT * FROM authentication WHERE hash=?`, [hash]);
        if (result.length) {
          const userId = result[0].authentication_user_ID;
          await conn.query(`UPDATE user SET password=? WHERE id=?`, [passwordHash, userId]);
          await conn.query(`DELETE FROM authentication WHERE authentication_user_ID=?`, [userId]);
        }
      }
      res.redirect('/');
    } finally {
      conn.release();
    }
  }
});

exports.robots = doAsync(async (req, res, next) => {
  const setting = res.locals.setting;
  res.set('Content-Type', 'text/plain').render('robots', {
    host: `${setting.siteDomain}`,
  });
});

exports.feed = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const query = `SELECT a.*, a.nickName AS nonMember, b.title AS board, b.slug AS boardSlug, c.title AS category, u.uId, u.nickName AS nickName
    FROM article AS a
    LEFT JOIN board AS b
    ON a.article_board_ID = b.id
    LEFT JOIN category AS c
    ON a.article_category_ID = c.id
    LEFT JOIN user AS u
    ON a.article_user_ID = u.id
    LEFT JOIN permission AS p
    ON u.permission = p.permission
    WHERE a.status=2
    ORDER BY a.createdAt DESC`;
    const [articles, ] = await conn.query(query);
    const articleClass = new Article(req, res, conn);
    articles.forEach(article => {
      article.datetime = moment(article.updatedAt).format('ddd, DD MMM YYYY HH:mm:ss ZZ', 'ddd, DD MMM YY HH:mm:ss ZZ');
      if (!article.nickName) article.nickName = article.nonMember;
      article = articleClass.setInfo(article);
    });
    let lastDatetime = null;
    if (articles.length) lastDatetime = moment(articles[0].updatedAt).format('ddd, DD MMM YYYY HH:mm:ss ZZ', 'ddd, DD MMM YY HH:mm:ss ZZ');
    res.set('Content-Type', 'text/xml').render('feed', {
      articles,
      lastDatetime,
    });
  } finally {
    conn.release();
  }
});

exports.sitemap = doAsync(async (req, res, next) => {
  const setting = res.locals.setting;
  res.set('Content-Type', 'text/xml').render('sitemap', {
    host: `${setting.siteDomain}`,
  });
});

exports.sitemapBoard = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const query = `SELECT b.*, date_format(b.updatedAt,'%Y-%m-%dT%H:%i:%s+09:00') AS datetime
    FROM board AS b
    WHERE b.status=1
    ORDER BY id DESC`;
    const [boards, ] = await conn.query(query);
    const [result, ] = await conn.query(`SELECT siteDomain FROM setting`);
    res.set('Content-Type', 'text/xml').render('sitemap/board', {
      host: `${result[0].siteDomain}`,
      boards,
    });
  } finally {
    conn.release();
  }
});

exports.sitemapArticle = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const query = `SELECT a.*, date_format(a.updatedAt,'%Y-%m-%dT%H:%i:%s+09:00') AS datetime, b.slug AS board
    FROM article AS a
    LEFT JOIN board AS b
    ON a.article_board_ID = b.id
    WHERE a.status=2
    ORDER BY id DESC`;
    const [articles, ] = await conn.query(query);
    const [result, ] = await conn.query(`SELECT siteDomain FROM setting`);
    res.set('Content-Type', 'text/xml').render('sitemap/article', {
      host: `${result[0].siteDomain}`,
      articles,
    });
  } finally {
    conn.release();
  }
});

exports.sitemapPage = doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const query = `SELECT p.*, date_format(p.updatedAt,'%Y-%m-%dT%H:%i:%s+09:00') AS datetime
    FROM page AS p
    WHERE p.status=1
    ORDER BY id DESC`;
    const [pages, ] = await conn.query(query);
    const [result, ] = await conn.query(`SELECT siteDomain FROM setting`);
    res.set('Content-Type', 'text/xml').render('sitemap/page', {
      host: `${result[0].siteDomain}`,
      pages,
    });
  } finally {
    conn.release();
  }
});

exports.sitemapStore = doAsync(async (req, res, next) => {
  const index = res.locals.setting.index;
  if (index === 'offline') {
    const conn = await pool.getConnection();
    try {
      const query = `SELECT s.*, date_format(s.updatedAt,'%Y-%m-%dT%H:%i:%s+09:00') AS datetime
      FROM offlineStore AS s
      WHERE s.status=1
      ORDER BY s.id DESC`;
      const [stores, ] = await conn.query(query);
      const [result, ] = await conn.query(`SELECT siteDomain FROM setting`);
      res.set('Content-Type', 'text/xml').render('sitemap/store', {
        host: `${result[0].siteDomain}`,
        stores,
      });
    } finally {
      conn.release();
    }
  } else {
    next();
  }
});

exports.adsenseAds = doAsync(async (req, res, next) => {
  const adsenseAds = res.locals.setting.adsenseAds;
  res.send(adsenseAds);
});