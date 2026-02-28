class Cube{
    constructor(){
        this.type='cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum=-2; 
    }

    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;

        //pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);  

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        //Pass tge natrix to u_ModelMatrix attibute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        const faceNormal = (v0, v1, v2, v3, n) => {
            //triangle 1
            drawTriangle3DUVNormal(
                [...v0, ...v1, ...v2],
                [0,0, 1,0, 1,1],
                [...n, ...n, ...n]
            );
            //triangl 2
            drawTriangle3DUVNormal(
                [...v0, ...v2, ...v3],
                [0,0, 1,1, 0,1],
                [...n, ...n, ...n]
            );
        };

        //front of the cube =====
 
        faceNormal([0,0,0], [1,0,0], [1,1,0], [0,1,0], [0,0,-1]);

        //pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        //other sides of cube top, bot, left, right, back
 
        faceNormal([0,1,0], [1,1,0], [1,1,1], [0,1,1], [0,1,0]);

        //pass the color of a poiunt to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

        //bot ===============
 
        faceNormal([0,0,1], [1,0,1], [1,0,0], [0,0,0], [0,-1,0]);


        //pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);

        //left =================
 
        faceNormal([0,0,1], [0,0,0], [0,1,0], [0,1,1], [-1,0,0]);
        
        //pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);

        //right =================
 
        faceNormal([1,0,0], [1,0,1], [1,1,1], [1,1,0], [1,0,0]);

        //pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);

        //back =================
 
        faceNormal([1,0,1], [0,0,1], [0,1,1], [1,1,1], [0,0,1]);
    }

    renderfast() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum); 

        // Pass the color of a point to u_FragColor variable
        // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        //Pass tge natrix to u_ModelMatrix attibute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var alluvs=[];
        var allverts=[];


        function tri(v, uv){
            allverts=allverts.concat(v);
            alluvs=alluvs.concat(uv);
        };

        const faceFast = (v0, v1, v2, v3) => {
        tri([...v0, ...v1, ...v2], [0, 0,  1, 0,  1, 1]);
        tri([...v0, ...v2, ...v3], [0, 0,  1, 1,  0, 1]);
        };


        // //front
  
        faceFast([0,0,0], [1,0,0], [1,1,0], [0,1,0]); 

        // //top
 
        faceFast([0,1,0], [1,1,0], [1,1,1], [0,1,1]);

        // //bot
 
        faceFast([0,0,1], [1,0,1], [1,0,0], [0,0,0]);

        // //left
 
        faceFast([0,0,1], [0,0,0], [0,1,0], [0,1,1]); 


        // //right
 
        faceFast([1,0,0], [1,0,1], [1,1,1], [1,1,0]);

        // //back
 
        faceFast([1,0,1], [0,0,1], [0,1,1], [1,1,1]);

        drawTriangle3DUVFast(allverts, alluvs);
    }
}