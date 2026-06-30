import { describe, expect, it } from "vitest";

import {
  fitCameraToModel,
  heroLogoPlaceholderDiameterRatio,
  HERO_LOGO_CAMERA_FOV,
  HERO_LOGO_COLOR,
  HERO_LOGO_COLOR_HEX,
  HERO_LOGO_FIT_PADDING,
  HERO_LOGO_PLACEHOLDER_SCALE,
  HERO_LOGO_REFERENCE_SPHERE_RADIUS,
  HERO_LOGO_TURN_SPEED,
  HERO_LOGO_VIEW_SCALE,
} from "@/components/home/heroLogoScene";
import * as THREE from "three";

describe("heroLogoScene constants", () => {
  it("renders the logo 30% larger while keeping the fitted center", () => {
    expect(HERO_LOGO_VIEW_SCALE).toBe(1.3);
  });

  it("shows the black PNG fallback 25% smaller than the fitted GLB", () => {
    expect(HERO_LOGO_PLACEHOLDER_SCALE).toBe(0.75);
  });

  it("keeps viewport padding so the mesh is not clipped by the tile", () => {
    expect(HERO_LOGO_FIT_PADDING).toBeGreaterThan(1.15);
    expect(HERO_LOGO_FIT_PADDING).toBeLessThan(1.45);
  });

  it("uses solid black for contrast on the white hero card", () => {
    expect(HERO_LOGO_COLOR).toBe(0x141414);
    expect(HERO_LOGO_COLOR_HEX).toBe("#141414");
  });

  it("matches placeholder camera FOV to the Three.js viewer", () => {
    expect(HERO_LOGO_CAMERA_FOV).toBe(34);
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

describe("heroLogoPlaceholderDiameterRatio", () => {
  it("matches fitted mesh footprint for square hero tiles", () => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 0.8, 0.12),
      new THREE.MeshBasicMaterial(),
    );
    const sphere = new THREE.Box3().setFromObject(mesh).getBoundingSphere(new THREE.Sphere());
    const ratio = heroLogoPlaceholderDiameterRatio(1, sphere.radius);
    expect(ratio).toBeGreaterThan(0.45);
    expect(ratio).toBeLessThanOrEqual(1);
    expect(ratio).toBeCloseTo(
      heroLogoPlaceholderDiameterRatio(1, HERO_LOGO_REFERENCE_SPHERE_RADIUS),
      1,
    );
  });
});
