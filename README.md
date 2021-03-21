# An Apple a Day

### CS 174A Final Project, Winter 2021



#### Team Members:

- Alejandro Zapata
- Eric Kong, 304601223
- Madhumathi Kannan, 205301761
- Wenqi Zou 205526077



#### Implementation Overview

Our project displays a warm, peaceful room in the middle of the city. We were inspired by the aesthetic presented by [this](https://www.youtube.com/watch?v=5qap5aO4i9A) long-running music stream on YouTube, and created a room with a view of an interactive apple tree. You can move around the room using the global camera, or using a player POV that constrains you to an axis ideal for window-viewing your apple tree and the city passing by outside, complete with mountains, clouds, and a 3-d cityscape. Outside, the apples on the tree can be clicked on to make them fall to the ground, where they may be lost in the grass or visible to you. Any visible apples can be clicked on again to be picked up and stored in your room - take a look around your room using the player POV to see where apples end up! If you need a little bit more light, try turning on your desk lamp by clicking on it. Fallen apples can be reset using the "Regrow fallen apples" button, which will remove  any apples from your room or the grass outside and put them back on the tree.

This project utilizes mouse clicking, collision detection, and some physics as advanced features.



#### Implementation & Advanced Features Details

###### New Assets Pipeline

###### 3-D Cityscape

###### Mouse Clicking & Free-Fall Physics

Mouse clicking is achieved using a special ID shader class that takes a specific degree of red as its constructor input and creates a flat version of the object that's colored using only that shade. Apples - and the lamp - are drawn twice in the scene, once with the ID shader and once without, and their ID shader color is preserved as an identifier. To prevent unnecessary scene redraws, clickable items are drawn first, assessed to see if they have been clicked, and then redrawn with their proper textures and shaders before the rest of the static scene is drawn. When a user clicks on the screen, their mouse coordinates are turned into canvas coordinates, and then the pixels underneath those canvas coordinates are read using the built in readPixels function. If the shade of the pixel read matches the shade of any of the clickable objects we have, we know we have to do something with the object clicked. 

Apples can be made to fall of the tree in this way, and when they fall they obey the laws of motion and fall according to the displacement equation of free-falling objects, found in basic physics texts. Because the weight distributions in apples is not even and they tend to be bottom-heavy, we introduce an amount of rotation to more realistically simulate the falling apple, and fallen apples that lay on the grass will lay on whatever angle of rotation they end their fall with. Fallen apples can still be clicked on to arrange them on the shelves inside the room, and then can be sent back to the tree and re-clicked on using the "Regrow fallen apples button."

We also have a clickable object in the room in the form of a lamp; clicking on the lamp and turning it "on" and "off" either sets a local spotlight for the desk to be either visible or invisible.

###### Collision Detection

Collision detection is implemented to prevent apples from falling through the grassland. Apples are modeled as spheres.  Grasslands near the tree are approximated as a combination of three planes since the grassland is not flat. Function for each plane is calculated by locating three points on that plane. Implicit represnetation for function is used since it allows us to determine which side of the plane an apple is at, and it makes collision point calculation simplier.

We maintain a global variable called apple_coords to keep track of curent coordinates of each apple. Everytime the location of an apple is updated, the correpsonding entry of apple_coords is updated and we make a call to collision_detection function. Depending on the x value of the apple, we plug in the apple coordinates to the corresponding plane function and when the result is smaller or equal to 0, we know a collision happens . The transformation matrix of the apple is then changed so that the apple stop falling.

#### References

1. Mouse Clicking: https://webglfundamentals.org/webgl/lessons/webgl-picking.html
2. Collision Detection: https://learnopengl.com/In-Practice/2D-Game/Collisions/Collision-detection

   





  
