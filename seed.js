/**
 * seed.js — Populate database with sample coding problems
 * 
 * Run with: node seed.js
 */

const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database('./problems.db');

const problems = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume that each input has exactly one solution, and you may not use the same element twice.',
    difficulty: 'Easy',
    topic: 'Array',
    example: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]',
    testCases: [
      { input: '[2,7,11,15],9', expected: '[0,1]' },
      { input: '[3,2,4],6', expected: '[1,2]' },
      { input: '[3,3],6', expected: '[0,1]' }
    ]
  },
  {
    title: 'Reverse String',
    description: 'Write a function that reverses a string. The input string is given as an array of characters s.',
    difficulty: 'Easy',
    topic: 'String',
    example: 'Input: s = ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"]',
    testCases: [
      { input: '["h","e","l","l","o"]', expected: '["o","l","l","e","h"]' },
      { input: '["H","a","n","n","a","h"]', expected: '["h","a","n","n","a","H"]' }
    ]
  },
  {
    title: 'Valid Palindrome',
    description: 'A phrase is a palindrome if it reads the same backward and forward after converting all uppercase letters to lowercase and removing all non-alphanumeric characters.',
    difficulty: 'Easy',
    topic: 'String',
    example: 'Input: s = "A man, a plan, a canal: Panama"\nOutput: true',
    testCases: [
      { input: '"A man, a plan, a canal: Panama"', expected: 'true' },
      { input: '"race a car"', expected: 'false' },
      { input: '""', expected: 'true' }
    ]
  },
  {
    title: 'Merge Sorted Array',
    description: 'You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of valid elements in nums1 and nums2 respectively. Merge nums2 into nums1 as one sorted array.',
    difficulty: 'Easy',
    topic: 'Array',
    example: 'Input: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3\nOutput: [1,2,2,3,5,6]',
    testCases: [
      { input: '[1,2,3,0,0,0],3,[2,5,6],3', expected: '[1,2,2,3,5,6]' },
      { input: '[1],1,[],0', expected: '[1]' }
    ]
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    difficulty: 'Medium',
    topic: 'String',
    example: 'Input: s = "abcabcbb"\nOutput: 3 (substring "abc")',
    testCases: [
      { input: '"abcabcbb"', expected: '3' },
      { input: '"bbbbb"', expected: '1' },
      { input: '"pwwkew"', expected: '3' },
      { input: '""', expected: '0' }
    ]
  },
  {
    title: 'Binary Search',
    description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.',
    difficulty: 'Medium',
    topic: 'Array',
    example: 'Input: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4',
    testCases: [
      { input: '[-1,0,3,5,9,12],9', expected: '4' },
      { input: '[-1,0,3,5,9,12],13', expected: '-1' },
      { input: '[5],5', expected: '0' }
    ]
  },
  {
    title: 'Climbing Stairs',
    description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    difficulty: 'Easy',
    topic: 'Dynamic Programming',
    example: 'Input: n = 3\nOutput: 3 (1+1+1, 1+2, 2+1)',
    testCases: [
      { input: '2', expected: '2' },
      { input: '3', expected: '3' },
      { input: '4', expected: '5' }
    ]
  },
  {
    title: 'Container With Most Water',
    description: 'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container such that the container contains the most water.',
    difficulty: 'Medium',
    topic: 'Array',
    example: 'Input: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49',
    testCases: [
      { input: '[1,8,6,2,5,4,8,3,7]', expected: '49' },
      { input: '[1,1]', expected: '1' }
    ]
  }
];

db.serialize(() => {
  // Clear existing data
  db.run('DELETE FROM submissions');
  db.run('DELETE FROM test_cases');
  db.run('DELETE FROM problems');

  // Insert problems and test cases
  let count = 0;
  problems.forEach(prob => {
    const problemId = uuidv4();

    db.run(
      'INSERT INTO problems (id, title, description, difficulty, topic, example) VALUES (?, ?, ?, ?, ?, ?)',
      [problemId, prob.title, prob.description, prob.difficulty, prob.topic, prob.example],
      function (err) {
        if (err) {
          console.error(`Error inserting problem "${prob.title}":`, err);
          return;
        }

        // Insert test cases for this problem
        prob.testCases.forEach(tc => {
          const tcId = uuidv4();
          db.run(
            'INSERT INTO test_cases (id, problem_id, input, expected_output) VALUES (?, ?, ?, ?)',
            [tcId, problemId, tc.input, tc.expected],
            (err) => {
              if (err) console.error('Error inserting test case:', err);
            }
          );
        });

        count++;
        console.log(`✅ Inserted "${prob.title}"`);
      }
    );
  });

  setTimeout(() => {
    console.log(`\n🎓 Seeded ${count} problems with test cases`);
    db.close();
  }, 1000);
});
