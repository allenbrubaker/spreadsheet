type Cell = {
  id: string;
  value?: number | null;
  children: string[];
};

export class Spreadsheet {
  private _cells = {} as Record<string, Cell>;
  constructor() {}

  reset() {
    this._cells = {};
  }

  print() {
    console.log(this._cells);
  }

  setCellValue(cellId: string, value: string | number) {
    if (value === null || value === undefined) return;
    if (this.isNumber(value)) {
      this._cells[cellId] = { id: cellId, value: value as number, children: [] };
      return;
    }

    const oldCell = this._cells[cellId];
    const newCell = {
      id: cellId,
      children: this.childrenFromExpression(value as string)
    };

    this._cells[cellId] = newCell;

    if (oldCell) {
      // may have parents, so ensure no cycles are introduced.
      try {
        this.dfs(newCell);
      } catch (err) {
        this._cells[cellId] = oldCell; // cycle detected, so rollback.
        throw err;
      }
    }
  }

  getCellValue(cellId: string): number | null {
    const cell = this._cells[cellId];
    if (!cell) return null;
    if (cell.value) return cell.value;
    let sum = 0;
    this.dfs(cell, {}, cell => {
      sum += cell.value ?? 0;
    });
    return sum;
  }

  private ensureNoCycles() {
    const visited = {} as Record<string, boolean>;
    for (const cell of Object.values(this._cells)) {
      if (visited[cell.id]) continue;
      this.dfs(cell, visited); // perform DFS on each tree in forest
    }
  }

  private dfs(root: Cell, visited = {} as Record<string, boolean>, action: (cell: Cell) => void = () => {}) {
    if (visited[root.id] && root.children?.length) throw new Error('Detected cycle!'); // only interested if we've visited a non-leaf node twice.
    visited[root.id] = true;
    action(root);
    root.children?.forEach(childId => this.dfs(this._cells[childId], visited, action));
  }

  private isNumber = (value: any) => typeof value === 'number';

  private childrenFromExpression(expression: string): string[] {
    if (!expression.match(/^=\w+(\+\w+)*$/))
      throw new Error(`Invalid expression. Only addition is allowed: ${expression}`);
    const cellIds = expression.match(/(\w+)/g) ?? [];
    for (const cellId of cellIds) if (!this._cells[cellId]) this._cells[cellId] = { id: cellId, children: [] };
    return cellIds;
  }
}
