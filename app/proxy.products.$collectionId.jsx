import { json } from "@remix-run/node";

export const loader = async ({ params }) => {
  const { collectionId } = params;

  return json({
    data: {
      products: [
        { id: `p-${collectionId}-1`, title: `Demo Product A (col: ${collectionId})` },
        { id: `p-${collectionId}-2`, title: `Demo Product B (col: ${collectionId})` },
      ],
    },
  });
};
