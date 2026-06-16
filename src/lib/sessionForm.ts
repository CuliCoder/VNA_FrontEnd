// Helpers to save/load a business form draft (serializes File objects)
async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(String(reader.result));
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const resp = await fetch(dataUrl);
  return await resp.blob();
}

export async function saveBusinessDraft(key: string, data: any) {
  try {
    const clone: any = { ...data };

    // serialize `files` array (used by BusinessReview)
    if (Array.isArray(clone.files)) {
      clone.files = await Promise.all(
        clone.files.map(async (f: any) => {
          const item = { ...f };
          if (item.file instanceof File) {
            item.__file = {
              name: item.file.name,
              type: item.file.type,
              dataUrl: await fileToDataUrl(item.file),
            };
            delete item.file;
          }
          return item;
        })
      );
    }

    // serialize `documents` array (used by EditBusinessReview)
    if (Array.isArray(clone.documents)) {
      clone.documents = await Promise.all(
        clone.documents.map(async (d: any) => {
          const item = { ...d };
          if (item.file instanceof File) {
            item.__file = {
              name: item.file.name,
              type: item.file.type,
              dataUrl: await fileToDataUrl(item.file),
            };
            delete item.file;
          }
          return item;
        })
      );
    }

    sessionStorage.setItem(key, JSON.stringify(clone));
  } catch (err) {
    console.error("saveBusinessDraft error:", err);
  }
}

export async function loadBusinessDraft(key: string) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed: any = JSON.parse(raw);

    if (Array.isArray(parsed.files)) {
      parsed.files = await Promise.all(
        parsed.files.map(async (f: any) => {
          if (f.__file && f.__file.dataUrl) {
            const blob = await dataUrlToBlob(f.__file.dataUrl);
            const file = new File([blob], f.__file.name, { type: f.__file.type });
            return { ...f, file };
          }
          return f;
        })
      );
    }

    if (Array.isArray(parsed.documents)) {
      parsed.documents = await Promise.all(
        parsed.documents.map(async (d: any) => {
          if (d.__file && d.__file.dataUrl) {
            const blob = await dataUrlToBlob(d.__file.dataUrl);
            const file = new File([blob], d.__file.name, { type: d.__file.type });
            return { ...d, file };
          }
          return d;
        })
      );
    }

    return parsed;
  } catch (err) {
    console.error("loadBusinessDraft error:", err);
    return null;
  }
}

export function clearBusinessDraft(key: string) {
  sessionStorage.removeItem(key);
}
