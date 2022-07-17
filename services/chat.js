const Class = require('./class');
const status = require('./status');
const config = require('../middleware/config');
const s3 = config.getS3();
const pool = require('../middleware/database');

class Chat extends Class {
  async getChats () {
    const query = `SELECT c.*, u.id AS uId, u.nickName, u.permission, u.image AS userImage
    FROM chat AS c
    LEFT JOIN user AS u
    ON c.chat_user_ID = u.id
    ORDER BY c.id DESC
    LIMIT 20`;
    const [chatRaws, ] = await this.conn.query(query);
    const chats = [];
    chatRaws.reverse().forEach(chat => {
      chats.push(this.setInfo(chat));
    });
    return chats;
  }
  async get (chatId) {
    const query = `SELECT c.*, u.id AS uId, u.nickName, u.permission, u.image AS userImage
    FROM chat AS c
    LEFT JOIN user AS u
    ON c.chat_user_ID = u.id
    WHERE c.id=?`;
    const [chats, ] = await this.conn.query(query, [chatId]);
    if (chats.length) {
      const chat = chats[0];
      return chat;
    } else {
      return null;
    }
  }
  async set () {
    status.chats = await this.getChats();
  }
  async create (data) {
    const conn = await pool.getConnection();
    try {
      this.conn = conn;
      const { user, message } = data;
      const query = `INSERT INTO chat
      (chat_user_ID, message)
      VALUES (?, ?)`;
      const [result, ] = await conn.query(query, [user.id, message]);
      const chat = await this.get(result.insertId);
      status.chats.push(this.setInfo(chat));
      return chat;
    } finally {
      conn.release();
    }
  }
  setInfo (chat) {
    const permission = status.permissions.find(permission => permission.permission === chat.permission);
    if (permission.image) {
      chat.permissionImage = `${s3.host}/permission/${permission.image}`;
    } else {
      chat.permissionImage = `/assets/permission/${chat.permission}.svg`;
    }
    if (chat.userImage) {
      chat.userImage = `${s3.host}/userImage/${chat.userImage}`;
    } else {
      chat.userImage = `/assets/userImage.svg`;
    }
    return {
      user: {
        id: chat.chat_user_ID,
        nickName: chat.nickName,
        permission: chat.permission,
        permissionImage: chat.permissionImage,
        userImage: chat.userImage,
      },
      message: chat.message,
    }
  }
}

module.exports = Chat;