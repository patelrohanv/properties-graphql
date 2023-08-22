// resolvers/mutations.js

const { legacyConnection, modernPool } = require('../db');

const mutations = {
    createProperty: async (_, args) => {
        // Add to legacy-db (MySQL)
        const legacyInsert = {
          address: args.address,
          city: args.city,
          state: args.state,
          zip: args.zip
        };
        
        const legacyInsertQuery = 'INSERT INTO properties SET ?';
        
        const legacyResult = await new Promise((resolve, reject) => {
          legacyConnection.query(legacyInsertQuery, legacyInsert, (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        });
        
        const insertedLegacyId = legacyResult.insertId.toString();
    
        // Add to modern-db (Postgres)
        const modernInsert = {
          name: args.name,
          address: args.address,
          city: args.city,
          state: args.state,
          zip: args.zip,
          created_at: new Date(),
          legacy_id: insertedLegacyId
        };
        
        const modernInsertQuery = `
          INSERT INTO properties(name, address, city, state, zip, created_at, legacy_id)
          VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *;  
        `;
    
        const modernResult = await modernPool.query(modernInsertQuery, [
          modernInsert.name,
          modernInsert.address,
          modernInsert.city,
          modernInsert.state,
          modernInsert.zip,
          modernInsert.created_at,
          modernInsert.legacy_id
        ]);
    
        const insertedModernProperty = modernResult.rows[0];
    
        // Return new property data
        return {
          id: insertedModernProperty.id.toString(),
          name: insertedModernProperty.name,
          address: insertedModernProperty.address,
          city: insertedModernProperty.city,
          state: insertedModernProperty.state,
          zip: insertedModernProperty.zip,
          created_at: insertedModernProperty.created_at.toISOString(),
          updated_at: insertedModernProperty.updated_at ? insertedModernProperty.updated_at.toISOString() : null,
          legacy_id: insertedModernProperty.legacy_id ? insertedModernProperty.legacy_id.toString() : null
        };
    },
    updateProperty: async (_, args) => {
        const { id, name, address, city, state, zip } = args;

        // Update in legacy-db (MySQL)
        const legacyUpdate = {
            address: address,
            city: city,
            state: state,
            zip: zip
        };
        await new Promise((resolve, reject) => {
            legacyConnection.query('UPDATE properties SET ? WHERE id = ?', [legacyUpdate, id], (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });

        // Update in modern-db (Postgres)
        const modernUpdate = {
            name: name,
            address: address,
            city: city,
            state: state,
            zip: zip
        };
        await modernPool.query('UPDATE properties SET name=$1, address=$2, city=$3, state=$4, zip=$5 WHERE legacy_id=$6', 
        [modernUpdate.name, modernUpdate.address, modernUpdate.city, modernUpdate.state, modernUpdate.zip, id]);

        // Return updated data
        return {
            id: id,
            ...args
        };
    }
};

module.exports = mutations;
