const fs = require('fs');
const path = require('path');

// Patterns for common secrets and vulnerabilities
const patterns = {
  GoogleAPIKey: /AIza[0-9A-Za-z-_]{35}/g,
  OpenAIKey: /sk-[a-zA-Z0-9]{48}/g,
  MongoDBURI: /mongodb(?:\+srv)?:\/\/[a-zA-Z0-9-_:]+@[a-zA-Z0-9-_\.]+/g,
  GenericSecret: /(?:secret|password|token|key|pwd)\s*[:=]\s*['"][a-zA-Z0-9\-_]{10,}['"]/gi,
  JWTSecret: /jwt(?:_secret)?\s*[:=]\s*['"][a-zA-Z0-9\-_]+['"]/gi,
  HardcodedBearerToken: /Bearer\s+[a-zA-Z0-9\-\._~+\/]+=*/g,
  PrivateKey: /-----BEGIN PRIVATE KEY-----/g
};

const ignoredDirs = ['node_modules', 'dist', '.git', '.expo', 'build', 'public'];
const results = [];

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!ignoredDirs.includes(file)) {
        scanDir(fullPath);
      }
    } else {
      // Scan common source files
      if (['.js', '.ts', '.tsx', '.jsx', '.cjs', '.mjs', '.json', '.env'].includes(path.extname(file)) || file === '.env.production') {
        scanFile(fullPath);
      }
    }
  }
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      for (const [name, regex] of Object.entries(patterns)) {
        // Reset regex state if global
        regex.lastIndex = 0;
        if (regex.test(line)) {
            // Filter out obvious false positives and mock strings
            if (line.includes("MY_GEMINI_API_KEY") || 
                line.includes("process.env") ||
                line.includes("example") ||
                line.includes("placeholder")) {
                return; // skip this line
            }
            results.push(`[${name}] ${filePath}:${index + 1} => ${line.trim().substring(0, 150)}`);
        }
      }
    });
  } catch(e) {
      // ignore read errors
  }
}

console.log("Scanning codebase for security vulnerabilities...");
scanDir(__dirname);
if (results.length > 0) {
  console.log("🚨 FOUND POTENTIAL SECURITY ISSUES:");
  console.log(results.join('\n'));
} else {
  console.log("✅ No obvious hardcoded secrets found by script.");
}
