const { timezone } = require('./config');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault(timezone);
const http = require('http');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const timeout = require('connect-timeout');
const { sessionSecret } = require('./config');
const MySQLStore = require('express-mysql-session')(session);
const pool = require('./middleware/database');
const logger = require('morgan');
const i18n = require('i18n');
const doAsync = require('./middleware/doAsync');
const shuffle = require('./middleware/shuffle');
const counter = require('./services/counter');
const config = require('./middleware/config');
const User = require('./services/user');
const UserGroup = require('./services/userGroup');
const IndexBoard = require('./services/indexBoard');
const Menu = require('./services/menu');
const Alarm = require('./services/alarm');
const Message = require('./services/message');
const Setting = require('./services/setting');
const Banner = require('./services/banner');
const Board = require('./services/board');
const Asset = require('./services/asset');
const Permission = require('./services/permission');
const Plugin = require('./services/plugin');
const Chat = require('./services/chat');
const status = require('./services/status');
// Custom
const Binance = require('node-binance-api');
const Chart = require('./services/chart');
const Game = require('./services/game');

const sql = config.getDatabase();
const storage = config.getStorage();
const lang = config.getLang();

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const gameRouter = require('./routes/game');
const apiRouter = require('./routes/api');
const boardRouter = require('./routes/board');

const app = express();

const port = process.env.PORT || 3000;

const binance = new Binance().options({
  APIKEY: '4p6LicesTAH85y5vdKaQXsIJXsghKCyfVOV9CugwUouMnCCRAPjH8ejAvIrHoxGu',
  APISECRET: '9U2czWMvW4wvPPfWV4KgWkmoFEDezZVscCfSB8RG5XRqWtPtDuCnDuxkCa8GGDvS',
});

let beforeMinute = null;
const oneMinuteChartClass = new Chart();
const threeMinuteChartClass = new Chart();
const fiveMinuteChartClass = new Chart();
const gameClass = new Game();
const checkChart = async () => {
  const dataRaw = await binance.futuresCandles('BTCUSDT', '1m');
  if (dataRaw) {
    const data = dataRaw[dataRaw.length -2];
    oneMinuteChartClass.setData(1, data, dataRaw);
    threeMinuteChartClass.setData(3, data, dataRaw);
    fiveMinuteChartClass.setData(5, data, dataRaw);
    const minute = Number(moment(data[0]).format('mm'));
    if (beforeMinute !== minute) {
      await gameClass.makeGameResult(data);
      beforeMinute = minute;
    } else if (beforeMinute === null) {
      await gameClass.makeGameResult(data);
    }
  }
};

(async () => {
  setInterval(checkChart, 2000);
})();

// Chat
app.io = require('socket.io')();
const server = http.createServer(app);
app.io.attach(server);

app.io.on('connection', (socket) => {
  app.io.sockets.emit('userCount', app.io.engine.clientsCount);

  socket.on('disconnect', () => {
    // console.log('접속 해제');
    app.io.sockets.emit('userCount', app.io.engine.clientsCount);
  });

  socket.on('chart', async (gameType) => {
    if (gameType === 1) {
      socket.join(1, () => {
        app.io.to(1).emit(1, 1);
      });
    } else if (gameType === 3) {
      socket.join(3, () => {
        app.io.to(3).emit(3, 3);
      });
    } else if (gameType === 5) {
      socket.join(5, () => {
        app.io.to(5).emit(5, 5);
      });
    }
  });

  socket.on('sendMessage', async (data) => {
    if (data.user?.id) {
      app.io.sockets.emit('updateMessage', data);
      const chatClass = new Chat(null, null, null);
      await chatClass.create(data);
    }
  });

  // Room Chat
  socket.on('leaveRoom', (room, user) => {
    socket.leave(room, () => {
      app.io.to(room).emit('leaveRoom', room);
    });
  });

  socket.on('joinRoom', (room, user) => {
    socket.join(room, () => {
      app.io.to(room).emit('joinRoom', room);
    });
  });
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const options = {
  host: sql.host,
  port: sql.port,
  user: sql.user,
  password: sql.password,
  database: sql.database,
};

const sessionStore = new MySQLStore(options);

if (process.env.NODE_ENV === 'development') {
  // app.use(logger('dev'));
} else {
  app.use(logger('dev'));
}

app.use(express.json());
app.use(timeout('60s'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  key: sessionSecret,
  secret: sessionSecret,
  store: sessionStore,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 365,
  },
}));

i18n.configure({
  locales: [`${lang}`],
  cookie: 'lang',
  defaultLocale: `${lang}`,
  directory: path.join(__dirname + '/locales'),
});
app.use(i18n.init);

// Setting
(async () => {
  const conn = await pool.getConnection();
  try {
    const menuClass = new Menu(null, null, conn);
    const boardClass = new Board(null, null, conn);
    const userGroupClass = new UserGroup(null, null, conn);
    const bannerClass = new Banner(null, null, conn);
    const permissionClass = new Permission(null, null, conn);
    const assetClass = new Asset(null, null, conn);
    const pluginClass = new Plugin(null, null, conn);
    const settingClass = new Setting(null, null, conn);
    const chatClass = new Chat(null, null, conn);
    // const indexBoard = new IndexBoard(null, null, conn);

    await menuClass.set();
    await boardClass.set();
    await userGroupClass.set();
    await bannerClass.set();
    await permissionClass.set();
    await assetClass.set();
    await settingClass.set();
    await pluginClass.set();
    await chatClass.set();
    // status.sideBoards = await indexBoard.get('side');
  } finally {
    conn.release();
  }
})();

// Loop
// const loop = require('./middleware/loop');
const getCounter = async () => {
  status.count = await counter.getCount();
};
getCounter();
setInterval(getCounter, 1000 * 60 * 5);

app.use('*', doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    if (req.session.user) {
      const userClass = new User(req, res, conn);
      const user = await userClass.get(req.session.user.id);
      if (user) res.locals.user = user;
    }

    res.locals.storage = storage;
    
    res.locals.menus = status.menus;
    res.locals.banners = status.banners;
    res.locals.permissions = status.permissions;
    res.locals.setting = status.setting;
    res.locals.boards = status.boards;
    res.locals.userGroups = status.userGroups;
    res.locals.assets = status.assets;
    res.locals.plugins = status.plugins;
    res.locals.sideBoards = status.sideBoards;
    res.locals.shuffle = shuffle;
    res.locals.count = status.count;
    const indexBoard = new IndexBoard(req, res, conn);
    status.sideBoards = await indexBoard.get('side');
    res.locals.sideBoards = status.sideBoards;

    status.setting.footerGuide = status.setting.footerGuide?.replaceAll('\r\n', '<br>');

    next();
  } finally {
    conn.release();
  }
}));

app.use('*', doAsync(async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    // 회원
    const user = res.locals.user;
    if (user) {
      const alarm = new Alarm(req, res, conn);
      const message = new Message(req, res, conn);
      const permissionClass = new Permission(req, res, conn);
      res.locals.alarms = await alarm.getAlarms(user);
      res.locals.messages = await message.getMessages(user);

      // 회원 등급 이미지
      const permissionImage = res.locals.permissions.find(permission => permission.permission === user.permission && permission.image);
      if (permissionImage) {
        user.permissionImage = `${res.locals.storage}/permission/${permissionImage.image}`;
      } else if (user.permission) {
        user.permissionImage = `/assets/permission/${user.permission}.svg`;
      } else {
        user.permissionImage = `/assets/permission/0.svg`;
      }

      // 자동 등업 체크
      if (res.locals.setting.useAutoPermission) {
        await permissionClass.check();
      }
    }
    next();
  } finally {
    conn.release();
  }
}));

// Plugin
// require('./middleware/plugin')(app);

// Flash Message
require('./middleware/flash').init(app);

const { isAdmin } = require('./middleware/permission');

app.use('/', indexRouter);
app.use('/', userRouter);
app.use('/admin', isAdmin, adminRouter);
app.use('/game', gameRouter);
app.use('/api', apiRouter);
app.use('/', boardRouter);

// Error Handling
// 500 Error
app.use('*', (err, req, res, next) => {
  console.error(err);
  if (err.name === 'TypeError' || err.name === 'ReferenceError') {
    res.status(500).json({
      error: 'EJS Rendering Error',
    });
  } else if (err.name === 'ServiceUnavailableError') {
    res.status(500).json({
      error: `Database Unavailable Error`,
    });
  } else if (err.name === 'URIError') {
    res.status(500).json({
      error: `URI Decode Error`,
    });
  } else {
    res.status(500).json({
      error: err.message,
    });
  }
});

// 404 Error
app.use('*', (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: `404 Not Found`,
  });
});

// uncaughtException
process.on('uncaughtException', (err) => {
  console.error('uncaughtException', err);
});

server.listen(port, () => console.log('Server is running... http://localhost:' + port));

module.exports = app;