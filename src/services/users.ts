/* eslint-disable no-param-reassign */
import type { Users } from '../types/entities.js';

import usersStaticJSON from '../../data/users.json' assert { type: 'json' };

const usersStaticData: Users = usersStaticJSON;

export function getUsers() {
	console.log('getUsers');
	return usersStaticData;
}
