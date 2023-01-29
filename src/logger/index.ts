import log4js from 'log4js';

log4js.configure({
  appenders: {
    out: {type: 'stdout'},
  },
  categories: {
    default: {appenders: ['out'], level: 'all'},
    [`[${process.env.NODE_SERVICE_NAME}]`]: {appenders: ['out'], level: 'all'},
  },
});

const logger = log4js.getLogger(`[${process.env.NODE_SERVICE_NAME}]`);
logger.level = 'all';

(function () {
  console.error = function (errMessage) {
    logger.error(errMessage);
  };

  console.log = function (logMessage) {
    logger.debug(logMessage);
  };

  console.warn = function (warnMessage) {
    logger.info(warnMessage);
  };
})();
