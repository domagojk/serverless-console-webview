#!/bin/sh
cd build/static/js

counter=1
for file in *.js
do
   extension="${file##*.}"
   cp $file ../../../../serverless-console/resources/webview/build/static/js/main${counter}.${extension}
   let counter++
done

cd ../css

counter=1
for file in *.css
do
   extension="${file##*.}"
   cp $file ../../../../serverless-console/resources/webview/build/static/css/main${counter}.${extension}
   let counter++
done
