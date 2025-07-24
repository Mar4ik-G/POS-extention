import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getCollections } from "./getCollections.server";

export async function loader({ request }) {
  console.log("HERE IN PROXY COLLECTIONS ROUTE 123");
  
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  }

  try {
    // const { admin } = await authenticate.admin(request);
    // const collections = await getCollections(admin);

    // return json(
    //   { data: { collections: { edges: collections } } },
    //   {
    //     headers: { "Access-Control-Allow-Origin": "*" },
    //   }
    // );
    return json({ ok: true, time: new Date().toISOString() });
  } catch (e) {
    console.error("Error fetching collections:", e);
    return json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}
