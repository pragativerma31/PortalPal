# captcha_handler.py

# import os
# import csv
# import shutil
import numpy as np
from PIL import Image
from keras.models import load_model
from selenium.webdriver.chrome.webdriver import WebDriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
# from datetime import datetime

from Backend.core.config import FRAME_BANNER

# Characters used in CAPTCHA
CHARACTER_SET = "0123456789"
NUM_CLASSES = len(CHARACTER_SET)

# Load the trained model (ensure this path is correct)
MODEL_PATH = r"C:\python\nsut attendance scrapper\Backend\controllers\model\captcha_model.keras"
model = load_model(MODEL_PATH,compile=False);


# DATASET_FOLDER = r"C:\python\automatic dataset collection\captcha dataset"   # Update this if needed
# LABEL_FILE = os.path.join(r"C:\python\automatic dataset collection", "labels.csv")

# def save_captcha_for_retraining(image_path, label_text):
#     try:
#         # Ensure dataset folder exists
#         os.makedirs(DATASET_FOLDER, exist_ok=True)

#         # Generate unique filename using timestamp
#         timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
#         filename = f"captcha_{timestamp}.png"
#         saved_path = os.path.join(DATASET_FOLDER, filename)

#         # Copy image to dataset folder
#         shutil.copy(image_path, saved_path)

#         # Append label to CSV
#         write_header = not os.path.exists(LABEL_FILE)
#         with open(LABEL_FILE, mode='a', newline='') as csvfile:
#             writer = csv.writer(csvfile)
#             if write_header:
#                 writer.writerow(["filename", "label"])
#             writer.writerow([filename, label_text])

#         print(f"[✓] CAPTCHA saved for retraining as {filename} with label '{label_text}'")

#     except Exception as e:
#         print("[x] Failed to save CAPTCHA for retraining:", e)


def preprocess_captcha(image_path):
    img = Image.open(image_path).convert("L")  # grayscale
    img = img.resize((200, 80))                # same size as training
    img = np.array(img) / 255.0                # normalize
    img = img.reshape(1, 80, 200, 1)            # add batch & channel dims
    return img

def decode_prediction(prediction):
    predicted_text = ''
    for i in prediction:
        predicted_class = np.argmax(i)
        predicted_text += CHARACTER_SET[predicted_class]
    return predicted_text

def handle_captcha(driver: WebDriver):
    try:
        # Step 1: Locate CAPTCHA and take screenshot
        captcha_img = driver.find_element(By.ID, "captchaimg")
        captcha_src = captcha_img.get_attribute("src")


        driver.execute_script("window.open(arguments[0]);", captcha_src)
        driver.switch_to.window(driver.window_handles[1])
        WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.TAG_NAME, "img")))
        # timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        # captcha_filename = f"captcha_{timestamp}.png"
        driver.find_element(By.TAG_NAME, "img").screenshot("captcha.png")
        driver.close()

        # Switch back to original tab and frame
        driver.switch_to.window(driver.window_handles[0])
        driver.switch_to.frame(FRAME_BANNER)

        # Step 2: Predict CAPTCHA using model
        input_image = preprocess_captcha("captcha.png")
        prediction = model.predict(input_image)
        predicted_text = decode_prediction(prediction)

        print(f"[✓] Predicted CAPTCHA: {predicted_text}")
        return predicted_text

    except Exception as e:
        print("[x] CAPTCHA handling failed:", e)
        return None


