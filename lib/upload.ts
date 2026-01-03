export function uploadFile(file: File, onProgress?: (p: number) => void, clientId?: string) {
  let xhr: XMLHttpRequest | null = new XMLHttpRequest();

  const promise: Promise<{ file_id: string; file_url: string; file_name?: string }> = new Promise(
    (resolve, reject) => {
      const url = "/api/files/upload";

      xhr!.open("POST", url);

      xhr!.upload.onprogress = function (e) {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };

      xhr!.onload = function () {
        try {
          const resp = JSON.parse(xhr!.responseText || "{}");
          if (xhr!.status >= 200 && xhr!.status < 300) {
            resolve({ file_id: resp.file_id, file_url: resp.file_url, file_name: resp.file_name });
          } else {
            reject(new Error(resp.error || "Upload failed"));
          }
        } catch (err) {
          reject(err);
        }
      };

      xhr!.onerror = function () {
        reject(new Error("Network error"));
      };

      const form = new FormData();
      form.append("file", file);
      if (clientId) form.append("clientId", clientId);
      xhr!.send(form);
    }
  );

  const abort = () => {
    if (xhr) {
      try {
        xhr.abort();
      } catch {}
      xhr = null;
    }
  };

  return { promise, abort } as {
    promise: Promise<{ file_id: string; file_url: string }>;
    abort: () => void;
  };
}
