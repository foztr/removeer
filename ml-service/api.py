from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from rembg import remove
from PIL import Image
import io
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/')
def health_check():
    return jsonify({"status": "healthy", "service": "removeer-ml"}), 200

@app.route('/process', methods=['POST'])
def process_image():
    try:
        # Get the image from the request
        file = request.files.get('image')
        if not file:
            return jsonify({"error": "No image provided"}), 400

        # Read the image
        input_image = Image.open(file.stream)
        
        # Process the image with rembg
        output_image = remove(input_image)
        
        # Save to bytes
        img_byte_arr = io.BytesIO()
        output_image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        return send_file(img_byte_arr, mimetype='image/png')
    
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port)
  