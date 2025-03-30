#!/usr/bin/env node

console.log('Hello from Bunshin CLI!');

// コマンドライン引数の処理
const args = process.argv.slice(2);
if (args.length > 0) {
  console.log('Arguments:', args);
}
