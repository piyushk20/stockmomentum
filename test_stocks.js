import { STOCK_LIST } from './src/data/stocks.js';

console.log('Stock List loaded successfully!');
console.log('Number of categories:', STOCK_LIST.length);
let totalStocks = 0;
STOCK_LIST.forEach(category => {
    console.log(` Category: ${category.label}, Stocks: ${category.options.length}`);
    totalStocks += category.options.length;
});
console.log('Total stocks:', totalStocks);
