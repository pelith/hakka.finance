import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const projectGalaxyClient = new ApolloClient({
  link: new HttpLink({
    uri: import.meta.env.VITE_PROJECT_GALAXY_ENDPOINT,
    fetch,
  }),
  cache: new InMemoryCache(),
});

export default projectGalaxyClient;
