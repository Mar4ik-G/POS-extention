export async function getCollections(admin) {
  const query = `
    query GetCollections {
      collections(first: 5) {
        edges {
          node {
            id
            title
            handle
            updatedAt
          }
        }
      }
    }
  `;
  
  const res = await admin.graphql(query);
  const raw = await res.text();
  const data = JSON.parse(raw);

  if (data.errors) {
    console.error("GraphQL errors:", data.errors);
    throw new Error("Failed to fetch collections");
  }

  return data.data.collections.edges || [];
}
