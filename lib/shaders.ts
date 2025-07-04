import { ShaderMaterial, TextureLoader, Vector2 } from 'three';

const globeDayNightShader = {
  vertexShader: `
      varying vec3 vNormal;
      varying vec2 vUv;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
  fragmentShader: `
      #define PI 3.141592653589793
      uniform sampler2D dayTexture;
      uniform sampler2D nightTexture;
      uniform vec2 sunPosition;
      uniform vec2 globeRotation;
      varying vec3 vNormal;
      varying vec2 vUv;

      float toRad(in float a) {
        return a * PI / 180.0;
      }

      vec3 Polar2Cartesian(in vec2 c) { // [lng, lat]
        float theta = toRad(90.0 - c.x);
        float phi = toRad(90.0 - c.y);
        return vec3( // x,y,z
          sin(phi) * cos(theta),
          cos(phi),
          sin(phi) * sin(theta)
        );
      }

      void main() {
        float invLon = toRad(globeRotation.x);
        float invLat = -toRad(globeRotation.y);
        mat3 rotX = mat3(
          1, 0, 0,
          0, cos(invLat), -sin(invLat),
          0, sin(invLat), cos(invLat)
        );
        mat3 rotY = mat3(
          cos(invLon), 0, sin(invLon),
          0, 1, 0,
          -sin(invLon), 0, cos(invLon)
        );
        vec3 rotatedSunDirection = rotX * rotY * Polar2Cartesian(sunPosition);
        float intensity = dot(normalize(vNormal), normalize(rotatedSunDirection));
        vec4 dayColor = texture2D(dayTexture, vUv);
        vec4 nightColor = texture2D(nightTexture, vUv);
        float blendFactor = smoothstep(-0.1, 0.1, intensity);
        gl_FragColor = mix(nightColor, dayColor, blendFactor);
      }
    `,
};

export async function getGlobeDayNightShader(
  dayTexturePath: string,
  nightTexturePath: string,
  enableDayNightCycle: boolean,
) {
  const [dayTexture, nightTexture] = await Promise.all([
    new TextureLoader().loadAsync(dayTexturePath),
    new TextureLoader().loadAsync(nightTexturePath),
  ]);

  return new ShaderMaterial({
    uniforms: {
      dayTexture: { value: enableDayNightCycle ? dayTexture : nightTexture },
      nightTexture: { value: nightTexture },
      sunPosition: { value: new Vector2() },
      globeRotation: { value: new Vector2() },
    },
    vertexShader: globeDayNightShader.vertexShader,
    fragmentShader: globeDayNightShader.fragmentShader,
  });
}
