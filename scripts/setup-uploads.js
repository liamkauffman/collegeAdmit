const fs = require('fs');
const path = require('path');

// Define the upload directory path
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');

// Create the directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads directory at:', uploadDir);
    
    // Create a .gitkeep file to ensure the directory is tracked by git
    fs.writeFileSync(path.join(uploadDir, '.gitkeep'), '');
    console.log('Created .gitkeep file');
    
    // Create a .gitignore file to ignore uploaded files but keep the directory
    fs.writeFileSync(path.join(uploadDir, '.gitignore'), `*\n!.gitkeep\n`);
    console.log('Created .gitignore file');
  } catch (error) {
    console.error('Error creating upload directory:', error);
    process.exit(1);
  }
} else {
  console.log('Uploads directory already exists at:', uploadDir);
} 