
from tensorflow import keras
from Feature_Extractor import extract_features
import numpy as np


# ------------------------------------------------------------------------

# This function takes the url and returns probability value

def get_prediction(url, model_path):
    print("Loading the model...")
    model = keras.models.load_model(model_path)

    print("Extracting features from url...")
    url_features = extract_features(url)
    print(url_features)

    print("Making prediction...")
    # Convert to numpy array for model compatibility
    url_features_array = np.array([url_features], dtype=np.float32)
    prediction = model.predict(url_features_array, verbose=0)

    i = prediction[0][0] * 100
    i = round(i,3)
    print("There is ",i,"% chance,the url is malicious !")

    return i
