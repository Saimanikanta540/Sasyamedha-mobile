import { Directory, File, Paths } from 'expo-file-system';

const SCANS_DIR = new Directory(Paths.document, 'scans');

/** Camera output lives in a temp/cache location that isn't guaranteed to survive — copy it
 * into the document directory so an offline-queued scan still has its photo after restart. */
export async function persistCapturedImage(sourceUri: string, scanId: string): Promise<string> {
  if (!SCANS_DIR.exists) {
    SCANS_DIR.create({ intermediates: true });
  }
  const dest = new File(SCANS_DIR, `${scanId}.jpg`);
  const src = new File(sourceUri);
  await src.copy(dest);
  return dest.uri;
}
