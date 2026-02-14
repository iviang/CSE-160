class Rat {
  constructor() {
    this.position = [0, 0, 0];
    this.rotation = 0;
    //color creation
    const BLACK = [0.0, 0.0, 0.0, 1.0];
    const PINK  = [1.0, 0.6, 0.7, 1.0];
    const DPINK = [0.6, 0.5, 0.6, 1.0]; //darker pink
    const LGREY = [0.7, 0.7, 0.7, 1.0]; //light grey
    const GREY = [0.6, 0.6, 0.6, 1.0]; //grey
    const LLGREY = [0.9, 0.9, 0.9, 1.0]; //super light grey
    const MGREY = [0.8, 0.8, 0.8, 1.0]; //medium grey
    const DGREY = [0.55, 0.55, 0.55, 1.0];; //darky grey
    const DDGREY = [0.5, 0.5, 0.5, 1.0];; //darkER grey 
  }

  

  render() {
    //base
    var base = new Matrix4();
    base.translate(this.position[0], this.position[1], this.position[2]);
    base.rotate(this.rotation, 0, 1, 0);

    //draw the body cube
    var body = new Cube();
    body.color = MGREY;
    body.matrix.set(base); 
    body.matrix.scale(.5, .3, .5);
    body.render();

    var bodyCoordinates= new Matrix4(body.matrix);

    //butt =======================================================

    var butt = new Cube();
    butt.color = GREY;
    butt.matrix.set(base);
    butt.matrix.translate(-0.20, -0.05, -0.025);
    butt.matrix.rotate(g_buttAngle, 0,1,0);
    butt.matrix.scale(0.3, 0.36, 0.55);
    butt.render();
    
    var buttCoordinates = new Matrix4(butt.matrix);

    // TAIL =======================================================
    // connect to butt

    //base of tail
    var btail = new Cube();
    btail.color = DPINK;
    btail.matrix.set(buttCoordinates); //connects to butt
    btail.matrix.translate(-.25,.15,.4);
    btail.matrix.rotate(g_btail, 0,1,0);
    btail.matrix.scale(.3, .3, .2);
    btail.render();

    var btailCoordinates = new Matrix4(btail.matrix);

    // mid tail 1

    var m1tail = new Cube();
    m1tail.color = PINK;
    m1tail.matrix.set(btailCoordinates); //connect to base of tail
    m1tail.matrix.translate(-.9,.1,.2);
    m1tail.matrix.rotate(g_m1tail, 0,1,0);
    m1tail.matrix.scale(1, .8, .6);
    m1tail.render();

    var m1tailCoordinates = new Matrix4(m1tail.matrix);

    // mid tail 2
    var m2tail = new Cube();
    m2tail.color = PINK;
    m2tail.matrix.set(m1tailCoordinates); //connect to base of tail
    m2tail.matrix.translate(-.9,.1,.2);
    m2tail.matrix.rotate(g_m2tail, 0,1,0);
    m2tail.matrix.scale(1, .65, .6);
    m2tail.render();

    var m2tailCoordinates = new Matrix4(m2tail.matrix);

    // tail tip
    var tiptail = new Cone();
    tiptail.color = PINK;
    tiptail.matrix.set(m2tailCoordinates); //connect to base of tail
    tiptail.matrix.translate(-.9,.1,.2);
    tiptail.matrix.rotate(g_tiptail, 0,1,0);
    tiptail.matrix.scale(1, .65, .6);
    tiptail.matrix.translate(1, 0.1, 0.0); 
    tiptail.matrix.rotate(90, 0, 0, 1); //rotates the point of the cone
    tiptail.render();

    //HEAD ==================================================================================
    
    var head = new Cube();
    head.color = LLGREY;
    head.matrix.set(bodyCoordinates); //connects to body
    head.matrix.translate(1,0,0.07);
    head.matrix.rotate(-g_headAngle, 0,1,0); //move head
    head.matrix.scale(.5, .9, .85);
    head.render();

    var headCoordinates = new Matrix4(head.matrix);

    //ears ===============================================
    var earR = new Cone();
    earR.color = GREY;
    earR.matrix.set(headCoordinates);
    earR.matrix.translate(0, 1.25, -0.13);
    earR.matrix.rotate(90, 1, 0, 0);
    earR.matrix.scale(0.4, 0.2, 0.6);
    earR.render();

    var inearR = new Cone();
    inearR.color = PINK;
    inearR.matrix.set(headCoordinates);
    inearR.matrix.translate(0.1, 1.15, -0.1);
    inearR.matrix.rotate(90, 1, 0, 0);
    inearR.matrix.scale(0.2, 0.1, 0.4);
    inearR.render();

    var earL = new Cone();
    earL.color = GREY;
    earL.matrix.set(headCoordinates);
    earL.matrix.translate(0, .6, 1.15);
    earL.matrix.rotate(-90, 1, 0, 0);
    earL.matrix.scale(0.4, 0.2, 0.6);
    earL.render();

    var inearL = new Cone();
    inearL.color = PINK;
    inearL.matrix.set(headCoordinates);
    inearL.matrix.translate(0.12, .7, 1.13);
    inearL.matrix.rotate(-90, 1, 0, 0);
    inearL.matrix.scale(0.2, 0.1, 0.4);
    inearL.render();


    //snout ========================================================
    var snout = new Cube();
    snout.color = LLGREY;
    snout.matrix.set(headCoordinates); //connects to head
    snout.matrix.translate(1,0.05,0.16);
    snout.matrix.scale(.4, .8, .7);
    snout.render();

    var snoutCoordinates = new Matrix4(snout.matrix);

    //snout2
    var snout2 = new Sphere();
    snout2.color = LLGREY;
    snout2.matrix.set(snoutCoordinates); //connects to head
    snout2.matrix.translate(0.6,0,0.16);
    snout2.matrix.scale(1, 0.8, .8);
    snout2.render();

    var snout2Coordinates = new Matrix4(snout2.matrix);

    //nose ================================================================
    var nose = new Sphere();
    nose.color = PINK; 
    nose.matrix.set(snout2Coordinates); //connects to head
    nose.matrix.translate(.8,0.05,0.4);
    nose.matrix.scale(.5, .3, .2);
    nose.render();

    //EYES ==============================================================
    var eyeR = new Sphere();
    eyeR.color = BLACK;
    eyeR.matrix.set(snoutCoordinates);
    eyeR.matrix.translate(0, 0.5, -.2);
    eyeR.matrix.scale(0.5, 0.3, 0.3);
    eyeR.render();

    var eyeL = new Sphere();
    eyeL.color = BLACK;
    eyeL.matrix.set(snoutCoordinates);
    eyeL.matrix.translate(0, 0.5, .9);
    eyeL.matrix.scale(0.5, 0.3, 0.3);
    eyeL.render();



    //LEGS (4 upper + 4 lower + 4 paws) =======================================================

    //R SIDE:==============================================

    // upper FRONT RIGHT leg
    var upperFR = new Cube();
    upperFR.color = LGREY;

    upperFR.matrix.set(bodyCoordinates); //connects to body
    upperFR.matrix.translate(0.75, -.3, -0.01);
    upperFR.matrix.rotate(g_upperFR, 0,0,1); //move the leg
    upperFR.matrix.scale(0.15, 0.6, 0.25);
    upperFR.render(); 
    var upperFRCoordinates=new Matrix4(upperFR.matrix);

    // lower FRONT RIGHT leg
    var lowerFR = new Cube();
    lowerFR.color = GREY; 

    lowerFR.matrix.set(upperFRCoordinates); //CONNECTS TO UPPER LEG
    lowerFR.matrix.translate(1, 0, 0.5);
    lowerFR.matrix.rotate(g_lowerFR, 0,0,1); //set up for joint
    lowerFR.matrix.scale(0.8, .7, 0.9);
    lowerFR.matrix.translate(-1.0, -1.0, -0.5);

    lowerFR.render();
    var lowerFRCoordinates=new Matrix4(lowerFR.matrix);

    // Front RIGHT paw
    var pawFR = new Cube();
    pawFR.color = PINK;

    pawFR.matrix.set(lowerFRCoordinates); //CONNECTS TO UPPER LEG
    pawFR.matrix.translate(.5, -.1, 0.1);
    pawFR.matrix.rotate(g_pawFR, 0,0,1); //set up for joint
    pawFR.matrix.scale(0.8, .1, 0.9);
    pawFR.render();


    
    // upper BACK RIGHT leg
    var upperBR = new Cube();
    upperBR.color = DGREY;

    upperBR.matrix.set(buttCoordinates); //connects to body
    upperBR.matrix.translate(0.5, -.1, -0.01);
    upperBR.matrix.rotate(g_upperBR, 0,0,1);
    upperBR.matrix.scale(0.4, 0.6, 0.2);
    upperBR.render(); 
    var upperBRCoordinates=new Matrix4(upperBR.matrix);

    // lower BACK RIGHT leg
    var lowerBR = new Cube();
    lowerBR.color = GREY; 

    lowerBR.matrix.set(upperBRCoordinates); //CONNECTS TO UPPER LEG
    lowerBR.matrix.translate(.2, -.7, 0.1);
    lowerBR.matrix.translate(1.0, 0.05, 0.5);
    lowerBR.matrix.rotate(g_lowerBR, 0,0,1); //set up for joint
    lowerBR.matrix.translate(-1.0, 0.0, -0.5);
    lowerBR.matrix.scale(0.8, .7, 0.9);
    lowerBR.matrix.translate(-0.4, 0, 0.0);
    lowerBR.render();
    var lowerBRCoordinates=new Matrix4(lowerBR.matrix);

    // BACK RIGHT paw
    var pawBR = new Cube();
    pawBR.color = [1.0, 0.6, 0.7, 1.0]; // [0.6, 0.6, 0.6, 1.0];

    pawBR.matrix.set(lowerBRCoordinates); //CONNECTS TO UPPER LEG
    pawBR.matrix.translate(.5, -.1, 0.1);
    pawBR.matrix.rotate(g_pawBR, 0,0,1); //set up for joint
    pawBR.matrix.scale(0.8, .1, 0.9);
    pawBR.render();

    //L SIDE: =================================================

    // upper FRONT LEFT leg
    var upperFL = new Cube();
    upperFL.color = LGREY;  

    upperFL.matrix.set(bodyCoordinates); //connects to body
    upperFL.matrix.translate(0.75, -.3, .72);
    upperFL.matrix.rotate(g_upperFL, 0,0,1);
    upperFL.matrix.scale(0.15, 0.6, 0.25);
    upperFL.render(); 
    var upperFLCoordinates=new Matrix4(upperFL.matrix);

    // lower FRONT LEFT leg
    var lowerFL = new Cube();
    lowerFL.color = GREY; 

    lowerFL.matrix.set(upperFLCoordinates); //CONNECTS TO UPPER LEG
    lowerFL.matrix.translate(.8, 0.7, 0.5);
    lowerFL.matrix.translate(.2, -.7, 0.01);
    lowerFL.matrix.rotate(g_lowerFL, 0,0,1); //set up for joint
    lowerFL.matrix.scale(0.8, .7, 0.9);
    lowerFL.matrix.translate(-1.0, -1.0, -0.5);
    lowerFL.render();
    var lowerFLCoordinates=new Matrix4(lowerFL.matrix);

    // Front LEFT paw
    var pawFL = new Cube();
    pawFL.color = [1.0, 0.6, 0.7, 1.0];  

    pawFL.matrix.set(lowerFLCoordinates); //CONNECTS TO UPPER LEG
    pawFL.matrix.translate(.5, -.1, 0.1);
    pawFL.matrix.rotate(g_pawFL, 0,0,1); //set up for joint
    pawFL.matrix.scale(0.8, .1, 0.9);
    pawFL.render();


    // upper BACK LEFT leg
    var upperBL = new Cube();
    upperBL.color = DGREY; 

    upperBL.matrix.set(buttCoordinates); //connects to body
    upperBL.matrix.translate(0.5, -.1, .81);
    upperBL.matrix.rotate(g_upperBL, 0,0,1);
    upperBL.matrix.scale(0.4, 0.6, 0.2);
    upperBL.render(); 
    var upperBLCoordinates=new Matrix4(upperBL.matrix);

    // lower BACK LEFT leg
    var lowerBL = new Cube();
    lowerBL.color = GREY;  

    lowerBL.matrix.set(upperBLCoordinates); //CONNECTS TO UPPER LEG
    lowerBL.matrix.translate(.2, -.7, -.01);
    lowerBL.matrix.translate(1.0, 0.05, 0.5);
    lowerBL.matrix.rotate(g_lowerBL, 0,0,1); //set up for joint
    lowerBL.matrix.translate(-1.0, 0.0, -0.5);
    lowerBL.matrix.scale(0.6, .7, 0.9);
    lowerBR.matrix.translate(-0.4, 0, 0.0);
    lowerBL.render();
    var lowerBLCoordinates=new Matrix4(lowerBL.matrix);


    // BACK LEFT paw
    var pawBL = new Cube();
    pawBL.color = [1.0, 0.6, 0.7, 1.0]; // [0.6, 0.6, 0.6, 1.0];

    pawBL.matrix.set(lowerBLCoordinates); //CONNECTS TO UPPER LEG
    pawBL.matrix.translate(.5, -.1, 0.1);
    pawBL.matrix.rotate(g_pawBL, 0,0,1); //set up for joint
    pawBL.matrix.scale(0.8, .1, 0.9);
    pawBL.render();
  }
}