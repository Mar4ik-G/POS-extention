import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getCollections } from "./getCollections.server";

export async function loader({ request }) {
  
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
    const { admin } = await authenticate.admin(request);
    
    const collections = await getCollections(admin);
    return json(
      { ok: true, data: collections },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
    
  } catch (e) {
    console.error("Error fetching collections:", e);
    return json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}
