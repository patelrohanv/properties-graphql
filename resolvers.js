const { legacyConnection, modernPool } = require('./db');

const resolvers = {
    Query: {
      properties: async () => {
        const legacyProperties = await new Promise((resolve, reject) => {
          legacyConnection.query('SELECT * FROM properties', (error, results) => {
            if (error) reject(error);
            resolve(results);
          });
        });
  
        const modernPropertiesRes = await modernPool.query('SELECT * FROM properties');
        const modernProperties = modernPropertiesRes.rows;
  
        // Convert legacy properties to a unified format
        const unifiedLegacyProps = legacyProperties.map(prop => ({
          id: prop.id.toString(),
          name: null,
          address: prop.address,
          city: prop.city,
          state: prop.state,
          zip: prop.zip,
          created_at: null,
          updated_at: null,
          legacy_id: prop.id.toString()
        }));
  
        const allProperties = [...unifiedLegacyProps, ...modernProperties];
  
        return allProperties;
      },
    },
  
    Mutation: {
      addProperty: async (_, args) => {
        // Add to legacy-db (MySQL)
        const legacyInsert = {
          address: args.address,
          city: args.city,
          state: args.state,
          zip: args.zip
        };
        let legacyId;
        legacyConnection.query('INSERT INTO properties SET ?', legacyInsert, (error, results) => {
          if (error) throw new Error('Error inserting into legacy-db');
          legacyId = results.insertId;
        });
  
        // Add to modern-db (Postgres)
        const modernInsert = {
          name: args.name,
          address: args.address,
          city: args.city,
          state: args.state,
          zip: args.zip,
          legacy_id: legacyId.toString()
        };
        await modernPool.query('INSERT INTO properties(name, address, city, state, zip, legacy_id) VALUES($1, $2, $3, $4, $5, $6)', 
        [modernInsert.name, modernInsert.address, modernInsert.city, modernInsert.state, modernInsert.zip, modernInsert.legacy_id]);
  
        return {
          id: legacyId.toString(),
          ...args
        };
      },
    }
  };
  
module.exports = resolvers;