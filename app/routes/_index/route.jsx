import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  const baseUrl = `${url.origin}/proxy/collections`;
  const res = await fetch(baseUrl);
  const data = await res.json();

  return json({
    showForm: true,
    collections: data?.collections?.edges || [],
  });
};

export default function App() {
  const { showForm, collections } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Collections</h1>
        <ul className={styles.list}>
          {collections.length > 0 ? (
            collections.map((edge) => (
              <li key={edge.node.id}>
                <strong>{edge.node.title}</strong>
              </li>
            ))
          ) : (
            <li>No collections found</li>
          )}
        </ul>
      </div>
    </div>
  );
}
