export interface ServerToolResult {
  buffer: Buffer;
  contentType: string;
  filename: string;
}

export type ServerToolHandler = (
  files: Express.Multer.File[],
  params: Record<string, unknown>,
) => Promise<ServerToolResult>;
