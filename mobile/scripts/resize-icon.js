const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'assets/images/icon.png');
const adaptiveOutputPath = path.join(__dirname, 'assets/images/adaptive-icon.png');
const splashOutputPath = path.join(__dirname, 'assets/images/splash-icon.png');

async function processIcons() {
  try {
    console.log('Processing adaptive icon...');
    // For adaptive icon, the safe zone is the central 66% (diameter). 
    // A 1024x1024 image has a safe zone of ~675x675. 
    // We'll resize the logo to 500x500 to be safely inside, then composite onto 1024x1024 transparent.
    await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 } // transparent background
      }
    })
    .composite([
      {
        input: await sharp(inputPath).resize(500, 500, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer(),
        gravity: 'center'
      }
    ])
    .toFile(adaptiveOutputPath);
    
    console.log('Created adaptive-icon.png successfully.');

    console.log('Processing splash icon...');
    // Splash screen icon for Android 12+ should fit within 288x288, but often we just provide a normally padded image
    // Let's create a 1024x1024 splash icon with 400x400 logo inside so it fits perfectly.
    await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([
      {
        input: await sharp(inputPath).resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer(),
        gravity: 'center'
      }
    ])
    .toFile(splashOutputPath);
    
    console.log('Created splash-icon.png successfully.');
  } catch (err) {
    console.error('Error processing icons:', err);
  }
}

processIcons();
