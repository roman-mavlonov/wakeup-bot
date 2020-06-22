# PodWakeupBot


## Настройка бота для очередного марафона

- `.env`
  - Дата начала марафона
  - Длительность марафона
  - Ссылка на Канал
  - Ссылка на Чат участников марафона
- `SetGroupStage.js`
  - `getCompletedMessage()` - скорректировать имена кураторов

Гугл-таблица
- должны иметь листы "5-00", "6-00" и "7-00"


## Запуск бота

### Локально

- edit `.env`
- `npm install`
- create `credentials.json` for google-apis
- `node get_token.js` and follow instructions

- `npm start`

### На сервере

```shell
./deploy1.sh  # локально

ssh wakeup
./deploy2.sh  # на remote server
```


## Заметки для разработчиков

telegram-бот:

- "+" из чата добавляет в Google Spreadsheet
- Хранит данные по каждому пользователю в MongoDB

классы бота:

- `get_token.js` - обновление токена для гугл-таблицы
- `imports/Spreadsheet.js` - работа с гугл-таблицей
- `imports/store/*` - классы для работы с хранилищем (MongoDB)
- `imports/stages/*` - узлы "графа этапов общения" бота
- `imports/NotificationsController.js` - работа с уведомлениями "поставьте +"
