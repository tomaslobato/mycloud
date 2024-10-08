export async function move(oldId: string, newId: string) {
  const res = await fetch(`/api/move`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      oldId,
      newId,
    }),
  });
}

export async function rename(oldId: string, newName: string) {
  const lastSlashIndex = oldId.lastIndexOf("/");
  let newId = "";
  if (lastSlashIndex === -1) {
    newId = newName;
  } else {
    const parentId = oldId.substring(0, lastSlashIndex);
    newId = parentId + "/" + newName;
  }

  const res = await fetch(`/api/move`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      oldId,
      newId,
    }),
  });

  // Check if the response is OK (status 2xx)
  if (!res.ok) {
    console.error(`Rename failed: ${res.statusText}`);
    return false;
  }

  const json = await res.json();
  console.log(json);
}

export async function remove(id) {
  const encodedId = encodeURIComponent(id);

  await fetch(`/api/delete/${encodedId}`, {
    method: "delete",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

//UPLOAD
export async function upload(ev: React.ChangeEvent<HTMLInputElement>) {
  const selectedFiles = ev.target.files;

  // Ensure that files are selected
  if (!selectedFiles || selectedFiles.length === 0) return;

  const formData = new FormData();

  // Use a correct loop initialization
  for (let i = 0; i < selectedFiles.length; i++) {
    formData.append("files", selectedFiles[i]); // Append each file to the formData
  }

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    console.error("Upload failed:", res.statusText);
    return;
  }

  ev.target.value = "";
}

export async function create(id: string, isDir: boolean, name: string) {
  const res = await fetch("/api/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id + "/" + name,
      isDir,
    }),
  });
  const json = await res.json();
  console.log(json);
}

export async function saveContent(id: string, content: string) {
  const encodedId = encodeURIComponent(id)

  console.log(encodedId, content)

  const res = await fetch(`/api/content/${encodedId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "text/plain",
    },
    body: content,
  });
  const json = await res.json();
  console.log(json);
}