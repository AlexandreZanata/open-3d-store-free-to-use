import { describe, expect, it } from "vitest";
import {
  resolveAdminPreviewAllowedHosts,
  resolvePreviewAllowedHosts,
} from "../../vitePreviewHosts";

describe("resolvePreviewAllowedHosts — docs/infrastructure/nginx.md", () => {
  it("allows corvo3d.com.br and www for production storefront URL", () => {
    expect(resolvePreviewAllowedHosts("https://corvo3d.com.br")).toEqual([
      "corvo3d.com.br",
      "www.corvo3d.com.br",
    ]);
  });

  it("allows all hosts for IP-based assets URL", () => {
    expect(resolvePreviewAllowedHosts("http://72.60.147.2")).toBe(true);
  });
});

describe("resolveAdminPreviewAllowedHosts", () => {
  it("allows admin subdomain for domain-mode API base", () => {
    expect(resolveAdminPreviewAllowedHosts("https://corvo3d.com.br/api/v1")).toEqual([
      "corvo3d.com.br",
      "www.corvo3d.com.br",
      "admin.corvo3d.com.br",
    ]);
  });

  it("prefers VITE_ADMIN_PUBLIC_HOST when set", () => {
    expect(
      resolveAdminPreviewAllowedHosts("http://72.60.147.2/api/v1", "admin.corvo3d.com.br"),
    ).toEqual(["admin.corvo3d.com.br", "corvo3d.com.br", "www.corvo3d.com.br"]);
  });
});
