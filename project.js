import {defs, tiny} from './examples/common.js';
import {Shape_From_File} from "./examples/obj-file-demo.js";

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;
const {Triangle, Square, Tetrahedron, Windmill, Cube, Cylindrical_Tube, Subdivision_Sphere, Textured_Phong} = defs;

export class Project extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        this.obj_path = "assets/objs/";
        this.texture_path = "assets/textures/";

        // list of static objects that don't need animation
        this.to_import = [
            "apple_tree",
            "bed",
            "closet",
            "desk",
            "desk_chair",
            "door",
            "floor",
            "grass",
            "roof",
            "shelf",
            "sofa",
            "table",
            "walls",
            "window",
        ];

        this.shapes = {};
        this.to_import.forEach(e => this.shapes[e] = new Shape_From_File(`${this.obj_path}${e}.obj`));
        this.shapes["sphere"] = new defs.Subdivision_Sphere(4);

        this.materials = {};
        this.to_import.forEach(e => 
            this.materials[e] = new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .4, diffusivity: 0.1, specularity: 0.0,
                texture: new Texture(`${this.texture_path}${e}.png`)
        }));

        this.materials["sky_texture"] = new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .5, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/test_sky.png") // texture by LateNighCoffe on itch.io
            });

        this.shapes.sphere.arrays.texture_coord.forEach(p => p.scale_by(4));
        this.initial_camera_location = Mat4.look_at(vec3(5, 5, 10), vec3(0, 3, 0), vec3(0, 1, 0));
    }

    make_control_panel() {


    }

    // static objects that don't need animation and don't need model_transforms we need to keep track of
    draw_static_objects(context, program_state) {
        this.to_import.forEach(e => this.shapes[e].draw(context, program_state, Mat4.identity(), this.materials[e]));       
    }

    make_sky_box(context, program_state, t) {
        let sky_box = Mat4.identity().times(Mat4.scale(200,200,200));
        sky_box = sky_box.times(Mat4.rotation(t * 1 / 120 * 2 * Math.PI, 0, 1, 0));
        this.shapes.sphere.draw(context, program_state, sky_box, this.materials.sky_texture);
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
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

        const light_position = vec4(10, 10, 0, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        this.make_sky_box(context, program_state, t);
        this.draw_static_objects(context, program_state);
    }
}
