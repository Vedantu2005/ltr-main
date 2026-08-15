const userService = require('../../src/services/user.service');
const storeService = require('../../src/services/store.service');
const { signToken } = require('../../src/utils/jwt');

const VALID_PASSWORD = 'FactoryPass1!';

let counter = 0;
function unique() {
  counter += 1;
  return counter;
}

async function createUser(overrides = {}) {
  const n = unique();
  const user = await userService.createUser({
    name: overrides.name || `Generated Test Account Holder Number ${n}`,
    email: overrides.email || `test.user.${n}@example.com`,
    password: overrides.password || VALID_PASSWORD,
    address: overrides.address || `${n} Test Fixture Lane, Testville, TS`,
    role: overrides.role || 'USER',
  });
  const token = signToken(user);
  return { user, token };
}

async function createStore(overrides = {}) {
  const n = unique();
  return storeService.createStore({
    name: overrides.name || `Generated Test Store ${n}`,
    email: overrides.email || `store.${n}@example.com`,
    address: overrides.address || `${n} Store Fixture Ave`,
    ownerId: overrides.ownerId || null,
  });
}

module.exports = { createUser, createStore, VALID_PASSWORD };
