# Spreadsheet

Simple spreadsheet simulator supporting value and sum expression cells.

Supports the following operations:

- `void setCellValue(String cellId, Object value)`
- `int getCellValue(String cellId)`

## Setup
- `npm i -g yarn`
- `nvm use` 
- `yarn install`
- `yarn test`
- `yarn start`

## Example

POST localhost:3001/A1 { "value": 13 }
POST localhost:3001/A2 { "value": 14 }
GET localhost:3001/A1 -> { "A1": 13 }
POST localhost:3001/A3 { "value": "=A1+A2" }
GET localhost:3001/A3 -> { "A3": 27 }
POST localhost:3001/A4 { "value": "=A1+A2+A3" }
GET lcalhost:3001/A4 -> { "A4": 54 }

## Implementation

- Solution is implemented using a directed acyclic graph (DAG) that is built up dynamically as the user invokes `setCellValue`. Invoking this operation repeatedly, where the value is a sum, will add parents to the DAG by composing DAGs together as children.
- If a cell (vertex/node) value is updated, the resulting graph is validated to ensure no cycles are detected, else an exception is thrown. Cycles do not need to be checked on new cell additions but only on existing cell updates, because parents may already exist for these cells where a cycle can potentially be induced.
- If a cell expression references cells that do not exist and have no value, a cell with value null is created in order to be optimistic and support all possible scenarios.
- CellId can be any string value including "5" so be wary when creating expressions.
- When the user invokes `getCellValue`,
  - If the value is an expression, perform a sum on all leaves of the subgraph induced by taking the referenced cell as the root. If cells do not exist in summation, assume cell value is 0.
  - If the value is a number, return the number.
  - If the cell doesn't exist, return null.
- Only sum cell expressions of the format `=cell_0+cell_1+...cell_n` are allowed, else an error is thrown.
