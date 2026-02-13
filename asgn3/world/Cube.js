class Cube{
    constructor(){
        this.type='cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        //Pass tge natrix to u_ModelMatrix attibute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        //front of the cube
        drawTriangle3DUV( [0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0] ); //new addition
        drawTriangle3DUV( [0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1] ); //new addition

        //pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        //other sides of cube top, bot, left, right, back
        //fill in yourself:
    
        //top
        // drawTriangle3D([0,1,0,  0,1,1,  1,1,1]);
        // drawTriangle3D([0,1,0,  1,1,1,  1,1,0]);
        
        drawTriangle3DUV( [0,1,0,  0,1,1,  1,1,1], [0,0, 0,1, 1,1] ); //new addition
        drawTriangle3DUV( [0,1,0,  1,1,1,  1,1,0], [0,0, 1,1, 1,0] ); //new addition

        //pass the color of a poiunt to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

        //bot
        // drawTriangle3D([0,0,0,  1,0,0,  1,0,1]);
        // drawTriangle3D([0,0,0,  1,0,1,  0,0,1]);

        drawTriangle3DUV( [0,0,0,  1,0,1,  1,0,0], [0,0, 1,0, 1,1] ); //new addition
        drawTriangle3DUV( [0,0,0,  0,0,1,  1,0,1], [0,0, 0,1, 1,0] ); //new addition

        //pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);

        //left
        // drawTriangle3D([0,0,0,  0,1,1,  0,1,0]);
        // drawTriangle3D([0,0,0,  0,0,1,  0,1,1]);

        drawTriangle3DUV( [0,0,0,  0,1,0,  0,1,1], [0,0, 1,0, 1,1] ); //new addition
        drawTriangle3DUV( [0,0,0,  0,1,1,  0,0,1], [0,0, 1,1, 0,1] ); //new addition
        
        //pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);

        //right
        // drawTriangle3D([1,0,0,  1,1,0,  1,1,1]);
        // drawTriangle3D([1,0,0,  1,1,1,  1,0,1]);

        drawTriangle3DUV( [1,0,0,  1,1,1,  1,1,0], [0,0, 1,0, 1,1] ); //new addition
        drawTriangle3DUV( [1,0,0,  1,0,1,  1,1,1], [0,0, 0,1, 1,0] ); //new addition

        //pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);
        //back
        // drawTriangle3D([0,0,1,  1,0,1,  1,1,1]);
        // drawTriangle3D([0,0,1,  1,1,1,  0,1,1]);
        drawTriangle3DUV( [0,0,1,  1,1,1,  1,0,1], [0,0, 1,0, 1,1] ); //new addition
        drawTriangle3DUV( [0,0,1,  0,1,1,  1,1,1], [0,0, 0,1, 1,0] ); //new addition


    }
}