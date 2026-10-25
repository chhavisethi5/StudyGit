const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

test('User Model Unit Tests', async (t) => {
  await t.test('passes schema validation with valid user data', () => {
    const user = new User({
      name: 'Chhavi Sethi',
      email: 'chhavi@university.edu',
      passwordHash: '$2a$12$e8pA.7U7fWjZJ...',
    });

    const err = user.validateSync();
    assert.equal(err, undefined, 'Valid user should not produce schema validation errors');
    assert.equal(user.email, 'chhavi@university.edu');
  });

  await t.test('fails validation when required fields are missing', () => {
    const user = new User({});
    const err = user.validateSync();

    assert.ok(err, 'Expected validation error');
    assert.ok(err.errors.name, 'Name should be required');
    assert.ok(err.errors.email, 'Email should be required');
    assert.ok(err.errors.passwordHash, 'Password hash should be required');
  });

  await t.test('fails validation on invalid email formats', () => {
    const invalidEmails = ['plainaddress', '@missingusername.com', 'user@.com', 'user@domain'];
    for (const email of invalidEmails) {
      const user = new User({
        name: 'Test Student',
        email,
        passwordHash: 'dummyhash123',
      });
      const err = user.validateSync();
      assert.ok(err, `Email '${email}' should fail validation`);
      assert.ok(err.errors.email, `Expected email validation error for '${email}'`);
    }
  });

  await t.test('normalizes email to lowercase and trims whitespace', () => {
    const user = new User({
      name: '  Test Student  ',
      email: '  STUDENT@University.EDU  ',
      passwordHash: 'dummyhash123',
    });

    assert.equal(user.email, 'student@university.edu');
    assert.equal(user.name, 'Test Student');
  });

  await t.test('comparePassword matches correct password and rejects wrong password', async () => {
    const plaintext = 'SuperSecret123!';
    const passwordHash = await bcrypt.hash(plaintext, 10);

    const user = new User({
      name: 'Test Student',
      email: 'test@university.edu',
      passwordHash,
    });

    const isCorrect = await user.comparePassword(plaintext);
    assert.equal(isCorrect, true);

    const isWrong = await user.comparePassword('WrongPassword!');
    assert.equal(isWrong, false);
  });

  await t.test('toSafeObject and toJSON strip passwordHash', () => {
    const user = new User({
      name: 'Chhavi',
      email: 'chhavi@university.edu',
      passwordHash: 'topsecret_hash',
    });

    const safeObj = user.toSafeObject();
    assert.equal(safeObj.passwordHash, undefined);
    assert.equal(safeObj.name, 'Chhavi');
    assert.equal(safeObj.email, 'chhavi@university.edu');

    const json = JSON.parse(JSON.stringify(user));
    assert.equal(json.passwordHash, undefined, 'passwordHash must never be present in serialized JSON');
  });
});
