const { timezone } = require('../config');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault(timezone);
const bcrypt = require('bcrypt');
const Class = require('./class');
const Board = require('./board');
const User = require('./user');
const Point = require('./point');
const Image = require('./image');
const Tag = require('./tag');
const Alarm = require('./alarm');
const config = require('../middleware/config');
const match = require('../middleware/match');
const datetime = require('../middleware/datetime');
const pagination = require('../middleware/pagination');
const engine = require('../middleware/engine');
const fileUpload = require('../middleware/fileUpload');

const SALT_COUNT = 10;

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

class Article extends Class {
  async get (articleId, options) {
    options = Object.assign({
      status: null,
      images: false,
      tags: false,
      userLike: false,
      boardPrevNextArticle: false,
      setInfo: false,
    }, options);
    const { status, images, tags, userLike, setInfo } = options;
    let queryString = '';
    if (status) {
      queryString = `AND a.status=${status}`;
    }
    const query = `SELECT a.*, a.nickName AS nonMember, b.title AS board, b.slug AS boardSlug, c.title AS category, u.uId, u.nickName AS nickName, u.image AS userImage, u.permission AS permission, p.title AS permissionName, p.isAdmin AS authorIsAdmin, b.useAnonymous, b.useSecret
    FROM article AS a
    LEFT JOIN board AS b
    ON a.article_board_ID = b.id
    LEFT JOIN category AS c
    ON a.article_category_ID = c.id
    LEFT JOIN user AS u
    ON a.article_user_ID = u.id
    LEFT JOIN permission AS p
    ON u.permission = p.permission
    WHERE a.id=?
    ${queryString}`;
    const [articles, ] = await this.conn.query(query, [articleId]);
    if (articles.length) {
      let article = articles[0];
      
      if (images) {
        const imageClass = new Image(this.req, this.res, this.conn);
        article.images = await imageClass.getImages(articleId);
      }
      if (tags) {
        const tagClass = new Tag(this.req, this.res, this.conn);
        article.tags = await tagClass.getTags(articleId);
      }

      if (userLike) {
        if (this.user) {
          const [userLikeResult, ] = await this.conn.query(`SELECT * FROM userArticleLike WHERE userArticleLike_user_ID=? AND userArticleLike_article_ID=?`, [this.user.id, article.id]);
          const userLike = userLikeResult.length ? 1 : 0;
          article.userLike = userLike;
        } else {
          article.userLike = 0;
        }
      }

      if (setInfo) article = this.setInfo(article);

      return article;
    } else {
      return null;
    }
  }
  async getArticles (data) {
    data = Object.assign({
      type: null,
      board: null,
      notice: null,
      images: true,
      datetimeType: null,
    }, data);
    const { type, board, notice, images, datetimeType } = data;
    const { searchType, keyword, category } = this.req.query;
    const queryArray = [];
    const listCount = board?.listCount || 10;
    let queryString = 'WHERE a.status=2\n';
    if (notice) {
      queryString += `AND a.notice = 1\n`;
    } else {
      queryString += `AND a.notice = 0\n`;
    }
    let orderQueryString = `ORDER BY a.createdAt DESC`;
    if (board) {
      queryString += `AND b.slug = ?\n`;
      queryArray.push(board.slug);
    }
    if (category) {
      queryString += `AND c.id = ?\n`;
      queryArray.push(category);
    }
    if (searchType === 'title') {
      queryString += `AND a.title LIKE CONCAT('%',?,'%')\n`;
      queryArray.push(keyword);
    } else if (searchType === 'titleAndContent') {
      queryString += `AND a.title LIKE CONCAT('%',?,'%')\n`;
      queryString += `OR a.content LIKE CONCAT('%',?,'%')\n`;
      queryArray.push(keyword);
    } else if (searchType === 'nickName') {
      queryString += `AND u.nickName LIKE CONCAT('%',?,'%')\n`;
      queryArray.push(keyword);
    }
    if (type === 'best') queryString += `AND (a.likeCount >= 5 OR a.viewCount >= 100)\n`;
    if (type === 'bestDay') {
      queryString += `AND a.createdAt >= date_format(date_add(NOW(), INTERVAL -1 DAY), '%Y-%m-%d')\n`;
      orderQueryString = `ORDER BY (a.viewCount * 0.3) + (a.likeCount * 0.7) DESC`;
    } else if (type === 'bestWeek') {
      queryString += `AND a.createdAt >= date_format(date_add(NOW(), INTERVAL -7 DAY), '%Y-%m-%d')\n`;
      orderQueryString = `ORDER BY (a.viewCount * 0.3) + (a.likeCount * 0.7) DESC`;
    } else if (type === 'bestMonth') {
      queryString += `AND a.createdAt >= date_format(date_add(NOW(), INTERVAL -30 DAY), '%Y-%m-%d')\n`;
      orderQueryString = `ORDER BY (a.viewCount * 0.3) + (a.likeCount * 0.7) DESC`;
    }
    const pnQuery = `SELECT count(*) AS count
    FROM article AS a
    LEFT JOIN board AS b
    ON a.article_board_ID = b.id
    LEFT JOIN category AS c
    ON a.article_category_ID = c.id
    LEFT JOIN user AS u
    ON a.article_user_ID = u.id
    ${queryString}`;
    const [pnResult, ] = await this.conn.query(pnQuery, queryArray);
    const pn = pagination(pnResult, this.req.query, 'page', listCount);
    const query = `SELECT a.*, a.nickName AS nonMember, b.title AS board, b.slug AS boardSlug, c.title AS category, u.uId, u.nickName AS nickName, u.image AS userImage, u.permission AS permission, p.title AS permissionName, p.isAdmin AS authorIsAdmin, b.useAnonymous, b.useSecret
    FROM article AS a
    LEFT JOIN board AS b
    ON a.article_board_ID = b.id
    LEFT JOIN category AS c
    ON a.article_category_ID = c.id
    LEFT JOIN user AS u
    ON a.article_user_ID = u.id
    LEFT JOIN permission AS p
    ON u.permission = p.permission
    ${queryString}
    ${orderQueryString}
    ${pn.queryLimit}`;
    const [articles, ] = await this.conn.query(query, queryArray);
    const imageClass = new Image(this.req, this.res, this.conn);
    const options = {
      datetimeType,
    };
    for await (let article of articles) {
      if (images) article.images = await imageClass.getImages(article.id);
      article = this.setInfo(article, options);
    }
    return {
      articles,
      pn,
    }
  }
  async getPrevAfterArticle (articleId, boardId) {
    const boardPrevNextArticles = [];
    let prevArticle = null;
    let afterArticle = null;
    const prevQuery = `SELECT a.*, a.nickName AS nonMember, b.title AS board, b.slug AS boardSlug, c.title AS category, u.nickName AS nickName, u.image AS userImage, u.permission AS permission, p.title AS permissionName, p.isAdmin AS authorIsAdmin, b.useAnonymous, b.useSecret
    FROM article AS a
    LEFT JOIN board AS b
    ON a.article_board_ID = b.id
    LEFT JOIN category AS c
    ON a.article_category_ID = c.id
    LEFT JOIN user AS u
    ON a.article_user_ID = u.id
    LEFT JOIN permission AS p
    ON u.permission = p.permission
    WHERE a.id > ? AND a.article_board_ID=? AND a.status=2
    ORDER BY a.id ASC
    LIMIT 1`;
    const [prevArticleResult, ] = await this.conn.query(prevQuery, [articleId, boardId]);
    const afterQuery = `SELECT a.*, a.nickName AS nonMember, b.title AS board, b.slug AS boardSlug, c.title AS category, u.nickName AS nickName, u.image AS userImage, u.permission AS permission, p.title AS permissionName, p.isAdmin AS authorIsAdmin, b.useAnonymous, b.useSecret
    FROM article AS a
    LEFT JOIN board AS b
    ON a.article_board_ID = b.id
    LEFT JOIN category AS c
    ON a.article_category_ID = c.id
    LEFT JOIN user AS u
    ON a.article_user_ID = u.id
    LEFT JOIN permission AS p
    ON u.permission = p.permission
    WHERE a.id < ? AND a.article_board_ID=? AND a.status=2
    ORDER BY a.id DESC
    LIMIT 1`;
    const [afterArticleResult, ] = await this.conn.query(afterQuery, [articleId, boardId]);
    const imageClass = new Image(this.req, this.res, this.conn);
    if (prevArticleResult.length) {
      prevArticle = prevArticleResult[0];
      prevArticle = await this.setInfo(prevArticle);
      prevArticle.images = await imageClass.getImages(prevArticle.id);
      boardPrevNextArticles.push(prevArticle);
    }
    if (afterArticleResult.length) {
      afterArticle = afterArticleResult[0];
      afterArticle = await this.setInfo(afterArticle);
      afterArticle.images = await imageClass.getImages(afterArticle.id);
      boardPrevNextArticles.push(afterArticle);
    }
    return boardPrevNextArticles;
  }
  async createTemp (data) {
    data = Object.assign({
      board: null,
      user: null,
      title: '',
      content: '',
      status: 1,
    }, data);
    const { board, user, title, content, status } = data;
    const [articleResult, ] = await this.conn.query(`INSERT INTO article (article_board_ID, article_user_ID, title, content, status) VALUES (?, ?, ?, ?, ?)`, [board?.id, user?.id, title, content, status]);
    const articleId = articleResult.insertId;
    return articleId;
  }
  async create (articleId, data) {
    const createData = Object.assign({
      board: null,
    }, data);
    const { board } = createData;
    const result = await this.update(articleId, data);
    // ??????
    const userClass = new User(this.req, this.res, this.conn);
    const alarmClass = new Alarm(this.req, this.res, this.conn);
    if (board.useUserAlarm) {
      const targetUsers = await userClass.getUsers();
      for await (let targetUser of targetUsers) {
        const alarmData = {
          type: 'newArticle',
          userId: targetUser.id,
          relatedUserId: this.user.id,
          boardId: board.id,
        };
        await alarmClass.create(alarmData);
      }
    }
    if (board.useAdminAlarm) {
      const adminUsers = await userClass.getAdminUser();
      for await (let adminUser of adminUsers) {
        const alarmData = {
          type: 'newArticle',
          userId: adminUser.id,
          relatedUserId: this.user.id,
          boardId: board.id,
        };
        await alarmClass.create(alarmData);
      }
    }
    // ?????????
    const pointClass = new Point(this.req, this.res, this.conn);
    const pointData = {
      user: this.user,
      type: 'createArticle',
      point: board.writePoint,
    };
    await pointClass.create(pointData);
    return result;
  }
  async update (articleId, data) {
    const article = await this.get(articleId);
    data = Object.assign({
      userId: article.article_user_ID,
      boardId: article.article_board_ID,
      categoryId: article.article_category_ID,
      title: article.title,
      content: article.content,
      html: article.html,
      tags: null,
      notice: article.notice,
      viewCount: article.viewCount,
      nickName: article.nickName,
      password: article.password,
      status: article.status,
      updatedAt: article.updatedAt,
      createdAt: article.createdAt,
      customField01: article.customField01,
      customField02: article.customField02,
      customField03: article.customField03,
      customField04: article.customField04,
      customField05: article.customField05,
      customField06: article.customField06,
      customField07: article.customField07,
      customField08: article.customField08,
      customField09: article.customField09,
      customField10: article.customField10,
      links: article.links,
      files: null,
    }, data);
    const { userId, boardId, categoryId, title, html, tags, notice, viewCount, links, nickName, password, status, updatedAt, createdAt, customField01, customField02, customField03, customField04, customField05, customField06, customField07, customField08, customField09, customField10 } = data;
    let { content, files } = data;
    files = await this.fileCheck(article, files);
    
    if (this.res.locals.setting.editor === 'ckeditor') {
      content = content.replace(/((<p>&nbsp;<\/p>)*$)/, ''); // ?????? ?????? ??????
      // ????????? ?????????
      const imageClass = new Image(this.req, this.res, this.conn);
      const oldKeys = await imageClass.getImages(articleId);
      // const images = Array.from(content.matchAll(match.contentImage)).map(match => match[1]);
      const imageRaws = Array.from(content.matchAll(match.contentImage));
      const images = [];
      imageRaws.forEach(imageRaw => {
        images.push({
          key: imageRaw[1],
          tag: imageRaw[0],
        });
      });
      // ????????? ?????? ??????
      images.forEach(image => {
        content = content.replaceAll(image.tag, `[[image:${image.key}]]`);
      });
      // ????????? ??????
      for await (let oldkey of oldKeys) {
        const result = images.find(image => image.key === oldkey.key);
        if (!result) {
          const params = {
            Bucket: bucket,
            Key: `article/${oldkey.image}`,
          };
          s3.deleteObject(params, (err, data) => {
            if (err) {
              console.error(err);
            }
          });
          const thumbParams = {
            Bucket: bucket,
            Key: `thumb/${oldkey.image}`,
          };
          s3.deleteObject(thumbParams, (err, data) => {
            if (err) {
              console.error(err);
            }
          });
          await this.conn.query(`DELETE FROM image WHERE id=?`, [oldkey.id]);
        }
      }
      // ????????? ??????
      for await (let image of images) {
        const result = oldKeys.find(k => k.image === image.key);
        if (!result) {
          try {
            await this.conn.query(`INSERT INTO image (image_article_ID, \`key\`) VALUES (?, ?)`, [articleId, image.key]);
          } catch (e) {}
        }
      }
    }

    const tagClass = new Tag(this.req, this.res, this.conn);
    await tagClass.set(article.id, tags);

    // ?????????
    let hash = article.password;
    if (nickName && password && article.status === 1) {
      const salt = bcrypt.genSaltSync(SALT_COUNT);
      hash = bcrypt.hashSync(password, salt);
    } else if (password && article.status === 2) {
      const passwordCheck = bcrypt.compareSync(password, article.password);
      if (!passwordCheck) {
        throw new Error('??????????????? ????????????');
      }
    }
    
    const [result, ] = await this.conn.query(`UPDATE article SET article_user_ID=?, article_board_ID=?, article_category_ID=?, title=?, content=?, html=?, notice=?, viewCount=?, links=?, files=?, nickName=?, password=?, status=?, updatedAt=?, createdAt=?, customField01=?, customField02=?, customField03=?, customField04=?, customField05=?, customField06=?, customField07=?, customField08=?, customField09=?, customField10=? WHERE id=?`, [userId, boardId, categoryId, title, content, html, notice, viewCount, links, files, nickName, hash, status, updatedAt, createdAt, customField01, customField02, customField03, customField04, customField05, customField06, customField07, customField08, customField09, customField10, articleId]);
    if (result.affectedRows) {
      await this.conn.query(`UPDATE board SET updatedAt=NOW() WHERE id=?`, [boardId]);
      return true;
    } else {
      return false;
    }
  }
  async remove (articleId, data) {
    const article = await this.get(articleId);
    data = Object.assign({
      password: null,
    }, data);
    const { password } = data;

    // ?????????
    if (password) {
      const passwordCheck = bcrypt.compareSync(password, article.password);
      if (!passwordCheck) {
        throw new Error('??????????????? ????????????');
      }
    }
    
    if (article.article_user_ID === this.user?.id || this.user?.isAdmin || !article.article_user_ID) {
      const boardClass = new Board(this.req, this.res, this.conn);
      const board = await boardClass.getById(article.article_board_ID);
      const userClass = new User(this.req, this.res, this.conn);
      const articleAuthor = await userClass.get(article.article_user_ID);
      const pointClass = new Point(this.req, this.res, this.conn);
      // this.conn.beginTransaction();
      await this.conn.query(`UPDATE article SET status=0 WHERE id=?`, [articleId]);
      const pointData = {
        user: articleAuthor,
        type: 'removeArticle',
        point: board.writePoint,
      }
      await pointClass.remove(pointData);
      // this.conn.commit();
    } else {
      throw new Error('????????? ????????????');
    }
  }
  async fileCheck (article, files) {
    const originFiles = article.files;
    let keys = '';
    if (originFiles) {
      if (files) {
        originFiles.forEach(file => {
          removeFile(file, 'files');
        });
        for await (let file of files) {
          const key = await fileUpload(file, 'files');
          keys += `${key},`;
        }
      } else {
        originFiles.forEach(file => {
          keys += `${file},`;
        });
      }
    } else {
      if (files) {
        for await (let file of files) {
          const key = await fileUpload(file, 'files');
          keys += `${key},`;
        }
      }
    }
    return keys;
  }
  setInfo (article, options) {
    options = Object.assign({
      datetimeType: null,
    }, options);
    const { datetimeType } = options;
    if (datetimeType === 'dateTime') {
      article.datetime = datetime(article.createdAt, 'dateTime');
    } else {
      article.datetime = datetime(article.createdAt);
    }

    if (this.user && article.article_user_ID === this.user.id) article.isAuthor = true;

    // ????????? ??????
    if (Number(article.permissionName)) {
      article.permissionName = `LV ${Number(article.permissionName)}`;
    }

    const permissionImage = this.res.locals.permissions.find(p => p.permission === article.permission);
    if (permissionImage?.image) {
      article.permissionImage = `${this.res.locals.storage}/permission/${permissionImage.image}`;
    } else {
      article.permissionImage = `/assets/permission/${article.permission}.svg`;
    }

    // ??????
    if (article.useAnonymous && (article.article_user_ID !== this.user?.id && !this.user?.isAdmin) && !article.authorIsAdmin) {
      article.nickName = '??????';
      article.permissionName = null;
    }

    // ?????????
    const youtubeRegex = new RegExp(/<oembed url="http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)[&(amp;)[\w=.]*]?"><\/oembed>/);
    if (article.content.match(youtubeRegex)) {
      const youtubeId = article.content.match(youtubeRegex)[1];
      article.youtube = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }

    // ?????????
    if (article.images?.length) {
      article.image = `${this.res.locals.storage}/thumb/${article.images[0].key}`;
      article.ogImage = `${this.res.locals.storage}/thumb/${article.images[0].key}`;
    } else if (article.youtube) {
      article.image = article.youtube;
      article.ogImage = article.youtube;
    } else {
      article.ogImage = `${this.res.locals.storage}/assets/${this.res.locals.setting.faviconImage}`;
    }

    // ?????????
    if (article.useSecret && article.article_user_ID !== this.user?.id && !article.authorIsAdmin && !this.user?.isAdmin) {
      article.title = '????????? ?????????';
      article.images = [];
    }

    // OG
    article.ogContent = article.content
      .replace(/\[\[[^\]]*\]\]/ig, '')
      .replace(/<[^>]*>/ig, '')
      .replace(/&nbsp;/ig, '')
      .slice(0, 150);
    article.url = `${this.res.locals.setting.siteDomain}/${article.boardSlug}/${article.id}`;

    // ?????????
    if (!article.article_user_ID) {
      article.nickName = article.nonMember;
      article.permissionName = '?????????';
    }

    // Engine
    if (this.res.locals.setting.editor === 'engine') {
      article.content = engine(article.content);
    } else if (this.res.locals.setting.editor === 'ckeditor') {
      article.content = this.imageDecode(article.content);
    }
    // console.log(article.content);
    
    // Editor
    if (this.res.locals.setting.editor === 'ckeditor') {
      // Youtube
      article.content = article.content.replaceAll(match.youtube, `<div class="youtube"><iframe src="https://www.youtube.com/embed/$1" allow="fullscreen"></iframe></div>`);
      // Vimeo
      article.content = article.content.replaceAll(match.vimeo, `<div class="vimeo"><iframe src="https://player.vimeo.com/video/$1" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" frameborder="0"></iframe></div>`);
      article.content = article.content.replaceAll(match.vimeo, `<div class="vimeo"><iframe src="https://player.vimeo.com/video/$1" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" frameborder="0"></iframe></div>`);
      article.content = article.content.replaceAll(match.oembed, '<a href="$1" target="_blank">$1</a>');
    }
    
    // Links
    if (article.links) {
      article.links = article.links.split(',').map(file => file.trim()).filter(file => file.length);
    }

    // Files
    if (article.files) {
      article.files = article.files.split(',').map(file => file.trim()).filter(file => file.length);
    }

    return article;
  }
  imageEncode (image) {

  }
  imageDecode (content) {
    content = content.replaceAll(match.contentReplaceImage, `<figure class="image"><img src="${storage}/article/$1"></figure>`);
    return content;
  }
}

const removeFile = (key, folder) => {
  const params = {
    Bucket: bucket,
    Key: `${folder}/${key}`,
  };
  s3.deleteObject(params, (err, data) => {
    if (err) {
      console.error(err);
    }
  });
};

module.exports = Article;