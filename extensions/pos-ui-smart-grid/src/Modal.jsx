import React, { useState } from 'react';
import {
  Text,
  TextField,
  Screen,
  ScrollView,
  POSBlock,
  POSBlockRow,
  Navigator,
  Button,
  reactExtension,
} from '@shopify/ui-extensions-react/point-of-sale';


async function shopifyQuery(query, variables = {}) {
  const res = await fetch('shopify:admin/api/graphql.json', {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

async function searchCollections(searchTerm) {
  const query = `
    query SearchCollections($first: Int!, $query: String!) {
      collections(first: $first, query: $query) {
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
  const data = await shopifyQuery(query, {
    first: 5,
    query: `title:${searchTerm}*`,
  });
  return data.data.collections.edges;
}

async function getCollectionProductsById(collectionId, first = 5, after = null) {
  const query = `
    query GetCollectionProducts($id: ID!, $first: Int!, $after: String) {
      collection(id: $id) {
        id
        title
        products(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              handle
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const data = await shopifyQuery(query, { id: collectionId, first, after });
  console.log("RAW collection products response:", data);
  return data.data.collection;
}


const Modal = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState(['Start: Component initialized']);

  const log = (msg) => setDebug((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleSearch = async () => {
    setLoading(true);
    log(`Searching collections with term: "${searchTerm}"`);
    try {
      const results = await searchCollections(searchTerm);
      setCollections(results);
      setSelectedCollection(null);
      setProducts([]);
      log(`Found ${results.length} collections`);
    } catch (e) {
      log(`Error searching collections: ${e.message}`);
    }
    setLoading(false);
  };

  const openCollection = async (collectionId) => {
    setLoading(true);
    log(`Loading products for collection ${collectionId}`);
    try {
      const col = await getCollectionProductsById(collectionId);
      if (col) {
        setSelectedCollection(col);
        setProducts(col.products.edges);
        setPageInfo(col.products.pageInfo);
        log(`Loaded ${col.products.edges.length} products`);
      } else {
        log('No products found for collection');
      }
    } catch (e) {
      log(`Error loading products: ${e.message}`);
    }
    setLoading(false);
  };

  const loadNextPage = async () => {
    if (!pageInfo?.hasNextPage || !selectedCollection) return;
    setLoading(true);
    log('Loading next page...');
    try {
      const col = await getCollectionProductsById(
        selectedCollection.id,
        5,
        pageInfo.endCursor
      );
      setProducts((prev) => [...prev, ...col.products.edges]);
      setPageInfo(col.products.pageInfo);
    } catch (e) {
      log(`Error loading next page: ${e.message}`);
    }
    setLoading(false);
  };

  return (
    <Navigator>
      <Screen name="Main" title="Collections Debug">
        <ScrollView>
          <TextField
            label="Search Collection"
            value={searchTerm}
            onChange={setSearchTerm}
            onSubmit={handleSearch}
          />
          <Button onPress={handleSearch}>Search</Button>

          {loading && <Text>Loading...</Text>}

          {!selectedCollection ? (
            <>
              <Text> Collections </Text>
              {collections.map((edge) => (
                <POSBlock key={edge.node.id}>
                  <POSBlockRow onPress={() => openCollection(edge.node.id)}>
                    <Text>• {edge.node.title}</Text>
                  </POSBlockRow>
                </POSBlock>
              ))}
            </>
          ) : (
            <>
              <Text> Products in {selectedCollection.title} </Text>
              {products.map((p) => (
                <POSBlock key={p.node.id}>
                  <POSBlockRow>
                    <Text>• {p.node.title}</Text>
                  </POSBlockRow>
                </POSBlock>
              ))}
              {pageInfo?.hasNextPage && (
                <Button onPress={loadNextPage}>Load more</Button>
              )}
              <Button onPress={() => setSelectedCollection(null)}>
                Back to Collections
              </Button>
            </>
          )}

          <Text>=== Debug log ===</Text>
          {debug.map((msg, i) => (
            <Text key={i}>{msg}</Text>
          ))}
        </ScrollView>
      </Screen>
    </Navigator>
  );
};

export default reactExtension('pos.home.modal.render', () => <Modal />);
