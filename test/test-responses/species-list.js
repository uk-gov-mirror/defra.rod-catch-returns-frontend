module.exports = {
  '_embedded': {
    'species': [
      {
        'id': 1,
        'name': 'Salmon',
        '_created': '2018-08-28T15:23:00.000+0000',
        '_last_modified': '2018-08-28T15:23:00.000+0000',
        '_links': {
          'self': {
            'href': 'http://localhost:9580/api/species/1'
          },
          'species': {
            'href': 'http://localhost:9580/api/species/1'
          }
        }
      },
      {
        'id': 2,
        'name': 'Sea Trout',
        '_created': '2018-08-28T15:23:00.000+0000',
        '_last_modified': '2018-08-28T15:23:00.000+0000',
        '_links': {
          'self': {
            'href': 'http://localhost:9580/api/species/2'
          },
          'species': {
            'href': 'http://localhost:9580/api/species/2'
          }
        }
      }
    ]
  },
  '_links': {
    'self': {
      'href': 'http://localhost:9580/api/species'
    },
    'profile': {
      'href': 'http://localhost:9580/api/profile/species'
    }
  }
}
