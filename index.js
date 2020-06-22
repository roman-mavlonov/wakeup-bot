//// IMPORTS

require('dotenv').config();

const express = require('express');

const Slimbot = require('./imports/SlimbotPatched');
const Store = require('./imports/store/MongoDbStore');
const Sheet = require('./imports/Spreadsheet');
const Router = require('./imports/Router');


//// CONSTANTS

const bot = new Slimbot(process.env['TELEGRAM_BOT_TOKEN']);
bot.name = process.env['TELEGRAM_BOT_NAME'];

const store = new Store();
const sheet = new Sheet();
const router = new Router(bot, store, sheet);


bot.on('message', message =>
  router.onMessage(message)
);

bot.on('callback_query', query =>
  router.onCallbackQuery(query)
);


const app = express();

app.get('/', (req, res) => {
  (async () => {
    try {
      await handleIndex(res);
    } catch(error) {
      console.error(error);
      res.send("Error! " + JSON.stringify(error, null, 2));
    }
  })();
});

app.get('/user/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  (async () => {
    try {
      await handleUserDetails(userId, res);
    } catch(error) {
      console.error(error);
      res.send("Error! " + JSON.stringify(error, null, 2));
    }
  })();
});


//// MAIN

var tickInterval;

process.on('SIGINT', () => {
  if (tickInterval) clearInterval(tickInterval);
  store.disconnect(error => process.exit(error ? 1 : 0));
});

store.connect(error => {
  if (error) {
    process.exit(1);

  } else {
    bot.startPolling();
    sheet.ping();  // DEBUG Spreadsheet connectivity
    console.log(`\n*** ${process.env['TELEGRAM_BOT_NAME']} started!\n`);

    app.listen(3009);
    console.log("Listening on port 3009");

    tickInterval = setInterval(() =>
      router.onTick(),
      30 * 1000 /* раз в 30 секунд = 2 раза в минуту */
    );

    // Одноразовый запуск фиксов для БД
    //runFixtures();
  }
});


//// METHODS

//region WebPage
function fmt(value) {
  if (!!value) return value
  else return "";
}

async function handleIndex(res) {
  const users = await store.getAllUsers();
  const groups = [];
  const fullnames = [];
  const timezones = [];
  const activity = [];
  for (user of users) {
    groups[user._id] = await store.getUserGroup(user._id);
    fullnames[user._id] = await store.getUserFullName(user._id);
    timezones[user._id] = await store.getUserTimezoneP(user._id);
    activity[user._id] = await store.getPlusesActP(user._id);
  }

  const chatUrl = process.env['MARATHON_CHAT_URL'];
  const channelUrl = process.env['MARATHON_CHANNEL_URL'];

  let content = "<html>" +
    "<head><title>PodWakeupBot</title></head>" +
    "<body>" +
    "<h2>PodWakeupBot</h2>" +
    "<h3>Текущие настройки</h3>" +
    "<table>" +
    "<thead><th>key</th><th>value</th></thead>" +
    "<tbody>" +
    "<tr><td><code>MARATHON_START_DATE</code></td>" +
    `<td><code>${ process.env['MARATHON_START_DATE'] }</code></td></tr>` +
    "<tr><td><code>MARATHON_DURATION</code></td>" +
    `<td><code>${ process.env['MARATHON_DURATION'] }</code></td></tr>` +
    "<tr><td><code>MARATHON_CHAT_URL</code></td>" +
    `<td><a href="${ chatUrl }">${ chatUrl }</a></td></tr>` +
    "<tr><td><code>MARATHON_CHANNEL_URL</code></td>" +
    `<td><a href="${ channelUrl }">${ channelUrl }</a></td></tr>` +
    "</tbody></table>";

  content += "<h3>Участники</h3>" +
    "<table><thead>" +
    "<th>ID</th><th>username</th><th>first_name last_name</th><th>lang</th><th>group</th><th>timezone</th><th>Активность</th>" +
    "</thead><tbody>";
  for (user of users) {
    content += "<tr>" +
      `<td><a href="http://wakeup.tonycode.ru:3009/user/${ user.user.id }">${ user.user.id }</a></td><td>${ fmt(user.user.username) }</td>` +
      `<td>${ user.user.first_name } ${ fmt(user.user.last_name) } (<b>${ fullnames[user._id] }</b>)</td>` +
      `<td>${ fmt(user.user.language_code) }</td>` +
      `<td>${ groups[user._id] }</td><td>${ timezones[user._id] }</td>` +
      `<td>${ activity[user._id] }</td>`
      "</tr>";
  }
  content += "</tbody></table>";

  //content += "<pre>" + JSON.stringify(users, null, 2) + "</pre>";

  content += "</body></html>";

  res.send(content);
}

async function handleUserDetails(userId, res) {
  console.log(`handleUserDetails(${userId})`);

  const user = await store.getUserP(userId);
  const pluses = await store.getPlusesP(userId);
  const sleepLog = await store.getSleepLogP(userId);

  let content = "<html>" +
    "<head><title>PodWakeupBot</title></head>" +
    "<body>" +
    `<h2>"+-" по пользователю ${user.user.username}</h2>`;

  content += "<pre>" + JSON.stringify(user.user, null, 2) + "</pre>";

  content += "<h3>Плюсы (время - пользовательское)</h3>" +
    `<pre>${ pluses }</pre>`;

  content += "<h3>Лог сна (время - пользовательское)</h3>" +
    `<pre>${ sleepLog }</pre>`;

  content += "</body></html>";

  res.send(content);
}
//endregion

//region Fixtures
/** Promise-таймер */
function timer(millis) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), millis);
  })
}

function runFixtures() {
  console.log("Starting fixtures...");

  //// Заполняем таблицу
  // (1) user-groups
  /*(async () => {
    try {
      const users = await store.getAllUsers();
      console.log("Got users: " + JSON.stringify(users, null, 2));

      for (user of users) {
        console.log("Processing user: " + JSON.stringify(user, null, 2));

        const groupId = await store.getUserGroup(user._id);
        console.log(`user: ${user._id} -> group: ${groupId}`);
        sheet.addUserWithGroup(user.user, groupId);
        // Защита от "Error: Resource has been exhausted (e.g. check quota)."
        await timer(2000);
      }
    } catch(error) {
      console.error(error);
    }
  })();*/
  // (2) Плюсы
  (async () => {
    try {
      //TODO
    } catch(error) {
      console.error(error);
    }
  })();
}
//endregion
