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

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            cube: new Cube(),
            tube: new defs.Cylindrical_Tube(1, 10, [[0, 2], [0, 1]]),
            sphere: new defs.Subdivision_Sphere(4),
            picker_planet: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
            apple_tree: new Shape_From_File("assets/Apple_Tree.obj"),
//             apple_tree: new Shape_From_File("assets/desk_chair_scene.obj"),
            huge_scene: new Shape_From_File("assets/huge_scene.obj"),
        };

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            sky_texture: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .5, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/test_sky.png") // texture by LateNighCoffe on itch.io
            }),
            apple_tree_texture: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .3, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/Tree Texture.png")
            })
        }
        
        this.shapes.sphere.arrays.texture_coord.forEach(p => p.scale_by(4));
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 30), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Default camera.", ["Control", "0"], () => this.attached = () => this.initial_camera_location);
        this.new_line();
        this.key_triggered_button("Look at object.", ["Control", "0"], () => this.attached = () => this.object_1);
        this.new_line();

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

        let flat_plane = Mat4.identity().times(Mat4.scale(100, 1/20, 100)).times(Mat4.translation(0, -20, 0));
        this.shapes.cube.draw(context, program_state, flat_plane, this.materials.test.override({color: hex_color("#00ff00")}));

//         let apple_tree_model = Mat4.identity();
//         this.shapes.apple_tree.draw(context, program_state, apple_tree_model, this.materials.apple_tree_texture);

        let huge_scene_transform = Mat4.identity();
        this.shapes.huge_scene.draw(context, program_state, huge_scene_transform, this.materials.apple_tree_texture);
        
    }
}
