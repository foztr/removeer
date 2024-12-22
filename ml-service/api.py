from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from rembg import remove
from PIL import Image
import io
import os
import gc
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/')
def health_check():
    return jsonify({
        "status": "healthy", 
        "service": "removeer-ml",
        "port": os.environ.get("PORT", 5001)
    }), 200

@app.route('/process', methods=['POST'])
def process_image():
    try:
        # Get the image from the request
        file = request.files.get('image')
        if not file:
            return jsonify({"error": "No image provided"}), 400

        # Read the image
        input_image = Image.open(file.stream)
        
        # Convert to RGB if needed
        if input_image.mode not in ('RGB', 'RGBA'):
            input_image = input_image.convert('RGB')
        
        # Process the image with rembg
        try:
            output_image = remove(input_image)
            # Clear input image from memory
            input_image.close()
            del input_image
        except Exception as e:
            print(f"Error in remove operation: {str(e)}")
            raise
        
        # Save to bytes
        try:
            img_byte_arr = io.BytesIO()
            output_image.save(img_byte_arr, format='PNG', optimize=True)
            img_byte_arr.seek(0)
            
            # Clear output image from memory
            output_image.close()
            del output_image
        except Exception as e:
            print(f"Error saving image: {str(e)}")
            raise
        
        # Force garbage collection
        gc.collect()
        
        return send_file(
            img_byte_arr,
            mimetype='image/png',
            as_attachment=True,
            download_name='removed_bg.png'
        )
    
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        # Force garbage collection on error
        gc.collect()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Development server configuration
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
  