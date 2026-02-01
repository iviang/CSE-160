class Sphere{
    constructor(){
        this.type='sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();


        this.latitude = 12;
        this.longitude = 12;
    }

    render() {
        var rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        //Pass the matrix to u_ModelMatrix attibute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        //draw sphere with triangles (uv sphere method)
        for (let lat = 0; lat < this.latitude; lat++) {
            const theta1 = (lat / this.latitude) * Math.PI;
            const theta2 = ((lat + 1) / this.latitude) * Math.PI;

            for (let lon = 0; lon < this.longitude; lon++) {
                const phi1 = (lon / this.longitude) * 2 * Math.PI;
                const phi2 = ((lon + 1) / this.longitude) * 2 * Math.PI;

                const a = [ Math.sin(theta1) * Math.cos(phi1), Math.cos(theta1),Math.sin(theta1) * Math.sin(phi1), ];
                const b = [ Math.sin(theta2) * Math.cos(phi1), Math.cos(theta2), Math.sin(theta2) * Math.sin(phi1), ];
                const c = [ Math.sin(theta2) * Math.cos(phi2), Math.cos(theta2), Math.sin(theta2) * Math.sin(phi2), ];
                const d = [ Math.sin(theta1) * Math.cos(phi2), Math.cos(theta1), Math.sin(theta1) * Math.sin(phi2), ];

                const A = [(a[0]+1)/2, (a[1]+1)/2, (a[2]+1)/2];
                const B = [(b[0]+1)/2, (b[1]+1)/2, (b[2]+1)/2];
                const C = [(c[0]+1)/2, (c[1]+1)/2, (c[2]+1)/2];
                const D = [(d[0]+1)/2, (d[1]+1)/2, (d[2]+1)/2];

                drawTriangle3D([A[0],A[1],A[2],  B[0],B[1],B[2],  C[0],C[1],C[2]]);
                drawTriangle3D([A[0],A[1],A[2],  C[0],C[1],C[2],  D[0],D[1],D[2]]);
            }
        }


    }
}