import { Spreadsheet } from './spreadsheet';

describe('spreadsheet', () => {
  it('sets and retrieves simple values correctly', () => {
    const s = new Spreadsheet();
    s.setCellValue('A', 1);
    expect(s.getCellValue('A')).toEqual(1);
    s.setCellValue('A', 10);
    expect(s.getCellValue('A')).toEqual(10);
  });

  it('returns null when cell is not found', () => {
    const s = new Spreadsheet();
    expect(s.getCellValue('A')).toEqual(null);
  });

  it('performs calculations correctly', () => {
    const s = new Spreadsheet();
    s.setCellValue('A4', '=A1+A2+A3');
    s.setCellValue('A3', '=A1+A2');
    expect(s.getCellValue('A1')).toEqual(0);
    expect(s.getCellValue('A2')).toEqual(0);
    expect(s.getCellValue('A4')).toEqual(0);
    expect(s.getCellValue('A3')).toEqual(0);
    expect(s.getCellValue('A4')).toEqual(0);
    s.setCellValue('A1', 13);
    s.setCellValue('A2', 14);
    expect(s.getCellValue('A1')).toEqual(13);
    expect(s.getCellValue('A2')).toEqual(14);
    expect(s.getCellValue('A3')).toEqual(27);
    expect(s.getCellValue('A4')).toEqual(54);
  });

  it('performs correct calculations even after multiple leaf updates', () => {
    const s = new Spreadsheet();
    s.setCellValue('A3', '=A1+A2');
    s.setCellValue('A4', '=A1+A2+A3');
    for (let i = 0; i < 10; ++i) {
      const [x, y] = [Math.round(Math.random() * 100), Math.round(Math.random() * 100)];
      s.setCellValue('A1', x);
      s.setCellValue('A2', y);
      expect(s.getCellValue('A3')).toEqual(x + y);
      expect(s.getCellValue('A4')).toEqual(2 * (x + y));
    }
  });

  it('detects cycles and rollsback', () => {
    const s = new Spreadsheet();
    s.setCellValue('A', 1);
    s.setCellValue('B', '=A');
    s.setCellValue('C', '=B');
    s.setCellValue('D', '=C');
    expect(s.getCellValue('D')).toEqual(1);
    expect(() => s.setCellValue('A', '=D')).toThrowError(/cycle/i);
    expect(s.getCellValue('D')).toEqual(1);
    expect(s.getCellValue('A')).toEqual(1);
  });

  it('accepts only valid expressions', () => {
    const s = new Spreadsheet();
    expect(() => s.setCellValue('A', 'B2')).toThrowError();
    expect(() => s.setCellValue('A', '=B2+')).toThrowError();
  });
});
