export const PublicationMappingQuery = `query ($namespaceId: Int!, $siteUrl: String!) {
    publicationMapping(namespaceId: $namespaceId, siteUrl: $siteUrl) {
      publicationId
    }
  }
  `
