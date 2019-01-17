'use strict'
require('dotenv').config()

const aws = require('./src/lib/aws')

;(async () => {
  try {
    console.log('test report location: ' + await aws.reportLocationExists())
    console.log('test report contents: ' + JSON.stringify(await aws.listReports(), null, 4))
    const x = await aws.getReport('reports/this_is_an_example_report.ods')
    console.log(x)
  } catch (err) {
    console.error('Cannot find report location')
  }
}
)()
