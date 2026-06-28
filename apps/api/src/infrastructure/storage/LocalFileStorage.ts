export class LocalFileStorage {
  constructor(
    private readonly basePath: string,
    private readonly baseUrl: string,
  ) {}

  resolveModelUrl(relativePath: string): string {
    return `${this.stripTrailingSlash(this.baseUrl)}/${this.stripLeadingSlash(relativePath)}`;
  }

  resolveFilePath(relativePath: string): string {
    return `${this.stripTrailingSlash(this.basePath)}/${this.stripLeadingSlash(relativePath)}`;
  }

  private stripTrailingSlash(value: string): string {
    return value.replace(/\/$/, "");
  }

  private stripLeadingSlash(value: string): string {
    return value.replace(/^\//, "");
  }
}
