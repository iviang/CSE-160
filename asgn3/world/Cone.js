class Cone{
    constructor(){
        this.type='cone';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();

        this.segments = 16;


    }

    render() {
        var rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        //Pass the matrix to u_ModelMatrix attibute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        const apex = [0.5, 1.0, 0.5];
        const center = [0.5, 0.0, 0.5];
        const r = 0.5;

        //draw cone shape
        for (let i = 0; i < this.segments; i++) {
            const a1 = (i / this.segments) * 2 * Math.PI;
            const a2 = ((i + 1) / this.segments) * 2 * Math.PI;

            const p1 = [center[0] + r * Math.cos(a1), 0.0, center[2] + r * Math.sin(a1)];
            const p2 = [center[0] + r * Math.cos(a2), 0.0, center[2] + r * Math.sin(a2)];

            drawTriangle3D([p1[0], p1[1], p1[2], p2[0], p2[1], p2[2], apex[0], apex[1], apex[2]]);
        }

    }
}