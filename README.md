# An Apple a Day

### CS 174A Final Project, Winter 2021



#### Team Members:

- Alejandro Zapata 205354392
- Eric Kong, 304601223
- Madhumathi Kannan, 205301761
- Wenqi Zou, 205526077



#### Implementation Overview

Our project displays a warm, peaceful room in the middle of the city. We were inspired by the aesthetic presented by [this](https://www.youtube.com/watch?v=5qap5aO4i9A) long-running music stream on YouTube, and created a room with a view of an interactive apple tree. You can move around the room using the global camera, or using a player POV that constrains you to an axis ideal for window-viewing your apple tree and the city passing by outside, complete with mountains, clouds, and a 3-d cityscape. Outside, the apples on the tree can be clicked on to make them fall to the ground, where they may be lost in the grass or visible to you. Any visible or falling apples can be clicked on again to be picked up and stored in your room - take a look around your room using the player POV to see where apples end up! Apples fall according to real-world gravity, which can be hard to catch with your mouse; if you want to slow things down, try clicking on the "Slow gravity toggle" button while no objects are in motion to toggle on and off a mode with much lower gravity than real-life. If you need a little bit more light, try turning on your desk lamp by clicking on it. Fallen apples can be reset using the "Regrow fallen apples" button, which will remove  any apples from your room or the grass outside and put them back on the tree.

As an added bonus, clicking the "Play lo-fi music" button will begin to play a lofi track created by Eric for this project!

This project utilizes mouse clicking, collision detection, and some physics as advanced features.



#### Implementation & Advanced Features Details

###### New Assets Pipeline

All our 3d objects were processed or modeled with blender to fit our project. Those which were sourced from the internet started out as an untextured 3-d object, and then went through the process of uv-unwrapping and texturing by hand. The scene itself was constructed in blender, and other than some select objects many of the elements’ locations are baked into the object files themselves.

###### 3-D Cityscape

We craft a skyline out of 3-D primitives. In order to do so, we define a Building class, where each building is a collection of one or more 3-D shapes from examples/common.js, and we have the graphics card draw each shape over and over again in various places, with different scalings, in sundry shades of gray-black, to simulate a silhouette of a varied skyline. The buildings are located at different distances from the room, so that a parallax effect can be observed while moving through the space.

###### Mouse Clicking & Free-Fall Physics

Mouse clicking is achieved using a special ID shader class that takes a specific degree of red as its constructor input and creates a flat version of the object that's colored using only that shade. Apples - and the lamp - are drawn twice in the scene, once with the ID shader and once without, and their ID shader color is preserved as an identifier. To prevent unnecessary scene redraws, clickable items are drawn first, assessed to see if they have been clicked, and then redrawn with their proper textures and shaders before the rest of the static scene is drawn. When a user clicks on the screen, their mouse coordinates are turned into canvas coordinates, and then the pixels underneath those canvas coordinates are read using the built in readPixels function. If the shade of the pixel read matches the shade of any of the clickable objects we have, we know we have to do something with the object clicked. 

Apples can be made to fall off the tree in this way, and when they fall they obey the laws of motion and fall according to the displacement equation of free-falling objects, found in basic physics texts. Because the weight distributions in apples are not even and they tend to be bottom-heavy, we introduce an amount of rotation to more realistically simulate the falling apple, and fallen apples that lay on the grass will lay on whatever angle of rotation they end their fall with. 

Both falling and fallen apples can be clicked on to arrange them on the shelves and surfaces inside the room, and then can be sent back to the tree and re-clicked on using the "Regrow fallen apples button." Because normal gravity will send apples plummeting quite quickly, the "Slow gravity toggle" will switch on and off a mode that reduces gravity in our free-fall motion equations. Gravity _cannot_ be switched while objects are in free fall; if the button is hit when an object is falling, nothing will happen. This is to prevent distance interactions that will send apples hurtling far off and to keep apples safely in our scene.

We also have a clickable object in the room in the form of a lamp; clicking on the lamp and turning it "on" and "off" either sets a local spotlight for the desk to be either visible or invisible.

###### Collision Detection

Collision detection is implemented to prevent apples from falling through the grassland. Apples are modeled as spheres.  Grasslands near the tree are approximated as a combination of three planes since the grassland is not flat. Function for each plane is calculated by locating three points on that plane. Implicit represnetation for function is used since it allows us to determine which side of the plane an apple is at, and it makes collision point calculation simplier.

We maintain a global variable called apple_coords to keep track of curent coordinates of each apple. Everytime the location of an apple is updated, the correpsonding entry of apple_coords is updated and we make a call to collision_detection function. Depending on the x value of the apple, we plug in the apple coordinates to the corresponding plane function and when the result is smaller or equal to 0, we know a collision happens . The transformation matrix of the apple is then changed so that the apple stop falling.

#### References

1. Mouse Clicking: https://webglfundamentals.org/webgl/lessons/webgl-picking.html
2. Collision Detection: https://learnopengl.com/In-Practice/2D-Game/Collisions/Collision-detection
3. Free 3D assets: https://www.patreon.com/quaternius





  
