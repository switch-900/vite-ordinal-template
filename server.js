// server.js
import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/build', (req, res) => {
  const { files } = req.body;
  const projDir = path.resolve(__dirname, 'src', 'ProjecrFiles');
  const outDir = path.resolve(__dirname, 'build-inscription');
  
  // Write current files to disk before building
  if (files) {
    Object.entries(files).forEach(([filename, content]) => {
      const filePath = path.join(projDir, filename);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, content);
    });
  }
  
   // Run Vite build using the project files config
   exec(
    `vite build --config ${path.join(projDir, 'vite.config.js')} --outDir ${outDir} --root ${projDir}`,
    { cwd: projDir },
     (err, stdout, stderr) => {
       if (err) {
         console.error(stderr);
        console.error(stdout);
         return res.status(500).json({ error: stderr });
       }
       try {
         const html = fs.readFileSync(path.join(outDir, 'index.html'), 'utf-8');
         res.send(html);
       } catch (readErr) {
         console.error(readErr);
         res.status(500).json({ error: readErr.message });
       }
     }
   );
});

const port = process.env.BUILD_PORT || 5000;
app.listen(port, () => console.log(`Build server listening on port ${port}`));
