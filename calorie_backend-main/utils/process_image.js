import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';


dotenv.config();
const __dirname = dirname(fileURLToPath(import.meta.url));

const processImageWithYOLO = (imagePath) => {
    const pythonScriptPath = join(__dirname, './process_image.py');
    const modelPath = join(__dirname, './best.pt');
  
    if (!fs.existsSync(imagePath)) throw new Error('Image file not found');
    if (!fs.existsSync(pythonScriptPath)) throw new Error('Python script not found');
    if (!fs.existsSync(modelPath)) throw new Error('Model not found');
  
    return new Promise((resolve, reject) => {
      const envVars = { ...process.env, PYTHONPATH: __dirname };
  
      const child = spawn('python', [pythonScriptPath, imagePath], { env: envVars });
  
      let stdoutData = '';
      child.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });
  
      child.stderr.on('data', (data) => {
        console.error('Python error:', data.toString());
      });
  
      child.on('close', (code) => {
        if (code !== 0) return reject(new Error('Python process failed'));
        try {
          const result = JSON.parse(stdoutData.trim().split('\n').pop());
          resolve(result);
        } catch (err) {
          reject(new Error('Failed to parse YOLO results'));
        }
      });
    });
  };
  

export default processImageWithYOLO;
