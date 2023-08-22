// index.js

const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const typeDefs = require('./schema');
const resolvers = require('./resolvers/resolvers');

// Initialize Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Initialize Express App
const app = express();

// Start Apollo Server and Apply Apollo Server Middleware to Express App
(async () => {
    await server.start();
    server.applyMiddleware({ app });

    // Start Express Server
    app.listen({ port: 4000 }, () => {
      console.log(`🚀 GraphQL Server ready at http://localhost:4000${server.graphqlPath}`);
    });
})();
