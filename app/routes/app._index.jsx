import { useEffect } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getCollections } from "./getCollections.server";


export const loader = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);
    const collections = await getCollections(admin);
    return json({ collections });
  } catch (e) {
    console.error("Error fetching collections:", e);
    throw new Response("Failed to fetch collections", { status: 500 });
  }
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  // ... існуючий код створення продукту
};

export default function Index() {
  const { collections } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  const productId = fetcher.data?.product?.id?.replace(
    "gid://shopify/Product/",
    "",
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId, shopify]);

  const generateProduct = () => fetcher.submit({}, { method: "POST" });

  return (
    <Page>
      <TitleBar title="Remix app template">
        <button variant="primary" onClick={generateProduct}>
          Generate a product
        </button>
      </TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">Collections</Text>
                {collections.length > 0 ? (
                  <ul>
                    {collections.map(edge => (
                      <li key={edge.node.id}>{edge.node.title}</li>
                    ))}
                  </ul>
                ) : (
                  <Text>No collections found</Text>
                )}
              </BlockStack>
            </Card>
            {/* Тут твій існуючий контент */}
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
