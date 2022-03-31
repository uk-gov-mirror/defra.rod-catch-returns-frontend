const mockRequest = jest.fn()
const mockRequestFileUpload = jest.fn()
const AgeWeightKeyApi = require('../../src/api/age-weight-key')
const Client = require('../../src/api/client')

jest.mock('../../src/api/client', () => {
  const originalModule = jest.requireActual('../../src/api/client')
  return {
    ...originalModule,
    request: mockRequest,
    requestFileUpload: mockRequestFileUpload
  }
})

describe('age-weight-key', () => {
  beforeEach(jest.clearAllMocks)

  describe('getByYear', () => {
    it.each([
      ['1996'],
      ['1990'],
      ['2021']
    ])('return Client.request', async (year) => {
      mockRequest.mockImplementationOnce(() => ({ }))
      await AgeWeightKeyApi.getByYear({}, year)
      expect(mockRequest).toBeCalledWith(null, Client.method.GET, `reporting/reference/grilse-probabilities/${year}`)
    })
  })

  describe('postNew', () => {
    it.each([
      ['1996', 'gate', 'file path', true],
      ['1990', 'gates', 'another file path', false],
      ['2021', 'another gate', 'a different file path', true]
    ])('returns Client.requestFileUpload', async (year, gate, filePath, overwrite) => {
      mockRequestFileUpload.mockImplementationOnce(() => ({ }))
      await AgeWeightKeyApi.postNew({}, year, gate, filePath, overwrite)
      expect(mockRequestFileUpload).toBeCalledWith(null, `reporting/reference/grilse-probabilities/${year}/${gate}`, `overwrite=${overwrite}`, filePath)
    })
  })
})
