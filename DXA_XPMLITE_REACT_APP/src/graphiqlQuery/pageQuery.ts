export const PageQuery = `query page($namespaceId: Int, $publicationId: Int, $url: String) {
    page(namespaceId: $namespaceId, publicationId: $publicationId, url: $url) {
      id
      itemId
      itemType
    }
  }`