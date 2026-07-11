import { db, type Attachment, type AttachmentOwnerType } from '../db';

export const ATTACHMENT_ACCEPT =
  'image/*,application/pdf,.doc,.docx,.odt,.rtf,.txt,.xls,.xlsx,.csv,.ppt,.pptx';

export function listAttachments(ownerType: AttachmentOwnerType, ownerId: number) {
  return db.attachments.where('[ownerType+ownerId]').equals([ownerType, ownerId]).toArray();
}

export async function addAttachments(ownerType: AttachmentOwnerType, ownerId: number, files: FileList | File[]) {
  const now = new Date().toISOString();
  for (const file of Array.from(files)) {
    await db.attachments.add({
      ownerType,
      ownerId,
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      blob: file,
      createdAt: now,
    } as never);
  }
}

export async function removeAttachment(id: number) {
  await db.attachments.delete(id);
}

export async function removeAttachmentsForOwner(ownerType: AttachmentOwnerType, ownerId: number) {
  const items = await listAttachments(ownerType, ownerId);
  await db.attachments.bulkDelete(items.map((a) => a.id));
}

export function isImageAttachment(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type { Attachment, AttachmentOwnerType };
