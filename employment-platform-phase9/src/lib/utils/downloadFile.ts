/**
 * Forces a browser download instead of navigating to/opening the URL.
 *
 * The native `<a download>` attribute is unreliable for cross-origin URLs
 * (which Supabase signed URLs always are) — most browsers ignore it and
 * just navigate to the file instead of downloading it. Fetching the file
 * as a blob and downloading via an object URL works reliably everywhere.
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Give the browser a moment to pick up the download before revoking.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
