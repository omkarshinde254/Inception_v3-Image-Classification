from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import HttpResponse
import base64
from PIL import Image
from io import BytesIO
import os

# Image Classification Imports
import numpy as np
from PIL import Image
from imageio import imread
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import tensorflow.compat.v1 as tf
tf.disable_v2_behavior()
import tf_slim as slim
from tf_slim.nets import inception
import tf_slim as slim
import cv2

ckpt_path = os.path.join(current_path, "input/inception_v3.ckpt")
images_path = os.path.join(current_path, "images/*")
img_width = 299
img_height = 299
batch_size = 16
batch_shape = [batch_size, img_height, img_width, 3]
num_classes = 1001
predict_output = []
class_names_path = os.path.join(current_path, "input/imagenet_class_names.txt")
with open(class_names_path) as f:
    class_names = f.readlines()


# To Load Image
def load_images(input_dir):
    global batch_shape
    images = np.zeros(batch_shape)
    filenames = []
    idx = 0
    batch_size = batch_shape[0]
    files = tf.gfile.Glob(input_dir)[:20]
    files.sort()
    for filepath in files:
        with tf.gfile.Open(filepath, "rb") as f:
            imgRaw = np.array(Image.fromarray(imread(f, as_gray=False, pilmode="RGB")).resize((299, 299))).astype(np.float) / 255.0
        # Images for inception classifier are normalized to be in [-1, 1] interval.
        images[idx, :, :, :] = imgRaw * 2.0 - 1.0
        filenames.append(os.path.basename(filepath))
        idx += 1
        if idx == batch_size:
            yield filenames, images
            filenames = []
            images = np.zeros(batch_shape)
            idx = 0
    if idx > 0:
        yield filenames, images


def start_prediction():
    predict_output=[]
    return_arr = []
    X = tf.placeholder(tf.float32, shape=batch_shape)

    with slim.arg_scope(inception.inception_v3_arg_scope()):
        logits, end_points = inception.inception_v3(
            X, num_classes=num_classes, is_training=False
        )

    predictions = end_points["Predictions"]
    saver = tf.train.Saver(slim.get_model_variables())


    session_creator = tf.train.ChiefSessionCreator(
        scaffold=tf.train.Scaffold(saver=saver),
        checkpoint_filename_with_path=ckpt_path,
        master='')

    with tf.train.MonitoredSession(session_creator=session_creator) as sess:
        for filenames, images in load_images(images_path):
            labels = sess.run(predictions, feed_dict={X: images})
            for filename, label, image in zip(filenames, labels, images):
                predict_output.append([filename, label, image])
    
    for x in predict_output:
        out_list = list(x[1])
        topPredict = sorted(range(len(out_list)), key=lambda i: out_list[i], reverse=True)[:5]
        for p in topPredict:
            return_arr.append(class_names[p-1].strip())
    
    return return_arr



def base64_to_image(base64_string):
    # Convert base64 string to PIL Image
    path=os.path.join(os.getcwd(), 'inception_api', 'images', 'example.jpg')
    imgdata = base64.b64decode(base64_string)
    image = Image.open(BytesIO(imgdata))
    image.save(path)

# Create your views here.
@api_view(['POST'])
def get_classification(request):
    classification = {
        'classification': 'dog'
    }
    # print("Got request- ", request.data)
    image = base64_to_image(request.data['image'])
    prediction_output = start_prediction()
    print("prediction_output: ", prediction_output)
    return Response({'status': 'success', 'classification': classification})
    
def index(request):
    return HttpResponse("Hello, world. You're at the inception_api index.")