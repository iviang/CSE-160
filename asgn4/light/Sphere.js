
function sin(x) {
    return Math.sin(x);
}


function cos(x) {
    return Math.cos(x);
}


class Sphere{
    constructor(){
        this.type='sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();

        this.textureNum=-2;

        this.verts32=new Float32Array([]);
    }

    render() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        //Pass the matrix to u_ModelMatrix attibute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        this.normalMatrix = new Matrix4();
        this.normalMatrix.setInverseOf(this.matrix).transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);
        var d=Math.PI/25;
        var dd=Math.PI/25;


        for (var t=0; t<Math.PI; t+=d) {
            for (var r=0; r< (2*Math.PI); r +=d) {
                var p1 = [sin(t)*cos(r), sin(t)*sin(r), cos(t)];

                var p2 = [sin(t+dd)*cos(r), sin(t+dd)*sin(r), cos(t+dd)];
                var p3 = [sin(t)*cos(r+dd), sin(t)*sin(r+dd), cos(t)];
                var p4 = [sin(t+dd)*cos(r+dd), sin(t+dd)*sin(r+dd), cos(t+dd)];

                var uv1 = [t/Math.PI, r/(2*Math.PI)];
                var uv2 = [(t+dd)/Math.PI, r/(2*Math.PI)];
                var uv3 = [t/Math.PI, (r+dd)/(2*Math.PI)];
                var uv4 = [(t+dd)/Math.PI, (r+dd)/(2*Math.PI)];

                var v = [];
                var uv = [];
                v=v.concat(p1); uv=uv.concat(uv1);
                v=v.concat(p2); uv=uv.concat(uv2);
                v=v.concat(p4); uv=uv.concat(uv4);

                // gl.uniform4f(u_FragColor, 1,1,1,1);
                drawTriangle3DUVNormal(v,uv,v);

                v=[]; uv=[];
                v=v.concat(p1); uv=uv.concat(uv1);
                v=v.concat(p4); uv=uv.concat(uv4);
                v=v.concat(p3); uv=uv.concat(uv3);
                // gl.uniform4f(u_FragColor, 1,0,0,1);
                drawTriangle3DUVNormal(v,uv,v);
            }
        }

        //draw sphere with triangles (uv sphere method) - old implementation from asgn2
        // for (let lat = 0; lat < this.latitude; lat++) {
        //     const theta1 = (lat / this.latitude) * Math.PI;
        //     const theta2 = ((lat + 1) / this.latitude) * Math.PI;

        //     for (let lon = 0; lon < this.longitude; lon++) {
        //         const phi1 = (lon / this.longitude) * 2 * Math.PI;
        //         const phi2 = ((lon + 1) / this.longitude) * 2 * Math.PI;

        //         const a = [ Math.sin(theta1) * Math.cos(phi1), Math.cos(theta1),Math.sin(theta1) * Math.sin(phi1), ];
        //         const b = [ Math.sin(theta2) * Math.cos(phi1), Math.cos(theta2), Math.sin(theta2) * Math.sin(phi1), ];
        //         const c = [ Math.sin(theta2) * Math.cos(phi2), Math.cos(theta2), Math.sin(theta2) * Math.sin(phi2), ];
        //         const d = [ Math.sin(theta1) * Math.cos(phi2), Math.cos(theta1), Math.sin(theta1) * Math.sin(phi2), ];

        //         const A = [(a[0]+1)/2, (a[1]+1)/2, (a[2]+1)/2];
        //         const B = [(b[0]+1)/2, (b[1]+1)/2, (b[2]+1)/2];
        //         const C = [(c[0]+1)/2, (c[1]+1)/2, (c[2]+1)/2];
        //         const D = [(d[0]+1)/2, (d[1]+1)/2, (d[2]+1)/2];

        //         drawTriangle3D([A[0],A[1],A[2],  B[0],B[1],B[2],  C[0],C[1],C[2]]);
        //         drawTriangle3D([A[0],A[1],A[2],  C[0],C[1],C[2],  D[0],D[1],D[2]]);
        //     }
        // }


    }
}