class Camera{
    constructor(){
        this.fov=60; //fov       
        this.eye=new Vector3([0,0,0]); //eye
        this.at=new Vector3([0,0,-1]); //at
        this.up=new Vector3([0,1,0]); //up

        this.viewMatrix = new Matrix4();
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );

        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 1000);
    }

    sub(a, b){
        return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
    }

    add(a, b){
        return [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
    }

    mul(vector, scalar){
        return [vector[0]*scalar, vector[1]*scalar, vector[2]*scalar];
    }

    length(vector){
        return Math.sqrt(vector[0]**2 + vector[1]**2 + vector[2]**2);
    }

    normalize(vector){
        let len = this.length(vector);
        if(len === 0) return [0,0,0];
        return [vector[0]/len, vector[1]/len, vector[2]/len];
    }

    cross(a, b){
        return [
            a[1]*b[2] - a[2]*b[1],
            a[2]*b[0] - a[0]*b[2],
            a[0]*b[1] - a[1]*b[0]
        ];
    }
    
    moveForward(){
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(speed);

        this.eye.add(f);
        this.at.add(f);
    }

    moveBackwards()  {
        let b = new Vector3();
        b.set(this.eye);
        b.sub(this.at);
        b.normalize();
        b.mul(speed);

        this.eye.sub(b);
        this.at.sub(b);

    }

    moveLeft() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();

        let s = Vector3.cross(this.up, f); // s = up x f
        s.normalize();
        s.mul(speed);
        this.eye.add(s);
        this.at.add(s);
    }

    moveRight() {
        let f = new Vector3();
        f.set(this.eye);
        f.sub(this.at);
        f.normalize();

        let s = Vector3.cross(f, this.up); // s = f x up
        s.normalize();
        s.mul(speed);
        this.eye.add(s);
        this.at.add(s);
    }

    panLeft() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, this.up.x, this.up.y, this.up.z);

        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at.set(this.eye);
        this.at.add(f_prime);
    }

    panRight() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-alpha, this.up.x, this.up.y, this.up.z);

        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at.set(this.eye);
        this.at.add(f_prime);
    }

}