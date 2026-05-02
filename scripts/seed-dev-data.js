require('dotenv').config()

const { MongoClient, ObjectId } = require('mongodb')

const officialMaps = [
  {
    _id: '6185df7a7b54baf63473a53e',
    name: 'World',
    description: 'The classic game mode we all love, any country is fair game!',
    previewImg: 'official15.jpg',
    locations: [
      { lat: 35.6595, lng: 139.7005, countryCode: 'JP' },
      { lat: 48.8584, lng: 2.2945, countryCode: 'FR' },
      { lat: -33.8568, lng: 151.2153, countryCode: 'AU' },
      { lat: 40.6892, lng: -74.0445, countryCode: 'US' },
      { lat: -22.9519, lng: -43.2105, countryCode: 'BR' },
    ],
  },
  {
    _id: '6185dfd47b54baf63473a540',
    name: 'Famous Landmarks',
    description: 'Explore the greatest sights our world has to offer.',
    previewImg: 'official24.jpg',
    locations: [
      { lat: 27.1751, lng: 78.0421, countryCode: 'IN' },
      { lat: 41.8902, lng: 12.4922, countryCode: 'IT' },
      { lat: 51.5007, lng: -0.1246, countryCode: 'GB' },
      { lat: 37.8199, lng: -122.4783, countryCode: 'US' },
      { lat: 29.9792, lng: 31.1342, countryCode: 'EG' },
    ],
  },
  {
    _id: '6185dff27b54baf63473a541',
    name: 'Canada',
    description: 'Good ol Canada eh, explore The Great White North!',
    previewImg: 'official23.jpg',
    locations: [
      { lat: 43.6426, lng: -79.3871, countryCode: 'CA' },
      { lat: 49.2827, lng: -123.1207, countryCode: 'CA' },
      { lat: 45.5017, lng: -73.5673, countryCode: 'CA' },
      { lat: 51.0447, lng: -114.0719, countryCode: 'CA' },
      { lat: 46.8139, lng: -71.208, countryCode: 'CA' },
    ],
  },
  {
    _id: '6185e0077b54baf63473a542',
    name: 'United States',
    description: 'The land of the free! 50 states of locations waiting for you.',
    previewImg: 'official4.jpg',
    locations: [
      { lat: 40.758, lng: -73.9855, countryCode: 'US' },
      { lat: 34.0522, lng: -118.2437, countryCode: 'US' },
      { lat: 41.8781, lng: -87.6298, countryCode: 'US' },
      { lat: 29.7604, lng: -95.3698, countryCode: 'US' },
      { lat: 47.6062, lng: -122.3321, countryCode: 'US' },
    ],
  },
]

const getBounds = (locations) => ({
  min: {
    lat: Math.min(...locations.map((location) => location.lat)),
    lng: Math.min(...locations.map((location) => location.lng)),
  },
  max: {
    lat: Math.max(...locations.map((location) => location.lat)),
    lng: Math.max(...locations.map((location) => location.lng)),
  },
})

const seed = async () => {
  if (!process.env.MONGO_URI || !process.env.DB_NAME) {
    throw new Error('MONGO_URI and DB_NAME are required')
  }

  const client = new MongoClient(process.env.MONGO_URI)
  await client.connect()

  const db = client.db(process.env.DB_NAME)
  const maps = db.collection('maps')
  const locations = db.collection('locations')

  for (const map of officialMaps) {
    const mapId = new ObjectId(map._id)
    const locationDocs = map.locations.map((location) => ({ ...location, mapId }))

    await maps.updateOne(
      { _id: mapId },
      {
        $set: {
          name: map.name,
          description: map.description,
          previewImg: map.previewImg,
          creator: 'GeoHub',
          isPublished: true,
          isDeleted: false,
          avgScore: 0,
          usersPlayed: 0,
          locationCount: locationDocs.length,
          bounds: getBounds(locationDocs),
          scoreFactor: 2000,
          lastUpdatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )

    await locations.deleteMany({ mapId })
    await locations.insertMany(locationDocs)
  }

  await client.close()
  console.log(`Seeded ${officialMaps.length} official maps and ${officialMaps.length * 5} locations`)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
