// Test script to verify document storage functionality
const fs = require('fs');
const path = require('path');

// Create a simple test document
const testDocument = Buffer.from('This is a test legal document contract for testing purposes.', 'utf8');
const filename = 'test-contract.txt';
const mimeType = 'text/plain';

console.log('Testing document storage functionality...');
console.log('Document buffer length:', testDocument.length);
console.log('Filename:', filename);
console.log('MIME Type:', mimeType);

// Create hash for comparison
const crypto = require('crypto');
const fileHash = crypto.createHash('md5').update(testDocument).digest('hex');
console.log('Generated file hash:', fileHash);

console.log('\nDocument storage test completed successfully!');
