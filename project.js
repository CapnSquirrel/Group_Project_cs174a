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
        this.shapes["sphere2"] = new defs.Subdivision_Sphere(4);
        this.shapes["skyline"] = new Shape_From_File(`${this.obj_path}skyline.obj`)

        this.materials = {};
        this.to_import.forEach(e => 
            this.materials[e] = new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .4, diffusivity: 0.2, specularity: 0.0,
                texture: new Texture(`${this.texture_path}${e}.png`)
        }));

        this.materials["background_sky"] = new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .5, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture(`${this.texture_path}background_sky.png`) // clouds by LateNighCoffe on itch.io
        });

        this.materials["foreground_sky"] = new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .5, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture(`${this.texture_path}foreground_sky.png`)
        });

        this.materials["skyline"] = new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .5, diffusivity: 0.1, specularity: 0.0,
                texture: new Texture(`${this.texture_path}skyline.png`)
        });


        // this changes the look of the clouds
        this.shapes.sphere.arrays.texture_coord.forEach(p => p.scale_by(4));
        this.shapes.sphere2.arrays.texture_coord.forEach(p => p.scale_by(8));


        this.initial_camera_location = Mat4.look_at(vec3(5, 5, 10), vec3(0, 3, 0), vec3(0, 1, 0));
        this.global_cam_on = true;

        this.player_transform = Mat4.identity().times(Mat4.translation(4, 4, 4));

        // player control flags
        this.turn_left = false;
        this.turn_right = false;
        this.move_forward = false;
        this.move_backward = false;
        this.camera_angle = 0;
        this.target_angle = 0;
        // naming this velocity is not quite right, but it is what it is
        this.velocity = 0;
    }

    make_control_panel() {
        this.key_triggered_button("Switch to global camera", ["Control", "0"], () => this.attached = () => this.initial_camera_location);
        this.new_line();
        this.key_triggered_button("Player POV", ["Control", "1"], () => this.attached = () => this.player_transform);
        this.new_line();
        this.key_triggered_button("Rotate Left", ["a"], () => this.turn_left = true, undefined, () => this.turn_left = false);
        this.key_triggered_button("Rotate Right", ["d"], () => this.turn_right = true, undefined, () => this.turn_right = false);
        this.new_line();
        this.key_triggered_button("Move Forward", ["w"], () => this.move_forward = true, undefined, () => this.move_forward = false);
        this.key_triggered_button("Move Backward", ["s"], () => this.move_backward = true, undefined, () => this.move_backward = false);
    }

    // static objects that don't need animation and don't need model_transforms we need to keep track of
    draw_static_objects(context, program_state) {
        this.to_import.forEach(e => this.shapes[e].draw(context, program_state, Mat4.identity(), this.materials[e]));       
    }
    
    // draw and animate the background
    make_sky_box(context, program_state, t) {
        let background_sky = Mat4.identity().times(Mat4.scale(150,150,150));
        background_sky = background_sky.times(Mat4.rotation(t * 1 / 250 * 2 * Math.PI, 0, 1, 0));
        this.shapes.sphere.draw(context, program_state, background_sky, this.materials.background_sky);

        let foreground_sky = Mat4.identity().times(Mat4.scale(100, 100, 100));
        foreground_sky = foreground_sky.times(Mat4.rotation(t * 1 / 200 * 2 * Math.PI, 0, 1, 0));
        this.shapes.sphere2.draw(context, program_state, foreground_sky, this.materials.foreground_sky);
    }

    // handles updating player / first-person camera position
    update_player() {
        if (this.global_cam_on) 
            return
        if (this.turn_left)
            this.target_angle += 0.055;
        if (this.turn_right)
            this.target_angle -= 0.055;
        // hardcoded room boundaries
        if (this.move_forward && this.velocity >= -12.0)
            this.velocity -= 0.2;
        if (this.move_backward && this.velocity <= 4.5)
            this.velocity += 0.2;

        this.camera_angle += (this.target_angle - this.camera_angle) * .2;

        // only supports movement on the x axis within the confines of the room.
        let player_transform = Mat4.identity().times(Mat4.translation(4, 4, 4));
        player_transform = player_transform.times(Mat4.translation(this.velocity, 0, 0)).times(Mat4.rotation(this.camera_angle, 0, 1 ,0));
        this.player_transform = player_transform;
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
                this.global_cam_on = false;
                desired = Mat4.inverse(desired);
            } else {
                this.global_cam_on = true;
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

        let skyline = Mat4.identity().times(Mat4.rotation(Math.PI/2, 0, 1, 0)).times(Mat4.translation(0, -10, 0)).times(Mat4.scale(20, 20, 20));
        this.shapes.skyline.draw(context, program_state, skyline, this.materials.skyline)

        this.update_player();
    }
}
