class Camera{
    constructor(){
        this.eye=new Vector3([0,0,3]);
        this.at=new Vector3([0,0,-100]);
        this.up=new Vector3([0,1,0]);

        this.speed=0.2;
        // this.rot = 5; //rotation degrees placeholder
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
    
    forward() {
        let eye = this.eye.elements;
        let at = this.at.elements;

        let dir = this.sub(at, eye); // d= at - eye
        dir = this.normalize(dir); //normalize d
        dir = this.mul(dir, this.speed); //scale by speed

        this.eye = new Vector3(this.add(eye, dir)); //eye = eye + d
        this.at = new Vector3(this.add(at, dir)); //at = at + d

    }


    back()  {
        let eye = this.eye.elements;
        let at = this.at.elements;

        let dir = this.sub(eye, at); // d = eye - at
        dir = this.normalize(dir); //normalize d
        dir = this.mul(dir, this.speed); //scale by speed

        this.eye = new Vector3(this.add(eye, dir)); //eye = eye + d
        this.at = new Vector3(this.add(at, dir)); //at = at + d could also do at = at - d  if d = at - eye first

    }



    left() {
        let eye = this.eye.elements;
        let at = this.at.elements;
        let up = this.up.elements;

        let dir = this.sub(at, eye); // d = at - eye
        dir = this.normalize(dir);

        let left = this.cross(dir, up); // left = d x up
        left = this.normalize(left);
        left = this.mul(left, this.speed); // scale by speed

        this.eye = new Vector3(this.add(eye, left)); //eye = eye + left
        this.at = new Vector3(this.add(at, left)); //at = at + left

    }

    right() {
        let eye = this.eye.elements;
        let at = this.at.elements;
        let up = this.up.elements;

        let dir = this.sub(at, eye); // d = at - eye
        dir = this.normalize(dir);

        let right = this.cross(dir, up); // right = d x up
        right = this.normalize(right);
        right = this.mul(right, -this.speed); // scale by speed

        this.eye = new Vector3(this.add(eye, right)); //eye = eye + right
        this.at = new Vector3(this.add(at, right)); //at = at + right
    }
}