#!/usr/bin/python
from PIL import Image
import os, sys
from os.path import isfile, join

path = os.getcwd()+'/original/'
print(path)
dirs = os.listdir(path)

for f in dirs:
    print(f)

    # Opens a image in RGB mode
    im = Image.open(path+f)
    newsize = (540, 360)
    im = im.resize(newsize)
    # Shows the image in image viewer
    im.save('tested.jp2', "JPEG2000")
