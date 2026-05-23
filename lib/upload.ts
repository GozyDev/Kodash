export type UploadErrorCode =
  | "FILE_READ_FAILED"
  | "NETWORK_ERROR"
  | "UPLOAD_FAILED"
  | "ABORTED";

export class UploadError extends Error {
  code: UploadErrorCode;

  constructor(message: string, code: UploadErrorCode) {
    super(message);
    this.name = "UploadError";
    this.code = code;
  }
}

const FILE_READ_FAILED_MESSAGE =
  "Couldn't read file. Download it to your device first, then try again.";

/** Materialize cloud-backed mobile files (iCloud/Drive) into a local File before upload. */
async function materializeFile(
  file: File,
  signal: AbortSignal,
): Promise<File> {
  const buffer = await file.arrayBuffer();
  if (signal.aborted) {
    throw new UploadError("Upload cancelled", "ABORTED");
  }
  return new File([buffer], file.name, {
    type: file.type || "application/octet-stream",
  });
}

export function uploadFile(
  file: File,
  onProgress?: (p: number) => void,
  clientId?: string,
) {
  const readAbort = new AbortController();
  let xhr: XMLHttpRequest | null = null;
  let aborted = false;

  const promise: Promise<{
    file_id: string;
    file_url: string;
    file_name?: string;
  }> = (async () => {
    let payload: File;
    try {
      onProgress?.(0);
      payload = await materializeFile(file, readAbort.signal);
      if (aborted) {
        throw new UploadError("Upload cancelled", "ABORTED");
      }
    } catch (err) {
      if (aborted || (err instanceof UploadError && err.code === "ABORTED")) {
        throw new UploadError("Upload cancelled", "ABORTED");
      }
      if (err instanceof UploadError) {
        throw err;
      }
      throw new UploadError(FILE_READ_FAILED_MESSAGE, "FILE_READ_FAILED");
    }

    return new Promise((resolve, reject) => {
      if (aborted) {
        reject(new UploadError("Upload cancelled", "ABORTED"));
        return;
      }

      xhr = new XMLHttpRequest();
      const url = "/api/files/upload";

      xhr.open("POST", url);

      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = function () {
        try {
          const resp = JSON.parse(xhr!.responseText || "{}");
          if (xhr!.status >= 200 && xhr!.status < 300) {
            resolve({
              file_id: resp.file_id,
              file_url: resp.file_url,
              file_name: resp.file_name,
            });
          } else {
            reject(
              new UploadError(
                resp.error || "Upload failed",
                "UPLOAD_FAILED",
              ),
            );
          }
        } catch (err) {
          reject(err);
        }
      };

      xhr.onerror = function () {
        reject(new UploadError("Network error", "NETWORK_ERROR"));
      };

      xhr.onabort = function () {
        reject(new UploadError("Upload cancelled", "ABORTED"));
      };

      const form = new FormData();
      form.append("file", payload);
      if (clientId) form.append("clientId", clientId);
      xhr.send(form);
    });
  })();

  const abort = () => {
    aborted = true;
    readAbort.abort();
    if (xhr) {
      try {
        xhr.abort();
      } catch {
        // ignore
      }
      xhr = null;
    }
  };

  return {
    promise,
    abort,
  } as {
    promise: Promise<{ file_id: string; file_url: string; file_name?: string }>;
    abort: () => void;
  };
}
