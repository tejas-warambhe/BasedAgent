import * as fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';
import * as path from 'path';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

async function createBucket(bucketName: string) {

    const creeateBucket = await fetch(`${API_BASE_URL}/buckets/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bucketName }),
    });
    const parseRes = await creeateBucket.json();
    console.log(parseRes);
}

async function uploadFile(bucketName: string, filePath: string) {
    const form = new FormData();
    form.append('file', fs.createReadStream('cow.txt'));
    
    try {
      const response = await axios.post(`${API_BASE_URL}/buckets/${bucketName}/files`, form, {
        headers: form.getHeaders(),
      });
      console.log(response.data);
    } catch (error: any) {
      console.error(error.response ? error.response.data : error.message);
    }
  }


async function downloadFile(bucketName: string, fileName: string, outputDir: string): Promise<void> {
    try {
      // Ensure output directory exists
      fs.mkdirSync(outputDir, { recursive: true });
  
      const response = await fetch(`${API_BASE_URL}/buckets/${bucketName}/files/${fileName}/download`, {
        method: 'GET',
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const outputPath = path.join(outputDir, fileName);
      
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`File downloaded: ${fileName} to ${outputPath}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Download error:', error.message);
      } else {
        console.error('An unknown error occurred during file download');
      }
    }
  }

export { uploadFile, downloadFile, createBucket };