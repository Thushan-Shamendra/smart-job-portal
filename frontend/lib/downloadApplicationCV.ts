const getFilenameFromDisposition = (
  contentDisposition: string | null,
  fallbackFilename: string
) => {
  if (!contentDisposition) {
    return fallbackFilename;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = contentDisposition.match(/filename="?([^"]+)"?/i);

  if (basicMatch?.[1]) {
    return basicMatch[1];
  }

  return fallbackFilename;
};

export const downloadApplicationCV = async (
  applicationId: string,
  token: string,
  fallbackFilename: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}/cv`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    let message = "Failed to download CV.";

    try {
      const errorData = (await response.json()) as { message?: string };
      message = errorData.message || message;
    } catch {
      // Ignore JSON parsing failures for binary responses.
    }

    throw new Error(message);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  const filename = getFilenameFromDisposition(
    response.headers.get("Content-Disposition"),
    fallbackFilename
  );

  downloadLink.href = objectUrl;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(objectUrl);
};
