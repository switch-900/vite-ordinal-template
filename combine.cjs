const fs = require('fs');
const path = require('path');
const readline = require('readline');
// Configuration
const rootDir = path.resolve(__dirname);
const outputDirName = 'combined-output';
const outputDir = path.join(rootDir, outputDirName);
const currentDateTime = new Date().toISOString().replace(/[:.]/g, '-');
// Add srcDir path
const srcDir = path.join(rootDir, 'src');
// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}
// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
// Directories to exclude
const excludeDirs = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.svcode',
  outputDirName  // Add output directory to excluded dirs
];
// Specific files to exclude
const excludeFiles = ['package-lock.json', 'combined.txt', 'combined1.txt' , 'combined2.txt', 'combined3.txt'];
// File extensions to include
const includeExtensions = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.html',
  '.css',
  '.scss',
  '.json',
  '.md',
  '.py',
  '.java',
  '.cpp',
  '.c'
  // NOTE: '.txt' is intentionally excluded so no text files are included.
];
/**
 * Check if a directory should be excluded.
 * @param {string} dirName - Name of the directory.
 * @returns {boolean}
 */
function isExcludedDir(dirName) {
  return excludeDirs.includes(dirName);
}
/**
 * Check if a file should be excluded.
 * @param {string} fileName - Name of the file.
 * @returns {boolean}
 */
function isExcludedFile(fileName) {
  return excludeFiles.includes(fileName);
}
/**
 * Check if a file has an included extension.
 * @param {string} fileName - Name of the file.
 * @returns {boolean}
 */
function hasIncludedExtension(fileName) {
  return includeExtensions.includes(path.extname(fileName).toLowerCase());
}
/**
 * Recursively traverse the directory and collect eligible file paths.
 * @param {string} dir - Directory to traverse.
 * @param {Array} fileList - Accumulator for file paths.
 * @returns {Array} - List of eligible file paths.
 */
function traverseDirectory(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!isExcludedDir(entry.name)) {
        traverseDirectory(fullPath, fileList);
      }
    } else if (entry.isFile()) {
      if (hasIncludedExtension(entry.name) && !isExcludedFile(entry.name)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}
/**
 * Reduce white space in the content by:
 * 1. Trimming trailing spaces.
 * 2. Removing all blank lines.
 * 3. Preserving leading spaces to maintain indentation.
 * @param {string} content - The original file content.
 * @returns {string} - The processed content with reduced white space.
 */
function reduceWhiteSpace(content) {
  // Split content into lines
  const lines = content.split('\n');
  // Trim trailing spaces from each line without affecting leading spaces
  const trimmedLines = lines.map(line => line.replace(/\s+$/, ''));
  // Remove all blank lines
  const nonEmptyLines = trimmedLines.filter(line => line.trim().length > 0);
  // Join lines back into a single string with a single newline separator
  const processedContent = nonEmptyLines.join('\n');
  return processedContent;
}
/**
 * Combine all eligible files into a single output file with headers.
 * @param {Array} files - List of eligible file paths.
 * @param {string} output - Path to the output file.
 */
function combineFiles(files, output) {
  // Initialize write stream
  const writeStream = fs.createWriteStream(output, { flags: 'w', encoding: 'utf-8' });
  files.forEach((file, index) => {
    const relativePath = path.relative(rootDir, file);
    const header = `===== ${relativePath} =====\n`;
    writeStream.write(header);
    try {
      let content = fs.readFileSync(file, 'utf-8');
      content = reduceWhiteSpace(content); // Reduce white space
      // Write content
      writeStream.write(content);
      // Add a single newline to separate files, except after the last file
      if (index !== files.length - 1) {
        writeStream.write('\n\n');
      }
    } catch (err) {
      const errorMessage = `Error reading ${relativePath}: ${err.message}\n\n`;
      writeStream.write(errorMessage);
      console.error(`Error reading ${relativePath}:`, err.message);
    }
  });
  writeStream.end();
  console.log(`All code has been combined into ${output}`);
}
/**
 * Get compilation mode from user input
 * @returns {Promise<string>} - The selected directory path
 */
function getCompilationMode() {
  return new Promise((resolve) => {
    rl.question('Choose compilation mode (1 for src only, 2 for entire project): ', (answer) => {
      const mode = answer.trim();
      if (mode === '1') {
        console.log('Compiling src directory only...');
        resolve(srcDir);
      } else {
        console.log('Compiling entire project...');
        resolve(rootDir);
      }
    });
  });
}
/**
 * Get the output filename from user input
 * @param {string} mode - The compilation mode (src or full)
 * @returns {Promise<string>} - The output filename
 */
function getOutputFilename(mode) {
  return new Promise((resolve) => {
    const prefix = mode === srcDir ? 'src' : 'full';
    const defaultName = `${prefix}-combined-${currentDateTime}.txt`;
    rl.question(`Enter output filename (press Enter for default: ${defaultName}): `, (answer) => {
      const filename = answer.trim() || defaultName;
      const finalName = filename.endsWith('.txt') ? filename : `${filename}.txt`;
      resolve(path.join(outputDir, finalName));
    });
  });
}
// Modify the main function to handle compilation mode
async function main() {
  const compilationDir = await getCompilationMode();
  const outputFile = await getOutputFilename(compilationDir);
  const allFiles = traverseDirectory(compilationDir);
  // Sort files to ensure consistent order
  allFiles.sort();
  combineFiles(allFiles, outputFile);
  rl.close();
}
// Execute the script
main().catch(console.error);
