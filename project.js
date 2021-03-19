import {defs, tiny} from './examples/common.js';
import {Shape_From_File} from "./examples/obj-file-demo.js";

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;
const {Triangle, Square, Tetrahedron, Windmill, Cube, Cylindrical_Tube, Subdivision_Sphere, Textured_Phong} = defs;

// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

class Building {
    constructor(kind, width, height, x, z) {
        this.kind = kind;
        this.width = width;
        this.height = height;
        this.x = x;
        this.z = z;
    }
}

export class Project extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            cube: new Cube(),
            tube: new defs.Cylindrical_Tube(1, 10, [[0, 2], [0, 1]]),
            sphere: new defs.Subdivision_Sphere(4),
            picker_planet: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
            lamp: new Shape_From_File("assets/lamp.obj"),
            desk: new Shape_From_File("assets/desk.obj"),
        };

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            test2: new Material(new Gouraud_Shader()),
            sky_texture: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .5, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/test_sky.png") // texture by LateNighCoffe on itch.io
            }),
        }

        // Buildings
        this.buildings = [];
        this.initialize_buildings(200);
                
        this.shapes.sphere.arrays.texture_coord.forEach(p => p.scale_by(4));
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 30), vec3(0, 0, 0), vec3(0, 1, 0));
        this.object_1 = Mat4.identity();

        this.mouse_x = 0;
        this.mouse_y = 0;

        this.canPrint = false;
//         this.canDraw = true;
this.picker_transform = Mat4.identity().times(Mat4.translation(0, 10, 0));
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Default camera.", ["Control", "0"], () => this.attached = () => this.initial_camera_location);
        this.new_line();
        this.key_triggered_button("Look at object.", ["Control", "0"], () => this.attached = () => this.object_1);
        this.new_line();

    }

    make_sky_box(context, program_state, t) {

        let sky_box = Mat4.identity().times(Mat4.scale(400,400,400));
        sky_box = sky_box.times(Mat4.rotation(t * 1 / 120 * 2 * Math.PI, 0, 1, 0));
        this.shapes.sphere.draw(context, program_state, sky_box, this.materials.sky_texture);

    }

    bind_event() {
        let canv = document.getElementById('main-canvas').getElementsByTagName("canvas")[0];
        canv.addEventListener('mousedown', (e) => {
            const rect = canv.getBoundingClientRect();
            this.mouse_x = e.clientX - rect.left;
            this.mouse_y = e.clientY - rect.top;

            this.canPrint = !this.canPrint;
            console.log("clicked");
        })
    }

    lamp(context, program_state) {
        let model_transform = Mat4.identity().times(Mat4.translation(-10, 3.5, 0)).times(Mat4.scale(7, 7, 7));
        this.shapes.desk.draw(context, program_state, model_transform, this.materials.test.override({color: hex_color("#964b00")}));
        let model_transform_lamp = Mat4.identity().times(Mat4.translation(-14, 10.35, 0)).times(Mat4.rotation(Math.PI/3, 0, 1, 0));
        this.shapes.lamp.draw(context, program_state, model_transform_lamp, this.materials.test.override({color: hex_color("#eaae64")}));
    }

    initialize_buildings(num_buildings) {
        for (let i = 0; i < num_buildings; i++) {
            // Choose what kind of building this one will be.
            let kind = 0;
            let whatKind = Math.random();
            if (whatKind < 0.6) {
                kind = 0;
            } else if (whatKind < 0.75) {
                kind = 1;
            } else if (whatKind < 0.9) {
                kind = 2;
            } else {
                kind = 3;
            }
            // Choose width and height
            let width = getRandomInt(3, 8);
            let height = getRandomInt(5, 20);
            if (kind == 0) {
                if (Math.random() < 0.3) {
                    width = getRandomInt(20, 40);
                    height = getRandomInt(3, 7);
                }
            }
            // Choose distance and angle.
            const distance = getRandomInt(250, 350);
            const angle = Math.random() * Math.PI;
            const building_x = distance * Math.cos(angle);
            const building_z = distance * -Math.sin(angle);
            this.buildings.push(new Building(kind, width, height, building_x, building_z));
        }
    }

    draw_building(context, program_state, model_transform, building) {
        const kind = building.kind;
        const height = building.height;
        const width = building.width;
        // console.log(width);
        model_transform = model_transform.times(Mat4.translation(building.x, 0, building.z));
        // Building Kind 0: Just a box
        if (kind == 0)
        {
            model_transform = model_transform.times(Mat4.translation(0, height - 1, 0));
            model_transform = model_transform.times(Mat4.scale(width, height, width));
            this.shapes.cube.draw(context, program_state, model_transform, this.materials.test.override({color: hex_color("#404040")}));
//             model_transform = model_transform.times(Mat4.scale(1/width, 1/height, 1/width));
//             model_transform = model_transform.times(Mat4.translation(0, -1 * height + 1, 0));
        }
        // Building Kind 1: A box with a dome on top of it
        else if (kind == 1)
        {
            model_transform = model_transform.times(Mat4.translation(0, height - 1, 0));
            model_transform = model_transform.times(Mat4.scale(width, height, width));
            this.shapes.cube.draw(context, program_state, model_transform, this.materials.test.override({color: hex_color("#404040")}));
            model_transform = model_transform.times(Mat4.scale(1/width, 1/height, 1/width));
            model_transform = model_transform.times(Mat4.translation(0, height, 0)); 
            model_transform = model_transform.times(Mat4.scale(width, width, width)); 
            this.shapes.sphere.draw(context, program_state, model_transform, this.materials.test.override({color: hex_color("#404040")}));
//             model_transform = model_transform.times(Mat4.scale(1/width, 1/width, 1/width));
//             model_transform = model_transform.times(Mat4.scale(width/10, height/2, width/10)); 
//             this.shapes.cube.draw(context, program_state, model_transform, this.materials.test.override({color: hex_color("#404040")}));
//             model_transform = model_transform.times(Mat4.translation(0, 1 - (2*height), 0));  
        }
        // Building Kind 2: A box with a dome and a spire on top of it
        else if (kind == 2)
        {
            model_transform = model_transform.times(Mat4.translation(0, height - 1, 0));
            model_transform = model_transform.times(Mat4.scale(width, height, width));
            this.shapes.cube.draw(context, program_state, model_transform, this.materials.test.override({color: hex_color("#404040")}));
            model_transform = model_transform.times(Mat4.scale(1/width, 1/height, 1/width));
            model_transform = model_transform.times(Mat4.translation(0, height, 0)); 
            model_transform = model_transform.times(Mat4.scale(width, width, width)); 
            this.shapes.sphere.draw(context, program_state, model_transform, this.materials.test.override({color: hex_color("#404040")}));
            model_transform = model_transform.times(Mat4.scale(1/width, 1/width, 1/width));
            model_transform = model_transform.times(Mat4.scale(width/10, width*1.5, width/10)); 
            this.shapes.cube.draw(context, program_state, model_transform, this.materials.test.override({color: hex_color("#404040")}));
        }
        // Building Kind 3: A box with a roof
        else if (kind == 3)
        {
            model_transform = model_transform.times(Mat4.translation(0, height - 1, 0));
            model_transform = model_transform.times(Mat4.scale(width, height, width));
            this.shapes.cube.draw(context, program_state, model_transform, this.materials.test.override({color: hex_color("#404040")}));
            model_transform = model_transform.times(Mat4.scale(1/width, 1/height, 1/width));
            model_transform = model_transform.times(Mat4.translation(0, height, 0)); 
            model_transform = model_transform.times(Mat4.scale(width/2, width/2, width/2));
            model_transform = model_transform.times(Mat4.rotation(Math.PI / 2, 1, 0, 1));
            this.shapes.cube.draw(context, program_state, model_transform, this.materials.test.override({color: hex_color("#404040")})); 
        }


    }

    draw_cityscape(context, program_state, model_transform) {
        // model_transform = model_transform.times(Mat4.translation(0, 0, -200));
        this.buildings.forEach(building => {
            this.draw_building(context, program_state, model_transform, building);
        })
        
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);

            this.bind_event();
        }

        if (this.attached) {
            let desired = this.attached();
            if (desired !== this.initial_camera_location) {

                desired = desired.times(Mat4.rotation(-.4, 0, 1, 0)).times(Mat4.translation(0, 0, 10));
                desired = Mat4.inverse(desired);
            }
            program_state.set_camera(desired);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        
        // TODO: Lighting (Requirement 2)
        const light_position = vec4(10, 10, 0, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        this.make_sky_box(context, program_state, t);
        
/*        let box_1 = Mat4.identity();
        this.object_1 = box_1;
        this.shapes.cube.draw(context, program_state, box_1, this.materials.test);*/

        this.lamp(context, program_state);

        let flat_plane = Mat4.identity().times(Mat4.scale(400, 1/20, 400)).times(Mat4.translation(0, -20, 0));
        this.shapes.cube.draw(context, program_state, flat_plane, this.materials.test.override({color: hex_color("#00ff00")}));

/*        let i = 0;
        for (i; i < this.click_coords.length; i++){
            let current = this.click_coords[i];
            console.log(current[0]);
            let click_transform = Mat4.identity().times(Mat4.translation(current[0], current[1], 0));
            this.shapes.cube.draw(context, program_state, click_transform, this.materials.test);
        }*/

        ////
        // Eric is doing stuff
        ////

        let model_transform = Mat4.identity();
        this.draw_cityscape(context, program_state, model_transform);
        
        ////
        // End of Eric's stuff
        ////

        
        this.shapes.picker_planet.draw(context, program_state, this.picker_transform, this.materials.test2);



        let canvas = document.getElementById('main-canvas').getElementsByTagName("canvas")[0];
        const pixelX = this.mouse_x *  context.width / canvas.clientWidth;
        const pixelY = context.height - this.mouse_y * context.height / canvas.clientHeight - 1;
        const data = new Uint8Array(4);
//         console.log(context);
        context.context.readPixels(
            pixelX,            // x
            pixelY,            // y
            1,                 // width
            1,                 // height
            context.context.RGBA,           // format
            context.context.UNSIGNED_BYTE,  // type
            data);             // typed array to hold result
        const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);
        if (id === -16776961) {
//             console.log(this.picker_transform);
            while (!this.picker_transform.equals(Mat4.identity())) {
                this.picker_transform = this.picker_transform.times(Mat4.translation(0, -0.1, 0));
            }
        }

        if (this.canPrint) {
            console.log(`pixel X/Y ${pixelX}, ${pixelY}`);
            console.log(id);
            this.canPrint = !this.canPrint;
        }
    }
}

class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template
    // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;

        varying vec4 VERTEX_COLOR;

        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;

                vec4 color = vec4( shape_color.xyz * ambient, shape_color.w );
                color.xyz += phong_model_lights(N, vertex_worldspace);
                VERTEX_COLOR = color;
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){                                                           

                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}
