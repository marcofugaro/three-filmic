import { DataTexture, RedFormat, FloatType, UVMapping, ClampToEdgeWrapping, LinearFilter, Vector2, Uniform, LinearEncoding, Matrix4 } from 'three';
import { LookupTexture, Effect, BlendFunction, EffectPass, LUT3DEffect, LUT1DEffect } from 'postprocessing';

var View;

(function (View) {
  View[View["NONE"] = 5000] = "NONE";
  View[View["FILMIC"] = 5001] = "FILMIC";
  View[View["FILMIC_LOG"] = 5002] = "FILMIC_LOG";
  View[View["FALSE_COLOR"] = 5003] = "FALSE_COLOR";
  View[View["GRAYSCALE"] = 5004] = "GRAYSCALE";
})(View || (View = {}));

var Look;

(function (Look) {
  Look[Look["NONE"] = 5100] = "NONE";
  Look[Look["VERY_HIGH_CONTRAST"] = 5101] = "VERY_HIGH_CONTRAST";
  Look[Look["HIGH_CONTRAST"] = 5102] = "HIGH_CONTRAST";
  Look[Look["MEDIUM_HIGH_CONTRAST"] = 5103] = "MEDIUM_HIGH_CONTRAST";
  Look[Look["MEDIUM_CONTRAST"] = 5100] = "MEDIUM_CONTRAST";
  Look[Look["MEDIUM_LOW_CONTRAST"] = 5104] = "MEDIUM_LOW_CONTRAST";
  Look[Look["LOW_CONTRAST"] = 5105] = "LOW_CONTRAST";
  Look[Look["VERY_LOW_CONTRAST"] = 5106] = "VERY_LOW_CONTRAST";
})(Look || (Look = {}));

var Allocation;

(function (Allocation) {
  Allocation[Allocation["UNIFORM"] = 5200] = "UNIFORM";
  Allocation[Allocation["LG2"] = 5201] = "LG2";
})(Allocation || (Allocation = {}));

const DEFAULT_VIEW = View.FILMIC;
const DEFAULT_EXPOSURE = 0;
var Defines;

(function (Defines) {
  Defines["ALLOCATION"] = "FILMIC_ALLOCATION";
  Defines["INVERSE"] = "FILMIC_INVERSE";
})(Defines || (Defines = {}));

var Uniforms;

(function (Uniforms) {
  Uniforms["EXPOSURE"] = "exposure";
  Uniforms["MATRIX"] = "matrix";
  Uniforms["LUT"] = "lut";
  Uniforms["DOMAIN"] = "domain";
  Uniforms["RANGE"] = "range";
})(Uniforms || (Uniforms = {}));

const NEUTRAL_LUT_1D = new DataTexture(new Float32Array([0, 0.25, 0.5, 0.75, 1]), 5, 1, RedFormat, FloatType, UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping, LinearFilter, LinearFilter);
NEUTRAL_LUT_1D.name = 'neutral1D';
NEUTRAL_LUT_1D.needsUpdate = true;
const NEUTRAL_LUT_3D = LookupTexture.createNeutral(8);
NEUTRAL_LUT_3D.name = 'neutral3D';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

const DEFAULTS = {
  allocation: Allocation.UNIFORM,
  domain: new Vector2(0, 1),
  range: new Vector2(0, 1),
  inverse: false
};
class AllocationTransform extends Effect {
  constructor(options = {}) {
    const _options = _extends({}, DEFAULTS, options);

    super('AllocationTransform', AllocationTransform.FRAG, {
      blendFunction: BlendFunction.SET,
      uniforms: new Map([[Uniforms.DOMAIN, new Uniform(_options.domain)], [Uniforms.RANGE, new Uniform(_options.range)]]),
      defines: new Map([[Defines.ALLOCATION, _options.allocation.toFixed(0)]])
    });

    if (_options.inverse) {
      this.defines.set(Defines.INVERSE, '');
    }
  }

}
AllocationTransform.FRAG = `
uniform vec2 ${Uniforms.DOMAIN};
uniform vec2 ${Uniforms.RANGE};

vec3 remap(vec3 value, vec2 domain, vec2 range) {
	return range.x + ( value - domain.x ) * ( range.y - range.x ) / ( domain.y - domain.x );
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec3 color = inputColor.rgb;

	#ifndef ${Defines.INVERSE}

		#if ${Defines.ALLOCATION} == ${Allocation.LG2}

			color = log2(color);

		#endif

		color = remap(color, domain, range);
		color.rgb = clamp(color.rgb, range.x, range.y);

	#else

		color = remap(color, range, domain);

		#if ${Defines.ALLOCATION} == ${Allocation.LG2}

			color.r = pow(2.0, color.r);
			color.g = pow(2.0, color.g);
			color.b = pow(2.0, color.b);

		#endif

		color.rgb = clamp(color.rgb, range.x, range.y);

	#endif

	outputColor = vec4(color, inputColor.a);

}
	`.trim();

class ExposureTransform extends Effect {
  constructor(exposure = DEFAULT_EXPOSURE) {
    super('ExposureTransform', ExposureTransform.FRAG, {
      blendFunction: BlendFunction.SET,
      uniforms: new Map([[Uniforms.EXPOSURE, new Uniform(exposure)]])
    });
  }

  get exposure() {
    return this.uniforms.get(Uniforms.EXPOSURE).value;
  }

  set exposure(exposure) {
    this.uniforms.get(Uniforms.EXPOSURE).value = exposure;
  }

}
ExposureTransform.FRAG = `
uniform float ${Uniforms.EXPOSURE};

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = vec4(inputColor.rgb * pow(2.0, ${Uniforms.EXPOSURE}), inputColor.a);

}
	`.trim();

class MatrixTransform extends Effect {
  constructor(matrix) {
    super('MatrixTransform', MatrixTransform.FRAG, {
      blendFunction: BlendFunction.SET,
      uniforms: new Map([[Uniforms.MATRIX, new Uniform(matrix)]])
    });
    this.matrix = void 0;
    this.matrix = matrix;
  }

}
MatrixTransform.FRAG = `
uniform mat4 ${Uniforms.MATRIX};

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = inputColor * ${Uniforms.MATRIX};

}
	`.trim();

class DebugEffect extends Effect {
  constructor() {
    super('DebugEffect', DebugEffect.FRAG, {
      blendFunction: BlendFunction.SET
    });
  }

}
DebugEffect.FRAG = `
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec4 c = inputColor;

	if (isinf(c.r) || isinf(c.g) || isinf(c.b)) {
		outputColor.rgba = vec4(1., 0., 0., 1.);
	} else if (isnan(c.r) || isnan(c.g) || isnan(c.b)) {
		outputColor.rgba = vec4(0., 1., 0., 1.);
	} else {
		outputColor.rgba = vec4(0.5, 0.5, 0.5, 1.0);
	}

}
	`.trim();

class FilmicPass extends EffectPass {
  constructor(camera, ...effects) {
    super(camera, ...effects);
    this._view = DEFAULT_VIEW;
    this._filmicLUT = NEUTRAL_LUT_3D;
    this._falseColorLUT = NEUTRAL_LUT_3D;
    this._lookLUT = NEUTRAL_LUT_1D;
    this._prevEffects = void 0;
    this._exposureTransform = void 0;
    this._prevEffects = effects;
    this._exposureTransform = new ExposureTransform();
  }
  /**************************************************************************
   * Configuration.
   */


  get view() {
    return this._view;
  }

  set view(view) {
    this._view = view;
  }

  get exposure() {
    return this._exposureTransform.exposure;
  }

  set exposure(exposure) {
    this._exposureTransform.exposure = exposure;
  }
  /**************************************************************************
   * LUTs.
   */


  get filmicLUT() {
    return this._filmicLUT;
  }

  set filmicLUT(lut) {
    this._filmicLUT = lut;
  }

  get falseColorLUT() {
    return this._falseColorLUT;
  }

  set falseColorLUT(lut) {
    this._falseColorLUT = lut;
  }

  get lookLUT() {
    return this._lookLUT;
  }

  set lookLUT(lut) {
    this._lookLUT = lut;
  }
  /**************************************************************************
   * Internal.
   */
  // TODO(cleanup): Do without a build method?
  // TODO(cleanup): Why does every effect have a blend function?


  recompile() {
    // Reset previous filmic transform.
    const effects = [...this._prevEffects]; // 1. Exposure.

    effects.push(this._exposureTransform);

    if (this._view !== View.NONE) {
      // 2. Scene Linear to Filmic Log
      effects.push(new AllocationTransform({
        allocation: Allocation.LG2,
        domain: new Vector2(-12.473931188, 12.526068812)
      }), new LUT3DEffect(this.filmicLUT, {
        blendFunction: BlendFunction.SET,
        inputEncoding: LinearEncoding
      }), new AllocationTransform({
        allocation: Allocation.UNIFORM,
        domain: new Vector2(0, 0.66)
      })); // 3. Look Transform

      if (this._view === View.FILMIC || this._view === View.GRAYSCALE) {
        effects.push(new LUT1DEffect(this._lookLUT, {
          blendFunction: BlendFunction.SET
        }));
      } // 4. View Transform


      if (this._view === View.GRAYSCALE || this._view === View.FALSE_COLOR) {
        effects.push(new MatrixTransform( // prettier-ignore
        new Matrix4().fromArray([0.2126729, 0.7151521, 0.072175, 0, 0.2126729, 0.7151521, 0.072175, 0, 0.2126729, 0.7151521, 0.072175, 0, 0, 0, 0, 1])));
      }

      if (this._view === View.FALSE_COLOR) {
        // TODO(perf): Couldn't this be a 1D LUT?
        effects.push(new LUT3DEffect(this._falseColorLUT, {
          blendFunction: BlendFunction.SET,
          inputEncoding: LinearEncoding
        }));
      }
    } // Look Transforms output to sRGB. When no Look is applied, include the
    // default output encoding.


    this.fullscreenMaterial.encodeOutput = this._view === View.NONE;
    this.setEffects(effects);
    super.recompile();
  }

}

export { FilmicPass, Look, View };
//# sourceMappingURL=three-filmic.modern.js.map
