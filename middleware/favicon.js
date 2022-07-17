const fs = require('fs');
const pngToIco = require('png-to-ico');
const sharp = require('sharp');
const sizeOf = require('image-size');
const AWS = require('aws-sdk');
const imageUpload = require('./imageUpload');
const config = require('../middleware/config');
const s3Info = config.getS3();

const { accessKeyId, secretAccessKey, region, bucket, host, endpoint } = s3Info;

const spacesEndpoint = new AWS.Endpoint(endpoint);
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId,
    secretAccessKey,
    region,
    bucket,
});

const faviconUpload = async (image, size, fileName) => {
  try {
    sharp(image.buffer).resize(size).toBuffer((err, data, info) => {
      const json = {
        originalname: `${size}.png`,
        buffer: data,
      }
      imageUpload(json, 'assets', fileName);
    });
  } catch (e) {
    console.error(e);
  }
};

const favicon = async (image) => {
  try {
    const imageSize = await sizeOf(image.buffer);
    if (imageSize.width >= 500 && imageSize.height >= 500 && imageSize.width === imageSize.height) {
      // 파비콘 생성
      const key = await imageUpload(image, 'assets');
      // favicon
      faviconUpload(image, 512, 'favicon-512x512.png');
      faviconUpload(image, 300, 'favicon-300x300.png');
      // faviconUpload(image, 192, 'favicon-192x192.png');
      faviconUpload(image, 180, 'favicon-180x180.png');
      // faviconUpload(image, 144, 'favicon-144x144.png');
      faviconUpload(image, 96, 'favicon-96x96.png');
      // faviconUpload(image, 72, 'favicon-72x72.png');
      // faviconUpload(image, 48, 'favicon-48x48.png');
      faviconUpload(image, 32, 'favicon-32x32.png');
      faviconUpload(image, 16, 'favicon-16x16.png');
      return {
        status: true,
        key,
      };
    } else {
      return {
        status: false,
      }
    }
  } catch (e) {
    console.error(e);
  }
};

module.exports = favicon;