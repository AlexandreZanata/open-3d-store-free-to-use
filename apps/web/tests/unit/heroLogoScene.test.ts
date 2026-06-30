import { describe, expect, it } from "vitest";

import {
  fitCameraToModel,
  HERO_LOGO_COLOR,
  HERO_LOGO_FIT_PADDING,
  HERO_LOGO_TURN_SPEED,
  HERO_LOGO_VIEW_SCALE,
} from "@/components/home/heroLogoScene";
import * as THREE from "three";

describe("heroLogoScene constants", () => {
  it("renders the logo 30% larger while keeping the fitted center", () => {
    expect(HERO_LOGO_VIEW_SCALE).toBe(1.3);
  });

  it("keeps viewport padding so the mesh is not clipped by the tile", () => {
    expect(HERO_LOGO_FIT_PADDING).toBeGreaterThan(1.15);
    expect(HERO_LOGO_FIT_PADDING).toBeLessThan(1.45);
  });

  it("uses solid black for contrast on the white hero card", () => {
    expect(HERO_LOGO_COLOR).toBe(0x141414);
  });

  it("spins the logo slowly on the vertical axis", () => {
    expect(HERO_LOGO_TURN_SPEED).toBeGreaterThan(0.1);
    expect(HERO_LOGO_TURN_SPEED).toBeLessThan(0.4);
  });
});

describe("fitCameraToModel", () => {
  it("pulls the camera back enough for tall square tiles", () => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 0.8, 0.12),
      new THREE.MeshBasicMaterial(),
    );
    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 200);

    fitCameraToModel(mesh, camera, 280, 280);

    expect(camera.position.z).toBeGreaterThan(1.1);
  });
});
