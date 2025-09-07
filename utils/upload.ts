export async function uploadFiles(
  files: File[],
  userId: string,
  folder: "images" | "videos"
): Promise<string[]> {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    // 1. Xin presigned URL từ BE
    const presignRes = await fetch("/api/files/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        fileName: file.name,
        contentType: file.type,
        folder,
      }),
    }).then((r) => r.json());

    // 2. PUT file lên S3
    await fetch(presignRes.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    // 3. Lưu link publicUrl vào mảng
    uploadedUrls.push(presignRes.publicUrl);
  }

  return uploadedUrls;
}
