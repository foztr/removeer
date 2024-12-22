import requests
import base64
from PIL import Image, ImageDraw
import io

def test_health():
    url = 'https://removeer-ml.onrender.com/'
    try:
        print("Testing health endpoint...")
        response = requests.get(url, timeout=10)
        print(f"Health Status Code: {response.status_code}")
        print("Health Response:", response.text)
        return response.status_code == 200
    except requests.exceptions.Timeout:
        print("Health check timed out after 10 seconds")
        return False
    except Exception as e:
        print(f"Health check error: {str(e)}")
        return False

def create_test_image():
    # Create a 32x32 white image with a simple black circle
    img = Image.new('RGB', (32, 32), color='white')
    draw = ImageDraw.Draw(img)
    draw.ellipse([8, 8, 24, 24], fill='black')
    return img

def test_ml_service():
    # First check health
    if not test_health():
        print("Health check failed. Service might not be ready.")
        return

    # URL of your deployed ML service
    url = 'https://removeer-ml.onrender.com/process'
    
    # Create a simple test image
    img = create_test_image()
    
    # Convert PIL image to bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG', optimize=True)
    img_byte_arr = img_byte_arr.getvalue()
    
    print(f"Test image size: {len(img_byte_arr)} bytes")
    
    # Prepare the request with the correct format
    files = {
        'image': ('test.png', img_byte_arr, 'image/png')
    }
    
    try:
        # Send request with timeout
        print("\nSending request to ML service...")
        response = requests.post(url, files=files, timeout=90)  # Increased timeout further
        
        # Check response
        if response.status_code == 200:
            print("Success! Service is working.")
            # Save the response image if it's returned
            if 'image' in response.json():
                img_data = base64.b64decode(response.json()['image'])
                with open('response_image.png', 'wb') as f:
                    f.write(img_data)
                print("Processed image saved as 'response_image.png'")
            print("Response:", response.json())
        else:
            print(f"Error: Status code {response.status_code}")
            print("Response:", response.text)
    except requests.exceptions.Timeout:
        print("Request timed out after 90 seconds")
    except Exception as e:
        print(f"Error connecting to service: {str(e)}")

if __name__ == "__main__":
    test_ml_service() 