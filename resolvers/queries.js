// queries.js

const { legacyConnection, modernPool } = require('../db');

const queries = {
  properties: async () => {
    const legacyProperties = await new Promise((resolve, reject) => {
      legacyConnection.query('SELECT * FROM properties', (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });

    const modernPropertiesRes = await modernPool.query('SELECT * FROM properties');
    const modernProperties = modernPropertiesRes.rows;

    // Map legacy properties to a format that matches the GraphQL type
    const unifiedLegacyProps = legacyProperties.map(prop => ({
      id: prop.id.toString(),
      name: '',  // Default name since it's not in the legacy DB but is non-nullable in the schema
      address: prop.address,
      city: prop.city,
      state: prop.state,
      zip: prop.zip,
      created_at: new Date().toISOString(),  // Default since it's not in the legacy DB but is non-nullable in the schema
      updated_at: null,  // Can be null per your GraphQL schema
      legacy_id: prop.id.toString()
    }));

    // Now, combine the properties. If there are overlaps, prioritize the legacy properties.
    const combinedProperties = [...unifiedLegacyProps];

    for (const modernProp of modernProperties) {
      if (!unifiedLegacyProps.some(legacyProp => legacyProp.legacy_id === modernProp.legacy_id.toString())) {
        combinedProperties.push({
          id: modernProp.id.toString(),
          name: modernProp.name,
          address: modernProp.address,
          city: modernProp.city,
          state: modernProp.state,
          zip: modernProp.zip,
          created_at: modernProp.created_at.toISOString(),
          updated_at: modernProp.updated_at ? modernProp.updated_at.toISOString() : null,
          legacy_id: modernProp.legacy_id ? modernProp.legacy_id.toString() : null
        });
      }
    }

    return combinedProperties;
  }
};

module.exports = queries;
