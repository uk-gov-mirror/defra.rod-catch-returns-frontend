'use strict'

/**
 * Handle the s3 bucket functions used for the FMT reports
 */
const { logger } = require('defra-logging-facade')
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const Url = require('url')

// If the proxy details are set up then include them in the AWS configuration
if (Object.keys(process.env).filter(k => /PROXY_.*/.test(k)).length === 3) {
  try {
    const proxy = require('proxy-agent')

    const url = Url.format({
      protocol: process.env.PROXY_SCHEME,
      hostname: process.env.PROXY_HOST,
      port: process.env.PROXY_PORT
    })

    AWS.config.update({
      httpOptions: {
        agent: proxy(url)
      }
    })
  } catch (err) {
    logger.error('Bad proxy specification')
  }
}

// Convert the file name to a description
const fileNameToDesc = (filename) => {
  const desc = filename.replace(process.env.REPORTS_S3_LOCATION_FOLDER + '/', '').replace(/_/g, ' ').split('.')[0]
  return desc.charAt(0).toUpperCase() + desc.substr(1).toLowerCase()
}

/*
 * Get the report metadata for a given key. Use either a description tag
 * Or convert the filename to a description
 */
const getReportMetadata = (key) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.REPORTS_S3_LOCATION_BUCKET,
      Key: key
    }

    s3.getObjectTagging(params, (err, data) => {
      if (err) {
        reject(err)
      }
      const descTag = data.TagSet.find(k => k.Key.toLowerCase() === 'description')
      resolve({
        key: key,
        description: descTag ? descTag.Value.trim() : fileNameToDesc(key)
      })
    })
  })
}

module.exports = {
  // Test that the specified S3 bucket exists
  reportLocationExists: () => {
    return new Promise((resolve, reject) => {
      s3.headBucket({ Bucket: process.env.REPORTS_S3_LOCATION_BUCKET }, function (err) {
        if (err) {
          reject(err)
        }

        resolve(process.env.REPORTS_S3_LOCATION_BUCKET)
      })
    })
  },

  // List the available reports in the specified location.
  listReports: () => {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: process.env.REPORTS_S3_LOCATION_BUCKET,
        Prefix: process.env.REPORTS_S3_LOCATION_FOLDER,
        StartAfter: process.env.REPORTS_S3_LOCATION_FOLDER + '/'
      }

      s3.listObjectsV2(params, (err, data) => {
        if (err) {
          reject(err)
        }

        Promise.all(data.Contents.map(c => getReportMetadata(c.Key))).then((details) => {
          resolve(details)
        })
      })
    })
  },

  // Get a report by key
  getReport: (key) => {
    return new Promise((resolve, reject) => {
      var params = {
        Bucket: process.env.REPORTS_S3_LOCATION_BUCKET,
        Key: key
      }
      s3.getObject(params, (err, data) => {
        if (err) {
          reject(err)
        }

        resolve(data)
      })
    })
  }
}
