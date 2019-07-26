'use strict'
/**
 * Display the age weight key error breakdown page
 */
const BaseHandler = require('./base')

module.exports = class AgeWeightKeyErrorBreakdownHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Get handler for age weight key error breakdown
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */

  static buildErrorItemsObject (errorsObject) {
    let errorItems = []
    let errorTypes = Object.keys(errorsObject)

    errorTypes.forEach(a => {
      let aTypes = Object.keys(errorsObject[a])
      switch (a) {
        case 'generalErrors':
          errorsObject[a].forEach(b => {
            switch (b) {
              case 'INVALID_CSV':
                errorItems.push({
                  type: 'Invalid csv',
                  message: 'File has .csv formatting issues. Check for missing commas, extra commas, or improper use of quotes.'
                })
                break

              default:
            }
          })
          break

        case 'headerErrors':
          aTypes.forEach(b => {
            switch (b) {
              case 'MISSING_REQUIRED':
                errorsObject[a][b].forEach(c => {
                  errorItems.push({
                    type: 'Missing required',
                    message: `File is missing a required column header ('${c}'). Column headers 'Weight' and at least one month of the year must exist (for example: Weight, April).`
                  })
                })
                break

              case 'COLUMN_DISALLOWED':
                errorsObject[a][b].forEach(c => {
                  errorItems.push({
                    type: 'Column disallowed',
                    message: `Column header '${c}' is not allowed. Column headers can only be 'Weight' or a month of the year (for example: July).`
                  })
                })
                break

              case 'DUPLICATE_HEADERS':
                errorsObject[a][b].forEach(c => {
                  errorItems.push({
                    type: 'Duplicate header',
                    message: `File contains a duplicate column header ('${c}'). Remove or change the duplicate header.`
                  })
                })
                break

              default:
            }
          })
          break

        case 'errorsByRow':
          aTypes.forEach(b => {
            switch (b) {
              case 'ROW_HEADER_DISCREPANCY':
                errorsObject[a][b].forEach(c => {
                  errorItems.push({
                    type: 'Row header discrepancy',
                    message: `Row ${c} contains too many or too few columns compared to the number of column headers.`
                  })
                })
                break

              default:
            }
          })
          break

        case 'errorsByColumnAndRowNumber':
          aTypes.forEach(b => {
            let bTypes = Object.keys(errorsObject[a][b])
            switch (b) {
              case 'DUPLICATE':
                bTypes.forEach(c => {
                  errorsObject[a][b][c].forEach(d => {
                    errorItems.push({
                      type: 'Not whole number',
                      message: `File contains a duplicate weight in row ${d}. Remove or change the duplicate weight.`
                    })
                  })
                })
                break

              case 'NOT_WHOLE_NUMBER':
                bTypes.forEach(c => {
                  errorsObject[a][b][c].forEach(d => {
                    errorItems.push({
                      type: 'Not whole number',
                      message: `Weight must be a whole number. Change weight in row ${d} to a whole number`
                    })
                  })
                })
                break

              case 'INVALID_PROBABILITY':
                bTypes.forEach(c => {
                  errorsObject[a][b][c].forEach(d => {
                    errorItems.push({
                      type: 'Invalid probability',
                      message: `Probability must be a number between 0 and 1 (inclusive). Change ${c} row ${d} to a number between 0 and 1 (inclusive).`
                    })
                  })
                })
                break

              default:
            }
          })
          break

        default:
      }
    })

    return errorItems
  }

  async doGet (request, h) {
    let cache = await request.cache().get()
    let errorsObject = cache.errors[0].message
    let errorItems = AgeWeightKeyErrorBreakdownHandler.buildErrorItemsObject(errorsObject)
    let filename = cache.payload.upload.filename

    return this.readCacheAndDisplayView(request, h, { errorItems, filename })
  }
}
