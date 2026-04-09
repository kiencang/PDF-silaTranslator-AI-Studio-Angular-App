import('./dist/server/server.mjs').then((module) => {
  const app = module.app;
  const port = 3000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Failed to load server.mjs', err);
});
