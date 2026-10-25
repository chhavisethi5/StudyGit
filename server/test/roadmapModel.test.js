const test = require('node:test');
const assert = require('node:assert/strict');
const Roadmap = require('../src/models/Roadmap');

test('Roadmap Model - Schema Validation', async (t) => {
  await t.test('passes validation with a valid complete roadmap', async () => {
    const roadmap = new Roadmap({
      title: 'Data Structures and Algorithms',
      subject: 'Computer Science',
      description: 'Comprehensive curriculum covering trees, graphs, dynamic programming, and sorting.',
      university: 'Tech University',
      semester: 'Semester 3',
      tags: ['dsa', 'algorithms', 'cs'],
      visibility: 'public',
      modules: [
        {
          title: 'Module 1: Linear Data Structures',
          description: 'Arrays, Linked Lists, Stacks, and Queues',
          order: 1,
          topics: [
            {
              title: 'Singly and Doubly Linked Lists',
              estimatedHours: 4,
              order: 1,
              resources: [
                {
                  title: 'Visualizing Linked Lists',
                  url: 'https://visualgo.net/en/list',
                  type: 'article',
                },
                {
                  title: 'MIT Lecture on Linked Lists',
                  url: 'http://youtube.com/watch?v=example',
                  type: 'video',
                },
              ],
            },
          ],
        },
      ],
    });

    const error = roadmap.validateSync();
    assert.equal(error, undefined, 'Validation should pass without error');
    assert.equal(roadmap.version, 1);
    assert.equal(roadmap.visibility, 'public');
    assert.equal(roadmap.modules.length, 1);
    assert.equal(roadmap.modules[0].topics[0].resources.length, 2);
  });

  await t.test('fails validation when required fields (title, subject) are missing', async () => {
    const roadmap = new Roadmap({});
    const error = roadmap.validateSync();
    assert.ok(error, 'Expected validation error for missing fields');
    assert.ok(error.errors.title, 'Should error on missing title');
    assert.ok(error.errors.subject, 'Should error on missing subject');
  });

  await t.test('fails validation when visibility has an invalid enum value', async () => {
    const roadmap = new Roadmap({
      title: 'Operating Systems',
      subject: 'Computer Science',
      visibility: 'confidential', // Invalid enum
    });
    const error = roadmap.validateSync();
    assert.ok(error, 'Expected validation error for invalid visibility enum');
    assert.ok(error.errors.visibility, 'Should flag invalid visibility');
  });

  await t.test('fails validation when resource URL is invalid or non-HTTP', async () => {
    const roadmapWithBadUrl = new Roadmap({
      title: 'Web Development',
      subject: 'Information Technology',
      modules: [
        {
          title: 'HTML & CSS Basics',
          topics: [
            {
              title: 'Semantic HTML',
              resources: [
                {
                  title: 'Invalid Resource',
                  url: 'not-a-valid-url', // Invalid URL
                  type: 'article',
                },
              ],
            },
          ],
        },
      ],
    });

    const error = roadmapWithBadUrl.validateSync();
    assert.ok(error, 'Expected validation error for malformed URL');
    assert.ok(
      error.errors['modules.0.topics.0.resources.0.url'],
      'Should report invalid URL error on resource subdocument'
    );
  });

  await t.test('fails validation when resource type is not in permitted enum values', async () => {
    const roadmapWithBadType = new Roadmap({
      title: 'Database Management Systems',
      subject: 'Computer Science',
      modules: [
        {
          title: 'SQL Fundamentals',
          topics: [
            {
              title: 'Joins and Subqueries',
              resources: [
                {
                  title: 'SQL Cheatsheet',
                  url: 'https://example.com/sql-cheat-sheet.pdf',
                  type: 'podcast', // Invalid enum
                },
              ],
            },
          ],
        },
      ],
    });

    const error = roadmapWithBadType.validateSync();
    assert.ok(error, 'Expected validation error for invalid resource type');
    assert.ok(error.errors['modules.0.topics.0.resources.0.type']);
  });

  await t.test('fails validation when topic estimatedHours is negative', async () => {
    const roadmapWithNegativeHours = new Roadmap({
      title: 'Discrete Mathematics',
      subject: 'Mathematics',
      modules: [
        {
          title: 'Graph Theory',
          topics: [
            {
              title: 'Eulerian Graphs',
              estimatedHours: -3, // Invalid negative number
            },
          ],
        },
      ],
    });

    const error = roadmapWithNegativeHours.validateSync();
    assert.ok(error, 'Expected validation error for negative hours');
    assert.ok(error.errors['modules.0.topics.0.estimatedHours']);
  });
});
