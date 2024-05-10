import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('None');

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const applyFilter = () => {
    if (!originalImage) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      context.drawImage(img, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      switch (selectedFilter) {
        case 'GaussianBlur':
          applyGaussianBlur(data, canvas.width, canvas.height);
          break;
        case 'Sobel':
          applySobelEdgeDetection(data, canvas.width, canvas.height);
          break;
        case 'Prewitt':
          applyPrewittEdgeDetection(data, canvas.width, canvas.height);
          break;
        case 'MedianFilter':
          applyMedianFilter(data, canvas.width, canvas.height);
          break;
        default:
          break;
      }

      context.putImageData(imageData, 0, 0);
      setProcessedImage(canvas.toDataURL());
    };

    img.src = originalImage;
  };

  const applyGaussianBlur = (data, width, height) => {
    const kernel = [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1]
    ];
  
    const kernelSize = 3;
    const kernelWeight = 16;
  
    const blurredData = new Uint8ClampedArray(data.length);
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0,
          g = 0,
          b = 0;
  
        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const offsetX = x + kx - 1;
            const offsetY = y + ky - 1;
  
            if (offsetX >= 0 && offsetX < width && offsetY >= 0 && offsetY < height) {
              const offset = (offsetY * width + offsetX) * 4;
              const weight = kernel[ky][kx];
  
              r += data[offset] * weight;
              g += data[offset + 1] * weight;
              b += data[offset + 2] * weight;
            }
          }
        }
  
        const offset = (y * width + x) * 4;
        blurredData[offset] = r / kernelWeight;
        blurredData[offset + 1] = g / kernelWeight;
        blurredData[offset + 2] = b / kernelWeight;
        blurredData[offset + 3] = data[offset + 3];
      }
    }
  
    for (let i = 0; i < data.length; i++) {
      data[i] = blurredData[i];
    }
  };

  const applySobelEdgeDetection = (data, width, height) => {
    // Sobel operator for horizontal and vertical gradients
    const sobelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ];
  
    const sobelY = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ];
  
    // Create an array to store the results of edge detection
    const sobelData = new Uint8ClampedArray(data.length);
  
    // Loop through each pixel in the image
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Initialize the gradient values for both directions
        let gradientX = 0;
        let gradientY = 0;
  
        // Apply the Sobel operator to the surrounding pixels
        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            // Calculate the pixel coordinates
            const offsetX = x + kx - 1;
            const offsetY = y + ky - 1;
  
            // Ensure the pixel coordinates are within the image boundaries
            if (offsetX >= 0 && offsetX < width && offsetY >= 0 && offsetY < height) {
              // Get the color intensity of the current pixel
              const intensity = data[(offsetY * width + offsetX) * 4];
  
              // Apply the horizontal Sobel operator
              gradientX += sobelX[ky][kx] * intensity;
  
              // Apply the vertical Sobel operator
              gradientY += sobelY[ky][kx] * intensity;
            }
          }
        }
  
        // Calculate the gradient magnitude
        const magnitude = Math.sqrt(gradientX * gradientX + gradientY * gradientY);
  
        // Set the pixel value in the sobelData array
        const index = (y * width + x) * 4;
        sobelData[index] = magnitude; // R channel
        sobelData[index + 1] = magnitude; // G channel
        sobelData[index + 2] = magnitude; // B channel
        sobelData[index + 3] = data[index + 3]; // Alpha channel
      }
    }
  
    // Copy the results back to the original data array
    for (let i = 0; i < data.length; i++) {
      data[i] = sobelData[i];
    }
  };
  
  const applyPrewittEdgeDetection = (data, width, height) => {
    // Prewitt operator for horizontal and vertical gradients
    const prewittX = [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1]
    ];
  
    const prewittY = [
      [-1, -1, -1],
      [0, 0, 0],
      [1, 1, 1]
    ];
  
    // Create an array to store the results of edge detection
    const prewittData = new Uint8ClampedArray(data.length);
  
    // Loop through each pixel in the image
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Initialize the gradient values for both directions
        let gradientX = 0;
        let gradientY = 0;
  
        // Apply the Prewitt operator to the surrounding pixels
        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            // Calculate the pixel coordinates
            const offsetX = x + kx - 1;
            const offsetY = y + ky - 1;
  
            // Ensure the pixel coordinates are within the image boundaries
            if (offsetX >= 0 && offsetX < width && offsetY >= 0 && offsetY < height) {
              // Get the color intensity of the current pixel
              const intensity = data[(offsetY * width + offsetX) * 4];
  
              // Apply the horizontal Prewitt operator
              gradientX += prewittX[ky][kx] * intensity;
  
              // Apply the vertical Prewitt operator
              gradientY += prewittY[ky][kx] * intensity;
            }
          }
        }
  
        // Calculate the gradient magnitude
        const magnitude = Math.sqrt(gradientX * gradientX + gradientY * gradientY);
  
        // Set the pixel value in the prewittData array
        const index = (y * width + x) * 4;
        prewittData[index] = magnitude; // R channel
        prewittData[index + 1] = magnitude; // G channel
        prewittData[index + 2] = magnitude; // B channel
        prewittData[index + 3] = data[index + 3]; // Alpha channel
      }
    }
  
    // Copy the results back to the original data array
    for (let i = 0; i < data.length; i++) {
      data[i] = prewittData[i];
    }
  };
  

  const applyMedianFilter = (data, width, height) => {
    // Create an array to store the results of the median filter
    const medianFilteredData = new Uint8ClampedArray(data.length);
  
    // Define the size of the filter window (3x3 in this case)
    const filterSize = 3;
  
    // Loop through each pixel in the image
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Create an array to store pixel values within the filter window
        const windowPixels = [];
  
        // Loop through the filter window
        for (let ky = 0; ky < filterSize; ky++) {
          for (let kx = 0; kx < filterSize; kx++) {
            // Calculate the coordinates of the pixel in the window
            const offsetX = x + kx - Math.floor(filterSize / 2);
            const offsetY = y + ky - Math.floor(filterSize / 2);
  
            // Ensure the coordinates are within the image boundaries
            if (offsetX >= 0 && offsetX < width && offsetY >= 0 && offsetY < height) {
              // Calculate the index of the pixel in the image data array
              const index = (offsetY * width + offsetX) * 4;
  
              // Push the pixel intensity into the windowPixels array
              windowPixels.push(data[index]);
            }
          }
        }
  
        // Sort the windowPixels array to find the median value
        windowPixels.sort((a, b) => a - b);
        const medianIndex = Math.floor(windowPixels.length / 2);
        const medianValue = windowPixels[medianIndex];
  
        // Set the median value as the intensity for the current pixel
        const currentIndex = (y * width + x) * 4;
        medianFilteredData[currentIndex] = medianValue; // R channel
        medianFilteredData[currentIndex + 1] = medianValue; // G channel
        medianFilteredData[currentIndex + 2] = medianValue; // B channel
        medianFilteredData[currentIndex + 3] = data[currentIndex + 3]; // Alpha channel
      }
    }
  
    // Copy the results back to the original data array
    for (let i = 0; i < data.length; i++) {
      data[i] = medianFilteredData[i];
    }
  };
  
  return (<>
<div class="navbar">
  <h1 class="heading">Image Processing App</h1>
  <div class="filter-section">
    <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} >
      <option value="None">Select Filter</option>
      <option value="GaussianBlur">Gaussian Blur</option>
      <option value="Sobel">Sobel Edge Detection</option>
      <option value="Prewitt">Prewitt Edge Detection</option>
      <option value="MedianFilter">Median Filter</option>
    </select>
    <button class="apply-btn" onClick={applyFilter}>Apply Filter</button>
  </div>
  <div class="upload-section">
    <input type="file" accept="image/*" onChange={handleImageUpload} />
  </div>
</div>
<div class="container">
  <div class="image-section">
    {originalImage && (
      <div class="image-container">
        <h2 class="sub-heading">Original Image</h2>
        <img src={originalImage} alt="Original" class="image" />
      </div>
    )}
    {processedImage && (
      <div class="image-container">
        <h2 class="sub-heading">Processed Image</h2>
        <img src={processedImage} alt="Processed" class="image" />
      </div>
    )}
  </div>
</div>
</>
  );
};

export default App;
