document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    hljs.highlightAll();

    const pythonCode = `
import cv2
import imagehash
import pytesseract
import json
import argparse
import sys
import numpy as np
from PIL import Image
from typing import Dict, Any, Tuple

# --- MODULE DOCUMENTATION ---
# This script, verifyImage.py, is the core of the Offerspy AI verification engine.
# It provides functionalities to analyze an image for several quality and content metrics:
# 1. Blur Detection: Checks if an image is too blurry to be useful.
# 2. Perceptual Hashing: Generates a dHash to identify duplicate or near-duplicate images.
# 3. OCR Text Extraction: Extracts text from the image to find offer details.
#
# It is designed to be called from a backend service (e.g., Node.js) as a command-line tool,
# processing a single image and returning its analysis as a structured JSON object to stdout.
#
# Requirements:
# - Python 3.7+
# - OpenCV-Python
# - ImageHash
# - Pytesseract
# - A Tesseract OCR engine installation (https://github.com/tesseract-ocr/tesseract)
#
# Usage from command line:
# python verifyImage.py --image path/to/your/image.jpg
# ---------------------------

def is_blurry(image: np.ndarray, threshold: int = 100) -> bool:
    """
    Detects if an image is blurry using the variance of the Laplacian.
    A low variance suggests a lack of edges, which is characteristic of a blurry image.

    Args:
        image (np.ndarray): The input image (in grayscale).
        threshold (int): The variance threshold. Images with variance below this
                         value will be considered blurry.

    Returns:
        bool: True if the image is blurry, False otherwise.
    """
    # Compute the Laplacian of the image and then return the variance
    laplacian_var = cv2.Laplacian(image, cv2.CV_64F).var()
    return laplacian_var < threshold

def generate_hash(image_path: str) -> str:
    """
    Generates a perceptual hash (dHash) for an image.
    This hash is robust to minor changes in lighting, compression, and color,
    making it ideal for detecting visually similar images.

    Args:
        image_path (str): The path to the image file.

    Returns:
        str: The generated dHash as a hexadecimal string.
    """
    try:
        img = Image.open(image_path)
        # dHash is fast and effective for duplicate detection
        perceptual_hash = imagehash.dhash(img)
        return str(perceptual_hash)
    except Exception as e:
        # If the image can't be opened, return an error hash or empty string
        return ""

def extract_text_and_confidence(image: np.ndarray) -> Tuple[str, float]:
    """
    Extracts text from an image using Tesseract OCR and calculates the average confidence.
    
    Args:
        image (np.ndarray): The input image (in grayscale).

    Returns:
        Tuple[str, float]: A tuple containing the extracted text as a single string
                           and the average word confidence score (0-100).
    """
    try:
        # Use pytesseract to get detailed data including text, confidence, and position
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT, lang='eng')
        
        words = []
        confidences = []
        
        # Filter out low-confidence words and non-textual elements
        for i in range(len(data['text'])):
            # Confidence is on a scale of 0-100. -1 indicates a non-word segment.
            if int(data['conf'][i]) > 50: # Only consider words with confidence > 50%
                word = data['text'][i].strip()
                if word:
                    words.append(word)
                    confidences.append(int(data['conf'][i]))

        if not confidences:
            return "", 0.0

        full_text = " ".join(words)
        average_confidence = sum(confidences) / len(confidences)
        
        return full_text, round(average_confidence, 2)

    except pytesseract.TesseractNotFoundError:
        sys.stderr.write("Tesseract Error: The Tesseract executable was not found. Please install it and/or set the TESSERACT_CMD environment variable.\\n")
        return "Tesseract not found.", 0.0
    except Exception as e:
        sys.stderr.write(f"An unexpected OCR error occurred: {e}\\n")
        return "", 0.0


def main():
    """
    Main execution function. Parses arguments, runs analyses, and prints JSON output.
    """
    # Set up argument parser to accept the image path from the command line
    parser = argparse.ArgumentParser(description="Analyzes an image for blur, duplicates, and text.")
    parser.add_argument("-i", "--image", required=True, help="Path to the input image file.")
    args = vars(parser.parse_args())

    image_path = args["image"]

    try:
        # Read the image using OpenCV
        image = cv2.imread(image_path)
        if image is None:
            raise FileNotFoundError(f"Image not found or could not be read at path: {image_path}")
        
        # Convert to grayscale for blur detection and OCR, as color is not needed
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    except Exception as e:
        # Handle errors in image loading
        error_result = {
            "blurry": None,
            "duplicate_hash": "",
            "ocrText": "",
            "confidence": 0.0,
            "valid": False,
            "error": str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)

    # --- Perform Analyses ---
    blurry_status = is_blurry(gray_image, threshold=100)
    image_hash = generate_hash(image_path)
    ocr_text, ocr_confidence = extract_text_and_confidence(gray_image)

    # Determine overall validity based on a simple rule set
    # An offer is considered "valid" for processing if it's not blurry and has some readable text.
    is_valid = not blurry_status and ocr_confidence > 50

    # --- Construct Final JSON Output ---
    # This JSON object is the single, standard output of the script.
    final_analysis: Dict[str, Any] = {
        "blurry": blurry_status,
        "duplicate_hash": image_hash,
        "ocrText": ocr_text,
        "confidence": ocr_confidence,
        "valid": is_valid
    }

    # Print the JSON result to standard output
    print(json.dumps(final_analysis, indent=4))

if __name__ == "__main__":
    main()
`;
    document.getElementById('python-code').textContent = pythonCode.trim();

    const requirementsCode = `
# This file lists the Python packages required to run the verifyImage.py script.
# Install them using pip:
# pip install -r requirements.txt

opencv-python==4.9.0.80
imagehash==4.3.1
pytesseract==0.3.10
numpy==1.26.4
Pillow==10.3.0
    `;
    document.getElementById('requirements-code').textContent = requirementsCode.trim();

    hljs.highlightAll();

    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const codeContainer = button.closest('.code-container');
            const codeElement = codeContainer.querySelector('code');
            const textToCopy = codeElement.innerText;

            navigator.clipboard.writeText(textToCopy).then(() => {
                const copyText = button.querySelector('.copy-text');
                const icon = button.querySelector('i');
                
                if (copyText) copyText.textContent = 'Copied!';
                icon.setAttribute('data-lucide', 'check-circle');
                lucide.createIcons();

                setTimeout(() => {
                    if (copyText) copyText.textContent = 'Copy';
                    icon.setAttribute('data-lucide', 'clipboard');
                    lucide.createIcons();
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    });
});
