import express from 'express';
import { Spreadsheet } from './spreadsheet';
import bodyParser from 'body-parser';
export const app = express();

var jsonParser = bodyParser.json();

app.set('trust proxy', true);

const spreadsheets = {} as Record<string, Spreadsheet>;

app.get('/:cellId', (req, res) => {
  const ss = spreadsheet(req);
  const cellId = req.params.cellId;
  const value = ss.getCellValue(cellId);
  res.send({ [cellId]: value });
});

app.post('/:cellId', jsonParser, (req, res) => {
  const value = req.body.value;
  if (value === null || value === undefined) {
    res.status(400);
    res.send('Expecting payload with the following type: { "value": string|number }');
    return;
  }

  const ss = spreadsheet(req);
  try {
    const { cellId } = req.params;
    ss.setCellValue(cellId, value);
    res.send({ [cellId]: value });
  } catch (err: any) {
    res.status(400);
    res.send(err.message);
  }
});

app.delete('/', (req, res) => {
  const ss = spreadsheet(req);
  ss.reset();
  res.send('Reset spreadsheet');
});

const spreadsheet = (req: express.Request) => (spreadsheets[req.ip] = spreadsheets[req.ip] ?? new Spreadsheet());
