#!/usr/bin/env node

/**
 * Google Cloud Document AI Setup Script
 * This script helps you create and configure a Document AI processor
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function setupDocumentAI() {
  console.log('🚀 Setting up Google Cloud Document AI...\n');

  const projectId = 'refined-veld-456716-f8';
  const location = 'us';

  try {
    console.log('📋 Instructions to set up Document AI processor:\n');
    
    console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
    console.log(`2. Make sure you're in project: ${projectId}`);
    console.log('3. Enable the Document AI API:');
    console.log('   https://console.cloud.google.com/apis/library/documentai.googleapis.com');
    console.log('4. Create a Document AI processor:');
    console.log('   https://console.cloud.google.com/ai/document-ai/processors');
    console.log('5. Choose "Form Parser" or "Document OCR" processor type');
    console.log(`6. Set location to: ${location}`);
    console.log('7. Copy the processor ID from the created processor\n');

    console.log('🔧 Alternative: Use gcloud CLI commands:');
    console.log('');
    console.log('# Enable the API');
    console.log(`gcloud services enable documentai.googleapis.com --project=${projectId}`);
    console.log('');
    console.log('# Create a processor');
    console.log(`gcloud ai document-ai processors create \\`);
    console.log(`  --location=${location} \\`);
    console.log(`  --processor-type=FORM_PARSER_PROCESSOR \\`);
    console.log(`  --display-name="Legal Document Parser" \\`);
    console.log(`  --project=${projectId}`);
    console.log('');

    console.log('📝 Once you have the processor ID, update your .env file:');
    console.log('DOCUMENT_AI_PROCESSOR_ID=your-actual-processor-id');
    console.log('');

    console.log('✅ For now, the system will use fallback text extraction until you set up Document AI.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupDocumentAI();
