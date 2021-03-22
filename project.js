import {defs, tiny} from './examples/common.js';
import {Shape_From_File} from "./examples/obj-file-demo.js";

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;
const {Triangle, Square, Tetrahedron, Windmill, Cube, Cylindrical_Tube, Subdivision_Sphere, Textured_Phong} = defs;
const Apple_Circle_Radius = 0.08

// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
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

//global apple constants let us store and maintain where they go and what id color they're assigned
let apple_id_tint = 1.0;
let next_apple = 0;
let apples = [];
let apple_transform_coords = [[4.4, 11.7, -35], [3, 11.85, -31.23], [2.5, 11.17, -33], [1.6, 11.3, -31], [0.8, 10.55, -34],
    [-0.2, 10.9, -32], [-0.7, 11.2, -31], [-1.8, 10.15, -32.25], [-3.8, 10.78, -32.5], [-5.9, 10.8, -34],
    [-3, 8.4, -32.5], [-4.7, 8.6, -32]]
let max_apples = 12;
//each shelf is 1.26 below its parent on the y axis, for reference
let apples_shelf_coords = [[7, 4.93, 0.6], [7, 3.67, 0.6], [7, 2.41, 0.6], [7, 1.15, 0.6], [7, -0.11, 0.6], [7, -1.37, 0.6],
    [-5.8, 3.64, 14.2], [-5.8, 2.38, 14.2], [-5.8, 1.12, 14.2], [-5.8, -0.14, 14.2], [7.2, 1.27, 12.6], [7.2, 1.27, 10]];
let num_on_shelf = 0;
let max_in_room = 12;


let lamp = undefined;


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
            "plant",
            "laptop",
            "cactus",
        ];

        this.clickables_to_import = [
            "apple",
            "desk_lamp",
        ];

        this.shapes = {};
        this.to_import.forEach(e => this.shapes[e] = new Shape_From_File(`${this.obj_path}${e}.obj`));
        this.clickables_to_import.forEach(e => this.shapes[e] = new Shape_From_File(`${this.obj_path}${e}.obj`));
        this.shapes["sphere"] = new defs.Subdivision_Sphere(4);
        this.shapes["sphere2"] = new defs.Subdivision_Sphere(4);
        this.shapes["skyline"] = new Shape_From_File(`${this.obj_path}skyline.obj`)
        this.shapes["cube"] = new Cube();
        this.shapes["square"] = new defs.Square();

        this.materials = {};
        this.to_import.forEach(e => 
            this.materials[e] = new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .4, diffusivity: 0.2, specularity: 0.0,
                texture: new Texture(`${this.texture_path}${e}.png`)
        }));

        this.clickables_to_import.forEach(e =>
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

        this.materials["test"] = new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .2, color: hex_color("#ffffff")});

        this.materials["pavement"] = new Material(new Textured_Phong(), {
            color: hex_color("#3f3f3f"),
            ambient: .5, diffusivity: 0.1, specularity: 0.0,
            texture: new Texture(`${this.texture_path}pavement.png`)
        });

        /* this.materials["test"] = new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .4, diffusivity: 0.2, specularity: 0.0,
                texture: new Texture(`${this.texture_path}background_sky.png`)
        }); */

        // Buildings
        this.buildings = [];
        this.initialize_buildings(250);

        //this material should never be displayed to user, only used for clicking
        this.materials["apple_id"] = new Array(max_apples)
        for (let i = 0; i < max_apples; i++) {
            this.materials["apple_id"][i] = new Material(new Apple_ID_Shader(2, (apple_id_tint - (i * 0.05))));
        }

        this.materials["lamp_id"] = new Material(new Apple_ID_Shader(2, (apple_id_tint - (max_apples * 0.05))));


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

        //apples! everything you need
        //mouse coords
        this.mouse_x = 0;
        this.mouse_y = 0;
        //clicked flag
        this.is_clicked = false;
        this.canPrint = false;
        //scratchpad context to render scene for clicking
        this.scratchpad = document.createElement('canvas');
        this.scratchpad_context = this.scratchpad.getContext('2d');
        this.scratchpad.width = 1080;
        this.scratchpad.height = 600;
        this.animation_queue = [];
        this.slow_gravity = false;

        //Collision detection
        this.apple_coords = [];
        this.grass_plan_cofficients = [[]];
        this.regrow_clicked = false;

        // audio
        this.lo_fi = new Audio('assets/lo_fi_for_CS_174A.mp3');
        this.is_playing_audio = false;
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
        this.new_line();
        this.key_triggered_button("Regrow fallen apples", ["g"], () => this.regrow_clicked = true, "#640d14");
        this.new_line();
        this.key_triggered_button("Slow gravity toggle", ["m"], () => this.slow_gravity_toggle(), "#0B7A75");
        this.new_line();
        this.key_triggered_button("Play lo-fi music", ["p"], () => this.audio_toggle(), "#78A2CC");
    }
    
    audio_toggle() {
        if (this.is_playing_audio == false) {
            this.lo_fi.currentTime = 0;
            this.lo_fi.play();
            this.is_playing_audio = true;
        } else {
            this.lo_fi.pause();
            this.is_playing_audio = false;
        }
    }

    slow_gravity_toggle() {
        if (apples.every(element => element.is_falling === false)){
            this.slow_gravity = !this.slow_gravity;
        }
    }

    // static objects that don't need animation and don't need model_transforms we need to keep track of
    draw_static_objects(context, program_state) {
        this.to_import.forEach(e => this.shapes[e].draw(context, program_state, Mat4.identity(), this.materials[e]));

        //extra plants?
        let shelf_plant = Mat4.identity().times(Mat4.translation(-7.8, 4.1, 14.2))
            .times(Mat4.scale(0.4, 0.4, 0.4))
        this.shapes['plant'].draw(context, program_state, shelf_plant, this.materials['plant']);
        let shelf_cactus = Mat4.identity().times(Mat4.translation(-56.25, -48.5, 12.2))
            .times(Mat4.scale(8, 8, 8))
        this.shapes['cactus'].draw(context, program_state, shelf_cactus, this.materials['cactus']);


        ////
        // Eric is doing stuff
        ////a

        let flat_plane = Mat4.identity().times(Mat4.scale(400, 1/20, 400)).times(Mat4.translation(0, -100, 0));
        this.shapes.cube.draw(context, program_state, flat_plane, this.materials.pavement);
        this.draw_cityscape(context, program_state, Mat4.identity());

        ////
        // End of Eric's stuff
        ////
    }

    initialize_buildings(num_buildings) {
        for (let i = 0; i < num_buildings; i++) {
            // Choose what kind of building this one will be.
            let kind = 0;
            let whatKind = Math.random();
            if (whatKind < 0.5) {
                kind = 0;
            } else if (whatKind < 0.7) {
                kind = 1;
            } else if (whatKind < 0.85) {
                kind = 2;
            } else {
                kind = 3;
            }
            // Choose width and height
            let width = getRandom(1, 2);
            let height = getRandom(4, 16);
            if (kind == 0) {
                if (Math.random() < 0.3) {
                    width = getRandom(10, 20);
                    height = getRandom(3, 6);
                }
            }
            // Choose distance and angle.
            const distance = getRandom(100, 350);
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
        model_transform = model_transform.times(Mat4.translation(building.x, -5, building.z));
        // Building Kind 0: Just a box
        if (kind == 0)
        {
            model_transform = model_transform.times(Mat4.translation(0, height - 1, 0));
            model_transform = model_transform.times(Mat4.scale(width, height, width));
            this.shapes.cube.draw(context, program_state, model_transform, this.materials.test.override({color: hex_color("#696969")}));
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
            this.shapes.cube.draw(context, program_state, model_transform, this.materials.test.override({color: hex_color("#919191")}));
            model_transform = model_transform.times(Mat4.scale(1/width, 1/height, 1/width));
            model_transform = model_transform.times(Mat4.translation(0, height, 0));
            model_transform = model_transform.times(Mat4.scale(width/2, width/2, width/2));
            model_transform = model_transform.times(Mat4.rotation(Math.PI / 2, 1, 0, 1));
            this.shapes.cube.draw(context, program_state, model_transform, this.materials.test.override({color: hex_color("#919191")}));
        }


    }

    draw_cityscape(context, program_state, model_transform) {
        // model_transform = model_transform.times(Mat4.translation(0, 0, -200));
        this.buildings.forEach(building => {
            this.draw_building(context, program_state, model_transform, building);
        })

    }

    draw_apples(context, program_state, mat, t) {
        let in_room_index = 0;
        for (let i = 0; i < apples.length; i++) {
            if (apples[i].on_tree) {
                if (mat === "apple_id") {
                    this.shapes['apple'].draw(context, program_state, apples[i].apple_placement, this.materials[mat][i]);
                } else {
                    this.shapes['apple'].draw(context, program_state, apples[i].apple_placement, this.materials[mat]);
                }
                this.apple_coords[i] = vec3(apples[i].default_loc[0][3], apples[i].default_loc[1][3], apples[i].default_loc[2][3]);
                // let circle = apples[i].apple_placement.times(Mat4.scale(0.08, 0.08, 0.08))
                // this.shapes.sphere.draw(context, program_state, circle, this.materials.floor);
            } else if (!apples[i].on_tree && !apples[i].on_desk) {
                let old_placement = apples[i].apple_placement;
                let animate_info = this.animation_queue.find(element => element.id == apples[i].id)
                let g = 9.8;
                if (this.slow_gravity) {
                    g = g/16;
                }
                let new_y = 0.5 * g * ((t - animate_info.start)) ** 2
                let rot_angle = 5 * t
                let current_y = old_placement[1][3]
                //TO-DO: with collision detection, this should be IF collided, not if some arbitrary y-value
                this.apple_coords[i] = vec3(apples[i].apple_placement[0][3], apples[i].apple_placement[1][3], apples[i].apple_placement[2][3]);
                if (this.collision_detection(i) == false) {
                    apples[i].apple_placement = apples[i].default_loc
                        .times(Mat4.translation(0, -1 * new_y, 0))
                        .times(Mat4.rotation(rot_angle, 1, 0, 0));
                }
                else{
                    apples[i].is_falling = false;
                }
                if (mat === "apple_id") {
                    this.shapes['apple'].draw(context, program_state, apples[i].apple_placement, this.materials[mat][i]);
                } else {
                    this.shapes['apple'].draw(context, program_state, apples[i].apple_placement, this.materials[mat]);
                }
            } else if (!apples[i].on_tree && apples[i].on_desk && in_room_index < max_in_room) {
                apples[i].apple_placement = Mat4.identity()
                    .times(Mat4.translation(apples_shelf_coords[in_room_index][0], apples_shelf_coords[in_room_index][1], apples_shelf_coords[in_room_index][2]))
                    .times(Mat4.scale(4, 4, 4));
                in_room_index += 1;
                if (mat === "apple_id") {
                    this.shapes['apple'].draw(context, program_state, apples[i].apple_placement, this.materials[mat][i]);
                } else {
                    this.shapes['apple'].draw(context, program_state, apples[i].apple_placement, this.materials[mat]);
                }
            }
            if (this.regrow_clicked && !apples[i].on_tree) {
                apples[i].on_tree = true;
                apples[i].on_desk = false;
                num_on_shelf = 0;
                apples[i].apple_placement = apples[i].default_loc
            }
        }
    }

    draw_lamp(context, program_state, mat){
        this.shapes['desk_lamp'].draw(context, program_state, Mat4.identity(), this.materials[mat]);
    }

    // draw and animate the background
    make_sky_box(context, program_state, t) {
        let background_sky = Mat4.identity().times(Mat4.scale(400,400,400));
        background_sky = background_sky.times(Mat4.rotation(t * 1 / 250 * 2 * Math.PI, 0, 1, 0));
        this.shapes.sphere.draw(context, program_state, background_sky, this.materials.background_sky);

        let foreground_sky = Mat4.identity().times(Mat4.scale(300, 300, 300));
        foreground_sky = foreground_sky.times(Mat4.rotation(t * 1 / 200 * 2 * Math.PI, 0, 1, 0));
        this.shapes.sphere2.draw(context, program_state, foreground_sky, this.materials.foreground_sky);

        let skyline = Mat4.identity().times(Mat4.rotation(Math.PI/2, 0, 1, 0)).times(Mat4.translation(0, -60, 0)).times(Mat4.scale(80, 80, 80));
        this.shapes.skyline.draw(context, program_state, skyline, this.materials.skyline);
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

    bind_event() {
        let canv = document.getElementById('main-canvas').getElementsByTagName("canvas")[0];
        canv.addEventListener('mousedown', (e) => {
            const rect = canv.getBoundingClientRect();
            this.mouse_x = e.clientX - rect.left;
            this.mouse_y = e.clientY - rect.top;

            this.canPrint = !this.canPrint;
            this.is_clicked = true;
        })
    }

    create_apple(context, program_state){
        let r_value = Math.floor((apple_id_tint - (next_apple * 0.05)) * 255)
        let place_x = apple_transform_coords[next_apple][0];
        let place_y = apple_transform_coords[next_apple][1];
        let place_z = apple_transform_coords[next_apple][2];
        let apple_placement = Mat4.identity().times(Mat4.translation(place_x, place_y, place_z))
            .times(Mat4.scale(4, 4, 4));
        let new_apple = {
            id: r_value,
            apple_placement: apple_placement,
            on_tree: true,
            on_desk: false,
            default_loc: apple_placement.times(Mat4.identity()),
            is_falling: false,
        };
        apples.push(new_apple)
        next_apple += 1;
        if (next_apple == max_apples){
            next_apple = 0;
        }
        if(!lamp){
            let r_value = Math.floor((apple_id_tint - (max_apples * 0.05)) * 255)
            lamp = {
                id: r_value,
                is_on: false
            };
        }
    }

    make_and_draw_apples(context, program_state, t){
        //apples! the apples info for drawing is already there, technically, but store the info for clicking
        let canvas = document.getElementById('main-canvas').getElementsByTagName("canvas")[0];
        while(apples.length < max_apples) {
            this.create_apple(context, program_state)
        }

        //get pixel coords
        const pixelX = this.mouse_x *  context.width / canvas.clientWidth;
        const pixelY = context.height - this.mouse_y * context.height / canvas.clientHeight - 1;
        const data = new Uint8Array(4);



        this.draw_apples(context, program_state, "apple_id", t)
        this.draw_lamp(context, program_state, "lamp_id")
        this.scratchpad_context.drawImage(context.canvas, 0, 0, 1080, 600);
        if (this.is_clicked) {
            context.context.readPixels(
                pixelX,            // x
                pixelY,            // y
                1,                 // width
                1,                 // height
                context.context.RGBA,           // format
                context.context.UNSIGNED_BYTE,  // type
                data);             // typed array to hold result
            const new_id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);
            for (let i = 0; i < apples.length; i++) {
                if (apples[i].on_tree && (data[0] === apples[i].id || data[0] === apples[i].id + 1)) {
                    let animate_info = this.animation_queue.find(element => element.id == apples[i].id);
                    if (animate_info) {
                        animate_info.start = t;
                    }
                    else {
                        let animation_apple = {
                            id: apples[i].id,
                            start: t,
                        }
                        this.animation_queue.push(animation_apple);
                        apples[i].is_falling = true;
                    }
                    apples[i].on_tree = false;
                    console.log(apples[i].apple_placement);
                    console.log("moved");
                }
                else if (!apples[i].on_tree && (data[0] === apples[i].id || data[0] === apples[i].id + 1) && num_on_shelf < max_in_room){
                    apples[i].on_desk = true;
                    apples[i].apple_placement = apples_shelf_coords[num_on_shelf];
                    if (num_on_shelf < max_in_room){
                        num_on_shelf += 1;
                    }
                }
            }
            if(data[0] === lamp.id || data[0] === lamp.id + 1){
                if(!lamp.is_on){
                    lamp.is_on = true;
                }
                else{
                    //program_state.lights.pop(1);
                    //console.log(program_state.lights);
                    lamp.is_on = false;
                }
            }
            this.is_clicked = !this.is_clicked;
        }
        context.context.clear(context.context.COLOR_BUFFER_BIT | context.context.DEPTH_BUFFER_BIT);
        this.draw_apples(context, program_state, "apple", t);
        this.draw_lamp(context, program_state, "desk_lamp");

    }

    // We model the the grassland as a plane and circle bounding box is used for
    // modeling edges of the apple
    // the formula for surface of the grassland is -1.05x+10y-0.1z+16.07=0
    collision_detection(index) {
        let apple_coord = this.apple_coords[index];
        console.log()
        // if(0.011925*apple_coord[0] + 1.025*(apple_coord[1]-Apple_Circle_Radius) -0.05724 * (apple_coord[2])> -0.1844575) {
        if(apple_coord[0] > -1) {
            if(1.4*(apple_coord[1]-Apple_Circle_Radius) + 0.1946*(apple_coord[2]-Apple_Circle_Radius) > -9.2666) {
                return false;
            }else {

                return true;
            }
        }else if(apple_coord[0] < -5) {
            if(-0.00137*apple_coord[0] + 0.976*(apple_coord[1]-Apple_Circle_Radius) > -1.6043) {
                return false;
            }else {
                return true;
            }
        }else {
            if(0.0122525*apple_coord[0]+ 1.225*(apple_coord[1]-Apple_Circle_Radius) + 0.454749*apple_coord[2] > -17.08356475) {
                return false;
            }else {
                return true;
            }
        }
    }


    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);

            //bind mouse click
            this.bind_event()
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

        const light_position = vec4(10, 10, 0, 0);
        //[1.3, 2.1, 0]
        let lamp_light_pos = vec4(2.3, 2.1, 0, 1);
        //program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
        program_state.lights = [new Light(light_position, color(252/255, 238/255, 167/255, 1.0), 1000)];
        program_state.lights.push(new Light(lamp_light_pos, color(0, 0, 0, 0), 10));

        //clickable objects MUST be drawn before the rest of the scene
        // anything drawn before the clickable object WILL BE ERASED
        this.make_and_draw_apples(context, program_state, t)


        if(lamp.is_on){
            program_state.lights[1].color = color(255/255, 174/255, 66/255, 0);
        }
        else{
            program_state.lights[1].color = color(0, 0, 0, 0);
        }


        if (this.regrow_clicked){
            this.regrow_clicked = false;
        }


        this.make_sky_box(context, program_state, t);
        this.draw_static_objects(context, program_state);


        this.update_player();





    }
}

class Apple_ID_Shader extends Shader {
    // This is a Shader using Phong_Shader as template

    constructor(num_lights = 2, r_color) {
        super();
        this.num_lights = num_lights;
        this.r_color = r_color;
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
                gl_FragColor = vec4(` + this.r_color + `, 0.0, 0.0, 1.0);                                                    
                //gl_FragColor = ` + this.color + `;
                //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
                //gl_FragColor = apple_colors[next_apple];
                //next_apple += 1;
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

