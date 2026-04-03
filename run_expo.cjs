process.chdir('./mobile');
require('child_process').execSync('npx expo start -c', { stdio: 'inherit' });
