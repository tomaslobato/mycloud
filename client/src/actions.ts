export async function move(oldId: string, newId: string) {
  await fetch(`/api/move`, {
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
}

export async function remove(id: string) {
  const encodedId = encodeURIComponent(id);

  const response = await fetch(`/api/delete/${encodedId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete file: ${response.statusText}`);
  }
}

//UPLOAD
export async function upload(selectedFiles: FileList) {
  if (!selectedFiles || selectedFiles.length === 0) return;

  const formData = new FormData();

  for (let i = 0; i < selectedFiles.length; i++) {
    formData.append("files", selectedFiles[i]);
  }

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    console.error("Upload failed:", res.statusText);
    return;
  }
}

export async function create(id: string, isDir: boolean, name: string) {
  await fetch("/api/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id + "/" + name,
      isDir,
    }),
  });
}

export async function saveContent(id: string, content: string) {
  const encodedId = encodeURIComponent(id);

  await fetch(`/api/content/${encodedId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "text/plain",
    },
    body: content,
  });
}