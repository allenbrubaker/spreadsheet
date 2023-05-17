import { app } from './server';

const port = 3001;
app.listen(port, () => {
  console.log(`Spreadsheet app listening on port ${port}`);
});
