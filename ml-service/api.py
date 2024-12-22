from flask import Flask, request, send_file
from rembg import remove, new_session
from PIL import Image, ImageEnhance, ImageFilter
import io
from flask_cors import CORS
import traceback
import sys
import os
import numpy as np
from scipy import ndimage
import cv2

app = Flask(__name__)
CORS(app)

def preprocess_image(image):
    """Enhance image before background removal"""
    # Convert to RGB if needed
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Apply slight blur to reduce noise
    image = image.filter(ImageFilter.GaussianBlur(radius=0.5))
    
    # Enhance contrast very slightly
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(1.03)
    
    # Enhance sharpness minimally
    enhancer = ImageEnhance.Sharpness(image)
    image = enhancer.enhance(1.05)
    
    return image

def postprocess_image(image):
    """Clean up the output image with enhanced edge processing"""
    # Convert to RGBA if not already
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
    
    # Get image data as numpy array
    data = np.array(image)
    
    # Get alpha channel
    alpha = data[:, :, 3].astype(np.float32)
    
    # Apply bilateral filter to preserve edges while smoothing
    alpha = cv2.bilateralFilter(alpha, 5, 75, 75)
    
    # Create mask for semi-transparent pixels
    semi_transparent = (alpha > 0) & (alpha < 255)
    
    # More gradual threshold for semi-transparent pixels
    # Changed from 128 to handle edges more smoothly
    alpha[semi_transparent & (alpha < 100)] = 0
    alpha[semi_transparent & (alpha >= 100)] = 255
    
    # Optional: Smooth edges slightly
    alpha = ndimage.gaussian_filter(alpha, sigma=0.5)
    
    # Update alpha channel
    data[:, :, 3] = alpha.astype(np.uint8)
    
    # Convert back to PIL Image
    return Image.fromarray(data)

@app.route('/process', methods=['POST'])
def process_image():
    try:
        print("\n=== New Request Received ===")
        
        # Check request
        print("Content-Type:", request.content_type)
        print("Files:", request.files.keys())
        
        if 'image' not in request.files:
            print("No image file in request")
            return {'error': 'No image file in request'}, 400
            
        file = request.files['image']
        if not file:
            print("Empty file received")
            return {'error': 'Empty file received'}, 400

        print(f"Received file: {file.filename}")
        print(f"Content-Type: {file.content_type}")

        # Read image
        try:
            print("Opening image...")
            input_image = Image.open(file.stream)
            print(f"Image opened successfully: size={input_image.size}, mode={input_image.mode}")
            
            # Convert to RGB if needed
            if input_image.mode != 'RGB':
                print(f"Converting image from {input_image.mode} to RGB")
                input_image = input_image.convert('RGB')
            
            # Preprocess image
            print("Preprocessing image...")
            input_image = preprocess_image(input_image)
                
        except Exception as e:
            print(f"Error opening/preprocessing image: {str(e)}")
            traceback.print_exc()
            return {'error': f'Failed to process image: {str(e)}'}, 400

        # Remove background
        try:
            print("Starting background removal...")
            print("This may take a few minutes for large images...")
            
            # Create session with optimized parameters
            session = new_session("u2net")  # Using the high-quality model
            
            # Remove background with adjusted parameters
            output = remove(
                input_image,
                session=session,
                alpha_matting=True,
                alpha_matting_foreground_threshold=220,  # Reduced from 240
                alpha_matting_background_threshold=20,   # Increased from 10
                alpha_matting_erode_size=5,             # Reduced from 10
                post_process_mask=True                   # Added post-processing
            )
            
            # Post-process the output
            output = postprocess_image(output)
            
            print("Background removal completed")
            
        except Exception as e:
            print(f"Error in background removal: {str(e)}")
            traceback.print_exc()
            return {'error': f'Background removal failed: {str(e)}'}, 500

        # Save to bytes
        try:
            print("Saving processed image...")
            img_byte_arr = io.BytesIO()
            output.save(img_byte_arr, format='PNG', optimize=True)
            img_byte_arr.seek(0)
            print("Image saved to bytes successfully")
        except Exception as e:
            print(f"Error saving image: {str(e)}")
            traceback.print_exc()
            return {'error': f'Failed to save processed image: {str(e)}'}, 500

        print("Sending processed image...")
        return send_file(
            img_byte_arr,
            mimetype='image/png',
            as_attachment=True,
            download_name='processed.png'
        )

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        traceback.print_exc()
        return {'error': str(e)}, 500

if __name__ == '__main__':
    print("\n=== ML Service Starting ===")
    print(f"Python version: {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    print("Starting server on http://127.0.0.1:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
  