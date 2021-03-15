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
            sphere: new defs.Subdivision_Sphere(4),
            apple_tree: new Shape_From_File("assets/objs/apple_tree.obj"),
            apple: new Shape_From_File("assets/objs/apple.obj"),
            bed: new Shape_From_File("assets/objs/bed.obj"),
            closet: new Shape_From_File("assets/objs/closet.obj"),
            desk: new Shape_From_File("assets/objs/desk.obj"),
            desk_chair: new Shape_From_File("assets/objs/desk_chair.obj"),
            door: new Shape_From_File("assets/objs/door.obj"),
            table: new Shape_From_File("assets/objs/table.obj"),
            floor: new Shape_From_File("assets/objs/floor.obj"),
            grass: new Shape_From_File("assets/objs/grass.obj"),
            shelf: new Shape_From_File("assets/objs/shelf.obj"),
            sofa: new Shape_From_File("assets/objs/sofa.obj"),
            walls: new Shape_From_File("assets/objs/walls.obj"),
            window: new Shape_From_File("assets/objs/window.obj"),

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
            apple_tree: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .3, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/textures/apple_tree.png")
            }),
            apple: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .3, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/textures/apple.png"),
            }),
            bed: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .3, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/textures/bed.png"),
            }),
            closet: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .3, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/textures/closet.png"),
            }),            
            desk: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .3, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/textures/desk.png"),
            }),
            desk_chair: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .3, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/textures/desk_chair.png"),
            }),
            door: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .3, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/textures/door.png"),
            }),
            table: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .3, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/textures/table.png"),
            }),
            floor: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .3, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/textures/floor.png"),
            }),
            grass: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .3, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/textures/grass.png"),
            }),
            shelf: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .3, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/textures/shelf.png"),
            }),
            sofa: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .3, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/textures/sofa.png"),
            }),
            walls: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .3, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/textures/walls.png"),
            }),                                                                                    
            window: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .3, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/textures/window.png"),
            }),
        }
        
        this.shapes.sphere.arrays.texture_coord.forEach(p => p.scale_by(4));
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 30), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    make_control_panel() {


    }

    drawStuff(context, program_state) {
                
        let apple_tree = Mat4.identity();
        this.shapes.apple_tree.draw(context, program_state, apple_tree, this.materials.apple_tree);

        let bed = Mat4.identity();
        this.shapes.bed.draw(context, program_state, bed, this.materials.bed);

        let closet = Mat4.identity();
        this.shapes.closet.draw(context, program_state, closet, this.materials.closet);

        let desk = Mat4.identity();
        this.shapes.desk.draw(context, program_state, desk, this.materials.desk);

        let desk_chair = Mat4.identity();
        this.shapes.desk_chair.draw(context, program_state, desk_chair, this.materials.desk_chair);

        let door = Mat4.identity();
        this.shapes.door.draw(context, program_state, door, this.materials.door);

        let table = Mat4.identity();
        this.shapes.table.draw(context, program_state, table, this.materials.table);

        let floor = Mat4.identity();
        this.shapes.floor.draw(context, program_state, floor, this.materials.floor);

        let grass = Mat4.identity();
        this.shapes.grass.draw(context, program_state, grass, this.materials.grass);

        let shelf = Mat4.identity();
        this.shapes.shelf.draw(context, program_state, shelf, this.materials.shelf);       

        let sofa = Mat4.identity();
        this.shapes.sofa.draw(context, program_state, sofa, this.materials.sofa);

        let walls = Mat4.identity();
        this.shapes.walls.draw(context, program_state, walls, this.materials.walls);

        let window = Mat4.identity();
        this.shapes.window.draw(context, program_state, window, this.materials.window);                                                                                         

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

//         let flat_plane = Mat4.identity().times(Mat4.scale(100, 1/20, 100)).times(Mat4.translation(0, -20, 0));
//         this.shapes.cube.draw(context, program_state, flat_plane, this.materials.test.override({color: hex_color("#00ff00")}));

//         let apple_tree_model = Mat4.identity();
//         this.shapes.apple_tree.draw(context, program_state, apple_tree_model, this.materials.apple_tree);

//         let apple = Mat4.identity();
//         this.shapes.apple.draw(context, program_state, apple, this.materials.apple);

//         let desk = Mat4.identity();
//         this.shapes.desk.draw(context, program_state, desk, this.materials.desk);

//         let desk_chair = Mat4.identity();
//         this.shapes.desk_chair.draw(context, program_state, desk_chair, this.materials.desk_chair);
        
//         let window = Mat4.identity();
//         this.shapes.window.draw(context, program_state, window, this.materials.window);
        
        this.drawStuff(context, program_state);
//         let huge_scene_transform = Mat4.identity();
//         this.shapes.huge_scene.draw(context, program_state, huge_scene_transform, this.materials.apple_tree_texture);
        
    }
}
