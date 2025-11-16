/* eslint-disable no-param-reassign */
import type { Products } from '../types/entities.js';

import productsStaticJSON from '../../data/products.json' assert { type: 'json' };

const productsStaticData: Products = productsStaticJSON;

export function getProducts() {
	console.log('getProducts');
	return productsStaticData;
}
