import {ApplicationConfig, App} from './application';
import {Logger} from './utils';

export async function main(options: ApplicationConfig = {}) {
  const app = new App(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  Logger.info('LB4', 'main', 'Server is running at', url);
  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      expressSettings: {
        'x-powered-by': false,
      },
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    Logger.error('LB4', 'main', 'Cannot start the application', err.message);
    process.exit(1);
  });
}
