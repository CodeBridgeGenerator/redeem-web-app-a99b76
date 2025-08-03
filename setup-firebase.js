#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔥 Firebase Configuration Setup');
console.log('===============================\n');

console.log('This script will help you configure Firebase for your authentication system.\n');

console.log('To get your Firebase configuration:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Create a new project or select an existing one');
console.log('3. Go to Project Settings (gear icon)');
console.log('4. Scroll down to "Your apps" section');
console.log('5. Click the web icon (</>) to add a web app');
console.log('6. Register your app and copy the configuration\n');

console.log('Also make sure to:');
console.log('- Enable Google Authentication in Firebase Console');
console.log('- Configure OAuth consent screen if prompted');
console.log('- Add your domain to authorized domains\n');

const questions = [
  {
    name: 'apiKey',
    message: 'Enter your Firebase API Key: ',
    required: true
  },
  {
    name: 'authDomain',
    message: 'Enter your Firebase Auth Domain: ',
    required: true
  },
  {
    name: 'projectId',
    message: 'Enter your Firebase Project ID: ',
    required: true
  },
  {
    name: 'storageBucket',
    message: 'Enter your Firebase Storage Bucket: ',
    required: true
  },
  {
    name: 'messagingSenderId',
    message: 'Enter your Firebase Messaging Sender ID: ',
    required: true
  },
  {
    name: 'appId',
    message: 'Enter your Firebase App ID: ',
    required: true
  }
];

let answers = {};
let currentQuestion = 0;

function askQuestion() {
  if (currentQuestion >= questions.length) {
    updateFirebaseConfig();
    return;
  }

  const question = questions[currentQuestion];
  
  rl.question(question.message, (answer) => {
    if (!answer.trim() && question.required) {
      console.log('This field is required. Please provide a value.\n');
      askQuestion();
      return;
    }
    
    answers[question.name] = answer.trim();
    currentQuestion++;
    askQuestion();
  });
}

function updateFirebaseConfig() {
  const configPath = path.join(__dirname, 'react-frontend', 'src', 'components', 'LoginPage', 'Firebase.config.js');
  
  if (!fs.existsSync(configPath)) {
    console.log('❌ Firebase.config.js not found at expected location');
    console.log('Expected path:', configPath);
    rl.close();
    return;
  }

  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Create the new config object
  const newConfig = `const firebaseConfig = {
  apiKey: "${answers.apiKey}",
  authDomain: "${answers.authDomain}",
  projectId: "${answers.projectId}",
  storageBucket: "${answers.storageBucket}",
  messagingSenderId: "${answers.messagingSenderId}",
  appId: "${answers.appId}"
};`;

  // Replace the existing config
  configContent = configContent.replace(
    /const firebaseConfig = \{[\s\S]*?\};/,
    newConfig
  );

  // Update the isConfigured check
  configContent = configContent.replace(
    /const isConfigured = Object\.keys\(firebaseConfig\)\.length === 0 \|\| firebaseConfig\.apiKey === "YOUR_API_KEY";/,
    'const isConfigured = false;'
  );

  try {
    fs.writeFileSync(configPath, configContent, 'utf8');
    console.log('\n✅ Firebase configuration updated successfully!');
    console.log('\nNext steps:');
    console.log('1. Start your development server');
    console.log('2. Test the authentication flow');
    console.log('3. Check the browser console for any errors');
    console.log('\nFor production deployment:');
    console.log('- Set these values as environment variables');
    console.log('- Ensure HTTPS is enabled');
    console.log('- Add your domain to Firebase authorized domains');
  } catch (error) {
    console.log('❌ Error updating Firebase configuration:', error.message);
  }

  rl.close();
}

// Start the setup process
askQuestion(); 