from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from rembg import remove
from PIL import Image
import io
import os
import gc
import logging
import sys
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure memory limits
MAX_IMAGE_SIZE = 512 * 1024  # 512KB
MAX_IMAGE_DIMENSION = 512     # 512px

app = Flask(__name__)
CORS(app)

def cleanup_memory():
    """Force garbage collection and clear memory"""
    gc.collect()
    if hasattr(sys, 'clear_type_cache'):
        sys.clear_type_cache()
    gc.collect()

def resize_image(image):
    """Resize image if it exceeds maximum dimensions"""
    width, height = image.size
    if width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION:
        # Calculate new dimensions maintaining aspect ratio
        ratio = min(MAX_IMAGE_DIMENSION/width, MAX_IMAGE_DIMENSION/height)
        new_size = (int(width * ratio), int(height * ratio))
        logger.info(f"Resizing image from {image.size} to {new_size}")
        return image.resize(new_size, Image.Resampling.LANCZOS)
    return image

@app.route('/')
def health_check():
    cleanup_memory()
    return jsonify({
        "status": "healthy", 
        "service": "removeer-ml",
        "port": os.environ.get("PORT", 5001)
    }), 200

def validate_image(image):
    """Validate image size"""
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='PNG', optimize=True, quality=85)
    size = img_byte_arr.tell()
    if size > MAX_IMAGE_SIZE:
        raise ValueError(f"Image size exceeds maximum allowed ({MAX_IMAGE_SIZE/1024:.1f}KB)")
    return True

@app.route('/process', methods=['POST'])
def process_image():
    try:
        logger.info("Starting image processing request")
        cleanup_memory()
        
        # Get the image from the request
        file = request.files.get('image')
        if not file:
            logger.error("No image file in request")
            return jsonify({"error": "No image provided"}), 400

        # Read and preprocess the image
        try:
            logger.info("Reading input image")
            input_image = Image.open(file.stream)
            logger.info(f"Input image size: {input_image.size}, mode: {input_image.mode}")
            
            # Convert to RGB if needed
            if input_image.mode not in ('RGB', 'RGBA'):
                logger.info(f"Converting image from {input_image.mode} to RGB")
                input_image = input_image.convert('RGB')
            
            # Resize if needed
            input_image = resize_image(input_image)
            
            # Validate size
            validate_image(input_image)
            
        except ValueError as e:
            logger.error(f"Image validation failed: {str(e)}")
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            raise
        
        # Process the image with rembg
        try:
            logger.info("Processing image with rembg")
            output_image = remove(input_image)
            logger.info("Background removal complete")
            
            # Clear input image from memory
            input_image.close()
            del input_image
            cleanup_memory()
            
        except Exception as e:
            logger.error(f"Error in remove operation: {str(e)}")
            raise
        
        # Save to bytes
        try:
            logger.info("Converting processed image to bytes")
            img_byte_arr = io.BytesIO()
            output_image.save(img_byte_arr, format='PNG', optimize=True, quality=85)
            img_byte_arr.seek(0)
            
            # Clear output image from memory
            output_image.close()
            del output_image
            cleanup_memory()
            
            logger.info("Image processing complete")
            
            return send_file(
                img_byte_arr,
                mimetype='image/png',
                as_attachment=True,
                download_name='removed_bg.png'
            )
            
        except Exception as e:
            logger.error(f"Error saving image: {str(e)}")
            raise
    
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        cleanup_memory()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
  