# Canvas Sobel Triangulator

![image](region-of-interest-into-polygon.png)

This experiment detects "regions of interest" from a canvas object via a simple pixel filter.

    The Sobel operator, sometimes called Sobel Filter,
    is used in image processing and computer vision,
    particularly within edge detection algorithms,
    and creates an image which emphasizes edges and transitions.

Once these points are extracted from the canvas object, they are sent through a point simplification filter to reduce the total number of points. These points are then used to create a convex polygon that roughly traces the original blob of pixels. This polygon is then triangulated so that it may be sent into a physics engine to compute collisions with other objects in the scene. In this manner it is then possible to use bitmap style "painting" techniques to construct/deconstruct objects that are then used to collide with other things.

# Research

http://en.wikipedia.org/wiki/Sobel_operator

http://en.wikipedia.org/wiki/Polygon_triangulation

https://github.com/kripken/box2d.js/

http://code.google.com/p/poly2tri/source/browse/README.md?repo=javascript

http://www.vellios.com/2010/06/06/box2d-and-radial-gravity-code/

http://dylowen.blogspot.com/2012/01/destructible-environment-quad-tree.html

http://chrisbunner.wordpress.com/2011/01/23/terrain-rendering/

http://www.emanueleferonato.com/2012/03/28/simulate-radial-gravity-also-know-as-planet-gravity-with-box2d-as-seen-on-angry-birds-space/

http://box2d.org/forum/viewtopic.php?f=8&t=2686

http://www.vellios.com/2010/06/06/box2d-and-radial-gravity-code/

http://stackoverflow.com/questions/9862771/any-ideas-on-how-to-create-accurate-orbital-gravity-using-box2d

http://www.imageprocessingplace.com/downloads_V3/root_downloads/tutorials/contour_tracing_Abeer_George_Ghuneim/alg.html

http://stackoverflow.com/questions/9446420/box2d-giving-an-object-attraction-gravity

http://www.cocos2d-iphone.org/forum/topic/30866

http://gamedev.sleptlate.org/blog/233-shattering-terrain-and-more-futzing-with-box2d/

http://www.box2d.org/forum/viewtopic.php?f=3&t=1180

http://gamedev.stackexchange.com/questions/6721/implementing-a-2d-destructible-landscape-like-worms

http://gamedev.stackexchange.com/questions/28718/how-can-i-convert-a-2d-bitmap-used-for-terrain-to-a-2d-polygon-mesh-for-collis

https://gist.github.com/adammiller/826148

http://mourner.github.io/simplify-js/

http://stackoverflow.com/questions/13730062/simplifying-svg-path-strings-by-reducing-number-of-nodes

http://paperjs.org/tutorials/paths/smoothing-simplifying-flattening/

http://www.wizards23.net/projects2011/surfaceaugmenter/SobelOperatorDemo.html?

http://gamedev.stackexchange.com/questions/13229/sorting-array-of-points-in-clockwise-order

http://stackoverflow.com/questions/6989100/sort-points-in-clockwise-order

http://www.iue.tuwien.ac.at/phd/fleischmann/node54.html
