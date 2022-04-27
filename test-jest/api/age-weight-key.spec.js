const mockRequest = jest.fn()
const mockRequestFileUpload = jest.fn()
const AgeWeightKeyApi = require('../../src/api/age-weight-key')
const client = require('../../src/api/client')

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
      mockRequest.mockImplementationOnce(() => ({ rows: ['1', '2', '3', '4'] }))
      const result = await AgeWeightKeyApi.getByYear({}, year)
      expect(result).toStrictEqual({ rows: ['1', '2', '3', '4'] })
    })

    it.each([
      ['1996'],
      ['1990'],
      ['2021']
    ])('return Client.request with relevant arguments', async (year) => {
      mockRequest.mockImplementationOnce(() => ({ rows: [null, client.method.GET, 'reporting/reference/grilse-probabilities/' + year] }))
      const result = await AgeWeightKeyApi.getByYear({}, year)
      expect(result).toStrictEqual({ rows: [null, client.method.GET, 'reporting/reference/grilse-probabilities/' + year] })
    })
  })

  describe('postNew', () => {
    it.each([
      ['1996', 'gate', 'file path', true],
      ['1990', 'gates', 'another file path', false],
      ['2021', 'another gate', 'a different file path', true]
    ])('returns Client.requestFileUpload', async (year, gate, filePath, overwrite) => {
      mockRequestFileUpload.mockImplementationOnce(() => ({ rows: ['1', '2', '3', '4'] }))
      const result = await AgeWeightKeyApi.postNew({}, year, gate, filePath, overwrite)
      expect(result).toStrictEqual({ rows: ['1', '2', '3', '4'] })
    })
  })

  it.each([
    ['1996', 'gate', 'file path', true],
    ['1990', 'gates', 'another file path', false],
    ['2021', 'another gate', 'a different file path', true]
  ])('returns Client.requestFileUpload with relevant arguments', async (year, gate, filePath, overwrite) => {
    mockRequestFileUpload.mockImplementationOnce(() => ({ rows: [null, 'reporting/reference/grilse-probabilities/' + year + gate, overwrite, filePath] }))
    const result = await AgeWeightKeyApi.postNew({}, year, gate, filePath, overwrite)
    expect(result).toStrictEqual({ rows: [null, 'reporting/reference/grilse-probabilities/' + year + gate, overwrite, filePath] })
  })
})
