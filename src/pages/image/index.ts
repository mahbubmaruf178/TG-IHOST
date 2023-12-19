export async function GET(event: { request: Request }) {
  const request = event.request;

  try {
    const uri = new URL(request.url);
    const id = uri.searchParams.get("id");

    if (!id) {
      return new Response("ID parameter is missing", { status: 400 });
    }

    const getToken: string = import.meta.env.TG_BOT_TOKEN;
    const getFileUrl: string = `https://api.telegram.org/bot${getToken}/getFile`;
    const data = { file_id: id };

    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    const response = await fetch(getFileUrl, options);
    const fileJson = await response.json();

    const filePath = fileJson.result.file_path;
    const downloadUrl = `https://api.telegram.org/file/bot${getToken}/${filePath}`;
    const fileResponse = await fetch(downloadUrl);

    if (!fileResponse.ok) {
      return new Response("Failed to fetch image", { status: 500 });
    }
    console.log("file size is dw ", fileResponse.headers.get("content-length"));

    const imageBlob = await fileResponse.blob();

    return new Response(imageBlob, {
      headers: {
        "Content-Type": "image/jpeg", // Adjust content type based on the actual image type
        "Cache-Control": "public, max-age=31536000, immutable",
        //  cloudflare cache for 1 year
        "Cache-Tag": "image",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
