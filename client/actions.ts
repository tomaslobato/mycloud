export async function move(oldId: string, newId: string) {
  const res = await fetch(`/api/move`, {
    method: "put",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      oldId,
      newId,
    }),
  });

  const json = await res.json();
}