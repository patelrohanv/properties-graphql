const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Property {
    id: ID!
    name: String
    address: String
    city: String
    state: String
    zip: String
    created_at: String
    updated_at: String
    legacy_id: String
  }
  
  type Query {
    properties: [Property]
  }
  
  type Mutation {
    addProperty(name: String, address: String!, city: String!, state: String!, zip: String!): Property
  }  
`;

module.exports = typeDefs;
