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

        // Draw the point
        // var d = this.size/200.0; //delta

        // let angleStep=360/this.segments;
        // for(var angle=0; angle < 360; angle=angle+angleStep) {
        //     let centerPt = [ xy[0], xy[1]];
        //     let angle1=angle;
        //     let angle2=angle+angleStep;
        //     let vec1=[Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
        //     let vec2=[Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];
        //     let pt1= [centerPt[0]+vec1[0], centerPt[1]+vec1[1]];
        //     let pt2= [centerPt[0]+vec2[0], centerPt[1]+vec2[1]];

        //     drawTriangle( [xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]] );

        // }

        //front of the cube
        drawTriangle3D( [0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0]);
        drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0]);

        //other sides of cube top, bot, left, right, back
        //fill in yourself:
        //top
        drawTriangle3D([0.0,1.0,0.0,  1.0,1.0,1.0,  1.0,1.0,0.0]);
        drawTriangle3D([0.0,1.0,0.0,  0.0,1.0,1.0,  1.0,1.0,1.0]);

        //bot
        drawTriangle3D([0.0,0.0,0.0,  1.0,0.0,0.0,  1.0,0.0,1.0]);
        drawTriangle3D([0.0,0.0,0.0,  1.0,0.0,1.0,  0.0,0.0,1.0]);

        //left
        drawTriangle3D([0.0,0.0,0.0,  0.0,1.0,1.0,  0.0,1.0,0.0]);
        drawTriangle3D([0.0,0.0,0.0,  0.0,0.0,1.0,  0.0,1.0,1.0]);

        //right
        drawTriangle3D([1.0,0.0,0.0,  1.0,1.0,0.0,  1.0,1.0,1.0]);
        drawTriangle3D([1.0,0.0,0.0,  1.0,1.0,1.0,  1.0,0.0,1.0]);

        //back
        drawTriangle3D([0.0,0.0,1.0,  1.0,0.0,1.0,  1.0,1.0,1.0]);
        drawTriangle3D([0.0,0.0,1.0,  1.0,1.0,1.0,  0.0,1.0,1.0]);
    }
}