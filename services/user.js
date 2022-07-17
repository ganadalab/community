const bcrypt = require('bcrypt');
const flash = require('../middleware/flash');
const hashCreate = require('../middleware/hash');
const pagination = require('../middleware/pagination');
const { sendMessage } = require('../middleware/sendMessage');
const Class = require('./class');
const Email = require('./email');

const SALT_COUNT = 10;

class User extends Class {
  async login (data) {
    data = Object.assign({
      keyword: null,
      password: null,
    }, data);
    const { keyword, password } = data;
    const user = await this.getByUidOrEmail(keyword);
    if (user) {
      const passwordCheckResult = await this.passwordCheck(user, password);
      if (passwordCheckResult) {
        return user;
      } else {
        throw new Error('비밀번호가 일치하지 않습니다');
      }
    } else {
      throw new Error('이메일이 존재하지 않습니다');
    }
  }
  async getUsersByPagination (data, listCount) {
    data = Object.assign({
      searchType: null,
      keyword: null,
    }, data);
    const { searchType, keyword } = data;
    let queryString = '';
    const queryArray = [];
    if (searchType === 'uId') {
      queryString = `WHERE uId LIKE CONCAT('%',?,'%')`;
      queryArray.push(keyword);
    } else if (searchType === 'nickName') {
      queryString = `WHERE nickName LIKE CONCAT('%',?,'%')`;
      queryArray.push(keyword);
    } else if (searchType === 'email') {
      queryString = `WHERE email LIKE CONCAT('%',?,'%')`;
      queryArray.push(keyword);
    } else if (searchType === 'phone') {
      queryString = `WHERE phone LIKE CONCAT('%',?,'%')`;
      queryArray.push(keyword);
    }
    const pnQuery = `SELECT count(*) AS count
    FROM user
    ${queryString}`;
    const [pnResult, ] = await this.conn.query(pnQuery, queryArray);
    const pn = pagination(pnResult, this.req.query, 'page', listCount);
    const query = `SELECT *
    FROM user
    ${queryString}
    ORDER BY id DESC
    ${pn.queryLimit}`;
    const [users, ] = await this.conn.query(query);
    return {
      users,
      pn,
    };
  }
  async getUsers () {
    const [users, ] = await this.conn.query(`SELECT * FROM user`);
    return users;
  }
  async getTotalCount () {
    const [userCountResult, ] = await this.conn.query(`SELECT count(*) AS count FROM user`);
    const userCount = userCountResult[0].count;
    return userCount;
  }
  async get (userId) {
    const query = `SELECT u.*, p.permission AS permission, p.title AS permissionName, p.isAdmin
    FROM user AS u
    LEFT JOIN permission AS p
    ON u.permission = p.permission
    WHERE u.id=?`;
    const [users, ] = await this.conn.query(query, [userId]);
    if (users.length) {
      const user = users[0];
      return user;
    } else {
      return null;
    }
  }
  async getByUidOrEmail (keyword) {
    const query = `SELECT * FROM user WHERE uId=? OR email=?`;
    const [users, ] = await this.conn.query(query, [keyword, keyword]);
    if (users.length) {
      const user = users[0];
      return user;
    } else {
      return null;
    }
  }
  async getByEmail (email) {
    const query = `SELECT * FROM user WHERE email=?`;
    const [users, ] = await this.conn.query(query, [email]);
    if (users.length) {
      const user = users[0];
      return user;
    } else {
      return null;
    }
  }
  async getAdminUser () {
    const query = `SELECT u.*
    FROM user AS u
    LEFT JOIN permission AS p
    ON u.permission = p.permission
    WHERE p.isAdmin = 1`;
    const [users, ] = await this.conn.query(query);
    return users;
  }
  async getPointRanks (options) {
    options = Object.assign({
      date: null,
    }, options);
    const { date } = options;
    let queryString = '';
    if (date === 'today') {
      queryString += `WHERE p.createdAt >= date_format(date_add(NOW(), INTERVAL -1 DAY), '%Y-%m-%d')\n`;
    } else if (date === 'week') {
      queryString += `WHERE p.createdAt >= date_format(date_add(NOW(), INTERVAL -7 DAY), '%Y-%m-%d')\n`;
    } else if (date === 'month') {
      queryString += `WHERE p.createdAt >= date_format(date_add(NOW(), INTERVAL -30 DAY), '%Y-%m-%d')\n`;
    } else if (date === 'total' || date === undefined) {
      // queryString += `\n`;
    }
    const query = `SELECT u.uId, u.nickName, u.permission, u.image, sum(p.point) AS point
    FROM point AS p
    LEFT JOIN user AS u
    ON p.point_user_ID = u.id
    ${queryString}
    GROUP BY point_user_ID
    ORDER BY point DESC`;
    let number = 1;
    const [ranks, ] = await this.conn.query(query);
    ranks.forEach(rank => {
      rank.number = number ++;
      // 회원 등급 이미지
      const permissionImage = this.res.locals.permissions.find(permission => permission.permission === rank.permission && permission.image);
      if (permissionImage) {
        rank.permissionImage = `${this.res.locals.storage}/permission/${permissionImage.image}`;
      } else if (rank.permission) {
        rank.permissionImage = `/assets/permission/${rank.permission}.svg`;
      } else {
        rank.permissionImage = `/assets/permission/0.svg`;
      }
    });
    return ranks;
  }
  async create (data) {
    data = Object.assign({
      uId: null,
      password: null,
      nickName: null,
      email: null,
      permission: 1,
      workingUser: 0,
      emailAuthentication: 0,
      phone: null,
      realName: null,
    }, data);
    const { uId, password, nickName, email, permission, workingUser, emailAuthentication, phone, realName } = data;
    const [uIdResult, ] = await this.conn.query(`SELECT * FROM user WHERE uId=?`, uId);
    if (!uIdResult.length) {
      const [nickNameResult, ] = await this.conn.query(`SELECT * FROM user WHERE nickName=?`, nickName);
      if (!nickNameResult.length) {
        const salt = bcrypt.genSaltSync(SALT_COUNT);
        const hash = bcrypt.hashSync(password, salt);
        const query = `INSERT INTO user (uId, password, nickName, email, permission, workingUser, emailAuthentication, phone, realName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result, ] = await this.conn.query(query, [uId, hash, nickName, email, permission, workingUser, emailAuthentication, phone, realName]);
        if (result.insertId) {
          const user = await this.get(result.insertId);
          return user;
        } else {
          throw new Error('회원 등록에 실패하였습니다');
        }
      } else {
        throw new Error('닉네임 중복입니다');
      }
    } else {
      throw new Error('아이디 중복입니다');
    }
  }
  async checkout (user) {
    const { phone, inviteId } = this.req.body;

    // 이메일 인증
    const hash = hashCreate(8);
    const [oldHash, ] = await this.conn.query(`SELECT * FROM authentication WHERE authentication_user_ID = ? AND type = ?`, [user.id, 'email']);
    if (oldHash.length) await this.conn.query(`DELETE FROM authentication WHERE authentication_user_ID = ? AND type = ?`, [user.id, 'email']);
    await this.conn.query(`INSERT INTO authentication (authentication_user_ID, type, hash) VALUES (?, ?, ?)`, [user.id, 'email', hash]);
    
    if (this.res.locals.setting.gmailOauthClientId && this.res.locals.setting.gmailOauthClientSecret && this.res.locals.setting.gmailOauthRefreshToken) {
      const emailClass = new Email(this.req, this.res, this.conn);
      emailClass.create(user.email, {
        subject: `이메일 인증 - ${this.res.locals.setting.siteName}`,
        content: `
        <h1>이메일 인증 - ${this.res.locals.setting.siteName}</h1>
        <hr>
        <p>${user.nickName} 님의 이메일 인증번호</p><p style="font-weight: bold;">${hash}</p>`,
      });
    }

    // SMS 인증
    if (phone && this.res.locals.setting.useSmsAuthentication) {
      const authNumber = Math.random().toString().slice(3, 7);
      const query = `INSERT INTO authentication
      (authentication_user_ID, type, hash)
      VALUES (?, ?, ?)`;
      await this.conn.query(query, [user.id, 'sms', authNumber]);
      sendMessage(user.phone, `[${this.res.locals.setting.siteNameRaw}] 인증번호는 ${authNumber} 입니다`);
    }

    // 초대 포인트 지급
    if (inviteId) {
      const [inviteUsers, ] = await this.conn.query(`SELECT * FROM user WHERE uId=? OR nickName=?`, [inviteId, inviteId]);
      if (inviteUsers.length) {
        const inviteUser = inviteUsers[0];
        const invitePoint = this.setting.invitePoint;
        if (invitePoint !== 0) {
          await this.conn.query(`UPDATE user SET point=point+? WHERE id=?`, [invitePoint, inviteUser.id]);
          await this.conn.query(`INSERT INTO point (point_user_ID, type, point) VALUES (?, ?, ?)`, [inviteUser.id, 'invite', invitePoint]);
        }
      }
    }
  }
  async update (userId, data) {
    const user = await this.get(userId);
    data = Object.assign({
      uId: user.uId,
      password: null,
      nickName: user.nickName,
      email: user.email,
      phone: user.phone,
      realName: user.realName,
      permission: user.permission,
      workingUser: user.workingUser,
    }, data);
    const { uId, password, nickName, email, phone, realName, permission, workingUser } = data;
    if (password) {
      const salt = bcrypt.genSaltSync(SALT_COUNT);
      const hash = bcrypt.hashSync(password, salt);
      const query = `UPDATE user SET uId=?, password=?, nickName=?, email=?, phone=?, realName=?, permission=?, workingUser=? WHERE id=?`;
      try {
        await this.conn.query(query, [uId, hash, nickName, email, phone, realName, permission, workingUser, userId]);
      } catch (e) {
        flash.create({
          status: false,
          message: e.message,
        });
      }
    } else {
      const query = `UPDATE user SET uId=?, nickName=?, email=?, phone=?, realName=?, permission=?, workingUser=? WHERE id=?`;
      try {
        await this.conn.query(query, [uId, nickName, email, phone, realName, permission, workingUser, userId]);
      } catch (e) {
        flash.create({
          status: false,
          message: e.message,
        });
      }
    }
  }
  async remove (userId) {
    await this.conn.query(`DELETE FROM user WHERE id=?`, [userId]);
  }
  async passwordCheck (user, password) {
    const result = bcrypt.compareSync(password, user.password);
    return result;
  }
}

module.exports = User;