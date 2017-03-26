module.exports = {
  results: [],
  tags: {
    tags: {},
    showAddField: false,
    loaded: false
  },
  datasources: { shown: false, loaded: false, list: [] },
  detailshown: false,
  autocompleteshown: false,
  currentsearch: {
    query: '',
    tagquery: null,
    tags: []
  },
  contentserver: require('./lib/contentServer')(C.DATASOURCES_PATH),
  collectioncount: 0,
  selection: {
    reference: null,
    list: [],
    lookup: {},
    downloaded: 'loading'
  },
  reader: {
    visible: false,
    paper: null
  },
  notes: {},
  downloads: {
    totalspeed: 0,
    list: [],
    lookup: {}
  },
  online: false,
  initialising: false
}
